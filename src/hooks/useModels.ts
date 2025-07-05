import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Model3D } from '@/components/mapbox/types';

export const useModels = (modelId?: string) => {
  const [availableModels, setAvailableModels] = useState<Model3D[]>([]);
  const [currentModel, setCurrentModel] = useState<Model3D | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load available 3D models from database
  useEffect(() => {
    const loadModels = async () => {
      try {
        const { data: models, error } = await supabase
          .from('model_3d')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading 3D models:', error);
          setError('Failed to load 3D models from database');
          return;
        }

        if (!models || models.length === 0) {
          setError('No 3D models available. Please upload a model first.');
          return;
        }

        const formattedModels: Model3D[] = models.map(model => ({
          id: model.id,
          name: model.name,
          description: model.description,
          file_url: model.file_url,
          coordinates: model.coordinates && typeof model.coordinates === 'object' && 'x' in model.coordinates && 'y' in model.coordinates 
            ? [model.coordinates.x as number, model.coordinates.y as number] 
            : [145.032000, -37.820300],
          scale: model.scale || 0.5,
          rotation_x: model.rotation_x || Math.PI / 2,
          rotation_y: model.rotation_y || 0,
          rotation_z: model.rotation_z || 0,
          elevation: model.elevation || 1.5
        }));

        setAvailableModels(formattedModels);
        
        // Select model: use provided modelId, or first available model
        const selectedModel = modelId 
          ? formattedModels.find(m => m.id === modelId) || formattedModels[0]
          : formattedModels[0];
        
        setCurrentModel(selectedModel);
      } catch (err) {
        console.error('Error loading models:', err);
        setError('Failed to load 3D models');
      }
    };

    loadModels();
  }, [modelId]);

  const refreshModels = (models: Model3D[]) => {
    setAvailableModels(models);
  };

  return {
    availableModels,
    currentModel,
    setCurrentModel,
    error,
    refreshModels
  };
};