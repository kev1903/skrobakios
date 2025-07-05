import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Home, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
  location: string;
  description: string;
  status: string;
  project_id: string;
}

interface ProjectWithCoordinates extends Project {
  coordinates?: [number, number];
}

// Geocode address to coordinates using Mapbox
const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
  if (!address || address.trim() === '') return null;
  
  try {
    const { data, error } = await supabase.functions.invoke('get-mapbox-token');
    if (error || !data?.token) {
      console.error('Failed to get Mapbox token for geocoding');
      return null;
    }

    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${data.token}&limit=1&country=AU`
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
    console.error('Error geocoding address:', address, error);
    return null;
  }
};

export const ProjectsMapPage = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [projects, setProjects] = useState<ProjectWithCoordinates[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectWithCoordinates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load projects and initialize map
  useEffect(() => {
    initializeProjectsMap();
  }, []);

  const initializeProjectsMap = async () => {
    try {
      // Fetch projects from database
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) {
        throw new Error(`Failed to load projects: ${projectsError.message}`);
      }

      if (!projectsData || projectsData.length === 0) {
        setError('No projects found');
        setIsLoading(false);
        return;
      }

      // Geocode project addresses
      const projectsWithCoordinates: ProjectWithCoordinates[] = [];
      
      for (const project of projectsData) {
        const coordinates = await geocodeAddress(project.location);
        projectsWithCoordinates.push({
          ...project,
          coordinates
        });
      }

      setProjects(projectsWithCoordinates);

      // Initialize Mapbox map
      const { data: tokenData, error: tokenError } = await supabase.functions.invoke('get-mapbox-token');
      
      if (tokenError || !tokenData?.token) {
        throw new Error('Failed to load map configuration');
      }

      if (!mapContainer.current) return;

      mapboxgl.accessToken = tokenData.token;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [144.9631, -37.8136], // Melbourne center
        zoom: 10
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Wait for map to load before adding markers
      map.current.on('load', () => {
        addProjectMarkers(projectsWithCoordinates);
        setIsLoading(false);
      });

    } catch (err) {
      console.error('Error initializing projects map:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize map');
      setIsLoading(false);
    }
  };

  const addProjectMarkers = (projectsData: ProjectWithCoordinates[]) => {
    if (!map.current) return;

    const validProjects = projectsData.filter(project => project.coordinates);

    if (validProjects.length === 0) {
      setError('No projects have valid addresses for mapping');
      return;
    }

    // Add markers for each project
    validProjects.forEach((project) => {
      if (!project.coordinates || !map.current) return;

      // Create marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'project-marker';
      markerElement.innerHTML = `
        <div style="
          background-color: #3b82f6;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="color: white; font-size: 12px; font-weight: bold;">P</div>
        </div>
      `;

      // Add click event to marker
      markerElement.addEventListener('click', () => {
        setSelectedProject(project);
        
        // Fly to project location
        if (map.current && project.coordinates) {
          map.current.flyTo({
            center: project.coordinates,
            zoom: 15
          });
        }
      });

      // Create and add marker to map
      new mapboxgl.Marker(markerElement)
        .setLngLat(project.coordinates)
        .addTo(map.current);
    });

    // Fit map to show all markers
    if (validProjects.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      validProjects.forEach(project => {
        if (project.coordinates) {
          bounds.extend(project.coordinates);
        }
      });
      map.current.fitBounds(bounds, { padding: 50 });
    } else if (validProjects.length === 1 && validProjects[0].coordinates) {
      map.current.setCenter(validProjects[0].coordinates);
      map.current.setZoom(15);
    }

    toast({
      title: "Projects Loaded",
      description: `${validProjects.length} projects mapped successfully`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'running':
        return 'text-green-600';
      case 'completed':
        return 'text-blue-600';
      case 'pending':
        return 'text-yellow-600';
      case 'paused':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="flex h-screen">
      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="absolute inset-0" />
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center text-white">
              <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4" />
              <div className="text-2xl font-semibold mb-2">Loading Projects Map...</div>
              <div className="text-gray-300">Mapping project locations</div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="text-center text-white max-w-md">
              <div className="text-red-400 text-2xl font-semibold mb-4">Error</div>
              <div className="text-gray-300 mb-6">{error}</div>
              <Button onClick={() => window.location.reload()} className="bg-white text-black hover:bg-gray-200">
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="absolute top-4 left-4 z-40">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            className="bg-white/90 backdrop-blur-sm"
          >
            <Home className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Projects Counter */}
        {!isLoading && !error && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-40">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="font-medium">{projects.filter(p => p.coordinates).length} Projects Mapped</span>
            </div>
          </div>
        )}
      </div>

      {/* Project Details Sidebar */}
      {selectedProject && (
        <div className="w-96 bg-white border-l shadow-lg overflow-y-auto">
          <Card className="h-full border-0 rounded-none">
            <CardHeader className="border-b">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{selectedProject.name}</CardTitle>
                  <CardDescription className="mt-1">
                    ID: {selectedProject.project_id}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 space-y-4">
              <div>
                <h4 className="font-medium mb-2">Status</h4>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(selectedProject.status)} bg-gray-100`}>
                  {selectedProject.status}
                </span>
              </div>

              {selectedProject.location && (
                <div>
                  <h4 className="font-medium mb-2">Location</h4>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600">{selectedProject.location}</p>
                  </div>
                </div>
              )}

              {selectedProject.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{selectedProject.description}</p>
                </div>
              )}

              {selectedProject.coordinates && (
                <div>
                  <h4 className="font-medium mb-2">Coordinates</h4>
                  <p className="text-xs text-gray-500 font-mono">
                    {selectedProject.coordinates[1].toFixed(6)}, {selectedProject.coordinates[0].toFixed(6)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};