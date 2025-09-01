import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';
import { useNavigate } from 'react-router-dom';
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
  latitude?: number | null;
  longitude?: number | null;
  geocoded_at?: string | null;
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
  const navigate = useNavigate();

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
        let lat: number | null = project.latitude ?? null;
        let lon: number | null = project.longitude ?? null;

        if (lat == null || lon == null) {
          console.log('🌍 Geocoding project:', project.name, 'at location:', project.location);
          // Use Nominatim for free geocoding as fallback when no stored coords
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              project.location + ', Victoria, Australia'
            )}&limit=1&countrycodes=au`
          );
          const data = await response.json();

          if (data && data.length > 0) {
            lat = parseFloat(data[0].lat);
            lon = parseFloat(data[0].lon);
            console.log('✅ Geocoded successfully:', project.name, 'to', lat, lon);
          }
        }

        if (lat != null && lon != null) {
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
            <div class="p-3">
              <h3 class="font-semibold text-gray-900 cursor-pointer hover:text-primary transition-colors" onclick="window.projectNavigate('${project.id}')">${project.name}</h3>
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

    // Add navigation controls (hidden on mobile)
    if (window.innerWidth >= 768) {
      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );

      // Add fullscreen control
      map.current.addControl(
        new mapboxgl.FullscreenControl(),
        'top-right'
      );
    }

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