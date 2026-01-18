import React from 'react';
import { HandTrackingState } from '../types';
import { TimeWidget } from './HUDWidgets';
import { useHandTracking } from '../contexts/HandTrackingContext';
import { useControlMode } from '../contexts/ControlModeContext';

interface HUDOverlayProps {
  isModalOpen?: boolean;
  onCloseModal?: () => void;
}

// --- Sub-Components for Static HUD Elements ---

const CircularGauge = React.memo(({ label, value, color = "text-holo-cyan" }: { label: string, value: string, color?: string }) => (
  <div className="relative w-32 h-32 flex items-center justify-center">
    {/* Outer Static Ring */}
    <div className={`absolute inset-0 border-2 ${color} opacity-30 rounded-full border-t-transparent border-l-transparent -rotate-45`}></div>
    {/* Inner Spinning Ring */}
    <div className={`absolute inset-2 border-2 ${color} opacity-60 rounded-full border-b-transparent border-r-transparent animate-spin-slow`}></div>
    {/* Core Value */}
    <div className="flex flex-col items-center">
      <span className={`text-2xl font-display font-bold ${color} drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]`}>{value}</span>
      <span className="text-[10px] uppercase tracking-widest opacity-70">{label}</span>
    </div>
  </div>
));

const VisualsFrame = React.memo(() => (
  <div className="relative w-48 border border-holo-cyan/40 p-1 bg-black/20 backdrop-blur-sm">
    {/* Corner Accents */}
    <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-holo-cyan"></div>
    <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-holo-cyan"></div>
    <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-holo-cyan"></div>
    
    <div className="flex justify-between items-center mb-1 px-1">
       <span className="text-[8px] uppercase text-holo-cyan tracking-widest">Visuals</span>
       <div className="flex gap-0.5">
          <div className="w-1 h-1 bg-holo-cyan"></div>
          <div className="w-1 h-1 bg-holo-cyan/50"></div>
       </div>
    </div>
    {/* Chart Container */}
    {/* <div className="h-24 w-full border border-white/10 p-1">
       <EnergyChart />
    </div> */}
  </div>
));

const ArcReactorWidget = React.memo(() => (
  <div className="relative w-40 h-40 flex items-center justify-center">
      {/* Outer Thick Ring */}
      <div className="absolute inset-0 border-4 border-holo-cyan/20 rounded-full"></div>
      {/* Middle Rotating Ring */}
      <div className="absolute inset-2 border-[6px] border-transparent border-t-holo-cyan/40 border-l-holo-cyan/40 rounded-full animate-spin-slow"></div>
      {/* Inner Fast Ring */}
      <div className="absolute inset-8 border-2 border-dashed border-white/30 rounded-full animate-spin-reverse-slow"></div>
      {/* Center Core */}
      <div className="absolute w-12 h-12 bg-holo-cyan/10 rounded-full border border-holo-cyan flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)]">
          <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
      </div>
  </div>
));

