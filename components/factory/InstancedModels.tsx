import React, { useMemo } from 'react';
import { useGLTF, Instances, Instance } from '@react-three/drei';
import { Mesh, FrontSide } from 'three';
import { ModelConfig } from './config';
import { useHandTracking } from '../../contexts/HandTrackingContext';

export const InstancedModels: React.FC<{ 
  file: string; 
  instances: ModelConfig[];
  onWorkshopClick?: (name: string) => void;
  onHover?: (label: string | null, x: number, y: number) => void;
}> = ({ file, instances, onWorkshopClick, onHover }) => {
  const { isTrackingEnabled } = useHandTracking();
  const { scene } = useGLTF(`./models/factory/${file}`);

  const meshData = useMemo(() => {
    const m: { geometry: any; material: any }[] = [];
    // Clone scene to avoid modifying the cached original if we were to modify nodes directly,
    // but here we just traverse and clone geometry.
    // However, scene.updateMatrixWorld() modifies the scene graph. 
    // useGLTF returns the same scene object for same URL. 
    // So if multiple components used this, it might be an issue. 
    // But here we are the only consumer in this way.
    // To be safe, we can clone the scene first? 
    // Cloning a whole scene is expensive.
    // updateMatrixWorld() is usually harmless if the scene is static.
    
    scene.updateMatrixWorld(true);
    
    scene.traverse((child) => {
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

        // Clone geometry to bake the transform
        const geom = mesh.geometry.clone();
        geom.applyMatrix4(mesh.matrixWorld);
        
        m.push({
          geometry: geom,
          material: mesh.material,
        });
      }
    });
    return m;
  }, [scene]);

  return (
    <group userData={{ instancesConfig: instances, type: 'instanced-model' }}>
      {meshData.map((item, i) => (
        <Instances 
          key={i} 
          range={instances.length} 
          limit={instances.length}
          geometry={item.geometry} 
          material={item.material}
        >
            {instances.map((config, j) => (
              <Instance
                key={j}
                position={config.position}
                rotation={config.rotation}
                scale={config.scale || 1}
                onClick={(e) => {
                    if (isTrackingEnabled) return;
                    e.stopPropagation();
                    if (onWorkshopClick && config.label) {
                        onWorkshopClick(config.label);
                    }
                }}
                onPointerOver={(e) => {
                    if (isTrackingEnabled) return;
                    e.stopPropagation();
                    if (onHover && config.label) {
                        onHover(config.label, e.clientX, e.clientY);
                    }
                }}
                onPointerOut={(e) => {
                    if (isTrackingEnabled) return;
                    if (onHover) {
                        onHover(null, 0, 0);
                    }
                }}
              />
            ))}
        </Instances>
      ))}
    </group>
  );
};
