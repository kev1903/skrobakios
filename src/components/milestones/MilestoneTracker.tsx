import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, CheckCircle, Clock, AlertTriangle, Filter, Plus, Target } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Milestone } from '../tasks/types';
import { MilestoneCard } from './MilestoneCard';
import { MilestoneTimeline } from './MilestoneTimeline';
import { MilestoneStats } from './MilestoneStats';
import { MilestoneFilters } from './MilestoneFilters';

interface MilestoneTrackerProps {
  projectId?: string;
  onNavigate: (page: string) => void;
}

export const MilestoneTracker = ({ projectId, onNavigate }: MilestoneTrackerProps) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed' | 'overdue'>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchMilestones();
  }, [projectId]);

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('tasks')
        .select(`
          *,
          projects!inner (
            id,
            name,
            project_id
          )
        `)
        .eq('is_milestone', true)
        .order('due_date', { ascending: true });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Map database tasks to milestone interface
      const mappedMilestones: Milestone[] = (data || []).map(task => {
        const now = new Date();
        const dueDate = new Date(task.due_date);
        let status: Milestone['status'] = task.status === 'Completed' ? 'Completed' : 
                                        task.status === 'In Progress' ? 'In Progress' : 'Pending';
        
        // Check if overdue
        if (status !== 'Completed' && dueDate < now) {
          status = 'Overdue';
        }

        return {
          id: task.id,
          name: task.task_name,
          description: task.description,
          dueDate: task.due_date || '',
          status,
          progress: task.progress,
          priority: task.priority as 'High' | 'Medium' | 'Low',
          project_id: task.project_id,
          projectName: task.projects?.name || 'Unknown Project',
          dependencies: [], // This could be enhanced with actual dependency tracking
          completedDate: task.status === 'Completed' ? task.updated_at : undefined,
          created_at: task.created_at,
          updated_at: task.updated_at
        };
      });

      setMilestones(mappedMilestones);
    } catch (error) {
      console.error('Error fetching milestones:', error);
      toast({
        title: "Error",
        description: "Failed to load milestones. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredMilestones = () => {
    if (filter === 'all') return milestones;
    return milestones.filter(milestone => {
      switch (filter) {
        case 'pending':
          return milestone.status === 'Pending';
        case 'in-progress':
          return milestone.status === 'In Progress';
        case 'completed':
          return milestone.status === 'Completed';
        case 'overdue':
          return milestone.status === 'Overdue';
        default:
          return true;
      }
    });
  };

  const handleMilestoneUpdate = async (milestoneId: string, updates: { status?: string; progress?: number }) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: updates.status,
          progress: updates.progress,
          updated_at: new Date().toISOString()
        })
        .eq('id', milestoneId);

      if (error) throw error;

      await fetchMilestones();
      
      toast({
        title: "Milestone updated",
        description: "The milestone has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast({
        title: "Error",
        description: "Failed to update milestone. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredMilestones = getFilteredMilestones();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Target className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Milestone Tracker</h1>
            <p className="text-muted-foreground">
              Track and manage project milestones
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'timeline' : 'grid')}
          >
            {viewMode === 'grid' ? 'Timeline View' : 'Grid View'}
          </Button>
          
          <Button onClick={() => onNavigate('projects')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Milestone
          </Button>
        </div>
      </div>

      {/* Stats */}
      <MilestoneStats milestones={milestones} />

      {/* Filters */}
      <MilestoneFilters 
        currentFilter={filter}
        onFilterChange={setFilter}
        milestones={milestones}
      />

      {/* Content */}
      {filteredMilestones.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No milestones found</h3>
            <p className="text-muted-foreground mb-4">
              {filter === 'all' 
                ? "Start by creating your first milestone to track project progress." 
                : `No milestones match the current filter: ${filter}`}
            </p>
            <Button onClick={() => onNavigate('projects')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Milestone
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'timeline' ? (
        <MilestoneTimeline 
          milestones={filteredMilestones}
          onMilestoneUpdate={handleMilestoneUpdate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMilestones.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              onUpdate={handleMilestoneUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};