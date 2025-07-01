
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users } from "lucide-react";
import { Project } from "@/hooks/useProjects";

interface ProjectOverviewSidebarProps {
  project: Project;
  formData: {
    status: string;
    priority: string;
  };
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

export const ProjectOverviewSidebar = ({ 
  project, 
  formData, 
  getStatusColor, 
  getStatusText 
}: ProjectOverviewSidebarProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Project ID</span>
            </div>
            <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
              {project.project_id}
            </p>
          </div>
          
          <Separator />
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Current Status</span>
            </div>
            <Badge variant="outline" className={getStatusColor(formData.status)}>
              {getStatusText(formData.status)}
            </Badge>
          </div>
          
          <Separator />
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Priority</span>
            </div>
            <Badge variant="outline">
              {formData.priority}
            </Badge>
          </div>
          
          <Separator />
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Created</span>
            </div>
            <p className="text-sm text-gray-900">
              {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Last Updated</span>
            </div>
            <p className="text-sm text-gray-900">
              {new Date(project.updated_at).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Manage who has access to this project
          </p>
          <Button variant="outline" className="w-full">
            Manage Team
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
