import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { useEstimate } from '../hooks/useEstimate';
import type { EstimateData } from '../hooks/useEstimate';
import type { Trade } from '../hooks/useTrades';
import type { DrawingFile } from '../hooks/useMultiplePDFUpload';

interface EstimationSettings {
  projectDuration: number;
  escalationRate: number;
  preliminariesPercentage: number;
  contingencyPercentage: number;
  buildersMarginPercentage: number;
  gstRate: number;
}

interface EstimateContextType {
  estimate: EstimateData | null;
  trades: Trade[];
  drawings: DrawingFile[];
  estimateTitle: string;
  projectType: string;
  isLoading: boolean;
  estimateId: string | undefined;
  estimationSettings: EstimationSettings;
  loadEstimateData: (id: string) => Promise<void>;
  updateEstimateTitle: (title: string) => void;
  updateProjectType: (type: string) => void;
  updateEstimationSettings: (settings: Partial<EstimationSettings>) => void;
}

const EstimateContext = createContext<EstimateContextType | null>(null);

interface EstimateProviderProps {
  children: ReactNode;
  estimateId?: string;
}

export const EstimateProvider = ({ children, estimateId: propEstimateId }: EstimateProviderProps) => {
  const { estimateId: paramEstimateId } = useParams<{ estimateId: string }>();
  const estimateId = propEstimateId || paramEstimateId;
  
  const [estimate, setEstimate] = useState<EstimateData | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [drawings, setDrawings] = useState<DrawingFile[]>([]);
  const [estimateTitle, setEstimateTitle] = useState('');
  const [projectType, setProjectType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [estimationSettings, setEstimationSettings] = useState<EstimationSettings>({
    projectDuration: 12,
    escalationRate: 3,
    preliminariesPercentage: 10,
    contingencyPercentage: 10,
    buildersMarginPercentage: 15,
    gstRate: 10,
  });
  
  const { loadEstimate } = useEstimate();

  const loadEstimateData = async (id: string) => {
    if (!id || isLoading) return;
    
    setIsLoading(true);
    try {
      const { estimate: loadedEstimate, trades: loadedTrades, drawings: loadedDrawings } = await loadEstimate(id);
      setEstimate(loadedEstimate);
      setTrades(loadedTrades);
      setDrawings(loadedDrawings);
      setEstimateTitle(loadedEstimate.estimate_name || '');
      setProjectType(loadedEstimate.notes || '');
    } catch (error) {
      console.error('Failed to load estimate data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateEstimateTitle = (title: string) => {
    setEstimateTitle(title);
  };

  const updateProjectType = (type: string) => {
    setProjectType(type);
  };

  const updateEstimationSettings = (settings: Partial<EstimationSettings>) => {
    setEstimationSettings(prev => ({ ...prev, ...settings }));
  };

  useEffect(() => {
    if (estimateId && !estimate) {
      loadEstimateData(estimateId);
    }
  }, [estimateId]);

  const value: EstimateContextType = {
    estimate,
    trades,
    drawings,
    estimateTitle,
    projectType,
    isLoading,
    estimateId,
    estimationSettings,
    loadEstimateData,
    updateEstimateTitle,
    updateProjectType,
    updateEstimationSettings,
  };

  return (
    <EstimateContext.Provider value={value}>
      {children}
    </EstimateContext.Provider>
  );
};

export const useEstimateContext = () => {
  const context = useContext(EstimateContext);
  if (!context) {
    throw new Error('useEstimateContext must be used within an EstimateProvider');
  }
  return context;
};