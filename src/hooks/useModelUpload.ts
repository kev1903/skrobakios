import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Model3D, UploadFormData } from '@/components/mapbox/types';

// Geocode address to coordinates
const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-mapbox-token');
    if (error || !data?.token) {
      console.error('Failed to get Mapbox token for geocoding');
      return null;
    }

    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${data.token}&limit=1`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const geocodeData = await response.json();
    
    if (geocodeData.features && geocodeData.features.length > 0) {
      const [lng, lat] = geocodeData.features[0].center;
      return [lng, lat];
    }
    
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

export const useModelUpload = (
  onModelUploaded: (model: Model3D) => void,
  onModelsRefresh: (models: Model3D[]) => void,
  currentProject?: { id: string; project_id: string; name: string; location?: string } | null
) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFormData, setUploadFormData] = useState<UploadFormData>({
    name: '',
    description: '',
    address: '',
    file: null
  });
  const { toast } = useToast();

  const handleFileUpload = async () => {
    if (!uploadFormData.file || !uploadFormData.name || !uploadFormData.address) {
      toast({
        title: "Missing Information", 
        description: "Please fill in all required fields and select a file.",
        variant: "destructive"
      });
      return;
    }

    // Check file type
    const fileExt = uploadFormData.file.name.split('.').pop()?.toLowerCase();
    const supportedFormats = ['ifc', 'gltf', 'glb'];
    
    if (!fileExt || !supportedFormats.includes(fileExt)) {
      toast({
        title: "Unsupported File Format",
        description: "Please upload an IFC, GLTF, or GLB file.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      console.log('Starting file upload process...');
      
      // Create FormData for the edge function
      const formData = new FormData();
      formData.append('file', uploadFormData.file);
      formData.append('name', uploadFormData.name);
      formData.append('description', uploadFormData.description);
      formData.append('address', uploadFormData.address);
      if (currentProject?.id) {
        formData.append('projectId', currentProject.id);
      }

      // Call the upload-3d-model edge function
      const { data, error } = await supabase.functions.invoke('upload-3d-model', {
        body: formData,
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to upload model');
      }

      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      console.log('Model uploaded successfully:', data.model);
      
      // Success notification
      toast({
        title: "Model Uploaded Successfully!",
        description: data.message || `"${uploadFormData.name}" has been placed on the map.`
      });

      // Clear the form but keep the project address if available
      setUploadFormData({
        name: '',
        description: '',
        address: currentProject?.location || '',
        file: null
      });

      // Refresh the available models list
      const { data: refreshedModels } = await supabase
        .from('model_3d')
        .select('*')
        .order('created_at', { ascending: false });

      if (refreshedModels) {
        const formattedModels: Model3D[] = refreshedModels.map(model => ({
          id: model.id,
          name: model.name,
          description: model.description,
          file_url: model.file_url,
          coordinates: model.coordinates && typeof model.coordinates === 'object' && 'x' in model.coordinates && 'y' in model.coordinates 
            ? [model.coordinates.x as number, model.coordinates.y as number] 
            : [145.032000, -37.820300],
          scale: model.scale || 1.0,
          rotation_x: model.rotation_x || Math.PI / 2,
          rotation_y: model.rotation_y || 0,
          rotation_z: model.rotation_z || 0,
          elevation: model.elevation || 0
        }));

        onModelsRefresh(formattedModels);
        
        // Automatically switch to the newly uploaded model
        const newModel = data.model;
        if (newModel) {
          onModelUploaded(newModel);
        }
      }

      // Special handling for IFC files
      if (fileExt === 'ifc') {
        toast({
          title: "IFC File Processed",
          description: "IFC file has been processed and placed on the map. Conversion to glTF format completed.",
          variant: "default"
        });
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'An unexpected error occurred during upload.',
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    uploadFormData,
    setUploadFormData,
    handleFileUpload
  };
};