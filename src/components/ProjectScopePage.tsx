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

interface ScopePhase {
  id: string;
  name: string;
  description?: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  progress: number;
  isExpanded: boolean;
  components: ScopeComponent[];
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
const sampleScopeData: ScopePhase[] = [
  {
    id: 'phase-1',
    name: 'Planning & Design Phase',
    description: 'Initial planning, design and preparation activities',
    status: 'In Progress',
    progress: 45,
    isExpanded: true,
    components: [
      {
        id: 'comp-1-1',
        name: 'Site Preparation',
        description: 'Initial site preparation and setup activities',
        status: 'In Progress',
        progress: 65,
        isExpanded: true,
        elements: [
          {
            id: 'elem-1-1-1',
            name: 'Site Survey',
            description: 'Conduct detailed site survey and measurements',
            status: 'Completed',
            progress: 100,
            deliverable: 'Survey Report',
            assignedTo: 'John Smith'
          },
          {
            id: 'elem-1-1-2',
            name: 'Soil Testing',
            description: 'Perform geotechnical soil analysis',
            status: 'In Progress',
            progress: 75,
            deliverable: 'Soil Test Results',
            assignedTo: 'Jane Doe'
          }
        ]
      },
      {
        id: 'comp-1-2',
        name: 'Design Development',
        description: 'Architectural and engineering design',
        status: 'Not Started',
        progress: 0,
        isExpanded: false,
        elements: [
          {
            id: 'elem-1-2-1',
            name: 'Architectural Design',
            description: 'Create detailed architectural drawings',
            status: 'Not Started',
            progress: 0,
            deliverable: 'Architectural Plans',
            assignedTo: 'Sarah Wilson'
          }
        ]
      }
    ]
  },
  {
    id: 'phase-2',
    name: 'Construction Phase',
    description: 'Main construction and implementation activities',
    status: 'Not Started',
    progress: 0,
    isExpanded: false,
    components: [
      {
        id: 'comp-2-1',
        name: 'Foundation Work',
        description: 'Foundation design and construction',
        status: 'Not Started',
        progress: 0,
        isExpanded: false,
        elements: [
          {
            id: 'elem-2-1-1',
            name: 'Foundation Design',
            description: 'Structural foundation design and calculations',
            status: 'Not Started',
            progress: 0,
            deliverable: 'Foundation Drawings',
            assignedTo: 'Tom Brown'
          },
          {
            id: 'elem-2-1-2',
            name: 'Excavation',
            description: 'Excavate foundation areas',
            status: 'Not Started',
            progress: 0,
            deliverable: 'Excavated Site',
            assignedTo: 'Mike Johnson'
          }
        ]
      },
      {
        id: 'comp-2-2',
        name: 'Structural Framework',
        description: 'Main structural elements and framework',
        status: 'Not Started',
        progress: 0,
        isExpanded: false,
        elements: [
          {
            id: 'elem-2-2-1',
            name: 'Steel Framework',
            description: 'Install primary steel structural framework',
            status: 'Not Started',
            progress: 0,
            deliverable: 'Steel Structure',
            assignedTo: 'Alex Davis'
          }
        ]
      }
    ]
  }
];

export const ProjectScopePage = ({ project, onNavigate }: ProjectScopePageProps) => {
  const [scopeData, setScopeData] = useState<ScopePhase[]>(sampleScopeData);
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

  const togglePhase = (phaseId: string) => {
    setScopeData(prev => 
      prev.map(phase => 
        phase.id === phaseId 
          ? { ...phase, isExpanded: !phase.isExpanded }
          : phase
      )
    );
  };

  const toggleComponent = (phaseId: string, componentId: string) => {
    setScopeData(prev => 
      prev.map(phase => 
        phase.id === phaseId
          ? {
              ...phase,
              components: phase.components.map(comp =>
                comp.id === componentId
                  ? { ...comp, isExpanded: !comp.isExpanded }
                  : comp
              )
            }
          : phase
      )
    );
  };

  const handleContextMenuAction = (action: string, itemId: string, type: 'phase' | 'component' | 'element') => {
    switch (action) {
      case 'add-component':
        console.log('Add Component to phase', itemId);
        // Add component functionality here
        break;
      case 'edit':
        console.log('Edit', type, itemId);
        // Add edit functionality here
        break;
      case 'duplicate':
        console.log('Duplicate', type, itemId);
        // Add duplicate functionality here
        break;
      case 'delete':
        console.log('Delete', type, itemId);
        // Add delete functionality here
        break;
    }
  };

  const generateWBSNumber = (phaseIndex: number, componentIndex?: number, elementIndex?: number) => {
    const phaseNumber = phaseIndex + 1;
    if (componentIndex !== undefined) {
      const componentNumber = componentIndex + 1;
      if (elementIndex !== undefined) {
        return `${phaseNumber}.${componentNumber}.${elementIndex + 1}`;
      }
      return `${phaseNumber}.${componentNumber}`;
    }
    return phaseNumber.toString();
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === 'phase') {
      // Handle phase reordering
      const items = Array.from(scopeData);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      setScopeData(items);
    } else if (type.startsWith('component-')) {
      // Handle component reordering within a phase
      const phaseId = type.replace('component-', '');
      setScopeData(prev => prev.map(phase => {
        if (phase.id === phaseId) {
          const components = Array.from(phase.components);
          const [reorderedItem] = components.splice(source.index, 1);
          components.splice(destination.index, 0, reorderedItem);
          return { ...phase, components };
        }
        return phase;
      }));
    } else if (type.startsWith('element-')) {
      // Handle element reordering within a component
      const [phaseId, componentId] = type.replace('element-', '').split('-');
      setScopeData(prev => prev.map(phase => {
        if (phase.id === phaseId) {
          return {
            ...phase,
            components: phase.components.map(component => {
              if (component.id === componentId) {
                const elements = Array.from(component.elements);
                const [reorderedItem] = elements.splice(source.index, 1);
                elements.splice(destination.index, 0, reorderedItem);
                return { ...component, elements };
              }
              return component;
            })
          };
        }
        return phase;
      }));
    }
  };

