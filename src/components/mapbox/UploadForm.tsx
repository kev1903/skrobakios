import React, { useEffect } from 'react';
import { Upload, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UploadFormData } from './types';

interface UploadFormProps {
  showUploadForm: boolean;
  setShowUploadForm: (show: boolean) => void;
  uploadFormData: UploadFormData;
  setUploadFormData: (data: UploadFormData) => void;
  isUploading: boolean;
  onUpload: () => void;
  currentProject?: {
    id: string;
    project_id: string;
    name: string;
    location?: string;
  } | null;
}

export const UploadForm = ({
  showUploadForm,
  setShowUploadForm,
  uploadFormData,
  setUploadFormData,
  isUploading,
  onUpload,
  currentProject
}: UploadFormProps) => {
  // Auto-populate project address when current project is available
  useEffect(() => {
    if (currentProject?.location && !uploadFormData.address) {
      setUploadFormData({
        ...uploadFormData,
        address: currentProject.location
      });
    }
  }, [currentProject, uploadFormData, setUploadFormData]);
  return (
    <div className="border-t pt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-800">Upload IFC Model</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="text-xs"
        >
          <Upload className="w-3 h-3 mr-1" />
          {showUploadForm ? 'Cancel' : 'Upload'}
        </Button>
      </div>

      {showUploadForm && (
        <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
          <div>
            <Label htmlFor="model-name" className="text-xs font-medium">Model Name *</Label>
            <Input
              id="model-name"
              value={uploadFormData.name}
              onChange={(e) => setUploadFormData({...uploadFormData, name: e.target.value})}
              placeholder="Enter model name"
              className="text-xs h-8"
            />
          </div>

          <div>
            <Label htmlFor="model-description" className="text-xs font-medium">Description</Label>
            <Textarea
              id="model-description"
              value={uploadFormData.description}
              onChange={(e) => setUploadFormData({...uploadFormData, description: e.target.value})}
              placeholder="Optional description"
              className="text-xs h-16 resize-none"
            />
          </div>

          <div>
            <Label htmlFor="project-address" className="text-xs font-medium">
              Project Address *
              {currentProject?.location && (
                <span className="text-green-600 font-normal ml-1">(from project)</span>
              )}
            </Label>
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-gray-500" />
              <Input
                id="project-address"
                value={uploadFormData.address}
                onChange={(e) => setUploadFormData({...uploadFormData, address: e.target.value})}
                placeholder={currentProject?.location || "123 Main St, City, Country"}
                className="text-xs h-8 flex-1"
              />
            </div>
            {currentProject?.location && (
              <div className="text-xs text-green-600 mt-1">
                Using address from project: {currentProject.name}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="model-file" className="text-xs font-medium">IFC File *</Label>
            <Input
              id="model-file"
              type="file"
              accept=".ifc,.gltf,.glb"
              onChange={(e) => setUploadFormData({...uploadFormData, file: e.target.files?.[0] || null})}
              className="text-xs h-8"
            />
            <div className="text-xs text-gray-500 mt-1">
              Supports: .ifc, .gltf, .glb files
            </div>
          </div>

          <Button
            onClick={onUpload}
            disabled={isUploading || !uploadFormData.file || !uploadFormData.name || !uploadFormData.address}
            className="w-full h-8 text-xs"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-3 h-3 mr-1" />
                Upload & Place Model
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};