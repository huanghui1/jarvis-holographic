export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface HandInteractionData {
  landmarks: Landmark[];
  handedness: 'Left' | 'Right';
  gesture?: string;
  pinchDistance?: number; // Normalized 0-1
  isPinching: boolean;
  expansionFactor: number; // 0 (Fist) to 1 (Open Palm)
  rotationControl: { x: number, y: number }; // -1 to 1 for both axes (Joystick style)
}

export interface HandTrackingState {
  leftHand: HandInteractionData | null;
  rightHand: HandInteractionData | null;
}

export enum RegionName {
  AMERICAS = "一号车间-总装",
  PACIFIC = "二号车间-冲压",
  ASIA = "三号车间-涂装",
  EUROPE = "四号车间-动力",
  AFRICA = "全厂监控视图"
}

export interface PanelPosition {
  x: number;
  y: number;
}

declare module '*.task' {
  const url: string;
  export default url;
}

declare module '*.task?url' {
  const url: string;
  export default url;
}
