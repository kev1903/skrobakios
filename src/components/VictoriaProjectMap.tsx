import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Building2, Calendar, DollarSign } from 'lucide-react';

interface Project {
  id: string;
  project_id: string;
  name: string;
  location: string;
  status: string;
  contract_price?: string;
  start_date?: string;
  deadline?: string;
  priority?: string;
}

interface VictoriaProjectMapProps {
  className?: string;
}

const VictoriaProjectMap: React.FC<VictoriaProjectMapProps> = ({ className = "w-full h-full" }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentCompany } = useCompany();

  // Fetch Mapbox token
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        // Add timestamp to force refresh
        const { data, error } = await supabase.functions.invoke('get-mapbox-token', {
          body: { timestamp: Date.now() }
        });
        if (!error && data?.token) {
          console.log('🗺️ VictoriaProjectMap: New Mapbox token fetched:', data.token.substring(0, 20) + '...');
          setMapboxToken(data.token);
        } else {
          console.warn('Mapbox token not configured in secrets');
        }
      } catch (error) {
        console.warn('Could not fetch Mapbox token:', error);
      }
    };

    fetchMapboxToken();
  }, []);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      if (!currentCompany) return;

      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('company_id', currentCompany.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching projects:', error);
        } else {
          setProjects(data || []);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [currentCompany]);

  // Clear existing markers
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };

  // Geocode addresses and add markers
  const addProjectMarkers = async () => {
    if (!map.current || projects.length === 0) return;

    console.log('🗺️ Adding markers for projects:', projects.length);
    
    // Clear existing markers first
    clearMarkers();

    const bounds = new mapboxgl.LngLatBounds();
    let markersAdded = 0;

    for (const project of projects) {
      if (!project.location) continue;

      try {
        console.log('🌍 Geocoding project:', project.name, 'at location:', project.location);
        
        // Use Nominatim for free geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            project.location + ', Victoria, Australia'
          )}&limit=1&countrycodes=au`
        );
        const data = await response.json();

        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          console.log('✅ Geocoded successfully:', project.name, 'to', lat, lon);

          // Create custom marker element
          const markerEl = document.createElement('div');
          markerEl.className = 'project-marker';
          markerEl.innerHTML = `
            <div class="relative">
              <div class="w-8 h-8 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rotate-45"></div>
            </div>
          `;

          // Create popup content
          const popupContent = `
            <div class="p-4 max-w-sm">
              <div class="flex items-start gap-3 mb-3">
                <div class="p-2 bg-primary/10 rounded-lg">
                  <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1.447.894L10 15.382l-4.553 1.512A1 1 0 014 16V4zm2 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 2a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold text-lg text-gray-900 mb-1">${project.name}</h3>
                  <p class="text-sm text-gray-600">${project.project_id}</p>
                </div>
              </div>
              
              <div class="space-y-2 mb-3">
                <div class="flex items-center gap-2 text-sm">
                  <svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="text-gray-700">${project.location}</span>
                </div>
                
                <div class="flex items-center gap-2 text-sm">
                  <div class="w-2 h-2 rounded-full ${
                    project.status === 'completed' ? 'bg-green-500' :
                    project.status === 'in_progress' ? 'bg-blue-500' :
                    project.status === 'pending' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }"></div>
                  <span class="text-gray-700 capitalize">${project.status || 'pending'}</span>
                </div>
              </div>

              ${project.contract_price ? `
                <div class="flex items-center gap-2 text-sm mb-2">
                  <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="text-gray-700 font-medium">$${parseFloat(project.contract_price).toLocaleString()}</span>
                </div>
              ` : ''}

              ${project.deadline ? `
                <div class="flex items-center gap-2 text-sm">
                  <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="text-gray-700">Due: ${new Date(project.deadline).toLocaleDateString()}</span>
                </div>
              ` : ''}
            </div>
          `;

          const popup = new mapboxgl.Popup({
            offset: [0, -40],
            closeButton: true,
            closeOnClick: false,
            className: 'project-popup'
          }).setHTML(popupContent);

          // Add marker to map
          const marker = new mapboxgl.Marker(markerEl)
            .setLngLat([lon, lat])
            .setPopup(popup)
            .addTo(map.current);

          // Store marker reference for cleanup
          markersRef.current.push(marker);

          bounds.extend([lon, lat]);
          markersAdded++;
        } else {
          console.warn('❌ No geocoding results for:', project.location);
        }
      } catch (error) {
        console.error('❌ Failed to geocode location:', project.location, error);
      }
    }

    // Fit map to show all markers
    if (markersAdded > 0) {
      console.log('🎯 Fitting map bounds for', markersAdded, 'markers');
      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 15
      });
    } else {
      console.warn('⚠️ No markers were added to the map');
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [144.9631, -37.8136], // Melbourne, Victoria
      zoom: 8
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Add fullscreen control
    map.current.addControl(
      new mapboxgl.FullscreenControl(),
      'top-right'
    );

    map.current.on('load', () => {
      console.log('🗺️ Map loaded, ready for markers');
      if (projects.length > 0) {
        addProjectMarkers();
      }
    });

    // Cleanup
    return () => {
      clearMarkers();
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Add markers when projects change
  useEffect(() => {
    if (map.current && projects.length > 0) {
      console.log('📍 Projects updated, adding markers...');
      addProjectMarkers();
    }
  }, [projects]);

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center bg-slate-100 rounded-lg`}>
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Loading Victoria Project Map</h3>
          <p className="text-sm text-slate-500">Fetching your projects and locations...</p>
        </div>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className={`${className} flex items-center justify-center bg-slate-100 rounded-lg`}>
        <div className="text-center p-8">
          <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Victoria Project Map</h3>
          <p className="text-sm text-slate-500 mb-4">
            Mapbox token not configured. Please configure your Mapbox token to enable the interactive map.
          </p>
          <p className="text-xs text-slate-400">
            Get your free token at <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">mapbox.com</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-lg" />
      
      {/* Map overlay with project count */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Victoria Projects</h3>
            <p className="text-sm text-gray-600">{projects.length} project{projects.length !== 1 ? 's' : ''} mapped</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 z-10">
        <h4 className="font-semibold text-gray-900 mb-2">Project Status</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VictoriaProjectMap;