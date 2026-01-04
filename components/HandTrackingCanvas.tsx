import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HandTrackingState, RegionName } from '../types';
import { SoundService } from '../services/soundService';

interface HandTrackingCanvasProps {
  handTrackingRef: React.MutableRefObject<HandTrackingState>;
  isModalOpen?: boolean;
  onCloseModal?: () => void;
}

const HandTrackingCanvas: React.FC<HandTrackingCanvasProps> = ({ handTrackingRef, isModalOpen, onCloseModal }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const lastDrawTimeRef = useRef<number>(0);
  const FPS_LIMIT = 30;
  const FRAME_INTERVAL = 1000 / FPS_LIMIT;
  
  // UI State for Floating Panel - using Ref for performance
  const panelRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null); // Virtual Cursor
  
  const reticleRotationRef = useRef(0);
  const wasPinchingRef = useRef(false);
  const isClosingRef = useRef(false);

  // Reset closing lock when modal opens
  useEffect(() => {
      if (isModalOpen) {
          isClosingRef.current = false;
      }
  }, [isModalOpen]);

  // Canvas Drawing Loop (Hand Skeletal & Effects)
  useEffect(() => {
    const connections = [[0,1],[1,2],[2,3],[3,4], [0,5],[5,6],[6,7],[7,8], [5,9],[9,10],[10,11],[11,12], [9,13],[13,14],[14,15],[15,16], [13,17],[17,18],[18,19],[19,20], [0,17]];

    const renderFrame = (timestamp: number) => {
      requestRef.current = requestAnimationFrame(renderFrame);

      const elapsed = timestamp - lastDrawTimeRef.current;
      if (elapsed < FRAME_INTERVAL) return;

      // Adjust for next frame
      lastDrawTimeRef.current = timestamp - (elapsed % FRAME_INTERVAL);

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const hands = handTrackingRef.current;
    //   console.log("Hands:", hands);
      
      reticleRotationRef.current += 0.05;

      // --- HAND RENDERING ---
      if (hands.leftHand || hands.rightHand) {
        // console.log("Rendering hands:", hands);
      }
      
      [hands.leftHand, hands.rightHand].forEach(hand => {
        if (hand) {
          const isRight = hand.handedness === 'Right';
          const mainColor = isRight ? '#00F0FF' : '#00A3FF';
          
          // Skeleton
          ctx.strokeStyle = mainColor;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          
          connections.forEach(([start, end]) => {
            const p1 = hand.landmarks[start];
            const p2 = hand.landmarks[end];
            ctx.moveTo((1 - p1.x) * canvas.width, p1.y * canvas.height);
            ctx.lineTo((1 - p2.x) * canvas.width, p2.y * canvas.height);
          });
          ctx.stroke();
          ctx.setLineDash([]);

          // Joints
          hand.landmarks.forEach((lm, index) => {
            const x = (1 - lm.x) * canvas.width;
            const y = lm.y * canvas.height;
            
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.strokeStyle = mainColor;
            ctx.lineWidth = 1;
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            if ([4, 8, 12, 16, 20].includes(index)) {
                ctx.beginPath();
                ctx.arc(x, y, 8, reticleRotationRef.current, reticleRotationRef.current + Math.PI);
                ctx.strokeStyle = isRight ? '#FF2A2A' : '#00F0FF';
                ctx.stroke();
            }
          });
          
          // Palm Info
          const palmX = (1 - hand.landmarks[0].x) * canvas.width;
          const palmY = hand.landmarks[0].y * canvas.height;
          
          ctx.beginPath();
          ctx.arc(palmX, palmY, 20, -reticleRotationRef.current, -reticleRotationRef.current + Math.PI * 1.5);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.stroke();
          
          ctx.font = '10px Rajdhani';
          ctx.fillStyle = mainColor;
          const label = isRight ? 'ID: 右手-01' : 'ID: 左手-02';
          ctx.fillText(label, palmX + 25, palmY);
        }
      });

      // --- VIRTUAL MOUSE CURSOR (RIGHT HAND INDEX) ---
      if (hands.rightHand) {
          const indexTip = hands.rightHand.landmarks[8];
          const cursorX = (1 - indexTip.x) * canvas.width;
          const cursorY = indexTip.y * canvas.height;

          // Update Virtual Cursor DOM Position
          if (cursorRef.current) {
              cursorRef.current.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
              // Only show cursor when modal is open (Mode Switch)
              cursorRef.current.style.opacity = isModalOpen ? '1' : '0';
          }

          // Handle Clicks on Modal Elements
          const isPinching = hands.rightHand.isPinching;
          
          // If pinching started just now (Falling Edge of pinch state? No, Rising Edge: false -> true)
          // Usually a click is "Down" or "Up". Let's simulate click on "Pinch Start".
          if (isModalOpen && isPinching && !wasPinchingRef.current) {
              SoundService.playLock();
              
              // Perform hit test logic here if needed
          }
      } else {
          if (cursorRef.current) cursorRef.current.style.opacity = '0';
      }

      // --- LEFT HAND: FIST TO CLOSE MODAL ---
      if (hands.leftHand && isModalOpen && !isClosingRef.current) {
          // Check for Fist (Expansion Factor close to 0)
          // Increased threshold to 0.4 for better sensitivity (easier to trigger)
          const isFist = hands.leftHand.expansionFactor < 0.4;
          
          if (isFist) {
              isClosingRef.current = true; // Lock to prevent multiple triggers
              SoundService.playRelease();
              if (onCloseModal) onCloseModal();
          }
      }

      // --- RIGHT HAND: PINCH TO SHOW INTEL (Only if Modal NOT Open) ---
      if (hands.rightHand && !isModalOpen) {
        const isPinching = hands.rightHand.isPinching;
        
        // Handle State Transition for Sound & Visibility (Direct DOM)
        if (isPinching && !wasPinchingRef.current) {
            SoundService.playLock();
            if (panelRef.current) {
                panelRef.current.style.opacity = '1';
                panelRef.current.style.pointerEvents = 'auto';
                panelRef.current.style.transform = 'scale(1)';
            }
        } else if (!isPinching && wasPinchingRef.current) {
            SoundService.playRelease();
            if (panelRef.current) {
                panelRef.current.style.opacity = '0';
                panelRef.current.style.pointerEvents = 'none';
                panelRef.current.style.transform = 'scale(0.9)';
            }
        }
        wasPinchingRef.current = isPinching;

        // Update Panel Position logic
        if (isPinching) {
            const indexTip = hands.rightHand.landmarks[8];
            const cursorX = (1 - indexTip.x) * canvas.width;
            const cursorY = indexTip.y * canvas.height;
            
            // Direct DOM manipulation for high performance
            if (panelRef.current) {
                panelRef.current.style.left = `${cursorX + 50}px`;
                panelRef.current.style.top = `${cursorY - 100}px`;
            }
            
            // Connector Line from Hand to Panel
            ctx.beginPath();
            ctx.moveTo(cursorX, cursorY);
            ctx.lineTo(cursorX + 50, cursorY - 100); // Connects to top-left of where panel div renders
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Draw Pinch Reticle
            const thumbTip = hands.rightHand.landmarks[4];
            const midX = ((1 - indexTip.x) * canvas.width + (1 - thumbTip.x) * canvas.width) / 2;
            const midY = (indexTip.y * canvas.height + thumbTip.y * canvas.height) / 2;
             
            ctx.beginPath();
            ctx.arc(midX, midY, 15, 0, Math.PI * 2);
            ctx.strokeStyle = '#FF2A2A';
            ctx.lineWidth = 2;
            ctx.stroke();
             
            ctx.beginPath();
            ctx.arc(midX, midY, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#FF2A2A';
            ctx.fill();
        }
      } else {
          // If hand lost or modal open, hide panel and reset pinch state tracking
          if (wasPinchingRef.current || isModalOpen) {
              if (panelRef.current) {
                  panelRef.current.style.opacity = '0';
                  panelRef.current.style.pointerEvents = 'none';
              }
              // Only reset state if hand is lost, otherwise we might trigger "Release" sound when modal opens
              if (!hands.rightHand) wasPinchingRef.current = false;
          }
          
          // If modal is open, we still need to track pinch state for the virtual cursor click logic above
          // so we sync it here if we haven't already
          if (hands.rightHand && isModalOpen) {
              wasPinchingRef.current = hands.rightHand.isPinching;
          }
      }

      requestRef.current = requestAnimationFrame(renderFrame);
    };

    requestRef.current = requestAnimationFrame(renderFrame);
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
  }, [handTrackingRef, isModalOpen, onCloseModal]);

  // Use React Portal to render the canvas directly into the document.body or a specific root container
  // to ensures it stays on top of everything, including Modals that are also portals.
  return createPortal(
    <>
      <canvas 
          ref={canvasRef} 
          className="fixed top-0 left-0 w-full h-full z-[9999] pointer-events-none" 
      />
    </>,
    document.body
  );
};

export default HandTrackingCanvas;
