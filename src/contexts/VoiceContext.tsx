
import React, { createContext, useContext, ReactNode } from 'react';

interface VoiceContextType {
  isActive: boolean;
  startListening: () => void;
  stopListening: () => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};

interface VoiceProviderProps {
  children: ReactNode;
}

export const VoiceProvider: React.FC<VoiceProviderProps> = ({ children }) => {
  const startListening = () => {
    console.log('Voice listening started');
  };

  const stopListening = () => {
    console.log('Voice listening stopped');
  };

  const value = {
    isActive: false,
    startListening,
    stopListening,
  };

  return (
    <VoiceContext.Provider value={value}>
      {children}
    </VoiceContext.Provider>
  );
};
