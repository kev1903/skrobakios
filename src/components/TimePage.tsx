import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, Timer, TrendingUp, Home } from 'lucide-react';

interface TimePageProps {
  onNavigate?: (page: string) => void;
}

export const TimePage = ({ onNavigate }: TimePageProps) => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Clock className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Time Management</h1>
        </div>
        <Button
          onClick={() => onNavigate?.('home')}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Timer className="w-5 h-5" />
              <span>Time Tracking</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Track time spent on various activities and projects.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Schedule</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">View and manage your schedule and appointments.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Productivity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Analyze your productivity patterns and trends.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};