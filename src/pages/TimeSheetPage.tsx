
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Clock, Calendar } from 'lucide-react';

const TimeSheetPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Time Sheet</h1>
          <p className="text-muted-foreground">
            Track and manage your work hours
          </p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {/* Empty State */}
      <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardContent className="p-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No time entries found</h3>
              <p className="text-muted-foreground">Start tracking your time to see entries here</p>
            </div>
            <Button className="bg-gradient-primary hover:opacity-90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create First Entry
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeSheetPage;
