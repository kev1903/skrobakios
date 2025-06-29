
import { FileText, Users, Calendar, Clock } from "lucide-react";
import { Project } from "@/hooks/useProjects";

interface ProjectInfoProps {
  project: Project;
  getStatusText: (status: string) => string;
  formatDate: (dateString: string) => string;
}

export const ProjectInfo = ({ project, getStatusText, formatDate }: ProjectInfoProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <FileText className="w-4 h-4 text-gray-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Project ID</p>
          <p className="text-sm text-gray-600">#{project.project_id}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <Users className="w-4 h-4 text-gray-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Assigned</p>
          <p className="text-sm text-gray-600">Project Manager</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <Calendar className="w-4 h-4 text-gray-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Timeline</p>
          <p className="text-sm text-gray-600">
            {formatDate(project.start_date || project.created_at)} - {formatDate(project.deadline || project.created_at)}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <Clock className="w-4 h-4 text-gray-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Status</p>
          <p className="text-sm text-gray-600">{getStatusText(project.status)}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <FileText className="w-4 h-4 text-gray-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Priority</p>
          <p className="text-sm text-gray-600">{project.priority || 'Medium'}</p>
        </div>
      </div>
    </div>
  );
};
