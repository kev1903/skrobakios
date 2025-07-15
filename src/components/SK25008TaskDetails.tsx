import React, { useState } from 'react';
import { X, Edit3, Save, AlertTriangle, FileText, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Task {
  id: string;
  task_name: string;
  task_type: string;
  status: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  progress_percentage: number;
  description: string;
  requirements: string;
  compliance_notes: string;
  client_feedback?: string;
  design_files: any;
}

interface SK25008TaskDetailsProps {
  task: Task;
  onClose: () => void;
  onUpdate: () => void;
}

export const SK25008TaskDetails: React.FC<SK25008TaskDetailsProps> = ({ 
  task, 
  onClose, 
  onUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState(task.client_feedback || '');
  const [progress, setProgress] = useState(task.progress_percentage);
  const [status, setStatus] = useState(task.status);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('sk_25008_design')
        .update({
          client_feedback: feedback,
          progress_percentage: progress,
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id);

      if (error) throw error;

      toast({
        title: "Task Updated",
        description: "Task details have been saved successfully",
      });

      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Update Failed",
        description: "Could not save task details",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'text-green-600 bg-green-50';
      case 'in-progress':
        return 'text-blue-600 bg-blue-50';
      case 'delayed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl">{task.task_name}</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="h-4 w-4 mr-1" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status and Progress */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              {isEditing ? (
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full mt-1 p-2 border rounded"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="complete">Complete</option>
                  <option value="delayed">Delayed</option>
                </select>
              ) : (
                <div className={`mt-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                  {status.replace('-', ' ').toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Progress</label>
              {isEditing ? (
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full mt-1"
                />
              ) : (
                <div className="mt-1">
                  <Progress value={progress} className="w-full" />
                  <span className="text-sm text-muted-foreground">{progress}%</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Duration</label>
              <div className="mt-1 flex items-center text-sm">
                <Clock className="h-4 w-4 mr-1" />
                {task.duration_days} days
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-3">Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Start Date:</span>
                <div className="text-muted-foreground">{formatDate(task.start_date)}</div>
              </div>
              <div>
                <span className="font-medium">End Date:</span>
                <div className="text-muted-foreground">{formatDate(task.end_date)}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
              {task.description}
            </p>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="font-medium mb-2">Requirements</h3>
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded whitespace-pre-wrap">
              {task.requirements}
            </div>
          </div>

          {/* Compliance Notes */}
          <div className="border-l-4 border-orange-500 pl-4">
            <h3 className="font-medium mb-2 flex items-center text-orange-700">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Compliance Notes
            </h3>
            <p className="text-sm text-orange-600">
              {task.compliance_notes}
            </p>
          </div>

          {/* Client Feedback */}
          <div>
            <h3 className="font-medium mb-2">Client Feedback</h3>
            {isEditing ? (
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Add client feedback, notes, or comments..."
                className="w-full"
                rows={4}
              />
            ) : (
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded min-h-[100px]">
                {feedback || 'No client feedback provided yet.'}
              </div>
            )}
          </div>

          {/* Design Files */}
          <div>
            <h3 className="font-medium mb-2 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Design Files
            </h3>
            {task.design_files && task.design_files.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {task.design_files.map((file: any, index: number) => (
                  <div key={index} className="border rounded p-2 text-sm">
                    <FileText className="h-6 w-6 mb-1" />
                    <div className="truncate">{file.name || `File ${index + 1}`}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No files uploaded yet</p>
            )}
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};