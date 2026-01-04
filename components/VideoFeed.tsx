import React, { useEffect, useRef } from 'react';
import { HandTrackingState } from '../types';
import GestureWorker from '../services/gesture.worker.ts?worker'; // Vite worker import

interface VideoFeedProps {
  onTrackingUpdate: (state: HandTrackingState) => void;
}

const VideoFeed: React.FC<VideoFeedProps> = ({ onTrackingUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const lastDetectionTimeRef = useRef<number>(0);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Initialize Worker
    workerRef.current = new GestureWorker();
    workerRef.current.onmessage = (e) => {
        const { type, state, error } = e.data;
        if (type === 'result') {
            onTrackingUpdate(state);
        } else if (type === 'init-done') {
            console.log("[VideoFeed] Gesture Worker Ready");
        } else if (type === 'init-error') {
            console.error("[VideoFeed] Gesture Worker Init Error", error);
        }
    };

    // Initialize offscreen canvas for downscaling
    if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
        canvasRef.current.width = 480; // Downscale to 480p for processing
        canvasRef.current.height = 270;
    }

    const startCamera = async () => {
      try {

        if (videoRef.current && isMounted) {

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          }
        });
          videoRef.current.srcObject = stream;
          
          // Robust video play handling
          try {
             await videoRef.current.play();
          } catch (e) {
             console.warn("Auto-play prevented, waiting for user interaction or metadata", e);
             await new Promise<void>((resolve) => {
                 if (!videoRef.current) return resolve();
                 videoRef.current.onloadeddata = () => {
                     videoRef.current?.play().then(() => resolve()).catch(() => resolve());
                 };
                 if (videoRef.current.readyState >= 2) resolve();
             });
          }
          
          console.log("Camera started, initializing tracking...");
          
          const renderLoop = async () => {
            if (!isMounted) return;
            
            requestRef.current = requestAnimationFrame(renderLoop);

            if (videoRef.current && 
                videoRef.current.readyState >= 2 && 
                !videoRef.current.paused) {
              
              const now = Date.now();
              
              // Dynamic interval based on performance? 
              // Hardcode a safer default for now: 60ms (~15 FPS) to let 3D render breathe
              const DETECTION_INTERVAL = 60; 
              
              if (now - lastDetectionTimeRef.current >= DETECTION_INTERVAL) { 
                  lastDetectionTimeRef.current = now;

                  if (videoRef.current.currentTime !== lastVideoTimeRef.current) {
                      lastVideoTimeRef.current = videoRef.current.currentTime;
                      
                      try {
                        let processingSource: ImageBitmap | null = null;
                        
                        // Create ImageBitmap for Transferable efficiency
                        // Note: video -> ImageBitmap is fast and transferable
                        processingSource = await createImageBitmap(videoRef.current, {
                            resizeWidth: 480, 
                            resizeHeight: 270
                        });

                        if (workerRef.current && processingSource) {
                            workerRef.current.postMessage(
                                { type: 'detect', image: processingSource, timestamp: now }, 
                                [processingSource] // Transfer ownership
                            );
                        } else {
                            // If worker not ready or something failed, close bitmap
                            processingSource?.close();
                        }

                      } catch (error) {
                        console.error("Tracking error:", error);
                      }
                  }
              }
            }
          };

          requestRef.current = requestAnimationFrame(renderLoop);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      if (workerRef.current) {
          workerRef.current.terminate();
      }
    };
  }, [onTrackingUpdate]);

  return (
    <video
      ref={videoRef}
      // Optimize: Removed heavy CSS filters (contrast, brightness, grayscale) for performance
      // Kept only opacity and flip
      className="absolute top-0 left-0 w-full h-full object-cover opacity-30 pointer-events-none transform -scale-x-100"
      playsInline
      muted
      autoPlay
    />
  );
};

export default VideoFeed;