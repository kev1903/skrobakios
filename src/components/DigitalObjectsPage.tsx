import { Table } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectSidebar } from "./ProjectSidebar";
import { Project } from "@/hooks/useProjects";
import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";

interface DigitalObject {
  id: string;
  name: string;
  object_type: string;
  description: string | null;
  status: string;
  cost: number | null;
  progress: number;
  level: number;
  parent_id: string | null;
}

interface DigitalObjectsPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const DigitalObjectsPage = ({ project, onNavigate }: DigitalObjectsPageProps) => {
  // Mock data for now until digital_objects table types are updated
  const [digitalObjects] = useState<DigitalObject[]>([
    {
      id: "1",
      name: "Building Structure",
      object_type: "structure",
      description: "Main building structural components",
      status: "in_progress",
      cost: 250000,
      progress: 65,
      level: 0,
      parent_id: null
    },
    {
      id: "2", 
      name: "Foundation",
      object_type: "foundation",
      description: "Building foundation system",
      status: "completed",
      cost: 75000,
      progress: 100,
      level: 1,
      parent_id: "1"
    },
    {
      id: "3",
      name: "Framing", 
      object_type: "framing",
      description: "Steel and concrete framing",
      status: "in_progress",
      cost: 125000,
      progress: 45,
      level: 1,
      parent_id: "1"
    },
    {
      id: "4",
      name: "MEP Systems",
      object_type: "systems", 
      description: "Mechanical, Electrical, and Plumbing",
      status: "planning",
      cost: 180000,
      progress: 0,
      level: 0,
      parent_id: null
    },
    {
      id: "5",
      name: "HVAC",
      object_type: "mechanical",
      description: "Heating, Ventilation, and Air Conditioning", 
      status: "planning",
      cost: 85000,
      progress: 0,
      level: 1,
      parent_id: "4"
    }
  ]);
  const [loading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "in_progress":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case "planning":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in_progress":
        return "In Progress";
      case "planning":
        return "Planning";
      default:
        return "Active";
    }
  };

  return (
    <div className="h-screen flex backdrop-blur-xl bg-black/20 border border-white/10">
      {/* Project Sidebar */}
      <ProjectSidebar
        project={project}
        onNavigate={onNavigate}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        activeSection="digital-objects"
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto ml-48 backdrop-blur-xl bg-white/5 border-l border-white/10">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Table className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Digital Objects</h1>
                <p className="text-slate-400">Project component data table</p>
              </div>
            </div>
          </div>

          {/* Table */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-white">Loading digital objects...</div>
                </div>
              ) : (
                <TableComponent>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableHead className="text-white font-semibold">Name</TableHead>
                      <TableHead className="text-white font-semibold">Type</TableHead>
                      <TableHead className="text-white font-semibold">Description</TableHead>
                      <TableHead className="text-white font-semibold">Status</TableHead>
                      <TableHead className="text-white font-semibold">Cost</TableHead>
                      <TableHead className="text-white font-semibold">Progress</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {digitalObjects.map((obj) => (
                      <TableRow 
                        key={obj.id} 
                        className="border-white/10 hover:bg-white/5"
                        style={{ paddingLeft: `${obj.level * 20}px` }}
                      >
                        <TableCell className="text-white font-medium" style={{ paddingLeft: `${obj.level * 20 + 16}px` }}>
                          {obj.name}
                        </TableCell>
                        <TableCell className="text-slate-300 capitalize">{obj.object_type}</TableCell>
                        <TableCell className="text-slate-300">{obj.description || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(obj.status)}>
                            {getStatusText(obj.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {obj.cost ? `$${obj.cost.toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell className="text-slate-300">{obj.progress}%</TableCell>
                      </TableRow>
                    ))}
                    {digitalObjects.length === 0 && (
                      <TableRow className="border-white/10">
                        <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                          No digital objects found for this project
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </TableComponent>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};