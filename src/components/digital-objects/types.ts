export interface DigitalObject {
  id: string;
  name: string;
  object_type: string;
  description: string | null;
  status: string;
  cost: number | null;
  progress: number;
  level: number;
  parent_id: string | null;
}

export interface DigitalObjectsPageProps {
  project: any;
  onNavigate: (page: string) => void;
}