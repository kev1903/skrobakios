import React, { useState } from 'react';
import { GanttMilestone } from './GanttChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit2, Trash2, Calendar as CalendarIcon, Flag, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface MilestoneManagerProps {
  milestones: GanttMilestone[];
  onMilestoneUpdate: (milestones: GanttMilestone[]) => void;
  projectId: string;
}

export const MilestoneManager = ({
  milestones,
  onMilestoneUpdate,
  projectId
}: MilestoneManagerProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newMilestone, setNewMilestone] = useState<Partial<GanttMilestone>>({
    name: '',
    description: '',
    date: new Date(),
    status: 'upcoming'
  });

  const handleAdd = () => {
    if (!newMilestone.name || !newMilestone.date) return;

    const milestone: GanttMilestone = {
      id: `milestone-${Date.now()}`,
      name: newMilestone.name,
      description: newMilestone.description,
      date: newMilestone.date,
      status: newMilestone.status as 'upcoming' | 'completed' | 'overdue'
    };

    onMilestoneUpdate([...milestones, milestone]);
    setNewMilestone({
      name: '',
      description: '',
      date: new Date(),
      status: 'upcoming'
    });
    setIsAdding(false);
  };

  const handleUpdate = (id: string, updates: Partial<GanttMilestone>) => {
    const updated = milestones.map(m => 
      m.id === id ? { ...m, ...updates } : m
    );
    onMilestoneUpdate(updated);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    const filtered = milestones.filter(m => m.id !== id);
    onMilestoneUpdate(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500 text-white';
      case 'overdue': return 'bg-red-500 text-white';
      case 'upcoming': return 'bg-blue-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'overdue': return <Flag className="w-4 h-4" />;
      case 'upcoming': return <CalendarIcon className="w-4 h-4" />;
      default: return <CalendarIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Project Milestones</h3>
          <p className="text-sm text-muted-foreground">
            Manage key project milestones and deliverables
          </p>
        </div>
        
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="w-4 h-4 mr-2" />
          Add Milestone
        </Button>
      </div>

      {/* Add New Milestone Form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add New Milestone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="milestone-name">Milestone Name</Label>
                <Input
                  id="milestone-name"
                  placeholder="Enter milestone name"
                  value={newMilestone.name}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newMilestone.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newMilestone.date ? format(newMilestone.date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newMilestone.date}
                      onSelect={(date) => setNewMilestone(prev => ({ ...prev, date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="milestone-description">Description</Label>
              <Textarea
                id="milestone-description"
                placeholder="Describe the milestone deliverable"
                value={newMilestone.description}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={newMilestone.status} 
                onValueChange={(value) => setNewMilestone(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={!newMilestone.name || !newMilestone.date}>
                Add Milestone
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Milestone List */}
      <div className="space-y-3">
        {milestones.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Flag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Milestones Yet</h3>
              <p className="text-muted-foreground mb-4">
                Add milestones to track important project deliverables and deadlines
              </p>
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Milestone
              </Button>
            </CardContent>
          </Card>
        ) : (
          milestones
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map((milestone) => (
              <Card key={milestone.id}>
                <CardContent className="p-4">
                  {editingId === milestone.id ? (
                    <div className="space-y-4">
                      <Input
                        defaultValue={milestone.name}
                        onBlur={(e) => handleUpdate(milestone.id, { name: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdate(milestone.id, { name: e.currentTarget.value });
                          }
                        }}
                      />
                      
                      <Textarea
                        defaultValue={milestone.description}
                        onBlur={(e) => handleUpdate(milestone.id, { description: e.target.value })}
                        placeholder="Milestone description"
                      />
                      
                      <div className="flex gap-2">
                        <Select 
                          value={milestone.status} 
                          onValueChange={(value) => handleUpdate(milestone.id, { status: value as any })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button size="sm" onClick={() => setEditingId(null)}>
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(milestone.status)}
                          <h4 className="font-medium">{milestone.name}</h4>
                          <Badge className={getStatusColor(milestone.status)}>
                            {milestone.status}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            Due: {format(milestone.date, 'PPP')}
                          </div>
                        </div>
                        
                        {milestone.description && (
                          <p className="text-sm text-muted-foreground">
                            {milestone.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(milestone.id)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(milestone.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </div>
  );
};