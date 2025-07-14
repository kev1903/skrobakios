import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Activity, Target, TrendingUp, Home } from 'lucide-react';

interface WellnessPageProps {
  onNavigate?: (page: string) => void;
}

export const WellnessPage = ({ onNavigate }: WellnessPageProps) => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Heart className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Wellness</h1>
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
              <Activity className="w-5 h-5" />
              <span>Health Tracking</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Monitor your health metrics and vital signs.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Fitness Goals</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Set and track your fitness and wellness goals.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Progress Tracking</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">View your wellness progress over time.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};