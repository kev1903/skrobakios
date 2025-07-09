import { Button } from "@/components/ui/button";
import { Plus, Filter, LayoutGrid, List, BarChart3 } from "lucide-react";
import { ProjectListHeaderProps, ViewMode } from "./types";

export const ProjectListHeader = ({ 
  projectsCount, 
  viewMode, 
  onViewModeChange, 
  onNavigate 
}: ProjectListHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1 heading-modern">Projects</h1>
        <p className="text-muted-foreground body-modern text-sm">Manage your construction projects ({projectsCount} total)</p>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          onClick={() => onNavigate("create-project")}
          className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center space-x-1 transition-all duration-300 shadow-lg hover:shadow-xl"
          size="sm"
        >
          <Plus className="w-3 h-3" />
          <span className="text-sm">+New Project</span>
        </Button>
        {/* View Toggle Buttons */}
        <div className="flex items-center bg-muted rounded-lg p-0.5 border border-border">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="transition-all duration-200 px-2 py-1"
          >
            <List className="w-3 h-3" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="transition-all duration-200 px-2 py-1"
          >
            <LayoutGrid className="w-3 h-3" />
          </Button>
          <Button
            variant={viewMode === 'dashboard' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('dashboard')}
            className="transition-all duration-200 px-2 py-1"
          >
            <BarChart3 className="w-3 h-3" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-1 transition-all duration-200 px-2 py-1"
        >
          <Filter className="w-3 h-3" />
          <span className="text-sm">Filter</span>
        </Button>
      </div>
    </div>
  );
};