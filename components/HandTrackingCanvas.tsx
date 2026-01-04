import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HandTrackingState, RegionName } from '../types';
import { SoundService } from '../services/soundService';
import CanvasWorker from '../services/canvas.worker.ts?worker'; // Vite worker import

interface HandTrackingCanvasProps {
  handTrackingRef: React.MutableRefObject<HandTrackingState>;
  isModalOpen?: boolean;
  onCloseModal?: () => void;
}

const HandTrackingCanvas: React.FC<HandTrackingCanvasProps> = ({ handTrackingRef, isModalOpen, onCloseModal }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const [canvasKey, setCanvasKey] = React.useState(0);
  
  // UI State for Floating Panel - using Ref for performance
  const panelRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null); // Virtual Cursor
  
  const wasPinchingRef = useRef(false);
  const isClosingRef = useRef(false);

  // Placeholder for currentRegion which was missing in original context
  const currentRegion = "区域扫描中...";

  // Reset closing lock when modal opens
  useEffect(() => {
      if (isModalOpen) {
          isClosingRef.current = false;
      }
  }, [isModalOpen]);

  // Canvas Drawing Loop (Offscreen via Worker)
  useEffect(() => {
    if (!canvasRef.current) return;

    // Transfer control to OffscreenCanvas
    const canvas = canvasRef.current;
    
    try {
        // Initialize Worker
        workerRef.current = new CanvasWorker();
        
        const offscreen = canvas.transferControlToOffscreen();
        workerRef.current.postMessage({ type: 'init', payload: { canvas: offscreen } }, [offscreen]);
        
        const updateLoop = () => {
             if (workerRef.current) {
                 // console.log("[HandTrackingCanvas] Sending update to worker:", handTrackingRef.current);
                 workerRef.current.postMessage({ 
                     type: 'update', 
                     payload: { 
                         hands: handTrackingRef.current,
                         isModalOpen
                     } 
                 });
             }
             requestAnimationFrame(updateLoop);
        };
        const frameId = requestAnimationFrame(updateLoop);
        
        // Handle resize
        const handleResize = () => {
             if (workerRef.current) {
                 workerRef.current.postMessage({
                     type: 'resize',
                     payload: {
                         width: window.innerWidth,
                         height: window.innerHeight
                     }
                 });
             }
        };
        window.addEventListener('resize', handleResize);
        // Initial resize
        handleResize();

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', handleResize);
            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
            }
        };

    } catch (e: any) {
        console.error("Failed to transfer control to offscreen canvas or init worker", e);
        // Handle React Strict Mode double-invoke issue where canvas is already transferred
        if (e.message && (e.message.includes("transfer") || e.message.includes("detach"))) {
            console.log("Retrying with fresh canvas...");
            setCanvasKey(prev => prev + 1);
        }
    }
  }, [canvasKey]);

  // --- INTERACTION LOGIC (Main Thread) ---
  useEffect(() => {
      const interactionLoop = () => {
          const hands = handTrackingRef.current;
          
          // --- VIRTUAL MOUSE CURSOR (RIGHT HAND INDEX) ---
          if (hands.rightHand) {
              const indexTip = hands.rightHand.landmarks[8];
              // Map 0-1 to window size
              const cursorX = (1 - indexTip.x) * window.innerWidth;
              const cursorY = indexTip.y * window.innerHeight;
    
              // Update Virtual Cursor DOM Position
              if (cursorRef.current) {
                  cursorRef.current.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
                  // Only show cursor when modal is open (Mode Switch)
                  cursorRef.current.style.opacity = isModalOpen ? '1' : '0';
              }
    
              // Handle Clicks on Modal Elements
              const isPinching = hands.rightHand.isPinching;
              
              if (isModalOpen && isPinching && !wasPinchingRef.current) {
                  SoundService.playLock();
                  // Perform hit test logic here if needed
              }
          } else {
              if (cursorRef.current) cursorRef.current.style.opacity = '0';
          }
    
          // --- LEFT HAND: FIST TO CLOSE MODAL ---
          if (hands.leftHand && isModalOpen && !isClosingRef.current) {
              const isFist = hands.leftHand.expansionFactor < 0.4;
              
              if (isFist) {
                  isClosingRef.current = true;
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
                const cursorX = (1 - indexTip.x) * window.innerWidth;
                const cursorY = indexTip.y * window.innerHeight;
                
                // Direct DOM manipulation for high performance
                if (panelRef.current) {
                    panelRef.current.style.left = `${cursorX + 50}px`;
                    panelRef.current.style.top = `${cursorY - 100}px`;
                }
            }
          } else {
              // If hand lost or modal open, hide panel and reset pinch state tracking
              if (wasPinchingRef.current || isModalOpen) {
                  if (panelRef.current) {
                      panelRef.current.style.opacity = '0';
                      panelRef.current.style.pointerEvents = 'none';
                  }
                  if (!hands.rightHand) wasPinchingRef.current = false;
              }
              if (hands.rightHand && isModalOpen) {
                  wasPinchingRef.current = hands.rightHand.isPinching;
              }
          }

          requestAnimationFrame(interactionLoop);
      };
      
      const frameId = requestAnimationFrame(interactionLoop);
      return () => cancelAnimationFrame(frameId);
  }, [handTrackingRef, isModalOpen, onCloseModal]);

  return createPortal(
    <>
      <canvas 
          key={canvasKey}
          ref={canvasRef} 
          className="fixed top-0 left-0 w-full h-full z-[9999] pointer-events-none" 
      />
      
      {/* --- INTERACTIVE FLOATING PANEL (PINCH) --- */}
      <div 
        ref={panelRef}
        className="fixed z-[10001] transition-all duration-200 ease-out origin-top-left"
        style={{ 
            width: '300px',
            opacity: 0,
            pointerEvents: 'none',
            transform: 'scale(0.9)',
            // Initial position off-screen, updated by JS
            left: 0,
            top: 0
        }}
      >
        <div className="bg-black/80 border-l-2 border-alert-red shadow-[0_0_40px_rgba(255,42,42,0.3)] backdrop-blur-xl p-1 rounded-r-lg">
            <div className="flex justify-between items-center bg-gradient-to-r from-alert-red/50 to-transparent p-2 mb-2 border-b border-white/10">
                <span className="font-display font-bold text-sm tracking-widest text-white">GEO_INTEL_LIVE</span>
                <div className="w-2 h-2 bg-alert-red rounded-full animate-ping"></div>
            </div>

            <div className="p-4 space-y-4">
                <div className="flex justify-between items-end">
                    <div className="text-xs text-holo-blue uppercase">目标区域</div>
                    <div className="text-2xl font-display text-white font-bold drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                        {currentRegion}
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] uppercase text-gray-400">
                            <span>信号强度</span>
                            <span>98%</span>
                        </div>
                        <div className="w-full bg-gray-900 h-1.5 overflow-hidden rounded-sm">
                            <div className="bg-holo-cyan h-full w-[98%] shadow-[0_0_10px_#00F0FF] relative">
                                <div className="absolute top-0 left-0 h-full w-full bg-white/30 animate-[scanline_1s_linear_infinite]"></div>
                            </div>
                        </div>
                    </div>
                    
                     <div className="grid grid-cols-2 gap-2 mt-2">
                         <div className="bg-white/5 p-1 text-center border border-white/10">
                             <div className="text-[8px] text-gray-400">经度</div>
                             <div className="font-mono text-xs text-holo-cyan">116.4074</div>
                         </div>
                         <div className="bg-white/5 p-1 text-center border border-white/10">
                             <div className="text-[8px] text-gray-400">纬度</div>
                             <div className="font-mono text-xs text-holo-cyan">39.9042</div>
                         </div>
                     </div>
                </div>
            </div>
        </div>
        {/* Decorator Lines */}
        <svg className="absolute -left-4 top-0 w-4 h-full overflow-visible">
             <path d="M 4,0 L 0,10 L 0,150" fill="none" stroke="#FF2A2A" strokeWidth="1" />
        </svg>
      </div>

      {/* --- VIRTUAL CURSOR (Visible only when Modal is Open) --- */}
      <div 
        ref={cursorRef}
        className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[10000] transition-opacity duration-200 opacity-0"
        style={{
            marginTop: '-16px',
            marginLeft: '-16px',
        }}
      >
         {/* Cursor Ring */}
         <div className="absolute inset-0 border-2 border-red-500 rounded-full animate-pulse shadow-[0_0_15px_#FF2A2A]"></div>
         {/* Center Dot */}
         <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
         {/* Crosshairs */}
         <div className="absolute top-0 left-1/2 h-2 w-0.5 bg-red-500 transform -translate-x-1/2"></div>
         <div className="absolute bottom-0 left-1/2 h-2 w-0.5 bg-red-500 transform -translate-x-1/2"></div>
         <div className="absolute top-1/2 left-0 w-2 h-0.5 bg-red-500 transform -translate-y-1/2"></div>
         <div className="absolute top-1/2 right-0 w-2 h-0.5 bg-red-500 transform -translate-y-1/2"></div>
      </div>
    </>,
    document.body
  );
};

export default HandTrackingCanvas;