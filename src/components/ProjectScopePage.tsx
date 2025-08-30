import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, Edit2, Trash2, GripVertical, Copy, MoreHorizontal } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { Project } from '@/hooks/useProjects';
import { useScreenSize } from '@/hooks/use-mobile';

interface ProjectScopePageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

interface ScopeComponent {
  id: string;
  name: string;
  description?: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  progress: number;
  isExpanded: boolean;
  elements: ScopeElement[];
}

interface ScopeElement {
  id: string;
  name: string;
  description?: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  progress: number;
  deliverable?: string;
  assignedTo?: string;
}

// Sample data
const sampleScopeData: ScopeComponent[] = [
  {
    id: 'comp-1',
    name: 'Site Preparation',
    description: 'Initial site preparation and setup activities',
    status: 'In Progress',
    progress: 65,
    isExpanded: true,
    elements: [
      {
        id: 'elem-1-1',
        name: 'Site Survey',
        description: 'Conduct detailed site survey and measurements',
        status: 'Completed',
        progress: 100,
        deliverable: 'Survey Report',
        assignedTo: 'John Smith'
      },
      {
        id: 'elem-1-2',
        name: 'Soil Testing',
        description: 'Perform geotechnical soil analysis',
        status: 'In Progress',
        progress: 75,
        deliverable: 'Soil Test Results',
        assignedTo: 'Jane Doe'
      },
      {
        id: 'elem-1-3',
        name: 'Clearing & Grading',
        description: 'Clear vegetation and grade the site',
        status: 'Not Started',
        progress: 0,
        deliverable: 'Graded Site',
        assignedTo: 'Mike Johnson'
      }
    ]
  },
  {
    id: 'comp-2',
    name: 'Foundation Work',
    description: 'Foundation design and construction',
    status: 'Not Started',
    progress: 0,
    isExpanded: false,
    elements: [
      {
        id: 'elem-2-1',
        name: 'Foundation Design',
        description: 'Structural foundation design and calculations',
        status: 'Not Started',
        progress: 0,
        deliverable: 'Foundation Drawings',
        assignedTo: 'Sarah Wilson'
      },
      {
        id: 'elem-2-2',
        name: 'Excavation',
        description: 'Excavate foundation areas',
        status: 'Not Started',
        progress: 0,
        deliverable: 'Excavated Site',
        assignedTo: 'Tom Brown'
      }
    ]
  },
  {
    id: 'comp-3',
    name: 'Structural Framework',
    description: 'Main structural elements and framework',
    status: 'Not Started',
    progress: 0,
    isExpanded: false,
    elements: [
      {
        id: 'elem-3-1',
        name: 'Steel Framework',
        description: 'Install primary steel structural framework',
        status: 'Not Started',
        progress: 0,
        deliverable: 'Steel Structure',
        assignedTo: 'Alex Davis'
      }
    ]
  }
];

