import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { HomeFloatingBar } from '@/components/HomeFloatingBar';

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

    const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${data.token}&limit=1&country=AU`;
    console.log('Geocoding URL:', geocodeUrl);

    const response = await fetch(geocodeUrl);
    
    if (!response.ok) {
      console.error('Geocoding request failed with status:', response.status);
      throw new Error('Geocoding request failed');
    }

    const geocodeData = await response.json();
    console.log('Geocoding response for', address, ':', geocodeData);
    
    if (geocodeData.features && geocodeData.features.length > 0) {
      const [lng, lat] = geocodeData.features[0].center;
      console.log('Parsed coordinates [lng, lat]:', [lng, lat]);
      return [lng, lat];
    }
    
    console.log('No features found in geocoding response for:', address);
    return null;
  } catch (error) {
    console.error('Error geocoding address:', address, error);
    return null;
  }
};

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export const HomePage = ({ onNavigate }: HomePageProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
          zoom: 6.5,
          center: [144.9631, -37.8136], // Melbourne, Victoria
          pitch: 30,
          maxBounds: [
            [140.96, -39.20], // Southwest coordinates of Victoria
            [149.98, -33.98]  // Northeast coordinates of Victoria
          ]
        });

        // Add navigation controls
        map.current.addControl(
          new mapboxgl.NavigationControl({
            visualizePitch: true,
          }),
          'top-right'
        );

        // Wait for map to load, then add project markers
        map.current.on('style.load', async () => {
          if (projectsData && projectsData.length > 0) {
            await addProjectMarkers(projectsData);
          }
          setIsLoading(false);
        });

        // Event listeners for user interaction
        map.current.on('mousedown', () => {
          // User interaction handled by Mapbox
        });
        
        map.current.on('dragstart', () => {
          // User interaction handled by Mapbox
        });
        
        map.current.on('mouseup', () => {
          // User interaction handled by Mapbox
        });
        
        map.current.on('touchend', () => {
          // User interaction handled by Mapbox
        });

      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to initialize map');
        setIsLoading(false);
      }
    };

    const addProjectMarkers = async (projects: Project[]) => {
      if (!map.current) return;

      console.log('Adding markers for projects:', projects.length);

      // Geocode project addresses and add markers
      for (const project of projects) {
        if (!project.location) {
          console.log('Skipping project without location:', project.name);
          continue;
        }
        
        console.log('Geocoding location for project:', project.name, 'Location:', project.location);
        const coordinates = await geocodeAddress(project.location);
        
        if (!coordinates) {
          console.log('Failed to geocode location for project:', project.name);
          continue;
        }

        console.log('Geocoded coordinates for', project.name, ':', coordinates);

        // Create marker element
        const markerElement = document.createElement('div');
        markerElement.className = 'project-marker';
        markerElement.style.position = 'relative';
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

        // Create hover tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'project-tooltip';
        tooltip.style.cssText = `
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s ease;
          margin-bottom: 5px;
          z-index: 1000;
        `;
        tooltip.textContent = project.name;
        markerElement.appendChild(tooltip);

        // Add hover events
        markerElement.addEventListener('mouseenter', () => {
          tooltip.style.opacity = '1';
        });

        markerElement.addEventListener('mouseleave', () => {
          tooltip.style.opacity = '0';
        });

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
  }, []);

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-black/10" />
      
      {/* Floating Top Bar */}
      <HomeFloatingBar onNavigate={onNavigate} />
      
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
    </div>
  );
};