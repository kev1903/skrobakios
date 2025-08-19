import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, AlertTriangle, FileText, CheckCircle, Clock, Filter } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { useProjects, Project } from '@/hooks/useProjects';

interface ProjectQAQCPageProps {
  onNavigate: (page: string) => void;
}

export const ProjectQAQCPage = ({ onNavigate }: ProjectQAQCPageProps) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const { getProject } = useProjects();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    if (projectId) {
      const fetchProject = async () => {
        try {
          const fetchedProject = await getProject(projectId);
          setProject(fetchedProject);
        } catch (error) {
          console.error('Failed to fetch project:', error);
        }
      };
      fetchProject();
    }
  }, [projectId, getProject]);
  
  const [activeTab, setActiveTab] = useState("rfi");

  // Mock data for demonstration
  const mockRFIs = [
    {
      id: "RFI-001",
      title: "Clarification on Foundation Details",
      status: "open",
      priority: "high",
      created: "2024-01-15",
      assigned: "Project Manager"
    },
    {
      id: "RFI-002", 
      title: "Material Specifications for Steel Frame",
      status: "pending",
      priority: "medium",
      created: "2024-01-14",
      assigned: "Site Engineer"
    },
    {
      id: "RFI-003",
      title: "Electrical Layout Approval",
      status: "resolved",
      priority: "low",
      created: "2024-01-10",
      assigned: "Electrical Contractor"
    }
  ];

  const mockIssues = [
    {
      id: "ISS-001",
      title: "Drainage System Blockage",
      status: "critical",
      priority: "high",
      created: "2024-01-16",
      assigned: "Site Supervisor"
    },
    {
      id: "ISS-002",
      title: "Concrete Curing Time Extended",
      status: "active",
      priority: "medium",
      created: "2024-01-15",
      assigned: "Quality Inspector"
    }
  ];

  const mockDefects = [
    {
      id: "DEF-001",
      title: "Paint Finish Quality Below Standard",
      status: "open",
      priority: "medium",
      created: "2024-01-14",
      assigned: "Painting Contractor"
    },
    {
      id: "DEF-002",
      title: "Tile Alignment Issues in Bathroom",
      status: "in-progress",
      priority: "low",
      created: "2024-01-12",
      assigned: "Tiling Contractor"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
      case 'active':
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'pending':
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The requested project could not be found.</p>
          <Button onClick={() => onNavigate('projects')}>Back to Projects</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Project Sidebar */}
      <ProjectSidebar
        project={project}
        onNavigate={onNavigate}
        getStatusColor={() => "bg-blue-100 text-blue-800"}
        getStatusText={() => "Active"}
        activeSection="qaqc"
      />

      {/* Main Content */}
      <div className="flex-1 ml-48 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {activeTab === 'rfi' && 'RFI Report'} 
                  {activeTab === 'issues' && 'Issues Report'} 
                  {activeTab === 'defects' && 'Defect Report'} - {project.name}
                </h1>
                <p className="text-muted-foreground">#{project.project_id}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Item
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-muted-foreground">Total RFIs</p>
                      <p className="text-2xl font-bold text-foreground">{mockRFIs.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="w-8 h-8 text-yellow-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-muted-foreground">Active Issues</p>
                      <p className="text-2xl font-bold text-foreground">{mockIssues.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-red-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-muted-foreground">Defects</p>
                      <p className="text-2xl font-bold text-foreground">{mockDefects.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-muted-foreground">Avg Response</p>
                      <p className="text-2xl font-bold text-foreground">2.3d</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="rfi">RFI Report</TabsTrigger>
              <TabsTrigger value="issues">Issues Report</TabsTrigger>
              <TabsTrigger value="defects">Defect Report</TabsTrigger>
            </TabsList>

            {/* RFI Tab */}
            <TabsContent value="rfi" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-foreground">Request for Information (RFI)</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Track and manage information requests throughout the project lifecycle
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockRFIs.map((rfi) => (
                      <div key={rfi.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <button 
                              onClick={() => onNavigate(`rfi-list?projectId=${projectId}&type=rfi`)}
                              className="font-medium text-foreground hover:text-foreground/80 transition-colors cursor-pointer"
                            >
                              {`RFI Report ${rfi.id} - ${project.name}`}
                            </button>
                            <Badge className={getStatusColor(rfi.status)}>{rfi.status}</Badge>
                            <Badge className={getPriorityColor(rfi.priority)}>{rfi.priority}</Badge>
                          </div>
                          <h3 className="font-medium text-foreground mb-1">{rfi.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Created: {rfi.created} • Assigned to: {rfi.assigned}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Issues Tab */}
            <TabsContent value="issues" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-foreground">Project Issues</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Monitor and resolve project issues and complications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockIssues.map((issue) => (
                      <div key={issue.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <button 
                              onClick={() => onNavigate(`rfi-list?projectId=${projectId}&type=issues`)}
                              className="font-medium text-foreground hover:text-foreground/80 transition-colors cursor-pointer"
                            >
                              {`Issues Report ${issue.id} - ${project.name}`}
                            </button>
                            <Badge className={getStatusColor(issue.status)}>{issue.status}</Badge>
                            <Badge className={getPriorityColor(issue.priority)}>{issue.priority}</Badge>
                          </div>
                          <h3 className="font-medium text-foreground mb-1">{issue.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Created: {issue.created} • Assigned to: {issue.assigned}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Defects Tab */}
            <TabsContent value="defects" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-foreground">Defects & Quality Issues</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Track construction defects and quality control issues
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockDefects.map((defect) => (
                      <div key={defect.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <button 
                              onClick={() => onNavigate(`rfi-list?projectId=${projectId}&type=defects`)}
                              className="font-medium text-foreground hover:text-foreground/80 transition-colors cursor-pointer"
                            >
                              {`Defect Report ${defect.id} - ${project.name}`}
                            </button>
                            <Badge className={getStatusColor(defect.status)}>{defect.status}</Badge>
                            <Badge className={getPriorityColor(defect.priority)}>{defect.priority}</Badge>
                          </div>
                          <h3 className="font-medium text-foreground mb-1">{defect.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Created: {defect.created} • Assigned to: {defect.assigned}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};