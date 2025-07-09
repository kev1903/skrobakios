import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { HomeFloatingBar } from '@/components/HomeFloatingBar';
import { ChatBox } from '@/components/ChatBox';
import { CenteredCompanyName } from '@/components/CenteredCompanyName';
import { AiChatBar } from '@/components/AiChatBar';

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

  // Load map configuration only once
  useEffect(() => {
    const loadMapConfiguration = async () => {
      try {
        const { data: config, error: configError } = await supabase
          .from('map_configurations')
          .select('*')
          .eq('is_active', true)
          .maybeSingle();

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
  }, []);

  // Initialize map when component mounts and mapConfig is ready
  useEffect(() => {
    const initializeMapWithProjects = async () => {
      if (!mapContainer.current || map.current) return; // Prevent multiple initializations

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

        // Wait for map to load, then add project markers
        map.current.on('style.load', async () => {
          if (projectsData && projectsData.length > 0 && map.current) {
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
      if (!map.current || !map.current.getContainer()) return;

      // Geocode project addresses and add markers
      for (const project of projects) {
        if (!project.location) continue;
        
        const coordinates = await geocodeAddress(project.location);
        if (!coordinates) continue;

        // Create marker element with hover effects
        const markerElement = document.createElement('div');
        markerElement.className = 'project-marker';
        markerElement.innerHTML = `
          <div class="marker-pin" style="
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
            transition: all 0.2s ease;
          ">
            <div style="color: white; font-size: 10px; font-weight: bold;">P</div>
          </div>
        `;

        // Create hover tooltip
        const hoverTooltip = document.createElement('div');
        hoverTooltip.className = 'hover-tooltip';
        hoverTooltip.style.cssText = `
          position: absolute;
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 500;
          color: hsl(var(--foreground));
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          white-space: nowrap;
          pointer-events: none;
          z-index: 1000;
          transform: translateY(-100%);
          margin-top: -8px;
          display: none;
        `;
        hoverTooltip.textContent = project.name;
        markerElement.appendChild(hoverTooltip);

        // Add hover effects
        markerElement.addEventListener('mouseenter', () => {
          const pin = markerElement.querySelector('.marker-pin') as HTMLElement;
          if (pin) {
            pin.style.transform = 'scale(1.1)';
            pin.style.backgroundColor = '#2563eb';
          }
          hoverTooltip.style.display = 'block';
        });

        markerElement.addEventListener('mouseleave', () => {
          const pin = markerElement.querySelector('.marker-pin') as HTMLElement;
          if (pin) {
            pin.style.transform = 'scale(1)';
            pin.style.backgroundColor = '#3b82f6';
          }
          hoverTooltip.style.display = 'none';
        });

        // Add click handler to the pin itself
        markerElement.addEventListener('click', (e) => {
          e.stopPropagation();
          if (onSelectProject) {
            onSelectProject(project.id);
          }
        });

        // Create redesigned popup with better styling and proper alignment
        const popupContent = document.createElement('div');
        popupContent.style.cssText = `
          min-width: 300px;
          max-width: 350px;
          padding: 0;
          font-family: ui-sans-serif, system-ui, sans-serif;
          border-radius: 12px;
          overflow: hidden;
        `;

        popupContent.innerHTML = `
          <div style="
            padding: 24px;
            border-bottom: 1px solid hsl(var(--border));
          ">
            <h3 style="
              margin: 0 0 16px 0; 
              font-size: 18px;
              font-weight: 600;
              color: hsl(var(--foreground));
              line-height: 1.3;
              padding-right: 20px;
            ">${project.name}</h3>
            
            <div style="
              display: flex;
              flex-direction: column;
              gap: 12px;
            ">
              <div style="
                display: flex;
                align-items: center;
                justify-content: space-between;
              ">
                <span style="
                  font-size: 12px;
                  color: hsl(var(--muted-foreground));
                  font-weight: 500;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                ">ID</span>
                <span style="
                  font-size: 12px;
                  color: hsl(var(--foreground));
                  font-family: 'SF Mono', 'Monaco', 'Cascadia Code', monospace;
                  background: hsl(var(--muted));
                  padding: 4px 8px;
                  border-radius: 6px;
                  font-weight: 500;
                ">${project.project_id}</span>
              </div>
              
              <div style="
                display: flex;
                align-items: center;
                justify-content: space-between;
              ">
                <span style="
                  font-size: 12px;
                  color: hsl(var(--muted-foreground));
                  font-weight: 500;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                ">Status</span>
                <span style="
                  font-size: 12px;
                  color: hsl(var(--primary));
                  font-weight: 600;
                  background: hsl(var(--primary) / 0.1);
                  padding: 4px 12px;
                  border-radius: 12px;
                  text-transform: capitalize;
                ">${project.status || 'Unknown'}</span>
              </div>
            </div>
            
            ${project.description ? `
              <div style="
                margin-top: 16px;
                padding-top: 16px;
                border-top: 1px solid hsl(var(--border));
              ">
                <p style="
                  margin: 0;
                  font-size: 14px;
                  color: hsl(var(--muted-foreground));
                  line-height: 1.5;
                ">${project.description}</p>
              </div>
            ` : ''}
          </div>
          
          <div style="
            padding: 20px 24px;
          ">
            <button id="open-project-btn" style="
              width: 100%;
              background: hsl(var(--foreground));
              color: hsl(var(--background));
              border: none;
              border-radius: 8px;
              padding: 12px 20px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s ease;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            " 
            onmouseover="this.style.background='hsl(var(--foreground) / 0.9)'; this.style.transform='translateY(-1px)'" 
            onmouseout="this.style.background='hsl(var(--foreground))'; this.style.transform='translateY(0)'">
              <span>OPEN PROJECT</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 17L17 7"></path>
                <path d="M7 7h10v10"></path>
              </svg>
            </button>
          </div>
        `;

        const popup = new mapboxgl.Popup({ 
          offset: 25,
          closeButton: true,
          closeOnClick: true,
          className: 'custom-popup'
        }).setDOMContent(popupContent);

        // Style the close button after popup opens
        popup.on('open', () => {
          // Style the close button
          const closeButton = document.querySelector('.mapboxgl-popup-close-button') as HTMLElement;
          if (closeButton) {
            closeButton.style.cssText = `
              position: absolute;
              right: 8px;
              top: 8px;
              width: 32px;
              height: 32px;
              background: hsl(var(--muted));
              color: hsl(var(--foreground));
              border: none;
              border-radius: 50%;
              font-size: 18px;
              font-weight: 700;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.2s ease;
              z-index: 1000;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            `;
            
            closeButton.addEventListener('mouseenter', () => {
              closeButton.style.background = 'hsl(var(--destructive))';
              closeButton.style.color = 'hsl(var(--destructive-foreground))';
              closeButton.style.transform = 'scale(1.1)';
            });
            
            closeButton.addEventListener('mouseleave', () => {
              closeButton.style.background = 'hsl(var(--muted))';
              closeButton.style.color = 'hsl(var(--foreground))';
              closeButton.style.transform = 'scale(1)';
            });
          }
        });

        // Add click handler for the OPEN PROJECT button
        popup.on('open', () => {
          const openBtn = document.getElementById('open-project-btn');
          if (openBtn && onSelectProject) {
            openBtn.addEventListener('click', () => {
              onSelectProject(project.id);
              popup.remove();
            });
          }
        });

        // Create and add marker to map - with error handling
        try {
          if (map.current && map.current.getContainer()) {
            new mapboxgl.Marker(markerElement)
              .setLngLat(coordinates)
              .setPopup(popup)
              .addTo(map.current);
          }
        } catch (error) {
          console.error('Error adding marker:', error);
        }
      }
    };

    // Only initialize if we have a valid config (either loaded or default)
    const timer = setTimeout(() => {
      initializeMapWithProjects();
    }, 100); // Small delay to ensure mapConfig is set

    // Cleanup
    return () => {
      clearTimeout(timer);
      if (map.current) {
        try {
          map.current.remove();
          map.current = null;
        } catch (error) {
          console.error('Error cleaning up map:', error);
        }
      }
    };
  }, [mapConfig.center, mapConfig.zoom, mapConfig.pitch, mapConfig.bearing]); // Only re-run if map config actually changes

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-black/10" />
      
      {/* Floating Top Bar */}
      <HomeFloatingBar 
        onNavigate={onNavigate} 
        onSelectProject={onSelectProject}
        showSaveButton={showSaveButton}
        onSaveMapPosition={saveCurrentMapPosition}
      />
      
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
      
      {/* AI Chat Bar */}
      <AiChatBar />
    </div>
  );
};