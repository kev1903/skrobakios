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
  onModelsRefresh: (models: Model3D[]) => void
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
      // First, geocode the address to get precise coordinates
      const coordinates = await geocodeAddress(uploadFormData.address);
      if (!coordinates) {
        toast({
          title: "Address Not Found",
          description: "Could not locate the specified address. Please verify the address and try again.",
          variant: "destructive"
        });
        setIsUploading(false);
        return;
      }

      // Upload file to Supabase storage
      const fileName = `${Date.now()}_${uploadFormData.name.replace(/\s+/g, '_')}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('3d-models')
        .upload(fileName, uploadFormData.file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('3d-models')
        .getPublicUrl(fileName);

      if (!urlData.publicUrl) {
        throw new Error('Failed to get file URL');
      }

      // For IFC files, we'll store the URL but note that it needs conversion
      let processedFileUrl = urlData.publicUrl;
      let processingNote = '';

      if (fileExt === 'ifc') {
        processingNote = 'IFC file uploaded - conversion to GLTF may be needed for 3D visualization';
        // In a production environment, you would convert IFC to GLTF here
        // For now, we'll store the IFC file and show a placeholder or use a sample model
      }

      // Insert model metadata into database
      const { data: modelData, error: modelError } = await supabase
        .from('model_3d')
        .insert({
          name: uploadFormData.name,
          description: uploadFormData.description + (processingNote ? ` (${processingNote})` : ''),
          file_url: processedFileUrl,
          coordinates: `(${coordinates[0]},${coordinates[1]})`, // PostgreSQL POINT format: (x,y)
          scale: fileExt === 'ifc' ? 0.1 : 1.0, // IFC models are often larger scale
          rotation_x: Math.PI / 2, // Default rotation for architectural models
          rotation_y: 0,
          rotation_z: 0,
          elevation: 0, // Ground level placement
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (modelError) {
        throw new Error(`Database error: ${modelError.message}`);
      }

      // Success notification
      toast({
        title: "Model Uploaded Successfully!",
        description: `"${uploadFormData.name}" has been placed at ${uploadFormData.address} on the map.`
      });

      // Clear the form
      setUploadFormData({
        name: '',
        description: '',
        address: '',
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
        const newModel = formattedModels.find(m => m.id === modelData.id);
        if (newModel) {
          onModelUploaded(newModel);
        }
      }

      // Special handling for IFC files
      if (fileExt === 'ifc') {
        toast({
          title: "IFC File Processing",
          description: "IFC file uploaded successfully. For full 3D visualization, consider converting to GLTF format.",
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