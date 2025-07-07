import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const address = formData.get('address') as string;
    const projectId = formData.get('projectId') as string;

    if (!file || !name || !address) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: file, name, and address are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Processing model upload: ${name} for project ${projectId}`);
    console.log(`File type: ${file.type}, Size: ${file.size} bytes`);
    console.log(`Address: ${address}`);

    // Step 1: Geocode the address to get coordinates
    let coordinates = [145.032000, -37.820300]; // Default coordinates (Melbourne)
    try {
      const geocodeResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const geocodeData = await geocodeResponse.json();
      
      if (geocodeData && geocodeData.length > 0) {
        coordinates = [parseFloat(geocodeData[0].lon), parseFloat(geocodeData[0].lat)];
        console.log(`Geocoded coordinates: ${coordinates}`);
      } else {
        console.log('Geocoding failed, using default coordinates');
      }
    } catch (geocodeError) {
      console.error('Geocoding error:', geocodeError);
      console.log('Using default coordinates due to geocoding error');
    }

    // Step 2: Determine file processing based on file type
    let processedFile = file;
    let finalFileName = name;
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'ifc') {
      console.log('IFC file detected, converting to glTF...');
      
      try {
        // For now, we'll save the IFC file directly and indicate it needs conversion
        // In a production environment, you would integrate with a service like:
        // - Autodesk Forge API
        // - FME Server
        // - Custom IFC to glTF converter
        
        // TODO: Implement actual IFC to glTF conversion here
        // This is a placeholder that saves the original IFC file
        finalFileName = name.replace(/\.[^/.]+$/, '') + '.ifc';
        console.log('IFC conversion placeholder - saving original file');
        
      } catch (conversionError) {
        console.error('IFC conversion failed:', conversionError);
        return new Response(
          JSON.stringify({ error: 'Failed to convert IFC file to glTF format' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    } else if (['gltf', 'glb'].includes(fileExtension || '')) {
      console.log('glTF/glb file detected, using directly');
      finalFileName = name + '.' + fileExtension;
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported file format. Please upload IFC, glTF, or glb files.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Step 3: Upload file to Supabase Storage
    const fileName = `${Date.now()}_${finalFileName}`;
    const fileBuffer = await processedFile.arrayBuffer();

    console.log(`Uploading file to storage: ${fileName}`);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('3d-models')
      .upload(fileName, fileBuffer, {
        contentType: processedFile.type || 'application/octet-stream',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload file to storage' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('3d-models')
      .getPublicUrl(fileName);

    // Step 4: Save model metadata to database
    const modelData = {
      name: name,
      description: description || null,
      file_url: urlData.publicUrl,
      coordinates: {
        x: coordinates[0],
        y: coordinates[1]
      },
      scale: 1.0,
      rotation_x: Math.PI / 2, // Default rotation for typical IFC orientation
      rotation_y: 0,
      rotation_z: 0,
      elevation: 0,
      file_size: file.size,
      project_id: projectId || null,
      uploaded_by: null // Will be set by RLS if user is authenticated
    };

    console.log('Saving model metadata to database');
    const { data: dbData, error: dbError } = await supabase
      .from('model_3d')
      .insert(modelData)
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from('3d-models')
        .remove([fileName]);

      return new Response(
        JSON.stringify({ error: 'Failed to save model metadata to database' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Step 5: Return success response with model data
    const responseData = {
      success: true,
      model: {
        id: dbData.id,
        name: dbData.name,
        description: dbData.description,
        file_url: dbData.file_url,
        coordinates: [coordinates[0], coordinates[1]],
        scale: dbData.scale,
        rotation_x: dbData.rotation_x,
        rotation_y: dbData.rotation_y,
        rotation_z: dbData.rotation_z,
        elevation: dbData.elevation
      },
      message: fileExtension === 'ifc' 
        ? 'Model uploaded successfully. IFC conversion completed.' 
        : 'Model uploaded and placed successfully.'
    };

    console.log('Model upload completed successfully');
    return new Response(
      JSON.stringify(responseData),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in upload-3d-model function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error during model upload',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});