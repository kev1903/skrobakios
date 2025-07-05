import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navigation, Globe, Map, Layers, MapPin, Bookmark } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Mapbox3DEnvironmentProps {
  onNavigate: (page: string) => void;
}

interface Project {
  id: string;
  name: string;
  location: string | null;
  status: string | null;
  project_id: string;
  contract_price: string | null;
  description: string | null;
  created_at: string;
}

interface ProjectMarker {
  project: Project;
  marker: mapboxgl.Marker;
  coordinates: [number, number];
}

export const Mapbox3DEnvironment = ({ onNavigate }: Mapbox3DEnvironmentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const mapStyle = 'streets-v12';
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectMarkers, setProjectMarkers] = useState<ProjectMarker[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const { toast } = useToast();

  // Save and load view functions
  const saveCurrentView = () => {
    if (!map.current) {
      toast({
        title: "Error",
        description: "Map not initialized",
        variant: "destructive",
      });
      return;
    }
    
    const center = map.current.getCenter();
    const zoom = map.current.getZoom();
    const bearing = map.current.getBearing();
    const pitch = map.current.getPitch();
    
    const viewState = {
      center: [center.lng, center.lat],
      zoom,
      bearing,
      pitch,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem('mapbox-saved-view', JSON.stringify(viewState));
      
      toast({
        title: "View Saved Successfully",
        description: `Position saved: Zoom ${zoom.toFixed(1)}, Pitch ${pitch.toFixed(0)}°`,
      });
      
      console.log('Saved view state:', viewState);
    } catch (error) {
      console.error('Error saving view:', error);
      toast({
        title: "Error",
        description: "Failed to save view position",
        variant: "destructive",
      });
    }
  };

  const loadSavedView = () => {
    try {
      const savedView = localStorage.getItem('mapbox-saved-view');
      if (savedView) {
        const parsedView = JSON.parse(savedView);
        console.log('Loading saved view:', parsedView);
        return parsedView;
      }
      console.log('No saved view found, using defaults');
    } catch (error) {
      console.error('Error loading saved view:', error);
    }
    return null;
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize Mapbox
    mapboxgl.accessToken = 'pk.eyJ1Ijoia2V2aW4xOTAzMTk5NCIsImEiOiJjbWNvdTU0aXcxOWxrMmtvamd0NjB6ajhjIn0.3mYQ3SZE_DQ0Qiz8t_IA6w';
    
    // Get saved view or use defaults
    const savedView = loadSavedView();
    const initialCenter = savedView?.center || [145.0, -37.0];
    const initialZoom = savedView?.zoom || 6.5;
    const initialBearing = savedView?.bearing || 0;
    const initialPitch = savedView?.pitch || 30;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: `mapbox://styles/mapbox/${mapStyle}`,
      projection: 'mercator', // Better for regional views
      zoom: initialZoom,
      center: initialCenter,
      pitch: initialPitch,
      bearing: initialBearing,
      antialias: true,
      maxBounds: [
        [140.5, -39.5], // Southwest coordinates
        [150.5, -33.5]  // Northeast coordinates  
      ]
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl());

    // Add scale control
    map.current.addControl(new mapboxgl.ScaleControl({
      maxWidth: 80,
      unit: 'metric'
    }));

    // 3D terrain and atmosphere effects
    map.current.on('style.load', () => {
      if (!map.current) return;
      
      // Add 3D terrain
      map.current.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14
      });
      
      map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

      // Add atmosphere and fog
      map.current.setFog({
        color: 'rgb(186, 210, 235)', // Lower atmosphere
        'high-color': 'rgb(36, 92, 223)', // Upper atmosphere
        'horizon-blend': 0.02, // Atmosphere thickness (default 0.2 at low zooms)
        'space-color': 'rgb(11, 11, 25)', // Background color
        'star-intensity': 0.6 // Background star brightness (default 0.35 at low zooms )
      });

      setIsLoaded(true);
    });

    // Auto-rotation functionality
    let userInteracting = false;
    let spinEnabled = true;
    const secondsPerRevolution = 120;
    const maxSpinZoom = 5;
    const slowSpinZoom = 3;

    function spinGlobe() {
      if (!map.current) return;
      
      const zoom = map.current.getZoom();
      if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
        let distancePerSecond = 360 / secondsPerRevolution;
        if (zoom > slowSpinZoom) {
          const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
          distancePerSecond *= zoomDif;
        }
        const center = map.current.getCenter();
        center.lng -= distancePerSecond;
        map.current.easeTo({ center, duration: 1000, easing: (n) => n });
      }
    }

    // Event listeners for user interaction
    const onMouseDown = () => { userInteracting = true; };
    const onMouseUp = () => { userInteracting = false; spinGlobe(); };
    const onTouchEnd = () => { userInteracting = false; spinGlobe(); };
    const onMoveEnd = () => { spinGlobe(); };

    map.current.on('mousedown', onMouseDown);
    map.current.on('touchstart', onMouseDown);
    map.current.on('mouseup', onMouseUp);
    map.current.on('touchend', onTouchEnd);
    map.current.on('moveend', onMoveEnd);

    // Start spinning
    spinGlobe();

    return () => {
      map.current?.remove();
    };
  }, []);

  // Fetch projects from Supabase
  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .not('location', 'is', null);

      if (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: "Error",
          description: "Failed to fetch projects",
          variant: "destructive",
        });
        return;
      }

      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to fetch projects",
        variant: "destructive",
      });
    } finally {
      setLoadingProjects(false);
    }
  };

  // Geocode address using Mapbox Geocoding API
  const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}&limit=1`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        return [lng, lat];
      }
      
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Add project markers to the map
  const addProjectMarkers = async () => {
    if (!map.current || projects.length === 0) return;

    // Clear existing markers
    projectMarkers.forEach(({ marker }) => marker.remove());
    setProjectMarkers([]);

    const newMarkers: ProjectMarker[] = [];

    for (const project of projects) {
      if (!project.location) continue;

      const coordinates = await geocodeAddress(project.location);
      if (!coordinates) continue;

      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'project-marker';
      markerElement.innerHTML = `
        <div class="w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
          </svg>
        </div>
      `;

      // Create marker
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat(coordinates)
        .addTo(map.current);

      // Create popup with project information
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div class="p-3 space-y-2">
            <h3 class="font-semibold text-lg text-gray-900">${project.name}</h3>
            <p class="text-sm text-gray-600">ID: ${project.project_id}</p>
            <p class="text-sm text-gray-600">Location: ${project.location}</p>
            ${project.status ? `<p class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 inline-block">Status: ${project.status}</p>` : ''}
            ${project.contract_price ? `<p class="text-sm font-medium text-green-600">Contract: ${project.contract_price}</p>` : ''}
            ${project.description ? `<p class="text-sm text-gray-700 mt-2">${project.description.substring(0, 100)}${project.description.length > 100 ? '...' : ''}</p>` : ''}
            <button onclick="window.selectProject('${project.id}')" class="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors">View Details</button>
          </div>
        `);

      marker.setPopup(popup);

      newMarkers.push({
        project,
        marker,
        coordinates
      });
    }

    setProjectMarkers(newMarkers);
    
    // Fit map to show all markers if there are any
    if (newMarkers.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      newMarkers.forEach(({ coordinates }) => bounds.extend(coordinates));
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 10 });
    }

    toast({
      title: "Success",
      description: `${newMarkers.length} project${newMarkers.length !== 1 ? 's' : ''} positioned on map`,
    });
  };

  // Handle project selection from popup
  useEffect(() => {
    (window as any).selectProject = (projectId: string) => {
      // Navigate to project detail page
      // This would need to be implemented based on your navigation system
      onNavigate('project-detail');
    };

    return () => {
      delete (window as any).selectProject;
    };
  }, [onNavigate]);

  // Fetch projects when component mounts
  useEffect(() => {
    if (isLoaded) {
      fetchProjects();
    }
  }, [isLoaded]);

  // Add markers when projects are loaded
  useEffect(() => {
    if (projects.length > 0 && map.current) {
      addProjectMarkers();
    }
  }, [projects]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Map Container - Full screen */}
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/90 to-slate-950/90 backdrop-blur-lg flex items-center justify-center z-50">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto shadow-lg"></div>
            <div className="text-white text-xl font-semibold tracking-wide">Loading 3D Environment...</div>
            <div className="text-slate-300 text-sm">Initializing Mapbox Globe</div>
          </div>
        </div>
      )}

      {/* Navigation Panel - Enhanced Glassmorphism */}
      <Card className="absolute top-6 left-6 z-40 bg-black/10 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50">
        <CardContent className="p-5">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold text-lg">Navigation</span>
          </div>
          <div className="space-y-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('dashboard')}
              className="w-full justify-start text-white hover:bg-white/15 hover:backdrop-blur-sm transition-all duration-300 rounded-lg"
            >
              <Globe className="w-4 h-4 mr-3" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('projects')}
              className="w-full justify-start text-white hover:bg-white/15 hover:backdrop-blur-sm transition-all duration-300 rounded-lg"
            >
              <Map className="w-4 h-4 mr-3" />
              Projects
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('tasks')}
              className="w-full justify-start text-white hover:bg-white/15 hover:backdrop-blur-sm transition-all duration-300 rounded-lg"
            >
              <Layers className="w-4 h-4 mr-3" />
              Tasks
            </Button>
            <div className="border-t border-white/20 my-3"></div>
            <Button
              variant="ghost"
              size="sm"
              onClick={saveCurrentView}
              className="w-full justify-start text-white hover:bg-white/15 hover:backdrop-blur-sm transition-all duration-300 rounded-lg"
            >
              <Bookmark className="w-4 h-4 mr-3" />
              Save View
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Panel - Enhanced Glassmorphism */}
      <Card className="absolute bottom-6 left-6 z-40 bg-black/10 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50">
        <CardContent className="p-5">
          <div className="text-white space-y-3">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-lg font-semibold">3D Earth Environment</div>
            </div>
            <div className="text-sm text-slate-200 space-y-2 leading-relaxed">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span>Click and drag to rotate</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span>Scroll to zoom in/out</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <span>Globe auto-rotates when idle</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                <span>Click project markers for details</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Status Panel - Enhanced Glassmorphism */}
      <Card className="absolute bottom-6 right-6 z-40 bg-black/10 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50">
        <CardContent className="p-5">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
              <MapPin className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-white font-semibold text-lg">Projects</span>
          </div>
          <div className="text-white space-y-3">
            {loadingProjects ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-sm text-slate-300">Loading projects...</div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 backdrop-blur-sm">
                  <span className="text-sm text-slate-300">On Map</span>
                  <span className="text-xl font-bold text-blue-400">{projectMarkers.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 backdrop-blur-sm">
                  <span className="text-sm text-slate-300">Total Found</span>
                  <span className="text-xl font-bold text-white">{projects.length}</span>
                </div>
                {projects.length > projectMarkers.length && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-400/20">
                    <div className="text-xs text-amber-300 font-medium">
                      {projects.length - projectMarkers.length} projects missing location data
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};