import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { HomeFloatingBar } from '@/components/HomeFloatingBar';
import { ChatBox } from '@/components/ChatBox';
import { CenteredCompanyName } from '@/components/CenteredCompanyName';

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

interface HomePageProps {
  onNavigate: (page: string) => void;
  onSelectProject?: (projectId: string) => void;
}

export const HomePage = ({ onNavigate, onSelectProject }: HomePageProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mapConfig, setMapConfig] = useState({
    center: [144.9631, -37.8136] as [number, number],
    zoom: 6.5,
    pitch: 30,
    bearing: 0
  });
  const [showSaveButton, setShowSaveButton] = useState(false);

  const saveCurrentMapPosition = async () => {
    if (!map.current) return;

    const center = map.current.getCenter();
    const zoom = map.current.getZoom();
    const pitch = map.current.getPitch();
    const bearing = map.current.getBearing();

    try {
      // First, deactivate the current active configuration
      await supabase
        .from('map_configurations')
        .update({ is_active: false })
        .eq('is_active', true);

      // Insert new configuration
      const { error } = await supabase
        .from('map_configurations')
        .insert({
          name: `saved_${new Date().toISOString()}`,
          center_lng: center.lng,
          center_lat: center.lat,
          zoom: zoom,
          pitch: pitch,
          bearing: bearing,
          is_active: true
        });

      if (error) {
        console.error('Error saving map configuration:', error);
      } else {
        console.log('Map position saved successfully!');
        setShowSaveButton(false);
        
        // Update local state
        setMapConfig({
          center: [center.lng, center.lat],
          zoom: zoom,
          pitch: pitch,
          bearing: bearing
        });
      }
    } catch (error) {
      console.error('Error saving map configuration:', error);
    }
  };

  useEffect(() => {
    const loadMapConfiguration = async () => {
      try {
        const { data: config, error: configError } = await supabase
          .from('map_configurations')
          .select('*')
          .eq('is_active', true)
          .single();

        if (!configError && config) {
          setMapConfig({
            center: [config.center_lng, config.center_lat],
            zoom: config.zoom,
            pitch: config.pitch || 30,
            bearing: config.bearing || 0
          });
        }
      } catch (error) {
        console.error('Error loading map configuration:', error);
      }
    };

    loadMapConfiguration();
    
    const initializeMapWithProjects = async () => {
      if (!mapContainer.current) return;

      try {
        // Fetch Mapbox token from edge function
        const { data: tokenData, error: tokenError } = await supabase.functions.invoke('get-mapbox-token');
        
        if (tokenError) {
          console.error('Error fetching Mapbox token:', tokenError);
          setError('Failed to load map configuration');
          setIsLoading(false);
          return;
        }

        if (!tokenData?.token) {
          setError('Mapbox token not available');
          setIsLoading(false);
          return;
        }

        // Fetch projects from database
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (projectsError) {
          console.error('Error fetching projects:', projectsError);
        }

        // Initialize map with fetched token
        mapboxgl.accessToken = tokenData.token;
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/kevin19031994/cmcprh4kj009w01sqbfig9lx6',
          projection: 'mercator',
          zoom: mapConfig.zoom,
          center: mapConfig.center,
          pitch: mapConfig.pitch,
          bearing: mapConfig.bearing,
          maxBounds: [
            [140.96, -39.20], // Southwest coordinates of Victoria
            [149.98, -33.98]  // Northeast coordinates of Victoria
          ]
        });

        // Navigation controls hidden as requested

        // Wait for map to load, then add project markers
        map.current.on('style.load', async () => {
          if (projectsData && projectsData.length > 0) {
            await addProjectMarkers(projectsData);
          }
          setIsLoading(false);
        });

        // Event listeners for user interaction
        map.current.on('mousedown', () => {
          setShowSaveButton(true);
        });
        
        map.current.on('dragstart', () => {
          setShowSaveButton(true);
        });
        
        map.current.on('mouseup', () => {
          // User interaction handled by Mapbox
        });
        
        map.current.on('touchend', () => {
          // User interaction handled by Mapbox
        });

        map.current.on('zoom', () => {
          setShowSaveButton(true);
        });

        map.current.on('pitch', () => {
          setShowSaveButton(true);
        });

        map.current.on('rotate', () => {
          setShowSaveButton(true);
        });

      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to initialize map');
        setIsLoading(false);
      }
    };

    const addProjectMarkers = async (projects: Project[]) => {
      if (!map.current) return;

      // Geocode project addresses and add markers
      for (const project of projects) {
        if (!project.location) continue;
        
        const coordinates = await geocodeAddress(project.location);
        if (!coordinates) continue;

        // Create marker element
        const markerElement = document.createElement('div');
        markerElement.className = 'project-marker';
        markerElement.innerHTML = `
          <div style="
            background-color: #3b82f6;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="color: white; font-size: 10px; font-weight: bold;">P</div>
          </div>
        `;

        // Create popup for project info
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${project.name}</h3>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">ID: ${project.project_id}</p>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">Status: ${project.status || 'Unknown'}</p>
            ${project.description ? `<p style="margin: 4px 0 0 0; font-size: 12px;">${project.description}</p>` : ''}
          </div>
        `);

        // Create and add marker to map
        new mapboxgl.Marker(markerElement)
          .setLngLat(coordinates)
          .setPopup(popup)
          .addTo(map.current);
      }
    };

    initializeMapWithProjects();

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [mapConfig]); // Add mapConfig as dependency

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-black/10" />
      
      {/* Floating Top Bar */}
      <HomeFloatingBar onNavigate={onNavigate} onSelectProject={onSelectProject} />
      
      {/* Save Map Position Button */}
      {showSaveButton && (
        <div className="fixed top-20 right-6 z-50">
          <button
            onClick={saveCurrentMapPosition}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 text-sm font-medium"
          >
            Save Map Position
          </button>
        </div>
      )}
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-white text-xl font-semibold">Loading Map...</div>
          </div>
        </div>
      )}
      
      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-50">
          <div className="text-center text-white">
            <div className="text-red-400 text-xl font-semibold mb-2">Error</div>
            <div className="text-gray-300">{error}</div>
          </div>
        </div>
      )}
      
      {/* Centered Company Name with AI Effects */}
      <CenteredCompanyName isSpeaking={isSpeaking} onNavigate={onNavigate} />
      
      {/* Bottom Chat Box */}
      <ChatBox onNavigate={onNavigate} onSpeakingChange={setIsSpeaking} />
    </div>
  );
};