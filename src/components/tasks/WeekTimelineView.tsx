
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar } from 'lucide-react';
import { Task } from './types';

interface WeekTimelineViewProps {
  weekStart?: Date;
  currentDate?: Date;
  tasks?: Task[];
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => Promise<void>;
}

export const WeekTimelineView = ({ 
  weekStart,
  currentDate,
  tasks = [],
  onTaskUpdate 
}: WeekTimelineViewProps) => {
  const displayDate = weekStart || currentDate || new Date();
  const weekEnd = new Date(displayDate);
  weekEnd.setDate(displayDate.getDate() + 6);

  return (
    <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Week Timeline - {displayDate.toLocaleDateString()} to {weekEnd.toLocaleDateString()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Week timeline view is temporarily unavailable</p>
          {tasks.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {tasks.length} task{tasks.length > 1 ? 's' : ''} scheduled for this week
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
