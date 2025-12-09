import { FilesetResolver, ObjectDetector } from "@mediapipe/tasks-vision";

export interface DetectionResult {
  categories: { categoryName: string; score: number }[];
  boundingBox: { originX: number; originY: number; width: number; height: number };
}

export class ObjectDetectionService {
  private static detector: ObjectDetector | null = null;
  private static initPromise: Promise<ObjectDetector> | null = null;

  static async initialize(): Promise<ObjectDetector> {
    if (this.detector) return this.detector;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      let vision;
      try {
        vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm"
        );
      } catch (e) {
        vision = await FilesetResolver.forVisionTasks(
          "https://unpkg.com/@mediapipe/tasks-vision@0.10.9/wasm"
        );
      }

      const modelUrl =
        "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite";

      const detector = await ObjectDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: modelUrl,
          delegate: "GPU",
        },
        scoreThreshold: 0.3,
        runningMode: "VIDEO",
        maxResults: 8,
      });

      this.detector = detector;
      return detector;
    })();

    return this.initPromise;
  }

  static detectForVideo(video: HTMLVideoElement): DetectionResult[] {
    if (!this.detector) return [];
    const results = this.detector.detectForVideo(video, Date.now());
    const detections = results.detections || [];
    return detections.map((d: any) => ({
      categories: (d.categories || []).map((c: any) => ({ categoryName: c.categoryName, score: c.score })),
      boundingBox: {
        originX: d.boundingBox?.originX ?? 0,
        originY: d.boundingBox?.originY ?? 0,
        width: d.boundingBox?.width ?? 0,
        height: d.boundingBox?.height ?? 0,
      },
    }));
  }
}

