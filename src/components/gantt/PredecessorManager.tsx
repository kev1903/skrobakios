import React, { useState } from 'react';
import { Plus, X, Calendar, Clock } from 'lucide-react';
import { GanttTask, TaskDependency, DependencyType } from '@/types/gantt';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface PredecessorManagerProps {
  task: GanttTask;
  allTasks: GanttTask[];
  onUpdatePredecessors: (taskId: string, predecessors: TaskDependency[]) => void;
}

const dependencyTypeLabels: Record<DependencyType, string> = {
  'FS': 'Finish to Start',
  'SS': 'Start to Start', 
  'FF': 'Finish to Finish',
  'SF': 'Start to Finish'
};

const dependencyTypeDescriptions: Record<DependencyType, string> = {
  'FS': 'This task starts when predecessor finishes',
  'SS': 'This task starts when predecessor starts',
  'FF': 'This task finishes when predecessor finishes', 
  'SF': 'This task finishes when predecessor starts'
};

export const PredecessorManager: React.FC<PredecessorManagerProps> = ({
  task,
  allTasks,
  onUpdatePredecessors
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newPredecessor, setNewPredecessor] = useState({
    predecessorId: '',
    type: 'FS' as DependencyType,
    lag: 0
  });

  const currentPredecessors = task.predecessors || [];
  
  // Get available tasks that can be predecessors (exclude self and descendants)
  const availableTasks = allTasks.filter(t => 
    t.id !== task.id && 
    t.category === 'Element' && // Only Elements can have predecessors
    !currentPredecessors.some(p => p.predecessorId === t.id)
  );

  const handleAddPredecessor = () => {
    if (!newPredecessor.predecessorId) return;
    
    const updatedPredecessors = [
      ...currentPredecessors,
      {
        predecessorId: newPredecessor.predecessorId,
        type: newPredecessor.type,
        lag: newPredecessor.lag || 0
      }
    ];
    
    onUpdatePredecessors(task.id, updatedPredecessors);
    
    setNewPredecessor({
      predecessorId: '',
      type: 'FS',
      lag: 0
    });
  };

  const handleRemovePredecessor = (predecessorId: string) => {
    const updatedPredecessors = currentPredecessors.filter(p => p.predecessorId !== predecessorId);
    onUpdatePredecessors(task.id, updatedPredecessors);
  };

  const getPredecessorTask = (predecessorId: string) => {
    return allTasks.find(t => t.id === predecessorId);
  };

  const getDependencyBadgeVariant = (type: DependencyType) => {
    switch (type) {
      case 'FS': return 'default';
      case 'SS': return 'secondary';
      case 'FF': return 'outline';
      case 'SF': return 'destructive';
      default: return 'default';
    }
  };

  // Only show for Elements
  if (task.category !== 'Element') {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 px-2 text-xs hover:bg-transparent"
          title="Manage Predecessors"
        >
          <Calendar className="w-3 h-3 mr-1" />
          {currentPredecessors.length > 0 ? `${currentPredecessors.length} deps` : 'Add deps'}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Manage Predecessors for {task.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Predecessors */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Current Predecessors</Label>
            {currentPredecessors.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
                No predecessors defined. This task can start at any time.
              </div>
            ) : (
              <div className="space-y-2">
                {currentPredecessors.map((dep) => {
                  const predecessorTask = getPredecessorTask(dep.predecessorId);
                  return (
                    <div
                      key={dep.predecessorId}
                      className="flex items-center justify-between p-3 border rounded-lg bg-muted/20"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium text-sm">
                            {predecessorTask?.wbs || predecessorTask?.id} - {predecessorTask?.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {dependencyTypeDescriptions[dep.type]}
                          </div>
                        </div>
                        <Badge variant={getDependencyBadgeVariant(dep.type)} className="text-xs">
                          {dep.type}
                        </Badge>
                        {dep.lag !== 0 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {dep.lag > 0 ? `+${dep.lag}d` : `${dep.lag}d`}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePredecessor(dep.predecessorId)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add New Predecessor */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Add New Predecessor</Label>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Predecessor Task</Label>
                <Select 
                  value={newPredecessor.predecessorId} 
                  onValueChange={(value) => setNewPredecessor(prev => ({ ...prev, predecessorId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a task..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTasks.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.wbs || t.id} - {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Dependency Type</Label>
                <Select 
                  value={newPredecessor.type} 
                  onValueChange={(value: DependencyType) => setNewPredecessor(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(dependencyTypeLabels).map(([type, label]) => (
                      <SelectItem key={type} value={type}>
                        <div>
                          <div className="font-medium">{type} - {label}</div>
                          <div className="text-xs text-muted-foreground">
                            {dependencyTypeDescriptions[type as DependencyType]}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Lag Time (days)</Label>
                <Input
                  type="number"
                  value={newPredecessor.lag}
                  onChange={(e) => setNewPredecessor(prev => ({ ...prev, lag: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  Positive values add delay, negative values add lead time
                </div>
              </div>

              <Button 
                onClick={handleAddPredecessor}
                disabled={!newPredecessor.predecessorId}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Predecessor
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};