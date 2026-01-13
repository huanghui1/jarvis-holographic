import React, { useRef, useEffect, useState } from 'react';
import { useGLTF, useAnimations, useKeyboardControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const MOVEMENT_SPEED = 0.5;
const ROTATION_SPEED = 8;
const RUN_MULTIPLIER = 2.5;

export const CharacterController: React.FC<{
  active: boolean;
  sceneScale?: number;
}> = ({ active, sceneScale = 1 }) => {
  const group = useRef<THREE.Group>(null);
  const { scene: playerScene, animations } = useGLTF('/models/player.glb');
  const { scene: worldScene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  
  // Custom Animation Logic
  // We need to subclip the 'idleAndWalk' animation into 'Idle' and 'Walk'
  const [clips, setClips] = useState<THREE.AnimationClip[]>([]);
  
  useEffect(() => {
    if (animations && animations.length > 0) {
        const fullClip = animations.find(a => a.name === 'idleAndWalk') || animations[0];
        
        if (fullClip) {
            // Assume 30 FPS if not specified, but let's check clip duration
            // subclip( sourceClip, name, startFrame, endFrame, fps )
            const fps = 30;
            const idleClip = THREE.AnimationUtils.subclip(fullClip, 'Idle', 0, 251, fps);
            const walkClip = THREE.AnimationUtils.subclip(fullClip, 'Walk', 252, 282, fps);
            
            setClips([idleClip, walkClip]);
        }
    }
  }, [animations]);

  const { actions } = useAnimations(clips, group);
  const [sub, get] = useKeyboardControls();
  const { camera, gl } = useThree();
  
  // Current animation state
  const [currentAction, setCurrentAction] = useState<string>('Idle');

  // Smooth camera follow
  const cameraTarget = useRef(new THREE.Vector3());
  
  // Rotation State
  const rotation = useRef({ yaw: 0, pitch: 0 });

  useEffect(() => {
    if (!active) return;

    const onMouseDown = () => {
        gl.domElement.requestPointerLock();
    };

    const onMouseMove = (e: MouseEvent) => {
        if (document.pointerLockElement === gl.domElement) {
            // Yaw (Character Rotation) - Mouse X
            rotation.current.yaw -= e.movementX * 0.002;
            
            // Pitch (Camera Height/Angle) - Mouse Y
            rotation.current.pitch -= e.movementY * 0.002;
            
            // Clamp Pitch (Don't let camera go too high or under ground)
            // Range: -0.5 (Looking down) to 0.5 (Looking up) roughly
            rotation.current.pitch = Math.max(-0.5, Math.min(1.0, rotation.current.pitch));
        }
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);

    return () => {
        document.removeEventListener('mousedown', onMouseDown);
        document.removeEventListener('mousemove', onMouseMove);
        document.exitPointerLock();
    };
  }, [active, gl.domElement]);

  // Handle Animation Switching
  useFrame(() => {
     const { forward, backward, left, right } = get();
     // Only trigger walk animation on any movement
     const isMoving = active && (forward || backward || left || right);
     const targetAction = isMoving ? 'Walk' : 'Idle';
     
     if (targetAction !== currentAction && actions[targetAction] && actions[currentAction]) {
         const fadeDuration = 0.2;
         actions[currentAction]?.fadeOut(fadeDuration);
         actions[targetAction]?.reset().fadeIn(fadeDuration).play();
         setCurrentAction(targetAction);
     }
  });

  useEffect(() => {
    // Initial Play
    if (actions['Idle']) {
        actions['Idle'].reset().play();
    }
    
    // Cleanup
    return () => {
        actions['Idle']?.stop();
        actions['Walk']?.stop();
    };
  }, [actions]);

  useFrame((state, delta) => {
    if (!group.current) return;

    const { forward, backward, left, right, run } = get();
    // const isMoving = active && (forward || backward || left || right);
    
    // 1. Handle Movement
    if (active) {
        // --- Control Logic Update ---
        // Mouse controls Camera Rotation (rotation.current.yaw)
        // WASD controls Character Movement relative to Camera Angle
        
        // 1. Calculate Camera Direction (XZ plane)
        // rotation.current.yaw is the camera's horizontal angle
        // 0 = Looking down -Z
        const cameraAngle = rotation.current.yaw;

        // 2. Calculate Input Vector
        // Forward (W) = -1 (Into screen/Away from camera), Backward (S) = +1
        // Left (A) = -1, Right (D) = +1
        const zInput = Number(backward) - Number(forward);
        const xInput = Number(right) - Number(left);
        
        // 3. Convert Input to World Direction relative to Camera
        // Rotate input vector by camera angle
        // x' = x * cos(theta) - z * sin(theta)
        // z' = x * sin(theta) + z * cos(theta)
        // Note: We want W to move along the direction camera is facing.
        // If camera yaw is 0 (looking -Z), W (zInput=-1) should result in -Z motion.
        // Let's construct a Vector3 and apply rotation.
        
        const moveDir = new THREE.Vector3(xInput, 0, zInput);
        
        if (moveDir.length() > 0) {
            moveDir.normalize();
            
            // Rotate moveDir by Camera Yaw
            // We rotate around Y axis
            moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraAngle);
            
            // --- Collision Detection ---
            const rayOrigin = new THREE.Vector3();
            group.current.getWorldPosition(rayOrigin);
            // Ray origin at waist height (approx 1m in local space -> 1 * sceneScale in world space)
            rayOrigin.y += 1.0 * sceneScale;

            raycaster.current.set(rayOrigin, moveDir);
            
            // Detection distance: 0.5m local -> 0.5 * sceneScale world
            // Add a small buffer to prevent sticking
            const detectDistance = 0.5 * sceneScale;
            raycaster.current.far = detectDistance;

            const factoryWorld = worldScene.getObjectByName('factory-world');
            let blocked = false;

            if (factoryWorld) {
                const intersects = raycaster.current.intersectObjects(factoryWorld.children, true);
                
                for (const hit of intersects) {
                     // Traverse up to find identity (Player or Floor)
                     let obj: THREE.Object3D | null = hit.object;
                     let isPlayer = false;
                     let isFloor = false;

                     // Ignore Helpers and non-solid objects
                     if (obj.type.includes('Helper') || obj.type === 'LineSegments' || obj.type === 'Line' || obj.type === 'Points' || (obj as any).isHelper) {
                         continue;
                     }

                     while (obj) {
                         if (obj === group.current) {
                             isPlayer = true;
                             break;
                         }
                         if (obj.userData && obj.userData.label === '生产车间') {
                             // "生产车间" includes both floor and walls.
                             // We check the normal of the hit face.
                             // If the normal is pointing up (Y+), it's a floor.
                             // If the normal is horizontal, it's a wall.
                             if (hit.face && Math.abs(hit.face.normal.y) > 0.5) {
                                isFloor = true;
                             }
                             // Otherwise, it's a wall (part of the factory model), so we don't set isFloor=true, 
                             // which means blocked=true will be triggered below.
                             break;
                         }
                         if (obj.name === 'factory-world') break;
                         obj = obj.parent;
                     }
                     
                     if (!isPlayer && !isFloor) {
                         console.log('Blocked by:', obj.name, obj.userData, 'Distance:', hit.distance);
                         blocked = true;
                         break;
                     }
                }
            }

            if (!blocked) {
                const speed = MOVEMENT_SPEED / sceneScale * (run ? RUN_MULTIPLIER : 1) * delta;
                
                // Move Character
                const newPos = group.current.position.clone().add(moveDir.multiplyScalar(speed));

                // --- Boundary Check (Invisible Walls) ---
                // Factory approximate size: [-40, 40] on X, [-25, 25] on Z (Adjust based on actual scene size)
                const BOUNDARY = {
                    minX: -40, maxX: 40,
                    minZ: -30, maxZ: 30
                };

                if (newPos.x < BOUNDARY.minX || newPos.x > BOUNDARY.maxX || 
                    newPos.z < BOUNDARY.minZ || newPos.z > BOUNDARY.maxZ) {
                    // Hit the invisible wall - stop movement
                    // Optionally we can allow sliding along the wall, but for now simple stop.
                } else {
                    group.current.position.copy(newPos);
                }
            }
            
            // Rotate Character to face movement direction
            // Calculate target angle
            // atan2(x, z) gives angle from Z axis? 
            // Three.js object rotation order usually Y up.
            // We want character to face `moveDir`.
            // We can use Matrix4.lookAt or Quaternion.setFromUnitVectors
            
            const targetRotation = Math.atan2(moveDir.x, moveDir.z);
            // Since model is rotated 180deg inside primitive, we might need adjustment?
            // primitive rotation=[0, Math.PI, 0] means model faces +Z when group faces +Z.
            // If we want group to face direction, we just set group rotation.
            // Let's use smooth rotation
            
            const targetQuat = new THREE.Quaternion();
            targetQuat.setFromEuler(new THREE.Euler(0, targetRotation, 0));
            group.current.quaternion.slerp(targetQuat, 10 * delta);
        }
    }

    // 3. Camera Follow
    if (active && group.current) {
        const worldPos = new THREE.Vector3();
        group.current.getWorldPosition(worldPos);
        
        // Calculate relative offset based on CAMERA orientation (Yaw)
        // Camera is always at fixed distance/angle relative to its own Yaw
        
        // Start with vector behind target (relative to camera yaw 0)
        // If Yaw=0 (Looking -Z), Camera should be at +Z
        const offset = new THREE.Vector3(0, 0, 4);
        
        // Apply Pitch (Rotate around X axis)
        const pitchMatrix = new THREE.Matrix4().makeRotationX(rotation.current.pitch);
        offset.applyMatrix4(pitchMatrix);
        
        // Add Height offset
        offset.y += 2.5; 

        // Apply Yaw (Camera Rotation)
        const yawMatrix = new THREE.Matrix4().makeRotationY(rotation.current.yaw);
        offset.applyMatrix4(yawMatrix);
        
        const targetCameraPos = worldPos.clone().add(offset);
        
        camera.position.lerp(targetCameraPos, 10 * delta); // Responsive follow
        
        // Camera looks at character head/center
        // Adjusted look target height slightly down to match closer camera
        const lookTarget = worldPos.clone().add(new THREE.Vector3(0, 2, 0));
        cameraTarget.current.lerp(lookTarget, 10 * delta);
        camera.lookAt(cameraTarget.current);
    }
  });

  return (
    <group ref={group} dispose={null} scale={1} position={[0, 0, 0]}>
      <primitive object={playerScene} />
    </group>
  );
};
