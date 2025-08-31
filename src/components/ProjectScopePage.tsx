import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown, Plus, Edit2, Trash2, GripVertical, Copy, MoreHorizontal } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { createPortal } from 'react-dom';
import { useCompany } from '@/contexts/CompanyContext';
import { WBSService } from '@/services/wbsService';
import { useWBS } from '@/hooks/useWBS';

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

// Portal wrapper to avoid transform/fixed offset issues during drag
const DragPortalWrapper = ({ isDragging, children }: { isDragging: boolean; children: React.ReactNode }) => {
  if (!isDragging) return <>{children}</>;
  if (typeof document === 'undefined') return <>{children}</>;
  return createPortal(children as any, document.body);
};

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
  const screenSize = useScreenSize();
  const { currentCompany } = useCompany();
  const [dragIndicator, setDragIndicator] = useState<{ type: string; droppableId: string; index: number } | null>(null);
  const [editingItem, setEditingItem] = useState<{ id: string; type: 'phase' | 'component' | 'element'; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Use WBS hook for database operations
  const { 
    wbsItems, 
    loading, 
    error, 
    createWBSItem, 
    updateWBSItem, 
    deleteWBSItem,
    generateWBSId,
  } = useWBS(project.id);

  // Convert WBS items to scope data structure (roots are X.0 which we treat as level 0)
  const scopeData: ScopePhase[] = wbsItems
    .filter(item => item.wbs_id?.endsWith('.0') || item.level === 0 || item.parent_id == null)
    .map(phase => ({
      id: phase.id,
      name: phase.title,
      description: phase.description || '',
      status: (phase.status as 'Not Started' | 'In Progress' | 'Completed' | 'On Hold') || 'Not Started',
      progress: phase.progress || 0,
      isExpanded: phase.is_expanded,
      components: phase.children
        ?.filter(child => child.level === 1 || (child.wbs_id && !child.wbs_id.endsWith('.0') && child.wbs_id.split('.').length === 2))
        .map(component => ({
          id: component.id,
          name: component.title,
          description: component.description || '',
          status: (component.status as 'Not Started' | 'In Progress' | 'Completed' | 'On Hold') || 'Not Started',
          progress: component.progress || 0,
          isExpanded: component.is_expanded,
          elements: component.children
            ?.filter(child => child.level === 2 || (child.wbs_id && child.wbs_id.split('.').length === 3))
            .map(element => ({
              id: element.id,
              name: element.title,
              description: element.description || '',
              status: (element.status as 'Not Started' | 'In Progress' | 'Completed' | 'On Hold') || 'Not Started',
              progress: element.progress || 0
            })) || []
        })) || []
    }));

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

  const togglePhase = async (phaseId: string) => {
    const phase = wbsItems.find(item => item.id === phaseId);
    if (phase) {
      await updateWBSItem(phaseId, { is_expanded: !phase.is_expanded });
    }
  };

  const toggleComponent = async (phaseId: string, componentId: string) => {
    const component = wbsItems.find(item => item.id === componentId);
    if (component) {
      await updateWBSItem(componentId, { is_expanded: !component.is_expanded });
    }
  };

  const handleContextMenuAction = (action: string, itemId: string, type: 'phase' | 'component' | 'element') => {
    switch (action) {
      case 'add-component':
        addNewComponent(itemId);
        break;
      case 'add-element':
        addNewElement(itemId);
        break;
      case 'edit':
        const item = wbsItems.find(i => i.id === itemId);
        if (item) {
          setEditingItem({ id: itemId, type, field: 'title' });
          setEditValue(item.title);
        }
        break;
      case 'duplicate':
        console.log('Duplicate', type, itemId);
        break;
      case 'delete':
        deleteWBSItem(itemId);
        break;
    }
  };

  const addNewElement = async (componentId: string) => {
    try {
      if (!currentCompany?.id) {
        console.error('No active company selected');
        return;
      }

      const wbsId = generateWBSId(componentId);

      await createWBSItem({
        company_id: currentCompany.id,
        project_id: project.id,
        parent_id: componentId,
        wbs_id: wbsId,
        title: 'Untitled Element',
        description: '',
        level: 3,
        category: 'Element',
        is_expanded: true,
        progress: 0,
        status: 'Not Started',
        health: 'Good',
        progress_status: 'On Track',
        at_risk: false,
        priority: 'Medium',
        linked_tasks: []
      });
    } catch (error) {
      console.error('Error adding element:', error);
    }
  };

  // Remove drag and drop and editing functions that use setScopeData
  const handleEdit = (id: string, type: 'phase' | 'component' | 'element', field: string, currentValue: string) => {
    setEditingItem({ id, type, field });
    setEditValue(currentValue);
  };

  const addNewComponent = async (phaseId: string) => {
    try {
      console.log('🔧 Starting addNewComponent for phase:', phaseId);
      
      if (!currentCompany?.id) {
        console.error('No active company selected');
        return;
      }

      const wbsId = generateWBSId(phaseId);
      console.log('🆔 Creating component with WBS ID:', wbsId);

      await createWBSItem({
        company_id: currentCompany.id,
        project_id: project.id,
        parent_id: phaseId,
        wbs_id: wbsId,
        title: 'Untitled Component',
        description: '',
        assigned_to: undefined,
        start_date: undefined,
        end_date: undefined,
        duration: 0,
        budgeted_cost: undefined,
        actual_cost: undefined,
        progress: 0,
        status: 'Not Started',
        health: 'Good',
        progress_status: 'On Track',
        at_risk: false,
        level: 2,
        category: 'Component',
        priority: 'Medium',
        is_expanded: true,
        linked_tasks: []
      });

      console.log('🎉 Component added successfully');

    } catch (error) {
      console.error('❌ Error adding component:', error);
    }
  };

  const addNewPhase = async () => {
    try {
      if (!currentCompany?.id) {
        console.error('No active company selected');
        return;
      }

      const wbsId = generateWBSId();

      const inserted = await createWBSItem({
        company_id: currentCompany.id,
        project_id: project.id,
        parent_id: undefined,
        wbs_id: wbsId,
        title: 'Untitled Phase',
        description: '',
        assigned_to: undefined,
        start_date: undefined,
        end_date: undefined,
        duration: 0,
        budgeted_cost: undefined,
        actual_cost: undefined,
        progress: 0,
        status: 'Not Started',
        health: 'Good',
        progress_status: 'On Track',
        at_risk: false,
        level: 1,
        category: 'Stage',
        priority: 'Medium',
        is_expanded: true,
        linked_tasks: []
      });

      // Set editing mode for the new phase
      if (inserted) {
        setEditingItem({ id: inserted.id, type: 'phase', field: 'title' });
        setEditValue('');
      }
    } catch (error) {
      console.error('Error creating phase:', error);
    }
  };

  const saveEdit = async () => {
    if (!editingItem) return;

    const { id, field } = editingItem;
    
    try {
      // Update the database directly
      await updateWBSItem(id, { [field]: editValue });
      
      setEditingItem(null);
      setEditValue('');
    } catch (error) {
      console.error('Error saving edit:', error);
    }
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditValue('');
  };

  const saveScopeToDatabase = async () => {
    if (!currentCompany?.id) {
      console.error('No active company selected');
      return;
    }

    try {
      console.log('Saving scope to database:', scopeData);
      
      // Flatten the scope data into WBS items
      const wbsItems = [];
      
      for (let phaseIndex = 0; phaseIndex < scopeData.length; phaseIndex++) {
        const phase = scopeData[phaseIndex];
        const phaseWbsId = `${phaseIndex + 1}.0`;
        
        // Add the phase
        wbsItems.push({
          company_id: currentCompany.id,
          project_id: project.id,
          parent_id: null,
          wbs_id: phaseWbsId,
          title: phase.name || 'Untitled Phase',
          description: phase.description || '',
          status: phase.status,
          progress: phase.progress,
          level: 1,
          category: 'Stage',
          is_expanded: phase.isExpanded,
          linked_tasks: []
        });
        
        // Add components for this phase
        for (let compIndex = 0; compIndex < phase.components.length; compIndex++) {
          const component = phase.components[compIndex];
          const componentWbsId = `${phaseIndex + 1}.${compIndex + 1}`;
          
          wbsItems.push({
            company_id: currentCompany.id,
            project_id: project.id,
            parent_id: null, // Will be set to phase ID after creation
            wbs_id: componentWbsId,
            title: component.name || 'Untitled Component',
            description: component.description || '',
            status: component.status,
            progress: component.progress,
            level: 2,
            category: 'Component',
            is_expanded: component.isExpanded,
            linked_tasks: []
          });
          
          // Add elements for this component
          for (let elemIndex = 0; elemIndex < component.elements.length; elemIndex++) {
            const element = component.elements[elemIndex];
            const elementWbsId = `${phaseIndex + 1}.${compIndex + 1}.${elemIndex + 1}`;
            
            wbsItems.push({
              company_id: currentCompany.id,
              project_id: project.id,
              parent_id: null, // Will be set to component ID after creation
              wbs_id: elementWbsId,
              title: element.name || 'Untitled Element',
              description: element.description || '',
              status: element.status,
              progress: element.progress,
              assigned_to: element.assignedTo,
              level: 3,
              category: 'Element',
              is_expanded: true,
              linked_tasks: []
            });
          }
        }
      }
      
      // Save all items to database
      for (const item of wbsItems) {
        await WBSService.createWBSItem(item);
      }
      
      console.log(`Successfully saved ${wbsItems.length} scope items to database`);
    } catch (error) {
      console.error('Failed to save scope to database:', error);
    }
  };

  const updateScopeToDatabase = async () => {
    // For now, just save the scope data
    await saveScopeToDatabase();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };


  useEffect(() => {
    if (editingItem && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingItem]);

  // Close on outside click while editing
  useEffect(() => {
    if (!editingItem) return;
    const onMouseDown = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        saveEdit();
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [editingItem, editValue]);

  // Reusable editable cell component
  const EditableCell = ({ 
    id, 
    type, 
    field, 
    value, 
    placeholder, 
    className = "" 
  }: { 
    id: string; 
    type: 'phase' | 'component' | 'element'; 
    field: string; 
    value: string; 
    placeholder: string;
    className?: string;
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value || "");
    const localInputRef = useRef<HTMLInputElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // keep local value in sync if the underlying value changes externally
    useEffect(() => {
      setLocalValue(value || "");
    }, [value, id]);

    useEffect(() => {
      if (isEditing && localInputRef.current) {
        localInputRef.current.focus();
        localInputRef.current.select();
      }
    }, [isEditing]);

    // Close on outside click while editing
    useEffect(() => {
      if (!isEditing) return;
      const onMouseDown = (e: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
          commitEdit();
        }
      };
      document.addEventListener('mousedown', onMouseDown);
      return () => document.removeEventListener('mousedown', onMouseDown);
    }, [isEditing, localValue]);

    const updateScopeField = async (newVal: string) => {
      try {
        // Map UI field names to database field names
        const dbField = field === 'name' ? 'title' : field;
        await updateWBSItem(id, { [dbField]: newVal });
        console.log('✅ Updated', dbField, 'to:', newVal, 'for item:', id);
      } catch (e) {
        console.error('❌ Failed to update field', field, 'for', id, e);
      }
    };

    const commitEdit = async () => {
      if (localValue !== (value || "")) {
        await updateScopeField(localValue);
      }
      setIsEditing(false);
    };

    const cancelLocalEdit = () => {
      setLocalValue(value || "");
      setIsEditing(false);
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitEdit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelLocalEdit();
      }
    };

    return (
      <div 
        ref={wrapperRef}
        className={`w-full h-full flex items-center ${!isEditing ? 'cursor-pointer hover:bg-accent/20 rounded px-1' : ''}`}
        onClick={() => !isEditing && setIsEditing(true)}
      >
        {isEditing ? (
          <Input
            ref={localInputRef}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onKeyDown={onKeyDown}
            onMouseDown={(e) => e.stopPropagation()}
            className="border-none outline-none focus:outline-none focus:border-none ring-0 focus:ring-0 focus-visible:ring-0 ring-offset-0 focus:ring-offset-0 focus-visible:ring-offset-0 shadow-none bg-transparent p-0 m-0 rounded-none h-auto w-full"
            placeholder={placeholder}
            autoFocus
          />
        ) : (
          <span className={`truncate ${className}`}>
            {value || placeholder}
          </span>
        )}
      </div>
    );
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
    setDragIndicator(null);
    if (!result.destination) return;
    const { source, destination, type } = result;
    console.log('Reorder request', { source, destination, type });
    // TODO: Persist ordering to DB (out of scope for this fix). No local state mutation here.
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
    mobile: "flex flex-col h-full",
    tablet: "flex flex-col h-full", 
    desktop: "flex h-full"
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
        <div className="flex flex-col h-full bg-background overflow-auto">
          <div className="flex-shrink-0 border-b border-border px-6 py-4 bg-white backdrop-blur-sm">
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
                <div className="flex items-center gap-2">
                  <Button onClick={saveScopeToDatabase} variant="outline" size="sm" className="font-inter text-xs">
                    Save to Database
                  </Button>
                  <Button size="sm" className="font-inter text-xs" onClick={addNewPhase}>
                    <Plus className="w-3 h-3 mr-1" />
                    Add Phase
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 px-6 py-4 bg-white">
            <div className="rounded-lg border border-border bg-white shadow-sm">
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
                              <DragPortalWrapper isDragging={snapshotDraggable.isDragging}>
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
                                <div className="px-3 py-2 font-semibold text-foreground text-sm truncate">
                                  <EditableCell
                                    id={phase.id}
                                    type="phase"
                                    field="name"
                                    value={phase.name}
                                    placeholder="Untitled Phase"
                                    className="font-semibold text-sm"
                                  />
                                </div>
                                <div className="px-3 py-2 text-muted-foreground text-xs truncate">
                                  <EditableCell
                                    id={phase.id}
                                    type="phase"
                                    field="description"
                                    value={phase.description || ''}
                                    placeholder="Add description..."
                                    className="text-xs text-muted-foreground"
                                  />
                                </div>
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
                                <div className="px-2 py-2 flex items-center justify-center">
                                  <div className="flex items-center gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-6 w-6 p-0 hover:bg-primary/10 text-primary hover:text-primary"
                                      onClick={() => handleContextMenuAction('add-component', phase.id, 'phase')}
                                      title="Add Component"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
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
                              </div>
                              </DragPortalWrapper>
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
                                          <DragPortalWrapper isDragging={componentSnapshot2.isDragging}>
                                           <div
                                             ref={componentDragProvided.innerRef}
                                             {...componentDragProvided.draggableProps}
                                             className={`grid items-center bg-blue-50/80 border-l-4 border-l-blue-400 border-b border-b-blue-200/50 hover:bg-blue-100/80 ${
                                               componentSnapshot2.isDragging ? 'shadow-xl bg-card border-blue-400 z-40' : ''
                                             }`}
                                            style={{
                                              gridTemplateColumns: '32px 64px 280px 1fr 140px 120px 160px 160px 84px',
                                              ...componentDragProvided.draggableProps.style,
                                            }}
                                          >
                                            <div className="px-2 py-2">
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
                                             <div className="px-2 py-2">
                                               <div className="flex items-center ml-3">
                                                 <button 
                                                   onClick={() => toggleComponent(phase.id, component.id)} 
                                                   className="p-1 hover:bg-blue-100 rounded transition-colors duration-200 mr-2 border border-transparent hover:border-blue-200" 
                                                   aria-label="Toggle component"
                                                   title={component.isExpanded ? "Collapse component" : "Expand component"}
                                                 >
                                                   {component.isExpanded ? (
                                                     <ChevronDown className="w-3 h-3 text-blue-600" />
                                                   ) : (
                                                     <ChevronRight className="w-3 h-3 text-blue-600" />
                                                   )}
                                                 </button>
                                                 <div className="font-medium text-blue-600 text-xs truncate">{generateWBSNumber(phaseIndex, componentIndex)}</div>
                                               </div>
                                            </div>
                                            <div className="px-3 py-2 font-medium text-foreground text-xs ml-4 truncate">
                                              <EditableCell
                                                id={component.id}
                                                type="component"
                                                field="name"
                                                value={component.name}
                                                placeholder="Untitled Component"
                                                className="font-medium text-xs"
                                              />
                                            </div>
                                            <div className="px-3 py-2 text-muted-foreground text-xs truncate">
                                              <EditableCell
                                                id={component.id}
                                                type="component"
                                                field="description"
                                                value={component.description || ''}
                                                placeholder="Add description..."
                                                className="text-xs text-muted-foreground"
                                              />
                                            </div>
                                            <div className="px-2 py-2"><Badge variant="outline" className={`${getStatusColor(component.status)} text-xs px-1 py-0`}>{component.status}</Badge></div>
                                             <div className="px-2 py-2">
                                              <div className="flex items-center gap-1">
                                                <div className="w-10 h-1 bg-muted rounded-full overflow-hidden">
                                                  <div className={`h-full transition-all duration-300 ${getProgressColor(component.progress)}`} style={{ width: `${component.progress}%` }} />
                                                </div>
                                                <span className="text-xs text-muted-foreground">{component.progress}%</span>
                                              </div>
                                            </div>
                                             <div className="px-2 py-2 text-muted-foreground text-xs truncate">-</div>
                                            <div className="px-2 py-2 text-muted-foreground text-xs truncate">-</div>
                                            <div className="px-2 py-2 flex items-center justify-center">
                                              <div className="flex items-center gap-1">
                                                <Button 
                                                  variant="ghost" 
                                                  size="sm" 
                                                  className="h-6 w-6 p-0 hover:bg-blue-100 text-blue-600 hover:text-blue-700"
                                                  onClick={() => handleContextMenuAction('add-element', component.id, 'component')}
                                                  title="Add Element"
                                                >
                                                  <Plus className="w-3 h-3" />
                                                </Button>
                                                <DropdownMenu>
                                                  <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-accent">
                                                      <MoreHorizontal className="w-3 h-3" />
                                                    </Button>
                                                  </DropdownMenuTrigger>
                                                  <DropdownMenuContent align="end" className="w-40">
                                                    <DropdownMenuItem onClick={() => handleContextMenuAction('add-element', component.id, 'component')}>
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
                                                    <DropdownMenuItem onClick={() => handleContextMenuAction('delete', component.id, 'component')} className="text-destructive focus:text-destructive">
                                                      <Trash2 className="w-3 h-3 mr-2" />
                                                      Delete
                                                    </DropdownMenuItem>
                                                  </DropdownMenuContent>
                                                </DropdownMenu>
                                              </div>
                                            </div>
                                          </div>
                                          </DragPortalWrapper>
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
                                                      <DragPortalWrapper isDragging={elementSnapshot2.isDragging}>
                                                       <div
                                                         ref={elementDragProvided.innerRef}
                                                         {...elementDragProvided.draggableProps}
                                                         className={`grid items-center bg-slate-50/60 border-l-2 border-l-slate-300 hover:bg-slate-100/70 ${
                                                           elementSnapshot2.isDragging ? 'shadow-lg bg-card border-slate-400 z-30' : ''
                                                         }`}
                                                        style={{
                                                          gridTemplateColumns: '32px 64px 280px 1fr 140px 120px 160px 160px 84px',
                                                          ...elementDragProvided.draggableProps.style,
                                                        }}
                                                      >
                                                         <div className="px-2 py-2">
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
                                                        <div className="px-2 py-2 font-medium text-slate-600 text-xs ml-6 truncate">{generateWBSNumber(phaseIndex, componentIndex, elementIndex)}</div>
                                                        <div className="px-3 py-2 font-medium text-foreground text-xs ml-6 min-h-[2rem] flex items-center">
                                                          <EditableCell
                                                            id={element.id}
                                                            type="element"
                                                            field="name"
                                                            value={element.name}
                                                            placeholder="Untitled Element"
                                                            className="font-medium text-xs"
                                                          />
                                                        </div>
                                                        <div className="px-3 py-2 text-muted-foreground text-xs truncate">
                                                          <EditableCell
                                                            id={element.id}
                                                            type="element"
                                                            field="description"
                                                            value={element.description || ''}
                                                            placeholder="Add description..."
                                                            className="text-xs text-muted-foreground"
                                                          />
                                                        </div>
                                                        <div className="px-2 py-2"><Badge variant="outline" className={`${getStatusColor(element.status)} text-xs px-1 py-0`}>{element.status}</Badge></div>
                                                         <div className="px-2 py-2">
                                                          <div className="flex items-center gap-1">
                                                            <div className="w-8 h-1 bg-muted rounded-full overflow-hidden">
                                                              <div className={`h-full transition-all duration-300 ${getProgressColor(element.progress)}`} style={{ width: `${element.progress}%` }} />
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">{element.progress}%</span>
                                                          </div>
                                                        </div>
                                                         <div className="px-2 py-2 text-muted-foreground text-xs truncate">
                                                          <EditableCell
                                                            id={element.id}
                                                            type="element"
                                                            field="assignedTo"
                                                            value={element.assignedTo || ''}
                                                            placeholder="Assign to..."
                                                            className="text-xs text-muted-foreground"
                                                          />
                                                        </div>
                                                        <div className="px-2 py-2 text-muted-foreground text-xs truncate">
                                                          <EditableCell
                                                            id={element.id}
                                                            type="element"
                                                            field="deliverable"
                                                            value={element.deliverable || ''}
                                                            placeholder="Add deliverable..."
                                                            className="text-xs text-muted-foreground"
                                                          />
                                                        </div>
                                                        <div className="px-2 py-2 flex items-center justify-center">
                                                          <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-accent">
                                                                <MoreHorizontal className="w-3 h-3" />
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
                                                      </DragPortalWrapper>
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