const HUDOverlay: React.FC<HUDOverlayProps> = ({ isModalOpen }) => {
  const { handTrackingRef, isTrackingEnabled, toggleTracking } = useHandTracking();
  const { controlMode, toggleControlMode } = useControlMode();

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden font-sans text-holo-cyan select-none z-[9999]">
      <div className="vignette"></div>
      <div className="scanlines z-10 opacity-50"></div>

      {/* --- TOP HEADER --- */}
      
      {/* Top Left: System Load Chart (Isolated) */}
      {/* <HexDumpWidget /> */}

      {/* Top Right: Title & Clock */}
      <div className="absolute top-8 right-8 z-30 text-right">
        <h1 className="text-7xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-holo-blue drop-shadow-[0_0_15px_rgba(0,240,255,0.9)] tracking-tighter">
          奥达工业
        </h1>
        <TimeWidget />
      </div>
      
      {/* Center Screen: Holographic Table */}
      {/* <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto">
          <HolographicTable />
      </div> */}




      {/* --- LEFT SIDE PANELS --- */}

      {/* Left Panel 1: Power/Storage Gauge (Moved to Right) */}


      {/* Left Panel 2: File Explorer (Bottom Left) */}
      <div className="absolute bottom-24 left-8 z-30">
           {/* Atmosphere Widget (Moved from Right) */}
           <div className="flex flex-col items-center gap-2 mb-8">
                <div className="text-[10px] uppercase tracking-[0.2em] text-holo-cyan/70 border-b border-holo-cyan/30 pb-1 w-full text-center">Atmosphere</div>
                <ArcReactorWidget />
                <div className="flex justify-between w-full px-2 text-[8px] font-mono text-holo-cyan/50">
                    <span>O2: 98%</span>
                    <span>TEMP: 24°C</span>
                </div>
           </div>

           <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Directory</div>
           {/* <FileTreeWidget /> */}
           
           {/* Status Widget below tree */}
           <div className="mt-8 bg-black/60 border-t border-l border-holo-blue p-4 rounded-tr-xl backdrop-blur-md w-64 relative pointer-events-auto">
                <div className="absolute top-0 right-0 w-2 h-2 bg-holo-cyan shadow-[0_0_10px_#00F0FF]"></div>
                <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-2">
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest">手势识别输入</div>
                    <button 
                        onClick={toggleTracking}
                        className={`text-[10px] px-2 py-0.5 border ${isTrackingEnabled ? 'border-holo-cyan text-holo-cyan shadow-[0_0_5px_#00F0FF]' : 'border-red-500 text-red-500'} uppercase hover:bg-white/10 transition-colors pointer-events-auto`}
                    >
                        {isTrackingEnabled ? '已启用' : '已禁用'}
                    </button>
                </div>
                
                {isTrackingEnabled ? (
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-holo-cyan text-sm font-bold">左手操控模组</span>
                            <span className={`text-xs px-2 rounded ${handTrackingRef.current.leftHand ? 'bg-holo-cyan text-black' : 'bg-red-900/50 text-red-500'}`}>
                                {handTrackingRef.current.leftHand ? '在线' : '离线'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-holo-cyan text-sm font-bold">右手交互模组</span>
                            <span className={`text-xs px-2 rounded ${handTrackingRef.current.rightHand ? 'bg-holo-cyan text-black' : 'bg-red-900/50 text-red-500'}`}>
                                {handTrackingRef.current.rightHand ? '在线' : '离线'}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="py-2 text-center text-red-500/80 text-xs tracking-wider uppercase border border-red-900/30 bg-red-900/10">
                        系统离线 / 手势追踪关闭
                    </div>
                )}
           </div>

           {/* --- Roaming Control UI --- */}
           <div className="mt-4 pointer-events-auto z-40 flex flex-col items-start gap-4">
              <button 
                 onClick={toggleControlMode}
                 className="px-4 py-1.5 bg-black/50 backdrop-blur-md text-cyan-400 border border-cyan-400 rounded-sm font-mono hover:bg-cyan-900/50 transition-all uppercase tracking-widest text-xs shadow-[0_0_10px_rgba(0,255,255,0.3)]"
              >
                 {controlMode === 'orbit' ? '[ 启用漫游模式 ]' : '[ 退出漫游模式 ]'}
              </button>
              
              {controlMode === 'character' && (
                  <div className="text-cyan-400 font-mono text-[10px] text-left text-shadow-glow bg-black/30 p-2 rounded backdrop-blur-sm border border-cyan-900/50">
                     <div>W/A/S/D 移动</div>
                     <div>SHIFT 加速</div>
                  </div>
              )}
           </div>
      </div>


      {/* --- RIGHT SIDE PANELS --- */}

      {/* Right Panel 1: Visuals Frame (Top Right, below title) */}
      {/* <div className="absolute right-10 top-40 z-30">
          <VisualsFrame />
      </div> */}

      {/* Right Panel 2: Combined Right Column (Gauges) */}
      <div className="absolute right-16 bottom-64 z-30 flex flex-col gap-8 items-center">
           {/* Power/Storage Gauges */}
           <div className="flex flex-col gap-8">
              <CircularGauge label="生产效率" value="74%" />
              <CircularGauge label="生产订单" value="98%" color="text-holo-blue" />
           </div>
      </div>
    </div>
  );
};

export default HUDOverlay;
