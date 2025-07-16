import React, { useState } from 'react';
import { Project } from "@/hooks/useProjects";
import { AANCanvas } from '@/components/network/AANCanvas';
import { SkaiChatInterface } from '@/components/network/SkaiChatInterface';
import { NetworkNode } from '@/hooks/useProjectNetwork';

interface ProjectTimelinePageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectTimelinePage = ({ project, onNavigate }: ProjectTimelinePageProps) => {
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);

  return (
    <div className="flex-1 relative overflow-hidden">
      {/* Full-screen 3D Canvas */}
      <AANCanvas
        projectId={project.id}
        onNodeSelect={setSelectedNode}
        selectedNode={selectedNode}
      />
      
      {/* Floating Skai Chat Interface */}
      <SkaiChatInterface
        projectId={project.id}
        isCollapsed={isChatCollapsed}
        onToggleCollapse={() => setIsChatCollapsed(!isChatCollapsed)}
      />
    </div>
  );
};