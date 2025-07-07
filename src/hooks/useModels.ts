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
      console.log('Loading 3D models...');
      try {
        const { data: models, error } = await supabase
          .from('model_3d')
          .select('*')
          .order('created_at', { ascending: false });

        console.log('Raw models from database:', models);

        if (error) {
          console.error('Error loading 3D models:', error);
          setError('Failed to load 3D models from database');
          return;
        }

        if (!models || models.length === 0) {
          setError('No 3D models available. Please upload a model first.');
          return;
        }

        const formattedModels: Model3D[] = models.map(model => {
          console.log('Processing model:', model.name, 'coordinates:', model.coordinates);
          
          // Parse coordinates from PostgreSQL point format
          let coordinates: [number, number] = [145.032000, -37.820300]; // Default
          
          if (model.coordinates) {
            if (typeof model.coordinates === 'object' && 'x' in model.coordinates && 'y' in model.coordinates) {
              // Object format {x: number, y: number}
              coordinates = [model.coordinates.x as number, model.coordinates.y as number];
            } else if (typeof model.coordinates === 'string') {
              // String format like "(145.056633,-37.791865)"
              const match = model.coordinates.match(/\(([^,]+),([^)]+)\)/);
              if (match) {
                coordinates = [parseFloat(match[1]), parseFloat(match[2])];
              }
            }
          }
          
          console.log('Parsed coordinates for', model.name, ':', coordinates);
          
          return {
            id: model.id,
            name: model.name,
            description: model.description,
            file_url: model.file_url,
            coordinates,
            scale: model.scale || 0.5,
            rotation_x: model.rotation_x || Math.PI / 2,
            rotation_y: model.rotation_y || 0,
            rotation_z: model.rotation_z || 0,
            elevation: model.elevation || 1.5
          };
        });

        console.log('Formatted models:', formattedModels);
        setAvailableModels(formattedModels);
        
        // Select model: use provided modelId, or first available model
        const selectedModel = modelId 
          ? formattedModels.find(m => m.id === modelId) || formattedModels[0]
          : formattedModels[0];
        
        console.log('Selected model:', selectedModel);
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

  const removeModel = async (modelId: string) => {
    try {
      const { error } = await supabase
        .from('model_3d')
        .delete()
        .eq('id', modelId);

      if (error) {
        console.error('Error removing model:', error);
        setError('Failed to remove model');
        return;
      }

      // Update local state
      const updatedModels = availableModels.filter(model => model.id !== modelId);
      setAvailableModels(updatedModels);
      
      // If the removed model was the current model, select the first available model
      if (currentModel?.id === modelId) {
        setCurrentModel(updatedModels.length > 0 ? updatedModels[0] : null);
      }
    } catch (err) {
      console.error('Error removing model:', err);
      setError('Failed to remove model');
    }
  };

  return {
    availableModels,
    currentModel,
    setCurrentModel,
    error,
    refreshModels,
    removeModel
  };
};