import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, MessageSquare, Clock, Trash2, CalendarIcon, GripVertical, Activity } from 'lucide-react';
import { useTaskComments } from '@/hooks/useTaskComments';
import { useTaskActivity } from '@/hooks/useTaskActivity';
import { formatDate } from '@/utils/dateFormat';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { TeamTaskAssignment } from '@/components/tasks/enhanced/TeamTaskAssignment';

interface TaskDetailsTabProps {
  task: any;
  onUpdate: (updates: any) => void;
  projectId?: string;
}

export const TaskDetailsTab = ({ task, onUpdate, projectId }: TaskDetailsTabProps) => {
  const [newComment, setNewComment] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(
    task.startDate ? new Date(task.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    task.endDate ? new Date(task.endDate) : undefined
  );
  const { comments, addComment } = useTaskComments(task.id);
  const { activities } = useTaskActivity(task.id);

  // Calculate duration when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      onUpdate({ 
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString(),
        duration: diffDays
      });
    }
  }, [startDate, endDate]);

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
  };

  const handlePriorityChange = (priority: string) => {
    onUpdate({ priority });
  };

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

  const handleAddSubtask = () => {
    if (!newSubtaskName.trim()) return;
    
    const currentSubtasks = task.subtasks || [];
    const newSubtask = {
      id: Date.now().toString(),
      name: newSubtaskName,
      completed: false,
      assignedTo: null
    };
    
    // Add new subtask at the end of the array
    onUpdate({ subtasks: [...currentSubtasks, newSubtask] });
    setNewSubtaskName('');
    setIsAddingSubtask(false);
  };

  const handleSubtaskAssigneeChange = (subtaskId: string, assignee: { name: string; avatar: string; userId: string }) => {
    const updatedSubtasks = task.subtasks.map((st: any) =>
      st.id === subtaskId ? { ...st, assignedTo: assignee } : st
    );
    onUpdate({ subtasks: updatedSubtasks });
  };

  const handleToggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks.map((st: any) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    onUpdate({ subtasks: updatedSubtasks });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks.filter((st: any) => st.id !== subtaskId);
    onUpdate({ subtasks: updatedSubtasks });
  };

  const handleSubtaskDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(task.subtasks || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    onUpdate({ subtasks: items });
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
      {/* Header Summary - Minimalist Single Row */}
      <div className="bg-white rounded-2xl border border-border/30 p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-6 flex-nowrap overflow-x-auto">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-muted-foreground">Status</span>
            <Badge className={`${getStatusColor(task.status)} font-medium text-xs px-2.5 py-0.5`}>{task.status || 'Not Started'}</Badge>
          </div>
          
          <div className="h-8 w-px bg-border/50" />
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-muted-foreground">Priority</span>
            <Select value={task.priority || 'Medium'} onValueChange={handlePriorityChange}>
              <SelectTrigger className={cn("h-8 w-[110px] text-xs", getPriorityColor(task.priority))}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High" className="text-xs">
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-rose-500 mr-2"></span>
                    High
                  </span>
                </SelectItem>
                <SelectItem value="Medium" className="text-xs">
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
                    Medium
                  </span>
                </SelectItem>
                <SelectItem value="Low" className="text-xs">
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                    Low
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="h-8 w-px bg-border/50" />
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-muted-foreground">Progress</span>
            <span className="text-sm font-semibold text-foreground">{task.progress || 0}%</span>
          </div>
          
          <div className="h-8 w-px bg-border/50" />
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-muted-foreground">Assignee</span>
            <TeamTaskAssignment
              projectId={projectId || task.project_id}
              currentAssignee={task.assignedTo}
              onAssigneeChange={(assignee) => onUpdate({ assignedTo: assignee })}
              className="h-8"
            />
          </div>
          
          <div className="h-8 w-px bg-border/50" />
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-muted-foreground">Start Date</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 px-2 justify-start text-left font-normal border-border/30",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                  <span className="text-xs">{startDate ? format(startDate, "MMM d") : "Pick date"}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={handleStartDateChange}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="h-8 w-px bg-border/50" />
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-muted-foreground">End Date</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 px-2 justify-start text-left font-normal border-border/30",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                  <span className="text-xs">{endDate ? format(endDate, "MMM d") : "Pick date"}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={handleEndDateChange}
                  disabled={(date) => startDate ? date < startDate : false}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="h-8 w-px bg-border/50" />
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-muted-foreground">Duration</span>
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-foreground">{task.duration || 0}</span>
              <span className="text-xs text-muted-foreground">days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scope of Works & Subtasks - Two Column Layout */}
      <div className="bg-white rounded-2xl border border-border/30 p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 divide-x divide-border/30">
          {/* Left Column - Scope of Works */}
          <div className="pr-6">
            <h3 className="text-base font-semibold mb-4 text-foreground">Scope of Works</h3>
            <Textarea
              value={task.description || ''}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Enter task description..."
              className="min-h-[300px] resize-none bg-slate-50/50 border-border/30"
            />
          </div>

          {/* Right Column - Subtasks */}
          <div className="lg:pl-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground">Subtasks</h3>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-border/50 hover:bg-luxury-gold/10 hover:border-luxury-gold/50"
                onClick={() => setIsAddingSubtask(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            <DragDropContext onDragEnd={handleSubtaskDragEnd}>
              <div className="space-y-2">
                {isAddingSubtask && (
                  <div className="flex items-center gap-2 p-3 border border-luxury-gold/30 rounded-xl bg-luxury-gold/5">
                    <Input
                      value={newSubtaskName}
                      onChange={(e) => setNewSubtaskName(e.target.value)}
                      placeholder="Enter subtask name..."
                      className="flex-1 border-border/30 bg-white"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddSubtask();
                        if (e.key === 'Escape') {
                          setIsAddingSubtask(false);
                          setNewSubtaskName('');
                        }
                      }}
                    />
                    <Button 
                      size="sm" 
                      onClick={handleAddSubtask}
                      className="bg-luxury-gold text-white hover:bg-luxury-gold-dark"
                    >
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        setIsAddingSubtask(false);
                        setNewSubtaskName('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                {task.subtasks?.length > 0 ? (
                  <Droppable droppableId="subtasks">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
                      >
                        {task.subtasks.map((subtask: any, index: number) => (
                          <Draggable key={subtask.id} draggableId={subtask.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`flex items-center gap-3 p-3 border border-border/30 rounded-xl hover:bg-slate-50 transition-colors group ${
                                  snapshot.isDragging ? 'shadow-lg bg-white' : ''
                                }`}
                              >
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                                >
                                  <GripVertical className="h-4 w-4" />
                                </div>
                                <input 
                                  type="checkbox" 
                                  checked={subtask.completed || false}
                                  onChange={() => handleToggleSubtask(subtask.id)}
                                  className="rounded" 
                                />
                                <span className={`text-sm flex-1 font-medium ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                                  {subtask.name}
                                </span>
                                <TeamTaskAssignment
                                  projectId={projectId || task.project_id}
                                  currentAssignee={subtask.assignedTo}
                                  onAssigneeChange={(assignee) => handleSubtaskAssigneeChange(subtask.id, assignee)}
                                  className="h-7 w-auto min-w-[140px] text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteSubtask(subtask.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                ) : (
                  !isAddingSubtask && <p className="text-sm text-muted-foreground text-center py-4">No subtasks</p>
                )}
              </div>
            </DragDropContext>
          </div>
        </div>
      </div>

      {/* Activity & Comments Tabs */}
      <div className="bg-white rounded-2xl border border-border/30 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <Tabs defaultValue="activity" className="w-full">
          <div className="px-6 pt-6">
            <TabsList className="inline-flex h-9 items-center justify-start bg-muted/30 p-1 rounded-md">
              <TabsTrigger value="activity" className="flex items-center gap-2 text-xs">
                <Activity className="h-3.5 w-3.5" />
                <span>Activity</span>
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center gap-2 text-xs">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Comments ({comments.length})</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="activity" className="px-6 pb-6 pt-4 mt-0">
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity) => (
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
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No activity yet</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="comments" className="px-6 pb-6 pt-4 mt-0">
            <div className="space-y-4 mb-5">
              {comments.length > 0 ? (
                comments.map((comment) => (
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
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No comments yet</p>
              )}
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
