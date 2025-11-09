import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Globe, Layers, Lock, Cloud, CloudRain, Sun, Wind, Calendar, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useMenuBarSpacing } from '@/hooks/useMenuBarSpacing';
import { useCompany } from '@/contexts/CompanyContext';
import { useProjects as useProjectsHook } from '@/hooks/useProjects';
import { toast } from 'sonner';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { format } from 'date-fns';

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
  const [mapReady, setMapReady] = useState(false);
  const [weather, setWeather] = useState<{
    temperature: number;
    description: string;
    windSpeed: number;
    humidity: number;
    location: string;
    forecast?: Array<{
      date: string;
      weatherCode: number;
      tempMax: number;
      tempMin: number;
      precipitationProb: number;
      windSpeed: number;
      description: string;
    }>;
  } | null>(null);
  
  const navigate = useNavigate();
  const { hasModuleAccess, loading: permissionsLoading } = useUserPermissions(currentCompany?.id || '');
  


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
          toast.error('Map configuration missing. Please contact support.');
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

  // Fetch live weather data
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-weather', {
          body: { latitude: -37.8136, longitude: 144.9631 } // Melbourne coordinates
        });
        
        if (error) throw error;
        
        if (data) {
          setWeather(data);
          console.log('Weather data fetched:', data);
        }
      } catch (error) {
        console.error('Error fetching weather:', error);
      }
    };

    fetchWeather();
    // Refresh weather every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
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
          // SECURITY: Never fetch all projects - only show projects for the resolved company
          if (!rows.length) {
            console.log('✅ No projects found for company. This is correct - showing empty map.');
          }

          const projectsWithCompanyInfo = rows.map(p => ({
            ...p,
            company_name: resolvedCompanyName || 'Current Company'
          }));

          const geocodedCount = projectsWithCompanyInfo.filter(p => p.latitude && p.longitude).length;
          console.log(`✅ ${geocodedCount} projects have coordinates, ${projectsWithCompanyInfo.length - geocodedCount} using fallback`);
          setProjects(projectsWithCompanyInfo);
        } else {
          // SECURITY: Never fetch all projects - only show empty map if no company is resolved
          console.log('🔒 No company resolved - showing empty map for security');
          setProjects([]);
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
        console.log('Navigating to project dashboard:', projectId);
        navigate(`/?page=project-detail&projectId=${projectId}`);
      } catch (error) {
        console.error('Navigation error:', error);
      }
    };

    return () => {
      delete (window as any).projectNavigate;
    };
  }, [navigate]);

  // Initialize map only once when token and container are available
  useEffect(() => {
    // Add a small delay to ensure the container is fully mounted in the DOM
    const initMap = () => {
      console.log('🗺️ Map initialization check:', {
        hasContainer: !!mapContainer.current, 
        hasToken: !!mapboxToken,
        hasMap: !!map.current,
        containerInDOM: mapContainer.current?.isConnected
      });
      
      if (!mapContainer.current || !mapboxToken || map.current) {
        console.log('❌ Skipping map initialization - requirements not met or map already exists');
        return;
      }

      // Extra safety check: ensure container is in the DOM
      if (!mapContainer.current.isConnected) {
        console.log('⏳ Container not yet in DOM, retrying...');
        setTimeout(initMap, 50);
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

      // Signal readiness when map fully loads
      map.current.on('load', () => {
        console.log('✅ Mapbox map loaded');
        setMapReady(true);
      });
    };
    
    // Start initialization with a small delay to ensure container is ready
    const timeoutId = setTimeout(initMap, 10);
    
    return () => {
      clearTimeout(timeoutId);
      console.log('🧹 Cleaning up map instance');
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      setMapReady(false);
    };
  }, [mapboxToken]); // Only depend on mapboxToken, not projects

  // Separate effect for updating markers when projects change
  useEffect(() => {
    if (!mapReady || !map.current || !projects.length) {
      console.log('🚫 Skipping marker update - map not ready or no projects', { mapReady, mapExists: !!map.current, projects: projects.length });
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

      // Create simplified hover popup
      const hoverPopup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: false,
        closeOnClick: false,
        className: 'hover-popup'
      }).setHTML(
        `<div style="background: transparent !important; backdrop-filter: blur(8px); border: 1px solid hsl(var(--border)); border-radius: 8px; padding: 12px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
          <div class="font-semibold cursor-pointer hover:underline" style="color: hsl(var(--primary)); cursor: pointer;" onclick="window.projectNavigate('${project.id}')">${project.name}</div>
        </div>`
      );

      // Create simplified click popup
      const clickPopup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div style="background: transparent !important; backdrop-filter: blur(8px); border: 1px solid hsl(var(--border)); border-radius: 8px; padding: 12px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
          <h3 class="font-semibold cursor-pointer hover:underline" style="cursor: pointer;" onclick="window.projectNavigate('${project.id}')">${project.name}</h3>
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
  }, [projects, mapReady]); // Update markers when projects or map readiness changes

  if (loading || permissionsLoading) {
    return (
      <div className={`w-full h-full bg-background flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Globe className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading Mapbox...</p>
        </div>
      </div>
    );
  }

  if (!hasModuleAccess('projects')) {
    return (
      <div className={`w-full h-full bg-background flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Access Denied</h3>
          <p className="text-sm text-muted-foreground">
            You don't have permission to view the Project Map.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Contact your administrator to request access to the Projects module.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Custom CSS to override Mapbox popup backgrounds */}
      <style>{`
        .hover-popup .mapboxgl-popup-content,
        .mapboxgl-popup-content {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          border-radius: 0 !important;
        }
        .hover-popup .mapboxgl-popup-tip,
        .mapboxgl-popup-tip {
          border-top-color: transparent !important;
          border-bottom-color: transparent !important;
        }
      `}</style>
      <div className={`w-full h-full bg-background relative overflow-hidden ${className}`}>
        {/* Map Container */}
        <div ref={mapContainer} className="w-full h-full" />
        
        {/* Glass Morphism Dashboard Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="container mx-auto h-full p-6 pointer-events-none">
            {/* Glass Cards Grid */}
            <div className="grid grid-cols-12 gap-4 pointer-events-auto">
              {/* Row 1 */}
              {/* Weather Card - Compact 5-Day Forecast */}
              <Card className="col-span-3 backdrop-blur-xl bg-gradient-to-br from-gray-900/80 to-gray-800/70 border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)] transition-all duration-300 animate-scale-in">
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-0.5">Weather Forecast</h3>
                      <p className="text-[10px] text-white/50">{weather?.location || 'Loading...'}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-end gap-1">
                        <span className="text-2xl font-light text-white">
                          {weather ? weather.temperature : '--'}°
                        </span>
                      </div>
                      <p className="text-[10px] text-white/60 capitalize">{weather?.description || 'Loading...'}</p>
                    </div>
                  </div>

                  {/* 5-Day Forecast - Compact */}
                  <div className="space-y-2">
                    {weather?.forecast?.slice(0, 5).map((day, index) => {
                      const date = new Date(day.date);
                      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                      const dateNum = date.getDate();
                      const month = date.toLocaleDateString('en-US', { month: 'short' });
                      
                      // Determine weather conditions
                      const isRainy = day.weatherCode >= 51 && day.weatherCode <= 99;
                      const isClear = day.weatherCode <= 1;
                      const isWindy = day.windSpeed > 30;
                      
                      return (
                        <div 
                          key={index} 
                          className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                        >
                          {/* Date */}
                          <div className="text-center min-w-[40px]">
                            <p className="text-[9px] text-white/50">{dayName}</p>
                            <p className="text-sm font-semibold text-white leading-none">{dateNum}</p>
                            <p className="text-[8px] text-white/40">{month}</p>
                          </div>

                          {/* Weather Icon */}
                          <div className="flex-shrink-0">
                            {isRainy ? (
                              <CloudRain className="w-5 h-5 text-cyan-400" />
                            ) : isClear ? (
                              <Sun className="w-5 h-5 text-yellow-400" />
                            ) : (
                              <Cloud className="w-5 h-5 text-white/60" />
                            )}
                          </div>

                          {/* Weather Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-white font-medium truncate capitalize">{day.description}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-white/60">
                                {day.tempMax}°/{day.tempMin}°
                              </span>
                              {day.precipitationProb > 30 && (
                                <span className="text-[9px] text-cyan-400">{day.precipitationProb}%</span>
                              )}
                            </div>
                          </div>

                          {/* Work Icons */}
                          <div className="flex gap-1">
                            {isWindy && <Wind className="w-3.5 h-3.5 text-blue-400" />}
                            {isRainy && <CloudRain className="w-3.5 h-3.5 text-cyan-400" />}
                            {isClear && !isWindy && <Sun className="w-3.5 h-3.5 text-yellow-400" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Active Projects Card */}
              <Card className="col-span-3 backdrop-blur-xl bg-white/10 border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 animate-scale-in" style={{ animationDelay: '0.1s' }}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="w-5 h-5 text-luxury-gold" />
                    <p className="text-sm font-medium text-foreground">Active Now</p>
                  </div>
                  <div className="flex items-center justify-center h-20">
                    <div className="relative w-20 h-20">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                        <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray={`${226 * 0.75} 226`} className="text-luxury-gold" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-foreground">{projects.length}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-2">Projects In Progress</p>
                </CardContent>
              </Card>

              {/* Weekly Activity */}
              <Card className="col-span-3 backdrop-blur-xl bg-white/10 border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 animate-scale-in" style={{ animationDelay: '0.2s' }}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <BarChart3 className="w-5 h-5 text-luxury-gold" />
                    <p className="text-sm font-medium text-foreground">This Week</p>
                  </div>
                  <div className="flex items-end gap-1 h-20">
                    {[40, 65, 45, 80, 60, 90, 75].map((height, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-luxury-gold/80 to-luxury-gold/40 rounded-t" style={{ height: `${height}%` }} />
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="col-span-3 backdrop-blur-xl bg-gradient-to-br from-gray-900/80 to-gray-800/70 border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)] transition-all duration-300 animate-scale-in" style={{ animationDelay: '0.3s' }}>
                <CardContent className="p-6">
                  <p className="text-sm text-white/70 mb-4">Workforce Analytics</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/60">Active Teams</span>
                      <span className="text-lg font-semibold text-white">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/60">Completed Tasks</span>
                      <span className="text-lg font-semibold text-white">847</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/60">Team Members</span>
                      <span className="text-lg font-semibold text-white">45</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Row 2 */}
              {/* Calendar Preview */}
              <Card className="col-span-4 backdrop-blur-xl bg-white/10 border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 animate-scale-in" style={{ animationDelay: '0.4s' }}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-5 h-5 text-luxury-gold" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{format(new Date(), 'MMMM yyyy')}</p>
                      <p className="text-xs text-muted-foreground">Schedule Overview</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <div key={day} className="text-[10px] text-center text-muted-foreground font-medium">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`aspect-square rounded flex items-center justify-center text-xs ${
                          i === 8 ? 'bg-luxury-gold text-white font-semibold' : 
                          i % 7 === 0 || i % 7 === 6 ? 'text-muted-foreground/50' :
                          'text-foreground hover:bg-accent/50'
                        }`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card className="col-span-4 backdrop-blur-xl bg-white/10 border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 animate-scale-in" style={{ animationDelay: '0.5s' }}>
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-foreground mb-4">Performance Metrics</p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="relative">
                      <svg className="w-24 h-24 -rotate-90 mx-auto">
                        <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                        <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray={`${251 * 0.92} 251`} className="text-emerald-500" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-foreground">92%</span>
                        <span className="text-[10px] text-muted-foreground">Efficiency</span>
                      </div>
                    </div>
                    <div className="relative">
                      <svg className="w-24 h-24 -rotate-90 mx-auto">
                        <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                        <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray={`${251 * 0.78} 251`} className="text-luxury-gold" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-foreground">78%</span>
                        <span className="text-[10px] text-muted-foreground">Quality</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Project Locations */}
              <Card className="col-span-4 backdrop-blur-xl bg-white/10 border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 animate-scale-in" style={{ animationDelay: '0.6s' }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-foreground">Project Distribution</p>
                    <Globe className="w-5 h-5 text-luxury-gold" />
                  </div>
                  <div className="relative h-24 flex items-center justify-center">
                    <svg viewBox="0 0 200 100" className="w-full h-full text-foreground/80">
                      <path d="M20,50 Q60,20 100,50 T180,50" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
                      <circle cx="20" cy="50" r="3" fill="currentColor" className="text-luxury-gold" />
                      <circle cx="100" cy="50" r="3" fill="currentColor" className="text-luxury-gold" />
                      <circle cx="180" cy="50" r="3" fill="currentColor" className="text-luxury-gold" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-foreground">{projects.length}</p>
                        <p className="text-xs text-muted-foreground">Active Sites</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};