import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { HandTrackingState } from '../../types';
import { FACTORY_LAYOUT, SCENE_SCALE } from './config';

// Gesture Controller Component
export const GestureController: React.FC<{ 
  handTrackingRef?: React.MutableRefObject<HandTrackingState>;
  controlsRef: React.MutableRefObject<any>;
  isModalOpen?: boolean;
  onWorkshopClick?: (name: string) => void;
  onHover?: (label: string | null, x: number, y: number) => void;
}> = ({ handTrackingRef, controlsRef, isModalOpen, onWorkshopClick, onHover }) => {
  const { camera } = useThree();
  const previousHandPos = useRef<{x: number, y: number} | null>(null);
  const previousPinchDist = useRef<number | null>(null); // For dual hand zoom
  const isPinchingRef = useRef(false);
  const isDualGestureRef = useRef(false);
  const lastRightPinchRef = useRef(false);
  
  // Use a ref to track modal state accessible within useFrame closure reliably
  const isModalOpenRef = useRef(isModalOpen);
  useEffect(() => {
    isModalOpenRef.current = isModalOpen;
  }, [isModalOpen]);

  // Reset states when modal opens/closes to prevent ghost interactions
  useEffect(() => {
    if (isModalOpen) {
      previousHandPos.current = null;
      previousPinchDist.current = null;
      isPinchingRef.current = false;
      isDualGestureRef.current = false;
      lastRightPinchRef.current = false;
      activeAxisRef.current = 'none';
    }
  }, [isModalOpen]);
  
  // Track which axis is currently "locked" for the active gesture
  // 'none' = analyzing intent
  // 'x' = horizontal rotation
  // 'y' = vertical rotation
  // 'zoom-dual' = dual hand zoom
  const activeAxisRef = useRef<'none' | 'x' | 'y' | 'zoom-dual'>('none');
  
  // Configuration
  const ROTATION_SENSITIVITY = 5;
  const ZOOM_SENSITIVITY = 5; 

  useFrame(() => {
    // console.log('isModalOpenRef: ', isModalOpenRef.current);
    // Strictly disable all 3D gestures when modal is open (check ref for latest state)
    if (isModalOpenRef.current) return;
    
    if (!handTrackingRef?.current || !controlsRef.current) return;
    
    const { leftHand, rightHand } = handTrackingRef.current;
    
    // --- RIGHT HAND CLICK INTERACTION ---
    if (rightHand) {
        // Detect Pinch Release (Falling Edge)
        // Check for dual gesture lock. 
        // Relaxation: If left hand is NOT pinching (or lost), ignore isDualGestureRef to allow quick switching
        const isRealDualGesture = isDualGestureRef.current && leftHand && leftHand.isPinching;

        // --- HOVER LOGIC (WHILE PINCHING) ---
        if (rightHand.isPinching && !isRealDualGesture && onHover) {
             const indexTip = rightHand.landmarks[8];
             const cursorNDC = {
                 x: (indexTip.x - 0.5) * 2,
                 y: -(indexTip.y - 0.5) * 2
             };

             let minDist = 0.3; 
             let closestLabel: string | null = null;

             FACTORY_LAYOUT.forEach(item => {
                 if (!item.label) return;
                 
                 const itemPos = new Vector3(...item.position);
                 itemPos.multiplyScalar(SCENE_SCALE);
                 itemPos.project(camera);
                 
                 const dx = itemPos.x - cursorNDC.x;
                 const dy = itemPos.y - cursorNDC.y;
                 const dist = Math.sqrt(dx*dx + dy*dy);
                 
                 if (dist < minDist) {
                     minDist = dist;
                     closestLabel = item.label;
                 }
             });

             // Pass normalized coordinates (0-1) for UI to scale
             onHover(closestLabel, indexTip.x, indexTip.y);
        } else if (onHover && (!rightHand.isPinching || isRealDualGesture)) {
             // Clear hover when not pinching or busy
             onHover(null, 0, 0);
        }

        if (!rightHand.isPinching && lastRightPinchRef.current && !isRealDualGesture) {
             if (onWorkshopClick) {
                 // 1. Get Hand Cursor Position in NDC (-1 to 1)
                 const indexTip = rightHand.landmarks[8];
                 const cursorNDC = {
                     x: (indexTip.x - 0.5) * 2,
                     y: -(indexTip.y - 0.5) * 2
                 };

                 // 2. Find closest interactive item
                 // Increased threshold from 0.15 to 0.3 to improve hit rate
                 let minDist = 0.3; 
                 let closestLabel: string | null = null;

                 FACTORY_LAYOUT.forEach(item => {
                     if (!item.label) return;
                     
                     // Convert item position to World Space then to NDC
                     const itemPos = new Vector3(...item.position);
                     itemPos.multiplyScalar(SCENE_SCALE); // Apply group scale
                     itemPos.project(camera); // Project to NDC
                     
                     // Check distance in 2D screen space
                     const dx = itemPos.x - cursorNDC.x;
                     const dy = itemPos.y - cursorNDC.y;
                     const dist = Math.sqrt(dx*dx + dy*dy);
                     
                     if (dist < minDist) {
                         minDist = dist;
                         closestLabel = item.label;
                     }
                 });

                 if (closestLabel) {
                     onWorkshopClick(closestLabel);
                 }
             }
        }
        lastRightPinchRef.current = rightHand.isPinching;
    } else if (onHover) {
        // Clear hover if hand lost
        onHover(null, 0, 0);
    }

    // Check for Dual Hand Gesture (Both Pinching) -> ZOOM
    if (leftHand && rightHand && leftHand.isPinching && rightHand.isPinching) {
        // Calculate Distance between hands (using index tips or centroids)
        const leftPos = leftHand.landmarks[9];
        const rightPos = rightHand.landmarks[9];
        const dist = Math.sqrt(
            Math.pow(leftPos.x - rightPos.x, 2) + 
            Math.pow(leftPos.y - rightPos.y, 2)
        );

        if (isDualGestureRef.current && previousPinchDist.current !== null) {
            const deltaDist = dist - previousPinchDist.current;
            
            // Apply Zoom
            // Moving hands apart (deltaDist > 0) -> Zoom In
            // Moving hands together (deltaDist < 0) -> Zoom Out
            if (Math.abs(deltaDist) > 0.002) {
                const zoomFactor = 1 + Math.abs(deltaDist) * ZOOM_SENSITIVITY;
                if (deltaDist > 0) {
                     // Hands moving apart -> Zoom In (Enlarge)
                     // Swapped to dollyOut based on user feedback that dollyIn was shrinking
                     // (Normally dollyIn = Zoom In, but environment may vary)
                     controlsRef.current.dollyOut(zoomFactor);
                } else {
                     // Hands moving together -> Zoom Out (Shrink)
                     // (Normally dollyIn = Zoom In, but environment may vary)
                     controlsRef.current.dollyIn(zoomFactor);
                }
                controlsRef.current.update();
            }
        }

        // Update State for Dual
        previousPinchDist.current = dist;
        isDualGestureRef.current = true;
        activeAxisRef.current = 'zoom-dual'; // Force lock to zoom
        
        // Reset Single Hand State to avoid jumping when one hand releases
        previousHandPos.current = null;
        isPinchingRef.current = false;

    } else if (leftHand && leftHand.isPinching) {
        // --- SINGLE HAND GESTURE (LEFT) -> ROTATION ---
        
        // If we were just in dual gesture, don't immediately snap to rotation
        if (isDualGestureRef.current) {
            isDualGestureRef.current = false;
            previousPinchDist.current = null;
            // Reset position to prevent jump
            previousHandPos.current = null;
            activeAxisRef.current = 'none';
            return;
        }

        // Use Middle Finger MCP for stability
        const currentPos = { 
            x: leftHand.landmarks[9].x, 
            y: leftHand.landmarks[9].y
        }; 
        
        if (isPinchingRef.current && previousHandPos.current) {
            const deltaX = currentPos.x - previousHandPos.current.x;
            const deltaY = currentPos.y - previousHandPos.current.y;

            // Determine Axis if not locked
            if (activeAxisRef.current === 'none') {
                const absX = Math.abs(deltaX);
                const absY = Math.abs(deltaY);

                // Check if any axis exceeds noise threshold to trigger a lock
                if (absX > 0.005 || absY > 0.005) {
                    if (absX > absY) {
                        activeAxisRef.current = 'x';
                    } else {
                        activeAxisRef.current = 'y';
                    }
                }
            }

            // Apply Transformation based on Locked Axis
            if (activeAxisRef.current === 'x') {
                if (Math.abs(deltaX) > 0.001) {
                    const currentAzimuth = controlsRef.current.getAzimuthalAngle();
                    controlsRef.current.setAzimuthalAngle(currentAzimuth - deltaX * ROTATION_SENSITIVITY);
                }
            } else if (activeAxisRef.current === 'y') {
                if (Math.abs(deltaY) > 0.001) {
                    const currentPolar = controlsRef.current.getPolarAngle();
                    controlsRef.current.setPolarAngle(currentPolar - deltaY * ROTATION_SENSITIVITY);
                }
            }
        }
        
        // Update State
        previousHandPos.current = currentPos;
        isPinchingRef.current = true;
        
    } else {
        // Reset state when not pinching
        isPinchingRef.current = false;
        isDualGestureRef.current = false;
        previousHandPos.current = null;
        previousPinchDist.current = null;
        activeAxisRef.current = 'none'; // Reset lock
    }
  });

  return null;
};
