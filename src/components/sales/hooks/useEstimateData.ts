import { useEstimateContext } from '../context/EstimateContext';

interface EstimatePageData {
  estimateTitle: string;
  projectType: string;
  isLoading: boolean;
  estimateId: string | undefined;
}

export const useEstimateData = (): EstimatePageData => {
  const { estimateTitle, projectType, isLoading, estimateId } = useEstimateContext();

  return {
    estimateTitle,
    projectType,
    isLoading,
    estimateId
  };
};