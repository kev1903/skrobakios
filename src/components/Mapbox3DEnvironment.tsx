import React from 'react';
import { useMapbox } from '@/hooks/useMapbox';
import { useMapboxView } from '@/hooks/useMapboxView';
import { useMapboxProjects } from '@/hooks/useMapboxProjects';
import { NavigationPanel } from '@/components/mapbox/NavigationPanel';
import { InfoPanel } from '@/components/mapbox/InfoPanel';
import { ProjectsPanel } from '@/components/mapbox/ProjectsPanel';
import { LoadingOverlay } from '@/components/mapbox/LoadingOverlay';

interface Mapbox3DEnvironmentProps {
  onNavigate: (page: string) => void;
}


export const Mapbox3DEnvironment = ({ onNavigate }: Mapbox3DEnvironmentProps) => {
  const { loadSavedView, saveCurrentView } = useMapboxView();
  const savedView = loadSavedView();
  const { mapContainer, map, isLoaded } = useMapbox({ savedView });
  const { projects, projectMarkers, loadingProjects } = useMapboxProjects(map, onNavigate);

  const handleSaveView = () => {
    saveCurrentView(map);
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 z-0">
      {/* Map Container - Full screen */}
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
      
      {/* Loading Overlay */}
      {!isLoaded && <LoadingOverlay />}

      {/* Navigation Panel */}
      <NavigationPanel onNavigate={onNavigate} onSaveView={handleSaveView} />

      {/* Info Panel */}
      <InfoPanel />

      {/* Projects Status Panel */}
      <ProjectsPanel 
        loadingProjects={loadingProjects}
        projectMarkersCount={projectMarkers.length}
        totalProjectsCount={projects.length}
      />
    </div>
  );
};