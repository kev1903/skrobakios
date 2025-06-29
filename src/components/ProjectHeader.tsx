
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/hooks/useProjects";

interface ProjectHeaderProps {
  project: Project;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

export const ProjectHeader = ({ project, getStatusColor, getStatusText }: ProjectHeaderProps) => {
  return (
    <>
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{project.name}</h1>
          <p className="text-gray-600">{project.location}</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Edit
        </Button>
      </div>

      {/* Hero Image */}
      <div className="mb-8">
        <div className="w-full h-48 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg flex items-center justify-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative text-center">
            <h2 className="text-4xl font-bold mb-2 tracking-wider">SALFORD</h2>
            <p className="text-sm tracking-widest opacity-90">YOUR PREMIER REAL ESTATE AGENCY</p>
          </div>
        </div>
      </div>
    </>
  );
};
