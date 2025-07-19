import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronRight, Plus, Trash2, ArrowUp, ArrowDown, ArrowUpDown, GripVertical } from 'lucide-react';
import { format } from 'date-fns';
import { ActivityData } from '@/utils/activityUtils';
import { useState, useMemo, useEffect } from 'react';
import React from 'react';
import { ActivityDetailsModal } from './ActivityDetailsModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DragDropContext, Droppable, Draggable, DropResult, DragUpdate } from 'react-beautiful-dnd';

// Generate hierarchical ID based on parent-child relationship and stage number
const generateHierarchicalId = (activity: ActivityData, allActivities: ActivityData[], stageActivities: ActivityData[], stage: string): string => {
  // Extract stage number from stage name (e.g., "4.0 PRELIMINARY" -> "4")
  const stageNumber = stage.split('.')[0];
  
  // Get siblings at the same level within the same stage
  const siblings = stageActivities.filter(a => 
    a.parent_id === activity.parent_id && a.level === activity.level
  ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  
  const siblingIndex = siblings.findIndex(s => s.id === activity.id) + 1;
  
  if (!activity.parent_id || activity.level === 0) {
    // Root level activity - use stage number as prefix
    return `${stageNumber}.${siblingIndex}`;
  }
  
  // Find parent and get its ID
  const parent = allActivities.find(a => a.id === activity.parent_id);
  if (parent) {
    const parentId = generateHierarchicalId(parent, allActivities, stageActivities, stage);
    // Concatenate child number directly to parent (e.g., 5.1 -> 5.11, 5.12)
    return `${parentId}${siblingIndex}`;
  }
  
  return `${stageNumber}.${siblingIndex}`;
};

interface StageGroup {
  stage: string;
  activities: ActivityData[];
  isExpanded: boolean;
}

interface ActivitiesTableProps {
  activities: ActivityData[];
  onDelete: (id: string) => void;
  onToggleExpansion: (id: string) => void;
  onCreateChild: (parentId: string) => void;
  onActivityUpdated?: () => void;
}

interface ActivityRowProps {
  activity: ActivityData;
  onDelete: (id: string) => void;
  onToggleExpansion: (id: string) => void;
  onCreateChild: (parentId: string) => void;
  onActivityClick: (activity: ActivityData) => void;
  level?: number;
  allActivities: ActivityData[];
  stageActivities: ActivityData[];
  stage: string;
  editingActivity: string | null;
  editingActivityName: string;
  onActivityEdit: (activityId: string, name: string) => void;
  onActivityEditSave: () => void;
  onActivityEditCancel: () => void;
  setEditingActivityName: (name: string) => void;
}

const ActivityRow = ({ 
  activity, 
  onDelete, 
  onToggleExpansion, 
  onCreateChild,
  onActivityClick,
  level = 0,
  allActivities,
  stageActivities,
  stage,
  editingActivity,
  editingActivityName,
  onActivityEdit,
  onActivityEditSave,
  onActivityEditCancel,
  setEditingActivityName
}: ActivityRowProps) => {
  const hasChildren = activity.children && activity.children.length > 0;
  const paddingLeft = level * 24;
  const hierarchicalId = generateHierarchicalId(activity, allActivities, stageActivities, stage);

  return (
    <>
      <TableRow className="hover:bg-muted/50 border-b cursor-pointer" onClick={() => onActivityClick(activity)}>
        {/* ID */}
        <TableCell className="py-2 w-20 min-w-20 max-w-20">
          <div className="text-sm font-mono font-semibold text-foreground truncate">
            {hierarchicalId}
          </div>
        </TableCell>
        
        {/* Task */}
        <TableCell className="py-2 w-48 min-w-48 max-w-48" style={{ paddingLeft: `${paddingLeft + 16}px` }} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2 min-w-0">
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleExpansion(activity.id)}
                className="p-0 h-4 w-4 hover:bg-transparent flex-shrink-0"
              >
                {activity.is_expanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            )}
            {!hasChildren && <div className="w-4 flex-shrink-0" />}
            
            <div className="flex items-center gap-2 min-w-0">
              {editingActivity === activity.id ? (
                <Input
                  value={editingActivityName}
                  onChange={(e) => setEditingActivityName(e.target.value)}
                  onBlur={onActivityEditSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onActivityEditSave();
                    } else if (e.key === 'Escape') {
                      onActivityEditCancel();
                    }
                  }}
                  className="font-medium text-sm h-6"
                  autoFocus
                />
              ) : (
                <span 
                  className="font-medium text-sm truncate cursor-pointer hover:text-primary transition-colors"
                  onClick={() => onActivityEdit(activity.id, activity.name)}
                >
                  {/* Extract just the text part without the number prefix */}
                  {activity.name.replace(/^[0-9]+\.[0-9]+\s+/, '')}
                </span>
              )}
            </div>
          </div>
        </TableCell>
        
        {/* Description */}
        <TableCell className="py-2 w-48 min-w-48 max-w-48">
          <div className="text-sm text-muted-foreground truncate">
            {activity.description || "-"}
          </div>
        </TableCell>
        
        {/* Assigned To */}
        <TableCell className="py-2 w-32 min-w-32 max-w-32">
          <div className="text-sm truncate">
            {activity.assigned_to || "Unassigned"}
          </div>
        </TableCell>
        
        {/* Status */}
        <TableCell className="py-2 w-24 min-w-24 max-w-24">
          <div className="truncate">
            <Badge variant={activity.status === 'Completed' ? 'default' : 'secondary'} className="text-xs truncate">
              {activity.status || "Not Started"}
            </Badge>
          </div>
        </TableCell>
        
        {/* % Complete */}
        <TableCell className="py-2 w-24 min-w-24 max-w-24">
          <div className="text-sm font-medium text-center">
            {activity.progress || 0}%
          </div>
        </TableCell>
        
        {/* Start Date */}
        <TableCell className="py-2 w-28 min-w-28 max-w-28">
          <div className="text-sm text-center">
            {activity.start_date ? format(new Date(activity.start_date), 'MMM dd') : "-"}
          </div>
        </TableCell>
        
        {/* End Date */}
        <TableCell className="py-2 w-28 min-w-28 max-w-28">
          <div className="text-sm text-center">
            {activity.end_date ? format(new Date(activity.end_date), 'MMM dd') : "-"}
          </div>
        </TableCell>
        
        {/* Duration */}
        <TableCell className="py-2 w-20 min-w-20 max-w-20">
          <div className="text-sm text-center">
            {activity.duration && typeof activity.duration === 'number' ? `${activity.duration}d` : "-"}
          </div>
        </TableCell>
        
        {/* Health */}
        <TableCell className="py-2 w-20 min-w-20 max-w-20">
          <div className="truncate flex justify-center">
            <Badge 
              variant={
                activity.health === 'Good' ? 'default' : 
                activity.health === 'At Risk' ? 'secondary' : 
                activity.health === 'Critical' ? 'destructive' : 'outline'
              }
              className="text-xs truncate"
            >
              {activity.health || "Unknown"}
            </Badge>
          </div>
        </TableCell>
        
        {/* Progress */}
        <TableCell className="py-2 w-20 min-w-20 max-w-20">
          <div className="truncate flex justify-center">
            <Badge 
              variant={
                activity.progress_status === 'On Track' ? 'default' : 
                activity.progress_status === 'Behind' ? 'destructive' : 
                activity.progress_status === 'Ahead' ? 'default' : 'secondary'
              }
              className="text-xs truncate"
            >
              {activity.progress_status || "On Track"}
            </Badge>
          </div>
        </TableCell>
        
        {/* At Risk */}
        <TableCell className="py-2 w-20 min-w-20 max-w-20">
          <div className="flex justify-center">
            <Badge variant={activity.at_risk ? 'destructive' : 'outline'} className="text-xs">
              {activity.at_risk ? "Yes" : "No"}
            </Badge>
          </div>
        </TableCell>
        
        {/* Actions */}
        <TableCell className="py-2 w-20 min-w-20 max-w-20" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCreateChild(activity.id)}
              className="h-6 w-6 p-0 hover:bg-primary/10"
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(activity.id)}
              className="h-6 w-6 p-0 hover:bg-destructive/10 text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      
      {/* Render children if expanded */}
      {hasChildren && activity.is_expanded && 
        activity.children!.map((child) => (
          <ActivityRow
            key={child.id}
            activity={child}
            onDelete={onDelete}
            onToggleExpansion={onToggleExpansion}
            onCreateChild={onCreateChild}
            onActivityClick={onActivityClick}
            level={level + 1}
            allActivities={allActivities}
            stageActivities={stageActivities}
            stage={stage}
            editingActivity={editingActivity}
            editingActivityName={editingActivityName}
            onActivityEdit={onActivityEdit}
            onActivityEditSave={onActivityEditSave}
            onActivityEditCancel={onActivityEditCancel}
            setEditingActivityName={setEditingActivityName}
          />
        ))
      }
    </>
  );
};

