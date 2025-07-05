import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { loadSavedView } from '@/utils/mapboxUtils';

export const useMapbox3D = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize Mapbox
    mapboxgl.accessToken = 'pk.eyJ1Ijoia2V2aW4xOTAzMTk5NCIsImEiOiJjbWNvdTU0aXcxOWxrMmtvamd0NjB6ajhjIn0.3mYQ3SZE_DQ0Qiz8t_IA6w';
    
    // Get saved view or use defaults
    const savedView = loadSavedView();
    const initialCenter = savedView?.center || [145.0, -37.0];
    const initialZoom = savedView?.zoom || 6.5;
    const initialBearing = savedView?.bearing || 0;
    const initialPitch = savedView?.pitch || 30;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      projection: 'mercator',
      zoom: initialZoom,
      center: initialCenter,
      pitch: initialPitch,
      bearing: initialBearing,
      antialias: true,
      maxBounds: [
        [140.5, -39.5], // Southwest coordinates
        [150.5, -33.5]  // Northeast coordinates  
      ]
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl());

    // Add scale control
    map.current.addControl(new mapboxgl.ScaleControl({
      maxWidth: 80,
      unit: 'metric'
    }));

    // 3D terrain and atmosphere effects
    map.current.on('style.load', () => {
      if (!map.current) return;
      
      // Add 3D terrain
      map.current.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14
      });
      
      map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

      // Add atmosphere and fog
      map.current.setFog({
        color: 'rgb(186, 210, 235)',
        'high-color': 'rgb(36, 92, 223)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 0.6
      });

      setIsLoaded(true);
    });

    // Auto-rotation functionality
    let userInteracting = false;
    let spinEnabled = true;
    const secondsPerRevolution = 120;
    const maxSpinZoom = 5;
    const slowSpinZoom = 3;

    function spinGlobe() {
      if (!map.current) return;
      
      const zoom = map.current.getZoom();
      if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
        let distancePerSecond = 360 / secondsPerRevolution;
        if (zoom > slowSpinZoom) {
          const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
          distancePerSecond *= zoomDif;
        }
        const center = map.current.getCenter();
        center.lng -= distancePerSecond;
        map.current.easeTo({ center, duration: 1000, easing: (n) => n });
      }
    }

    // Event listeners for user interaction
    const onMouseDown = () => { userInteracting = true; };
    const onMouseUp = () => { userInteracting = false; spinGlobe(); };
    const onTouchEnd = () => { userInteracting = false; spinGlobe(); };
    const onMoveEnd = () => { spinGlobe(); };

    map.current.on('mousedown', onMouseDown);
    map.current.on('touchstart', onMouseDown);
    map.current.on('mouseup', onMouseUp);
    map.current.on('touchend', onTouchEnd);
    map.current.on('moveend', onMoveEnd);

    // Start spinning
    spinGlobe();

    return () => {
      map.current?.remove();
    };
  }, []);

  return {
    mapContainer,
    map: map.current,
    isLoaded
  };
};