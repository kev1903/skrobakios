import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Settings, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CentralTaskService } from '@/services/centralTaskService';

interface StageManagementProps {
  projectId: string;
  companyId: string;
  onStageUpdated: () => void;
}

interface Stage {
  name: string;
  taskCount: number;
}

export const StageManagement = ({ projectId, companyId, onStageUpdated }: StageManagementProps) => {
  const [open, setOpen] = useState(false);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newStageName, setNewStageName] = useState('');

  const loadStages = async () => {
    setLoading(true);
    try {
      const { data: tasks, error } = await supabase
        .from('activities')
        .select('stage')
        .eq('project_id', projectId)
        .eq('company_id', companyId);

      if (error) throw error;

      // Group stages and count tasks
      const stageMap = tasks.reduce((acc, task) => {
        const stage = task.stage || 'No Stage';
        acc[stage] = (acc[stage] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const stageList = Object.entries(stageMap).map(([name, taskCount]) => ({
        name,
        taskCount
      })).sort((a, b) => a.name.localeCompare(b.name));

      setStages(stageList);
    } catch (error) {
      console.error('Error loading stages:', error);
      toast.error('Failed to load stages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadStages();
    }
  }, [open, projectId, companyId]);

  const handleAddStage = async () => {
    if (!newStageName.trim()) return;

    try {
      // Add a placeholder task for the new stage
      await CentralTaskService.createTask(projectId, companyId, {
        name: 'New Stage Activity',
        stage: newStageName.trim(),
        budgeted_cost: 0,
        actual_cost: 0,
        description: 'Placeholder activity for new stage'
      });

      setNewStageName('');
      await loadStages();
      onStageUpdated();
      toast.success('Stage added successfully');
    } catch (error) {
      console.error('Error adding stage:', error);
      toast.error('Failed to add stage');
    }
  };

  const handleEditStage = async (oldStageName: string) => {
    if (!editValue.trim() || editValue.trim() === oldStageName) {
      setEditingStage(null);
      setEditValue('');
      return;
    }

    try {
      await CentralTaskService.updateStage(projectId, oldStageName, editValue.trim());
      setEditingStage(null);
      setEditValue('');
      await loadStages();
      onStageUpdated();
      toast.success('Stage updated successfully');
    } catch (error) {
      console.error('Error updating stage:', error);
      toast.error('Failed to update stage');
    }
  };

  const handleDeleteStage = async (stageName: string) => {
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('project_id', projectId)
        .eq('company_id', companyId)
        .eq('stage', stageName);

      if (error) throw error;

      await loadStages();
      onStageUpdated();
      toast.success('Stage and all its activities deleted successfully');
    } catch (error) {
      console.error('Error deleting stage:', error);
      toast.error('Failed to delete stage');
    }
  };

  const startEdit = (stageName: string) => {
    setEditingStage(stageName);
    setEditValue(stageName);
  };

  const cancelEdit = () => {
    setEditingStage(null);
    setEditValue('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 bg-white/10 border-white/20 text-foreground hover:bg-white/20"
        >
          <Settings className="w-4 h-4" />
          Manage Stages
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Manage Project Stages</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Add New Stage */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter new stage name..."
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddStage()}
              className="flex-1"
            />
            <Button onClick={handleAddStage} disabled={!newStageName.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Stage
            </Button>
          </div>

          {/* Stages Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stage Name</TableHead>
                  <TableHead className="text-center">Activities</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      Loading stages...
                    </TableCell>
                  </TableRow>
                ) : stages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No stages found
                    </TableCell>
                  </TableRow>
                ) : (
                  stages.map((stage) => (
                    <TableRow key={stage.name}>
                      <TableCell>
                        {editingStage === stage.name ? (
                          <div className="flex gap-2">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleEditStage(stage.name);
                                if (e.key === 'Escape') cancelEdit();
                              }}
                              className="flex-1"
                              autoFocus
                            />
                            <Button 
                              size="sm" 
                              onClick={() => handleEditStage(stage.name)}
                              className="px-2"
                            >
                              <Save className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={cancelEdit}
                              className="px-2"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <span className="font-medium">{stage.name}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{stage.taskCount}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {editingStage !== stage.name && (
                          <div className="flex gap-1 justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEdit(stage.name)}
                              className="px-2"
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Stage</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete the stage "{stage.name}"? 
                                    This will also delete all {stage.taskCount} activities in this stage. 
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteStage(stage.name)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete Stage
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};