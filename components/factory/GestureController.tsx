import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Raycaster, Object3D } from 'three';
import { useHandTracking } from '../../contexts/HandTrackingContext';
import { FACTORY_LAYOUT, SCENE_SCALE, ModelConfig } from './config';

// Gesture Controller Component
export const GestureController: React.FC<{ 
  controlsRef: React.MutableRefObject<any>;
  isModalOpen?: boolean;
  onWorkshopClick?: (name: string) => void;
  onHover?: (label: string | null, x: number, y: number) => void;
}> = ({ controlsRef, isModalOpen, onWorkshopClick, onHover }) => {
  const { handTrackingRef, isTrackingEnabled } = useHandTracking();
  const { camera, scene } = useThree();
  const raycaster = useRef(new Raycaster()).current;
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
    
    // Also disable if tracking is turned off globally
    if (!isTrackingEnabled) return;
    
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
             
             // Convert hand coordinates (0-1, y-down) to NDC (-1 to 1, y-up)
             const ndc = {
                 x: -(indexTip.x - 0.5) * 2,
                 y: -(indexTip.y - 0.5) * 2
             };

             raycaster.setFromCamera(ndc as any, camera);
             
             // Intersect with everything in the scene
             // We need to filter for our specific objects
             const factoryWorld = scene.getObjectByName('factory-world');
             const objectsToTest = factoryWorld ? factoryWorld.children : [];
             const intersects = raycaster.intersectObjects(objectsToTest, true);
             
             let closestLabel: string | null = null;
             
             for (const intersect of intersects) {
                 // Traverse up to find a node with our userData
                 let current: Object3D | null = intersect.object;
                 while (current) {
                     if (current.userData) {
                         if (current.userData.type === 'model-item') {
                             closestLabel = current.userData.label;
                             break;
                         } else if (current.userData.type === 'instanced-model') {
                             // For instances, we need the instanceId to know which config to use
                             const instanceId = intersect.instanceId;
                             const configs = current.userData.instancesConfig as ModelConfig[];
                             if (instanceId !== undefined && configs && configs[instanceId]) {
                                 closestLabel = configs[instanceId].label || null;
                             }
                             break;
                         }
                     }
                     current = current.parent;
                 }
                 
                 if (closestLabel) break; // Found the nearest labeled object
             }

             // Pass normalized coordinates (0-1) for UI to scale
             onHover(closestLabel, indexTip.x, indexTip.y);
        } else if (onHover && (!rightHand.isPinching || isRealDualGesture)) {
             // Clear hover when not pinching or busy
             onHover(null, 0, 0);
        }

        if (!rightHand.isPinching && lastRightPinchRef.current && !isRealDualGesture) {
             if (onWorkshopClick) {
                 const indexTip = rightHand.landmarks[8];
                 const ndc = {
                     x: -(indexTip.x - 0.5) * 2,
                     y: -(indexTip.y - 0.5) * 2
                 };

                 raycaster.setFromCamera(ndc as any, camera);
                 const factoryWorld = scene.getObjectByName('factory-world');
                 const objectsToTest = factoryWorld ? factoryWorld.children : [];
                 const intersects = raycaster.intersectObjects(objectsToTest, true);
                 let closestLabel: string | null = null;

                 for (const intersect of intersects) {
                     let current: Object3D | null = intersect.object;
                     while (current) {
                         if (current.userData) {
                             if (current.userData.type === 'model-item') {
                                 closestLabel = current.userData.label;
                                 break;
                             } else if (current.userData.type === 'instanced-model') {
                                 const instanceId = intersect.instanceId;
                                 const configs = current.userData.instancesConfig as ModelConfig[];
                                 if (instanceId !== undefined && configs && configs[instanceId]) {
                                     closestLabel = configs[instanceId].label || null;
                                 }
                                 break;
                             }
                         }
                         current = current.parent;
                     }
                     if (closestLabel) break;
                 }

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
