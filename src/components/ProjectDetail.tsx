import { ArrowLeft, Download, Eye, FileText, BarChart3, Users, Calendar, Clock, AlertCircle, FileCheck, MessageSquare, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ProjectDetailProps {
  projectId: string | null;
  onNavigate: (page: string) => void;
}

export const ProjectDetail = ({ projectId, onNavigate }: ProjectDetailProps) => {
  // Match the project data from other components
  const projects = [
    {
      id: "1",
      name: "Gordon Street, Balwyn",
      fullName: "SK 23003 - Gordon Street, Balwyn",
      location: "Balwyn, VIC",
      dateCreated: "2024-06-15",
      status: "completed",
      wbsCount: 12,
      totalCost: "$2,450,000",
      progress: 100,
      projectId: "#SK23003",
      assignedTo: "John Cooper",
      timeline: "15 Jun, 2024 - 30 Aug, 2024",
      milestone: "Development",
      type: "Residential"
    },
    {
      id: "2",
      name: "Mountain View Residential",
      fullName: "SK 23004 - Mountain View Residential",
      location: "Boulder, CO",
      dateCreated: "2024-06-20",
      status: "processing",
      wbsCount: 8,
      totalCost: "$1,850,000",
      progress: 65,
      projectId: "#SK23004",
      assignedTo: "Sarah Wilson",
      timeline: "20 Jun, 2024 - 15 Sep, 2024",
      milestone: "Construction",
      type: "Residential"
    },
    {
      id: "3",
      name: "Downtown Retail Center",
      fullName: "SK 23005 - Downtown Retail Center",
      location: "Austin, TX",
      dateCreated: "2024-06-25",
      status: "pending",
      wbsCount: 15,
      totalCost: "Pending",
      progress: 0,
      projectId: "#SK23005",
      assignedTo: "Mike Johnson",
      timeline: "25 Jun, 2024 - 20 Oct, 2024",
      milestone: "Planning",
      type: "Commercial"
    }
  ];

  // Find the current project or default to first one
  const project = projects.find(p => p.id === projectId) || projects[0];

  const summaryMetrics = [
    { label: "Contract Price", value: project.totalCost !== "Pending" ? project.totalCost : "$0", trend: "up" },
    { label: "Paid To Date", value: project.totalCost !== "Pending" ? `$${(parseInt(project.totalCost.replace(/[$,]/g, '')) * 0.65 / 1000000).toFixed(1)}M` : "$0", trend: "up" },
    { label: "Payment Received", value: project.totalCost !== "Pending" ? `$${(parseInt(project.totalCost.replace(/[$,]/g, '')) * 0.2 / 1000000).toFixed(1)}M` : "$0", trend: "up" }
  ];

  const latestUpdates = [
    { icon: FileCheck, label: "Incomplete Task", count: Math.max(20 - project.progress / 5, 0) },
    { icon: MessageSquare, label: "Unread Messages", count: project.status === "pending" ? 12 : 5 },
    { icon: FileText, label: "Unread Documents", count: project.wbsCount - Math.floor(project.progress / 10) }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "processing":
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
      case "processing":
        return "In Progress";
      case "pending":
        return "Pending";
      default:
        return "Active";
    }
  };

  // ... keep existing code (sidebarItems array)
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
            <h2 className="text-lg font-semibold text-gray-900">{project.name}</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Badge variant="outline" className={getStatusColor(project.status)}>
                {getStatusText(project.status)}
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
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{project.fullName}</h1>
              <p className="text-gray-600">{project.location}</p>
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
                <p className="text-sm text-gray-600">{project.projectId}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Assigned</p>
                <p className="text-sm text-gray-600">{project.assignedTo}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Timeline</p>
                <p className="text-sm text-gray-600">{project.timeline}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Milestone</p>
                <p className="text-sm text-gray-600">{project.milestone}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Type</p>
                <p className="text-sm text-gray-600">{project.type}</p>
              </div>
            </div>
          </div>

          {/* Progress Bar for Active Projects */}
          {project.progress > 0 && project.progress < 100 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Project Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="w-full" />
                  <p className="text-xs text-gray-500">{project.wbsCount} WBS components tracked</p>
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
