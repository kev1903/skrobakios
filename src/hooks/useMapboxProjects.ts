import { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
  location: string | null;
  status: string | null;
  project_id: string;
  contract_price: string | null;
  description: string | null;
  created_at: string;
}

interface ProjectMarker {
  project: Project;
  marker: mapboxgl.Marker;
  coordinates: [number, number];
}

export const useMapboxProjects = (map: mapboxgl.Map | null, onNavigate: (page: string) => void) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectMarkers, setProjectMarkers] = useState<ProjectMarker[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const { toast } = useToast();

  // Fetch projects from Supabase
  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .not('location', 'is', null);

      if (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: "Error",
          description: "Failed to fetch projects",
          variant: "destructive",
        });
        return;
      }

      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to fetch projects",
        variant: "destructive",
      });
    } finally {
      setLoadingProjects(false);
    }
  };

  // Geocode address using Mapbox Geocoding API
  const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}&limit=1`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        return [lng, lat];
      }
      
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Add project markers to the map
  const addProjectMarkers = async () => {
    if (!map || projects.length === 0) return;

    // Clear existing markers
    projectMarkers.forEach(({ marker }) => marker.remove());
    setProjectMarkers([]);

    const newMarkers: ProjectMarker[] = [];

    for (const project of projects) {
      if (!project.location) continue;

      const coordinates = await geocodeAddress(project.location);
      if (!coordinates) continue;

      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'project-marker';
      markerElement.innerHTML = `
        <div class="w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
          </svg>
        </div>
      `;

      // Create marker
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat(coordinates)
        .addTo(map);

      // Create popup with project information
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div class="p-3 space-y-2">
            <h3 class="font-semibold text-lg text-gray-900">${project.name}</h3>
            <p class="text-sm text-gray-600">ID: ${project.project_id}</p>
            <p class="text-sm text-gray-600">Location: ${project.location}</p>
            ${project.status ? `<p class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 inline-block">Status: ${project.status}</p>` : ''}
            ${project.contract_price ? `<p class="text-sm font-medium text-green-600">Contract: ${project.contract_price}</p>` : ''}
            ${project.description ? `<p class="text-sm text-gray-700 mt-2">${project.description.substring(0, 100)}${project.description.length > 100 ? '...' : ''}</p>` : ''}
            <button onclick="window.selectProject('${project.id}')" class="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors">View Details</button>
          </div>
        `);

      marker.setPopup(popup);

      newMarkers.push({
        project,
        marker,
        coordinates
      });
    }

    setProjectMarkers(newMarkers);
    
    // Fit map to show all markers if there are any
    if (newMarkers.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      newMarkers.forEach(({ coordinates }) => bounds.extend(coordinates));
      map.fitBounds(bounds, { padding: 50, maxZoom: 10 });
    }

    toast({
      title: "Success",
      description: `${newMarkers.length} project${newMarkers.length !== 1 ? 's' : ''} positioned on map`,
    });
  };

  // Handle project selection from popup
  useEffect(() => {
    (window as any).selectProject = (projectId: string) => {
      onNavigate('project-detail');
    };

    return () => {
      delete (window as any).selectProject;
    };
  }, [onNavigate]);

  useEffect(() => {
    if (map) {
      fetchProjects();
    }
  }, [map]);

  useEffect(() => {
    if (projects.length > 0 && map) {
      addProjectMarkers();
    }
  }, [projects, map]);

  return {
    projects,
    projectMarkers,
    loadingProjects,
    fetchProjects
  };
};