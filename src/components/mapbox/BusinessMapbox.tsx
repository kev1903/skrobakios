import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Globe, Layers } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useMenuBarSpacing } from '@/hooks/useMenuBarSpacing';

interface Project {
  id: string;
  name: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  company_id?: string;
  company_name?: string;
}

export const BusinessMapbox: React.FC<{ className?: string }> = ({ className = '' }) => {
  console.log('BusinessMapbox component rendered - cache cleared');
  const { spacingClasses, fullHeightClasses } = useMenuBarSpacing();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  

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


  // Fetch ALL projects from ALL businesses for the map display
  useEffect(() => {
    const fetchAllBusinessProjects = async () => {
      try {
        console.log('🌍 Fetching projects from ALL businesses...');
        
        // Fetch ALL projects from ALL companies (no filtering by user membership)
        // This shows the complete business ecosystem on the map
        const { data, error } = await supabase
          .from('projects')
          .select(`
            id, 
            name, 
            location, 
            latitude, 
            longitude, 
            status,
            company_id,
            companies!inner(name)
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Transform the data to include company info
        const projectsWithCompanyInfo = data?.map(project => ({
          ...project,
          company_name: project.companies?.name || 'Unknown Company'
        })) || [];
        
        console.log(`📍 Loaded ${projectsWithCompanyInfo.length} total projects from all businesses`);
        console.log('🏢 Projects by company:', projectsWithCompanyInfo.reduce((acc, p) => {
          acc[p.company_name] = (acc[p.company_name] || 0) + 1;
          return acc;
        }, {} as Record<string, number>));
        
        const geocodedCount = projectsWithCompanyInfo.filter(p => p.latitude && p.longitude).length;
        console.log(`✅ ${geocodedCount} projects have coordinates, ${projectsWithCompanyInfo.length - geocodedCount} using fallback`);
        
        setProjects(projectsWithCompanyInfo);
        
      } catch (error) {
        console.error('Error fetching all business projects:', error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllBusinessProjects();
  }, []);

  // Set up global navigation function for popup clicks
  useEffect(() => {
    (window as any).projectNavigate = (projectId: string) => {
      try {
        console.log('Attempting to navigate to:', `/project-dashboard/${projectId}`);
        navigate(`/project-dashboard/${projectId}`);
      } catch (error) {
        console.error('Navigation error:', error);
        // Fallback: use window.location
        window.location.href = `/project-dashboard/${projectId}`;
      }
    };

    return () => {
      delete (window as any).projectNavigate;
    };
  }, [navigate]);

  // Initialize map
  useEffect(() => {
    console.log('🗺️ Map initialization:', { 
      hasContainer: !!mapContainer.current, 
      hasToken: !!mapboxToken, 
      projectsLength: projects.length,
      projects: projects.map(p => p.name) 
    });
    
    if (!mapContainer.current || !mapboxToken) {
      console.log('❌ Missing requirements for map initialization');
      return;
    }

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
    console.log(`🎯 Creating markers for ${projects.length} projects`);
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
      
      // Create enhanced marker with coordinate status using design system
      const markerColor = hasRealCoords ? 'hsl(var(--primary))' : 'hsl(var(--secondary))';

      // Create enhanced marker with precise positioning
      const markerEl = document.createElement('div');
      markerEl.className = 'custom-marker';
      markerEl.style.cssText = `
        width: 32px;
        height: 32px;
        background: ${markerColor};
        border: 3px solid hsl(var(--background));
        border-radius: 50%;
        cursor: pointer;
        box-shadow: var(--shadow-md);
        display: flex;
        align-items: center;
        justify-content: center;
        transform: translate(-50%, -50%);
        transition: none;
        pointer-events: auto;
      `;
      
      // Add coordinate status indicator
      if (hasRealCoords) {
        markerEl.innerHTML = `<div style="color: hsl(var(--primary-foreground)); font-size: 11px; font-weight: 600;">${displayedCount}</div>`;
      } else {
        markerEl.innerHTML = `<div style="color: hsl(var(--secondary-foreground)); font-size: 11px; font-weight: 600;">${displayedCount}</div>`;
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
        `<div class="bg-popover/95 backdrop-blur-md border border-border rounded-lg p-3 shadow-lg min-w-[200px]">
          <div class="font-semibold mb-2 text-foreground text-sm cursor-pointer hover:underline" style="color: ${hasRealCoords ? 'hsl(var(--primary))' : 'hsl(var(--warning))'}; cursor: pointer;" onclick="window.projectNavigate('${project.id}')">${project.name}</div>
          <div class="text-muted-foreground text-xs mb-2">${project.location || 'Address not specified'}</div>
          <div class="text-xs text-muted-foreground mb-2">🏢 ${project.company_name || 'Unknown Company'}</div>
          <div class="text-xs px-2 py-1 rounded-md inline-block" style="background: ${hasRealCoords ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--warning) / 0.1)'}; color: ${hasRealCoords ? 'hsl(var(--primary))' : 'hsl(var(--warning))'}">
            ${hasRealCoords ? '📍 Precise Location' : '⚠️ Approximate Position'}
          </div>
        </div>`
      );

      // Create click popup (detailed)
      const clickPopup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div class="bg-popover border border-border rounded-lg p-4 shadow-xl">
          <h3 class="font-semibold text-foreground text-sm mb-3 cursor-pointer hover:underline" style="cursor: pointer;" onclick="window.projectNavigate('${project.id}')">${project.name}</h3>
          <div class="mb-3">
            <span class="text-xs text-muted-foreground font-medium">COMPANY:</span>
            <div class="text-xs text-foreground mt-1">🏢 ${project.company_name || 'Unknown Company'}</div>
          </div>
          <div class="mb-3">
            <span class="text-xs text-muted-foreground font-medium">ADDRESS:</span>
            <div class="text-xs text-foreground mt-1">${project.location || 'Location not specified'}</div>
          </div>
          <div class="mt-3">
            <span class="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
              ${project.status || 'Active'}
            </span>
          </div>
        </div>`
      );

      // Enhanced hover effects with coordinate-based styling
      let hideTimeout: NodeJS.Timeout | null = null;
      
      markerEl.addEventListener('mouseenter', () => {
        // Clear any pending hide timeout
        if (hideTimeout) {
          clearTimeout(hideTimeout);
          hideTimeout = null;
        }
        
        // Don't scale the marker - it causes positioning issues
        markerEl.style.boxShadow = hasRealCoords ? 
          '0 6px 20px hsl(var(--primary) / 0.4)' : 
          '0 6px 20px hsl(var(--secondary) / 0.4)';
        markerEl.style.background = hasRealCoords ? 'hsl(var(--primary))' : 'hsl(var(--secondary))';
        // Use the marker's position instead of manual coordinates
        hoverPopup.setLngLat(marker.getLngLat()).addTo(map.current!);
        
        // Keep popup open when hovering over it
        const popupElement = document.querySelector('.hover-popup .mapboxgl-popup-content');
        if (popupElement) {
          popupElement.addEventListener('mouseenter', () => {
            if (hideTimeout) {
              clearTimeout(hideTimeout);
              hideTimeout = null;
            }
          });
          
          popupElement.addEventListener('mouseleave', () => {
            hideTimeout = setTimeout(() => {
              markerEl.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
              markerEl.style.background = markerColor;
              hoverPopup.remove();
            }, 200);
          });
        }
      });

      markerEl.addEventListener('mouseleave', () => {
        // Add delay before hiding popup
        hideTimeout = setTimeout(() => {
          markerEl.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
          markerEl.style.background = markerColor;
          hoverPopup.remove();
        }, 300); // 300ms delay
      });

      // Click effect
      markerEl.addEventListener('click', () => {
        // Remove hover popup when clicking
        if (hideTimeout) {
          clearTimeout(hideTimeout);
          hideTimeout = null;
        }
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
      <div className={`w-full h-full bg-background flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Globe className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading Mapbox...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full bg-background relative overflow-hidden ${className}`}>
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};