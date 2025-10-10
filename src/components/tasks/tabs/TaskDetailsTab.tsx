import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { WorkflowStatusPipeline } from '../WorkflowStatusPipeline';
import { RoleAssignmentCard } from '../RoleAssignmentCard';

interface TaskDetailsTabProps {
  task: any;
  onUpdate: (updates: any) => void;
}

export const TaskDetailsTab = ({ task, onUpdate }: TaskDetailsTabProps) => {
  return (
    <div className="space-y-6">
      {/* Workflow Pipeline */}
      <WorkflowStatusPipeline
        currentStage={task.workflowStage || 'pending'}
        onStageChange={(stage) => onUpdate({ workflowStage: stage })}
        submittalCount={task.submittalCount || 0}
        approvedCount={task.approvedCount || 0}
      />

      {/* Role Assignments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RoleAssignmentCard
          role="assignee"
          name={task.assignee || 'Unassigned'}
          avatar=""
          status="Active"
        />
        <RoleAssignmentCard
          role="reviewer"
          name={task.reviewer || 'Unassigned'}
          avatar=""
          status="Active"
        />
      </div>

      {/* Task Details Form */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="taskName">Task Name</Label>
            <Input
              id="taskName"
              value={task.taskName || ''}
              onChange={(e) => onUpdate({ taskName: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={task.description || ''}
              onChange={(e) => onUpdate({ description: e.target.value })}
              className="mt-1 min-h-[120px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={task.startDate || ''}
                onChange={(e) => onUpdate({ startDate: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="endDate">Due Date</Label>
              <Input
                id="endDate"
                type="date"
                value={task.endDate || ''}
                onChange={(e) => onUpdate({ endDate: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                value={task.priority || ''}
                onChange={(e) => onUpdate({ priority: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Input
                id="status"
                value={task.status || ''}
                onChange={(e) => onUpdate({ status: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
