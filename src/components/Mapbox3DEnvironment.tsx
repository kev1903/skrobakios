import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Eye, EyeOff, Loader2, Navigation, Home, Upload, MapPin, Minus, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Model3D {
  id: string;
  name: string;
  description: string;
  file_url: string;
  coordinates: [number, number];
  scale: number;
  rotation_x: number;
  rotation_y: number;
  rotation_z: number;
  elevation: number;
}

interface Mapbox3DEnvironmentProps {
  onNavigate: (page: string) => void;
  modelId?: string;
  className?: string;
}

export const Mapbox3DEnvironment = ({ 
  onNavigate,
  modelId,
  className = ""
}: Mapbox3DEnvironmentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModel, setShowModel] = useState(true);
  const [modelLayer, setModelLayer] = useState<any>(null);
  const [currentModel, setCurrentModel] = useState<Model3D | null>(null);
  const [availableModels, setAvailableModels] = useState<Model3D[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    name: '',
    description: '',
    address: '',
    file: null as File | null
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { toast } = useToast();

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

  useEffect(() => {
    if (!currentModel) return;

    const initializeMap = async () => {
      if (!mapContainer.current) return;

      try {
        // Fetch Mapbox token from edge function
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          console.error('Error fetching Mapbox token:', error);
          setError('Failed to load map configuration');
          setIsLoading(false);
          return;
        }

        if (!data?.token) {
          setError('Mapbox token not available');
          setIsLoading(false);
          return;
        }

        // Initialize map with fetched token and your custom style
        mapboxgl.accessToken = data.token;
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/kevin19031994/cmcprh4kj009w01sqbfig9lx6', // Your custom style
          projection: 'mercator',
          zoom: 18, // Close zoom to see the 3D model clearly
          center: currentModel.coordinates,
          pitch: 60, // Angled view to see 3D model better
          bearing: 30,
          antialias: true // Enable antialiasing for better 3D rendering
        });

        // Add navigation controls
        map.current.addControl(
          new mapboxgl.NavigationControl({
            visualizePitch: true,
          }),
          'top-right'
        );

        // Add fullscreen control
        map.current.addControl(new mapboxgl.FullscreenControl(), 'bottom-right');

        // Wait for map style to load before adding 3D layer
        map.current.on('style.load', () => {
          console.log('Map style loaded, adding 3D layer...');
          add3DModelLayer();
          setIsLoading(false);
        });

      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to initialize map');
        setIsLoading(false);
      }
    };

    // Custom 3D Layer for Three.js integration with Mapbox
    const add3DModelLayer = () => {
      if (!map.current) return;

      setIsModelLoading(true);

      // Create custom layer that integrates Three.js with Mapbox GL JS
      const customLayer: mapboxgl.CustomLayerInterface = {
        id: '3d-model',
        type: 'custom',
        renderingMode: '3d',
        
        // Called when the layer is added to the map
        onAdd: function(map, gl) {
          console.log('Adding 3D layer to map...');
          
          // Initialize Three.js scene
          this.camera = new THREE.Camera();
          this.scene = new THREE.Scene();

          // Add comprehensive lighting to the scene
          const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
          directionalLight.position.set(0, -70, 100).normalize();
          directionalLight.castShadow = true;
          this.scene.add(directionalLight);

          const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
          this.scene.add(ambientLight);

          // Add additional point light for better model illumination
          const pointLight = new THREE.PointLight(0xffffff, 0.8, 100);
          pointLight.position.set(50, 50, 50);
          pointLight.castShadow = true;
          this.scene.add(pointLight);

          // Initialize Three.js renderer with Mapbox GL context
          this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl,
            antialias: true
          });

          // Configure renderer settings
          this.renderer.autoClear = false;
          this.renderer.shadowMap.enabled = true;
          this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

          // Load GLTF model using Three.js GLTFLoader
          const loader = new GLTFLoader();
          console.log('Starting to load 3D model from:', currentModel.file_url);
          console.log('Model details:', currentModel);
          
          // Check if this is an IFC file
          const isIFCFile = currentModel.file_url.toLowerCase().includes('.ifc');
          
          if (isIFCFile) {
            console.log('IFC file detected - using placeholder model for visualization');
            // For IFC files, use a placeholder/sample model until conversion is implemented
            const placeholderModelUrl = 'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf';
            
            loader.load(
              placeholderModelUrl,
              (gltf) => {
                console.log('Placeholder model loaded for IFC file');
                this.model = gltf.scene;
                
                // Set initial scale (smaller for IFC placeholder)
                this.model.scale.set(currentModel.scale * 0.5, currentModel.scale * 0.5, currentModel.scale * 0.5);
                
                // Set rotation 
                this.model.rotation.x = currentModel.rotation_x;
                this.model.rotation.y = currentModel.rotation_y;
                this.model.rotation.z = currentModel.rotation_z;

                // Enable shadows and enhance materials
                this.model.traverse((child) => {
                  if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    if (child.material) {
                      child.material.needsUpdate = true;
                      // Make it more architectural looking
                      if (child.material.color) {
                        child.material.color.setHex(0x888888); // Gray color for building-like appearance
                      }
                    }
                  }
                });

                // Calculate and set position
                const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
                  currentModel.coordinates,
                  currentModel.elevation
                );

                this.model.position.set(
                  modelAsMercatorCoordinate.x,
                  modelAsMercatorCoordinate.y,
                  modelAsMercatorCoordinate.z
                );
                
                const modelScale = modelAsMercatorCoordinate.meterInMercatorCoordinateUnits() * currentModel.scale * 0.5;
                this.model.scale.setScalar(modelScale);

                this.scene.add(this.model);
                setIsModelLoading(false);
                
                console.log('IFC placeholder model successfully positioned at coordinates:', currentModel.coordinates);
              },
              (progress) => {
                const percentage = (progress.loaded / progress.total * 100);
                console.log('Loading IFC placeholder progress:', percentage.toFixed(1) + '%');
              },
              (error) => {
                console.error('Error loading IFC placeholder model:', error);
                setError('Failed to load model visualization. IFC file uploaded but needs conversion for 3D display.');
                setIsModelLoading(false);
              }
            );
          } else {
            // Handle GLTF/GLB files normally
            loader.load(
              currentModel.file_url,
            (gltf) => {
              console.log('GLTF/GLB model loaded successfully');
              
              // Store the loaded model
              this.model = gltf.scene;
              
              // Set initial scale
              this.model.scale.set(currentModel.scale, currentModel.scale, currentModel.scale);
              
              // Set rotation 
              this.model.rotation.x = currentModel.rotation_x;
              this.model.rotation.y = currentModel.rotation_y;
              this.model.rotation.z = currentModel.rotation_z;

              // Enable shadows on all mesh children
              this.model.traverse((child) => {
                if (child.isMesh) {
                  child.castShadow = true;
                  child.receiveShadow = true;
                  
                  // Enhance material properties for better rendering
                  if (child.material) {
                    child.material.needsUpdate = true;
                  }
                }
              });

              // Calculate model position in Mapbox's world coordinates
              const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
                currentModel.coordinates,
                currentModel.elevation
              );

              // Set model position and scale based on Mapbox coordinate system
              this.model.position.set(
                modelAsMercatorCoordinate.x,
                modelAsMercatorCoordinate.y,
                modelAsMercatorCoordinate.z
              );
              
              // Scale the model to match Mapbox's coordinate system
              const modelScale = modelAsMercatorCoordinate.meterInMercatorCoordinateUnits() * currentModel.scale;
              this.model.scale.setScalar(modelScale);

              // Add model to the Three.js scene
              this.scene.add(this.model);
              setIsModelLoading(false);
              
              console.log('GLTF/GLB model successfully positioned at coordinates:', currentModel.coordinates);
              console.log('Model scale:', modelScale);
            },
            (progress) => {
              // Loading progress callback
              const percentage = (progress.loaded / progress.total * 100);
              console.log('Loading progress:', percentage.toFixed(1) + '%');
            },
            (error) => {
              console.error('Error loading GLTF/GLB model:', error);
              setError('Failed to load 3D model. Please check the model format and URL.');
              setIsModelLoading(false);
            }
          );
          }
        },

        // Called for each frame to render the model
        render: function(gl, matrix) {
          if (!map.current) return;
          
          // Update Three.js camera with Mapbox's projection matrix
          const rotationX = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(1, 0, 0), 
            map.current.transform.pitch * Math.PI / 180
          );
          const rotationZ = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(0, 0, 1), 
            -map.current.transform.bearing * Math.PI / 180
          );

          const m = new THREE.Matrix4().fromArray(matrix);
          const l = new THREE.Matrix4()
            .makeTranslation(0, 0, 0)
            .scale(new THREE.Vector3(1, -1, 1));

          this.camera.projectionMatrix = m.multiply(rotationX).multiply(rotationZ).multiply(l);

          // Control model visibility based on toggle
          if (this.model) {
            this.model.visible = showModel;
          }

          // Reset WebGL state and render the Three.js scene
          this.renderer.resetState();
          this.renderer.render(this.scene, this.camera);
          
          // Ensure map repaints correctly after Three.js rendering
          if (map.current) {
            map.current.triggerRepaint();
          }
        }
      };

      // Add the custom 3D layer to the Mapbox map
      map.current.addLayer(customLayer);
      setModelLayer(customLayer);
      
      console.log('Custom 3D layer added to map');
    };

    initializeMap();

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [currentModel, showModel]);

  // Toggle 3D model visibility
  const toggleModelVisibility = () => {
    setShowModel(!showModel);
    // Trigger map repaint to update model visibility
    if (map.current) {
      map.current.triggerRepaint();
    }
  };

  // Navigate back to home/dashboard
  const goHome = () => {
    onNavigate('dashboard');
  };

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

  // Handle file upload
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
      setShowUploadForm(false);

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

        setAvailableModels(formattedModels);
        
        // Automatically switch to the newly uploaded model
        const newModel = formattedModels.find(m => m.id === modelData.id);
        if (newModel) {
          setCurrentModel(newModel);
          
          // Center map on the new model location
          if (map.current) {
            map.current.flyTo({
              center: newModel.coordinates,
              zoom: 18,
              pitch: 60,
              bearing: 30
            });
          }
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

  return (
    <div className={`relative w-full h-screen ${className}`}>
      {/* Map Container - Full viewport height */}
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Main Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center text-white">
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4" />
            <div className="text-2xl font-semibold mb-2">Loading 3D Map...</div>
            <div className="text-gray-300">Initializing Mapbox environment</div>
          </div>
        </div>
      )}

      {/* Model Loading Indicator */}
      {isModelLoading && (
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white z-40">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            <div>
              <div className="font-medium">Loading 3D Model...</div>
              <div className="text-sm text-gray-300">Please wait</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center text-white max-w-md">
            <div className="text-red-400 text-2xl font-semibold mb-4">Error</div>
            <div className="text-gray-300 mb-6">{error}</div>
            <Button onClick={goHome} className="bg-white text-black hover:bg-gray-200">
              <Home className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      )}

      {/* Controls Panel - Top Left */}
      {!isLoading && !error && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg z-40 min-w-[320px] max-h-[calc(100vh-2rem)] overflow-y-auto">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-lg">3D Model Controls</h3>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  {isMinimized ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goHome}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Home className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Panel Content - Only show when not minimized */}
            {!isMinimized && (
              <>
                {/* Upload Section */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-800">Upload IFC Model</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowUploadForm(!showUploadForm)}
                      className="text-xs"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      {showUploadForm ? 'Cancel' : 'Upload'}
                    </Button>
                  </div>

                  {showUploadForm && (
                    <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
                      <div>
                        <Label htmlFor="model-name" className="text-xs font-medium">Model Name *</Label>
                        <Input
                          id="model-name"
                          value={uploadFormData.name}
                          onChange={(e) => setUploadFormData({...uploadFormData, name: e.target.value})}
                          placeholder="Enter model name"
                          className="text-xs h-8"
                        />
                      </div>

                      <div>
                        <Label htmlFor="model-description" className="text-xs font-medium">Description</Label>
                        <Textarea
                          id="model-description"
                          value={uploadFormData.description}
                          onChange={(e) => setUploadFormData({...uploadFormData, description: e.target.value})}
                          placeholder="Optional description"
                          className="text-xs h-16 resize-none"
                        />
                      </div>

                      <div>
                        <Label htmlFor="project-address" className="text-xs font-medium">Project Address *</Label>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-gray-500" />
                          <Input
                            id="project-address"
                            value={uploadFormData.address}
                            onChange={(e) => setUploadFormData({...uploadFormData, address: e.target.value})}
                            placeholder="123 Main St, City, Country"
                            className="text-xs h-8 flex-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="model-file" className="text-xs font-medium">IFC File *</Label>
                        <Input
                          id="model-file"
                          type="file"
                          accept=".ifc,.gltf,.glb"
                          onChange={(e) => setUploadFormData({...uploadFormData, file: e.target.files?.[0] || null})}
                          className="text-xs h-8"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Supports: .ifc, .gltf, .glb files
                        </div>
                      </div>

                      <Button
                        onClick={handleFileUpload}
                        disabled={isUploading || !uploadFormData.file || !uploadFormData.name || !uploadFormData.address}
                        className="w-full h-8 text-xs"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-3 h-3 mr-1" />
                            Upload & Place Model
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Model Selection */}
                {availableModels.length > 1 && (
                  <div className="border-t pt-4">
                    <Label className="text-xs font-medium mb-2 block">Available Models</Label>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {availableModels.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => setCurrentModel(model)}
                          className={`w-full text-left p-2 rounded text-xs transition-all ${
                            currentModel?.id === model.id
                              ? 'bg-blue-100 border border-blue-200'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <div className="font-medium truncate">{model.name}</div>
                          <div className="text-gray-500 truncate">{model.description || 'No description'}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Model Visibility Toggle */}
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border-t pt-4">
                  <Switch
                    id="model-visibility"
                    checked={showModel}
                    onCheckedChange={toggleModelVisibility}
                  />
                  <Label htmlFor="model-visibility" className="flex items-center space-x-2 cursor-pointer">
                    {showModel ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                    <span className="font-medium">{showModel ? 'Hide' : 'Show'} 3D Model</span>
                  </Label>
                </div>

                {/* Model Information */}
                {currentModel && (
                  <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <div className="font-medium text-gray-800 mb-2">{currentModel.name}</div>
                    {currentModel.description && (
                      <div className="text-xs text-gray-600 mb-2">{currentModel.description}</div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-medium">Location:</span>
                        <div className="text-xs">{currentModel.coordinates[1].toFixed(6)}, {currentModel.coordinates[0].toFixed(6)}</div>
                      </div>
                      <div>
                        <span className="font-medium">Scale:</span>
                        <div>{currentModel.scale}x</div>
                      </div>
                      <div>
                        <span className="font-medium">Elevation:</span>
                        <div>{currentModel.elevation}m</div>
                      </div>
                      <div>
                        <span className="font-medium">Rotation:</span>
                        <div>{(currentModel.rotation_x * 180 / Math.PI).toFixed(0)}° X-axis</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Model URL Display */}
                {currentModel && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    <div className="font-medium mb-1">Model Source:</div>
                    <div className="break-all">{currentModel.file_url}</div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Navigation Instructions - Bottom Left */}
      {!isLoading && !error && (
        <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white text-sm z-40 max-w-sm">
          <div className="font-medium mb-2">Map Controls:</div>
          <div className="space-y-1">
            <div>• Click and drag to rotate view</div>
            <div>• Scroll to zoom in/out</div>
            <div>• Right-click and drag to pan</div>
            <div>• Use compass controls (top-right)</div>
          </div>
        </div>
      )}

      {/* Status Indicator - Bottom Right */}
      {!isLoading && !error && (
        <div className="absolute bottom-4 right-4 bg-green-500/90 backdrop-blur-sm rounded-lg p-3 text-white text-sm z-40">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>3D Environment Active</span>
          </div>
        </div>
      )}
    </div>
  );
};