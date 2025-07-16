import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, DollarSign, Trash2, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ActivityData } from '@/utils/activityUtils';

interface ActivityCardProps {
  activity: ActivityData;
  onDelete: (id: string) => void;
  onToggleExpansion: (id: string) => void;
  onCreateChild: (parentId: string) => void;
  level?: number;
}

export const ActivityCard = ({ 
  activity, 
  onDelete, 
  onToggleExpansion, 
  onCreateChild,
  level = 0 
}: ActivityCardProps) => {
  const hasChildren = activity.children && activity.children.length > 0;
  const indentClass = level > 0 ? `ml-${Math.min(level * 6, 24)}` : '';

  return (
    <div className={`space-y-2 ${indentClass}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2 flex-1">
              {/* Expand/Collapse button for parent activities */}
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleExpansion(activity.id)}
                  className="p-1 h-6 w-6 mt-1"
                >
                  {activity.is_expanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">{activity.name}</h3>
                  {level === 0 && (
                    <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                      Parent
                    </span>
                  )}
                  {level > 0 && (
                    <span className="px-2 py-1 text-xs bg-secondary/10 text-secondary-foreground rounded-full">
                      Child
                    </span>
                  )}
                </div>
                
                {activity.description && (
                  <p className="text-muted-foreground mb-4">{activity.description}</p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activity.start_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Start: {format(new Date(activity.start_date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}
                  {activity.end_date && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        End: {format(new Date(activity.end_date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}
                  {activity.cost_est && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Estimated: ${activity.cost_est.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCreateChild(activity.id)}
                className="text-primary hover:text-primary"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(activity.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Render children if expanded */}
      {hasChildren && activity.is_expanded && (
        <div className="space-y-2">
          {activity.children!.map((child) => (
            <ActivityCard
              key={child.id}
              activity={child}
              onDelete={onDelete}
              onToggleExpansion={onToggleExpansion}
              onCreateChild={onCreateChild}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};