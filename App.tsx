
import React, { useRef, useState, useCallback, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Perf } from 'r3f-perf';
import { useProgress, Html } from '@react-three/drei';
import VideoFeed from './components/VideoFeed';
// import HolographicFactory from './components/HolographicFactory';
import FactoryScene from './components/FactoryScene';
import HUDOverlay from './components/HUDOverlay';
import JarvisIntro from './components/JarvisIntro';
import { WorkshopDetailModal } from './components/WorkshopDetailModal';
import { HandTrackingState, RegionName } from './types';
import { SoundService } from './services/soundService';
import { HashRouter, Routes, Route } from 'react-router-dom';

// Error Boundary for React Components
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("React Error Boundary Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 text-red-500 p-10 font-mono">
          <div>
            <h1 className="text-2xl font-bold mb-4">COMPONENT ERROR</h1>
            <p>{this.state.error?.message}</p>
            <pre className="mt-4 text-xs opacity-70 overflow-auto max-h-96">
              {this.state.error?.stack}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Loading Indicator
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-[#00F0FF] font-mono text-xl text-center bg-black/80 p-4 rounded border border-[#00F0FF]">
        LOADING SYSTEM ASSETS...<br/>
        {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

const MainApp: React.FC = () => {
  const handTrackingRef = useRef<HandTrackingState>({
    leftHand: null,
    rightHand: null
  });

  const [currentRegion, setCurrentRegion] = useState<RegionName>(RegionName.ASIA);
  const [booted, setBooted] = useState(false);
  const [introActive, setIntroActive] = useState(false);
  const [bootStep, setBootStep] = useState(0);

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState<string | null>(null);

  const { progress } = useProgress();

  const handleTrackingUpdate = useCallback((newState: HandTrackingState) => {
    handTrackingRef.current = newState;
  }, []);

  const handleWorkshopClick = useCallback((workshopName: string) => {
      setSelectedWorkshop(workshopName);
      setDetailModalOpen(true);
      SoundService.playLock(); // Additional feedback
  }, []);

  // Boot Sequence Logic
  const startSystem = () => {
    SoundService.initialize();
    SoundService.playBlip(); // Immediate feedback
    SoundService.playBootSequence();
    
    // Start boot sequence
    setBootStep(1); 
  };

  // Watch for loading progress to advance boot step
  useEffect(() => {
    if (bootStep === 1 && progress >= 100) {
        // Models loaded, advance to next steps
        setTimeout(() => setBootStep(2), 500); // Brief pause before next step
        setTimeout(() => setBootStep(3), 1500); // Authentication
        
        // After text logs, show Jarvis Intro
        setTimeout(() => {
            setIntroActive(true);
            SoundService.speak("你好，欢迎来到无锡奥达工业");
            
            // After Intro, show main app
            setTimeout(() => {
                 setIntroActive(false);
                 setBooted(true);
                 SoundService.playAmbientHum();
            }, 3500); // Intro duration
        }, 2200); // Boot text logs duration
    }
  }, [bootStep, progress]);

  const isElectron = /Electron/.test(navigator.userAgent);

  // If using file:// protocol (Electron production), ensure paths are relative or use HashRouter if we were using routing.
  // Since this is a single page app without router, we just need to ensure assets are loaded correctly.
  
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden animate-flash">
      {/* 1. Background Camera Layer */}
      <VideoFeed onTrackingUpdate={handleTrackingUpdate} />

      {/* 2. 3D Scene Layer (Earth) - Always rendered to ensure loading starts */}
      <div className="absolute inset-0 z-10">
        <ErrorBoundary>
          <Canvas 
              camera={{ position: [0, 5, 15], fov: 45 }} 
              gl={{ alpha: true, antialias: true, logarithmicDepthBuffer: true }}
              dpr={[1, 1.5]}
          >
                <Perf position="top-left" deepAnalyze={true} />
                <Suspense fallback={<Loader />}>
                   <FactoryScene />
                </Suspense>
            </Canvas>
        </ErrorBoundary>
      </div>

      {/* 3. UI/HUD Layer - Only visible when booted */}
      {booted && !introActive && (
          <HUDOverlay 
            handTrackingRef={handTrackingRef} 
            currentRegion={currentRegion}
          />
      )}
      
      {/* 4. Overlay Modals */}
      <WorkshopDetailModal 
         isOpen={detailModalOpen} 
         onClose={() => setDetailModalOpen(false)} 
         workshopName={selectedWorkshop}
      />

      {/* 5. Boot Screen Overlay */}
      {!booted && !introActive && (
          <div className="absolute inset-0 z-50 bg-black text-holo-cyan font-mono flex flex-col items-center justify-center overflow-hidden">
              <div className="scanlines opacity-20"></div>
              
              {/* Background geometric elements */}
              <div className="absolute w-[600px] h-[600px] border border-gray-800 rounded-full animate-spin-slow opacity-30"></div>
              <div className="absolute w-[400px] h-[400px] border border-dashed border-klein-blue rounded-full animate-spin-reverse-slow opacity-30"></div>
              
              {bootStep === 0 && (
                  <button 
                    onClick={startSystem}
                    className="z-10 group relative px-8 py-4 bg-transparent border border-holo-cyan text-holo-cyan font-display font-bold tracking-[0.3em] text-xl hover:bg-holo-cyan/10 transition-all duration-300 cursor-pointer"
                  >
                    <div className="absolute inset-0 w-full h-full border border-holo-cyan blur-[2px] opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    初始化 MES 系统
                  </button>
              )}

              {bootStep >= 1 && (
                  <div className="z-10 flex flex-col items-center gap-4 w-96">
                      <div className="text-2xl font-display font-bold animate-pulse">
                          {bootStep === 1 && "系统启动中..."}
                          {bootStep === 2 && "加载神经网络..."}
                          {bootStep === 3 && "身份验证中..."}
                      </div>
                      <div className="w-full h-1 bg-gray-800 rounded overflow-hidden">
                          <div 
                            className="h-full bg-holo-cyan shadow-[0_0_10px_#00F0FF] transition-all duration-300 ease-out"
                            style={{ width: bootStep === 1 ? `${progress}%` : bootStep === 2 ? '60%' : '100%' }}
                          ></div>
                      </div>
                      <div className="text-xs text-gray-500 h-20 overflow-hidden w-full text-center leading-tight">
                          {bootStep >= 1 && <div> 内存分配检查... 完成</div>}
                          {bootStep === 1 && <div className="text-holo-cyan"> 模型资源加载: {progress.toFixed(0)}%</div>}
                          {bootStep >= 1 && progress >= 100 && <div> GPU 委托... 已分配</div>}
                          {bootStep >= 2 && <div> 加载 MEDIA_PIPE.WASM...</div>}
                          {bootStep >= 2 && <div> 连接卫星信号...</div>}
                          {bootStep >= 3 && <div> 视网膜扫描... 已绕过</div>}
                          {bootStep >= 3 && <div className="text-green-500"> 访问被允许</div>}
                      </div>
                  </div>
              )}
              
              <div className="absolute bottom-8 text-[10px] text-gray-600">奥达工业 专有技术</div>
          </div>
      )}

      {/* 6. Intro Screen Overlay */}
      {introActive && (
          <div className="absolute inset-0 z-50 bg-black">
             <JarvisIntro />
          </div>
      )}

    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainApp />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
