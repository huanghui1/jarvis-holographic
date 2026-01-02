import React, { useMemo, useRef } from 'react';
import { useGLTF, OrbitControls, Environment, Text, Billboard } from '@react-three/drei';
// import { useFrame } from '@react-three/fiber';
import { Box3, Vector3, Group, Mesh, MeshStandardMaterial, Color } from 'three';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(MotionPathPlugin, useGSAP);

// Define the scale for converting mm to meters (assuming models are in mm)
// Try 1.0 first to see if models appear, 0.001 might be too small if models are already in meters
const SCALE = 1; 
// Global scene scale to adjust the size of the entire factory
const SCENE_SCALE = 0.2; 


interface ModelConfig {
  file: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  label?: string;
  scale?: number;
  center?: boolean;
  animatePath?: {
    waypoints: {x: number, y: number, z: number}[];
    duration: number;
    pathType?: 'ping-pong' | 'loop';
    autoRotate?: boolean;
    turnDuration?: number;
  };
}

// Layout configuration based on the provided floor plan
const FACTORY_LAYOUT: ModelConfig[] = [
  // --- Infrastructure ---
  // The main floor
  { file: '车间大平面.glb', position: [0, 0, 0], scale: SCALE, label: 'Factory Floor' },

  // --- Storage Area (Left Side) ---
  // Rows of heavy duty shelves
  { file: '1000-2000-重型货架.glb', position: [-18, 3.5, -17], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf A1' },
  { file: '1000-2000-重型货架.glb', position: [-18, 3.5, -12], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf A2' },
  { file: '1000-2850-重型货架.glb', position: [-18, 3.5, -7], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf B1' },
  { file: '1000-2850-重型货架.glb', position: [-18, 3.5, -2], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf B2' },

  { file: '1000-2000-重型货架.glb', position: [-14, 3.5, -17], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf A1' },
  { file: '1000-2000-重型货架.glb', position: [-14, 3.5, -12], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf A2' },
  { file: '1000-2850-重型货架.glb', position: [-14, 3.5, -7], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf B1' },
  { file: '1000-2850-重型货架.glb', position: [-14, 3.5, -2], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf B2' },

  { file: '1000-2000-重型货架.glb', position: [-21.8, 3.5, -17], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf A1' },
  { file: '1000-2000-重型货架.glb', position: [-21.8, 3.5, -12], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf A2' },
  { file: '1000-2850-重型货架.glb', position: [-21.8, 3.5, -7], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf B1' },
  { file: '1000-2850-重型货架.glb', position: [-21.8, 3.5, -2], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf B2' },

  { file: '1000-2000-重型货架.glb', position: [-35.8, 3.5, -17], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf A1' },
  { file: '1000-2000-重型货架.glb', position: [-35.8, 3.5, -12], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf A2' },
  { file: '1000-2850-重型货架.glb', position: [-35.8, 3.5, -7], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf B1' },
  { file: '1000-2850-重型货架.glb', position: [-35.8, 3.5, -2], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf B2' },

  { file: '1000-2000-重型货架.glb', position: [-35.8, 3.5, 4], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf A1' },
  { file: '1000-2000-重型货架.glb', position: [-35.8, 3.5, 8], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf A2' },
  { file: '1000-2850-重型货架.glb', position: [-35.8, 3.5, 12], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf B1' },
  { file: '1000-2850-重型货架.glb', position: [-35.8, 3.5, 17], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf B2' },

  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [-24, 0.1, 8.6], scale: SCALE, label: 'Shelf A1' },
  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [-24, 0.1, 9.6], scale: SCALE, label: 'Shelf A2' },
  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [-24, 0.1, 10.6], scale: SCALE, label: 'Shelf A2' },
  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [-24, 0.1, 11.6], scale: SCALE, label: 'Shelf A2' },
  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [-24, 0.1, 12.6], scale: SCALE, label: 'Shelf A2' },
  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [-24, 0.1, 14.6], scale: SCALE, label: 'Shelf A2' },
  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [-24, 0.1, 15.6], scale: SCALE, label: 'Shelf A2' },
  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [-24, 0.1, 16.6], scale: SCALE, label: 'Shelf A2' },
  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [-24, 0.1, 17.6], scale: SCALE, label: 'Shelf A2' },

  { file: '1000-2000-重型货架.glb', position: [-20.8, 3.5, 4], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf A1' },
  { file: '1000-2000-重型货架.glb', position: [-20.8, 3.5, 8], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf A2' },
  { file: '1000-2850-重型货架.glb', position: [-20.8, 3.5, 12], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf B1' },
  { file: '1000-2850-重型货架.glb', position: [-20.8, 3.5, 17], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf B2' },

  { file: '1000-2000-重型货架.glb', position: [-14.8, 3.5, 4], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf A1' },
  { file: '1000-2000-重型货架.glb', position: [-14.8, 3.5, 8], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf A2' },
  { file: '1000-2850-重型货架.glb', position: [-14.8, 3.5, 12], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf B1' },
  { file: '1000-2850-重型货架.glb', position: [-14.8, 3.5, 17], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf B2' },

  { 
    file: '600-1500-货架装配体.glb', 
    position: [-20, 0, -10], 
    rotation: [0, Math.PI / 2, 0], 
    scale: SCALE, 
    label: 'Assembly Shelf'
  },
  
  // Pallets nearby
  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [9, 0, 8], scale: SCALE },
  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [9, 0, 9], scale: SCALE },
  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [10, 0, 8], scale: SCALE },
  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [10, 0, 9], scale: SCALE },
  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [11, 0, 8], scale: SCALE },
  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [11, 0, 9], scale: SCALE },
  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [12, 0, 8], scale: SCALE },
  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [12, 0, 9], scale: SCALE },

  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [9, 0, 12], scale: SCALE },
  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [9, 0, 13], scale: SCALE },
  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [10, 0, 12], scale: SCALE },
  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [10, 0, 13], scale: SCALE },
  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [11, 0, 12], scale: SCALE },
  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [11, 0, 13], scale: SCALE },
  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [12, 0, 12], scale: SCALE },
  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [12, 0, 13], scale: SCALE },

  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [9, 0, 16], scale: SCALE },
  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [9, 0, 17], scale: SCALE },
  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [10, 0, 16], scale: SCALE },
  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [10, 0, 17], scale: SCALE },
  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [11, 0, 16], scale: SCALE },
  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [11, 0, 17], scale: SCALE },
  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [12, 0, 16], scale: SCALE },
  { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [12, 0, 17], scale: SCALE },

  // --- Machining Center (Right Side) ---
  // Vertical CNCs arranged in rows
  { file: '立式CNC.glb', position: [31.8, 0, -14.5], rotation: [0, -Math.PI / 2, 0], scale: SCALE, label: 'V-CNC 1' },
  { file: '立式CNC.glb', position: [31.8, 0, -9], rotation: [0, -Math.PI / 2, 0], scale: SCALE, label: 'V-CNC 2' },
  { file: '立式CNC.glb', position: [31.8, 0, -2.5], rotation: [0, -Math.PI / 2, 0], scale: SCALE, label: 'V-CNC 2' },
  { file: '立式CNC.glb', position: [31.8, 0, 3], rotation: [0, -Math.PI / 2, 0], scale: SCALE, label: 'V-CNC 2' },
  { file: '立式CNC.glb', position: [31.8, 0, 8.5], rotation: [0, -Math.PI / 2, 0], scale: SCALE, label: 'V-CNC 2' },

  { file: '中型cnc装配体.glb', position: [0, 1, -15], rotation: [0, -Math.PI / 2, 0], scale: SCALE, label: 'M-CNC 1' },
  // { file: 'zn20109a.0000000_立式加工中心ga-v918c.glb', position: [25, 0, -5], rotation: [0, -Math.PI / 2, 0], scale: SCALE, label: 'GA-V918C' },

  // Lathes area
  { file: '小车床-0632.glb', position: [-17, 0, -24.8], rotation: [0, Math.PI, 0], scale: SCALE, label: 'Lathe S' },
  { file: '小车床-0632.glb', position: [-20, 0, -24.8], rotation: [0, Math.PI, 0], scale: SCALE, label: 'Lathe S' },
  { file: '数控车床sy-双轴车床装配体.glb', position: [0, 2.5, -10], rotation: [0, Math.PI, 0], scale: SCALE, label: 'Lathe Dual' },

  // Drilling area
  { file: '全自动钻床.glb', position: [-24, 0.9, -25], rotation: [0, Math.PI, 0], scale: SCALE, label: 'Auto Drill' },
  { file: '全自动钻床.glb', position: [-26.4, 0.9, -25], rotation: [0, Math.PI, 0], scale: SCALE, label: 'Auto Drill' },

  { file: '大型钻攻中心.glb', position: [0, -2.5, -1], rotation: [0, Math.PI, 0], scale: SCALE * 2, label: 'Drill Center' },

  // --- Central Heavy Machinery ---
  // The large Gantry CNC in the middle
  { file: '龙门cnc.glb', position: [11, 0, -5.7], rotation: [0, 0, 0], scale: SCALE, label: 'Gantry CNC' },

  // --- Assembly & Inspection (Middle/Left) ---
  // Workbenches
  { file: 'gzt-工作台2.glb', position: [-33, 0.4, 4], scale: SCALE, label: 'Workbench 1' },
  { file: 'gzt-工作台2.glb', position: [-33, 0.4, 7], scale: SCALE, label: 'Workbench 1' },
  { file: 'gzt-工作台2.glb', position: [-33, 0.4, 10], scale: SCALE, label: 'Workbench 1' },
  { file: 'gzt-工作台2.glb', position: [-33, 0.4, 13], scale: SCALE, label: 'Workbench 1' },
  { file: 'gzt-工作台2.glb', position: [-33, 0.4, 16], scale: SCALE, label: 'Workbench 1' },

  { file: 'gzt-工作台2.glb', position: [-20, 0.4, 8], scale: SCALE, label: 'Workbench 1' },
  { file: 'gzt-工作台2.glb', position: [-20, 0.4, 11], scale: SCALE, label: 'Workbench 1' },
  { file: 'gzt-工作台2.glb', position: [-20, 0.4, 14], scale: SCALE, label: 'Workbench 1' },
  { file: 'gzt-工作台2.glb', position: [-20, 0.4, 17], scale: SCALE, label: 'Workbench 1' },

  { file: 'gzt-工作台2.glb', position: [-33, 0.4, -3], scale: SCALE, label: 'Workbench 1' },
  { file: 'gzt-工作台2.glb', position: [-33, 0.4, -6], scale: SCALE, label: 'Workbench 1' },
  { file: 'gzt-工作台2.glb', position: [-33, 0.4, -9], scale: SCALE, label: 'Workbench 1' },
  { file: 'gzt-工作台2.glb', position: [-33, 0.4, -12], scale: SCALE, label: 'Workbench 1' },
  { file: 'gzt-工作台2.glb', position: [-33, 0.4, -15], scale: SCALE, label: 'Workbench 1' },


  { file: 'gzt-工作台2.glb', position: [-20, 0.4, -21.7], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Workbench 1' },
  { file: 'gzt-工作台2.glb', position: [-23, 0.4, -21.7], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Workbench 1' },
  { file: 'gzt-工作台2.glb', position: [-26, 0.4, -21.7], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Workbench 1' },

  { file: '办公桌-sus02-00工作台装配.glb', rotation: [Math.PI / 2, 0, 0], position: [18, 0.8, -22], scale: SCALE, label: 'Station 2' },
  { file: '办公桌-sus02-00工作台装配.glb', rotation: [Math.PI / 2, 0, 0], position: [19.2, 0.8, -22], scale: SCALE, label: 'Station 2' },
  { file: '办公桌-sus02-00工作台装配.glb', rotation: [Math.PI / 2, 0, 0], position: [20.4, 0.8, -22], scale: SCALE, label: 'Station 2' },
  { file: '办公桌-sus02-00工作台装配.glb', rotation: [Math.PI / 2, 0, 0], position: [21.6, 0.8, -22], scale: SCALE, label: 'Station 2' },

  { file: '办公桌-sus02-00工作台装配.glb', rotation: [Math.PI / 2, 0, Math.PI], position: [20.6, 0.8, -21.8], scale: SCALE, label: 'Station 2' },
  { file: '办公桌-sus02-00工作台装配.glb', rotation: [Math.PI / 2, 0, Math.PI], position: [19.4, 0.8, -21.8], scale: SCALE, label: 'Station 2' },
  { file: '办公桌-sus02-00工作台装配.glb', rotation: [Math.PI / 2, 0, Math.PI], position: [18.2, 0.8, -21.8], scale: SCALE, label: 'Station 2' },
  { file: '办公桌-sus02-00工作台装配.glb', rotation: [Math.PI / 2, 0, Math.PI], position: [17, 0.8, -21.8], scale: SCALE, label: 'Station 2' },

  { file: 'zn20109a.0000000_立式加工中心ga-v918c.glb', position: [20.4, 2, -8.3], scale: SCALE, label: 'Rack Assy' },
  { file: 'zn20109a.0000000_立式加工中心ga-v918c.glb', position: [20.4, 2, -13.3], scale: SCALE, label: 'Rack Assy' },

  { file: '数控车床sy-双轴车床装配体.glb', position: [20.4, 2, -12.9], scale: SCALE, label: 'Rack Assy' },
  { file: '数控车床sy-双轴车床装配体.glb', position: [20.4, 2, -16.3], scale: SCALE, label: 'Rack Assy' },
  
  // { file: 'dk-机架装配.glb', position: [20.4, -4, -6], rotation: [(Math.PI / 2) * 3, 0, Math.PI], scale: SCALE, label: 'Rack Assy' },

  { file: '台面1700-3400.glb', position: [-18, 0.8, 5.8], scale: SCALE, label: 'Table L' },
  { file: '台面1700-3400.glb', position: [-22, 0.8, 5.8], scale: SCALE, label: 'Table L' },

  // Inspection
  { file: 's三坐标机.glb', position: [-2.8, 0, 5.2], scale: SCALE, label: 'CMM' },
  { file: 's三坐标机.glb', position: [-2.8, 0, 8], scale: SCALE, label: 'CMM' },
  { file: 's三坐标机.glb', position: [-2.8, 0, 10.8], scale: SCALE, label: 'CMM' },

  { file: '1000-2000-重型货架.glb', position: [-4.8, 3.5, 12.8], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'Shelf A1' },

  // { file: '研磨机220.glb', position: [10, 0, 15], scale: SCALE, label: 'Grinder' },

  // --- Logistics ---
  // AGV moving in the aisle
  { file: '_01_agv堆垛车.glb', position: [0, 0.1, -8], rotation: [Math.PI / 2, 0, 0], scale: SCALE, label: 'AGV',
    animatePath: {
        waypoints: [
            { x: -20, y: 0.8, z: 1.7 }, // A
            { x: -1, y: 0.8, z: 1.7 },  // B
            { x: 11, y: 0.8, z: 1.7 }   // C
        ],
        duration: 10,
        pathType: 'ping-pong',
        autoRotate: true,
        turnDuration: 1.5
    }
   },
];

const ModelItem: React.FC<{ config: ModelConfig }> = ({ config }) => {
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
             
             // Important: autoRotate calculates rotation based on the PATH.
             // When going backwards, the path vector is opposite, so autoRotate will naturally flip the object 180 degrees instantly to face the path.
             // This conflicts with our manual turn.
             // Solution: For the return trip, we want the object to face the path, but since we manually turned it 180,
             // and the path is reversed, autoRotate might just work if we rely on it.
             
             // BUT, MotionPathPlugin's autoRotate is tricky with continuous timelines.
             // Let's try explicitly setting start/end rotations or just trusting motionPath to handle the orientation if we give it the right path.
             
             tl.to(groupRef.current.position, {
                 motionPath: {
                     path: reversedWaypoints,
                     curviness: 0.5,
                     autoRotate: true, 
                     // autoRotate: 90 // Optional offset if model is facing wrong way
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
    
    // Auto-center the "Factory Floor" model only
    if (config.file === '车间大平面.glb') {
        const box = new Box3().setFromObject(clone);
        const center = box.getCenter(new Vector3());
        
        // Offset the model so its center is at (0,0,0) of its local group (X/Z only)
        clone.position.x -= center.x;
        clone.position.z -= center.z;
        // Do not offset Y, to keep the floor at its original height (usually 0)
        // clone.position.sub(center);
        
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

const FactoryScene: React.FC = () => {
  return (
    <>
      {/* <ambientLight intensity={0.5} /> */}
      {/* <directionalLight position={[20, 30, 20]} intensity={1.5} castShadow /> */}
      <pointLight position={[-10, 10, -10]} intensity={0.5} />
      
      <group scale={SCENE_SCALE}>
        {/* Debug Helpers */}
        <axesHelper args={[100]} />

        {FACTORY_LAYOUT.map((config, index) => (
          <ModelItem key={`${config.file}-${index}`} config={config} />
        ))}
      </group>

      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.2} />
      {/* 
        Environment provides IBL (Image Based Lighting) for realistic reflections and lighting.
        Use local HDR file to avoid fetch errors in production
      */}
      <Environment files="./models/factory/potsdamer_platz_1k.hdr" />
    </>
  );
};

// Preload models
const UNIQUE_FILES = Array.from(new Set(FACTORY_LAYOUT.map(c => c.file)));
UNIQUE_FILES.forEach(file => useGLTF.preload(`./models/factory/${file}`));

export default FactoryScene;
