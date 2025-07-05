import React, { useState } from 'react';
import { Home, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UploadForm } from './UploadForm';
import { ModelSelector } from './ModelSelector';
import { ModelControls } from './ModelControls';
import { ModelInfo } from './ModelInfo';
import { Model3D, UploadFormData } from './types';

interface ControlsPanelProps {
  onNavigate: (page: string) => void;
  availableModels: Model3D[];
  currentModel: Model3D | null;
  onModelSelect: (model: Model3D) => void;
  showModel: boolean;
  onToggleVisibility: () => void;
  uploadFormData: UploadFormData;
  setUploadFormData: (data: UploadFormData) => void;
  isUploading: boolean;
  onUpload: () => void;
}

export const ControlsPanel = ({
  onNavigate,
  availableModels,
  currentModel,
  onModelSelect,
  showModel,
  onToggleVisibility,
  uploadFormData,
  setUploadFormData,
  isUploading,
  onUpload
}: ControlsPanelProps) => {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg z-40 min-w-[320px] max-h-[calc(100vh-2rem)] overflow-y-auto">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-lg">3D Model Controls</h3>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isMinimized ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              <Home className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Panel Content - Only show when not minimized */}
        {!isMinimized && (
          <>
            <UploadForm
              showUploadForm={showUploadForm}
              setShowUploadForm={setShowUploadForm}
              uploadFormData={uploadFormData}
              setUploadFormData={setUploadFormData}
              isUploading={isUploading}
              onUpload={onUpload}
            />
            
            <ModelSelector
              availableModels={availableModels}
              currentModel={currentModel}
              onModelSelect={onModelSelect}
            />

            <ModelControls
              showModel={showModel}
              onToggleVisibility={onToggleVisibility}
            />

            {currentModel && <ModelInfo model={currentModel} />}
          </>
        )}
      </div>
    </div>
  );
};