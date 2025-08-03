import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Building, Globe, Layers } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Project {
  id: string;
  name: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
}

export const BusinessMapbox = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);

  // Fetch Mapbox token from edge function
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        
        if (data?.token) {
          setMapboxToken(data.token);
        } else {
          console.error('No Mapbox token found');
        }
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
        // Fallback: use the token directly (for development)
        setMapboxToken('pk.eyJ1Ijoia2V2aW4xOTAzMTk5NCIsImEiOiJjbWR2YndyNjgweDd1MmxvYWppd3ZueWlnIn0.dwNrOhknOccJL9BFNT6gmg');
      } finally {
        setLoading(false);
      }
    };

    fetchMapboxToken();
  }, []);

  // Function to geocode projects
  const geocodeProjects = async () => {
    console.log('🔵 BUTTON CLICKED - Starting geocoding process');
    setGeocoding(true);
    try {
      console.log('🌍 Calling geocode-projects function...');
      
      const geocodeResult = await supabase.functions.invoke('geocode-projects');
      console.log('🔄 Raw geocoding result:', geocodeResult);
      
      if (geocodeResult.error) {
        console.error('❌ Geocoding function error:', geocodeResult.error);
        throw new Error(geocodeResult.error.message);
      }
      
      console.log('✅ Geocoding function completed, data:', geocodeResult.data);
      
      // Wait for database updates to propagate
      console.log('⏳ Waiting for database updates...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Fetch updated projects
      console.log('📡 Fetching updated projects...');
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, location, latitude, longitude, status');
      
      if (error) {
        console.error('❌ Database fetch error:', error);
        throw error;
      }
      
      console.log(`📍 Reloaded ${data?.length || 0} projects after geocoding`);
      const geocodedCount = data?.filter(p => p.latitude && p.longitude).length || 0;
      console.log(`✅ ${geocodedCount} projects now have coordinates`);
      
      setProjects(data || []);
      console.log('🎉 Projects state updated successfully');
      
    } catch (error) {
      console.error('💥 Error during geocoding:', error);
      alert(`Geocoding failed: ${error.message}`);
    } finally {
      console.log('🔵 BUTTON FINISHED - Geocoding process complete');
      setGeocoding(false);
    }
  };

  // Fetch projects data and ensure they're geocoded
  useEffect(() => {
    const fetchAndGeocodeProjects = async () => {
      try {
        console.log('🌍 Initial load - checking for projects that need geocoding...');
        
        // First load all projects
        const { data, error } = await supabase
          .from('projects')
          .select('id, name, location, latitude, longitude, status');
        
        if (error) throw error;
        
        console.log(`📍 Loaded ${data?.length || 0} total projects`);
        const geocodedCount = data?.filter(p => p.latitude && p.longitude).length || 0;
        console.log(`✅ ${geocodedCount} projects have coordinates, ${(data?.length || 0) - geocodedCount} using fallback`);
        setProjects(data || []);
        
        // Try to geocode if needed
        if (geocodedCount < (data?.length || 0)) {
          console.log('🔄 Some projects need geocoding, triggering geocoding process...');
          setTimeout(() => geocodeProjects(), 1000);
        }
        
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndGeocodeProjects();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [144.9631, -37.8136], // Melbourne, Australia
      zoom: 10,
      pitch: 45,
      bearing: -17.6,
      antialias: true
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add geolocate control
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      }),
      'top-right'
    );

    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Add 3D buildings layer
    map.current.on('style.load', () => {
      const layers = map.current?.getStyle().layers;
      const labelLayerId = layers?.find(
        (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
      )?.id;

      map.current?.addLayer(
        {
          id: 'add-3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        },
        labelLayerId
      );
    });

    // Add project markers with coordinates (real or fallback)
    projects.forEach((project, index) => {
      // Use real coordinates if available, otherwise use fallback positions around Melbourne
      const lat = project.latitude || (-37.8136 + (index * 0.01) - 0.05);
      const lng = project.longitude || (144.9631 + (index * 0.01) - 0.05);
      
      console.log(`📍 Project ${project.name}: ${lat}, ${lng} ${project.latitude ? '(real)' : '(fallback)'}`);

      // Create custom marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'custom-marker';
      markerEl.style.cssText = `
        width: 30px;
        height: 30px;
        background: #3b82f6;
        border: 2px solid white;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        transform: scale(1);
      `;
      markerEl.innerHTML = `<div style="color: white; font-size: 12px; font-weight: bold;">${index + 1}</div>`;

      // Add marker to map
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([lng, lat])
        .addTo(map.current!);

      // Create hover popup with coordinate status
      const hoverPopup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: false,
        closeOnClick: false,
        className: 'hover-popup'
      }).setHTML(
        `<div style="padding: 6px 8px; background: rgba(0,0,0,0.8); border-radius: 6px; color: white; font-size: 12px; backdrop-filter: blur(10px);">
          <div style="font-weight: bold; margin-bottom: 2px;">${project.name}</div>
          <div style="opacity: 0.9;">${project.location || 'Address not specified'}</div>
          <div style="opacity: 0.7; font-size: 10px; margin-top: 2px;">
            ${project.latitude ? '📍 Real coordinates' : '⚠️ Approximate location'}
          </div>
        </div>`
      );

      // Create click popup (detailed)
      const clickPopup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div style="padding: 12px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937; font-size: 14px;">${project.name}</h3>
          <div style="margin-bottom: 6px;">
            <span style="font-size: 11px; color: #6b7280; font-weight: 500;">ADDRESS:</span>
            <div style="font-size: 12px; color: #374151; margin-top: 2px;">${project.location || 'Location not specified'}</div>
          </div>
          <div style="margin-top: 8px;">
            <span style="padding: 3px 8px; background: #dbeafe; color: #1d4ed8; border-radius: 12px; font-size: 10px; font-weight: 500;">
              ${project.status || 'Active'}
            </span>
          </div>
        </div>`
      );

      // Hover effects
      markerEl.addEventListener('mouseenter', () => {
        markerEl.style.transform = 'scale(1.2)';
        markerEl.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.4)';
        markerEl.style.background = '#2563eb';
        hoverPopup.setLngLat([lng, lat]).addTo(map.current!);
      });

      markerEl.addEventListener('mouseleave', () => {
        markerEl.style.transform = 'scale(1)';
        markerEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        markerEl.style.background = '#3b82f6';
        hoverPopup.remove();
      });

      // Click effect
      markerEl.addEventListener('click', () => {
        // Remove hover popup when clicking
        hoverPopup.remove();
        clickPopup.setLngLat([lng, lat]).addTo(map.current!);
        map.current?.flyTo({
          center: [lng, lat],
          zoom: 15,
          duration: 2000
        });
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, projects]);

  if (loading) {
    return (
      <div className="w-full h-screen pt-[73px] bg-background flex items-center justify-center">
        <div className="text-center">
          <Globe className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading Mapbox...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen pt-[73px] bg-background relative">
      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0 mt-[73px]" />
      

      {/* Geocoding Controls */}
      <div className="absolute top-20 right-4 z-10">
        <div className="bg-background/95 backdrop-blur border rounded-lg p-3">
          <Button 
            onClick={geocodeProjects}
            disabled={geocoding}
            size="sm"
            className="flex items-center gap-2"
          >
            {geocoding ? (
              <>
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Geocoding...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                Fix Pin Locations
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-2 max-w-32">
            Click to move pins to real addresses
          </p>
        </div>
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-background/95 backdrop-blur border rounded-lg px-3 py-2 text-sm">
          <span className="text-muted-foreground">Mapbox GL JS</span>
          <span className="ml-2 text-green-600 font-medium">Connected</span>
        </div>
      </div>
    </div>
  );
};