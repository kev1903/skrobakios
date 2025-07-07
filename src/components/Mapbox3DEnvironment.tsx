import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { useMapbox3D } from '@/hooks/useMapbox3D';
import { useModels } from '@/hooks/useModels';
import { useModelUpload } from '@/hooks/useModelUpload';
import { ControlsPanel } from './mapbox/ControlsPanel';
import { Mapbox3DEnvironmentProps, Model3D } from './mapbox/types';

export const Mapbox3DEnvironment = ({ 
  onNavigate,
  modelId,
  className = "",
  currentProject
}: Mapbox3DEnvironmentProps) => {
  console.log('🏢 [Mapbox3DEnvironment] Component rendering');
  console.log('🏢 [Mapbox3DEnvironment] modelId:', modelId);
  console.log('🏢 [Mapbox3DEnvironment] currentProject:', currentProject);
  
  const [showModel, setShowModel] = useState(true);
  
  // Use custom hooks
  const { availableModels, currentModel, setCurrentModel, error: modelError, removeModel } = useModels(modelId);
  const { mapContainer, isLoading, isModelLoading, error: mapError, flyToModel } = useMapbox3D(currentModel, showModel, currentProject);
  
  const handleModelUploaded = (model: Model3D) => {
    setCurrentModel(model);
    flyToModel(model);
  };
  
  const handleModelsRefresh = (models: Model3D[]) => {
    // Models are already updated in the useModels hook
  };
  
  const {
    isUploading,
    uploadFormData,
    setUploadFormData,
    handleFileUpload
  } = useModelUpload(handleModelUploaded, handleModelsRefresh, currentProject);

  // Toggle 3D model visibility
  const toggleModelVisibility = () => {
    setShowModel(!showModel);
  };

  const error = modelError || mapError;

  return (
    <div className={`relative w-full h-screen ${className}`}>
      {/* Map Container - Full viewport height */}
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Main Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center text-white">
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4" />
            <div className="text-2xl font-semibold mb-2">Loading 3D Map...</div>
            <div className="text-gray-300">Initializing Mapbox environment</div>
          </div>
        </div>
      )}

      {/* Model Loading Indicator */}
      {isModelLoading && (
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white z-40">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            <div>
              <div className="font-medium">Loading 3D Model...</div>
              <div className="text-sm text-gray-300">Please wait</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center text-white max-w-md">
            <div className="text-red-400 text-2xl font-semibold mb-4">Error</div>
            <div className="text-gray-300 mb-6">{error}</div>
            <Button onClick={() => onNavigate('dashboard')} className="bg-white text-black hover:bg-gray-200">
              Back to Dashboard
            </Button>
          </div>
        </div>
      )}

      {/* Controls Panel */}
      {!isLoading && !error && (
        <ControlsPanel
          onNavigate={onNavigate}
          availableModels={availableModels}
          currentModel={currentModel}
          onModelSelect={setCurrentModel}
          showModel={showModel}
          onToggleVisibility={toggleModelVisibility}
          uploadFormData={uploadFormData}
          setUploadFormData={setUploadFormData}
          isUploading={isUploading}
          onUpload={handleFileUpload}
          onRemoveModel={removeModel}
          currentProject={currentProject}
        />
      )}

      {/* Navigation Instructions - Bottom Left */}
      {!isLoading && !error && (
        <div className="absolute bottom-4 left-80 ml-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white text-sm z-40 max-w-sm">
          <div className="font-medium mb-2">Map Controls:</div>
          <div className="space-y-1">
            <div>• Click and drag to rotate view</div>
            <div>• Scroll to zoom in/out</div>
            <div>• Right-click and drag to pan</div>
            <div>• Use compass controls (top-right)</div>
          </div>
        </div>
      )}

      {/* Status Indicator - Bottom Right */}
      {!isLoading && !error && (
        <div className="absolute bottom-4 right-4 bg-green-500/90 backdrop-blur-sm rounded-lg p-3 text-white text-sm z-40">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>3D Environment Active</span>
          </div>
        </div>
      )}
    </div>
  );
};