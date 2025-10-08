import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronDown, Plus, Edit2, Trash2, GripVertical, Copy, MoreHorizontal, ChevronsDown, ChevronsUp, NotebookPen, Clock, DollarSign, Settings } from 'lucide-react';
import { WBSTaskConversionService } from '@/services/wbsTaskConversionService';
import { TaskDetailPanel } from '@/components/tasks/TaskDetailPanel';
import { createTaskConversionHandlers } from '@/components/ProjectScopePage_TaskHandlers';
import { toast } from 'sonner';
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
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
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
import { Project } from '@/hooks/useProjects';
import { useScreenSize } from '@/hooks/use-mobile';
import { createPortal } from 'react-dom';
import { useCompany } from '@/contexts/CompanyContext';
import { renumberAllWBSItems, buildHierarchy } from '@/utils/wbsUtils';
import { WBSService } from '@/services/wbsService';
import { useWBS, WBSItem } from '@/hooks/useWBS';
import { TeamTaskAssignment } from '@/components/tasks/enhanced/TeamTaskAssignment';

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
  isExpanded?: boolean;
  tasks?: ScopeTask[];
}

interface ScopeTask {
  id: string;
  name: string;
  description?: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  progress: number;
  assignedTo?: string;
}

// Portal wrapper to avoid transform/fixed offset issues during drag
const DragPortalWrapper = ({ isDragging, children }: { isDragging: boolean; children: React.ReactNode }) => {
  if (!isDragging) return <>{children}</>;
  if (typeof document === 'undefined') return <>{children}</>;
  return createPortal(children as any, document.body);
};

