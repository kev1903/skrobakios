import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, Plus, Search, Filter, MoreHorizontal, Edit, Eye } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { useProjects, Project } from '@/hooks/useProjects';

interface RFIListPageProps {
  onNavigate: (page: string) => void;
}

export const RFIListPage = ({ onNavigate }: RFIListPageProps) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const type = searchParams.get('type') || 'rfi';
  const { getProject } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

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

  // Mock data based on type
  const getDataByType = () => {
    switch (type) {
      case 'rfi':
        return {
          title: 'Request for Information (RFI)',
          items: [
            {
              id: "RFI-001",
              title: "Clarification on Foundation Details",
              status: "open",
              priority: "high",
              created: "2024-01-15",
              assigned: "Project Manager",
              description: "Need clarification on foundation depth requirements for the east wing."
            },
            {
              id: "RFI-002", 
              title: "Material Specifications for Steel Frame",
              status: "pending",
              priority: "medium",
              created: "2024-01-14",
              assigned: "Site Engineer",
              description: "Requesting detailed specifications for steel frame materials."
            },
            {
              id: "RFI-003",
              title: "Electrical Layout Approval",
              status: "resolved",
              priority: "low",
              created: "2024-01-10",
              assigned: "Electrical Contractor",
              description: "Electrical layout has been approved and signed off."
            }
          ]
        };
      case 'issues':
        return {
          title: 'Project Issues',
          items: [
            {
              id: "ISS-001",
              title: "Drainage System Blockage",
              status: "critical",
              priority: "high",
              created: "2024-01-16",
              assigned: "Site Supervisor",
              description: "Main drainage line is blocked causing water backup."
            },
            {
              id: "ISS-002",
              title: "Concrete Curing Time Extended",
              status: "active",
              priority: "medium",
              created: "2024-01-15",
              assigned: "Quality Inspector",
              description: "Concrete curing time needs to be extended due to weather conditions."
            }
          ]
        };
      case 'defects':
        return {
          title: 'Defects & Quality Issues',
          items: [
            {
              id: "DEF-001",
              title: "Paint Finish Quality Below Standard",
              status: "open",
              priority: "medium",
              created: "2024-01-14",
              assigned: "Painting Contractor",
              description: "Paint finish in the lobby area does not meet quality standards."
            },
            {
              id: "DEF-002",
              title: "Tile Alignment Issues in Bathroom",
              status: "in-progress",
              priority: "low",
              created: "2024-01-12",
              assigned: "Tiling Contractor",
              description: "Tiles in bathroom 3B are not properly aligned."
            }
          ]
        };
      default:
        return { title: 'Items', items: [] };
    }
  };

  const data = getDataByType();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
      case 'active':
      case 'critical':
        return 'destructive';
      case 'pending':
      case 'in-progress':
        return 'secondary';
      case 'resolved':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'default';
      default:
        return 'outline';
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === data.items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(data.items.map(item => item.id));
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
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
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onNavigate(`project-qaqc?projectId=${projectId}`)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to QA/QC
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{data.title}</h1>
                  <p className="text-gray-600">{project.name} - #{project.project_id}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New {type.toUpperCase()}
                </Button>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-lg border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.length === data.items.length && data.items.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all items"
                    />
                  </TableHead>
                  <TableHead className="font-medium">{type.toUpperCase()} #</TableHead>
                  <TableHead className="font-medium">{type.toUpperCase()} Name</TableHead>
                  <TableHead className="font-medium">Type</TableHead>
                  <TableHead className="font-medium">Priority</TableHead>
                  <TableHead className="font-medium">Assigned To</TableHead>
                  <TableHead className="font-medium">Created Date</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => handleSelectItem(item.id)}
                        aria-label={`Select ${item.id}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-primary">
                      {item.id}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-64">
                          {item.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{type.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityColor(item.priority)}>
                        {item.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.assigned}
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.created}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};