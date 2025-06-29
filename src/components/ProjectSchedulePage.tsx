import { ArrowLeft, Calendar, Clock, Users, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/hooks/useProjects";

interface ProjectSchedulePageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectSchedulePage = ({ project, onNavigate }: ProjectSchedulePageProps) => {
  const mockScheduleData = [
    {
      id: 1,
      task: "Site Preparation",
      startDate: "Jun 10, 2025",
      endDate: "Jun 15, 2025",
      duration: "5 days",
      status: "completed",
      assignee: "Site Team A"
    },
    {
      id: 2,
      task: "Foundation Work",
      startDate: "Jun 16, 2025",
      endDate: "Jun 25, 2025",
      duration: "10 days",
      status: "in-progress",
      assignee: "Foundation Crew"
    },
    {
      id: 3,
      task: "Structural Framework",
      startDate: "Jun 26, 2025",
      endDate: "Jul 15, 2025",
      duration: "20 days",
      status: "pending",
      assignee: "Construction Team B"
    },
    {
      id: 4,
      task: "Electrical Installation",
      startDate: "Jul 16, 2025",
      endDate: "Jul 30, 2025",
      duration: "15 days",
      status: "pending",
      assignee: "Electrical Team"
    },
    {
      id: 5,
      task: "Plumbing Installation",
      startDate: "Aug 1, 2025",
      endDate: "Aug 10, 2025",
      duration: "10 days",
      status: "pending",
      assignee: "Plumbing Team"
    },
    {
      id: 6,
      task: "Interior Finishing",
      startDate: "Aug 11, 2025",
      endDate: "Aug 25, 2025",
      duration: "15 days",
      status: "pending",
      assignee: "Interior Team"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in-progress":
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
      case "in-progress":
        return "In Progress";
      case "pending":
        return "Pending";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Button
            variant="ghost"
            onClick={() => onNavigate("project-detail")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Project</span>
          </Button>
          
          <div className="mb-2">
            <h2 className="text-lg font-semibold text-gray-900">{project.name}</h2>
            <p className="text-sm text-gray-500">Project Schedule</p>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg border border-blue-200">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Timeline View</span>
            </div>
            <button 
              onClick={() => onNavigate("gantt-chart")}
              className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Gantt Chart</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Resource View</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Project Schedule</h1>
              <p className="text-gray-600">{project.name} - Timeline View</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Export Schedule
              </Button>
              <Button 
                variant="outline"
                onClick={() => onNavigate("gantt-chart")}
              >
                <Calendar className="w-4 h-4 mr-2" />
                View Gantt Chart
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Clock className="w-4 h-4 mr-2" />
                Update Timeline
              </Button>
            </div>
          </div>

          {/* Project Timeline Overview */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Project Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="text-lg font-semibold">{project.start_date}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="text-lg font-semibold">{project.deadline}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="text-lg font-semibold">76 days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Task Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockScheduleData.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{task.task}</h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{task.startDate} - {task.endDate}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{task.duration}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{task.assignee}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className={getStatusColor(task.status)}>
                        {getStatusText(task.status)}
                      </Badge>
                      {task.status === "in-progress" && (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
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
