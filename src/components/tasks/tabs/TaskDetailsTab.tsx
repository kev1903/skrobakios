import React, { useState } from 'react';
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
      case 'high': return 'bg-rose-50/80 text-rose-700 border border-rose-200/50 backdrop-blur-sm';
      case 'medium': return 'bg-amber-50/80 text-amber-700 border border-amber-200/50 backdrop-blur-sm';
      case 'low': return 'bg-emerald-50/80 text-emerald-700 border border-emerald-200/50 backdrop-blur-sm';
      default: return 'bg-slate-50/80 text-slate-700 border border-slate-200/50 backdrop-blur-sm';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-emerald-50/80 text-emerald-700 border border-emerald-200/50 backdrop-blur-sm';
      case 'in progress': return 'bg-blue-50/80 text-blue-700 border border-blue-200/50 backdrop-blur-sm';
      case 'pending': return 'bg-amber-50/80 text-amber-700 border border-amber-200/50 backdrop-blur-sm';
      case 'not started': return 'bg-slate-50/80 text-slate-700 border border-slate-200/50 backdrop-blur-sm';
      default: return 'bg-slate-50/80 text-slate-700 border border-slate-200/50 backdrop-blur-sm';
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
      {/* Header Summary - Luxury Compact Card */}
      <div className="bg-white rounded-2xl border border-border/30 p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-8 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Status</span>
            <Badge className={`${getStatusColor(task.status)} font-medium text-xs px-3 py-1`}>{task.status || 'Not Started'}</Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Priority</span>
            <Badge className={`${getPriorityColor(task.priority)} font-medium text-xs px-3 py-1`}>{task.priority || 'Medium'}</Badge>
          </div>
          <div className="flex-1 min-w-[280px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Progress</span>
              <span className="text-sm font-semibold text-foreground">{task.progress || 0}%</span>
            </div>
            <Progress value={task.progress || 0} className="h-2.5 bg-slate-100" />
          </div>
        </div>
      </div>

      {/* Scope of Works */}
      <div className="bg-white rounded-2xl border border-border/30 p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <h3 className="text-base font-semibold mb-4 text-foreground">Scope of Works</h3>
        <Textarea
          value={task.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Enter task description..."
          className="min-h-[100px] resize-none bg-slate-50/50 border-border/30"
        />
        
        {/* Subtasks */}
        <div className="mt-6 pt-6 border-t border-border/30">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-foreground">Subtasks</h4>
            <Button variant="outline" size="sm" className="border-border/50 hover:bg-luxury-gold/10 hover:border-luxury-gold/50">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {task.subtasks?.length > 0 ? (
              task.subtasks.map((subtask: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-3 border border-border/30 rounded-xl hover:bg-slate-50 transition-colors">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm flex-1 font-medium">{subtask.name}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No subtasks</p>
            )}
          </div>
        </div>
      </div>

      {/* Assignee / Reviewer / Observers */}
      <div className="bg-white rounded-2xl border border-border/30 p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <h3 className="text-base font-semibold mb-5 text-foreground">Team Assignments</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <Label className="mb-3 text-sm font-medium text-muted-foreground block">Assignee</Label>
            <div className="flex items-center gap-3 p-3 border border-border/30 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <Avatar className="h-9 w-9">
                <AvatarImage src={task.assignedTo?.avatar || ''} />
                <AvatarFallback className="text-sm bg-luxury-gold/20 text-luxury-gold-dark">
                  {task.assignedTo?.name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium truncate">
                {task.assignedTo?.name || 'Unassigned'}
              </span>
            </div>
          </div>
          <div>
            <Label className="mb-3 text-sm font-medium text-muted-foreground block">Reviewer</Label>
            <div className="flex items-center gap-3 p-3 border border-border/30 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <Avatar className="h-9 w-9">
                <AvatarImage src={task.reviewer?.avatar || ''} />
                <AvatarFallback className="text-sm bg-luxury-gold/20 text-luxury-gold-dark">
                  {task.reviewer?.name?.[0]?.toUpperCase() || 'R'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium truncate">
                {task.reviewer?.name || 'Unassigned'}
              </span>
            </div>
          </div>
          <div>
            <Label className="mb-3 text-sm font-medium text-muted-foreground block">Observers</Label>
            <Button variant="outline" className="w-full h-[54px] bg-slate-50/50 border-border/30 hover:bg-luxury-gold/10 hover:border-luxury-gold/50">
              <Plus className="h-4 w-4 mr-2" />
              Add Observer
            </Button>
          </div>
        </div>
      </div>

      {/* Due Date / Duration / Tags */}
      <div className="bg-white rounded-2xl border border-border/30 p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <h3 className="text-base font-semibold mb-5 text-foreground">Schedule & Tags</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <Label htmlFor="dueDate" className="text-sm font-medium text-muted-foreground">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={task.endDate || ''}
              onChange={(e) => onUpdate({ endDate: e.target.value })}
              className="mt-2 bg-slate-50/50 border-border/30"
            />
          </div>
          <div>
            <Label htmlFor="duration" className="text-sm font-medium text-muted-foreground">Duration</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="duration"
                type="number"
                value={task.duration || ''}
                onChange={(e) => onUpdate({ duration: e.target.value })}
                placeholder="0"
                className="flex-1 bg-slate-50/50 border-border/30"
              />
              <Input
                value="days"
                disabled
                className="w-20 bg-muted/50"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="tags" className="text-sm font-medium text-muted-foreground">Tags</Label>
            <Input
              id="tags"
              value={task.tags?.join(', ') || ''}
              onChange={(e) => onUpdate({ tags: e.target.value.split(',').map(t => t.trim()) })}
              placeholder="Add tags..."
              className="mt-2 bg-slate-50/50 border-border/30"
            />
          </div>
        </div>
      </div>

      {/* Attachments */}
      <div className="bg-white rounded-2xl border border-border/30 p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-foreground">Attachments</h3>
          <Button variant="outline" size="sm" className="border-border/50 hover:bg-luxury-gold/10 hover:border-luxury-gold/50">
            <Paperclip className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
        <div className="space-y-2">
          {task.attachments?.length > 0 ? (
            task.attachments.map((file: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3 p-3 border border-border/30 rounded-xl hover:bg-slate-50 transition-colors">
                <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm flex-1 truncate font-medium">{file.name}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No attachments</p>
          )}
        </div>
      </div>

      {/* Activity Feed + Comments */}
      <div className="bg-white rounded-2xl border border-border/30 p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <h3 className="text-base font-semibold mb-5 text-foreground">Activity Feed & Comments</h3>
        
        {/* Activity List */}
        <div className="space-y-4 mb-6">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-3 pb-4 border-b last:border-0">
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarImage src={activity.user_avatar} />
                <AvatarFallback className="text-sm bg-luxury-gold/20 text-luxury-gold-dark">{activity.user_name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-semibold">{activity.user_name}</span>
                  <span className="text-xs text-muted-foreground">{activity.action_type}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(activity.created_at)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{activity.action_description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Comments */}
        <div className="space-y-4 mb-5">
          <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <MessageSquare className="h-4 w-4" />
            Comments ({comments.length})
          </h4>
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 p-4 bg-slate-50/50 rounded-xl border border-border/20">
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarImage src={comment.user_avatar} />
                <AvatarFallback className="text-sm bg-luxury-gold/20 text-luxury-gold-dark">{comment.user_name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold">{comment.user_name}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
                </div>
                <p className="text-sm text-foreground">{comment.comment}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Add Comment */}
        <div className="flex gap-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[80px] resize-none bg-slate-50/50 border-border/30"
          />
          <Button 
            onClick={handleAddComment} 
            className="self-end bg-luxury-gold text-white hover:bg-luxury-gold-dark"
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
};