export const ProjectScopePage = ({ project, onNavigate }: ProjectScopePageProps) => {
  const [scopeData, setScopeData] = useState<ScopeComponent[]>(sampleScopeData);
  const screenSize = useScreenSize();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-success/10 text-success border-success/20';
      case 'In Progress': return 'bg-primary/10 text-primary border-primary/20';
      case 'On Hold': return 'bg-warning/10 text-warning border-warning/20';
      case 'Not Started': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 0) return 'bg-muted';
    if (progress < 30) return 'bg-destructive';
    if (progress < 70) return 'bg-warning';
    return 'bg-success';
  };

  const toggleComponent = (componentId: string) => {
    setScopeData(prev => 
      prev.map(comp => 
        comp.id === componentId 
          ? { ...comp, isExpanded: !comp.isExpanded }
          : comp
      )
    );
  };

  const handleContextMenuAction = (action: string, componentId: string, elementId?: string) => {
    switch (action) {
      case 'edit':
        console.log('Edit', elementId || componentId);
        // Add edit functionality here
        break;
      case 'duplicate':
        console.log('Duplicate', elementId || componentId);
        // Add duplicate functionality here
        break;
      case 'delete':
        console.log('Delete', elementId || componentId);
        // Add delete functionality here
        break;
    }
  };

  const generateWBSNumber = (componentIndex: number, elementIndex?: number) => {
    const componentNumber = componentIndex + 1;
    if (elementIndex !== undefined) {
      return `${componentNumber}.${elementIndex + 1}`;
    }
    return componentNumber.toString();
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(scopeData);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setScopeData(items);
  };

  const calculateOverallProgress = () => {
    const totalElements = scopeData.reduce((sum, comp) => sum + comp.elements.length, 0);
    const totalProgress = scopeData.reduce((sum, comp) => 
      sum + comp.elements.reduce((elemSum, elem) => elemSum + elem.progress, 0), 0
    );
    return totalElements > 0 ? Math.round(totalProgress / totalElements) : 0;
  };

  // Responsive classes based on screen size
  const mainClasses = {
    mobile: "flex flex-col h-screen",
    tablet: "flex flex-col h-screen", 
    desktop: "flex h-screen"
  };

  const contentClasses = {
    mobile: "flex-1 overflow-hidden",
    tablet: "flex-1 overflow-hidden",
    desktop: "flex-1 ml-48 overflow-hidden"
  };

  return (
    <div className={mainClasses[screenSize]}>
      {/* Project Sidebar */}
      <ProjectSidebar 
        project={project}
        onNavigate={onNavigate}
        getStatusColor={getStatusColor}
        getStatusText={(status) => status}
        activeSection="specification"
      />

      {/* Main Content */}
      <div className={contentClasses[screenSize]}>
        <div className="flex flex-col h-full bg-background">
          {/* Header */}
          <div className="flex-shrink-0 border-b border-border px-6 py-4 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground font-inter">Project Scope</h1>
                <p className="text-muted-foreground mt-1 text-sm font-inter">{project.name}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground font-inter">Overall Progress</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${getProgressColor(calculateOverallProgress())}`}
                        style={{ width: `${calculateOverallProgress()}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-foreground font-inter">{calculateOverallProgress()}%</span>
                  </div>
                </div>
                <Button size="sm" className="font-inter text-xs">
                  <Plus className="w-3 h-3 mr-1" />
                  Add Component
                </Button>
              </div>
            </div>
          </div>

          {/* Scope Table */}
          <div className="flex-1 overflow-auto px-6 py-4">
            <div className="glass-card border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-8 font-inter">Drag</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-8 font-inter"></th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-16 font-inter">WBS</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider font-inter">Name</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider font-inter">Description</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider font-inter">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider font-inter">Progress</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider font-inter">Assigned To</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider font-inter">Deliverable</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-20 font-inter">Actions</th>
                  </tr>
                </thead>
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="scope-components">
                    {(provided) => (
                      <tbody 
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="bg-card/50 divide-y divide-border"
                      >
                        {scopeData.map((component, index) => (
                          <Draggable key={component.id} draggableId={component.id} index={index}>
                            {(provided, snapshot) => (
                              <React.Fragment>
                                 {/* Component Row */}
                                 <tr 
                                   ref={provided.innerRef}
                                   {...provided.draggableProps}
                                   className={`hover:bg-accent/20 bg-primary/5 transition-colors duration-200 ${
                                     snapshot.isDragging ? 'shadow-lg bg-card' : ''
                                   }`}
                                   onContextMenu={(e) => {
                                     e.preventDefault();
                                     // Context menu will be handled by the dropdown
                                   }}
                                 >
                                   <td className="px-3 py-2">
                                     <div 
                                       {...provided.dragHandleProps}
                                       className="cursor-grab hover:cursor-grabbing p-1 hover:bg-accent rounded transition-colors duration-200"
                                     >
                                       <GripVertical className="w-3 h-3 text-muted-foreground" />
                                     </div>
                                   </td>
                                   <td className="px-3 py-2">
                                     <button
                                       onClick={() => toggleComponent(component.id)}
                                       className="p-1 hover:bg-accent rounded transition-colors duration-200"
                                     >
                                       {component.isExpanded ? (
                                         <ChevronDown className="w-3 h-3 text-muted-foreground" />
                                       ) : (
                                         <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                       )}
                                     </button>
                                   </td>
                                    <td className="px-3 py-2">
                                      <div className="font-medium text-primary text-sm font-inter">{generateWBSNumber(index)}</div>
                                    </td>
                                    <td className="px-3 py-2">
                                      <div className="font-medium text-foreground text-sm font-inter">{component.name}</div>
                                    </td>
                                   <td className="px-3 py-2 text-muted-foreground text-xs font-inter">{component.description}</td>
                                   <td className="px-3 py-2">
                                     <Badge variant="outline" className={`${getStatusColor(component.status)} text-xs font-inter`}>
                                       {component.status}
                                     </Badge>
                                   </td>
                                   <td className="px-3 py-2">
                                     <div className="flex items-center gap-2">
                                       <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                                         <div 
                                           className={`h-full transition-all duration-300 ${getProgressColor(component.progress)}`}
                                           style={{ width: `${component.progress}%` }}
                                         />
                                       </div>
                                       <span className="text-xs text-muted-foreground font-inter">{component.progress}%</span>
                                     </div>
                                   </td>
                                   <td className="px-3 py-2 text-muted-foreground text-xs font-inter">-</td>
                                   <td className="px-3 py-2 text-muted-foreground text-xs font-inter">-</td>
                                   <td className="px-3 py-2">
                                     <div className="flex items-center gap-1">
                                       <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                         <Edit2 className="w-3 h-3" />
                                       </Button>
                                       <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                         <Trash2 className="w-3 h-3" />
                                       </Button>
                                       <DropdownMenu>
                                         <DropdownMenuTrigger asChild>
                                           <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                             <MoreHorizontal className="w-3 h-3" />
                                           </Button>
                                         </DropdownMenuTrigger>
                                         <DropdownMenuContent align="end">
                                           <DropdownMenuItem onClick={() => handleContextMenuAction('edit', component.id)}>
                                             <Edit2 className="w-3 h-3 mr-2" />
                                             Edit
                                           </DropdownMenuItem>
                                           <DropdownMenuItem onClick={() => handleContextMenuAction('duplicate', component.id)}>
                                             <Copy className="w-3 h-3 mr-2" />
                                             Duplicate
                                           </DropdownMenuItem>
                                           <DropdownMenuSeparator />
                                           <DropdownMenuItem 
                                             onClick={() => handleContextMenuAction('delete', component.id)}
                                             className="text-destructive focus:text-destructive"
                                           >
                                             <Trash2 className="w-3 h-3 mr-2" />
                                             Delete
                                           </DropdownMenuItem>
                                         </DropdownMenuContent>
                                       </DropdownMenu>
                                     </div>
                                   </td>
                                 </tr>
                                
                                 {/* Element Rows */}
                                 {component.isExpanded && component.elements.map((element, elementIndex) => (
                                   <tr key={element.id} className="hover:bg-accent/10 transition-colors duration-200">
                                     <td className="px-3 py-1.5"></td>
                                     <td className="px-3 py-1.5"></td>
                                     <td className="px-3 py-1.5">
                                       <div className="font-medium text-primary text-sm font-inter">{generateWBSNumber(index, elementIndex)}</div>
                                     </td>
                                     <td className="px-3 py-1.5">
                                       <div className="pl-4 text-foreground text-sm font-inter">
                                         <div className="flex items-center gap-2">
                                           <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></div>
                                           {element.name}
                                         </div>
                                       </div>
                                     </td>
                                    <td className="px-3 py-1.5 text-muted-foreground text-xs font-inter">{element.description}</td>
                                    <td className="px-3 py-1.5">
                                      <Badge variant="outline" className={`${getStatusColor(element.status)} text-xs font-inter`}>
                                        {element.status}
                                      </Badge>
                                    </td>
                                    <td className="px-3 py-1.5">
                                      <div className="flex items-center gap-2">
                                        <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                                          <div 
                                            className={`h-full transition-all duration-300 ${getProgressColor(element.progress)}`}
                                            style={{ width: `${element.progress}%` }}
                                          />
                                        </div>
                                        <span className="text-xs text-muted-foreground font-inter">{element.progress}%</span>
                                      </div>
                                    </td>
                                    <td className="px-3 py-1.5 text-muted-foreground text-xs font-inter">{element.assignedTo}</td>
                                    <td className="px-3 py-1.5 text-muted-foreground text-xs font-inter">{element.deliverable}</td>
                                     <td className="px-3 py-1.5">
                                       <div className="flex items-center gap-1">
                                         <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                           <Edit2 className="w-3 h-3" />
                                         </Button>
                                         <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                           <Trash2 className="w-3 h-3" />
                                         </Button>
                                         <DropdownMenu>
                                           <DropdownMenuTrigger asChild>
                                             <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                               <MoreHorizontal className="w-3 h-3" />
                                             </Button>
                                           </DropdownMenuTrigger>
                                           <DropdownMenuContent align="end">
                                             <DropdownMenuItem onClick={() => handleContextMenuAction('edit', component.id, element.id)}>
                                               <Edit2 className="w-3 h-3 mr-2" />
                                               Edit
                                             </DropdownMenuItem>
                                             <DropdownMenuItem onClick={() => handleContextMenuAction('duplicate', component.id, element.id)}>
                                               <Copy className="w-3 h-3 mr-2" />
                                               Duplicate
                                             </DropdownMenuItem>
                                             <DropdownMenuSeparator />
                                             <DropdownMenuItem 
                                               onClick={() => handleContextMenuAction('delete', component.id, element.id)}
                                               className="text-destructive focus:text-destructive"
                                             >
                                               <Trash2 className="w-3 h-3 mr-2" />
                                               Delete
                                             </DropdownMenuItem>
                                           </DropdownMenuContent>
                                         </DropdownMenu>
                                       </div>
                                     </td>
                                  </tr>
                                ))}
                              </React.Fragment>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </tbody>
                    )}
                  </Droppable>
                </DragDropContext>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};