import { useToast } from '@/hooks/use-toast';

export const useMapboxView = () => {
  const { toast } = useToast();

  const saveCurrentView = (map: mapboxgl.Map | null) => {
    if (!map) {
      toast({
        title: "Error",
        description: "Map not initialized",
        variant: "destructive",
      });
      return;
    }
    
    const center = map.getCenter();
    const zoom = map.getZoom();
    const bearing = map.getBearing();
    const pitch = map.getPitch();
    
    const viewState = {
      center: [center.lng, center.lat],
      zoom,
      bearing,
      pitch,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem('mapbox-saved-view', JSON.stringify(viewState));
      
      toast({
        title: "View Saved Successfully",
        description: `Position saved: Zoom ${zoom.toFixed(1)}, Pitch ${pitch.toFixed(0)}°`,
      });
      
      console.log('Saved view state:', viewState);
    } catch (error) {
      console.error('Error saving view:', error);
      toast({
        title: "Error",
        description: "Failed to save view position",
        variant: "destructive",
      });
    }
  };

  const loadSavedView = () => {
    try {
      const savedView = localStorage.getItem('mapbox-saved-view');
      if (savedView) {
        const parsedView = JSON.parse(savedView);
        console.log('Loading saved view:', parsedView);
        return parsedView;
      }
      console.log('No saved view found, using defaults');
    } catch (error) {
      console.error('Error loading saved view:', error);
    }
    return null;
  };

  return {
    saveCurrentView,
    loadSavedView
  };
};