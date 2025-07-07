import React, { useState } from 'react';
import { Home, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UploadForm } from './UploadForm';
import { ModelSelector } from './ModelSelector';
import { ModelControls } from './ModelControls';
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
  onRemoveModel: (modelId: string) => void;
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
  onUpload,
  onRemoveModel
}: ControlsPanelProps) => {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div className={`fixed top-0 left-0 h-screen bg-white/95 backdrop-blur-sm shadow-2xl z-40 transition-all duration-300 ${
      isMinimized ? 'w-16' : 'w-80'
    } border-r border-gray-200/50`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
          {!isMinimized && (
            <h3 className="font-semibold text-gray-900 text-lg">3D Controls</h3>
          )}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isMinimized ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
            </Button>
            {!isMinimized && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <Home className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Panel Content - Only show when not minimized */}
        {!isMinimized && (
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
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
              onRemoveModel={onRemoveModel}
            />

            <ModelControls
              showModel={showModel}
              onToggleVisibility={onToggleVisibility}
            />
          </div>
        )}

        {/* Minimized state icons */}
        {isMinimized && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 py-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('dashboard')}
              className="text-gray-600 hover:text-gray-900 w-10 h-10"
            >
              <Home className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};