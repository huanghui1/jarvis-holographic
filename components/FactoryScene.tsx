import React, { useMemo, useRef, useEffect } from 'react';
import { useGLTF, OrbitControls, Environment, Text, Billboard, Instances, Instance } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Box3, Vector3, Group, Mesh, MeshStandardMaterial, Color, FrontSide } from 'three';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { HandTrackingState } from '../types';

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
  // { file: '龙门cnc.glb', position: [11, 0, -5.7], rotation: [0, 0, 0], scale: SCALE, label: 'Gantry CNC' },
  { file: '龙门cnc4.glb', position: [11, 0, -5.7], rotation: [0, 0, 0], scale: SCALE, label: 'Gantry CNC' },

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

const InstancedModels: React.FC<{ file: string; instances: ModelConfig[] }> = ({ file, instances }) => {
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
    <group>
      {meshData.map((item, i) => (
        <Instances key={i} range={instances.length} geometry={item.geometry} material={item.material}>
            {instances.map((config, j) => (
              <Instance
                key={j}
                position={config.position}
                rotation={config.rotation}
                scale={config.scale || 1}
              />
            ))}
        </Instances>
      ))}
    </group>
  );
};

// Gesture Controller Component
const GestureController: React.FC<{ 
  handTrackingRef?: React.MutableRefObject<HandTrackingState>;
  controlsRef: React.MutableRefObject<any>;
  isModalOpen?: boolean;
  onWorkshopClick?: (name: string) => void;
}> = ({ handTrackingRef, controlsRef, isModalOpen, onWorkshopClick }) => {
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
    console.log('isModalOpenRef: ', isModalOpenRef.current);
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

const FactoryScene: React.FC<{ 
  handTrackingRef?: React.MutableRefObject<HandTrackingState>;
  isModalOpen?: boolean;
  onWorkshopClick?: (name: string) => void;
}> = ({ handTrackingRef, isModalOpen, onWorkshopClick }) => {
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
      <Environment files="./assets/potsdamer_platz_1k.hdr" />
    </>
  );
};

// Preload models
const UNIQUE_FILES = Array.from(new Set(FACTORY_LAYOUT.map(c => c.file)));
UNIQUE_FILES.forEach(file => useGLTF.preload(`./models/factory/${file}`));

export default FactoryScene;
