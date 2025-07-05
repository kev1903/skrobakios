import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navigation, Globe, Map, Layers, Settings } from 'lucide-react';

interface Mapbox3DEnvironmentProps {
  onNavigate: (page: string) => void;
}

export const Mapbox3DEnvironment = ({ onNavigate }: Mapbox3DEnvironmentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentStyle, setCurrentStyle] = useState('satellite-v9');

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize Mapbox
    mapboxgl.accessToken = 'pk.eyJ1Ijoia2V2aW4xOTAzMTk5NCIsImEiOiJjbWNwcTRjbXgwOHQ5Mm1wdDJhdmZ2amI4In0.Whp6B_EMJajFoWzAGBCs6A';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: `mapbox://styles/mapbox/${currentStyle}`,
      projection: { name: 'globe' },
      zoom: 2,
      center: [0, 20],
      pitch: 45,
      bearing: 0,
      antialias: true,
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
        color: 'rgb(186, 210, 235)', // Lower atmosphere
        'high-color': 'rgb(36, 92, 223)', // Upper atmosphere
        'horizon-blend': 0.02, // Atmosphere thickness (default 0.2 at low zooms)
        'space-color': 'rgb(11, 11, 25)', // Background color
        'star-intensity': 0.6 // Background star brightness (default 0.35 at low zooms )
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
  }, [currentStyle]);

  const mapStyles = [
    { id: 'satellite-v9', name: 'Satellite', icon: Globe },
    { id: 'streets-v12', name: 'Streets', icon: Map },
    { id: 'outdoors-v12', name: 'Outdoors', icon: Layers },
    { id: 'dark-v11', name: 'Dark', icon: Settings },
  ];

  const changeMapStyle = (styleId: string) => {
    if (map.current && styleId !== currentStyle) {
      setCurrentStyle(styleId);
      map.current.setStyle(`mapbox://styles/mapbox/${styleId}`);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950">
      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-950 flex items-center justify-center z-50">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="text-white text-xl font-semibold">Loading 3D Environment...</div>
            <div className="text-slate-400 text-sm">Initializing Mapbox Globe</div>
          </div>
        </div>
      )}

      {/* Navigation Panel */}
      <Card className="absolute top-6 left-6 z-40 bg-black/20 backdrop-blur-md border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <Navigation className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">Navigation</span>
          </div>
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('dashboard')}
              className="w-full justify-start text-white hover:bg-white/10"
            >
              <Globe className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('projects')}
              className="w-full justify-start text-white hover:bg-white/10"
            >
              <Map className="w-4 h-4 mr-2" />
              Projects
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('tasks')}
              className="w-full justify-start text-white hover:bg-white/10"
            >
              <Layers className="w-4 h-4 mr-2" />
              Tasks
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Map Style Selector */}
      <Card className="absolute top-6 right-6 z-40 bg-black/20 backdrop-blur-md border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">Map Style</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {mapStyles.map((style) => {
              const Icon = style.icon;
              return (
                <Button
                  key={style.id}
                  variant={currentStyle === style.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => changeMapStyle(style.id)}
                  className={`flex flex-col items-center p-3 h-14 ${
                    currentStyle === style.id
                      ? 'bg-white/20 text-white border-white/30'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span className="text-xs">{style.name}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Info Panel */}
      <Card className="absolute bottom-6 left-6 z-40 bg-black/20 backdrop-blur-md border-white/10">
        <CardContent className="p-4">
          <div className="text-white space-y-2">
            <div className="text-sm font-semibold">3D Earth Environment</div>
            <div className="text-xs text-slate-300">
              • Click and drag to rotate
              • Scroll to zoom in/out
              • Globe auto-rotates when idle
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};