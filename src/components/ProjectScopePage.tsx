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
  const [dragIndicator, setDragIndicator] = useState<{ type: string; droppableId: string; index: number } | null>(null);

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
        break;
      case 'edit':
        console.log('Edit', type, itemId);
        break;
      case 'duplicate':
        console.log('Duplicate', type, itemId);
        break;
      case 'delete':
        console.log('Delete', type, itemId);
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
    // Clear indicator on drop
    setDragIndicator(null);
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === 'phase') {
      const items = Array.from(scopeData);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      setScopeData(items);
    } else if (type.startsWith('component-')) {
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

  // Update drop indicator as user drags
  const onDragUpdate = (update: any) => {
    const { destination, type } = update;
    if (!destination) {
      setDragIndicator(null);
      return;
    }
    setDragIndicator({ type, droppableId: destination.droppableId, index: destination.index });
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

  const mainClasses = {
    mobile: "flex flex-col h-screen",
    tablet: "flex flex-col h-screen", 
    desktop: "flex h-screen"
  };

  const contentClasses = {
    mobile: "flex-1",
    tablet: "flex-1",
    desktop: "flex-1 ml-48"
  };

  return (
    <div className={mainClasses[screenSize]}>
      <ProjectSidebar 
        project={project}
        onNavigate={onNavigate}
        getStatusColor={getStatusColor}
        getStatusText={(status) => status}
        activeSection="specification"
      />

      <div className={contentClasses[screenSize]}>
        <div className="flex flex-col h-full bg-background">
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

          <div className="flex-1 px-6 py-4">
            <div className="rounded-lg border border-border bg-card shadow-sm">
              {/* Header */}
              <div
                className="bg-muted/40 border-b border-border grid text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                style={{ gridTemplateColumns: '32px 64px 280px 1fr 140px 120px 160px 160px 84px' }}
              >
                <div className="px-2 py-2" />
                <div className="px-2 py-2">WBS</div>
                <div className="px-3 py-2">Name</div>
                <div className="px-3 py-2">Description</div>
                <div className="px-2 py-2">Status</div>
                <div className="px-2 py-2">Progress</div>
                <div className="px-2 py-2">Assigned To</div>
                <div className="px-2 py-2">Deliverable</div>
                <div className="px-2 py-2">Actions</div>
              </div>

              {/* Body - Grid-based DnD to avoid table offsets */}
              <DragDropContext onDragEnd={onDragEnd} onDragUpdate={onDragUpdate}>
                <Droppable droppableId="scope-phases" type="phase">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`divide-y divide-border transition-colors duration-200 ${
                        snapshot.isDraggingOver ? 'bg-primary/5' : ''
                      }`}
                    >
                      {scopeData.map((phase, phaseIndex) => (
                        <React.Fragment key={phase.id}>
                          {dragIndicator && dragIndicator.type === 'phase' && dragIndicator.index === phaseIndex && (
                            <div className="px-2"><div className="h-0.5 bg-primary/60 rounded-full" /></div>
                          )}

                          <Draggable draggableId={phase.id} index={phaseIndex}>
                            {(providedDraggable, snapshotDraggable) => (
                              <div
                                ref={providedDraggable.innerRef}
                                {...providedDraggable.draggableProps}
                                className={`grid items-center relative bg-primary/5 border-l-2 border-l-primary hover:bg-accent/20 ${
                                  snapshotDraggable.isDragging ? 'shadow-xl bg-card border-primary z-50' : ''
                                }`}
                                style={{
                                  gridTemplateColumns: '32px 64px 280px 1fr 140px 120px 160px 160px 84px',
                                  ...providedDraggable.draggableProps.style,
                                }}
                              >
                                <div className="px-2 py-2">
                                  <div
                                    {...providedDraggable.dragHandleProps}
                                    className={`cursor-grab active:cursor-grabbing p-1 rounded transition-colors duration-200 ${
                                      snapshotDraggable.isDragging ? 'bg-primary/20 shadow-sm' : 'hover:bg-primary/10'
                                    }`}
                                    title="Drag to reorder phase"
                                  >
                                    <GripVertical className="w-3 h-3 text-muted-foreground" />
                                  </div>
                                </div>
                                <div className="px-2 py-2">
                                  <div className="flex items-center">
                                    <button
                                      onClick={() => togglePhase(phase.id)}
                                      className="p-0.5 hover:bg-accent rounded transition-colors duration-200 mr-1"
                                      aria-label="Toggle phase"
                                    >
                                      {phase.isExpanded ? (
                                        <ChevronDown className="w-3 h-3 text-muted-foreground" />
                                      ) : (
                                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                      )}
                                    </button>
                                    <div className="font-semibold text-primary text-sm truncate">{generateWBSNumber(phaseIndex)}</div>
                                  </div>
                                </div>
                                <div className="px-3 py-2 font-semibold text-foreground text-sm truncate">{phase.name}</div>
                                <div className="px-3 py-2 text-muted-foreground text-xs truncate">{phase.description}</div>
                                <div className="px-2 py-2"><Badge variant="outline" className={`${getStatusColor(phase.status)} text-xs px-2 py-0.5`}>{phase.status}</Badge></div>
                                <div className="px-2 py-2">
                                  <div className="flex items-center gap-1">
                                    <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                                      <div className={`h-full transition-all duration-300 ${getProgressColor(phase.progress)}`} style={{ width: `${phase.progress}%` }} />
                                    </div>
                                    <span className="text-xs text-muted-foreground font-medium">{phase.progress}%</span>
                                  </div>
                                </div>
                                <div className="px-2 py-2 text-muted-foreground text-xs truncate">-</div>
                                <div className="px-2 py-2 text-muted-foreground text-xs truncate">-</div>
                                <div className="px-2 py-2">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-accent">
                                        <MoreHorizontal className="w-3 h-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
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
                                      <DropdownMenuItem onClick={() => handleContextMenuAction('delete', phase.id, 'phase')} className="text-destructive focus:text-destructive">
                                        <Trash2 className="w-3 h-3 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            )}
                          </Draggable>

                          {phase.isExpanded && (
                            <Droppable droppableId={`components-${phase.id}`} type={`component-${phase.id}`}>
                              {(componentProvided, componentSnapshot) => (
                                <div
                                  ref={componentProvided.innerRef}
                                  {...componentProvided.droppableProps}
                                  className={`${componentSnapshot.isDraggingOver ? 'bg-secondary/5' : ''}`}
                                >
                                  {phase.components.map((component, componentIndex) => (
                                    <React.Fragment key={component.id}>
                                      {dragIndicator && dragIndicator.type === `component-${phase.id}` && dragIndicator.droppableId === `components-${phase.id}` && dragIndicator.index === componentIndex && (
                                        <div className="px-2 ml-8"><div className="h-0.5 bg-secondary/60 rounded-full" /></div>
                                      )}

                                      <Draggable draggableId={component.id} index={componentIndex}>
                                        {(componentDragProvided, componentSnapshot2) => (
                                          <div
                                            ref={componentDragProvided.innerRef}
                                            {...componentDragProvided.draggableProps}
                                            className={`grid items-center bg-secondary/5 border-l-2 border-l-secondary hover:bg-accent/10 ${
                                              componentSnapshot2.isDragging ? 'shadow-xl bg-card border-secondary z-40' : ''
                                            }`}
                                            style={{
                                              gridTemplateColumns: '32px 64px 280px 1fr 140px 120px 160px 160px 84px',
                                              ...componentDragProvided.draggableProps.style,
                                            }}
                                          >
                                            <div className="px-2 py-1.5">
                                              <div
                                                {...componentDragProvided.dragHandleProps}
                                                className={`cursor-grab active:cursor-grabbing p-1 rounded transition-colors duration-200 ml-2 ${
                                                  componentSnapshot2.isDragging ? 'bg-secondary/20 shadow-sm' : 'hover:bg-secondary/10'
                                                }`}
                                                title="Drag to reorder component"
                                              >
                                                <GripVertical className="w-3 h-3 text-muted-foreground" />
                                              </div>
                                            </div>
                                            <div className="px-2 py-1.5">
                                              <div className="flex items-center ml-3">
                                                <button onClick={() => toggleComponent(phase.id, component.id)} className="p-0.5 hover:bg-accent rounded transition-colors duration-200 mr-1" aria-label="Toggle component">
                                                  {component.isExpanded ? (
                                                    <ChevronDown className="w-2.5 h-2.5 text-muted-foreground" />
                                                  ) : (
                                                    <ChevronRight className="w-2.5 h-2.5 text-muted-foreground" />
                                                  )}
                                                </button>
                                                <div className="font-medium text-secondary text-xs truncate">{generateWBSNumber(phaseIndex, componentIndex)}</div>
                                              </div>
                                            </div>
                                            <div className="px-3 py-1.5 font-medium text-foreground text-xs ml-4 truncate">{component.name}</div>
                                            <div className="px-3 py-1.5 text-muted-foreground text-xs truncate">{component.description}</div>
                                            <div className="px-2 py-1.5"><Badge variant="outline" className={`${getStatusColor(component.status)} text-xs px-1 py-0`}>{component.status}</Badge></div>
                                            <div className="px-2 py-1.5">
                                              <div className="flex items-center gap-1">
                                                <div className="w-10 h-1 bg-muted rounded-full overflow-hidden">
                                                  <div className={`h-full transition-all duration-300 ${getProgressColor(component.progress)}`} style={{ width: `${component.progress}%` }} />
                                                </div>
                                                <span className="text-xs text-muted-foreground">{component.progress}%</span>
                                              </div>
                                            </div>
                                            <div className="px-2 py-1.5 text-muted-foreground text-xs truncate">-</div>
                                            <div className="px-2 py-1.5 text-muted-foreground text-xs truncate">-</div>
                                            <div className="px-2 py-1.5">
                                              <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-accent">
                                                    <MoreHorizontal className="w-2.5 h-2.5" />
                                                  </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40">
                                                  <DropdownMenuItem onClick={() => handleContextMenuAction('edit', component.id, 'component')}>
                                                    <Edit2 className="w-3 h-3 mr-2" />
                                                    Edit
                                                  </DropdownMenuItem>
                                                  <DropdownMenuItem onClick={() => handleContextMenuAction('duplicate', component.id, 'component')}>
                                                    <Copy className="w-3 h-3 mr-2" />
                                                    Duplicate
                                                  </DropdownMenuItem>
                                                  <DropdownMenuSeparator />
                                                  <DropdownMenuItem onClick={() => handleContextMenuAction('delete', component.id, 'component')} className="text-destructive focus:text-destructive">
                                                    <Trash2 className="w-3 h-3 mr-2" />
                                                    Delete
                                                  </DropdownMenuItem>
                                                </DropdownMenuContent>
                                              </DropdownMenu>
                                            </div>
                                          </div>
                                        )}
                                      </Draggable>

                                      {component.isExpanded && (
                                        <Droppable droppableId={`elements-${phase.id}-${component.id}`} type={`element-${phase.id}-${component.id}`}>
                                          {(elementProvided, elementSnapshot) => (
                                            <div ref={elementProvided.innerRef} {...elementProvided.droppableProps} className={`${elementSnapshot.isDraggingOver ? 'bg-accent/5' : ''}`}>
                                              {component.elements.map((element, elementIndex) => (
                                                <React.Fragment key={element.id}>
                                                  {dragIndicator && dragIndicator.type === `element-${phase.id}-${component.id}` && dragIndicator.droppableId === `elements-${phase.id}-${component.id}` && dragIndicator.index === elementIndex && (
                                                    <div className="px-2 ml-14"><div className="h-0.5 bg-accent/60 rounded-full" /></div>
                                                  )}
                                                  <Draggable draggableId={element.id} index={elementIndex}>
                                                    {(elementDragProvided, elementSnapshot2) => (
                                                      <div
                                                        ref={elementDragProvided.innerRef}
                                                        {...elementDragProvided.draggableProps}
                                                        className={`grid items-center hover:bg-accent/5 ${
                                                          elementSnapshot2.isDragging ? 'shadow-lg bg-card z-30' : ''
                                                        }`}
                                                        style={{
                                                          gridTemplateColumns: '32px 64px 280px 1fr 140px 120px 160px 160px 84px',
                                                          ...elementDragProvided.draggableProps.style,
                                                        }}
                                                      >
                                                        <div className="px-2 py-1">
                                                          <div
                                                            {...elementDragProvided.dragHandleProps}
                                                            className={`cursor-grab active:cursor-grabbing p-1 rounded transition-colors duration-200 ml-4 ${
                                                              elementSnapshot2.isDragging ? 'bg-accent/30 shadow-sm' : 'hover:bg-accent/20'
                                                            }`}
                                                            title="Drag to reorder element"
                                                          >
                                                            <GripVertical className="w-3 h-3 text-muted-foreground" />
                                                          </div>
                                                        </div>
                                                        <div className="px-2 py-1 font-medium text-primary text-xs ml-6 truncate">{generateWBSNumber(phaseIndex, componentIndex, elementIndex)}</div>
                                                        <div className="px-3 py-1 font-medium text-foreground text-xs ml-6 truncate">{element.name}</div>
                                                        <div className="px-3 py-1 text-muted-foreground text-xs truncate">{element.description}</div>
                                                        <div className="px-2 py-1"><Badge variant="outline" className={`${getStatusColor(element.status)} text-xs px-1 py-0`}>{element.status}</Badge></div>
                                                        <div className="px-2 py-1">
                                                          <div className="flex items-center gap-1">
                                                            <div className="w-8 h-1 bg-muted rounded-full overflow-hidden">
                                                              <div className={`h-full transition-all duration-300 ${getProgressColor(element.progress)}`} style={{ width: `${element.progress}%` }} />
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">{element.progress}%</span>
                                                          </div>
                                                        </div>
                                                        <div className="px-2 py-1 text-muted-foreground text-xs truncate">{element.assignedTo}</div>
                                                        <div className="px-2 py-1 text-muted-foreground text-xs truncate">{element.deliverable}</div>
                                                        <div className="px-2 py-1">
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
                                                              <DropdownMenuItem onClick={() => handleContextMenuAction('delete', element.id, 'element')} className="text-destructive focus:text-destructive">
                                                                <Trash2 className="w-3 h-3 mr-2" />
                                                                Delete
                                                              </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                          </DropdownMenu>
                                                        </div>
                                                      </div>
                                                    )}
                                                  </Draggable>
                                                </React.Fragment>
                                              ))}
                                              {dragIndicator && dragIndicator.type === `element-${phase.id}-${component.id}` && dragIndicator.droppableId === `elements-${phase.id}-${component.id}` && dragIndicator.index === component.elements.length && (
                                                <div className="px-2 ml-14"><div className="h-0.5 bg-accent/60 rounded-full" /></div>
                                              )}
                                              {elementProvided.placeholder}
                                            </div>
                                          )}
                                        </Droppable>
                                      )}
                                    </React.Fragment>
                                  ))}
                                  {dragIndicator && dragIndicator.type === `component-${phase.id}` && dragIndicator.droppableId === `components-${phase.id}` && dragIndicator.index === phase.components.length && (
                                    <div className="px-2 ml-8"><div className="h-0.5 bg-secondary/60 rounded-full" /></div>
                                  )}
                                  {componentProvided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          )}
                        </React.Fragment>
                      ))}
                      {dragIndicator && dragIndicator.type === 'phase' && dragIndicator.index === scopeData.length && (
                        <div className="px-2"><div className="h-0.5 bg-primary/60 rounded-full" /></div>
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};