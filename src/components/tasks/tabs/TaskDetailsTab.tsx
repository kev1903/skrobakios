import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Paperclip, Plus, MessageSquare, Clock } from 'lucide-react';
import { useTaskComments } from '@/hooks/useTaskComments';
import { useTaskActivity } from '@/hooks/useTaskActivity';
import { formatDate } from '@/utils/dateFormat';

interface TaskDetailsTabProps {
  task: any;
  onUpdate: (updates: any) => void;
}

export const TaskDetailsTab = ({ task, onUpdate }: TaskDetailsTabProps) => {
  const [newComment, setNewComment] = useState('');
  const { comments, addComment } = useTaskComments(task.id);
  const { activities } = useTaskActivity(task.id);

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'default';
      case 'in progress': return 'secondary';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      await addComment({
        task_id: task.id,
        user_name: 'Current User', // Replace with actual user name
        comment: newComment,
      });
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge variant={getStatusColor(task.status)}>{task.status || 'Pending'}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Priority:</span>
            <Badge variant={getPriorityColor(task.priority)}>{task.priority || 'Medium'}</Badge>
          </div>
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Progress:</span>
              <span className="text-sm font-medium">{task.progress || 0}%</span>
            </div>
            <Progress value={task.progress || 0} />
          </div>
        </div>
      </Card>

      {/* Description of Works */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Description of Works</h3>
        <Textarea
          value={task.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Enter task description..."
          className="min-h-[120px]"
        />
      </Card>

      {/* Assignee / Reviewer / Observers */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Team Assignments</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="mb-2">Assignee</Label>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarImage src="" />
                <AvatarFallback>{task.assignee?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">{task.assignee || 'Unassigned'}</p>
                <p className="text-xs text-muted-foreground">Primary</p>
              </div>
            </div>
          </div>
          <div>
            <Label className="mb-2">Reviewer</Label>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarImage src="" />
                <AvatarFallback>{task.reviewer?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">{task.reviewer || 'Unassigned'}</p>
                <p className="text-xs text-muted-foreground">Reviewer</p>
              </div>
            </div>
          </div>
          <div>
            <Label className="mb-2">Observers</Label>
            <Button variant="outline" className="w-full h-[58px]">
              <Plus className="h-4 w-4 mr-2" />
              Add Observer
            </Button>
          </div>
        </div>
      </Card>

      {/* Due Date / Duration / Tags */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Schedule & Tags</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={task.endDate || ''}
              onChange={(e) => onUpdate({ endDate: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="duration">Duration</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="duration"
                type="number"
                value={task.duration || ''}
                onChange={(e) => onUpdate({ duration: e.target.value })}
                placeholder="0"
              />
              <Input
                value="days"
                disabled
                className="w-20 bg-muted"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={task.tags?.join(', ') || ''}
              onChange={(e) => onUpdate({ tags: e.target.value.split(',').map(t => t.trim()) })}
              placeholder="Add tags..."
              className="mt-1"
            />
          </div>
        </div>
      </Card>

      {/* General Attachments & Subtasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Attachments</h3>
            <Button variant="outline" size="sm">
              <Paperclip className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {task.attachments?.length > 0 ? (
              task.attachments.map((file: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 p-2 border rounded hover:bg-accent">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm flex-1 truncate">{file.name}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No attachments</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Subtasks</h3>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {task.subtasks?.length > 0 ? (
              task.subtasks.map((subtask: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 p-2 border rounded">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm flex-1">{subtask.name}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No subtasks</p>
            )}
          </div>
        </Card>
      </div>

      {/* Activity Feed + Comments */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Activity Feed & Comments</h3>
        
        {/* Activity List */}
        <div className="space-y-4 mb-6">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-3 pb-4 border-b last:border-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.user_avatar} />
                <AvatarFallback>{activity.user_name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{activity.user_name}</span>
                  <span className="text-xs text-muted-foreground">{activity.action_type}</span>
                  <span className="text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {formatDate(activity.created_at)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{activity.action_description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Comments */}
        <div className="space-y-4 mb-4">
          <h4 className="font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comments ({comments.length})
          </h4>
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 p-3 bg-muted rounded-lg">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.user_avatar} />
                <AvatarFallback>{comment.user_name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{comment.user_name}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
                </div>
                <p className="text-sm">{comment.comment}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Add Comment */}
        <div className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[80px]"
          />
          <Button onClick={handleAddComment} className="self-end">
            Post
          </Button>
        </div>
      </Card>
    </div>
  );
};
