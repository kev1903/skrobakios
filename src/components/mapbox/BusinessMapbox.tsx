import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Globe, Layers } from 'lucide-react';
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
  console.log('BusinessMapbox component rendered - cache cleared');
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
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
        
        // All projects loaded
        
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

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

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

    // Add project markers with PRECISE coordinates
    let displayedCount = 0;
    projects.forEach((project, index) => {
      // Use REAL coordinates if available, otherwise use ORGANIZED fallback positions
      const hasRealCoords = project.latitude != null && project.longitude != null;
      
      // Ensure coordinates are properly parsed as numbers
      const lat = hasRealCoords ? parseFloat(project.latitude.toString()) : (-37.8136 + (displayedCount * 0.005));
      const lng = hasRealCoords ? parseFloat(project.longitude.toString()) : (144.9631 + (displayedCount * 0.005));
      
      displayedCount++;
      
      console.log(`📍 Project "${project.name}": lng=${lng}, lat=${lat} ${hasRealCoords ? '(REAL COORDINATES)' : '(FALLBACK POSITION)'}`);
      
      // Validate coordinates are within reasonable bounds for Melbourne area
      const isValidMelbourneCoord = hasRealCoords && 
        lat >= -39 && lat <= -36 && 
        lng >= 143 && lng <= 147;
      
      if (hasRealCoords && !isValidMelbourneCoord) {
        console.warn(`⚠️ Project "${project.name}" has coordinates outside Melbourne area: ${lat}, ${lng}`);
      }
      
      // Create enhanced marker with coordinate status
      const markerColor = hasRealCoords ? '#10b981' : '#3b82f6'; // Green for real, blue for fallback

      // Create enhanced marker with precise positioning
      const markerEl = document.createElement('div');
      markerEl.className = 'custom-marker';
      markerEl.style.cssText = `
        width: 32px;
        height: 32px;
        background: ${markerColor};
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        transform: scale(1);
        position: relative;
      `;
      
      // Add coordinate status indicator
      if (hasRealCoords) {
        markerEl.innerHTML = `
          <div style="color: white; font-size: 11px; font-weight: bold;">${displayedCount}</div>
          <div style="position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background: #22c55e; border: 1px solid white; border-radius: 50%;"></div>
        `;
      } else {
        markerEl.innerHTML = `<div style="color: white; font-size: 11px; font-weight: bold;">${displayedCount}</div>`;
      }

      // Add marker to map and store reference
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([lng, lat])
        .addTo(map.current!);
      
      // Store marker reference so it persists
      markersRef.current.push(marker);

      // Create enhanced hover popup with coordinate accuracy
      const hoverPopup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: false,
        closeOnClick: false,
        className: 'hover-popup'
      }).setHTML(
        `<div style="padding: 8px 10px; background: rgba(0,0,0,0.9); border-radius: 8px; color: white; font-size: 12px; backdrop-filter: blur(10px); min-width: 200px;">
          <div style="font-weight: bold; margin-bottom: 4px; color: ${hasRealCoords ? '#22c55e' : '#fbbf24'};">${project.name}</div>
          <div style="opacity: 0.9; margin-bottom: 4px;">${project.location || 'Address not specified'}</div>
          <div style="opacity: 0.8; font-size: 10px; padding: 2px 6px; background: ${hasRealCoords ? 'rgba(34, 197, 94, 0.2)' : 'rgba(251, 191, 36, 0.2)'} ; border-radius: 4px; display: inline-block;">
            ${hasRealCoords ? '📍 Precise Location' : '⚠️ Approximate Position'}
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

      // Enhanced hover effects with coordinate-based styling
      markerEl.addEventListener('mouseenter', () => {
        // Don't scale the marker - it causes positioning issues
        markerEl.style.boxShadow = hasRealCoords ? 
          '0 6px 20px rgba(34, 197, 94, 0.4)' : 
          '0 6px 20px rgba(59, 130, 246, 0.4)';
        markerEl.style.background = hasRealCoords ? '#16a34a' : '#2563eb';
        // Use the marker's position instead of manual coordinates
        hoverPopup.setLngLat(marker.getLngLat()).addTo(map.current!);
      });

      markerEl.addEventListener('mouseleave', () => {
        markerEl.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        markerEl.style.background = markerColor;
        hoverPopup.remove();
      });

      // Click effect
      markerEl.addEventListener('click', () => {
        // Remove hover popup when clicking
        hoverPopup.remove();
        const markerPosition = marker.getLngLat();
        clickPopup.setLngLat(markerPosition).addTo(map.current!);
        map.current?.flyTo({
          center: markerPosition,
          zoom: 15,
          duration: 2000
        });
      });
    });

    return () => {
      // Clean up markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      // Clean up map
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