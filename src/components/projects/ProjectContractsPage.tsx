import { ContractSummaryPage } from "@/components/contracts/ContractSummaryPage";
import { Project } from "@/hooks/useProjects";
import { ProjectSidebar } from "../ProjectSidebar";
import { getStatusColor, getStatusText } from "./utils";
import { useEffect } from "react";

interface ProjectContractsPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectContractsPage = ({ project, onNavigate }: ProjectContractsPageProps) => {
  // Force body overflow hidden to prevent dual scrollbars
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalBodyOverflow;
    };
  }, []);

  return (
    <>
      <style>{`
        /* Force single scroll container */
        body, html, #root {
          overflow: hidden !important;
          height: 100vh !important;
        }
        .contracts-main-scroll {
          height: 100vh !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          scrollbar-width: thin;
        }
        .contracts-main-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .contracts-main-scroll::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.1);
        }
        .contracts-main-scroll::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.3);
          border-radius: 4px;
        }
      `}</style>
      
      <div 
        className="w-full bg-background flex" 
        style={{ 
          height: '100vh',
          overflow: 'hidden'
        }}
      >
        {/* Fixed Project Sidebar */}
        <div 
          className="w-48 flex-shrink-0 h-full"
          style={{ overflow: 'hidden' }}
        >
          <ProjectSidebar
            project={project}
            onNavigate={onNavigate}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
            activeSection="contracts"
          />
        </div>

        {/* Main Content - Single controlled scroll */}
        <div 
          className="flex-1 contracts-main-scroll bg-background"
        >
          <ContractSummaryPage contractId={project.id} />
        </div>
      </div>
    </>
  );
};