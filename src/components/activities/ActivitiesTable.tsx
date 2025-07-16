import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ActivityData } from '@/utils/activityUtils';

interface ActivitiesTableProps {
  activities: ActivityData[];
  onDelete: (id: string) => void;
  onToggleExpansion: (id: string) => void;
  onCreateChild: (parentId: string) => void;
}

interface ActivityRowProps {
  activity: ActivityData;
  onDelete: (id: string) => void;
  onToggleExpansion: (id: string) => void;
  onCreateChild: (parentId: string) => void;
  level?: number;
}

const ActivityRow = ({ 
  activity, 
  onDelete, 
  onToggleExpansion, 
  onCreateChild,
  level = 0 
}: ActivityRowProps) => {
  const hasChildren = activity.children && activity.children.length > 0;
  const paddingLeft = level * 24;

  return (
    <>
      <TableRow className="hover:bg-muted/50 border-b">
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
        
        <TableCell className="py-2" style={{ paddingLeft: `${paddingLeft + 16}px` }}>
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
              <span className="font-medium text-sm">{activity.name}</span>
            </div>
          </div>
        </TableCell>
        
        <TableCell className="py-2">
          <div className="text-sm text-muted-foreground max-w-xs truncate">
            {activity.description || "-"}
          </div>
        </TableCell>
        
        <TableCell className="py-2">
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
              level={level + 1}
            />
          ))}
        </>
      )}
    </>
  );
};

export const ActivitiesTable = ({ 
  activities, 
  onDelete, 
  onToggleExpansion, 
  onCreateChild 
}: ActivitiesTableProps) => {
  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold py-3 w-24">ID</TableHead>
            <TableHead className="font-semibold py-3 w-32">Stage</TableHead>
            <TableHead className="font-semibold py-3">Activity</TableHead>
            <TableHead className="font-semibold py-3">Description</TableHead>
            <TableHead className="font-semibold py-3 w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                No activities yet. Create your first activity to get started.
              </TableCell>
            </TableRow>
          ) : (
            activities.map((activity) => (
              <ActivityRow
                key={activity.id}
                activity={activity}
                onDelete={onDelete}
                onToggleExpansion={onToggleExpansion}
                onCreateChild={onCreateChild}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};