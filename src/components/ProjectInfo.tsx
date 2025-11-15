import { FileText, Users, Calendar, Clock } from "lucide-react";
import { Project } from "@/hooks/useProjects";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserPermissionsContext } from "@/contexts/UserPermissionsContext";

interface ProjectInfoProps {
  project: Project;
  getStatusText: (status: string) => string;
  formatDate: (dateString: string) => string;
  onStatusUpdate?: (status: string) => void;
}

export const ProjectInfo = ({ project, getStatusText, formatDate, onStatusUpdate }: ProjectInfoProps) => {
  const { canEditSubModule } = useUserPermissionsContext();
  
  const canEditProjects = canEditSubModule('Projects', 'manage_projects') ||
                          canEditSubModule('Projects', 'manage_company_projects');
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-muted/50 rounded-full flex items-center justify-center">
          <FileText className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Project ID</p>
          <p className="text-sm text-muted-foreground">#{project.project_id}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-muted/50 rounded-full flex items-center justify-center">
          <Users className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Assigned</p>
          <p className="text-sm text-muted-foreground">Project Manager</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-muted/50 rounded-full flex items-center justify-center">
          <Calendar className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Timeline</p>
          <p className="text-sm text-muted-foreground">
            {formatDate(project.start_date || project.created_at)} - {formatDate(project.deadline || project.created_at)}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-muted/50 rounded-full flex items-center justify-center">
          <Clock className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground mb-1">Status</p>
          {canEditProjects && onStatusUpdate ? (
            <Select value={project.status} onValueChange={onStatusUpdate}>
              <SelectTrigger className="h-7 text-sm border-border/50 bg-background/60 backdrop-blur-md hover:bg-accent/50 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="running">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-muted-foreground">{getStatusText(project.status)}</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-muted/50 rounded-full flex items-center justify-center">
          <FileText className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Priority</p>
          <p className="text-sm text-muted-foreground">{project.priority || 'Medium'}</p>
        </div>
      </div>
    </div>
  );
};
