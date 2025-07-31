
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
    console.log('TaskManagement: Redirecting to my-tasks');
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

  // Just render null while redirecting
  return null;
};
