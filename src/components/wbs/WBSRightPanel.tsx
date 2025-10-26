import React, { memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, NotebookPen, ListTodo, Unlink, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SimpleTeamAssignment } from '@/components/tasks/enhanced/SimpleTeamAssignment';
import { useTaskAssignmentEmail } from '@/hooks/useTaskAssignmentEmail';
import { supabase } from '@/integrations/supabase/client';

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

// Memoized row component for better performance
const WBSRow = memo(({ 
  item,
  onItemUpdate,
  onContextMenuAction,
  onOpenNotesDialog,
  EditableCell,
  StatusSelect,
  ProgressInput,
  getProgressColor,
  hoveredId,
  onRowHover,
  isSelected,
  onRowClick,
  projectId,
  sendTaskAssignmentEmail
}: {
  item: WBSItem;
  onItemUpdate: (itemId: string, updates: any) => void;
  onContextMenuAction: (action: string, itemId: string, type: string) => void;
  onOpenNotesDialog: (item: any) => void;
  EditableCell: any;
  StatusSelect: any;
  ProgressInput: any;
  getProgressColor: (progress: number) => string;
  hoveredId?: string | null;
  onRowHover?: (id: string | null) => void;
  isSelected: boolean;
  onRowClick?: (itemId: string, ctrlKey?: boolean) => void;
  projectId?: string;
  sendTaskAssignmentEmail: (taskId: string) => Promise<any>;
}) => {
  const handleAssigneeChange = useCallback(async (assignee: { name: string; avatar: string; userId?: string } | undefined) => {
    onItemUpdate(item.id, { assigned_to: assignee?.name || null });

    if (item.linked_task_id && assignee?.userId) {
      try {
        const { data: existingTask, error: fetchError } = await supabase
          .from('tasks')
          .select('id, task_name')
          .eq('id', item.linked_task_id)
          .maybeSingle();

        if (fetchError || !existingTask) {
          if (!existingTask) {
            onItemUpdate(item.id, { 
              is_task_enabled: false, 
              linked_task_id: null 
            });
          }
          return;
        }

        const { error: updateError } = await supabase
          .from('tasks')
          .update({ 
            assigned_to_user_id: assignee.userId,
            assigned_to_name: assignee.name,
            assigned_to_avatar: assignee.avatar
          })
          .eq('id', item.linked_task_id);

        if (!updateError) {
          await sendTaskAssignmentEmail(item.linked_task_id);
        }
      } catch (error) {
        console.error('Error in assignment flow:', error);
      }
    }
  }, [item.id, item.linked_task_id, onItemUpdate, sendTaskAssignmentEmail]);

  const handleMouseEnter = useCallback(() => {
    onRowHover?.(item.id);
  }, [item.id, onRowHover]);

  const handleMouseLeave = useCallback(() => {
    onRowHover?.(null);
  }, [onRowHover]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    onRowClick?.(item.id, e.ctrlKey || e.metaKey);
  }, [item.id, onRowClick]);

  const handleRfqToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onItemUpdate(item.id, { rfq_required: !item.rfq_required });
  }, [item.id, item.rfq_required, onItemUpdate]);

  const handleNotesClick = useCallback(() => {
    onOpenNotesDialog(item);
  }, [item, onOpenNotesDialog]);

  const handleTaskToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const itemType = item.level === 0 ? 'phase' : item.level === 1 ? 'component' : item.level === 2 ? 'element' : 'task';
    const action = !item.is_task_enabled ? 'convert_to_task' : 'unlink_task';
    onContextMenuAction(action, item.id, itemType);
  }, [item.id, item.level, item.is_task_enabled, onContextMenuAction]);

  const handleContextAction = useCallback((action: string) => {
    const itemType = item.level === 0 ? 'phase' : item.level === 1 ? 'component' : item.level === 2 ? 'element' : 'task';
    onContextMenuAction(action, item.id, itemType);
  }, [item.id, item.level, onContextMenuAction]);

  const handleStatusChange = useCallback((newStatus: string) => {
    onItemUpdate(item.id, { status: newStatus });
  }, [item.id, onItemUpdate]);

  const handleProgressChange = useCallback((newProgress: number) => {
    onItemUpdate(item.id, { progress: newProgress });
  }, [item.id, onItemUpdate]);

  return (
    <div
      key={item.id}
      className={`grid items-center w-full border-b border-gray-100 border-l-4 cursor-pointer transition-colors duration-150 ${
        isSelected 
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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div className="px-2 flex items-center justify-start h-full">
        <StatusSelect 
          value={item.status} 
          onChange={handleStatusChange}
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
            onChange={handleProgressChange}
            disabled={item.hasChildren}
          />
        </div>
      </div>

      <div className="px-2 flex items-center justify-start h-full text-muted-foreground text-xs">
        <div className="flex items-center gap-1 w-full">
          {projectId ? (
            <SimpleTeamAssignment
              projectId={projectId}
              currentAssignee={item.assignedTo ? { name: item.assignedTo, avatar: '', userId: undefined } : undefined}
              onAssigneeChange={handleAssigneeChange}
              className="flex-1"
            />
          ) : (
            <EditableCell
              id={item.id}
              type={item.level === 0 ? 'phase' : item.level === 1 ? 'component' : item.level === 2 ? 'element' : 'task'}
              field="assignedTo"
              value={item.assignedTo || ''}
              placeholder=""
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
          onClick={handleRfqToggle}
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
          onClick={handleNotesClick}
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
          className="h-6 w-6 p-0 hover:bg-muted"
          onClick={handleTaskToggle}
          title={item.is_task_enabled ? "Remove Task" : "Create Task"}
        >
          <ListTodo className={`w-4 h-4 transition-colors ${
            item.is_task_enabled
              ? 'text-green-600 hover:text-green-700' 
              : 'text-muted-foreground hover:text-foreground'
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
              <DropdownMenuItem onClick={() => handleContextAction('convert_to_task')}>
                <ListTodo className="w-3 h-3 mr-2" />
                Convert to Task
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem onClick={() => handleContextAction('view_task')}>
                  <ListTodo className="w-3 h-3 mr-2" />
                  View Task Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleContextAction('unlink_task')}>
                  <Unlink className="w-3 h-3 mr-2" />
                  Remove Task Link
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem 
              onClick={() => handleContextAction('delete')} 
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-3 h-3 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo - only re-render if these props actually changed
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.name === nextProps.item.name &&
    prevProps.item.status === nextProps.item.status &&
    prevProps.item.progress === nextProps.item.progress &&
    prevProps.item.assignedTo === nextProps.item.assignedTo &&
    prevProps.item.description === nextProps.item.description &&
    prevProps.item.rfq_required === nextProps.item.rfq_required &&
    prevProps.item.is_task_enabled === nextProps.item.is_task_enabled &&
    prevProps.item.hasChildren === nextProps.item.hasChildren &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.hoveredId === nextProps.hoveredId
  );
});

