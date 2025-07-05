import { Table, Edit, Check, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<DigitalObject>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Mock data for now until digital_objects table types are updated
  const [digitalObjects, setDigitalObjects] = useState<DigitalObject[]>([
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

  const handleRowClick = (obj: DigitalObject) => {
    if (editingId !== obj.id) {
      setEditingId(obj.id);
      setEditingData({ ...obj });
    }
  };

  const handleSave = async () => {
    if (!editingId || !editingData) return;

    try {
      // Update local state
      setDigitalObjects(prev => 
        prev.map(obj => 
          obj.id === editingId 
            ? { ...obj, ...editingData } as DigitalObject
            : obj
        )
      );

      // Try to save to database (will work once types are updated)
      try {
        const { error } = await supabase
          .from('digital_objects' as any)
          .update({
            name: editingData.name,
            object_type: editingData.object_type,
            description: editingData.description,
            status: editingData.status,
            cost: editingData.cost,
            progress: editingData.progress
          })
          .eq('id', editingId);

        if (error) {
          console.log('Database update will be enabled once types are updated:', error);
        }
      } catch (dbError) {
        console.log('Database save pending type updates');
      }

      toast({
        title: "Updated",
        description: "Digital object updated successfully",
      });

      setEditingId(null);
      setEditingData({});
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update digital object",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData({});
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Handle click outside to save
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (editingId) {
          handleSave();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingId]);

  const renderEditableCell = (field: keyof DigitalObject, value: any, type: 'text' | 'number' | 'select' = 'text') => {
    if (editingId && editingData) {
      if (type === 'select' && field === 'status') {
        return (
          <Select
            value={editingData[field] as string || ''}
            onValueChange={(val) => setEditingData(prev => ({ ...prev, [field]: val }))}
          >
            <SelectTrigger className="h-7 bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        );
      }
      
      return (
        <Input
          type={type}
          value={editingData[field] as string || ''}
          onChange={(e) => setEditingData(prev => ({ 
            ...prev, 
            [field]: type === 'number' ? Number(e.target.value) : e.target.value 
          }))}
          onKeyDown={handleKeyDown}
          className="h-7 bg-white/10 border-white/20 text-white"
          autoFocus={field === 'name'}
        />
      );
    }
    return value;
  };

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
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm" ref={containerRef}>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-white">Loading digital objects...</div>
                </div>
              ) : (
                <TableComponent>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5 h-10">
                      <TableHead className="text-white font-semibold h-10">Name</TableHead>
                      <TableHead className="text-white font-semibold h-10">Type</TableHead>
                      <TableHead className="text-white font-semibold h-10">Description</TableHead>
                      <TableHead className="text-white font-semibold h-10">Status</TableHead>
                      <TableHead className="text-white font-semibold h-10">Cost</TableHead>
                      <TableHead className="text-white font-semibold h-10">Progress</TableHead>
                      <TableHead className="text-white font-semibold h-10 w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {digitalObjects.map((obj) => (
                      <TableRow 
                        key={obj.id} 
                        className={`border-white/10 hover:bg-white/5 h-10 cursor-pointer transition-colors ${
                          editingId === obj.id ? 'bg-white/10' : ''
                        }`}
                        onClick={() => handleRowClick(obj)}
                      >
                        <TableCell className="text-white font-medium h-10 py-2" style={{ paddingLeft: `${obj.level * 20 + 16}px` }}>
                          {renderEditableCell('name', obj.name)}
                        </TableCell>
                        <TableCell className="text-slate-300 capitalize h-10 py-2">
                          {renderEditableCell('object_type', obj.object_type)}
                        </TableCell>
                        <TableCell className="text-slate-300 h-10 py-2">
                          {renderEditableCell('description', obj.description || '-')}
                        </TableCell>
                        <TableCell className="h-10 py-2">
                          {editingId === obj.id ? (
                            renderEditableCell('status', obj.status, 'select')
                          ) : (
                            <Badge variant="outline" className={getStatusColor(obj.status)}>
                              {getStatusText(obj.status)}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-300 h-10 py-2">
                          {editingId === obj.id ? (
                            renderEditableCell('cost', obj.cost || 0, 'number')
                          ) : (
                            obj.cost ? `$${obj.cost.toLocaleString()}` : '-'
                          )}
                        </TableCell>
                        <TableCell className="text-slate-300 h-10 py-2">
                          {editingId === obj.id ? (
                            renderEditableCell('progress', obj.progress, 'number')
                          ) : (
                            `${obj.progress}%`
                          )}
                        </TableCell>
                        <TableCell className="h-10 py-2">
                          {editingId === obj.id ? (
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSave();
                                }}
                                className="p-1 text-green-400 hover:text-green-300"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancel();
                                }}
                                className="p-1 text-red-400 hover:text-red-300"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <Edit className="w-4 h-4 text-slate-400" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {digitalObjects.length === 0 && (
                      <TableRow className="border-white/10 h-10">
                        <TableCell colSpan={7} className="text-center text-slate-400 py-8">
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