
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/hooks/useProjects";
import { EditProjectForm } from "./EditProjectForm";

interface ProjectHeaderProps {
  project: Project;
  bannerImage?: string;
  bannerPosition?: { x: number; y: number; scale: number };
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  onProjectUpdate?: (updatedProject: Project) => void;
}

export const ProjectHeader = ({ 
  project, 
  bannerImage, 
  bannerPosition = { x: 0, y: 0, scale: 1 },
  getStatusColor, 
  getStatusText, 
  onProjectUpdate 
}: ProjectHeaderProps) => {
  const [showEditForm, setShowEditForm] = useState(false);

  const handleProjectUpdate = (updatedProject: Project) => {
    if (onProjectUpdate) {
      onProjectUpdate(updatedProject);
    }
  };

  return (
    <>
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{project.name}</h1>
          <p className="text-gray-600">{project.description || 'No description available'}</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setShowEditForm(true)}
        >
          Edit
        </Button>
      </div>

      {/* Project Banner or Default Hero */}
      <div className="mb-8">
        {bannerImage ? (
          <div className="w-full h-64 rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 relative">
            <img
              src={bannerImage}
              alt="Project banner"
              className="w-full h-full object-cover"
              style={{
                transform: `translate(${bannerPosition.x}px, ${bannerPosition.y}px) scale(${bannerPosition.scale})`,
                transformOrigin: 'center'
              }}
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg flex items-center justify-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative text-center">
              <h2 className="text-4xl font-bold mb-2 tracking-wider">SALFORD</h2>
              <p className="text-sm tracking-widest opacity-90">YOUR PREMIER REAL ESTATE AGENCY</p>
            </div>
          </div>
        )}
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <EditProjectForm
          project={project}
          onClose={() => setShowEditForm(false)}
          onUpdate={handleProjectUpdate}
        />
      )}
    </>
  );
};
