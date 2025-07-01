
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

const projects = [
  {
    id: "01",
    name: "Project 01",
    status: "Running",
    deadline: "02 Sep 2023",
    team: ["👤", "👤", "👤"]
  },
  {
    id: "02",
    name: "Project 02",
    status: "Pending",
    deadline: "02 Sep 2023",
    team: ["👤", "👤", "👤"]
  },
  {
    id: "20",
    name: "Project 20",
    status: "Completed",
    deadline: "02 Sep 2023",
    team: ["👤", "👤", "👤"]
  },
  {
    id: "10",
    name: "Project 10",
    status: "Running",
    deadline: "02 Sep 2023",
    team: ["👤", "👤", "👤"]
  }
];

interface ProjectsListProps {
  onSelectProject: (projectId: string) => void;
  onNavigate: (page: string) => void;
}

export const ProjectsList = ({ onSelectProject, onNavigate }: ProjectsListProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Running":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-orange-100 text-orange-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-800">Projects</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-gray-800">{project.name}</span>
                    <Badge className={getStatusColor(project.status)} variant="secondary">
                      {project.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    Deadline: {project.deadline}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-gray-600">Team Member</span>
                  <div className="flex -space-x-1">
                    {project.team.map((member, index) => (
                      <div key={index} className="w-6 h-6 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center text-xs">
                        {member}
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onSelectProject(project.id);
                    onNavigate("project-detail");
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
