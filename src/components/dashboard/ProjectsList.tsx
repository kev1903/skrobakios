
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, Users } from "lucide-react";

const projects = [
  {
    id: "01",
    name: "Project Alpha",
    status: "Running",
    deadline: "02 Sep 2023",
    team: 3,
    progress: 75
  },
  {
    id: "02",
    name: "Project Beta",
    status: "Pending",
    deadline: "15 Sep 2023",
    team: 5,
    progress: 25
  },
  {
    id: "20",
    name: "Project Gamma",
    status: "Completed",
    deadline: "28 Aug 2023",
    team: 4,
    progress: 100
  },
  {
    id: "10",
    name: "Project Delta",
    status: "Running",
    deadline: "10 Oct 2023",
    team: 6,
    progress: 60
  }
];

interface ProjectsListProps {
  onSelectProject: (projectId: string) => void;
  onNavigate: (page: string) => void;
}

export const ProjectsList = ({ onSelectProject, onNavigate }: ProjectsListProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Running":
        return { 
          variant: "default" as const, 
          className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
          dotColor: "bg-blue-500"
        };
      case "Pending":
        return { 
          variant: "secondary" as const, 
          className: "bg-amber-100 text-amber-700 hover:bg-amber-100",
          dotColor: "bg-amber-500"
        };
      case "Completed":
        return { 
          variant: "default" as const, 
          className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
          dotColor: "bg-emerald-500"
        };
      default:
        return { 
          variant: "outline" as const, 
          className: "bg-slate-100 text-slate-700 hover:bg-slate-100",
          dotColor: "bg-slate-500"
        };
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-800">Recent Projects</CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {projects.map((project) => {
            const statusConfig = getStatusConfig(project.status);
            return (
              <div 
                key={project.id} 
                className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`}></div>
                    <span className="font-semibold text-slate-800 truncate">{project.name}</span>
                    <Badge 
                      variant={statusConfig.variant}
                      className={`text-xs px-2 py-1 ${statusConfig.className}`}
                    >
                      {project.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{project.deadline}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{project.team} members</span>
                    </div>
                  </div>
                  
                  {project.status !== "Completed" && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500">Progress</span>
                        <span className="font-medium text-slate-700">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  onClick={() => {
                    onSelectProject(project.id);
                    onNavigate("project-detail");
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
