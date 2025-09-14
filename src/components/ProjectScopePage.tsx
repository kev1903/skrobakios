import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown, Plus, Edit2, Trash2, GripVertical, Copy, MoreHorizontal, ChevronsDown, ChevronsUp, NotebookPen, Clock, DollarSign, Settings } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WBSSplitView } from '@/components/wbs/WBSSplitView';
import { WBSTimeView } from '@/components/wbs/WBSTimeView';
import { WBSCostView } from '@/components/wbs/WBSCostView';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { ProjectChat } from '@/components/ProjectChat';
import { Project } from '@/hooks/useProjects';
import { useScreenSize } from '@/hooks/use-mobile';
import { createPortal } from 'react-dom';
import { useCompany } from '@/contexts/CompanyContext';
import { renumberAllWBSItems } from '@/utils/wbsUtils';
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
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('scope');
  const [dragIndicator, setDragIndicator] = useState<{ type: string; droppableId: string; index: number } | null>(null);
  const [editingItem, setEditingItem] = useState<{ id: string; type: 'phase' | 'component' | 'element'; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [currentNotesItem, setCurrentNotesItem] = useState<any>(null);
  const [notesValue, setNotesValue] = useState('');
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
    findWBSItem,
  } = useWBS(project.id);

  console.log('ProjectScopePage rendering', { project, wbsItems: wbsItems?.length, loading, error, activeTab });

  // Convert WBS items to scope data structure (roots are X.0 which we treat as level 0)
  const scopeData: ScopePhase[] = wbsItems
    .filter(item => item.wbs_id?.endsWith('.0') || item.level === 0 || item.parent_id == null)
    .sort((a, b) => {
      // Sort by WBS number to ensure proper ordering after drag and drop
      const aWbs = a.wbs_id?.split('.').map(n => parseInt(n)) || [0];
      const bWbs = b.wbs_id?.split('.').map(n => parseInt(n)) || [0];
      return aWbs[0] - bWbs[0];
    })
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

  // Calculate component progress from child elements
  const calculateComponentProgress = (component: ScopeComponent) => {
    if (component.elements.length === 0) return 0;
    const totalProgress = component.elements.reduce((sum, element) => sum + element.progress, 0);
    return Math.round(totalProgress / component.elements.length);
  };

  // Calculate phase progress from child components  
  const calculatePhaseProgress = (phase: ScopePhase) => {
    if (phase.components.length === 0) return 0;
    const totalProgress = phase.components.reduce((sum, component) => sum + calculateComponentProgress(component), 0);
    return Math.round(totalProgress / phase.components.length);
  };

  // Convert scope data to flat array for split view
  const flatWBSItems = React.useMemo(() => {
    const items: any[] = [];
    
    scopeData.forEach((phase, phaseIndex) => {
      items.push({
        id: phase.id,
        name: phase.name,
        description: phase.description,
        status: phase.status,
        progress: calculatePhaseProgress(phase),
        assignedTo: '',
        level: 0,
        wbsNumber: (phaseIndex + 1).toString(),
        isExpanded: phase.isExpanded,
        hasChildren: phase.components.length > 0,
        start_date: null, // Add from WBS item if available
        end_date: null, // Add from WBS item if available
        duration: 0, // Add from WBS item if available
        predecessors: [] // Add from WBS item if available
      });

      if (phase.isExpanded) {
        phase.components.forEach((component, componentIndex) => {
          items.push({
            id: component.id,
            name: component.name,
            description: component.description,
            status: component.status,
            progress: calculateComponentProgress(component),
            assignedTo: '',
            level: 1,
            wbsNumber: generateWBSNumber(phaseIndex, componentIndex),
            isExpanded: component.isExpanded,
            hasChildren: component.elements.length > 0,
            start_date: null, // Add from WBS item if available
            end_date: null, // Add from WBS item if available
            duration: 0, // Add from WBS item if available
            predecessors: [] // Add from WBS item if available
          });

          if (component.isExpanded) {
            component.elements.forEach((element, elementIndex) => {
              items.push({
                id: element.id,
                name: element.name,
                description: element.description,
                status: element.status,
                progress: element.progress,
                assignedTo: element.assignedTo || '',
                level: 2,
                wbsNumber: generateWBSNumber(phaseIndex, componentIndex, elementIndex),
                isExpanded: false,
                hasChildren: false,
                start_date: null, // Add from WBS item if available
                end_date: null, // Add from WBS item if available
                duration: 0, // Add from WBS item if available
                predecessors: [] // Add from WBS item if available
              });
            });
          }
        });
      }
    });

    // Merge with actual WBS items to get date and duration data
    return items.map(item => {
      const wbsItem = findWBSItem(item.id);
      if (wbsItem) {
        return {
          ...item,
          // Ensure hierarchy fields are present for rollups
          parent_id: wbsItem.parent_id,
          wbs_id: wbsItem.wbs_id,
          wbsNumber: wbsItem.wbs_id || item.wbsNumber,
          level: wbsItem.level ?? item.level,
          name: wbsItem.title || item.name, // Use WBS title if available
          title: wbsItem.title || item.name, // Also set title field
          start_date: wbsItem.start_date || null,
          end_date: wbsItem.end_date || null,
          duration: wbsItem.duration || 0,
          linked_tasks: Array.isArray(wbsItem.linked_tasks) ? wbsItem.linked_tasks : [],
          predecessors: Array.isArray((wbsItem as any).predecessors) ? (wbsItem as any).predecessors : []
        } as any;
      }
      return item;
    });
  }, [scopeData, wbsItems]);

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

  const toggleComponent = async (_phaseId: string, componentId: string, currentExpanded: boolean) => {
    await updateWBSItem(componentId, { is_expanded: !currentExpanded });
  };

  const expandAll = async () => {
    // Expand all phases
    for (const phase of scopeData) {
      if (!phase.isExpanded) {
        await updateWBSItem(phase.id, { is_expanded: true });
      }
      // Expand all components within each phase
      for (const component of phase.components) {
        if (!component.isExpanded) {
          await updateWBSItem(component.id, { is_expanded: true });
        }
      }
    }
  };

  const collapseAll = async () => {
    // Collapse all phases and components
    for (const phase of scopeData) {
      if (phase.isExpanded) {
        await updateWBSItem(phase.id, { is_expanded: false });
      }
      // Collapse all components within each phase
      for (const component of phase.components) {
        if (component.isExpanded) {
          await updateWBSItem(component.id, { is_expanded: false });
        }
      }
    }
  };

  const clearAllDates = async () => {
    try {
      // Clear dates from all WBS items
      for (const item of wbsItems) {
        await updateWBSItem(item.id, { 
          start_date: null, 
          end_date: null, 
          duration: null 
        });
      }
      
      toast({
        title: "Dates cleared",
        description: "All dates have been cleared from the project schedule.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear dates. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openNotesDialog = (item: any) => {
    setCurrentNotesItem(item);
    setNotesValue(item.description || '');
    setNotesDialogOpen(true);
  };

  const closeNotesDialog = () => {
    setNotesDialogOpen(false);
    setCurrentNotesItem(null);
    setNotesValue('');
  };

  const saveNotes = async () => {
    if (!currentNotesItem) return;
    
    try {
      await updateWBSItem(currentNotesItem.id, { description: notesValue });
      toast({
        title: "Notes saved",
        description: "The notes have been updated successfully.",
      });
      closeNotesDialog();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const statusOptions = [
    { value: 'Not Started', label: 'Not Started', short: 'NS', color: 'bg-slate-400' },
    { value: 'In Progress', label: 'In Progress', short: 'IP', color: 'bg-blue-500' },
    { value: 'Completed', label: 'Completed', short: 'Done', color: 'bg-green-500' },
    { value: 'On Hold', label: 'On Hold', short: 'Hold', color: 'bg-amber-500' }
  ] as const;

  const ProgressInput = ({ 
    value, 
    onChange, 
    className = "" 
  }: { 
    value: number; 
    onChange: (value: number) => void;
    className?: string;
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value.toString());

    const handleSave = () => {
      const numValue = Math.max(0, Math.min(100, parseInt(inputValue) || 0));
      onChange(numValue);
      setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
        setInputValue(value.toString());
        setIsEditing(false);
      }
    };

    if (isEditing) {
      return (
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className={`w-8 h-4 text-xs p-0 text-center border-0 bg-transparent focus:bg-white focus:border focus:ring-1 ${className}`}
          autoFocus
          type="number"
          min="0"
          max="100"
        />
      );
    }

    return (
      <span 
        className={`text-xs text-muted-foreground font-medium cursor-pointer hover:bg-accent/20 rounded px-1 ${className}`}
        onClick={() => {
          setInputValue(value.toString());
          setIsEditing(true);
        }}
        title="Click to edit progress"
      >
        {value}%
      </span>
    );
  };

  // Read-only progress display for calculated values
  const ProgressDisplay = ({ 
    value, 
    className = "" 
  }: { 
    value: number; 
    className?: string;
  }) => {
    return (
      <span 
        className={`text-xs text-muted-foreground font-medium ${className}`}
        title="Calculated from child items"
      >
        {value}%
      </span>
    );
  };

  const StatusSelect = ({
    value, 
    onChange, 
    className = "" 
  }: { 
    value: string; 
    onChange: (value: string) => void;
    className?: string;
  }) => {
    const currentStatus = statusOptions.find(s => s.value === value);
    
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`h-7 w-16 text-xs border-0 bg-transparent hover:bg-accent/30 focus:ring-0 focus:ring-offset-0 p-1 ${className}`}>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${currentStatus?.color || 'bg-slate-400'}`} />
            <span className="text-xs font-medium text-muted-foreground">
              {currentStatus?.short || 'NS'}
            </span>
          </div>
        </SelectTrigger>
        <SelectContent className="min-w-36 bg-background border shadow-lg z-50 p-1">
          {statusOptions.map((status) => (
            <SelectItem key={status.value} value={status.value} className="text-xs py-2 px-2 cursor-pointer">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${status.color}`} />
                <span className="font-medium">{status.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
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

  // Comprehensive WBS renumbering function
  const renumberWBSHierarchy = async () => {
    try {
      const updates = renumberAllWBSItems(wbsItems);
      
      // Apply all the WBS ID updates
      for (const { item, newWbsId } of updates) {
        await updateWBSItem(item.id, { wbs_id: newWbsId }, { skipAutoSchedule: true });
      }
      
      console.log(`✅ Renumbered ${updates.length} WBS items to ensure sequential hierarchy`);
    } catch (error) {
      console.error('❌ Error renumbering WBS hierarchy:', error);
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
        level: 2,
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

      // Trigger renumbering to ensure all WBS IDs are sequential
      await renumberWBSHierarchy();
    } catch (error) {
      console.error('Error adding element:', error);
    }
  };

  // Remove drag and drop and editing functions that use setScopeData
  const handleEdit = (id: string, type: 'phase' | 'component' | 'element', field: string, currentValue: string) => {
    setEditingItem({ id, type, field });
    setEditValue(currentValue);
  };

  // Generic function to add child items
  const addChildItem = async (parentId: string) => {
    const parentItem = findWBSItem(parentId);
    if (!parentItem) return;
    
    // Determine child type based on parent level
    if (parentItem.level === 0) {
      // Parent is phase, add component
      await addNewComponent(parentId);
    } else if (parentItem.level === 1) {
      // Parent is component, add element
      await addNewElement(parentId);
    }
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
        level: 1,
        category: 'Component',
        priority: 'Medium',
        is_expanded: true,
        linked_tasks: []
      });

      console.log('🎉 Component added successfully');

      // Trigger renumbering to ensure all WBS IDs are sequential
      await renumberWBSHierarchy();

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
        level: 0,
        category: 'Stage',
        priority: 'Medium',
        is_expanded: true,
        linked_tasks: []
      });

      // Trigger renumbering to ensure all WBS IDs are sequential
      await renumberWBSHierarchy();

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
      const itemsToSave: any[] = [];
      
      for (let phaseIndex = 0; phaseIndex < scopeData.length; phaseIndex++) {
        const phase = scopeData[phaseIndex];
        const phaseWbsId = `${phaseIndex + 1}.0`;
        
        // Add the phase
        itemsToSave.push({
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
          
          itemsToSave.push({
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
            
            itemsToSave.push({
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
      for (const item of itemsToSave) {
        await WBSService.createWBSItem(item);
      }
      
      console.log(`Successfully saved ${itemsToSave.length} scope items to database`);
    } catch (error) {
      console.error('Failed to save scope to database:', error);
    }
  };

  const updateScopeToDatabase = async () => {
    // For now, just save the scope data
    await saveScopeToDatabase();
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey && editingItem?.type === 'element') {
      e.preventDefault();
      await saveEdit();
      
      // Find the parent component of this element
      const currentElement = wbsItems.find(item => item.id === editingItem.id);
      if (currentElement?.parent_id) {
        await addNewElement(currentElement.parent_id);
      }
    } else if (e.key === 'Enter') {
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

    const onKeyDown = async (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && e.shiftKey && type === 'element') {
        e.preventDefault();
        await commitEdit();
        const currentElement = wbsItems.find(item => item.id === id);
        if (currentElement?.parent_id) {
          await addNewElement(currentElement.parent_id);
        }
      } else if (e.key === 'Enter') {
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
        data-field={field}
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

  function generateWBSNumber(phaseIndex: number, componentIndex?: number, elementIndex?: number) {
    const phaseNumber = phaseIndex + 1;
    if (componentIndex !== undefined) {
      const componentNumber = componentIndex + 1;
      if (elementIndex !== undefined) {
        return `${phaseNumber}.${componentNumber}.${elementIndex + 1}`;
      }
      return `${phaseNumber}.${componentNumber}`;
    }
    return phaseNumber.toString();
  }

  // Helper function to update WBS IDs recursively for all children
  const updateChildrenWBSIds = async (parentId: string, newParentWbsId: string) => {
    const children = wbsItems.filter(item => item.parent_id === parentId);
    
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const newChildWbsId = `${newParentWbsId}.${i + 1}`;
      
      // Update the child's WBS ID
      await updateWBSItem(child.id, { 
        wbs_id: newChildWbsId 
      }, { skipAutoSchedule: true });
      
      // Recursively update grandchildren
      await updateChildrenWBSIds(child.id, newChildWbsId);
    }
  };

  // Enhanced drag and drop system with comprehensive renumbering
  const onDragEnd = async (result: DropResult) => {
    setDragIndicator(null);
    if (!result.destination) return;
    
    const { source, destination, type } = result;
    console.log('Reorder request', { source, destination, type });
    
    if (source.index === destination.index) return;
    
    try {
      // Get the current items in display order (only phases for now)
      const flatItems = wbsItems
        .filter(item => item.level === 0 || item.parent_id == null)
        .sort((a, b) => {
          const aWbs = a.wbs_id?.split('.').map(n => parseInt(n)) || [0];
          const bWbs = b.wbs_id?.split('.').map(n => parseInt(n)) || [0];
          return aWbs[0] - bWbs[0];
        });
      
      // Remove the dragged item and insert at new position
      const [reorderedItem] = flatItems.splice(source.index, 1);
      flatItems.splice(destination.index, 0, reorderedItem);
      
      // Use comprehensive renumbering to fix all WBS IDs
      await renumberWBSHierarchy();
      
      console.log('Drag and drop reordering completed with comprehensive renumbering');
    } catch (error) {
      console.error('Error reordering items:', error);
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
    let totalPhases = scopeData.length;
    if (totalPhases === 0) return 0;
    
    const totalProgress = scopeData.reduce((sum, phase) => sum + calculatePhaseProgress(phase), 0);
    return Math.round(totalProgress / totalPhases);
  };

  const mainClasses = {
    mobile: "h-screen overflow-hidden",
    tablet: "h-screen overflow-hidden", 
    desktop: "h-screen overflow-hidden"
  };

  const contentClasses = {
    mobile: "fixed inset-x-0 top-12 bottom-0 overflow-hidden",
    tablet: "fixed inset-x-0 top-12 bottom-0 overflow-hidden",
    desktop: "fixed left-40 right-0 top-12 bottom-0 overflow-hidden"
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
        <div className="h-full w-full flex bg-background">
          {/* Main WBS Content - Left Column */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Tabs Container - moved up to wrap everything */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full w-full flex flex-col">
              <div className="flex-shrink-0 border-b border-border bg-white backdrop-blur-sm">
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-6">
                    <div>
                      <h1 className="text-2xl font-bold text-foreground font-inter">Project Control</h1>
                      <p className="text-muted-foreground mt-1 text-sm font-inter">{project.name}</p>
                    </div>
                    
                    {/* Tabs in Header */}
                    <TabsList className="grid w-fit grid-cols-3">
                      <TabsTrigger value="scope" className="flex items-center gap-2">
                        <NotebookPen className="w-4 h-4" />
                        Scope
                      </TabsTrigger>
                      <TabsTrigger value="time" className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Time
                      </TabsTrigger>
                      <TabsTrigger value="cost" className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Cost
                      </TabsTrigger>
                    </TabsList>
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
                    <div className="flex items-center justify-between gap-4 flex-1">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={collapseAll} title="Collapse All">
                          <ChevronsUp className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={expandAll} title="Expand All">
                          <ChevronsDown className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {}} title="Baseline">
                          <span className="text-xs font-medium">Baseline</span>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {}} title="Critical Path">
                          <span className="text-xs font-medium">Critical Path</span>
                        </Button>
                        {activeTab === 'scope' && (
                          <Button size="sm" onClick={() => addNewPhase()}>
                            <Plus className="w-3 h-3 mr-1" />
                            Add Phase
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center">
                        <Button variant="outline" size="sm" onClick={() => {}} title="Settings">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 w-full overflow-hidden">

              <TabsContent value="scope" className="h-full w-full m-0 p-0 data-[state=active]:flex">
                <div className="h-full w-full flex flex-col">
                  {/* Combined Header with Table Headers */}
                  <div className="bg-background border-b border-border">
                    
                    {/* Table Headers Row */}
                    <div className="bg-slate-100/70 border-t border-slate-200 flex">
                      {/* Left Panel Header */}
                       <div className="w-[420px] px-2 py-1 text-xs font-medium text-slate-700 border-r border-border">
                        <div className="grid items-center" style={{
                          gridTemplateColumns: '32px 120px 1fr',
                        }}>
                          <div></div>
                          <div className="px-2 font-semibold">WBS</div>
                          <div className="px-3 font-semibold">NAME</div>
                        </div>
                      </div>
                      
                      {/* Right Panel Header */}
                       <div className="flex-1 px-2 py-1 text-xs font-medium text-slate-700">
                          <div className="grid items-center w-full" style={{
                            gridTemplateColumns: '1fr 140px 120px 160px 40px 84px',
                          }}>
                           <div className="px-3 font-semibold">DESCRIPTION</div>
                           <div className="px-2 font-semibold">STATUS</div>
                           <div className="px-2 font-semibold">PROGRESS</div>
                           <div className="px-2 font-semibold">ASSIGNED TO</div>
                           <div className="px-1 font-semibold text-center">NOTE</div>
                           <div className="px-2 font-semibold">ACTIONS</div>
                         </div>
                      </div>
                    </div>
                  </div>

                  {loading && wbsItems.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
                        <div className="text-sm text-muted-foreground">Loading WBS...</div>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <div className="text-sm text-destructive mb-2">Error loading WBS</div>
                        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                          Retry
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0 overflow-y-auto">
                      <WBSSplitView
                        items={flatWBSItems}
                        onToggleExpanded={(itemId) => {
                          const item = wbsItems.find(i => i.id === itemId);
                          if (item) {
                            updateWBSItem(itemId, { is_expanded: !item.is_expanded });
                          }
                        }}
                        onDragEnd={onDragEnd}
                        onItemUpdate={updateWBSItem}
                        onAddChild={addChildItem}
                        onContextMenuAction={handleContextMenuAction}
                        onOpenNotesDialog={openNotesDialog}
                        dragIndicator={dragIndicator}
                        EditableCell={EditableCell}
                        StatusSelect={StatusSelect}
                        ProgressInput={ProgressInput}
                        ProgressDisplay={ProgressDisplay}
                        getProgressColor={getProgressColor}
                        generateWBSNumber={generateWBSNumber}
                      />
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="time" className="h-full w-full m-0 p-0 data-[state=active]:flex">
                <div className="h-full w-full flex flex-col min-h-0">
                  {loading && wbsItems.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
                        <div className="text-sm text-muted-foreground">Loading WBS...</div>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <div className="text-sm text-destructive mb-2">Error loading WBS</div>
                        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                          Retry
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0 overflow-y-auto">
                      <WBSTimeView
                        items={flatWBSItems}
                        onToggleExpanded={(itemId) => {
                          const item = wbsItems.find(i => i.id === itemId);
                          if (item) {
                            updateWBSItem(itemId, { is_expanded: !item.is_expanded });
                          }
                        }}
                        onDragEnd={onDragEnd}
                        onItemUpdate={updateWBSItem}
                        onAddChild={addChildItem}
                        onContextMenuAction={handleContextMenuAction}
                        onOpenNotesDialog={openNotesDialog}
                        onClearAllDates={clearAllDates}
                        dragIndicator={dragIndicator}
                        EditableCell={EditableCell}
                        StatusSelect={StatusSelect}
                        generateWBSNumber={generateWBSNumber}
                      />
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="cost" className="h-full w-full m-0 p-0 data-[state=active]:flex">
                <div className="h-full w-full flex flex-col min-h-0">
                   {/* Combined Header with Table Headers */}
                   <div className="bg-background border-b border-border">
                     
                     {/* Table Headers Row */}
                     <div className="bg-slate-100/70 border-t border-slate-200 flex">
                       {/* Left Panel Header */}
                       <div className="w-[420px] px-2 py-1 text-xs font-medium text-slate-700 border-r border-border">
                         <div className="grid items-center" style={{
                           gridTemplateColumns: '32px 120px 1fr',
                         }}>
                           <div></div>
                           <div className="px-2 font-semibold">WBS</div>
                           <div className="px-3 font-semibold">NAME</div>
                         </div>
                       </div>
                       
                       {/* Right Panel Header */}
                       <div className="flex-1 px-2 py-1 text-xs font-medium text-slate-700">
                         <div className="grid items-center" style={{
                           gridTemplateColumns: '1fr 120px 120px 120px 100px 140px 84px',
                         }}>
                           <div className="px-3 font-semibold">DESCRIPTION</div>
                           <div className="px-2 font-semibold text-right">BUDGET</div>
                           <div className="px-2 font-semibold text-right">ACTUAL</div>
                           <div className="px-2 font-semibold text-right">VARIANCE</div>
                           <div className="px-2 font-semibold">COST CODE</div>
                           <div className="px-2 font-semibold">STATUS</div>
                           <div className="px-2 font-semibold">ACTIONS</div>
                         </div>
                       </div>
                     </div>
                   </div>

                   {loading && wbsItems.length === 0 ? (
                     <div className="flex items-center justify-center h-64">
                       <div className="text-center">
                         <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
                         <div className="text-sm text-muted-foreground">Loading WBS...</div>
                       </div>
                     </div>
                   ) : error ? (
                     <div className="flex items-center justify-center h-64">
                       <div className="text-center">
                         <div className="text-sm text-destructive mb-2">Error loading WBS</div>
                         <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                           Retry
                         </Button>
                       </div>
                     </div>
                   ) : (
                     <div className="flex-1 min-w-0 overflow-y-auto">
                      <WBSCostView
                        items={flatWBSItems}
                        onToggleExpanded={(itemId) => {
                          const item = wbsItems.find(i => i.id === itemId);
                          if (item) {
                            updateWBSItem(itemId, { is_expanded: !item.is_expanded });
                          }
                        }}
                        onDragEnd={onDragEnd}
                        onItemUpdate={updateWBSItem}
                        onAddChild={addChildItem}
                        onContextMenuAction={handleContextMenuAction}
                        onOpenNotesDialog={openNotesDialog}
                        dragIndicator={dragIndicator}
                        EditableCell={EditableCell}
                        StatusSelect={StatusSelect}
                        generateWBSNumber={generateWBSNumber}
                      />
                     </div>
                   )}
                 </div>
               </TabsContent>
              </div>
            </Tabs>
          </div>
          
          {/* Chat Section - Right Column */}
          <div className="w-80 flex-shrink-0">
            <ProjectChat projectId={project.id} projectName={project.name} />
          </div>
        </div>

        {/* Notes Dialog */}
        <Dialog open={notesDialogOpen} onOpenChange={(open) => !open && closeNotesDialog()}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Notes</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Item: {currentNotesItem?.title}</label>
              </div>
              <Textarea
                placeholder="Enter your notes here..."
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                className="min-h-[120px]"
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={closeNotesDialog}>
                  Cancel
                </Button>
                <Button onClick={saveNotes}>
                  Save Notes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
   );
 };