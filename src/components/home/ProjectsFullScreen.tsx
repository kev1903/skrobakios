import React, { useEffect, useState } from 'react';
import { useProjects, Project } from '@/hooks/useProjects';

interface ProjectsFullScreenProps {
  isOpen: boolean;
  onNavigate: (page: string) => void;
  onClose: () => void;
}

export const ProjectsFullScreen = ({
  isOpen,
  onNavigate,
  onClose
}: ProjectsFullScreenProps) => {
  const { getProjects } = useProjects();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const fetchedProjects = await getProjects();
      setProjects(fetchedProjects.slice(0, 6)); // Show only first 6 projects
    };
    fetchProjects();
  }, [getProjects]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-300";
      case "running":
        return "bg-orange-500/20 text-orange-300";
      case "pending":
        return "bg-red-500/20 text-red-300";
      default:
        return "bg-gray-500/20 text-gray-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "running":
        return "In Progress";
      case "pending":
        return "Pending";
      default:
        return "Active";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 pt-24 pb-24">
        <div 
          className="w-full h-full bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <h2 className="text-2xl font-semibold text-white">Projects</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
            >
              <span className="text-white text-lg">×</span>
            </button>
          </div>
          
          {/* Project Content */}
          <div className="p-6 h-full overflow-y-auto">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {projects.map((project) => (
                <div key={project.id} className="bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors duration-200">
                  <h3 className="text-white font-semibold text-lg mb-3">{project.name}</h3>
                  <p className="text-white text-sm mb-4">{project.description || 'No description available'}</p>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {getStatusText(project.status)}
                    </span>
                    {project.deadline && (
                      <span className="text-white text-xs">Due: {formatDate(project.deadline)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex justify-center">
              <button 
                onClick={() => {
                  onNavigate('projects');
                  onClose();
                }}
                className="bg-white/20 hover:bg-white/30 text-white py-3 px-8 rounded-xl border border-white/30 transition-colors duration-200 font-medium"
              >
                View All Projects
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay to close project section when clicking outside */}
      <div 
        className="fixed inset-0 bg-black/20 z-30"
        onClick={onClose}
      />
    </>
  );
};