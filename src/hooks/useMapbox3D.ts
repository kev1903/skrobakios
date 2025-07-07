import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { supabase } from '@/integrations/supabase/client';
import { Model3D } from '@/components/mapbox/types';

export const useMapbox3D = (
  currentModel: Model3D | null, 
  showModel: boolean, 
  currentProject?: { id: string; project_id: string; name: string; location?: string } | null
) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelLayer, setModelLayer] = useState<any>(null);
  // Geocode address to coordinates
  const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            'User-Agent': 'Lovable-Digital-Twin/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }

      const geocodeData = await response.json();
      
      if (geocodeData && geocodeData.length > 0) {
        const [lng, lat] = [parseFloat(geocodeData[0].lon), parseFloat(geocodeData[0].lat)];
        return [lng, lat];
      }
      
      return null;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  };

  // Initialize map based on project location when no model is available
  useEffect(() => {
    if (currentModel) return; // Skip if we have a model (handled by other useEffect)
    
    const initializeProjectMap = async () => {
      if (!mapContainer.current) return;

      console.log('Initializing map for project:', currentProject?.name);
      console.log('Project location:', currentProject?.location);

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

        // Determine map center based on project location
        let mapCenter: [number, number] = [145.032000, -37.820300]; // Default Melbourne
        
        if (currentProject?.location) {
          console.log('Geocoding project address:', currentProject.location);
          const coordinates = await geocodeAddress(currentProject.location);
          if (coordinates) {
            mapCenter = coordinates;
            console.log('Using geocoded coordinates:', mapCenter);
          } else {
            console.log('Geocoding failed, using default coordinates');
          }
        } else {
          console.log('No project location available, using default coordinates');
        }

        // Initialize map with fetched token
        mapboxgl.accessToken = data.token;
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/kevin19031994/cmcprh4kj009w01sqbfig9lx6',
          projection: 'mercator',
          zoom: currentProject?.location ? 16 : 12, // Closer zoom if we have a specific address
          center: mapCenter,
          pitch: currentProject?.location ? 45 : 0, // Angled view for project locations
          bearing: 0,
          antialias: true
        });

        // Add a marker for the project location if available
        if (currentProject?.location) {
          new mapboxgl.Marker({
            color: '#3b82f6',
            scale: 1.2
          })
          .setLngLat(mapCenter)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`<div class="font-semibold">${currentProject.name}</div><div class="text-sm text-gray-600">${currentProject.location}</div>`)
          )
          .addTo(map.current);

          console.log('Added project marker at:', mapCenter);
        }

        // Wait for map style to load
        map.current.on('style.load', () => {
          console.log('Project map style loaded');
          setIsLoading(false);
        });

      } catch (err) {
        console.error('Error initializing project map:', err);
        setError('Failed to initialize map');
        setIsLoading(false);
      }
    };

    initializeProjectMap();

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [currentProject, currentModel]);

  // Initialize map with 3D model when available
  useEffect(() => {
    console.log('=== useMapbox3D useEffect triggered ===');
    console.log('currentModel:', currentModel);
    console.log('showModel:', showModel);
    
    if (!currentModel) {
      console.log('No current model selected - exiting');
      return;
    }

    console.log('Initializing map with model:', currentModel);
    console.log('Model coordinates:', currentModel.coordinates);
    console.log('Show model state:', showModel);

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


        // Wait for map style to load before adding 3D layer
        map.current.on('style.load', () => {
          console.log('=== Map style loaded, starting 3D layer setup ===');
          console.log('Current model for 3D layer:', currentModel);
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
      console.log('=== add3DModelLayer called ===');
      console.log('Map current:', !!map.current);
      console.log('Model to add:', currentModel);
      
      if (!map.current) {
        console.error('Map not available in add3DModelLayer');
        return;
      }

      setIsModelLoading(true);

      // Create custom layer that integrates Three.js with Mapbox GL JS
      const customLayer: mapboxgl.CustomLayerInterface = {
        id: '3d-model',
        type: 'custom',
        renderingMode: '3d',
        
        // Called when the layer is added to the map
        onAdd: function(map, gl) {
          console.log('=== 3D Layer onAdd called ===');
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

          console.log('=== Starting model load process ===');
          console.log('Loading 3D model from:', currentModel.file_url);
          console.log('Model details:', currentModel);
          
          // Check if this is an IFC file
          const isIFCFile = currentModel.file_url.toLowerCase().includes('.ifc');
          console.log('Is IFC file:', isIFCFile);
          
          if (isIFCFile) {
            console.log('IFC file detected - creating detailed building representation');
            
            // Create a detailed building representation for IFC files
            // This will be a group of multiple geometries to represent a building
            const buildingGroup = new THREE.Group();
            
            // Main building structure (larger base)
            const mainBuildingGeometry = new THREE.BoxGeometry(60, 40, 25);
            const mainBuildingMaterial = new THREE.MeshLambertMaterial({ 
              color: 0x8B4513, // Brown building color
              transparent: false
            });
            const mainBuilding = new THREE.Mesh(mainBuildingGeometry, mainBuildingMaterial);
            mainBuilding.position.set(0, 0, 12.5); // Lift it so it sits on ground
            buildingGroup.add(mainBuilding);
            
            // Roof structure
            const roofGeometry = new THREE.ConeGeometry(35, 15, 4);
            const roofMaterial = new THREE.MeshLambertMaterial({ 
              color: 0x654321 // Darker brown for roof
            });
            const roof = new THREE.Mesh(roofGeometry, roofMaterial);
            roof.position.set(0, 0, 32.5); // On top of main building
            roof.rotation.y = Math.PI / 4; // Rotate 45 degrees for diamond shape
            buildingGroup.add(roof);
            
            // Add some windows (smaller boxes)
            for (let i = 0; i < 3; i++) {
              for (let j = 0; j < 2; j++) {
                const windowGeometry = new THREE.BoxGeometry(8, 6, 1);
                const windowMaterial = new THREE.MeshLambertMaterial({ 
                  color: 0x87CEEB // Sky blue for windows
                });
                const window = new THREE.Mesh(windowGeometry, windowMaterial);
                window.position.set(-20 + i * 20, -15 + j * 15, 25.1); // Front face
                buildingGroup.add(window);
              }
            }
            
            // Add entrance door
            const doorGeometry = new THREE.BoxGeometry(8, 12, 1);
            const doorMaterial = new THREE.MeshLambertMaterial({ 
              color: 0x8B4513 // Brown door
            });
            const door = new THREE.Mesh(doorGeometry, doorMaterial);
            door.position.set(0, -15, 25.1); // Center front, bottom
            buildingGroup.add(door);
            
            this.model = buildingGroup;
            
            // Enable shadows on all children
            this.model.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
            
            // Calculate position using Mapbox coordinate system
            const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
              currentModel.coordinates,
              currentModel.elevation
            );

            // Set position in Mapbox coordinate system
            this.model.position.set(
              modelAsMercatorCoordinate.x,
              modelAsMercatorCoordinate.y,
              modelAsMercatorCoordinate.z
            );
            
            // Scale to match Mapbox coordinate system
            const modelScale = modelAsMercatorCoordinate.meterInMercatorCoordinateUnits();
            console.log('Calculated model scale:', modelScale);
            console.log('Applying scale with multiplier:', modelScale * currentModel.scale);
            this.model.scale.setScalar(modelScale * currentModel.scale);

            // Set rotation 
            this.model.rotation.x = currentModel.rotation_x;
            this.model.rotation.y = currentModel.rotation_y;
            this.model.rotation.z = currentModel.rotation_z;

            this.scene.add(this.model);
            console.log('=== IFC Building Model added to scene ===');
            console.log('Scene children count:', this.scene.children.length);
            console.log('Building group children:', this.model.children.length);
            setIsModelLoading(false);
            
            console.log('IFC building representation created at coordinates:', currentModel.coordinates);
            console.log('Model position:', this.model.position);
            console.log('Model scale:', modelScale * currentModel.scale);
            console.log('Model visible:', this.model.visible);
            console.log('Model in scene:', this.scene.children.includes(this.model));
          } else {
            // Handle GLTF/GLB files with GLTFLoader
            const gltfLoader = new GLTFLoader();
            
            gltfLoader.load(
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
                console.log('GLTF Loading progress:', percentage.toFixed(1) + '%');
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
      console.log('=== Adding custom layer to map ===');
      map.current.addLayer(customLayer);
      setModelLayer(customLayer);
      
      console.log('=== Custom 3D layer added to map successfully ===');
    };

    initializeMap();

    // Cleanup function
    return () => {
      if (map.current) {
        try {
          map.current.remove();
        } catch (error) {
          console.warn('Error during map cleanup:', error);
        }
      }
    };
  }, [currentModel, showModel]);

  const flyToModel = (model: Model3D) => {
    console.log('=== flyToModel called ===');
    console.log('Flying to model coordinates:', model.coordinates);
    if (map.current) {
      map.current.flyTo({
        center: model.coordinates,
        zoom: 18,
        pitch: 60,
        bearing: 30
      });
      console.log('Map flyTo executed');
    } else {
      console.error('Map not available for flyTo');
    }
  };

  return {
    mapContainer,
    isLoading,
    isModelLoading,
    error,
    flyToModel
  };
};