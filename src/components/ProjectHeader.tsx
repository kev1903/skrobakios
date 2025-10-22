
import { Project } from "@/hooks/useProjects";

interface ProjectHeaderProps {
  project: Project;
  bannerImage?: string;
  bannerPosition?: { x: number; y: number; scale: number };
}

export const ProjectHeader = ({ 
  project, 
  bannerImage, 
  bannerPosition = { x: 0, y: 0, scale: 1 }
}: ProjectHeaderProps) => {
  return (
    <>
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
              <h2 className="text-4xl font-bold mb-2 tracking-wider">{project.name}</h2>
              <p className="text-sm tracking-widest opacity-90">{project.description || 'PROJECT OVERVIEW'}</p>
            </div>
          </div>
        )}
      </div>

    </>
  );
};
