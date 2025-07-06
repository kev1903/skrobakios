export interface DigitalObject {
  id: string;
  name: string;
  object_type: string;
  description: string | null;
  status: string;
  cost: number | null;
  progress: number;
  stage: string;
  level: number;
  parent_id: string | null;
  expanded?: boolean;
}

export interface DigitalObjectsPageProps {
  project: any;
  onNavigate: (page: string) => void;
}