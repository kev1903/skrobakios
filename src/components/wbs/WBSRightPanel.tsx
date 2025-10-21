import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, NotebookPen, ListTodo, Unlink, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SimpleTeamAssignment } from '@/components/tasks/enhanced/SimpleTeamAssignment';

interface WBSItem {
  id: string;
  name: string;
  description?: string;
  status: string;
  progress: number;
  assignedTo?: string;
  level: number;
  hasChildren?: boolean;
  is_task_enabled?: boolean;
  linked_task_id?: string;
  rfq_required?: boolean;
}

interface WBSRightPanelProps {
  items: WBSItem[];
  onItemUpdate: (itemId: string, updates: any) => void;
  onContextMenuAction: (action: string, itemId: string, type: string) => void;
  onOpenNotesDialog: (item: any) => void;
  EditableCell: any;
  StatusSelect: any;
  ProgressInput: any;
  ProgressDisplay: any;
  getProgressColor: (progress: number) => string;
  scrollRef?: React.RefObject<HTMLDivElement>;
  onScroll?: () => void;
  hoveredId?: string | null;
  onRowHover?: (id: string | null) => void;
  selectedItems?: string[];
  onRowClick?: (itemId: string, ctrlKey?: boolean) => void;
  projectId?: string;
}

export const WBSRightPanel = ({
  items,
  onItemUpdate,
  onContextMenuAction,
  onOpenNotesDialog,
  EditableCell,
  StatusSelect,
  ProgressInput,
  ProgressDisplay,
  getProgressColor,
  scrollRef,
  onScroll,
  hoveredId,
  onRowHover,
  selectedItems = [],
  onRowClick,
  projectId
}: WBSRightPanelProps) => {
  const [convertingTaskId, setConvertingTaskId] = useState<string | null>(null);
  const [activeTaskStatuses, setActiveTaskStatuses] = useState<Map<string, boolean>>(new Map());

  // Optimistic update function for immediate button feedback
  const setTaskActiveOptimistically = useCallback((wbsItemId: string, isActive: boolean) => {
    setActiveTaskStatuses(prev => {
      const newMap = new Map(prev);
      newMap.set(wbsItemId, isActive);
      return newMap;
    });
  }, []);

  // Check which WBS items have active (unfinished) linked tasks
  useEffect(() => {
    const loadTaskStatuses = async () => {
      // Get all items with linked tasks
      const itemsWithTasks = items.filter(item => item.is_task_enabled && item.linked_task_id);
      
      if (itemsWithTasks.length === 0) {
        setActiveTaskStatuses(new Map());
        return;
      }

      try {
        const taskIds = itemsWithTasks.map(item => item.linked_task_id).filter(Boolean);
        
        // Fetch task statuses
        const { data: tasks, error } = await supabase
          .from('tasks')
          .select('id, status')
          .in('id', taskIds);

        if (error) throw error;

        // Create a map of WBS item ID -> has active task
        const statusMap = new Map<string, boolean>();
        itemsWithTasks.forEach(item => {
          const task = tasks?.find(t => t.id === item.linked_task_id);
          // Task is active if it exists and status is not 'Completed'
          const isActive = task && task.status !== 'Completed';
          statusMap.set(item.id, !!isActive);
        });

        setActiveTaskStatuses(statusMap);
      } catch (error) {
        console.error('Error loading task statuses:', error);
      }
    };

    loadTaskStatuses();

    // Set up real-time subscription for task changes
    const channel = supabase
      .channel('wbs-tasks-status-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        () => {
          // Reload task statuses when any task changes
          loadTaskStatuses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [items]);

  // Log items for debugging
  console.log('🟣 WBSRightPanel rendering with', items.length, 'items');
  console.log('🟣 Items by level:', items.reduce((acc: any, item: any) => {
    acc[item.level] = (acc[item.level] || 0) + 1;
    return acc;
  }, {}));
  
  // Determine if we're in unified scroll mode
  const useUnifiedScroll = !scrollRef || !onScroll;

  const content = (
    <>
      {items.map((item) => (
          <div
           key={item.id}
              className={`grid items-center w-full border-b border-gray-100 border-l-4 cursor-pointer transition-colors duration-150 ${
                selectedItems.includes(item.id) 
                  ? 'bg-primary/10 border-l-primary' 
                  : hoveredId === item.id 
                    ? 'bg-gray-50 border-l-transparent' 
                    : 'bg-white hover:bg-gray-50 border-l-transparent'
              }`}
              data-row-id={item.id}
            style={{
              gridTemplateColumns: '140px 120px 160px 60px 40px 40px 84px',
              height: '1.75rem',
          }}
          onMouseEnter={() => onRowHover?.(item.id)}
          onMouseLeave={() => onRowHover?.(null)}
          onClick={(e) => onRowClick?.(item.id, e.ctrlKey || e.metaKey)}
        >

            <div className="px-2 flex items-center justify-start h-full">
              <StatusSelect 
                value={item.status} 
                onChange={(newStatus: string) => onItemUpdate(item.id, { status: newStatus })}
                disabled={item.hasChildren}
              />
            </div>

            <div className="px-2 flex items-center justify-start h-full">
              <div className="flex items-center gap-1">
                <div className="w-8 h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${getProgressColor(item.progress)}`} 
                    style={{ width: `${item.progress}%` }} 
                  />
                </div>
                <ProgressInput 
                  value={item.progress} 
                  onChange={(newProgress: number) => onItemUpdate(item.id, { progress: newProgress })}
                  disabled={item.hasChildren}
                />
              </div>
            </div>

            <div className="px-2 flex items-center justify-start h-full text-muted-foreground text-xs">
              <div className="flex items-center gap-1 w-full">
                {item.is_task_enabled && (
                  <ListTodo className="w-3 h-3 text-green-600 flex-shrink-0" />
                )}
                {projectId ? (
                  <SimpleTeamAssignment
                    projectId={projectId}
                    currentAssignee={item.assignedTo ? { name: item.assignedTo, avatar: '', userId: undefined } : undefined}
                    onAssigneeChange={(assignee) => onItemUpdate(item.id, { assigned_to: assignee?.name || null })}
                    className="flex-1"
                  />
                ) : (
                  <EditableCell
                    id={item.id}
                    type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : item.level === 2 ? 'element' : 'task'}
                    field="assignedTo"
                    value={item.assignedTo || ''}
                    placeholder="Assign to..."
                    className="text-xs text-muted-foreground flex-1"
                  />
                )}
           </div>
           </div>

           <div className="px-2 flex items-center justify-center h-full">
             <Button
               variant="ghost"
               size="sm"
               className="h-6 w-6 p-0 hover:bg-muted"
               onClick={(e) => {
                 e.stopPropagation();
                 onItemUpdate(item.id, { rfq_required: !item.rfq_required });
               }}
               title={item.rfq_required ? "Tender Required" : "No Tender"}
             >
               <FileText className={`w-4 h-4 transition-colors ${
                 item.rfq_required
                   ? 'text-orange-500 hover:text-orange-600' 
                   : 'text-muted-foreground hover:text-foreground'
               }`} />
             </Button>
           </div>

           <div className="px-1 flex items-center justify-center h-full">
             <Button
               variant="ghost"
               size="sm"
               className="h-6 w-6 p-0 hover:bg-muted"
               onClick={() => onOpenNotesDialog(item)}
               title={item.description ? "View/Edit note" : "Add note"}
             >
               <NotebookPen className={`w-4 h-4 transition-colors ${
                 item.description && item.description.trim() 
                   ? 'text-blue-600 hover:text-blue-700' 
                   : 'text-muted-foreground hover:text-foreground'
               }`} />
             </Button>
           </div>

           <div className="px-1 flex items-center justify-center h-full">
             <Button
               variant="ghost"
               size="sm"
               className={`h-6 w-6 p-0 hover:bg-muted relative ${
                 convertingTaskId === item.id ? 'animate-pulse' : ''
               }`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (item.is_task_enabled) {
                    onContextMenuAction('view_task', item.id, item.level === 0 ? 'phase' : item.level === 1 ? 'component' : item.level === 2 ? 'element' : 'task');
                  } else {
                    // Optimistically set as active immediately for instant green button
                    setTaskActiveOptimistically(item.id, true);
                    setConvertingTaskId(item.id);
                    onContextMenuAction('convert_to_task', item.id, item.level === 0 ? 'phase' : item.level === 1 ? 'component' : item.level === 2 ? 'element' : 'task');
                    setTimeout(() => setConvertingTaskId(null), 1500);
                  }
                }}
               title={item.is_task_enabled && activeTaskStatuses.get(item.id) ? "View Active Task" : item.is_task_enabled ? "View Task (Completed)" : "Convert to Task"}
             >
                <ListTodo className={`w-4 h-4 transition-all duration-300 ${
                  item.is_task_enabled && (activeTaskStatuses.get(item.id) ?? true)
                    ? 'text-green-600 hover:text-green-700' 
                    : 'text-muted-foreground hover:text-foreground'
                } ${
                  convertingTaskId === item.id ? 'scale-110 drop-shadow-[0_0_8px_rgba(22,163,74,0.8)]' : ''
                }`} />
             </Button>
           </div>

           <div className="px-2 flex items-center justify-center h-full">
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                   <MoreHorizontal className="w-3 h-3" />
                 </Button>
               </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {!item.is_task_enabled ? (
                    <DropdownMenuItem 
                      onClick={() => onContextMenuAction('convert_to_task', item.id, item.level === 0 ? 'phase' : item.level === 1 ? 'component' : item.level === 2 ? 'element' : 'task')}
                    >
                      <ListTodo className="w-3 h-3 mr-2" />
                      Convert to Task
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem 
                        onClick={() => onContextMenuAction('view_task', item.id, item.level === 0 ? 'phase' : item.level === 1 ? 'component' : item.level === 2 ? 'element' : 'task')}
                      >
                        <ListTodo className="w-3 h-3 mr-2" />
                        View Task Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onContextMenuAction('unlink_task', item.id, item.level === 0 ? 'phase' : item.level === 1 ? 'component' : item.level === 2 ? 'element' : 'task')}
                      >
                        <Unlink className="w-3 h-3 mr-2" />
                        Remove Task Link
                      </DropdownMenuItem>
                    </>
                  )}
                   <DropdownMenuItem 
                     onClick={(e) => {
                       e.stopPropagation();
                       console.log('🔴 DELETE CLICKED:', item.id, 'Level:', item.level, 'Name:', item.name);
                       onContextMenuAction('delete', item.id, item.level === 0 ? 'phase' : item.level === 1 ? 'component' : item.level === 2 ? 'element' : 'task');
                     }} 
                     className="text-destructive focus:text-destructive"
                   >
                     <Trash2 className="w-3 h-3 mr-2" />
                     Delete
                   </DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
           </div>
        </div>
      ))}
    </>
  );

  return (
    <div className="bg-white">
      {useUnifiedScroll ? (
        // Unified scroll mode - parent handles scrolling
        <div>
          {content}
        </div>
      ) : (
        // Separate scroll mode - this component handles its own scrolling
        <div ref={scrollRef} className="h-full overflow-y-auto overflow-x-hidden scrollbar-thin" onScroll={onScroll}>
          {content}
        </div>
      )}
    </div>
  );
};