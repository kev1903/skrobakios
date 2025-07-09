import { Button } from "@/components/ui/button";

interface ProjectEmptyStateProps {
  onNavigate: (page: string) => void;
}

export const ProjectEmptyState = ({ onNavigate }: ProjectEmptyStateProps) => {
  return (
    <div className="bg-card border border-border rounded-xl p-8 text-center shadow-sm">
      <div className="text-muted-foreground mb-4">No projects found</div>
      <Button
        onClick={() => onNavigate("create-project")}
        className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        Create Your First Project
      </Button>
    </div>
  );
};