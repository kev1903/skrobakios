import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronRight, Plus, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { ActivityData } from '@/utils/activityUtils';
import { useState, useMemo } from 'react';
import React from 'react';
import { ActivityDetailsModal } from './ActivityDetailsModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  stage
}: ActivityRowProps) => {
  const hasChildren = activity.children && activity.children.length > 0;
  const paddingLeft = level * 24;
  const hierarchicalId = generateHierarchicalId(activity, allActivities, stageActivities, stage);

  return (
    <>
      <TableRow className="hover:bg-muted/50 border-b cursor-pointer" onClick={() => onActivityClick(activity)}>
        {/* ID */}
        <TableCell className="py-2">
          <div className="text-sm font-mono font-semibold text-foreground">
            {hierarchicalId}
          </div>
        </TableCell>
        
        {/* Task */}
        <TableCell className="py-2" style={{ paddingLeft: `${paddingLeft + 16}px` }} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleExpansion(activity.id)}
                className="p-0 h-4 w-4 hover:bg-transparent"
              >
                {activity.is_expanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            )}
            {!hasChildren && <div className="w-4" />}
            
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm truncate">{activity.name}</span>
            </div>
          </div>
        </TableCell>
        
        {/* Description */}
        <TableCell className="py-2">
          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
            {activity.description || "-"}
          </div>
        </TableCell>
        
        {/* Assigned To */}
        <TableCell className="py-2">
          <div className="text-sm">
            {activity.assigned_to || "Unassigned"}
          </div>
        </TableCell>
        
        {/* Status */}
        <TableCell className="py-2">
          <Badge variant={activity.status === 'Completed' ? 'default' : 'secondary'} className="text-xs">
            {activity.status || "Not Started"}
          </Badge>
        </TableCell>
        
        {/* % Complete */}
        <TableCell className="py-2">
          <div className="text-sm font-medium">
            {activity.progress || 0}%
          </div>
        </TableCell>
        
        {/* Start Date */}
        <TableCell className="py-2">
          <div className="text-sm">
            {activity.start_date ? format(new Date(activity.start_date), 'MMM dd') : "-"}
          </div>
        </TableCell>
        
        {/* End Date */}
        <TableCell className="py-2">
          <div className="text-sm">
            {activity.end_date ? format(new Date(activity.end_date), 'MMM dd') : "-"}
          </div>
        </TableCell>
        
        {/* Duration */}
        <TableCell className="py-2">
          <div className="text-sm">
            {activity.duration && typeof activity.duration === 'number' ? `${activity.duration}d` : "-"}
          </div>
        </TableCell>
        
        {/* Health */}
        <TableCell className="py-2">
          <Badge 
            variant={
              activity.health === 'Good' ? 'default' : 
              activity.health === 'At Risk' ? 'secondary' : 
              activity.health === 'Critical' ? 'destructive' : 'outline'
            }
            className="text-xs"
          >
            {activity.health || "Unknown"}
          </Badge>
        </TableCell>
        
        {/* Progress */}
        <TableCell className="py-2">
          <Badge 
            variant={
              activity.progress_status === 'On Track' ? 'default' : 
              activity.progress_status === 'Behind' ? 'destructive' : 
              activity.progress_status === 'Ahead' ? 'default' : 'secondary'
            }
            className="text-xs"
          >
            {activity.progress_status || "On Track"}
          </Badge>
        </TableCell>
        
        {/* At Risk */}
        <TableCell className="py-2">
          <Badge variant={activity.at_risk ? 'destructive' : 'outline'} className="text-xs">
            {activity.at_risk ? "Yes" : "No"}
          </Badge>
        </TableCell>
        
        {/* Actions */}
        <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1">
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
      {hasChildren && activity.is_expanded && (
        <>
          {activity.children!.map((child) => (
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
            />
          ))}
        </>
      )}
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
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const { toast } = useToast();

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

    // Convert to array and sort stages
    const stageGroupsArray: StageGroup[] = Array.from(groups.entries()).map(([stage, activities]) => ({
      stage,
      activities: activities.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
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

  return (
    <>
      <div className="border rounded-lg overflow-hidden bg-background">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold py-3 w-16">ID</TableHead>
              <TableHead className="font-semibold py-3 w-48">Task</TableHead>
              <TableHead className="font-semibold py-3 w-64">Description</TableHead>
              <TableHead className="font-semibold py-3 w-32">Assigned To</TableHead>
              <TableHead className="font-semibold py-3 w-24">Status</TableHead>
              <TableHead className="font-semibold py-3 w-20">% Complete</TableHead>
              <TableHead className="font-semibold py-3 w-28">Start Date</TableHead>
              <TableHead className="font-semibold py-3 w-28">End Date</TableHead>
              <TableHead className="font-semibold py-3 w-20">Duration</TableHead>
              <TableHead className="font-semibold py-3 w-20">Health</TableHead>
              <TableHead className="font-semibold py-3 w-20">Progress</TableHead>
              <TableHead className="font-semibold py-3 w-20">At Risk</TableHead>
              <TableHead className="font-semibold py-3 w-20">Actions</TableHead>
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
                  
                  {/* Stage Activities */}
                  {stageGroup.isExpanded && stageGroup.activities.map((activity) => (
                    <ActivityRow
                      key={activity.id}
                      activity={activity}
                      onDelete={onDelete}
                      onToggleExpansion={onToggleExpansion}
                      onCreateChild={onCreateChild}
                      onActivityClick={handleActivityClick}
                      allActivities={activities}
                      stageActivities={stageGroup.activities}
                      stage={stageGroup.stage}
                    />
                  ))}
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
    </>
  );
};