import React, { useMemo, useRef } from 'react';
import { useGLTF, OrbitControls, Environment, Text, Billboard } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Box3, Vector3, Group, Mesh, MeshStandardMaterial, Color } from 'three';

// Define the scale for converting mm to meters (assuming models are in mm)
// Try 1.0 first to see if models appear, 0.001 might be too small if models are already in meters
const SCALE = 1; 


interface ModelConfig {
  file: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  label?: string;
  scale?: number;
  animatePath?: {
    start: [number, number, number];
    end: [number, number, number];
    speed: number;
  };
}

// Layout configuration based on the provided floor plan
const FACTORY_LAYOUT: ModelConfig[] = [
  // --- Infrastructure ---
  // The main floor
  { file: '车间大平面.glb', position: [0, 0, 0], scale: SCALE, label: 'Factory Floor' },

  // --- Storage Area (Left Side) ---
  // Rows of heavy duty shelves
  { file: '1000-2000-重型货架.glb', position: [-18, 0, -17], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf A1' },
  { file: '1000-2000-重型货架.glb', position: [-18, 0, -12], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf A2' },
  { file: '1000-2850-重型货架.glb', position: [-18, 0, -7], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf B1' },
  { file: '1000-2850-重型货架.glb', position: [-18, 0, -2], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf B2' },
  // { 
  //   file: '600-1500-货架装配体.glb', 
  //   position: [-20, 0, -10], 
  //   rotation: [0, Math.PI / 2, 0], 
  //   scale: SCALE, 
  //   label: 'Assembly Shelf',
  //   animatePath: {
  //       start: [-20, 0, -10],
  //       end: [-20, 0, 10], // Move along Z axis
  //       speed: 2
  //   }
  // },
  
  // Pallets nearby
  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [-22, 0, 0], scale: SCALE },
  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [-22, 0.15, 0], rotation: [0, 0.5, 0], scale: SCALE },

  // --- Machining Center (Right Side) ---
  // Vertical CNCs arranged in rows
  // { file: '立式CNC.glb', position: [20, 0, -15], rotation: [0, -Math.PI / 2, 0], scale: SCALE, label: 'V-CNC 1' },
  // { file: '立式CNC.glb', position: [20, 0, -10], rotation: [0, -Math.PI / 2, 0], scale: SCALE, label: 'V-CNC 2' },
  // { file: '中型cnc装配体.glb', position: [25, 0, -15], rotation: [0, -Math.PI / 2, 0], scale: SCALE, label: 'M-CNC 1' },
  // { file: 'zn20109a.0000000_立式加工中心ga-v918c.glb', position: [25, 0, -5], rotation: [0, -Math.PI / 2, 0], scale: SCALE, label: 'GA-V918C' },

  // Lathes area
  // { file: '小车床-0632.glb', position: [15, 0, 10], rotation: [0, Math.PI, 0], scale: SCALE, label: 'Lathe S' },
  // { file: '数控车床sy-双轴车床装配体.glb', position: [20, 0, 10], rotation: [0, Math.PI, 0], scale: SCALE, label: 'Lathe Dual' },

  // Drilling area
  // { file: '全自动钻床.glb', position: [25, 0, 10], rotation: [0, Math.PI, 0], scale: SCALE, label: 'Auto Drill' },
  // { file: '大型钻攻中心.glb', position: [30, 0, 10], rotation: [0, Math.PI, 0], scale: SCALE, label: 'Drill Center' },

  // --- Central Heavy Machinery ---
  // The large Gantry CNC in the middle
  // { file: '龙门cnc.glb', position: [0, 0, 0], rotation: [0, 0, 0], scale: SCALE, label: 'Gantry CNC' },

  // --- Assembly & Inspection (Middle/Left) ---
  // Workbenches
  // { file: 'gzt-工作台2.glb', position: [-10, 0, 10], scale: SCALE, label: 'Workbench 1' },
  // { file: '办公桌-sus02-00工作台装配.glb', position: [-5, 0, 10], scale: SCALE, label: 'Station 2' },
  // { file: 'dk-机架装配.glb', position: [-10, 0, 15], scale: SCALE, label: 'Rack Assy' },
  // { file: '台面1700-3400.glb', position: [-5, 0, 15], scale: SCALE, label: 'Table L' },

  // Inspection
  // { file: 's三坐标机.glb', position: [5, 0, 15], rotation: [0, -Math.PI / 4, 0], scale: SCALE, label: 'CMM' },
  // { file: '研磨机220.glb', position: [10, 0, 15], scale: SCALE, label: 'Grinder' },

  // --- Logistics ---
  // AGV moving in the aisle
  // { file: 'agv-0200500000000_堆垛车.glb', position: [0, 0, -8], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'AGV' },
];

const ModelItem: React.FC<{ config: ModelConfig }> = ({ config }) => {
  const { scene } = useGLTF(`/models/factory/${config.file}`);
  const groupRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (config.animatePath && groupRef.current) {
        const { start, end, speed } = config.animatePath;
        const time = state.clock.elapsedTime * speed * 0.5; // Scale speed
        const t = (Math.sin(time) + 1) / 2; // Oscillate 0 to 1

        groupRef.current.position.x = start[0] + (end[0] - start[0]) * t;
        groupRef.current.position.y = start[1] + (end[1] - start[1]) * t;
        groupRef.current.position.z = start[2] + (end[2] - start[2]) * t;
    }
  });

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    // Auto-center the "Factory Floor" model only
    if (config.file === '车间大平面.glb') {
        const box = new Box3().setFromObject(clone);
        const center = box.getCenter(new Vector3());
        
        // Offset the model so its center is at (0,0,0) of its local group
        clone.position.sub(center);
        
        // Keep it on the ground (optional: if y-center puts it halfway underground)
        // const size = box.getSize(new Vector3());
        // clone.position.y += size.y / 2; 

        // Fix flickering: traverse and update material to avoid z-fighting with ground
        clone.traverse((child) => {
          if ((child as Mesh).isMesh) {
             const mesh = child as Mesh;
             mesh.renderOrder = -1; // Render first

             // Check if it looks like a yellow marking (High R, High G, Low B)
             // Or check based on mesh name if available (often named 'marking' or similar)
             // Here we use a heuristic based on color or name
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
    }
    
    return clone;
  }, [scene, config.file]);

  return (
    <group ref={groupRef} position={config.position} rotation={config.rotation || [0, 0, 0]}>
      <primitive object={clonedScene} scale={config.scale || 1} />
    </group>
  );
};

const FactoryScene: React.FC = () => {
  return (
    <>
      {/* <ambientLight intensity={0.5} /> */}
      {/* <directionalLight position={[20, 30, 20]} intensity={1.5} castShadow /> */}
      <pointLight position={[-10, 10, -10]} intensity={0.5} />
      
      <group>
        {/* Debug Helpers */}
        <axesHelper args={[100]} />

        {FACTORY_LAYOUT.map((config, index) => (
          <ModelItem key={`${config.file}-${index}`} config={config} />
        ))}
      </group>

      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.2} />
      {/* 
        Environment provides IBL (Image Based Lighting) for realistic reflections and lighting.
        Presets: sunset, dawn, night, warehouse, forest, apartment, studio, city, park, lobby
      */}
      <Environment preset="city" />
    </>
  );
};

// Preload models
const UNIQUE_FILES = Array.from(new Set(FACTORY_LAYOUT.map(c => c.file)));
UNIQUE_FILES.forEach(file => useGLTF.preload(`/models/factory/${file}`));

export default FactoryScene;
