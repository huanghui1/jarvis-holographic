import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { HandTrackingState } from '../types';

interface HandTrackingContextType {
  isTrackingEnabled: boolean;
  toggleTracking: () => void;
  setTrackingEnabled: (enabled: boolean) => void;
  handTrackingRef: React.MutableRefObject<HandTrackingState>;
}

export const HandTrackingContext = createContext<HandTrackingContextType | undefined>(undefined);

export const HandTrackingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(false);
  
  // Use a ref for high-frequency updates to avoid re-renders
  const handTrackingRef = useRef<HandTrackingState>({
    leftHand: null,
    rightHand: null
  });

  const toggleTracking = useCallback(() => {
    setIsTrackingEnabled(prev => !prev);
  }, []);

  const setTrackingEnabled = useCallback((enabled: boolean) => {
    setIsTrackingEnabled(enabled);
  }, []);

  // Reset tracking state when disabled
  useEffect(() => {
    if (!isTrackingEnabled) {
      handTrackingRef.current = {
        leftHand: null,
        rightHand: null
      };
    }
  }, [isTrackingEnabled]);

  return (
    <HandTrackingContext.Provider value={{ 
      isTrackingEnabled, 
      toggleTracking, 
      setTrackingEnabled,
      handTrackingRef 
    }}>
      {children}
    </HandTrackingContext.Provider>
  );
};

export const useHandTracking = () => {
  const context = useContext(HandTrackingContext);
  if (!context) {
    throw new Error('useHandTracking must be used within a HandTrackingProvider');
  }
  return context;
};
