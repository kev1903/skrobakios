
import React, { useState } from 'react';
import { ArrowLeft, Plus, Download, Filter, Search, Edit, MoreHorizontal, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Project } from '@/hooks/useProjects';

interface ProjectTasksPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectTasksPage = ({ project, onNavigate }: ProjectTasksPageProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("list");

  const ribbonItems = [
    { id: "overview", label: "Overview", icon: Eye },
    { id: "list", label: "List", icon: null },
    { id: "board", label: "Board", icon: null },
    { id: "timeline", label: "Timeline", icon: null },
    { id: "calendar", label: "Calendar", icon: null },
    { id: "workflow", label: "Workflow", icon: null },
    { id: "dashboard", label: "Dashboard", icon: null },
    { id: "messages", label: "Messages", icon: null },
    { id: "files", label: "Files", icon: null }
  ];

  const projectTasks = [
    {
      id: "#PT001",
      taskName: "Site Preparation",
      priority: "High",
      assignedTo: { name: "John Smith", avatar: "/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png" },
      dueDate: "2024-07-15",
      status: "In Progress",
      progress: 75
    },
    {
      id: "#PT002",
      taskName: "Foundation Work",
      priority: "High",
      assignedTo: { name: "Sarah Wilson", avatar: "/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png" },
      dueDate: "2024-07-20",
      status: "Pending",
      progress: 0
    },
    {
      id: "#PT003",
      taskName: "Architectural Review",
      priority: "Medium",
      assignedTo: { name: "Mike Johnson", avatar: "/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png" },
      dueDate: "2024-07-10",
      status: "Completed",
      progress: 100
    },
    {
      id: "#PT004",
      taskName: "Electrical Planning",
      priority: "Medium",
      assignedTo: { name: "Lisa Brown", avatar: "/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png" },
      dueDate: "2024-07-18",
      status: "In Progress",
      progress: 40
    },
    {
      id: "#PT005",
      taskName: "Plumbing Installation",
      priority: "Low",
      assignedTo: { name: "David Miller", avatar: "/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png" },
      dueDate: "2024-07-25",
      status: "Not Started",
      progress: 0
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "not started":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header with Project Info and Back Button */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => onNavigate("project-detail")}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
              <p className="text-sm text-gray-500">{project.project_id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              Set status
            </Button>
          </div>
        </div>
      </div>

      {/* Horizontal Ribbon Navigation */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {ribbonItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === item.id
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 border-transparent hover:border-gray-300'
              }`}
            >
              {item.icon && <item.icon className="w-4 h-4" />}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Action Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80 bg-gray-50 border-gray-200"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
              <Button variant="outline" className="px-4 py-2">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" className="px-4 py-2">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        <div className="p-6">
          {activeTab === "list" && (
            <>
              {/* Task Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">5</p>
                      <p className="text-sm text-gray-500">Total Tasks</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">2</p>
                      <p className="text-sm text-gray-500">In Progress</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">1</p>
                      <p className="text-sm text-gray-500">Completed</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">0</p>
                      <p className="text-sm text-gray-500">Overdue</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tasks Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-12">
                          <Checkbox />
                        </TableHead>
                        <TableHead>Task ID</TableHead>
                        <TableHead>Task Name</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projectTasks.map((task, index) => (
                        <TableRow key={index} className="hover:bg-gray-50">
                          <TableCell>
                            <Checkbox />
                          </TableCell>
                          <TableCell className="font-medium text-blue-600">
                            {task.id}
                          </TableCell>
                          <TableCell className="font-medium">{task.taskName}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={getPriorityColor(task.priority)}
                            >
                              {task.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={task.assignedTo.avatar} />
                                <AvatarFallback>
                                  {task.assignedTo.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{task.assignedTo.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{task.dueDate}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={getStatusColor(task.status)}
                            >
                              {task.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${task.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{task.progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab !== "list" && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-500 text-lg">Coming Soon</p>
                <p className="text-gray-400 text-sm mt-2">
                  {ribbonItems.find(item => item.id === activeTab)?.label} view is under development
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
