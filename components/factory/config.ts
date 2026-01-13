
// Define the scale for converting mm to meters (assuming models are in mm)
// Try 1.0 first to see if models appear, 0.001 might be too small if models are already in meters
export const SCALE = 1; 
// Global scene scale to adjust the size of the entire factory
export const SCENE_SCALE = 0.2; 

export interface ModelConfig {
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
export const FACTORY_LAYOUT: ModelConfig[] = [
  // --- Infrastructure ---
  // The main floor
  { file: '车间大平面.glb', position: [0, 0, 0], scale: SCALE, label: '生产车间' },

  // --- Storage Area (Left Side) ---
  // Rows of heavy duty shelves
  // { file: '1000-2000-重型货架.glb', position: [-18, 3.5, -17], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: '1000-2000-重型货架' },
  // { file: '1000-2000-重型货架.glb', position: [-18, 3.5, -12], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: '1000-2000-重型货架' },
  // { file: '1000-2850-重型货架.glb', position: [-18, 3.5, -7], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: '1000-2850-重型货架' },
  // { file: '1000-2850-重型货架.glb', position: [-18, 3.5, -2], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: '1000-2850-重型货架' },

  // { file: '1000-2000-重型货架.glb', position: [-14, 3.5, -17], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: '1000-2000-重型货架' },
  // { file: '1000-2000-重型货架.glb', position: [-14, 3.5, -12], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: '1000-2000-重型货架' },
  // { file: '1000-2850-重型货架.glb', position: [-14, 3.5, -7], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: '1000-2850-重型货架' },
  // { file: '1000-2850-重型货架.glb', position: [-14, 3.5, -2], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: '1000-2850-重型货架' },

  // { file: '1000-2000-重型货架.glb', position: [-21.8, 3.5, -17], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: '1000-2000-重型货架' },
  // { file: '1000-2000-重型货架.glb', position: [-21.8, 3.5, -12], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: '1000-2000-重型货架' },
  // { file: '1000-2850-重型货架.glb', position: [-21.8, 3.5, -7], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: '1000-2850-重型货架' },
  // { file: '1000-2850-重型货架.glb', position: [-21.8, 3.5, -2], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: '1000-2850-重型货架' },

  // { file: '1000-2000-重型货架.glb', position: [-35.8, 3.5, -17], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: '1000-2000-重型货架' },
  // { file: '1000-2000-重型货架.glb', position: [-35.8, 3.5, -12], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: '1000-2000-重型货架' },
  // { file: '1000-2850-重型货架.glb', position: [-35.8, 3.5, -7], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: '1000-2850-重型货架' },
  // { file: '1000-2850-重型货架.glb', position: [-35.8, 3.5, -2], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: '1000-2850-重型货架' },

  // { file: '1000-2000-重型货架.glb', position: [-35.8, 3.5, 4], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: '1000-2000-重型货架' },
  // { file: '1000-2000-重型货架.glb', position: [-35.8, 3.5, 8], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: '1000-2000-重型货架' },
  // { file: '1000-2850-重型货架.glb', position: [-35.8, 3.5, 12], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: '1000-2850-重型货架' },
  // { file: '1000-2850-重型货架.glb', position: [-35.8, 3.5, 17], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: '1000-2850-重型货架' },

  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [-24, 0.1, 8.6], scale: SCALE, label: '1000-1000-1000-1100-115-1.0川字托盘' },
  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [-24, 0.1, 9.6], scale: SCALE, label: '1000-1000-1000-1100-115-1.0川字托盘' },
  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [-24, 0.1, 10.6], scale: SCALE, label: '1000-1000-1000-1100-115-1.0川字托盘' },
  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [-24, 0.1, 11.6], scale: SCALE, label: '1000-1000-1000-1100-115-1.0川字托盘' },
  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [-24, 0.1, 12.6], scale: SCALE, label: '1000-1000-1000-1100-115-1.0川字托盘' },
  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [-24, 0.1, 14.6], scale: SCALE, label: '1000-1000-1000-1100-115-1.0川字托盘' },
  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [-24, 0.1, 15.6], scale: SCALE, label: '1000-1000-1000-1100-115-1.0川字托盘' },
  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [-24, 0.1, 16.6], scale: SCALE, label: '1000-1000-1000-1100-115-1.0川字托盘' },
  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [-24, 0.1, 17.6], scale: SCALE, label: '1000-1000-1000-1100-115-1.0川字托盘' },

  // { file: '1000-2000-重型货架.glb', position: [-20.8, 3.5, 4], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: '1000-2000-重型货架' },
  // { file: '1000-2000-重型货架.glb', position: [-20.8, 3.5, 8], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: '1000-2000-重型货架' },
  // { file: '1000-2850-重型货架.glb', position: [-20.8, 3.5, 12], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: '1000-2850-重型货架' },
  // { file: '1000-2850-重型货架.glb', position: [-20.8, 3.5, 17], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: '1000-2850-重型货架' },

  // { file: '1000-2000-重型货架.glb', position: [-14.8, 3.5, 4], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: '1000-2000-重型货架' },
  // { file: '1000-2000-重型货架.glb', position: [-14.8, 3.5, 8], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: '1000-2000-重型货架' },
  // { file: '1000-2850-重型货架.glb', position: [-14.8, 3.5, 12], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: '1000-2850-重型货架' },
  // { file: '1000-2850-重型货架.glb', position: [-14.8, 3.5, 17], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: '1000-2850-重型货架' },

  // { 
  //   file: '600-1500-货架装配体.glb', 
  //   position: [-20, 0, -10], 
  //   rotation: [0, Math.PI / 2, 0], 
  //   scale: SCALE, 
  //   label: '600-1500-货架装配体'
  // },
  
  // // Pallets nearby
  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [9, 0, 8], scale: SCALE },
  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [9, 0, 9], scale: SCALE },
  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [10, 0, 8], scale: SCALE },
  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [10, 0, 9], scale: SCALE },
  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [11, 0, 8], scale: SCALE },
  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [11, 0, 9], scale: SCALE },
  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [12, 0, 8], scale: SCALE },
  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [12, 0, 9], scale: SCALE },

  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [9, 0, 12], scale: SCALE },
  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [9, 0, 13], scale: SCALE },
  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [10, 0, 12], scale: SCALE },
  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [10, 0, 13], scale: SCALE },
  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [11, 0, 12], scale: SCALE },
  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [11, 0, 13], scale: SCALE },
  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [12, 0, 12], scale: SCALE },
  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [12, 0, 13], scale: SCALE },

  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [9, 0, 16], scale: SCALE },
  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [9, 0, 17], scale: SCALE },
  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [10, 0, 16], scale: SCALE },
  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [10, 0, 17], scale: SCALE },
  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [11, 0, 16], scale: SCALE },
  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [11, 0, 17], scale: SCALE },
  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [12, 0, 16], scale: SCALE },
  // { file: '1000-1000-1000-1100-115-1.0川字托盘.glb', position: [12, 0, 17], scale: SCALE },

  // --- Machining Center (Right Side) ---
  // Vertical CNCs arranged in rows
  // { file: '立式CNC.glb', position: [31.8, 0, -14.5], rotation: [0, -Math.PI / 2, 0], scale: SCALE, label: '立式CNC' },
  // { file: '立式CNC.glb', position: [31.8, 0, -9], rotation: [0, -Math.PI / 2, 0], scale: SCALE, label: '立式CNC' },
  // { file: '立式CNC.glb', position: [31.8, 0, -2.5], rotation: [0, -Math.PI / 2, 0], scale: SCALE, label: '立式CNC' },
  // { file: '立式CNC.glb', position: [31.8, 0, 3], rotation: [0, -Math.PI / 2, 0], scale: SCALE, label: '立式CNC' },
  // { file: '立式CNC.glb', position: [31.8, 0, 8.5], rotation: [0, -Math.PI / 2, 0], scale: SCALE, label: '立式CNC' },

  // { file: '中型cnc装配体.glb', position: [0, 1, -15], rotation: [0, -Math.PI / 2, 0], scale: SCALE, label: '中型cnc装配体' },

  // Lathes area
  // { file: '小车床-0632.glb', position: [-17, 0, -24.8], rotation: [0, Math.PI, 0], scale: SCALE, label: '小车床-0632' },
  // { file: '小车床-0632.glb', position: [-20, 0, -24.8], rotation: [0, Math.PI, 0], scale: SCALE, label: '小车床-0632' },
  // { file: '数控车床sy-双轴车床装配体.glb', position: [0, 2.5, -10], rotation: [0, Math.PI, 0], scale: SCALE, label: '数控车床sy-双轴车床装配体' },

  // Drilling area
  // { file: '全自动钻床.glb', position: [-24, 0.9, -25], rotation: [0, Math.PI, 0], scale: SCALE, label: '全自动钻床' },
  // { file: '全自动钻床.glb', position: [-26.4, 0.9, -25], rotation: [0, Math.PI, 0], scale: SCALE, label: '全自动钻床' },

  { file: '大型钻攻中心.glb', position: [0, -2.2, -1], rotation: [0, Math.PI, 0], scale: SCALE * 2, label: '大型钻攻中心' },

  // --- Central Heavy Machinery ---
  // The large Gantry CNC in the middle
  { file: '龙门cnc4.glb', position: [11, 0.8, -5.7], rotation: [0, 0, 0], scale: SCALE, label: '龙门cnc4' },

  // --- Assembly & Inspection (Middle/Left) ---
  // Workbenches
  // { file: 'gzt-工作台2.glb', position: [-33, 0.4, 4], scale: SCALE, label: 'gzt-工作台2' },
  // { file: 'gzt-工作台2.glb', position: [-33, 0.4, 7], scale: SCALE, label: 'gzt-工作台2' },
  // { file: 'gzt-工作台2.glb', position: [-33, 0.4, 10], scale: SCALE, label: 'gzt-工作台2' },
  // { file: 'gzt-工作台2.glb', position: [-33, 0.4, 13], scale: SCALE, label: 'gzt-工作台2' },
  // { file: 'gzt-工作台2.glb', position: [-33, 0.4, 16], scale: SCALE, label: 'gzt-工作台2' },

  // { file: 'gzt-工作台2.glb', position: [-20, 0.4, 8], scale: SCALE, label: 'gzt-工作台2' },
  // { file: 'gzt-工作台2.glb', position: [-20, 0.4, 11], scale: SCALE, label: 'gzt-工作台2' },
  // { file: 'gzt-工作台2.glb', position: [-20, 0.4, 14], scale: SCALE, label: 'gzt-工作台2' },
  // { file: 'gzt-工作台2.glb', position: [-20, 0.4, 17], scale: SCALE, label: 'gzt-工作台2' },

  // { file: 'gzt-工作台2.glb', position: [-33, 0.4, -3], scale: SCALE, label: 'gzt-工作台2' },
  // { file: 'gzt-工作台2.glb', position: [-33, 0.4, -6], scale: SCALE, label: 'gzt-工作台2' },
  // { file: 'gzt-工作台2.glb', position: [-33, 0.4, -9], scale: SCALE, label: 'gzt-工作台2' },
  // { file: 'gzt-工作台2.glb', position: [-33, 0.4, -12], scale: SCALE, label: 'gzt-工作台2' },
  // { file: 'gzt-工作台2.glb', position: [-33, 0.4, -15], scale: SCALE, label: 'gzt-工作台2' },


  // { file: 'gzt-工作台2.glb', position: [-20, 0.4, -21.7], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'gzt-工作台2' },
  // { file: 'gzt-工作台2.glb', position: [-23, 0.4, -21.7], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'gzt-工作台2' },
  // { file: 'gzt-工作台2.glb', position: [-26, 0.4, -21.7], rotation: [0, Math.PI / 2, 0], scale: SCALE, label: 'gzt-工作台2' },

  // { file: '办公桌-sus02-00工作台装配.glb', rotation: [Math.PI / 2, 0, 0], position: [18, 0.8, -22], scale: SCALE, label: '办公桌-sus02-00工作台装配' },
  // { file: '办公桌-sus02-00工作台装配.glb', rotation: [Math.PI / 2, 0, 0], position: [19.2, 0.8, -22], scale: SCALE, label: '办公桌-sus02-00工作台装配' },
  // { file: '办公桌-sus02-00工作台装配.glb', rotation: [Math.PI / 2, 0, 0], position: [20.4, 0.8, -22], scale: SCALE, label: '办公桌-sus02-00工作台装配' },
  // { file: '办公桌-sus02-00工作台装配.glb', rotation: [Math.PI / 2, 0, 0], position: [21.6, 0.8, -22], scale: SCALE, label: '办公桌-sus02-00工作台装配' },

  // { file: '办公桌-sus02-00工作台装配.glb', rotation: [Math.PI / 2, 0, Math.PI], position: [20.6, 0.8, -21.8], scale: SCALE, label: '办公桌-sus02-00工作台装配' },
  // { file: '办公桌-sus02-00工作台装配.glb', rotation: [Math.PI / 2, 0, Math.PI], position: [19.4, 0.8, -21.8], scale: SCALE, label: '办公桌-sus02-00工作台装配' },
  // { file: '办公桌-sus02-00工作台装配.glb', rotation: [Math.PI / 2, 0, Math.PI], position: [18.2, 0.8, -21.8], scale: SCALE, label: '办公桌-sus02-00工作台装配' },
  // { file: '办公桌-sus02-00工作台装配.glb', rotation: [Math.PI / 2, 0, Math.PI], position: [17, 0.8, -21.8], scale: SCALE, label: '办公桌-sus02-00工作台装配' },

  // { file: 'zn20109a.0000000_立式加工中心ga-v918c.glb', position: [20.4, 2, -8.3], scale: SCALE, label: 'zn20109a.0000000_立式加工中心ga-v918c' },
  // { file: 'zn20109a.0000000_立式加工中心ga-v918c.glb', position: [20.4, 2, -13.3], scale: SCALE, label: 'zn20109a.0000000_立式加工中心ga-v918c' },

  // { file: '数控车床sy-双轴车床装配体.glb', position: [20.4, 2, -12.9], scale: SCALE, label: '数控车床sy-双轴车床装配体' },
  // { file: '数控车床sy-双轴车床装配体.glb', position: [20.4, 2, -16.3], scale: SCALE, label: '数控车床sy-双轴车床装配体' },
  

  // { file: '台面1700-3400.glb', position: [-18, 0.8, 5.8], scale: SCALE, label: '台面1700-3400' },
  // { file: '台面1700-3400.glb', position: [-22, 0.8, 5.8], scale: SCALE, label: '台面1700-3400' },

  // Inspection
  // { file: 's三坐标机12.glb', position: [-2.8, 0, 5.2], scale: SCALE, label: 's三坐标机' },
  // { file: 's三坐标机12.glb', position: [-2.8, 0, 8], scale: SCALE, label: 's三坐标机' },
  // { file: 's三坐标机12.glb', position: [-2.8, 0, 10.8], scale: SCALE, label: 's三坐标机' },

  // --- Logistics ---
  // AGV moving in the aisle
  // { file: '_01_agv堆垛车.glb', position: [0, 0.1, -8], rotation: [Math.PI / 2, 0, 0], scale: SCALE, label: '_01_agv堆垛车',
  //   animatePath: {
  //       waypoints: [
  //           { x: -20, y: 0.8, z: 1.7 }, // A
  //           { x: -1, y: 0.8, z: 1.7 },  // B
  //           { x: 11, y: 0.8, z: 1.7 }   // C
  //       ],
  //       duration: 10,
  //       pathType: 'ping-pong',
  //       autoRotate: true,
  //       turnDuration: 1.5
  //   }
  //  },
];
