import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { HomeFloatingBar } from '@/components/HomeFloatingBar';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export const HomePage = ({ onNavigate }: HomePageProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

        // Initialize map with fetched token
        mapboxgl.accessToken = data.token;
        
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

        // Map style loaded event
        map.current.on('style.load', () => {
          setIsLoading(false);
        });

        // Event listeners for user interaction (removed auto-rotation for regional map)
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

    initializeMap();

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