import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Play, 
  Check 
} from 'lucide-react';
import { format } from 'date-fns';
import { Milestone } from '../tasks/types';

interface MilestoneTimelineProps {
  milestones: Milestone[];
  onMilestoneUpdate: (milestoneId: string, updates: { status?: string; progress?: number }) => void;
}

export const MilestoneTimeline = ({ milestones, onMilestoneUpdate }: MilestoneTimelineProps) => {
  const sortedMilestones = [...milestones].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'In Progress':
        return <Play className="w-5 h-5 text-blue-600" />;
      case 'Overdue':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConnectorColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-500';
      case 'In Progress':
        return 'bg-blue-500';
      case 'Overdue':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>
      
      <div className="space-y-6">
        {sortedMilestones.map((milestone, index) => (
          <div key={milestone.id} className="relative flex items-start space-x-4">
            {/* Timeline marker */}
            <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full border-4 border-background flex items-center justify-center ${getConnectorColor(milestone.status)}`}>
              {getStatusIcon(milestone.status)}
            </div>
            
            {/* Milestone card */}
            <Card className="flex-1">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {milestone.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {milestone.projectName}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getStatusColor(milestone.status)}>
                      {milestone.status}
                    </Badge>
                  </div>
                </div>

                {milestone.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {milestone.description}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Due:</span>
                      <span className="text-foreground font-medium">
                        {format(new Date(milestone.dueDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{milestone.progress}%</span>
                    </div>
                    <Progress value={milestone.progress} className="h-2" />
                  </div>
                </div>

                {milestone.status !== 'Completed' && (
                  <div className="flex space-x-2">
                    {milestone.status === 'Pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onMilestoneUpdate(milestone.id, { status: 'In Progress' })}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      onClick={() => onMilestoneUpdate(milestone.id, { status: 'Completed', progress: 100 })}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Complete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};