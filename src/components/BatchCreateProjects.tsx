import { useState } from "react";
import { ArrowLeft, Upload, Download, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjects } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";
import { useNavigationWithHistory } from "@/hooks/useNavigationWithHistory";
import { useCompany } from "@/contexts/CompanyContext";

interface ProjectData {
  project_id: string;
  name: string;
  location: string;
  status: string;
  priority: string;
}

interface BatchCreateProjectsProps {
  onNavigate: (page: string) => void;
}

export const BatchCreateProjects = ({ onNavigate }: BatchCreateProjectsProps) => {
  const [projects, setProjects] = useState<ProjectData[]>([
    { project_id: "SK_2160", name: "17 Gordon Street, Balwyn", location: "17 Gordon Street, Balwyn", status: "pending", priority: "medium" },
    { project_id: "SK_23008", name: "34 Fitzgerald Road, Hallam", location: "34 Fitzgerald Road, Hallam", status: "pending", priority: "medium" },
    { project_id: "SK_23012", name: "6 Rodney Court Springvale South", location: "6 Rodney Court Springvale South", status: "pending", priority: "medium" },
    { project_id: "SK_23019", name: "79 Ebeli Close, Narre Warren North", location: "79 Ebeli Close, Narre Warren North", status: "pending", priority: "medium" },
    { project_id: "SK_24006", name: "32 Johns Avenue, Camberwell", location: "32 Johns Avenue, Camberwell", status: "pending", priority: "medium" },
    { project_id: "SK_24007", name: "13-14 Gaskell Drive, Narre Warren South", location: "13-14 Gaskell Drive, Narre Warren South", status: "pending", priority: "medium" },
    { project_id: "SK_25003", name: "5 Thanet Street, Malvern VIC 3144", location: "5 Thanet Street, Malvern VIC 3144", status: "pending", priority: "medium" },
    { project_id: "SK_25007", name: "21 Sugarloaf Rd, Beaconsfield Upper", location: "21 Sugarloaf Rd, Beaconsfield Upper", status: "pending", priority: "medium" },
    { project_id: "SK_25008", name: "38 Riverview Terrace, Bulleen", location: "38 Riverview Terrace, Bulleen", status: "pending", priority: "medium" },
    { project_id: "SK_25009", name: "18 Monomeath Avenue, Canterbury VIC 3126", location: "18 Monomeath Avenue, Canterbury VIC 3126", status: "pending", priority: "medium" },
    { project_id: "SK_25010", name: "1354 & 1356 High Street, Malvern", location: "1354 & 1356 High Street, Malvern", status: "pending", priority: "medium" },
    { project_id: "SK_25011", name: "43 Iris Road, Glen Iris", location: "43 Iris Road, Glen Iris", status: "pending", priority: "medium" },
    { project_id: "SK_25012", name: "Develop4SDA", location: "Develop4SDA", status: "pending", priority: "medium" },
    { project_id: "SK_25013", name: "1 Leason St Kew East VIC 3102", location: "1 Leason St Kew East VIC 3102", status: "pending", priority: "medium" },
    { project_id: "SK_25014", name: "No. 22 Stradbroke Drive, St Albans, VIC, 3021", location: "No. 22 Stradbroke Drive, St Albans, VIC, 3021", status: "pending", priority: "medium" },
    { project_id: "SK_25015", name: "105 Walkers Road, Mt. Eliza 3930", location: "105 Walkers Road, Mt. Eliza 3930", status: "pending", priority: "medium" },
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const { createProject } = useProjects();
  const { toast } = useToast();
  const { navigateBack } = useNavigationWithHistory({ onNavigate, currentPage: 'batch-create-projects' });
  
  // Add company context for debugging
  const { currentCompany } = useCompany();

  const handleProjectChange = (index: number, field: keyof ProjectData, value: string) => {
    const updatedProjects = [...projects];
    updatedProjects[index] = { ...updatedProjects[index], [field]: value };
    setProjects(updatedProjects);
  };

  const addNewProject = () => {
    setProjects([...projects, {
      project_id: "",
      name: "",
      location: "",
      status: "pending",
      priority: "medium"
    }]);
  };

  const removeProject = (index: number) => {
    const updatedProjects = projects.filter((_, i) => i !== index);
    setProjects(updatedProjects);
  };

  const handleCreateAll = async () => {
    if (!currentCompany) {
      toast({
        title: "No Company Selected",
        description: "Please select a company before creating projects",
        variant: "destructive",
      });
      return;
    }

    console.log(`Creating projects for company: ${currentCompany.name} (${currentCompany.id})`);
    
    setIsCreating(true);
    let successCount = 0;
    let failureCount = 0;

    try {
      for (const project of projects) {
        if (project.project_id && project.name) {
          const result = await createProject({
            project_id: project.project_id,
            name: project.name,
            location: project.location || undefined,
            status: project.status,
            priority: project.priority || undefined,
            description: `Project for ${project.location}`,
          });

          if (result) {
            successCount++;
          } else {
            failureCount++;
          }
        }
      }

      if (successCount > 0) {
        toast({
          title: "Batch Creation Complete",
          description: `${successCount} projects created successfully${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
        });
      }

      if (failureCount === 0) {
        navigateBack();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create projects",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const exportTemplate = () => {
    const csvContent = "Project ID,Name,Location,Status,Priority\n" +
      projects.map(p => `${p.project_id},${p.name},${p.location},${p.status},${p.priority}`).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'projects_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.15)_1px,transparent_0)] bg-[length:24px_24px] pointer-events-none" />
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent heading-modern">
              Batch Create Projects
            </h1>
            {currentCompany && (
              <p className="text-sm text-muted-foreground">
                Creating projects for: <span className="font-medium">{currentCompany.name}</span>
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={exportTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Export Template
            </Button>
            <Button variant="outline" onClick={addNewProject}>
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
            <Button onClick={handleCreateAll} disabled={isCreating}>
              {isCreating ? "Creating..." : `Create All (${projects.length})`}
            </Button>
          </div>
        </div>

        {/* Projects List */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Projects to Create</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {projects.map((project, index) => (
                <Card key={index} className="border border-border/50">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                      <div>
                        <Label className="text-xs text-muted-foreground">Project ID</Label>
                        <Input
                          value={project.project_id}
                          onChange={(e) => handleProjectChange(index, 'project_id', e.target.value)}
                          placeholder="SK_XXXX"
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="lg:col-span-2">
                        <Label className="text-xs text-muted-foreground">Project Name</Label>
                        <Input
                          value={project.name}
                          onChange={(e) => handleProjectChange(index, 'name', e.target.value)}
                          placeholder="Project name..."
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="lg:col-span-2">
                        <Label className="text-xs text-muted-foreground">Location</Label>
                        <Input
                          value={project.location}
                          onChange={(e) => handleProjectChange(index, 'location', e.target.value)}
                          placeholder="Address..."
                          className="text-sm"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs text-muted-foreground">Status</Label>
                        <select
                          value={project.status}
                          onChange={(e) => handleProjectChange(index, 'status', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="pending">Pending</option>
                          <option value="running">Running</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-muted-foreground">Priority</Label>
                        <select
                          value={project.priority}
                          onChange={(e) => handleProjectChange(index, 'priority', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProject(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};