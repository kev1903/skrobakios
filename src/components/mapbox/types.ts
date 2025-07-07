export interface Model3D {
  id: string;
  name: string;
  description: string;
  file_url: string;
  coordinates: [number, number];
  scale: number;
  rotation_x: number;
  rotation_y: number;
  rotation_z: number;
  elevation: number;
}

export interface UploadFormData {
  name: string;
  description: string;
  address: string;
  file: File | null;
}

export interface Mapbox3DEnvironmentProps {
  onNavigate: (page: string) => void;
  modelId?: string;
  className?: string;
  currentProject?: {
    id: string;
    project_id: string;
    name: string;
    location?: string;
  } | null;
}