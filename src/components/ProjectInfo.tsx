
import { Box } from "lucide-react";
import { Project } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";

interface ProjectInfoProps {
  project: Project;
  getStatusText: (status: string) => string;
  formatDate: (dateString: string) => string;
  onNavigate?: (page: string) => void;
}

export const ProjectInfo = ({ project, onNavigate }: ProjectInfoProps) => {
  return (
    <div className="mb-8">
      <Button
        onClick={() => onNavigate?.('project-digital-twin')}
        className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200"
      >
        <Box className="w-5 h-5" />
        <span className="font-medium">Digital Objects</span>
      </Button>
    </div>
  );
};
