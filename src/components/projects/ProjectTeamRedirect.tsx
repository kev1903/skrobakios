import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface ProjectTeamRedirectProps {
  projectId: string;
}

export function ProjectTeamRedirect({ projectId }: ProjectTeamRedirectProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (projectId) {
      navigate(`/projects/${projectId}/team`);
    }
  }, [projectId, navigate]);

  return (
    <div className="p-8 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Redirecting to team management...</p>
    </div>
  );
}