import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BulkActivityImportProps {
  projectId: string;
  companyId: string;
  onActivitiesCreated: () => void;
}

const DEFAULT_ACTIVITIES = `Townplanner
Architectural Concept
Site Feature & Re-establishment Survey
Roof Drainage Design
Architectural
Project Estimate
Performance Solution Report
Landscape Designer / Architect
Interior Designer / Interior Documentation
Domestic Building Insurance
Work Protection Insurance
Geotechnical Soil Testing
Engineering
Energy Report
Construction Management Services
Civil Drainage Design
Building Surveying
Permit Levy
CONTINGENCY`;

export const BulkActivityImport = ({ projectId, companyId, onActivitiesCreated }: BulkActivityImportProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activitiesText, setActivitiesText] = useState(DEFAULT_ACTIVITIES);
  const [selectedStage, setSelectedStage] = useState('4.0 PRELIMINARY');
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleBulkImport = async () => {
    if (!activitiesText.trim()) {
      toast({
        title: "Error",
        description: "Please enter activities to import",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);

    try {
      // Parse activities from text (one per line)
      const activityNames = activitiesText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      if (activityNames.length === 0) {
        throw new Error('No valid activities found');
      }

      // Create activity objects
      const activitiesToCreate = activityNames.map(name => ({
        name,
        description: null,
        project_id: projectId,
        company_id: companyId,
        parent_id: null,
        level: 0,
        is_expanded: true,
        stage: selectedStage
      }));

      // Insert activities into database
      const { data, error } = await supabase
        .from('activities')
        .insert(activitiesToCreate)
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully imported ${data.length} activities`
      });

      setIsOpen(false);
      setActivitiesText(DEFAULT_ACTIVITIES);
      onActivitiesCreated();

    } catch (error) {
      console.error('Error importing activities:', error);
      toast({
        title: "Error",
        description: "Failed to import activities",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Bulk Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Import Activities</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="activities">Activities (one per line)</Label>
            <Textarea
              id="activities"
              value={activitiesText}
              onChange={(e) => setActivitiesText(e.target.value)}
              placeholder="Enter activity names, one per line..."
              rows={15}
              className="font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Each line will become a separate activity. Empty lines will be ignored.
            </p>
          </div>
          
          <div>
            <Label htmlFor="stage">Project Stage</Label>
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger>
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
            <p className="text-sm text-muted-foreground mt-2">
              All imported activities will be assigned to this stage.
            </p>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isImporting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleBulkImport} 
              disabled={isImporting || !activitiesText.trim()}
              className="flex items-center gap-2"
            >
              {isImporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span>{isImporting ? 'Importing...' : 'Import Activities'}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};