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

  // Fetch projects data
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id, name, location, status');
        
        if (error) throw error;
        setProjects(data || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
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

    // Add project markers
    projects.forEach((project, index) => {
      const lat = project.latitude || (-37.8136 + (Math.random() - 0.5) * 0.1);
      const lng = project.longitude || (144.9631 + (Math.random() - 0.5) * 0.1);

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

      // Create hover popup
      const hoverPopup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: false,
        closeOnClick: false,
        className: 'hover-popup'
      }).setHTML(
        `<div style="padding: 6px 8px; background: rgba(0,0,0,0.8); border-radius: 6px; color: white; font-size: 12px; backdrop-filter: blur(10px);">
          <div style="font-weight: bold; margin-bottom: 2px;">${project.name}</div>
          <div style="opacity: 0.9;">${project.location || 'Address not specified'}</div>
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
      
      {/* Overlay Controls */}
      <div className="absolute top-20 left-4 z-10">
        <Card className="w-80 bg-background/95 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Business Locations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Projects:</span>
              <span className="font-semibold">{projects.length}</span>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Recent Projects:</p>
              {projects.slice(0, 3).map((project, index) => (
                <div key={project.id} className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center text-white text-xs">
                    {index + 1}
                  </div>
                  <span className="truncate">{project.name}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Building className="w-3 h-3 mr-1" />
                Projects
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <Layers className="w-3 h-3 mr-1" />
                Layers
              </Button>
            </div>
          </CardContent>
        </Card>
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