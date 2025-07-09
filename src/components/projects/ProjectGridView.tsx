import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye } from "lucide-react";
import { ProjectGridViewProps } from "./types";
import { getStatusColor, getStatusText, formatDate } from "./utils";

export const ProjectGridView = ({ 
  projects, 
  selectedProjects, 
  onSelectProject, 
  onProjectClick 
}: ProjectGridViewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {projects.map((project) => (
        <div key={project.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
               <h3 className="text-lg font-semibold text-foreground mb-1">
                 <button
                   onClick={() => onProjectClick(project.id)}
                   className="text-primary hover:text-primary/80 hover:underline cursor-pointer text-left transition-colors duration-200"
                 >
                   {project.name}
                 </button>
               </h3>
               <p className="text-sm text-muted-foreground mb-2">#{project.project_id}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200">
                   <MoreHorizontal className="w-4 h-4" />
                 </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border border-border shadow-xl">
                <DropdownMenuItem 
                  className="flex items-center space-x-2 text-foreground hover:bg-muted focus:bg-muted transition-colors duration-200"
                  onClick={() => onProjectClick(project.id)}
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {project.description || 'No description available'}
          </p>
          
           <div className="space-y-2 mb-4">
             <div className="flex justify-between text-sm">
               <span className="text-muted-foreground">Contract Price:</span>
               <span className="text-foreground">{project.contract_price || '-'}</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-muted-foreground">Location:</span>
               <span className="text-foreground">{project.location || '-'}</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-muted-foreground">Priority:</span>
               <span className="text-foreground">{project.priority || '-'}</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-muted-foreground">Start Date:</span>
               <span className="text-foreground">{project.start_date ? formatDate(project.start_date) : '-'}</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-muted-foreground">Due Date:</span>
               <span className="text-foreground">{project.deadline ? formatDate(project.deadline) : '-'}</span>
             </div>
           </div>
          
          <div className="flex items-center justify-between">
            <Badge 
              variant="outline" 
              className={getStatusColor(project.status)}
            >
              {getStatusText(project.status)}
            </Badge>
            <input
              type="checkbox"
              checked={selectedProjects.includes(project.id)}
              onChange={(e) => onSelectProject(project.id, e.target.checked)}
              className="rounded border-input bg-background text-primary focus:ring-primary/30"
            />
          </div>
        </div>
      ))}
    </div>
  );
};