export const ProjectScopePage = ({ project, onNavigate }: ProjectScopePageProps) => {
  const screenSize = useScreenSize();
  const { currentCompany } = useCompany();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('scope');
  const [dragIndicator, setDragIndicator] = useState<{ type: string; droppableId: string; index: number } | null>(null);
  const [editingItem, setEditingItem] = useState<{ id: string; type: 'phase' | 'component' | 'element' | 'task'; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [currentNotesItem, setCurrentNotesItem] = useState<any>(null);
  const [notesValue, setNotesValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);

  // Use WBS hook for database operations
  const { 
    wbsItems, 
    setWBSItems,
    loading, 
    error, 
    createWBSItem, 
    updateWBSItem, 
    deleteWBSItem,
    generateWBSId,
    findWBSItem,
    clearError,
    loadWBSItems,
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
              progress: element.progress || 0,
              isExpanded: element.is_expanded,
              tasks: element.children
                ?.filter(child => child.level === 3 || child.category === 'Task')
                .map(task => ({
                  id: task.id,
                  name: task.title,
                  description: task.description || '',
                  status: (task.status as 'Not Started' | 'In Progress' | 'Completed' | 'On Hold') || 'Not Started',
                  progress: task.progress || 0,
                  assignedTo: task.assigned_to || ''
                })) || []
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

  // Convert WBS items to flat array for split view while preserving hierarchy
  const flatWBSItems = React.useMemo(() => {
    console.log('🟢 flatWBSItems recalculating, wbsItems:', wbsItems.length);
    
    // Helper function to recursively flatten WBS hierarchy with correct depth tracking
    const flattenWBSItems = (items: any[], depth: number = 0, result: any[] = []): any[] => {
      items.forEach((item) => {
        console.log('  🟢 Flattening:', item.title, 'Level:', depth, 'Has children:', item.children?.length || 0);
        
        // Add the current item to result with depth-based level
        result.push({
          id: item.id,
          name: item.title || item.name || '',
          description: item.description,
          status: item.status || 'Not Started',
          progress: item.progress || 0,
          assignedTo: item.assigned_to || '',
          level: depth, // Use actual tree depth, not database level
          wbsNumber: '',
          isExpanded: item.is_expanded !== false, // Normalized at service level
          hasChildren: item.children && item.children.length > 0,
          parent_id: item.parent_id,
          wbs_id: item.wbs_id,
          title: item.title,
          start_date: item.start_date,
          end_date: item.end_date,
          duration: item.duration || 0,
          linked_tasks: Array.isArray(item.linked_tasks) ? item.linked_tasks : [],
          predecessors: Array.isArray(item.predecessors) ? item.predecessors : [],
          is_task_enabled: item.is_task_enabled || false,
          linked_task_id: item.linked_task_id,
          rfq_required: item.rfq_required || false
        });
        
        // If item has children, recursively flatten them at next depth level
        if (item.children && item.children.length > 0) {
          console.log('  🟢 Processing', item.children.length, 'children of:', item.title);
          flattenWBSItems(item.children, depth + 1, result);
        }
      });
      return result;
    };

    // Helper function to create empty rows
    const createEmptyRows = (count: number): any[] => {
      return Array.from({ length: count }, (_, index) => ({
        id: `empty-${index + 1}`,
        name: '',
        description: '',
        status: 'Not Started',
        progress: 0,
        assignedTo: '',
        level: 0,
        wbsNumber: '',
        isExpanded: false,
        hasChildren: false,
        parent_id: null,
        wbs_id: `${index + 1}`,
        title: '',
        start_date: null,
        end_date: null,
        duration: 0,
        linked_tasks: [],
        predecessors: []
      }));
    };

    // Use the actual WBS items from the database
    if (wbsItems && wbsItems.length > 0) {
      return flattenWBSItems(wbsItems);
    }

    // Show only 10 empty rows by default to improve performance - more can be added via "Add Row" button
    return createEmptyRows(10);

    // Fallback to scope data if no WBS items (for backward compatibility)
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
          wbsNumber: '',
        isExpanded: phase.isExpanded,
        hasChildren: phase.components.length > 0,
        parent_id: undefined,
        start_date: null,
        end_date: null,
        duration: 0,
        predecessors: []
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
            wbsNumber: '',
            isExpanded: component.isExpanded,
            hasChildren: component.elements.length > 0,
            parent_id: phase.id,
            start_date: null,
            end_date: null,
            duration: 0,
            predecessors: []
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
                wbsNumber: '',
                isExpanded: element.isExpanded || false,
                hasChildren: (element.tasks && element.tasks.length > 0) || false,
                parent_id: component.id,
                start_date: null,
                end_date: null,
                duration: 0,
                predecessors: []
              });

              if (element.isExpanded && element.tasks) {
                element.tasks.forEach((task, taskIndex) => {
                  items.push({
                    id: task.id,
                    name: task.name,
                    description: task.description,
                    status: task.status,
                    progress: task.progress,
                    assignedTo: task.assignedTo || '',
                    level: 3,
                    wbsNumber: `${generateWBSNumber(phaseIndex, componentIndex, elementIndex)}.${taskIndex + 1}`,
                    isExpanded: false,
                    hasChildren: false,
                    parent_id: element.id,
                    start_date: null,
                    end_date: null,
                    duration: 0,
                    predecessors: []
                  });
                });
              }
            });
          }
        });
      }
    });

    return items;
  }, [scopeData, wbsItems]);

  // Filter items to only show visible ones (not hidden by collapsed parents)
  const visibleWBSItems = React.useMemo(() => {
    // Helper function to determine if an item should be visible (not hidden by collapsed parent)
    const isItemVisible = (item: any, allItems: any[]): boolean => {
      if (item.level === 0) return true;
      const parent = allItems.find(i => i.id === item.parent_id);
      if (!parent) return true;
      if (parent.isExpanded === false) return false;
      return isItemVisible(parent, allItems);
    };

    return flatWBSItems.filter(item => isItemVisible(item, flatWBSItems));
  }, [flatWBSItems]);

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

  const toggleElement = async (elementId: string, currentExpanded: boolean) => {
    console.log('🔄 Toggling element:', elementId, 'from:', currentExpanded, 'to:', !currentExpanded);
    await updateWBSItem(elementId, { is_expanded: !currentExpanded });
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
    className = "",
    disabled = false
  }: { 
    value: number; 
    onChange: (value: number) => void;
    className?: string;
    disabled?: boolean;
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value.toString());

    if (disabled) {
      return (
        <span 
          className={`text-xs text-muted-foreground font-medium ${className}`}
          title="Calculated from child items"
        >
          {value}%
        </span>
      );
    }

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
          className={`w-8 h-4 text-xs p-0 text-center border-0 bg-transparent focus:bg-white focus:border focus:ring-1 ${className} [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]`}
          autoFocus
          type="number"
          min="0"
          max="100"
          step="1"
          pattern="[0-9]*"
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
    className = "",
    disabled = false
  }: { 
    value: string; 
    onChange: (value: string) => void;
    className?: string;
    disabled?: boolean;
  }) => {
    const currentStatus = statusOptions.find(s => s.value === value);
    
    
    if (disabled) {
      return (
        <div className={`h-7 w-16 text-xs border-0 bg-transparent p-1 ${className}`}>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${currentStatus?.color || 'bg-slate-400'}`} />
            <span className="text-xs font-medium text-muted-foreground" title="Calculated from child items">
              {currentStatus?.short || 'NS'}
            </span>
          </div>
        </div>
      );
    }

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

  // Create task conversion handlers
  const taskHandlers = createTaskConversionHandlers(
    project,
    findWBSItem,
    setSelectedTask,
    setIsTaskDetailOpen,
    () => {
      // Reload WBS items
      if (project?.id && currentCompany?.id) {
        WBSService.loadWBSItems(project.id, currentCompany.id).then((items) => {
          // Update local state with refreshed data
          window.location.reload(); // Simple reload for now
        }).catch(console.error);
      }
    }
  );

  const handleContextMenuAction = async (action: string, itemId: string, type: string) => {
    // Type is now passed directly from the component
    console.log('🔵 ProjectScopePage handleContextMenuAction received:', action, itemId, type);
    
    // Find the item for operations that need it
    const item = wbsItems.find(i => i.id === itemId);
    if (!item && action !== 'delete') {
      console.error('Item not found:', itemId);
      return;
    }
    
    switch (action) {
      case 'cut':
        // TODO: Implement cut functionality
        console.log('Cut item:', itemId);
        toast({
          title: "Cut",
          description: "Item cut to clipboard (feature coming soon)",
        });
        break;
      case 'copy':
        // TODO: Implement copy functionality
        console.log('Copy item:', itemId);
        toast({
          title: "Copied",
          description: "Item copied to clipboard (feature coming soon)",
        });
        break;
      case 'paste':
        // TODO: Implement paste functionality
        console.log('Paste at item:', itemId);
        toast({
          title: "Paste",
          description: "Paste functionality coming soon",
        });
        break;
      case 'insert-above':
        // Insert a new item at the same level above this item
        await createWBSItem({
          company_id: currentCompany.id,
          project_id: project.id,
          parent_id: item.parent_id || null,
          title: 'New Item',
          level: item.level,
          wbs_id: item.wbs_id,
          is_expanded: true,
          linked_tasks: [],
        });
        break;
      case 'insert-below':
        // Insert a new row directly below the selected row at root level (level 0)
        const rootItems = flatWBSItems.filter(i => i.level === 0);
        const selectedRootWbsNum = parseInt(item.wbs_id.split('.')[0]);
        const newWbsId = (selectedRootWbsNum + 1).toString();
        
        // Find all root items that come after the selected item and shift them first
        const itemsToShift = rootItems.filter(i => {
          const itemWbsNum = parseInt(i.wbs_id.split('.')[0]);
          return itemWbsNum > selectedRootWbsNum;
        });
        
        // Shift all subsequent items by incrementing their WBS IDs (do this BEFORE creating the new item)
        for (const itemToShift of itemsToShift) {
          const currentNum = parseInt(itemToShift.wbs_id.split('.')[0]);
          const shiftedWbsId = (currentNum + 1).toString();
          await updateWBSItem(itemToShift.id, { wbs_id: shiftedWbsId }, { skipAutoSchedule: true });
        }
        
        // Now create the new item with the correct WBS ID
        const insertedItem = await createWBSItem({
          company_id: currentCompany.id,
          project_id: project.id,
          parent_id: null,
          title: 'New Item',
          level: 0,
          wbs_id: newWbsId,
          is_expanded: true,
          linked_tasks: [],
        });
        
        if (insertedItem) {
          // Single reload at the end to show everything in the correct order
          await loadWBSItems();
        }
        break;
      case 'insert-child':
        await addChildItem(itemId);
        break;
      case 'add-comment':
        openNotesDialog(item);
        break;
      case 'indent':
        // Progressive indent: increase level by 1 and find appropriate parent
        const currentIndex = wbsItems.findIndex(i => i.id === itemId);
        if (currentIndex >= 0 && item.level < 4) {
          const newLevel = item.level + 1;
          
          // Find the appropriate parent - look backwards for an item at (newLevel - 1)
          let newParentId: string | null = null;
          for (let i = currentIndex - 1; i >= 0; i--) {
            const potentialParent = wbsItems[i];
            if (potentialParent.level === newLevel - 1) {
              newParentId = potentialParent.id;
              break;
            }
          }
          
          console.log(`🔄 Progressive indent: ${item.title} from level ${item.level} to ${newLevel}, parent: ${newParentId}`);
          
          await updateWBSItem(itemId, {
            parent_id: newParentId,
            level: newLevel
          });
          
          // Renumber after hierarchy change
          setTimeout(() => renumberWBSHierarchy(), 100);
        }
        break;
      case 'outdent':
        if (item.level > 0) {
          const currentParent = wbsItems.find(i => i.id === item.parent_id);
          await updateWBSItem(itemId, {
            parent_id: currentParent?.parent_id || null,
            level: Math.max(0, item.level - 1)
          });
        }
        break;
      case 'view-details':
        openNotesDialog(item);
        break;
      case 'assign-to':
        // TODO: Open assignment dialog
        toast({
          title: "Assign To",
          description: "Assignment dialog coming soon",
        });
        break;
      case 'row-actions':
        // TODO: Open more actions menu
        console.log('More actions for:', itemId);
        break;
      case 'add-child':
        addChildItem(itemId);
        break;
      case 'edit':
        const foundItem = wbsItems.find(i => i.id === itemId);
        if (foundItem) {
          setEditingItem({ id: itemId, type: type as 'phase' | 'component' | 'element' | 'task', field: 'title' });
          setEditValue(foundItem.title);
        }
        break;
      case 'duplicate':
        console.log('Duplicate', type, itemId);
        break;
      case 'delete':
        console.log('🔵 ProjectScopePage handleContextMenuAction DELETE:', itemId, type);
        try {
          await deleteWBSItem(itemId);
          console.log('🔵 Delete successful, reloading items');
          // Reload and renumber after deletion
          await loadWBSItems();
          setTimeout(() => renumberWBSHierarchy(), 100);
          toast({
            title: "Row Deleted",
            description: "The row has been deleted successfully",
          });
        } catch (err) {
          console.error('🔴 Delete failed:', err);
          toast({
            title: "Delete Failed",
            description: err instanceof Error ? err.message : "Failed to delete row",
            variant: "destructive"
          });
        }
        break;
      case 'convert_to_task':
        await taskHandlers.handleConvertToTask(itemId);
        break;
      case 'view_task':
        await taskHandlers.handleViewTaskDetails(itemId);
        break;
      case 'unlink_task':
        await taskHandlers.handleUnlinkTask(itemId);
        break;
    }
  };

  // Comprehensive WBS renumbering function
  const renumberWBSHierarchy = async () => {
    try {
      console.log('🔄 Starting WBS hierarchy renumbering...');
      console.log('📊 Current WBS items:', wbsItems.map(i => ({ id: i.id, wbs_id: i.wbs_id, title: i.title, parent_id: i.parent_id, level: i.level })));
      
      const updates = renumberAllWBSItems(wbsItems);
      
      if (updates.length === 0) {
        console.log('✅ No WBS renumbering needed - hierarchy is already correct');
        return;
      }
      
      console.log('🔢 Applying WBS updates:', updates.map(u => ({ item: u.item.title, oldWbs: u.item.wbs_id, newWbs: u.newWbsId })));
      
      // Apply all the WBS ID updates
      for (const { item, newWbsId } of updates) {
        await updateWBSItem(item.id, { wbs_id: newWbsId }, { skipAutoSchedule: true });
      }
      
      console.log(`✅ Renumbered ${updates.length} WBS items to ensure sequential hierarchy`);
    } catch (error) {
      console.error('❌ Error renumbering WBS hierarchy:', error);
    }
  };

  // Create a unified toggle handler for all tabs to ensure synchronization
  const handleToggleExpanded = useCallback(async (itemId: string) => {
    const item = findWBSItem(itemId);
    if (item) {
      // is_expanded is now always a boolean from the service
      const currentState = item.is_expanded !== false;
      const newExpandedState = !currentState;
      
      // Update the WBS item in the database and local state
      await updateWBSItem(itemId, { is_expanded: newExpandedState });
    }
  }, [wbsItems, updateWBSItem, findWBSItem]);


  // Remove drag and drop and editing functions that use setScopeData
  const handleEdit = (id: string, type: 'phase' | 'component' | 'element' | 'task', field: string, currentValue: string) => {
    setEditingItem({ id, type, field });
    setEditValue(currentValue);
  };

  // Generic function to add child items
  const addChildItem = async (parentId: string) => {
    try {
      console.log('🔄 addChildItem called with parentId:', parentId);
      const parentItem = findWBSItem(parentId);
      
      if (!parentItem) {
        console.error('❌ Parent item not found for ID:', parentId);
        return;
      }

      if (!currentCompany?.id) {
        console.error('❌ No active company selected');
        return;
      }

      const childLevel = parentItem.level + 1;
      const wbsId = generateWBSId(parentId);

      console.log(`➕ Adding child at level ${childLevel} to parent at level ${parentItem.level}`);

      await createWBSItem({
        company_id: currentCompany.id,
        project_id: project.id,
        parent_id: parentId,
        wbs_id: wbsId,
        title: 'Untitled Activity',
        description: '',
        level: childLevel,
        category: 'Task',
        is_expanded: true,
        progress: 0,
        status: 'Not Started',
        health: 'Good',
        progress_status: 'On Track',
        at_risk: false,
        priority: 'Medium',
        linked_tasks: []
      });

      // Auto-expand the parent to show the new child
      await updateWBSItem(parentId, { is_expanded: true });

      // Trigger renumbering to ensure all WBS IDs are sequential
      await renumberWBSHierarchy();

      console.log('✅ addChildItem completed');
    } catch (error) {
      console.error('❌ Error adding child item:', error);
    }
  };

  const addNewItem = async () => {
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
        title: 'Untitled Activity',
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
          title: phase.name || 'Untitled Activity',
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
    if (e.key === 'Enter' && e.shiftKey && (editingItem?.type === 'element' || editingItem?.type === 'task')) {
      e.preventDefault();
      await saveEdit();
      
      // Find the parent of this item
      const currentItem = wbsItems.find(item => item.id === editingItem.id);
      if (currentItem?.parent_id) {
        // Add a sibling by adding child to parent
        await addChildItem(currentItem.parent_id);
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
    type: 'phase' | 'component' | 'element' | 'task'; 
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
        // Check if this is an empty row that needs to be created
        if (id.startsWith('empty-')) {
          console.log('🆕 Creating new WBS item for empty row:', id);
          if (!currentCompany?.id) {
            console.error('❌ No company ID available');
            return;
          }

          // Create a new phase when editing an empty row
          const wbsId = generateWBSId();
          const newItem = {
            company_id: currentCompany.id,
            project_id: project.id,
            title: newVal,
            level: 0,
            parent_id: null,
            wbs_id: wbsId,
            stage: '4.0 PRELIMINARY',
            is_expanded: true,
            linked_tasks: []
          };

          await createWBSItem(newItem);
          console.log('✅ Created new phase:', newVal);
          return;
        }

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
      if (e.key === 'Enter' && e.shiftKey && (type === 'element' || type === 'task')) {
        e.preventDefault();
        await commitEdit();
        const currentItem = wbsItems.find(item => item.id === id);
        if (currentItem?.parent_id) {
          // Add a sibling by adding child to parent
          await addChildItem(currentItem.parent_id);
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
          field === 'assignedTo' ? (
            <TeamTaskAssignment
              projectId={project.id}
              currentAssignee={localValue ? { name: localValue, avatar: '', userId: undefined } : undefined}
              onAssigneeChange={(assignee) => {
                const newValue = assignee?.name || '';
                setLocalValue(newValue);
                updateScopeField(newValue);
                setIsEditing(false);
              }}
              className="w-full text-xs"
            />
          ) : (
            <Input
              ref={localInputRef}
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onKeyDown={onKeyDown}
              onMouseDown={(e) => e.stopPropagation()}
              className={`border-none outline-none focus:outline-none focus:border-none ring-0 focus:ring-0 focus-visible:ring-0 ring-offset-0 focus:ring-offset-0 focus-visible:ring-offset-0 shadow-none bg-transparent p-0 m-0 rounded-none h-auto w-full ${className}`}
              placeholder={placeholder}
              autoFocus
            />
          )
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

  // Enhanced drag and drop system with optimistic updates
  const onDragEnd = async (result: DropResult) => {
    setDragIndicator(null);
    if (!result.destination) return;
    
    const { source, destination, type } = result;
    
    if (source.index === destination.index) return;
    
    // Helper function to determine if an item should be visible (not hidden by collapsed parent)
    const isItemVisible = (item: any, allItems: any[]): boolean => {
      if (item.level === 0) return true;
      const parent = allItems.find(i => i.id === item.parent_id);
      if (!parent) return true;
      if (parent.isExpanded === false) return false;
      return isItemVisible(parent, allItems);
    };
    
    // Use flatWBSItems (hierarchically ordered) instead of wbsItems (created_at ordered)
    // This ensures drag indices match the visual display order
    const visibleFlatItems = flatWBSItems.filter(item => isItemVisible(item, flatWBSItems));
    
    // Create a new array and reorder
    const reorderedVisibleItems = [...visibleFlatItems];
    const [movedItem] = reorderedVisibleItems.splice(source.index, 1);
    reorderedVisibleItems.splice(destination.index, 0, movedItem);
    
    // Persist to database - update created_at to maintain new order
    try {
      for (let i = 0; i < reorderedVisibleItems.length; i++) {
        const item = reorderedVisibleItems[i];
        
        await updateWBSItem(item.id, { 
          wbs_id: `${i + 1}`,
          created_at: new Date(Date.now() + i * 1000).toISOString()
        }, { skipAutoSchedule: true });
      }
      
      // Reload items to reflect new order
      await loadWBSItems();
    } catch (error) {
      console.error('❌ Error reordering items:', error);
      // Revert on error
      await loadWBSItems();
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

  const calculateTimelineProgress = () => {
    // Calculate progress based on current date vs project timeline
    const projectStartDate = new Date(project.created_at || new Date());
    
    // Use the latest end date from WBS items if no project end date is available
    const wbsEndDates = wbsItems
      .filter(item => item.end_date)
      .map(item => new Date(item.end_date!));
    
    const projectEndDate = wbsEndDates.length > 0 
      ? new Date(Math.max(...wbsEndDates.map(d => d.getTime())))
      : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // Default to 90 days from now
      
    const currentDate = new Date();
    
    const totalDuration = projectEndDate.getTime() - projectStartDate.getTime();
    const elapsedDuration = currentDate.getTime() - projectStartDate.getTime();
    
    if (totalDuration <= 0) return 0;
    
    const timelineProgress = Math.min(Math.max((elapsedDuration / totalDuration) * 100, 0), 100);
    return Math.round(timelineProgress);
  };

  const calculateCostProgress = () => {
    // Calculate progress based on amount paid vs total project cost
    // For now, return a placeholder calculation based on overall progress
    // This would typically come from actual cost/payment data
    const overallProgress = calculateOverallProgress();
    // Simulate that cost progress is typically slightly behind overall progress
    return Math.max(0, Math.round(overallProgress * 0.85));
  };

  const getProgressData = () => {
    switch (activeTab) {
      case 'scope':
        return {
          label: 'Overall Progress',
          value: calculateOverallProgress(),
          suffix: '%'
        };
      case 'time':
        return {
          label: 'Timeline Progress',
          value: calculateTimelineProgress(),
          suffix: '%'
        };
      case 'cost':
        return {
          label: 'Cost Progress',
          value: calculateCostProgress(),
          suffix: '%'
        };
      default:
        return {
          label: 'Overall Progress',
          value: calculateOverallProgress(),
          suffix: '%'
        };
    }
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
        {/* Full Width Content - No Chat Section */}
        <div className="h-full w-full bg-background">
          {/* Tabs Container - Full Width */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full w-full flex flex-col">
            <div className="flex-shrink-0 border-b border-border bg-white backdrop-blur-sm">
                <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-6">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground font-inter">{project.name}</h1>
                    <p className="text-muted-foreground mt-1 text-sm font-inter">Project Control</p>
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
                    <div className="text-xs text-muted-foreground font-inter">{getProgressData().label}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${getProgressColor(getProgressData().value)}`}
                          style={{ width: `${getProgressData().value}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-foreground font-inter">{getProgressData().value}{getProgressData().suffix}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-6 flex-1">
                    {/* Tab-specific buttons section */}
                    <div className="flex items-center gap-2">
                        {activeTab === 'time' && (
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => {}} title="Critical Path">
                              <span className="text-xs font-medium">Critical Path</span>
                            </Button>
                          </div>
                        )}
                        {activeTab === 'cost' && (
                          <div className="flex items-center gap-2">
                            {/* Cost-specific buttons can go here */}
                          </div>
                        )}
                      </div>
                      
                      {/* Common buttons section */}
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
                        <Button variant="outline" size="sm" onClick={() => {}} title="Settings">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 w-full" style={{ height: 'calc(100vh - 180px)' }}>

              <TabsContent value="scope" className="h-full w-full m-0 p-0 data-[state=active]:flex data-[state=active]:flex-col">
                <div className="h-full w-full flex flex-col overflow-hidden">
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
                          <div className="flex gap-2 justify-center">
                            <Button variant="outline" size="sm" onClick={clearError}>
                              Clear Error
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                              Retry
                            </Button>
                          </div>
                        </div>
                     </div>
                    ) : flatWBSItems.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center max-w-md px-4">
                          <div className="mb-4">
                            <Plus className="w-16 h-16 mx-auto text-muted-foreground/40" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">No Activities Yet</h3>
                          <p className="text-sm text-muted-foreground mb-6">
                            Get started by adding your first project activity to build your work breakdown structure.
                          </p>
                          <Button onClick={addNewItem} className="gap-2">
                            <Plus className="w-4 h-4" />
                            Add First Activity
                          </Button>
                        </div>
                      </div>
                    ) : (
                    <div className="h-full overflow-hidden">
                      <WBSSplitView
                        items={flatWBSItems}
                        onToggleExpanded={handleToggleExpanded}
                          onDragEnd={onDragEnd}
                          onDragUpdate={onDragUpdate}
                           onItemUpdate={async (itemId, updates) => {
                             console.log('🟪 WBSSplitView item update:', itemId, updates);
                             await updateWBSItem(itemId, updates);
                             // Trigger renumbering after hierarchy changes
                             if (updates.parent_id !== undefined || updates.level !== undefined) {
                               console.log('🔢 Triggering WBS renumbering due to hierarchy change');
                               await renumberWBSHierarchy();
                             }
                           }}
                           onReloadItems={loadWBSItems}
                           onAddChild={addChildItem}
                           onContextMenuAction={handleContextMenuAction}
                           onOpenNotesDialog={openNotesDialog}
                           onAddRow={addNewItem}
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

              <TabsContent value="time" className="h-full w-full m-0 p-0 data-[state=active]:flex data-[state=active]:flex-col">
                <div className="h-full w-full flex flex-col">
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
                       <div className="flex gap-2 justify-center">
                         <Button variant="outline" size="sm" onClick={clearError}>
                           Clear Error
                         </Button>
                         <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                           Retry
                         </Button>
                       </div>
                     </div>
                    </div>
                  ) : flatWBSItems.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center max-w-md px-4">
                        <div className="mb-4">
                          <Clock className="w-16 h-16 mx-auto text-muted-foreground/40" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No Activities Yet</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                          Get started by adding your first project activity to build your work breakdown structure.
                        </p>
                        <Button onClick={addNewItem} className="gap-2">
                          <Plus className="w-4 h-4" />
                          Add First Activity
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full overflow-hidden">
                      <WBSTimeView
                        items={flatWBSItems}
                        onToggleExpanded={handleToggleExpanded}
                        onDragEnd={onDragEnd}
                           onItemUpdate={async (itemId, updates) => {
                             console.log('🟦 WBSTimeView item update:', itemId, updates);
                             await updateWBSItem(itemId, updates);
                             // Trigger renumbering after hierarchy changes
                             if (updates.parent_id !== undefined || updates.level !== undefined) {
                               console.log('🔢 Triggering WBS renumbering due to hierarchy change');
                               await renumberWBSHierarchy();
                             }
                           }}
                        onReloadItems={loadWBSItems}
                        onAddChild={addChildItem}
                        onContextMenuAction={handleContextMenuAction}
                        onOpenNotesDialog={openNotesDialog}
                        onClearAllDates={clearAllDates}
                        onAddRow={addNewItem}
                        dragIndicator={dragIndicator}
                        EditableCell={EditableCell}
                        StatusSelect={StatusSelect}
                        generateWBSNumber={generateWBSNumber}
                      />
                    </div>
                  )}
                </div>
              </TabsContent>

               <TabsContent value="cost" className="h-full w-full m-0 p-0 data-[state=active]:flex data-[state=active]:flex-col overflow-hidden">
                  <div className="h-full w-full flex flex-col overflow-hidden">
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
                            <div className="flex gap-2 justify-center">
                              <Button variant="outline" size="sm" onClick={clearError}>
                                Clear Error
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                                Retry
                              </Button>
                            </div>
                          </div>
                       </div>
                      ) : flatWBSItems.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center max-w-md px-4">
                            <div className="mb-4">
                              <DollarSign className="w-16 h-16 mx-auto text-muted-foreground/40" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No Activities Yet</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                              Get started by adding your first project activity to build your work breakdown structure.
                            </p>
                            <Button onClick={addNewItem} className="gap-2">
                              <Plus className="w-4 h-4" />
                              Add First Activity
                            </Button>
                          </div>
                        </div>
                      ) : (
                          <WBSCostView
                            items={flatWBSItems}
                            onToggleExpanded={handleToggleExpanded}
                            onDragEnd={onDragEnd}
                             onItemUpdate={async (itemId, updates) => {
                               console.log('🟩 WBSCostView item update:', itemId, updates);
                               await updateWBSItem(itemId, updates);
                               // Trigger renumbering after hierarchy changes
                               if (updates.parent_id !== undefined || updates.level !== undefined) {
                                 console.log('🔢 Triggering WBS renumbering due to hierarchy change');
                                 await renumberWBSHierarchy();
                               }
                             }}
                             onReloadItems={loadWBSItems}
                             onAddChild={addChildItem}
                            onContextMenuAction={handleContextMenuAction}
                            onOpenNotesDialog={openNotesDialog}
                            onAddRow={addNewItem}
                            dragIndicator={dragIndicator}
                            EditableCell={EditableCell}
                            StatusSelect={StatusSelect}
                            generateWBSNumber={generateWBSNumber}
                          />
                      )}
                    </div>
                  </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* Task Detail Panel */}
        <TaskDetailPanel
          task={selectedTask}
          isOpen={isTaskDetailOpen}
          onClose={() => {
            setIsTaskDetailOpen(false);
            setSelectedTask(null);
          }}
          onTaskUpdate={(taskId, updates) => {
            // Handle task updates if needed
            console.log('Task updated:', taskId, updates);
          }}
          wbsItemId={selectedTask?.wbs_item_id}
        />

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
    );
  };