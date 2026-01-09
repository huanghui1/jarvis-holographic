import React, { useMemo, useRef } from 'react';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import { HandTrackingState } from '../types';
import hdrEnv from '../assets/potsdamer_platz_1k.hdr';
import { FACTORY_LAYOUT, SCENE_SCALE, ModelConfig } from './factory/config';
import { ModelItem } from './factory/ModelItem';
import { InstancedModels } from './factory/InstancedModels';
import { GestureController } from './factory/GestureController';

const FactoryScene: React.FC<{ 
  handTrackingRef?: React.MutableRefObject<HandTrackingState>;
  isModalOpen?: boolean;
  onWorkshopClick?: (name: string) => void;
  onHover?: (label: string | null, x: number, y: number) => void;
}> = ({ handTrackingRef, isModalOpen, onWorkshopClick, onHover }) => {
  const { singles, groups } = useMemo(() => {
    const singles: ModelConfig[] = [];
    const groups: Record<string, ModelConfig[]> = {};

    FACTORY_LAYOUT.forEach(config => {
      // Filter out special cases that need individual ModelItem
      // 1. Animated paths
      // 2. Explicitly centered (likely needs bounding box calculation per item or implies special handling)
      // 3. The main floor (has special material logic)
      const isSpecial = config.animatePath || config.center || config.file === '车间大平面.glb';

      if (isSpecial) {
        singles.push(config);
      } else {
        if (!groups[config.file]) groups[config.file] = [];
        groups[config.file].push(config);
      }
    });

    return { singles, groups };
  }, []);

  const controlsRef = useRef<any>(null);

  return (
    <>
      <GestureController 
        handTrackingRef={handTrackingRef} 
        controlsRef={controlsRef} 
        isModalOpen={isModalOpen} 
        onWorkshopClick={onWorkshopClick}
        onHover={onHover}
      />
      {/* <ambientLight intensity={0.5} /> */}
      {/* <directionalLight position={[20, 30, 20]} intensity={1.5} castShadow /> */}
      <pointLight position={[-10, 10, -10]} intensity={0.5} />
      
      <group scale={SCENE_SCALE}>
        {/* Debug Helpers */}
        <axesHelper args={[100]} />

        {singles.map((config, index) => (
          <ModelItem key={`${config.file}-single-${index}`} config={config} />
        ))}

        {Object.entries(groups).map(([file, instances]) => (
          <InstancedModels key={file} file={file} instances={instances} />
        ))}
      </group>

      <OrbitControls 
        ref={controlsRef}
        enabled={!isModalOpen}
        makeDefault 
        minPolarAngle={0} 
        maxPolarAngle={Math.PI / 2.2} 
        enableDamping={true}
        dampingFactor={0.1}
      />
      {/* 
        Environment provides IBL (Image Based Lighting) for realistic reflections and lighting.
        Use local HDR file to avoid fetch errors in production
      */}
      <Environment files={hdrEnv} />
    </>
  );
};

// Preload models
const UNIQUE_FILES = Array.from(new Set(FACTORY_LAYOUT.map(c => c.file)));
UNIQUE_FILES.forEach(file => useGLTF.preload(`./models/factory/${file}`));

export default FactoryScene;
