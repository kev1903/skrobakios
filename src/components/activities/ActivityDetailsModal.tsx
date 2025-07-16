import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { ActivityData } from '@/utils/activityUtils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Edit, Eye } from 'lucide-react';

interface ActivityDetailsModalProps {
  activity: ActivityData | null;
  isOpen: boolean;
  onClose: () => void;
  onActivityUpdated: () => void;
}

export const ActivityDetailsModal = ({ 
  activity, 
  isOpen, 
  onClose, 
  onActivityUpdated 
}: ActivityDetailsModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedActivity, setEditedActivity] = useState<Partial<ActivityData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (activity) {
      setEditedActivity({
        name: activity.name,
        description: activity.description || '',
        stage: activity.stage || '4.0 PRELIMINARY',
      });
      setIsEditing(false);
    }
  }, [activity]);

  const handleSave = async () => {
    if (!activity || !editedActivity.name) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('activities')
        .update({
          name: editedActivity.name,
          description: editedActivity.description,
          stage: editedActivity.stage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', activity.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Activity updated successfully",
      });
      
      setIsEditing(false);
      onActivityUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating activity:', error);
      toast({
        title: "Error",
        description: "Failed to update activity",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (activity) {
      setEditedActivity({
        name: activity.name,
        description: activity.description || '',
        stage: activity.stage || '4.0 PRELIMINARY',
      });
    }
    setIsEditing(false);
  };

  if (!activity) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? <Edit className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            {isEditing ? 'Edit Activity' : 'Activity Details'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Activity ID */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Activity ID</Label>
            <div className="text-xs font-mono bg-muted p-2 rounded mt-1">
              {activity.id}
            </div>
          </div>

          {/* Activity Name */}
          <div>
            <Label htmlFor="activity-name">Activity Name</Label>
            {isEditing ? (
              <Input
                id="activity-name"
                value={editedActivity.name || ''}
                onChange={(e) => setEditedActivity(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            ) : (
              <div className="mt-1 p-2 bg-muted rounded text-sm">
                {activity.name}
              </div>
            )}
          </div>

          {/* Stage */}
          <div>
            <Label htmlFor="activity-stage">Stage</Label>
            {isEditing ? (
              <Select 
                value={editedActivity.stage} 
                onValueChange={(value) => setEditedActivity(prev => ({ ...prev, stage: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select project stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4.0 PRELIMINARY">4.0 PRELIMINARY</SelectItem>
                  <SelectItem value="4.1 PRE-CONSTRUCTION">4.1 PRE-CONSTRUCTION</SelectItem>
                  <SelectItem value="5.1 BASE STAGE">5.1 BASE STAGE</SelectItem>
                  <SelectItem value="5.2 FRAME STAGE">5.2 FRAME STAGE</SelectItem>
                  <SelectItem value="5.3 LOCKUP STAGE">5.3 LOCKUP STAGE</SelectItem>
                  <SelectItem value="5.4 FIXING STAGE">5.4 FIXING STAGE</SelectItem>
                  <SelectItem value="5.5 FINALS">5.5 FINALS</SelectItem>
                  <SelectItem value="5.6 LANDSCAPING">5.6 LANDSCAPING</SelectItem>
                  <SelectItem value="6.0 HANDOVER & CLOSEOUT">6.0 HANDOVER & CLOSEOUT</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="mt-1 p-2 bg-muted rounded text-sm">
                {activity.stage || '4.0 PRELIMINARY'}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="activity-description">Description</Label>
            {isEditing ? (
              <Textarea
                id="activity-description"
                value={editedActivity.description || ''}
                onChange={(e) => setEditedActivity(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 min-h-[100px]"
                placeholder="Enter activity description..."
              />
            ) : (
              <div className="mt-1 p-2 bg-muted rounded text-sm min-h-[100px]">
                {activity.description || 'No description provided'}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Level</Label>
              <div className="text-sm mt-1">{activity.level || 0}</div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Expanded</Label>
              <div className="text-sm mt-1">{activity.is_expanded ? 'Yes' : 'No'}</div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Created</Label>
              <div className="text-sm mt-1">
                {activity.created_at ? new Date(activity.created_at).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Updated</Label>
              <div className="text-sm mt-1">
                {activity.updated_at ? new Date(activity.updated_at).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isLoading || !editedActivity.name}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Activity
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};