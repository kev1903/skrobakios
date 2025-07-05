import { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { geocodeAddress, createProjectMarkerElement, createProjectPopupContent } from '@/utils/mapboxUtils';

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

export const useProjectMarkers = (map: mapboxgl.Map | null, isLoaded: boolean) => {
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
      const markerElement = createProjectMarkerElement(project.id);

      // Create marker
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat(coordinates)
        .addTo(map);

      // Create popup with project information
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(createProjectPopupContent(project));

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

  // Fetch projects when map is loaded
  useEffect(() => {
    if (isLoaded) {
      fetchProjects();
    }
  }, [isLoaded]);

  // Add markers when projects are loaded
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