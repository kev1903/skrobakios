
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar } from 'lucide-react';

interface WeekTimelineViewProps {
  weekStart: Date;
}

export const WeekTimelineView = ({ weekStart }: WeekTimelineViewProps) => {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return (
    <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Week Timeline - {weekStart.toLocaleDateString()} to {weekEnd.toLocaleDateString()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Week timeline view is temporarily unavailable</p>
        </div>
      </CardContent>
    </Card>
  );
};
