export interface DigitalObject {
  id: string;
  name: string;
  object_type: string;
  description: string | null;
  status: string;
  stage: string;
  level: number;
  parent_id: string | null;
  expanded?: boolean;
  project_id?: string | null;
}

export interface DigitalObjectsPageProps {
  project: any;
  onNavigate: (page: string) => void;
}