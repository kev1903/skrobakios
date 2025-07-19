import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Plus, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { ActivityData } from '@/utils/activityUtils';
import { useState, useMemo } from 'react';
import { ActivityDetailsModal } from './ActivityDetailsModal';

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
}

const ActivityRow = ({ 
  activity, 
  onDelete, 
  onToggleExpansion, 
  onCreateChild,
  onActivityClick,
  level = 0 
}: ActivityRowProps) => {
  const hasChildren = activity.children && activity.children.length > 0;
  const paddingLeft = level * 24;

  return (
    <>
      <TableRow className="hover:bg-muted/50 border-b cursor-pointer" onClick={() => onActivityClick(activity)}>
        {/* ID */}
        <TableCell className="py-2">
          <div className="text-xs font-mono text-muted-foreground">
            {activity.id.slice(0, 8)}...
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

  const sortedActivities = useMemo(() => {
    if (!stageSortDirection) return activities;

    const sorted = [...activities].sort((a, b) => {
      const stageA = a.stage || "4.0 PRELIMINARY";
      const stageB = b.stage || "4.0 PRELIMINARY";
      
      if (stageSortDirection === 'asc') {
        return stageA.localeCompare(stageB);
      } else {
        return stageB.localeCompare(stageA);
      }
    });

    return sorted;
  }, [activities, stageSortDirection]);

  const handleStageSort = () => {
    if (stageSortDirection === null) {
      setStageSortDirection('asc');
    } else if (stageSortDirection === 'asc') {
      setStageSortDirection('desc');
    } else {
      setStageSortDirection(null);
    }
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
            {sortedActivities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="text-center py-12 text-muted-foreground">
                  No activities yet. Create your first activity to get started.
                </TableCell>
              </TableRow>
            ) : (
              sortedActivities.map((activity) => (
                <ActivityRow
                  key={activity.id}
                  activity={activity}
                  onDelete={onDelete}
                  onToggleExpansion={onToggleExpansion}
                  onCreateChild={onCreateChild}
                  onActivityClick={handleActivityClick}
                />
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