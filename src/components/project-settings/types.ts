export interface ProjectSettingsFormData {
  project_id: string;
  name: string;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  priority: string;
  status: string;
  start_date: string;
  deadline: string;
  sharepoint_link: string;
  banner_image: string;
  banner_position: { x: number; y: number; scale: number };
}

export interface ProjectSettingsUtils {
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  validateSharePointLink: (url: string) => boolean;
}