type SortDirection = 'asc' | 'desc' | null;

export const ActivitiesTable = ({ 
  activities, 
  onDelete, 
  onToggleExpansion, 
  onCreateChild,
  onActivityUpdated
}: ActivitiesTableProps) => {
  const [stageSortDirection, setStageSortDirection] = useState<SortDirection>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedStages, setExpandedStages] = useState<Set<string>>(() => {
    // Initialize with all stages expanded by default
    const stages = [...new Set(activities.map(activity => activity.stage || "4.0 PRELIMINARY"))];
    return new Set(stages);
  });
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [editingActivityName, setEditingActivityName] = useState<string>('');
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);
  const [draggedOverStage, setDraggedOverStage] = useState<string | null>(null);
  const { toast } = useToast();

  // Handle drag update to track drag position for shuffle effect
  const handleDragUpdate = (update: DragUpdate) => {
    if (update.destination) {
      setDraggedOverIndex(update.destination.index);
      setDraggedOverStage(update.destination.droppableId);
    } else {
      setDraggedOverIndex(null);
      setDraggedOverStage(null);
    }
  };

  // Handle drag and drop
  const handleDragEnd = async (result: DropResult) => {
    // Reset drag state
    setDraggedOverIndex(null);
    setDraggedOverStage(null);
    
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    // If dropped in the same position, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    try {
      const sourceStage = source.droppableId;
      const destStage = destination.droppableId;
      const draggedActivity = activities.find(a => a.id === draggableId);
      
      if (!draggedActivity) return;

      // Get all activities in the destination stage, ordered by sort_order
      const destStageActivities = stageGroups
        .find(sg => sg.stage === destStage)?.activities
        .slice()
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)) || [];

      // Calculate new sort order
      let newSortOrder: number;
      
      if (destination.index === 0) {
        // Moving to first position
        const firstActivity = destStageActivities[0];
        newSortOrder = firstActivity ? Math.max(0, (firstActivity.sort_order || 100) - 100) : 100;
      } else if (destination.index >= destStageActivities.length) {
        // Moving to last position
        const lastActivity = destStageActivities[destStageActivities.length - 1];
        newSortOrder = lastActivity ? (lastActivity.sort_order || 0) + 100 : 100;
      } else {
        // Moving between existing items
        const prevActivity = destStageActivities[destination.index - 1];
        const nextActivity = destStageActivities[destination.index];
        const prevOrder = prevActivity?.sort_order || 0;
        const nextOrder = nextActivity?.sort_order || 100;
        newSortOrder = Math.floor((prevOrder + nextOrder) / 2);
      }

      // Update the dragged activity
      const updateData: any = { 
        sort_order: newSortOrder,
        updated_at: new Date().toISOString()
      };

      // If moving to a different stage, update the stage
      if (sourceStage !== destStage) {
        updateData.stage = destStage;
      }

      const { error } = await supabase
        .from('activities')
        .update(updateData)
        .eq('id', draggableId);

      if (error) {
        console.error('Error moving activity:', error);
        toast({
          title: "Error",
          description: "Failed to move activity. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // If we moved to a very close position, we might need to rebalance sort orders
      if (newSortOrder <= 1 || (destination.index > 0 && newSortOrder - (destStageActivities[destination.index - 1]?.sort_order || 0) <= 1)) {
        await rebalanceSortOrders(destStage);
      }

      toast({
        title: "Success",
        description: "Activity moved successfully.",
      });

      // Refresh the data
      if (onActivityUpdated) {
        onActivityUpdated();
      }
    } catch (error) {
      console.error('Error moving activity:', error);
      toast({
        title: "Error",
        description: "Failed to move activity. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to rebalance sort orders when they get too close
  const rebalanceSortOrders = async (stage: string) => {
    try {
      const stageActivities = activities
        .filter(a => a.stage === stage)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

      const updates = stageActivities.map((activity, index) => ({
        id: activity.id,
        sort_order: (index + 1) * 100
      }));

      for (const update of updates) {
        await supabase
          .from('activities')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
      }
    } catch (error) {
      console.error('Error rebalancing sort orders:', error);
    }
  };

  // Preserve expanded stages when activities data changes
  useEffect(() => {
    const currentStages = [...new Set(activities.map(activity => activity.stage || "4.0 PRELIMINARY"))];
    
    setExpandedStages(prevExpanded => {
      const newExpandedStages = new Set(prevExpanded);
      
      // Add any new stages to expanded state (expand new stages by default)
      currentStages.forEach(stage => {
        if (!newExpandedStages.has(stage)) {
          newExpandedStages.add(stage);
        }
      });
      
      return newExpandedStages;
    });
  }, [activities]);

  const stageGroups = useMemo(() => {
    // Group activities by stage
    const groups = new Map<string, ActivityData[]>();
    
    activities.forEach(activity => {
      const stage = activity.stage || "4.0 PRELIMINARY";
      if (!groups.has(stage)) {
        groups.set(stage, []);
      }
      groups.get(stage)!.push(activity);
    });

    // Convert to array and sort activities within each stage by sort_order
    const stageGroupsArray: StageGroup[] = Array.from(groups.entries()).map(([stage, activities]) => ({
      stage,
      activities: activities.sort((a, b) => {
        // Sort by sort_order first, then by created_at as fallback
        const orderA = a.sort_order ?? 0;
        const orderB = b.sort_order ?? 0;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }),
      isExpanded: expandedStages.has(stage)
    }));

    // Sort stages
    if (stageSortDirection === 'asc') {
      stageGroupsArray.sort((a, b) => a.stage.localeCompare(b.stage));
    } else if (stageSortDirection === 'desc') {
      stageGroupsArray.sort((a, b) => b.stage.localeCompare(a.stage));
    } else {
      stageGroupsArray.sort((a, b) => a.stage.localeCompare(b.stage)); // Default sort
    }

    return stageGroupsArray;
  }, [activities, stageSortDirection, expandedStages]);

  const handleStageSort = () => {
    if (stageSortDirection === null) {
      setStageSortDirection('asc');
    } else if (stageSortDirection === 'asc') {
      setStageSortDirection('desc');
    } else {
      setStageSortDirection(null);
    }
  };

  const toggleStageExpansion = (stage: string) => {
    const newExpandedStages = new Set(expandedStages);
    if (newExpandedStages.has(stage)) {
      newExpandedStages.delete(stage);
    } else {
      newExpandedStages.add(stage);
    }
    setExpandedStages(newExpandedStages);
  };

  const getSortIcon = () => {
    if (stageSortDirection === 'asc') return <ArrowUp className="h-3 w-3 ml-1" />;
    if (stageSortDirection === 'desc') return <ArrowDown className="h-3 w-3 ml-1" />;
    return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
  };

  const handleActivityClick = (activity: ActivityData) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedActivity(null);
  };

  const handleActivityUpdated = () => {
    if (onActivityUpdated) {
      onActivityUpdated();
    }
  };

  const handleStageEdit = (stage: string) => {
    setEditingStage(stage);
    setEditValue(stage);
  };

  const handleStageEditSave = async () => {
    if (!editingStage || !editValue.trim()) {
      handleStageEditCancel();
      return;
    }

    // Only proceed if the value actually changed
    if (editValue.trim() === editingStage) {
      setEditingStage(null);
      setEditValue('');
      return;
    }

    try {
      // Update all activities that have the old stage name to the new stage name
      const { error } = await supabase
        .from('activities')
        .update({ stage: editValue.trim() })
        .eq('stage', editingStage);

      if (error) {
        console.error('Error updating stage:', error);
        toast({
          title: "Error",
          description: "Failed to update stage name. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Stage renamed from "${editingStage}" to "${editValue.trim()}"`,
      });

      // Trigger a refresh of the activities data
      if (onActivityUpdated) {
        onActivityUpdated();
      }

      setEditingStage(null);
      setEditValue('');
    } catch (error) {
      console.error('Error updating stage:', error);
      toast({
        title: "Error",
        description: "Failed to update stage name. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStageEditCancel = () => {
    setEditingStage(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStageEditSave();
    } else if (e.key === 'Escape') {
      handleStageEditCancel();
    }
  };

  const handleActivityEdit = (activityId: string, name: string) => {
    setEditingActivity(activityId);
    // Remove the number prefix when editing, so user only edits the text part
    setEditingActivityName(name.replace(/^[0-9]+\.[0-9]+\s+/, ''));
  };

  const handleActivityEditSave = async () => {
    if (!editingActivity || !editingActivityName.trim()) {
      handleActivityEditCancel();
      return;
    }

    // Find the activity to get the original name for comparison
    const originalActivity = activities.find(a => a.id === editingActivity);
    if (!originalActivity) {
      handleActivityEditCancel();
      return;
    }

    // Only proceed if the value actually changed
    if (editingActivityName.trim() === originalActivity.name) {
      setEditingActivity(null);
      setEditingActivityName('');
      return;
    }

    try {
      // Update the activity name in the database
      const { error } = await supabase
        .from('activities')
        .update({ name: editingActivityName.trim() })
        .eq('id', editingActivity);

      if (error) {
        console.error('Error updating activity:', error);
        toast({
          title: "Error",
          description: "Failed to update activity name. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Update the local activities data to reflect the change
      if (onActivityUpdated) {
        onActivityUpdated();
      }

      setEditingActivity(null);
      setEditingActivityName('');
    } catch (error) {
      console.error('Error updating activity:', error);
      toast({
        title: "Error",
        description: "Failed to update activity name. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleActivityEditCancel = () => {
    setEditingActivity(null);
    setEditingActivityName('');
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd} onDragUpdate={handleDragUpdate}>
      <div className="border rounded-lg overflow-hidden bg-background">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold py-3 w-20 min-w-20 max-w-20">ID</TableHead>
              <TableHead className="font-semibold py-3 w-48 min-w-48 max-w-48">Task</TableHead>
              <TableHead className="font-semibold py-3 w-48 min-w-48 max-w-48">Description</TableHead>
              <TableHead className="font-semibold py-3 w-32 min-w-32 max-w-32">Assigned To</TableHead>
              <TableHead className="font-semibold py-3 w-24 min-w-24 max-w-24">Status</TableHead>
              <TableHead className="font-semibold py-3 w-24 min-w-24 max-w-24">% Complete</TableHead>
              <TableHead className="font-semibold py-3 w-28 min-w-28 max-w-28">Start Date</TableHead>
              <TableHead className="font-semibold py-3 w-28 min-w-28 max-w-28">End Date</TableHead>
              <TableHead className="font-semibold py-3 w-20 min-w-20 max-w-20">Duration</TableHead>
              <TableHead className="font-semibold py-3 w-20 min-w-20 max-w-20">Health</TableHead>
              <TableHead className="font-semibold py-3 w-20 min-w-20 max-w-20">Progress</TableHead>
              <TableHead className="font-semibold py-3 w-20 min-w-20 max-w-20">At Risk</TableHead>
              <TableHead className="font-semibold py-3 w-20 min-w-20 max-w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stageGroups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="text-center py-12 text-muted-foreground">
                  No activities yet. Create your first activity to get started.
                </TableCell>
              </TableRow>
            ) : (
              stageGroups.map((stageGroup) => (
                <React.Fragment key={stageGroup.stage}>
                  {/* Stage Group Header */}
                  <TableRow className="bg-muted/30 hover:bg-muted/50 border-b-2 border-border">
                    <TableCell colSpan={13} className="py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStageExpansion(stageGroup.stage)}
                          className="p-0 h-5 w-5 hover:bg-transparent"
                        >
                          {stageGroup.isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                        {editingStage === stageGroup.stage ? (
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleStageEditSave}
                            onKeyDown={handleKeyDown}
                            className="font-semibold text-base h-6 w-48"
                            autoFocus
                          />
                        ) : (
                          <span 
                            className="font-semibold text-base cursor-pointer hover:text-primary transition-colors"
                            onClick={() => handleStageEdit(stageGroup.stage)}
                          >
                            {stageGroup.stage}
                          </span>
                        )}
                        <Badge variant="secondary" className="ml-2">
                          {stageGroup.activities.length} task{stageGroup.activities.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {/* Stage Activities - Droppable */}
                  {stageGroup.isExpanded && (
                    <Droppable droppableId={stageGroup.stage}>
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.droppableProps}>
                          {stageGroup.activities.map((activity, index) => (
                            <Draggable key={activity.id} draggableId={activity.id} index={index}>
                               {(provided, snapshot) => {
                                 // Calculate if this row should have shuffle spacing
                                 const isBeingDraggedOver = draggedOverStage === stageGroup.stage && 
                                                           draggedOverIndex !== null && 
                                                           index >= draggedOverIndex && 
                                                           !snapshot.isDragging;
                                 
                                 const dragStyle = snapshot.isDragging 
                                   ? {
                                       transform: `${provided.draggableProps.style?.transform} rotate(1deg)`,
                                       zIndex: 1000,
                                     }
                                   : provided.draggableProps.style;

                                 return (
                                   <TableRow
                                     ref={provided.innerRef}
                                     {...provided.draggableProps}
                                     className={`hover:bg-muted/50 border-b cursor-pointer transition-all duration-300 ease-out ${
                                       snapshot.isDragging 
                                         ? 'bg-muted shadow-xl scale-105 z-50 opacity-90' 
                                         : isBeingDraggedOver 
                                           ? 'transform translate-y-4' 
                                           : ''
                                     }`}
                                     style={{
                                       ...dragStyle,
                                       marginBottom: snapshot.isDragging ? '16px' : isBeingDraggedOver ? '16px' : '0px',
                                       marginTop: snapshot.isDragging ? '16px' : '0px',
                                     }}
                                     onClick={() => !snapshot.isDragging && handleActivityClick(activity)}
                                   >
                                  {/* Drag Handle */}
                                  <TableCell className="py-2 w-20 min-w-20 max-w-20">
                                    <div className="flex items-center gap-2">
                                      <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                      <div className="text-sm font-mono font-semibold text-foreground truncate">
                                        {generateHierarchicalId(activity, activities, stageGroup.activities, stageGroup.stage)}
                                      </div>
                                    </div>
                                  </TableCell>
                                  
                                  {/* Task */}
                                  <TableCell className="py-2 w-48 min-w-48 max-w-48">
                                    <div className="flex items-center gap-2 min-w-0">
                                      {editingActivity === activity.id ? (
                                        <Input
                                          value={editingActivityName}
                                          onChange={(e) => setEditingActivityName(e.target.value)}
                                          onBlur={handleActivityEditSave}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              handleActivityEditSave();
                                            } else if (e.key === 'Escape') {
                                              handleActivityEditCancel();
                                            }
                                          }}
                                          className="font-medium text-sm h-6"
                                          autoFocus
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      ) : (
                                        <span 
                                          className="font-medium text-sm truncate cursor-pointer hover:text-primary transition-colors"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleActivityEdit(activity.id, activity.name);
                                          }}
                                        >
                                          {activity.name}
                                        </span>
                                      )}
                                    </div>
                                  </TableCell>
                                  
                                  {/* Description */}
                                  <TableCell className="py-2 w-48 min-w-48 max-w-48">
                                    <div className="text-sm text-muted-foreground truncate">
                                      {activity.description || "-"}
                                    </div>
                                  </TableCell>
                                  
                                  {/* Assigned To */}
                                  <TableCell className="py-2 w-32 min-w-32 max-w-32">
                                    <div className="text-sm truncate">
                                      {activity.assigned_to || "Unassigned"}
                                    </div>
                                  </TableCell>
                                  
                                  {/* Status */}
                                  <TableCell className="py-2 w-24 min-w-24 max-w-24">
                                    <div className="truncate">
                                      <Badge variant={activity.status === 'Completed' ? 'default' : 'secondary'} className="text-xs truncate">
                                        {activity.status || "Not Started"}
                                      </Badge>
                                    </div>
                                  </TableCell>
                                  
                                  {/* % Complete */}
                                  <TableCell className="py-2 w-24 min-w-24 max-w-24">
                                    <div className="text-sm font-medium text-center">
                                      {activity.progress || 0}%
                                    </div>
                                  </TableCell>
                                  
                                  {/* Start Date */}
                                  <TableCell className="py-2 w-28 min-w-28 max-w-28">
                                    <div className="text-sm text-center">
                                      {activity.start_date ? format(new Date(activity.start_date), 'MMM dd') : "-"}
                                    </div>
                                  </TableCell>
                                  
                                  {/* End Date */}
                                  <TableCell className="py-2 w-28 min-w-28 max-w-28">
                                    <div className="text-sm text-center">
                                      {activity.end_date ? format(new Date(activity.end_date), 'MMM dd') : "-"}
                                    </div>
                                  </TableCell>
                                  
                                  {/* Duration */}
                                  <TableCell className="py-2 w-20 min-w-20 max-w-20">
                                    <div className="text-sm text-center">
                                      {activity.duration && typeof activity.duration === 'number' ? `${activity.duration}d` : "-"}
                                    </div>
                                  </TableCell>
                                  
                                  {/* Health */}
                                  <TableCell className="py-2 w-20 min-w-20 max-w-20">
                                    <div className="truncate flex justify-center">
                                      <Badge 
                                        variant={
                                          activity.health === 'Good' ? 'default' : 
                                          activity.health === 'At Risk' ? 'secondary' : 
                                          activity.health === 'Critical' ? 'destructive' : 'outline'
                                        }
                                        className="text-xs truncate"
                                      >
                                        {activity.health || "Unknown"}
                                      </Badge>
                                    </div>
                                  </TableCell>
                                  
                                  {/* Progress */}
                                  <TableCell className="py-2 w-20 min-w-20 max-w-20">
                                    <div className="truncate flex justify-center">
                                      <Badge 
                                        variant={
                                          activity.progress_status === 'On Track' ? 'default' : 
                                          activity.progress_status === 'Behind' ? 'destructive' : 
                                          activity.progress_status === 'Ahead' ? 'default' : 'secondary'
                                        }
                                        className="text-xs truncate"
                                      >
                                        {activity.progress_status || "On Track"}
                                      </Badge>
                                    </div>
                                  </TableCell>
                                  
                                  {/* At Risk */}
                                  <TableCell className="py-2 w-20 min-w-20 max-w-20">
                                    <div className="flex justify-center">
                                      <Badge variant={activity.at_risk ? 'destructive' : 'outline'} className="text-xs">
                                        {activity.at_risk ? "Yes" : "No"}
                                      </Badge>
                                    </div>
                                  </TableCell>
                                  
                                  {/* Actions */}
                                  <TableCell className="py-2 w-20 min-w-20 max-w-20">
                                    <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onCreateChild(activity.id)}
                                        className="h-6 w-6 p-0 hover:bg-primary/10"
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDelete(activity.id)}
                                        className="h-6 w-6 p-0 hover:bg-destructive/10 text-destructive"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                 </TableRow>
                                 );
                               }}
                             </Draggable>
                           ))}
                           <tr ref={provided.innerRef} style={{ display: 'none' }}>
                             <td>{provided.placeholder}</td>
                           </tr>
                         </div>
                      )}
                    </Droppable>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ActivityDetailsModal
        activity={selectedActivity}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onActivityUpdated={handleActivityUpdated}
      />
    </DragDropContext>
  );
};