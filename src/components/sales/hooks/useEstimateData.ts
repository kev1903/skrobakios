import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useEstimate } from './useEstimate';

interface EstimatePageData {
  estimateTitle: string;
  projectType: string;
  isLoading: boolean;
  estimateId: string | undefined;
}

export const useEstimateData = (propEstimateId?: string): EstimatePageData => {
  const { estimateId: paramEstimateId } = useParams<{ estimateId: string }>();
  const estimateId = propEstimateId || paramEstimateId;
  
  const [estimateTitle, setEstimateTitle] = useState('');
  const [projectType, setProjectType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loadEstimate } = useEstimate();

  useEffect(() => {
    if (!estimateId) return;
    
    const loadData = async () => {
      setIsLoading(true);
      try {
        const { estimate } = await loadEstimate(estimateId);
        setEstimateTitle(estimate.estimate_name || 'Untitled Estimate');
        setProjectType(estimate.notes || 'No project type set');
      } catch (error) {
        console.error('Failed to load estimate data:', error);
        setEstimateTitle('Error loading estimate');
        setProjectType('Error loading project type');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [estimateId, loadEstimate]);

  return {
    estimateTitle,
    projectType,
    isLoading,
    estimateId
  };
};