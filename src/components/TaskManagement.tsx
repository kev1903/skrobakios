
import React, { useState } from "react";
import { Plus, Download, Filter, MoreHorizontal, Eye, Edit, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TaskManagementProps {
  onNavigate: (page: string) => void;
}

export const TaskManagement = ({ onNavigate }: TaskManagementProps) => {
  // Redirect to the new MY TASKS page
  React.useEffect(() => {
    onNavigate("my-tasks");
  }, [onNavigate]);

  const [searchTerm, setSearchTerm] = useState("");

  const tasks = [
    {
      id: "#216587",
      projectName: "Project 01",
      taskName: "Task 01",
      priority: "Low",
      assignedTo: { name: "Cody Fisher", avatar: "/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png" },
      dueDate: "20 Aug, 2023",
      status: "Active"
    },
    {
      id: "#216587",
      projectName: "Project 02",
      taskName: "Task 02",
      priority: "Medium",
      assignedTo: { name: "Jenny Wilson", avatar: "/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png" },
      dueDate: "20 Aug, 2023",
      status: "Active"
    },
    {
      id: "#216587",
      projectName: "Project 03",
      taskName: "Task 03",
      priority: "Low",
      assignedTo: { name: "Esther Howard", avatar: "/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png" },
      dueDate: "20 Aug, 2023",
      status: "Active"
    },
    {
      id: "#216587",
      projectName: "Project 04",
      taskName: "Task 04",
      priority: "Low",
      assignedTo: { name: "Jerome Bell", avatar: "/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png" },
      dueDate: "20 Aug, 2023",
      status: "Active"
    },
    {
      id: "#216587",
      projectName: "Project 04",
      taskName: "Task 04",
      priority: "High",
      assignedTo: { name: "Courtney Henry", avatar: "/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png" },
      dueDate: "20 Aug, 2023",
      status: "Active"
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
    return "bg-green-100 text-green-800 border-green-200";
  };

  return (
    <div className="h-full bg-gray-50" style={{ boxShadow: 'none' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4" style={{ boxShadow: 'none' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80 bg-gray-50 border-gray-200"
                style={{ boxShadow: 'none' }}
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              onClick={() => onNavigate("upload")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              style={{ boxShadow: 'none' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Task
            </Button>
            <Button variant="outline" className="px-4 py-2" style={{ boxShadow: 'none' }}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" className="px-4 py-2" style={{ boxShadow: 'none' }}>
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" className="px-4 py-2" style={{ boxShadow: 'none' }}>
              <Eye className="w-4 h-4 mr-2" />
              3D View
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" style={{ boxShadow: 'none' }}>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-12">
                  <Checkbox />
                </TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Project Name</TableHead>
                <TableHead>Task Name</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell className="font-medium text-blue-600">
                    {task.id}
                  </TableCell>
                  <TableCell>{task.projectName}</TableCell>
                  <TableCell>{task.taskName}</TableCell>
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
                      <Button variant="ghost" size="sm" style={{ boxShadow: 'none' }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" style={{ boxShadow: 'none' }}>
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