  const calculateOverallProgress = () => {
    let totalElements = 0;
    let totalProgress = 0;
    
    scopeData.forEach(phase => {
      phase.components.forEach(component => {
        totalElements += component.elements.length;
        component.elements.forEach(element => {
          totalProgress += element.progress;
        });
      });
    });
    
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
                  Add Phase
                </Button>
              </div>
            </div>
          </div>

          {/* Scope Table */}
          <div className="flex-1 overflow-auto px-6 py-4">
            <div className="rounded-lg border border-border overflow-hidden bg-card shadow-sm">
              <table className="w-full table-fixed">
                <thead className="bg-muted/40 border-b border-border">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-8"></th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-16">WBS</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-48">Name</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">Status</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-20">Progress</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">Assigned To</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">Deliverable</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-16">Actions</th>
                  </tr>
                </thead>
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="scope-phases" type="phase">
                    {(provided) => (
                      <tbody 
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="bg-card/50 divide-y divide-border"
                      >
                        {scopeData.map((phase, phaseIndex) => (
                          <Draggable key={phase.id} draggableId={phase.id} index={phaseIndex}>
                            {(provided, snapshot) => (
                              <React.Fragment>
                                 {/* Phase Row */}
                                 <tr 
                                   ref={provided.innerRef}
                                   {...provided.draggableProps}
                                   className={`hover:bg-accent/20 bg-primary/5 border-l-2 border-l-primary transition-all duration-200 ${
                                     snapshot.isDragging ? 'shadow-lg bg-card' : ''
                                   }`}
                                 >
                                   <td className="px-2 py-2">
                                     <div 
                                       {...provided.dragHandleProps}
                                       className="cursor-grab hover:cursor-grabbing p-0.5 hover:bg-accent rounded transition-colors duration-200"
                                     >
                                       <GripVertical className="w-3 h-3 text-muted-foreground" />
                                     </div>
                                   </td>
                                   <td className="px-2 py-2">
                                     <button
                                       onClick={() => togglePhase(phase.id)}
                                       className="p-0.5 hover:bg-accent rounded transition-colors duration-200"
                                     >
                                       {phase.isExpanded ? (
                                         <ChevronDown className="w-3 h-3 text-muted-foreground" />
                                       ) : (
                                         <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                       )}
                                     </button>
                                   </td>
                                   <td className="px-3 py-2">
                                     <div className="font-semibold text-primary text-sm truncate">{generateWBSNumber(phaseIndex)}</div>
                                   </td>
                                   <td className="px-3 py-2">
                                     <div className="font-semibold text-foreground text-sm truncate">{phase.name}</div>
                                   </td>
                                   <td className="px-3 py-2 text-muted-foreground text-xs truncate">{phase.description}</td>
                                   <td className="px-2 py-2">
                                     <Badge variant="outline" className={`${getStatusColor(phase.status)} text-xs px-2 py-0.5`}>
                                       {phase.status}
                                     </Badge>
                                   </td>
                                   <td className="px-2 py-2">
                                     <div className="flex items-center gap-1">
                                       <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                                         <div 
                                           className={`h-full transition-all duration-300 ${getProgressColor(phase.progress)}`}
                                           style={{ width: `${phase.progress}%` }}
                                         />
                                       </div>
                                       <span className="text-xs text-muted-foreground font-medium">{phase.progress}%</span>
                                     </div>
                                   </td>
                                    <td className="px-2 py-2 text-muted-foreground text-xs truncate">-</td>
                                    <td className="px-2 py-2">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-accent">
                                            <MoreHorizontal className="h-3 w-3" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                          <DropdownMenuItem onClick={() => handleContextMenuAction('add-component', phase.id, 'phase')}>
                                            <Plus className="w-3 h-3 mr-2" />
                                            Add Component
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem onClick={() => handleContextMenuAction('edit', phase.id, 'phase')}>
                                            <Edit2 className="w-3 h-3 mr-2" />
                                            Edit
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleContextMenuAction('duplicate', phase.id, 'phase')}>
                                            <Copy className="w-3 h-3 mr-2" />
                                            Duplicate
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem 
                                            onClick={() => handleContextMenuAction('delete', phase.id, 'phase')}
                                            className="text-destructive focus:text-destructive"
                                          >
                                            <Trash2 className="w-3 h-3 mr-2" />
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </td>
                                </tr>

                                {/* Component Rows */}
                                {phase.isExpanded && (
                                  <Droppable droppableId={`components-${phase.id}`} type={`component-${phase.id}`}>
                                    {(componentProvided) => (
                                      <React.Fragment>
                                        {phase.components.map((component, componentIndex) => (
                                          <Draggable key={component.id} draggableId={component.id} index={componentIndex}>
                                            {(componentDragProvided, componentSnapshot) => (
                                              <React.Fragment>
                                                 <tr 
                                                   ref={componentDragProvided.innerRef}
                                                   {...componentDragProvided.draggableProps}
                                                   className={`hover:bg-accent/10 bg-accent/5 border-l border-l-accent/30 transition-colors duration-200 ${
                                                     componentSnapshot.isDragging ? 'shadow-lg bg-card' : ''
                                                   }`}
                                                 >
                                                   <td className="px-2 py-1.5">
                                                     <div 
                                                       {...componentDragProvided.dragHandleProps}
                                                       className="cursor-grab hover:cursor-grabbing p-0.5 hover:bg-accent rounded transition-colors duration-200 ml-2"
                                                     >
                                                       <GripVertical className="w-3 h-3 text-muted-foreground" />
                                                     </div>
                                                   </td>
                                                   <td className="px-2 py-1.5">
                                                     <button
                                                       onClick={() => toggleComponent(phase.id, component.id)}
                                                       className="p-0.5 hover:bg-accent rounded transition-colors duration-200 ml-3"
                                                     >
                                                       {component.isExpanded ? (
                                                         <ChevronDown className="w-3 h-3 text-muted-foreground" />
                                                       ) : (
                                                         <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                                       )}
                                                     </button>
                                                   </td>
                                                   <td className="px-3 py-1.5">
                                                     <div className="font-medium text-primary text-sm ml-3 truncate">
                                                       {generateWBSNumber(phaseIndex, componentIndex)}
                                                     </div>
                                                   </td>
                                                   <td className="px-3 py-1.5">
                                                     <div className="pl-4 text-foreground text-sm font-medium truncate">
                                                       <div className="flex items-center gap-2">
                                                         <div className="w-1.5 h-1.5 bg-primary/60 rounded-full"></div>
                                                         {component.name}
                                                       </div>
                                                     </div>
                                                   </td>
                                                   <td className="px-3 py-1.5 text-muted-foreground text-xs truncate">{component.description}</td>
                                                   <td className="px-2 py-1.5">
                                                     <Badge variant="outline" className={`${getStatusColor(component.status)} text-xs px-1.5 py-0.5`}>
                                                       {component.status}
                                                     </Badge>
                                                   </td>
                                                   <td className="px-2 py-1.5">
                                                     <div className="flex items-center gap-1">
                                                       <div className="w-10 h-1.5 bg-muted rounded-full overflow-hidden">
                                                         <div 
                                                           className={`h-full transition-all duration-300 ${getProgressColor(component.progress)}`}
                                                           style={{ width: `${component.progress}%` }}
                                                         />
                                                       </div>
                                                       <span className="text-xs text-muted-foreground">{component.progress}%</span>
                                                     </div>
                                                   </td>
                                                   <td className="px-2 py-1.5 text-muted-foreground text-xs truncate">-</td>
                                                   <td className="px-2 py-1.5 text-muted-foreground text-xs truncate">-</td>
                                                   <td className="px-2 py-1.5">
                                                     <DropdownMenu>
                                                       <DropdownMenuTrigger asChild>
                                                         <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-accent">
                                                           <MoreHorizontal className="w-3 h-3" />
                                                         </Button>
                                                       </DropdownMenuTrigger>
                                                       <DropdownMenuContent align="end" className="w-48">
                                                         <DropdownMenuItem onClick={() => handleContextMenuAction('add-component', phase.id, 'component')}>
                                                           <Plus className="w-3 h-3 mr-2" />
                                                           Add Element
                                                         </DropdownMenuItem>
                                                         <DropdownMenuSeparator />
                                                         <DropdownMenuItem onClick={() => handleContextMenuAction('edit', component.id, 'component')}>
                                                           <Edit2 className="w-3 h-3 mr-2" />
                                                           Edit
                                                         </DropdownMenuItem>
                                                         <DropdownMenuItem onClick={() => handleContextMenuAction('duplicate', component.id, 'component')}>
                                                           <Copy className="w-3 h-3 mr-2" />
                                                           Duplicate
                                                         </DropdownMenuItem>
                                                         <DropdownMenuSeparator />
                                                         <DropdownMenuItem 
                                                           onClick={() => handleContextMenuAction('delete', component.id, 'component')}
                                                           className="text-destructive focus:text-destructive"
                                                         >
                                                           <Trash2 className="w-3 h-3 mr-2" />
                                                           Delete
                                                         </DropdownMenuItem>
                                                       </DropdownMenuContent>
                                                     </DropdownMenu>
                                                   </td>
                                                 </tr>

                                                {/* Element Rows */}
                                                {component.isExpanded && (
                                                  <Droppable droppableId={`elements-${phase.id}-${component.id}`} type={`element-${phase.id}-${component.id}`}>
                                                    {(elementProvided) => (
                                                      <React.Fragment>
                                                        {component.elements.map((element, elementIndex) => (
                                                          <Draggable key={element.id} draggableId={element.id} index={elementIndex}>
                                                            {(elementDragProvided, elementSnapshot) => (
                                                               <tr 
                                                                 ref={elementDragProvided.innerRef}
                                                                 {...elementDragProvided.draggableProps}
                                                                 className={`hover:bg-accent/5 transition-colors duration-200 ${
                                                                   elementSnapshot.isDragging ? 'shadow-lg bg-card' : ''
                                                                 }`}
                                                               >
                                                                 <td className="px-2 py-1">
                                                                   <div 
                                                                     {...elementDragProvided.dragHandleProps}
                                                                     className="cursor-grab hover:cursor-grabbing p-0.5 hover:bg-accent rounded transition-colors duration-200 ml-4"
                                                                   >
                                                                     <GripVertical className="w-3 h-3 text-muted-foreground" />
                                                                   </div>
                                                                 </td>
                                                                 <td className="px-2 py-1"></td>
                                                                 <td className="px-3 py-1">
                                                                   <div className="font-medium text-primary text-xs ml-6 truncate">
                                                                     {generateWBSNumber(phaseIndex, componentIndex, elementIndex)}
                                                                   </div>
                                                                 </td>
                                                                 <td className="px-3 py-1">
                                                                   <div className="pl-8 text-foreground text-xs truncate">
                                                                     <div className="flex items-center gap-1.5">
                                                                       <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                                                                       {element.name}
                                                                     </div>
                                                                   </div>
                                                                 </td>
                                                                 <td className="px-3 py-1 text-muted-foreground text-xs truncate">{element.description}</td>
                                                                 <td className="px-2 py-1">
                                                                   <Badge variant="outline" className={`${getStatusColor(element.status)} text-xs px-1 py-0`}>
                                                                     {element.status}
                                                                   </Badge>
                                                                 </td>
                                                                 <td className="px-2 py-1">
                                                                   <div className="flex items-center gap-1">
                                                                     <div className="w-8 h-1 bg-muted rounded-full overflow-hidden">
                                                                       <div 
                                                                         className={`h-full transition-all duration-300 ${getProgressColor(element.progress)}`}
                                                                         style={{ width: `${element.progress}%` }}
                                                                       />
                                                                     </div>
                                                                     <span className="text-xs text-muted-foreground">{element.progress}%</span>
                                                                   </div>
                                                                 </td>
                                                                 <td className="px-2 py-1 text-muted-foreground text-xs truncate">{element.assignedTo}</td>
                                                                 <td className="px-2 py-1 text-muted-foreground text-xs truncate">{element.deliverable}</td>
                                                                 <td className="px-2 py-1">
                                                                   <DropdownMenu>
                                                                     <DropdownMenuTrigger asChild>
                                                                       <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-accent">
                                                                         <MoreHorizontal className="w-2.5 h-2.5" />
                                                                       </Button>
                                                                     </DropdownMenuTrigger>
                                                                     <DropdownMenuContent align="end" className="w-40">
                                                                       <DropdownMenuItem onClick={() => handleContextMenuAction('edit', element.id, 'element')}>
                                                                         <Edit2 className="w-3 h-3 mr-2" />
                                                                         Edit
                                                                       </DropdownMenuItem>
                                                                       <DropdownMenuItem onClick={() => handleContextMenuAction('duplicate', element.id, 'element')}>
                                                                         <Copy className="w-3 h-3 mr-2" />
                                                                         Duplicate
                                                                       </DropdownMenuItem>
                                                                       <DropdownMenuSeparator />
                                                                       <DropdownMenuItem 
                                                                         onClick={() => handleContextMenuAction('delete', element.id, 'element')}
                                                                         className="text-destructive focus:text-destructive"
                                                                       >
                                                                         <Trash2 className="w-3 h-3 mr-2" />
                                                                         Delete
                                                                       </DropdownMenuItem>
                                                                     </DropdownMenuContent>
                                                                   </DropdownMenu>
                                                                 </td>
                                                               </tr>
                                                            )}
                                                          </Draggable>
                                                        ))}
                                                        <tr ref={elementProvided.innerRef} style={{ display: 'none' }}>
                                                          <td colSpan={9}>{elementProvided.placeholder}</td>
                                                        </tr>
                                                      </React.Fragment>
                                                    )}
                                                  </Droppable>
                                                )}
                                              </React.Fragment>
                                            )}
                                          </Draggable>
                                        ))}
                                        <tr ref={componentProvided.innerRef} style={{ display: 'none' }}>
                                          <td colSpan={9}>{componentProvided.placeholder}</td>
                                        </tr>
                                      </React.Fragment>
                                    )}
                                  </Droppable>
                                )}
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