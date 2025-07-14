import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Play, 
  Check,
  MoreVertical,
  Edit
} from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';
import { Milestone } from '../tasks/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MilestoneCardProps {
  milestone: Milestone;
  onUpdate: (milestoneId: string, updates: { status?: string; progress?: number }) => void;
}

export const MilestoneCard = ({ milestone, onUpdate }: MilestoneCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'In Progress':
        return <Play className="w-4 h-4 text-blue-600" />;
      case 'Overdue':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDaysUntilDue = () => {
    const now = new Date();
    const dueDate = new Date(milestone.dueDate);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    const progress = newStatus === 'Completed' ? 100 : 
                    newStatus === 'In Progress' ? Math.max(milestone.progress, 25) : 
                    milestone.progress;
    
    await onUpdate(milestone.id, { status: newStatus, progress });
    setIsUpdating(false);
  };

  const daysUntilDue = getDaysUntilDue();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {getStatusIcon(milestone.status)}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold truncate">
                {milestone.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {milestone.projectName}
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Edit Milestone
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {milestone.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {milestone.description}
          </p>
        )}

        {/* Status and Priority Badges */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={getStatusColor(milestone.status)}>
            {milestone.status}
          </Badge>
          <Badge variant="outline" className={getPriorityColor(milestone.priority)}>
            {milestone.priority}
          </Badge>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{milestone.progress}%</span>
          </div>
          <Progress value={milestone.progress} className="h-2" />
        </div>

        {/* Due Date */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Due:</span>
            <span className={daysUntilDue < 0 ? 'text-red-600 font-medium' : 'text-foreground'}>
              {format(new Date(milestone.dueDate), 'MMM dd, yyyy')}
            </span>
          </div>
          
          {daysUntilDue >= 0 && milestone.status !== 'Completed' && (
            <span className="text-xs text-muted-foreground">
              {daysUntilDue === 0 ? 'Due today' : `${daysUntilDue} days left`}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          {milestone.status === 'Pending' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange('In Progress')}
              disabled={isUpdating}
              className="flex-1"
            >
              <Play className="w-4 h-4 mr-1" />
              Start
            </Button>
          )}
          
          {milestone.status !== 'Completed' && (
            <Button
              size="sm"
              onClick={() => handleStatusChange('Completed')}
              disabled={isUpdating}
              className="flex-1"
            >
              <Check className="w-4 h-4 mr-1" />
              Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};