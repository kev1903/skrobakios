import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { supabase } from '@/integrations/supabase/client';
import { Model3D } from '@/components/mapbox/types';

export const useMapbox3D = (currentModel: Model3D | null, showModel: boolean) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelLayer, setModelLayer] = useState<any>(null);

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

  const flyToModel = (model: Model3D) => {
    if (map.current) {
      map.current.flyTo({
        center: model.coordinates,
        zoom: 18,
        pitch: 60,
        bearing: 30
      });
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