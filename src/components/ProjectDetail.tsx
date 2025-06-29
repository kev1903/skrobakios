
import { ArrowLeft, Download, Eye, FileText, BarChart3, Users, Calendar, Clock, AlertCircle, FileCheck, MessageSquare, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useProjects, Project } from "@/hooks/useProjects";
import { useState, useEffect } from "react";

interface ProjectDetailProps {
  projectId: string | null;
  onNavigate: (page: string) => void;
}

export const ProjectDetail = ({ projectId, onNavigate }: ProjectDetailProps) => {
  const [project, setProject] = useState<Project | null>(null);
  const { getProjects, loading } = useProjects();

  useEffect(() => {
    const fetchProject = async () => {
      const projects = await getProjects();
      const foundProject = projects.find(p => p.id === projectId);
      if (foundProject) {
        setProject(foundProject);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  // Fallback project data if no project is found
  const fallbackProject = {
    id: "1",
    project_id: "SK23003",
    name: "Gordon Street, Balwyn",
    location: "Balwyn, VIC",
    created_at: "2024-06-15T00:00:00Z",
    status: "completed",
    contract_price: "$2,450,000",
    start_date: "2024-06-15",
    deadline: "2024-08-30",
    updated_at: "2024-06-15T00:00:00Z"
  };

  const currentProject = project || fallbackProject;

  const summaryMetrics = [
    { label: "Contract Price", value: currentProject.contract_price || "$0", trend: "up" },
    { label: "Paid To Date", value: currentProject.contract_price ? `$${(parseInt(currentProject.contract_price.replace(/[$,]/g, '')) * 0.65 / 1000000).toFixed(1)}M` : "$0", trend: "up" },
    { label: "Payment Received", value: currentProject.contract_price ? `$${(parseInt(currentProject.contract_price.replace(/[$,]/g, '')) * 0.2 / 1000000).toFixed(1)}M` : "$0", trend: "up" }
  ];

  const getProgress = (status: string) => {
    switch (status) {
      case "completed":
        return 100;
      case "running":
        return 65;
      case "pending":
        return 0;
      default:
        return 0;
    }
  };

  const progress = getProgress(currentProject.status);
  const wbsCount = Math.floor(Math.random() * 10) + 8; // Random WBS count for demo

  const latestUpdates = [
    { icon: FileCheck, label: "Incomplete Task", count: Math.max(20 - progress / 5, 0) },
    { icon: MessageSquare, label: "Unread Messages", count: currentProject.status === "pending" ? 12 : 5 },
    { icon: FileText, label: "Unread Documents", count: wbsCount - Math.floor(progress / 10) }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "running":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "running":
        return "In Progress";
      case "pending":
        return "Pending";
      default:
        return "Active";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const sidebarItems = [
    { id: "insights", label: "Insights", icon: BarChart3, active: true },
    { id: "tasks", label: "Tasks", icon: FileCheck, active: false },
    { id: "sections", label: "Sections", icon: FileText, active: false },
    { id: "cost", label: "Cost", icon: BarChart3, active: false },
    { id: "schedule", label: "Schedule", icon: Calendar, active: false },
    { id: "issues", label: "Issues", icon: AlertCircle, active: false },
    { id: "audit", label: "Audit", icon: FileCheck, active: false },
    { id: "files", label: "Files", icon: FileText, active: false },
    { id: "media", label: "Media", icon: Eye, active: false },
    { id: "documents", label: "Documents", icon: FileText, active: false },
    { id: "setting", label: "Setting", icon: Settings, active: false }
  ];

  if (loading) {
    return (
      <div className="h-screen flex bg-gray-50">
        <div className="flex items-center justify-center w-full">
          <div className="text-gray-500">Loading project details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Project Sidebar - Remove shadow completely */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col" style={{ boxShadow: 'none' }}>
        <div className="p-4 border-b border-gray-200">
          <Button
            variant="ghost"
            onClick={() => onNavigate("projects")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          
          <div className="mb-2">
            <h2 className="text-lg font-semibold text-gray-900">{currentProject.name}</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Badge variant="outline" className={getStatusColor(currentProject.status)}>
                {getStatusText(currentProject.status)}
              </Badge>
              <span>Last Updated 12h Ago</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  item.active
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content - Takes remaining space */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header with Edit Button */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{currentProject.name}</h1>
              <p className="text-gray-600">{currentProject.location}</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Edit
            </Button>
          </div>

          {/* Hero Image */}
          <div className="mb-8">
            <div className="w-full h-48 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg flex items-center justify-center text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative text-center">
                <h2 className="text-4xl font-bold mb-2 tracking-wider">SALFORD</h2>
                <p className="text-sm tracking-widest opacity-90">YOUR PREMIER REAL ESTATE AGENCY</p>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Project ID</p>
                <p className="text-sm text-gray-600">#{currentProject.project_id}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Assigned</p>
                <p className="text-sm text-gray-600">Project Manager</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Timeline</p>
                <p className="text-sm text-gray-600">
                  {formatDate(currentProject.start_date || currentProject.created_at)} - {formatDate(currentProject.deadline || currentProject.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Status</p>
                <p className="text-sm text-gray-600">{getStatusText(currentProject.status)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Priority</p>
                <p className="text-sm text-gray-600">{currentProject.priority || 'Medium'}</p>
              </div>
            </div>
          </div>

          {/* Progress Bar for Active Projects */}
          {progress > 0 && progress < 100 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Project Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                  <p className="text-xs text-gray-500">{wbsCount} WBS components tracked</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Project Summary Cost */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Project Summary Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {summaryMetrics.map((metric, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-600">{metric.label}</h3>
                      <div className="w-12 h-8 bg-blue-50 rounded flex items-center justify-center">
                        <div className="w-6 h-4 bg-blue-200 rounded-sm"></div>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Latest Update */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Latest Update</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {latestUpdates.map((update, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <update.icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{update.label}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{update.count.toString().padStart(2, '0')}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
