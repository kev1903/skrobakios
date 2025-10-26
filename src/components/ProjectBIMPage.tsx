import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Upload, Box, Eye, EyeOff } from 'lucide-react';
import { useModels } from '@/hooks/useModels';
import { useModelUpload } from '@/hooks/useModelUpload';
import { UploadForm } from '@/components/mapbox/UploadForm';
import { ModelSelector } from '@/components/mapbox/ModelSelector';
import { IFCLoader } from '@/components/metaverse/IFCLoader';

interface ProjectBIMPageProps {
  project: any;
  onNavigate: (page: string) => void;
}

export const ProjectBIMPage = ({ project, onNavigate }: ProjectBIMPageProps) => {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showModel, setShowModel] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  
  const { 
    availableModels, 
    currentModel, 
    setCurrentModel, 
    error: modelsError,
    refreshModels,
    removeModel 
  } = useModels(project?.id);

  const {
    isUploading,
    uploadFormData,
    setUploadFormData,
    handleFileUpload
  } = useModelUpload(
    () => {
      // Refresh models after upload
      if (availableModels) {
        refreshModels(availableModels);
      }
    },
    project
  );

  const handleUpload = async () => {
    await handleFileUpload();
    setShowUploadForm(false);
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: 'hsl(var(--viewer-bg))' }}>
      {/* Header */}
      <div className="glass-panel px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground font-display">
              BIM Viewer
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {project?.name || 'Project'} - Building Information Model
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
              className="glass-button gap-2"
            >
              <Box className="w-4 h-4" />
              {showGrid ? 'Hide Grid' : 'Show Grid'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowModel(!showModel)}
              className="glass-button gap-2"
            >
              {showModel ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showModel ? 'Hide Model' : 'Show Model'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-6 overflow-hidden">
        {/* Left Sidebar - Controls */}
        <Card className="w-80 p-4 glass-panel overflow-y-auto">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-3">3D Models</h3>
              
              {modelsError && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg mb-3">
                  {modelsError}
                </div>
              )}
              
              {availableModels.length > 0 && (
                <ModelSelector
                  availableModels={availableModels}
                  currentModel={currentModel}
                  onModelSelect={setCurrentModel}
                  onRemoveModel={removeModel}
                />
              )}
              
              {availableModels.length === 0 && !modelsError && (
                <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  No models uploaded yet. Upload your first IFC model to get started.
                </div>
              )}
            </div>

            <UploadForm
              showUploadForm={showUploadForm}
              setShowUploadForm={setShowUploadForm}
              uploadFormData={uploadFormData}
              setUploadFormData={setUploadFormData}
              isUploading={isUploading}
              onUpload={handleUpload}
              currentProject={project}
            />

            {currentModel && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-sm mb-2">Model Details</h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium">{currentModel.name}</p>
                  </div>
                  {currentModel.description && (
                    <div>
                      <span className="text-muted-foreground">Description:</span>
                      <p className="font-medium">{currentModel.description}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Scale:</span>
                    <p className="font-medium">{currentModel.scale}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Main 3D Viewer */}
        <div className="flex-1 glass-panel rounded-2xl overflow-hidden relative">
          {!currentModel ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Box className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Model Selected
                </h3>
                <p className="text-sm text-muted-foreground">
                  Upload or select a 3D model to begin viewing
                </p>
              </div>
            </div>
          ) : (
            <Canvas
              camera={{ position: [10, 10, 10], fov: 50 }}
              gl={{ antialias: true, alpha: true }}
              className="w-full h-full"
            >
              <Suspense fallback={null}>
                {/* Lighting */}
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                
                {/* Environment */}
                <Environment preset="city" />
                
                {/* Grid */}
                {showGrid && (
                  <Grid
                    args={[50, 50]}
                    cellSize={1}
                    cellThickness={0.5}
                    cellColor="#6b7280"
                    sectionSize={5}
                    sectionThickness={1}
                    sectionColor="#3b82f6"
                    fadeDistance={50}
                    fadeStrength={1}
                    followCamera={false}
                    infiniteGrid
                  />
                )}
                
                {/* 3D Model */}
                {showModel && currentModel && (
                  <IFCLoader
                    url={currentModel.file_url}
                    position={[0, 0, 0]}
                    scale={currentModel.scale}
                    project={{
                      id: currentModel.id,
                      name: currentModel.name,
                      status: 'Active',
                      contract_price: project?.contract_price || '1000000'
                    }}
                  />
                )}
                
                {/* Controls */}
                <OrbitControls
                  enableDamping
                  dampingFactor={0.05}
                  minDistance={1}
                  maxDistance={100}
                  maxPolarAngle={Math.PI / 2}
                />
              </Suspense>
            </Canvas>
          )}
          
          {/* Loading Overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-sm font-medium">Uploading model...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
