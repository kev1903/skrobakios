import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log(`${req.method} ${req.url}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing environment variables' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    console.log('Supabase client initialized');

    // Parse FormData
    let formData;
    try {
      formData = await req.formData();
      console.log('FormData parsed successfully');
    } catch (parseError) {
      console.error('Failed to parse FormData:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid request format. Expected multipart/form-data.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const address = formData.get('address') as string;
    const projectId = formData.get('projectId') as string;

    console.log('Form data extracted:', {
      fileName: file?.name,
      fileSize: file?.size,
      name,
      description: description ? 'provided' : 'empty',
      address,
      projectId: projectId || 'none'
    });

    if (!file || !name || !address) {
      console.error('Missing required fields:', { hasFile: !!file, name, address });
      return new Response(
        JSON.stringify({ error: 'Missing required fields: file, name, and address are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Processing model upload: ${name} for project ${projectId || 'standalone'}`);
    console.log(`File type: ${file.type}, Size: ${file.size} bytes`);
    console.log(`Address: ${address}`);

    // Step 1: Geocode the address to get coordinates
    let coordinates = [145.032000, -37.820300]; // Default coordinates (Melbourne)
    try {
      console.log('Starting geocoding for address:', address);
      const geocodeResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            'User-Agent': 'Lovable-3D-Model-Upload/1.0'
          }
        }
      );
      
      if (!geocodeResponse.ok) {
        console.error('Geocoding API error:', geocodeResponse.status, geocodeResponse.statusText);
      } else {
        const geocodeData = await geocodeResponse.json();
        console.log('Geocoding response:', geocodeData);
        
        if (geocodeData && geocodeData.length > 0) {
          coordinates = [parseFloat(geocodeData[0].lon), parseFloat(geocodeData[0].lat)];
          console.log(`Geocoded coordinates: ${coordinates}`);
        } else {
          console.log('No geocoding results found, using default coordinates');
        }
      }
    } catch (geocodeError) {
      console.error('Geocoding error:', geocodeError);
      console.log('Using default coordinates due to geocoding error');
    }

    // Step 2: Determine file processing based on file type
    let processedFile = file;
    let finalFileName = name;
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    console.log('File extension detected:', fileExtension);

    if (fileExtension === 'ifc') {
      console.log('IFC file detected, will store as-is (conversion placeholder)');
      finalFileName = name.replace(/\.[^/.]+$/, '') + '.ifc';
    } else if (['gltf', 'glb'].includes(fileExtension || '')) {
      console.log('glTF/glb file detected, using directly');
      finalFileName = name + '.' + fileExtension;
    } else {
      console.error('Unsupported file format:', fileExtension);
      return new Response(
        JSON.stringify({ error: 'Unsupported file format. Please upload IFC, glTF, or glb files.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Step 3: Upload file to Supabase Storage
    const fileName = `${Date.now()}_${finalFileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    console.log(`Uploading file to storage: ${fileName}`);
    
    const fileBuffer = await processedFile.arrayBuffer();
    console.log(`File buffer size: ${fileBuffer.byteLength} bytes`);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('3d-models')
      .upload(fileName, fileBuffer, {
        contentType: processedFile.type || 'application/octet-stream',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to upload file to storage',
          details: uploadError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('File uploaded successfully:', uploadData);

    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('3d-models')
      .getPublicUrl(fileName);

    console.log('Public URL generated:', urlData.publicUrl);

    // Step 4: Save model metadata to database
    const modelData = {
      name: name,
      description: description || null,
      file_url: urlData.publicUrl,
      coordinates: {
        x: coordinates[0],
        y: coordinates[1]
      },
      scale: fileExtension === 'ifc' ? 0.1 : 1.0, // IFC models often need smaller scale
      rotation_x: Math.PI / 2, // Default rotation for typical model orientation
      rotation_y: 0,
      rotation_z: 0,
      elevation: 0,
      file_size: file.size,
      project_id: projectId || null
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

      return new Response(
        JSON.stringify({ 
          error: 'Failed to save model metadata to database',
          details: dbError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Model saved to database successfully:', dbData.id);

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
        ? 'IFC model uploaded successfully and ready for 3D visualization.' 
        : 'Model uploaded and placed successfully on the map.'
    };

    console.log('Upload completed successfully for model:', dbData.id);
    
    return new Response(
      JSON.stringify(responseData),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in upload-3d-model function:', error);
    console.error('Error stack:', error.stack);
    
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