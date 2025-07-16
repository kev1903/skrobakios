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
        <TableCell className="py-2">
          <div className="text-xs font-mono text-muted-foreground">
            {activity.id.slice(0, 8)}...
          </div>
        </TableCell>
        
        <TableCell className="py-2">
          <div className="text-sm font-medium">
            {activity.stage || "4.0 PRELIMINARY"}
          </div>
        </TableCell>
        
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
        
        <TableCell className="py-2">
          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
            {activity.description || "-"}
          </div>
        </TableCell>
        
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
              <TableHead className="font-semibold py-3 w-20">ID</TableHead>
              <TableHead className="font-semibold py-3 w-40">
                <Button
                  variant="ghost"
                  onClick={handleStageSort}
                  className="h-auto p-0 font-semibold hover:bg-transparent flex items-center"
                >
                  Stage
                  {getSortIcon()}
                </Button>
              </TableHead>
              <TableHead className="font-semibold py-3 w-64">Activity</TableHead>
              <TableHead className="font-semibold py-3 w-80">Description</TableHead>
              <TableHead className="font-semibold py-3 w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedActivities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
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