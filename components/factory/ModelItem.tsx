import React, { useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { Box3, Vector3, Group, Mesh, FrontSide, Color } from 'three';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ModelConfig } from './config';

gsap.registerPlugin(MotionPathPlugin, useGSAP);

export const ModelItem: React.FC<{ config: ModelConfig }> = ({ config }) => {
  // Use a relative path prefix based on environment or ensure base path is correct
  // In Electron production (file://), absolute paths like /models/... resolve to file:///models/... (root of drive)
  // We need relative paths: ./models/... or just models/...
  const { scene } = useGLTF(`./models/factory/${config.file}`);
  const groupRef = useRef<Group>(null);

  useGSAP(() => {
    if (config.animatePath && groupRef.current) {
        const { waypoints, duration, pathType = 'ping-pong', autoRotate = true, turnDuration = 0 } = config.animatePath;
        if (!waypoints || waypoints.length < 2) return;

        // Kill previous animations if any
        gsap.killTweensOf(groupRef.current.position);
        gsap.killTweensOf(groupRef.current.rotation);

        // Initial Position
        groupRef.current.position.set(waypoints[0].x, waypoints[0].y, waypoints[0].z);

        // Create GSAP Timeline
        const tl = gsap.timeline({
            repeat: -1,
            // Only use yoyo if NO turn duration is specified. 
            // If turnDuration is set, we manually construct the full loop.
            yoyo: turnDuration > 0 ? false : (pathType === 'ping-pong'),
            repeatDelay: turnDuration > 0 ? 0 : 0.5,
            defaults: { ease: "power1.inOut" }
        });

        // 1. Move Forward (A -> B -> C)
        tl.to(groupRef.current.position, {
            motionPath: {
                path: waypoints,
                curviness: 0.5,
                autoRotate: autoRotate
            },
            duration: duration,
            ease: "power1.inOut"
        });

        // If turnDuration is set, implement the U-Turn logic
        if (turnDuration > 0 && pathType === 'ping-pong') {
             // 2. Turn 180 degrees at the end (relative to current)
             tl.to(groupRef.current.rotation, {
                 y: "+=" + Math.PI, 
                 duration: turnDuration,
                 ease: "power1.inOut"
             });

             // 3. Move Backward (C -> B -> A)
             // We need to reverse the waypoints
             const reversedWaypoints = [...waypoints].reverse();
             
             tl.to(groupRef.current.position, {
                 motionPath: {
                     path: reversedWaypoints,
                     curviness: 0.5,
                     autoRotate: true, 
                 },
                 duration: duration,
                 ease: "power1.inOut"
             });

             // 4. Turn 180 degrees at the start to face original direction
             tl.to(groupRef.current.rotation, {
                 y: "+=" + Math.PI, 
                 duration: turnDuration,
                 ease: "power1.inOut"
             });
        }
    }
  }, { scope: groupRef, dependencies: [config.animatePath] });

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    // Universal Optimization
    clone.traverse((child) => {
      if ((child as Mesh).isMesh) {
         const mesh = child as Mesh;
         mesh.castShadow = false;
         mesh.receiveShadow = false;

         if (mesh.material) {
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((m: any) => {
                m.side = FrontSide;
            });
         }
      }
    });

    // Auto-center the "Factory Floor" model only
    if (config.file === '车间大平面.glb') {
        const box = new Box3().setFromObject(clone);
        const center = box.getCenter(new Vector3());
        
        // Offset the model so its center is at (0,0,0) of its local group (X/Z only)
        clone.position.x -= center.x;
        clone.position.z -= center.z;

        // Fix flickering: traverse and update material to avoid z-fighting with ground
        clone.traverse((child) => {
          if ((child as Mesh).isMesh) {
             const mesh = child as Mesh;
             mesh.renderOrder = -1; // Render first

             // Check if it looks like a yellow marking (High R, High G, Low B)
             let isMarking = false;
             
             if (mesh.material) {
                const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
                if ((mat as any).color) {
                    const c = (mat as any).color as Color;
                    // Yellow is approx (1, 1, 0)
                    if (c.r > 0.5 && c.g > 0.5 && c.b < 0.5) {
                        isMarking = true;
                    }
                }
             }

             // If it's a marking, lift it slightly higher than the floor base
             if (isMarking) {
                 mesh.position.y += 0.02; // Higher than floor
                 mesh.renderOrder = 0;    // Render after floor
             } else {
                 mesh.position.y += 0.01; // Floor base
             }
          }
        });
    } else if (config.animatePath || config.center) {
        // For animated models or explicitly centered models, center them so rotation happens around their center
        const box = new Box3().setFromObject(clone);
        const center = box.getCenter(new Vector3());
        
        clone.position.x -= center.x;
        clone.position.z -= center.z;
        
        if (config.center) {
            clone.position.y -= center.y;
        }
    }
    
    return clone;
  }, [scene, config.file, config.animatePath, config.center]);

  // For animated models, we want to separate the "correction" rotation (config.rotation)
  // from the "path" rotation (applied by GSAP to groupRef).
  // So we apply config.rotation to an inner group.
  const isAnimated = !!config.animatePath;
  const outerRotation = isAnimated ? [0, 0, 0] : (config.rotation || [0, 0, 0]);
  const innerRotation = isAnimated ? (config.rotation || [0, 0, 0]) : [0, 0, 0];

  return (
    <group ref={groupRef} position={config.position} rotation={outerRotation as any}>
      <group rotation={innerRotation as any}>
        <primitive object={clonedScene} scale={config.scale || 1} />
      </group>
    </group>
  );
};
