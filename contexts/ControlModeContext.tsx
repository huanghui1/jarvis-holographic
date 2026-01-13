import React, { createContext, useContext, useState, ReactNode } from 'react';

type ControlMode = 'orbit' | 'character';

interface ControlModeContextType {
  controlMode: ControlMode;
  toggleControlMode: () => void;
  setControlMode: (mode: ControlMode) => void;
}

const ControlModeContext = createContext<ControlModeContextType | undefined>(undefined);

export const ControlModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [controlMode, setControlModeState] = useState<ControlMode>('orbit');

  const toggleControlMode = () => {
    setControlModeState(prev => prev === 'orbit' ? 'character' : 'orbit');
  };

  const setControlMode = (mode: ControlMode) => {
    setControlModeState(mode);
  };

  return (
    <ControlModeContext.Provider value={{ controlMode, toggleControlMode, setControlMode }}>
      {children}
    </ControlModeContext.Provider>
  );
};

export const useControlMode = () => {
  const context = useContext(ControlModeContext);
  if (!context) {
    throw new Error('useControlMode must be used within a ControlModeProvider');
  }
  return context;
};
