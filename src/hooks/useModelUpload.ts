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

      // Upload file directly to Supabase Storage
      const fileName = `${Date.now()}_${uploadFormData.name.replace(/[^a-zA-Z0-9.-]/g, '_')}.${fileExt}`;
      console.log(`Uploading file to storage: ${fileName}`);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('3d-models')
        .upload(fileName, uploadFormData.file, {
          contentType: uploadFormData.file.type || 'application/octet-stream',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('File uploaded successfully to storage');

      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('3d-models')
        .getPublicUrl(fileName);

      if (!urlData.publicUrl) {
        throw new Error('Failed to get file URL');
      }

      console.log('Got public URL:', urlData.publicUrl);
      // Save model metadata to database
      const modelData = {
        name: uploadFormData.name,
        description: uploadFormData.description || null,
        file_url: urlData.publicUrl,
        coordinates: `(${coordinates[0]},${coordinates[1]})`, // PostgreSQL POINT format
        scale: fileExt === 'ifc' ? 0.1 : 1.0, // IFC models often need smaller scale
        rotation_x: Math.PI / 2, // Default rotation for architectural models
        rotation_y: 0,
        rotation_z: 0,
        elevation: 0, // Ground level placement
        file_size: uploadFormData.file.size,
        project_id: currentProject?.id || null,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id
      };

      console.log('Saving model metadata to database:', modelData);
      
      const { data: dbData, error: dbError } = await supabase
        .from('model_3d')
        .insert(modelData)
        .select()
        .single();

      if (dbError) {
        console.error('Database insert error:', dbError);
        
        // Clean up uploaded file if database insert fails
        try {
          await supabase.storage
            .from('3d-models')
            .remove([fileName]);
          console.log('Cleaned up uploaded file after database error');
        } catch (cleanupError) {
          console.error('Failed to cleanup file:', cleanupError);
        }

        throw new Error(`Database error: ${dbError.message}`);
      }

      console.log('Model saved to database successfully:', dbData.id);

      // Create the model object for the response
      const newModel = {
        id: dbData.id,
        name: dbData.name,
        description: dbData.description,
        file_url: dbData.file_url,
        coordinates: coordinates,
        scale: dbData.scale,
        rotation_x: dbData.rotation_x,
        rotation_y: dbData.rotation_y,
        rotation_z: dbData.rotation_z,
        elevation: dbData.elevation
      };

      // Success notification
      const successMessage = fileExt === 'ifc' 
        ? `IFC model "${uploadFormData.name}" uploaded and ready for 3D visualization!`
        : `Model "${uploadFormData.name}" uploaded and placed successfully on the map!`;
        
      toast({
        title: "Model Uploaded Successfully!",
        description: successMessage
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
        onModelUploaded(newModel);
      }

      // Special handling for IFC files
      if (fileExt === 'ifc') {
        toast({
          title: "IFC File Processed",
          description: "IFC file uploaded and positioned on the map. 3D visualization is ready!",
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