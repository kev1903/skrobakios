import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Globe, Layers } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useMenuBarSpacing } from '@/hooks/useMenuBarSpacing';
import { useCompany } from '@/contexts/CompanyContext';
import { useProjects as useProjectsHook } from '@/hooks/useProjects';

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
  const { currentCompany } = useCompany();
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


  // Fetch projects for current business context (auto-refreshes when company changes)
  useEffect(() => {
    const fetchCurrentBusinessProjects = async () => {
      try {
        // Resolve a company context even if CompanyContext hasn't populated yet
        let resolvedCompanyId: string | null = currentCompany?.id || null;
        let resolvedCompanyName: string | null = currentCompany?.name || null;

        if (!resolvedCompanyId) {
          // Try localStorage first (set by CompanyContext)
          const savedCompanyId = localStorage.getItem('currentCompanyId');
          if (savedCompanyId) {
            resolvedCompanyId = savedCompanyId;
            console.log(`🧭 Using saved company from localStorage: ${savedCompanyId}`);
          }
        }

        if (!resolvedCompanyId) {
          // Fallback to RPC which returns the first active company for the user
          const { data: rpcCompanyId, error: rpcErr } = await supabase.rpc('get_user_current_company_id');
          if (rpcErr) {
            console.warn('RPC get_user_current_company_id failed, will fetch with RLS fallback:', rpcErr.message);
          } else if (rpcCompanyId) {
            resolvedCompanyId = rpcCompanyId as string;
            console.log(`🧭 Using company from RPC: ${resolvedCompanyId}`);
          }
        }

        if (resolvedCompanyId) {
          console.log(`🔄 Company context: ${resolvedCompanyName || 'Unknown'} (${resolvedCompanyId}) - Fetching projects`);
          const { data, error } = await supabase
            .from('projects')
            .select('id,name,location,latitude,longitude,status,company_id')
            .eq('company_id', resolvedCompanyId)
            .order('created_at', { ascending: false });

          if (error) throw error;

          let rows = data || [];
          if (!rows.length) {
            console.log('🧯 No projects for resolved company yet, falling back to RLS fetch to ensure pins render');
            const { data: allData, error: allErr } = await supabase
              .from('projects')
              .select('id,name,location,latitude,longitude,status,company_id')
              .order('created_at', { ascending: false });
            if (allErr) throw allErr;
            rows = allData || [];
          }

          const projectsWithCompanyInfo = rows.map(p => ({
            ...p,
            company_name: resolvedCompanyName || 'Current Company'
          }));

          const geocodedCount = projectsWithCompanyInfo.filter(p => p.latitude && p.longitude).length;
          console.log(`✅ ${geocodedCount} projects have coordinates, ${projectsWithCompanyInfo.length - geocodedCount} using fallback`);
          setProjects(projectsWithCompanyInfo);
        } else {
          // Final fallback: rely on RLS to only return accessible projects
          console.log('🪢 No company resolved yet — fetching accessible projects via RLS');
          const { data, error } = await supabase
            .from('projects')
            .select('id,name,location,latitude,longitude,status,company_id')
            .order('created_at', { ascending: false });
          if (error) throw error;

          setProjects((data || []).map(p => ({ ...p, company_name: 'Accessible Company' })));
        }
      } catch (error) {
        console.error('Error fetching business projects:', error);
        setProjects([]);
      } finally {
      }
    };

    fetchCurrentBusinessProjects();
  }, [currentCompany]); // Refresh projects whenever the current company changes

  // Listen for company changes and emit events for debugging
  useEffect(() => {
    if (currentCompany) {
      console.log(`🗺️ BusinessMapbox: Active company is now ${currentCompany.name}`);
      // Emit a custom event that other components can listen to
      window.dispatchEvent(new CustomEvent('companyChanged', { 
        detail: { 
          companyId: currentCompany.id, 
          companyName: currentCompany.name 
        } 
      }));
    }
  }, [currentCompany]);

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

  // Initialize map only once when token and container are available
  useEffect(() => {
    console.log('🗺️ Map initialization check:', { 
      hasContainer: !!mapContainer.current, 
      hasToken: !!mapboxToken,
      hasMap: !!map.current
    });
    
    if (!mapContainer.current || !mapboxToken || map.current) {
      console.log('❌ Skipping map initialization - requirements not met or map already exists');
      return;
    }

    console.log('✅ Initializing new map instance');
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

    // Add navigation controls (hidden on mobile)
    if (window.innerWidth >= 768) {
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
    }

    // Add 3D buildings layer
    map.current.on('style.load', () => {
      if (!map.current) return;
      
      const layers = map.current.getStyle().layers;
      const labelLayerId = layers?.find(
        (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
      )?.id;

      map.current.addLayer(
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

    return () => {
      console.log('🧹 Cleaning up map instance');
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]); // Only depend on mapboxToken, not projects

  // Separate effect for updating markers when projects change
  useEffect(() => {
    if (!map.current || !projects.length) {
      console.log('🚫 Skipping marker update - no map or projects');
      return;
    }

    console.log(`🎯 Updating markers for ${projects.length} projects`);
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    let displayedCount = 0;
    projects.forEach((project, index) => {
      // Treat all projects as having valid coordinates for consistent blue markers
      const hasRealCoords = true; // Force all projects to use primary color
      
      // Ensure coordinates are properly parsed as numbers
      const hasValidCoords = project.latitude != null && project.longitude != null;
      const lat = hasValidCoords ? parseFloat(project.latitude.toString()) : (-37.8136 + (displayedCount * 0.005));
      const lng = hasValidCoords ? parseFloat(project.longitude.toString()) : (144.9631 + (displayedCount * 0.005));
      
      displayedCount++;
      
      console.log(`📍 Project "${project.name}": lng=${lng}, lat=${lat} (ALL PROJECTS CONSISTENT)`);
      
      // All projects now use consistent blue styling
      const isValidMelbourneCoord = hasValidCoords && 
        lat >= -39 && lat <= -36 && 
        lng >= 143 && lng <= 147;
      
      if (hasValidCoords && !isValidMelbourneCoord) {
        console.warn(`⚠️ Project "${project.name}" has coordinates outside Melbourne area: ${lat}, ${lng}`);
      }
      
      // Create enhanced marker with consistent primary color
      const markerColor = 'hsl(var(--primary, 221 83% 53%))';

      // Create enhanced marker with precise positioning
      const markerEl = document.createElement('div');
      markerEl.className = 'custom-marker';
      markerEl.style.cssText = `
        width: 28px;
        height: 28px;
        background: ${markerColor};
        border: 2px solid hsl(var(--background, 0 0% 100%));
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 4px 12px hsl(var(--primary, 221 83% 53%) / 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: none;
        pointer-events: auto;
      `;
      
      // Add numbered marker with consistent white text
      markerEl.innerHTML = `<div style="color: white; font-size: 11px; font-weight: 600;">${displayedCount}</div>`;

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
          <div class="font-semibold mb-2 text-foreground text-sm cursor-pointer hover:underline" style="color: hsl(var(--primary)); cursor: pointer;" onclick="window.projectNavigate('${project.id}')">${project.name}</div>
          <div class="text-muted-foreground text-xs mb-2">${project.location || 'Address not specified'}</div>
          <div class="text-xs text-muted-foreground mb-2">🏢 ${project.company_name || 'Unknown Company'}</div>
          <div class="text-xs px-2 py-1 rounded-md inline-block" style="background: hsl(var(--primary) / 0.1); color: hsl(var(--primary))">
            📍 Project Location
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
        markerEl.style.boxShadow = '0 6px 20px hsl(var(--primary) / 0.4)';
        markerEl.style.background = 'hsl(var(--primary))';
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
      // Clean up markers when projects change
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, [projects]); // Only update markers when projects change

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