WBSRow.displayName = 'WBSRow';

export const WBSRightPanel = memo(({
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
  const { sendTaskAssignmentEmail } = useTaskAssignmentEmail();
  
  // Determine if we're in unified scroll mode
  const useUnifiedScroll = !scrollRef || !onScroll;


  const handleAssigneeChange = useCallback(async (itemId: string, assignee: { name: string; avatar: string; userId?: string } | undefined, item: WBSItem) => {
    onItemUpdate(itemId, { assigned_to: assignee?.name || null });

    if (item.linked_task_id && assignee?.userId) {
      try {
        const { data: existingTask, error: fetchError} = await supabase
          .from('tasks')
          .select('id, task_name')
          .eq('id', item.linked_task_id)
          .maybeSingle();

        if (fetchError || !existingTask) {
          if (!existingTask) {
            onItemUpdate(itemId, { 
              is_task_enabled: false, 
              linked_task_id: null 
            });
          }
          return;
        }

        const { error: updateError } = await supabase
          .from('tasks')
          .update({ 
            assigned_to_user_id: assignee.userId,
            assigned_to_name: assignee.name,
            assigned_to_avatar: assignee.avatar
          })
          .eq('id', item.linked_task_id);

        if (!updateError) {
          await sendTaskAssignmentEmail(item.linked_task_id);
        }
      } catch (error) {
        console.error('Error in assignment flow:', error);
      }
    }
  }, [onItemUpdate, sendTaskAssignmentEmail]);

  const content = (
    <>
      {items.map((item) => (
        <WBSRow
          key={item.id}
          item={item}
          onItemUpdate={onItemUpdate}
          onContextMenuAction={onContextMenuAction}
          onOpenNotesDialog={onOpenNotesDialog}
          EditableCell={EditableCell}
          StatusSelect={StatusSelect}
          ProgressInput={ProgressInput}
          getProgressColor={getProgressColor}
          hoveredId={hoveredId}
          onRowHover={onRowHover}
          isSelected={selectedItems.includes(item.id)}
          onRowClick={onRowClick}
          projectId={projectId}
          sendTaskAssignmentEmail={sendTaskAssignmentEmail}
        />
      ))}
    </>
  );

  return (
    <div className="bg-white">
      {useUnifiedScroll ? (
        <div>
          {content}
        </div>
      ) : (
        <div ref={scrollRef} className="h-full overflow-y-auto overflow-x-hidden scrollbar-thin" onScroll={onScroll}>
          {content}
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if items array changed, selected items changed, or hovered item changed
  if (prevProps.items.length !== nextProps.items.length) return false;
  if (prevProps.hoveredId !== nextProps.hoveredId) return false;
  if (prevProps.selectedItems.length !== nextProps.selectedItems.length) return false;
  
  // Check if selected items actually changed
  const prevSelected = new Set(prevProps.selectedItems);
  const nextSelected = new Set(nextProps.selectedItems);
  if (prevSelected.size !== nextSelected.size) return false;
  for (const id of prevSelected) {
    if (!nextSelected.has(id)) return false;
  }
  
  return true;
});