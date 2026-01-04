import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";
import localModelUrl from "@/modules/gesture_recognizer.task?url";

// Polyfill importScripts for MediaPipe which tries to use it for WASM loading
// even in Module Workers.
if (!('importScripts' in self)) {
    (self as any).importScripts = (...args: string[]) => {
        console.warn("Ignored importScripts call in Module Worker for:", args);
    };
}

let recognizer: GestureRecognizer | null = null;

// Initialize MediaPipe
const initialize = async () => {
    try {
        console.log("[Worker] Initializing MediaPipe...");
        let vision;
        try {
             vision = await FilesetResolver.forVisionTasks(
              "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
            );
        } catch (e) {
            console.warn("[Worker] jsDelivr load failed, fallback...", e);
            vision = await FilesetResolver.forVisionTasks(
                "https://unpkg.com/@mediapipe/tasks-vision@latest/wasm"
            );
        }

        try {
          recognizer = await GestureRecognizer.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: localModelUrl,
              delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 2,
          });
        } catch (e) {
          console.warn('[Worker] Local model load failed, fallback...', e);
          recognizer = await GestureRecognizer.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
              delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 2,
          });
        }

        console.log("[Worker] MediaPipe Initialized");
        self.postMessage({ type: 'init-done' });
    } catch (error) {
        console.error("[Worker] Init failed:", error);
        self.postMessage({ type: 'init-error', error });
    }
};

initialize();

self.onmessage = async (e) => {
    const { type, image, timestamp } = e.data;

    if (type === 'detect') {
        if (!recognizer) return;

        try {
            const results = recognizer.recognizeForVideo(image, timestamp);
            
            const processedState = {
                leftHand: null,
                rightHand: null
            };

            if (results.landmarks) {
                results.landmarks.forEach((landmarks, index) => {
                  const handednessCategory = results.handedness[index]?.[0];
                  const handedness = (handednessCategory?.categoryName || 'Right') as 'Left' | 'Right';
                  
                  const thumbTip = landmarks[4];
                  const indexTip = landmarks[8];
                  const pinchDist = Math.sqrt(
                    Math.pow(thumbTip.x - indexTip.x, 2) + 
                    Math.pow(thumbTip.y - indexTip.y, 2)
                  );
                  const isPinching = pinchDist < 0.05;

                  let expansionFactor = 0;
                  let rotationControl = { x: 0, y: 0 };

                  if (handedness === 'Left') {
                      const minPinch = 0.02;
                      const maxPinch = 0.18;
                      const normalized = (pinchDist - minPinch) / (maxPinch - minPinch);
                      expansionFactor = Math.max(0, Math.min(1, normalized));
                  } else {
                      const handX = landmarks[9].x; 
                      const handY = landmarks[9].y;
                      const rotX = (handX - 0.5) * 2; 
                      const rotY = (handY - 0.5) * 2;
                      rotationControl = { x: rotX, y: rotY };
                  }

                  const handData = {
                    landmarks,
                    handedness,
                    isPinching,
                    pinchDistance: pinchDist,
                    expansionFactor,
                    rotationControl
                  };

                  if (handedness === 'Right') {
                    processedState.rightHand = handData;
                  } else {
                    processedState.leftHand = handData;
                  }
                });
            }

            self.postMessage({ type: 'result', state: processedState }, { transfer: [] });
            
            // Cleanup ImageBitmap to prevent memory leaks
            if (image && image.close) {
                image.close();
            }

        } catch (err) {
            console.error("[Worker] Detection error:", err);
            if (image && image.close) image.close();
        }
    }
};
