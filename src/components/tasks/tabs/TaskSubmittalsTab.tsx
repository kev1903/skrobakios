import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Upload, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TaskSubmittalsTabProps {
  taskId: string;
}

const workflowStages = [
  { id: 'draft', label: 'Draft', icon: FileText },
  { id: 'submitted', label: 'Submitted', icon: Upload },
  { id: 'under_review', label: 'Under Review', icon: Clock },
  { id: 'approved', label: 'Approved', icon: CheckCircle2 },
];

export const TaskSubmittalsTab = ({ taskId }: TaskSubmittalsTabProps) => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  const { data: submittals, isLoading } = useQuery({
    queryKey: ['task-submittals', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_submittals')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "outline", className: string }> = {
      pending: { variant: "secondary", className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" },
      in_review: { variant: "secondary", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
      approved: { variant: "secondary", className: "bg-green-500/10 text-green-600 dark:text-green-400" },
      rejected: { variant: "secondary", className: "bg-red-500/10 text-red-600 dark:text-red-400" },
    };
    
    const config = variants[status] || variants.pending;
    const label = status === 'in_review' ? 'Under Review' : 
                  status.charAt(0).toUpperCase() + status.slice(1);
    
    return <Badge variant={config.variant} className={config.className}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Document / Drawing Submission Workflow</h3>
          <p className="text-sm text-muted-foreground mt-1">Consultants / Trades</p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Submittal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Submittal</DialogTitle>
              <DialogDescription>
                Upload PDFs and provide metadata for the submittal
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Submittal title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="submitter">Submitter</Label>
                <Input id="submitter" placeholder="Name or company" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reviewer">Reviewer</Label>
                <Input id="reviewer" placeholder="Assigned reviewer" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">Document</Label>
                <Input id="file" type="file" accept=".pdf" />
              </div>
              <Button className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Upload Submittal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Workflow Timeline */}
      <div className="bg-background rounded-lg border border-border p-6">
        <h4 className="text-sm font-medium mb-4">Submission Workflow</h4>
        <div className="flex items-center justify-between">
          {workflowStages.map((stage, index) => (
            <React.Fragment key={stage.id}>
              <div className="flex flex-col items-center gap-2">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  "bg-primary/10 text-primary"
                )}>
                  <stage.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">{stage.label}</span>
              </div>
              {index < workflowStages.length - 1 && (
                <div className="flex-1 h-px bg-border mx-2" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Submittals Table */}
      <div className="bg-background rounded-lg border border-border">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading submittals...
          </div>
        ) : submittals && submittals.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Submitter</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submittals.map((submittal) => (
                <TableRow key={submittal.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      {submittal.submittal_name}
                    </div>
                  </TableCell>
                  <TableCell>{submittal.submitted_by || 'Unknown'}</TableCell>
                  <TableCell>{'Unassigned'}</TableCell>
                  <TableCell>{getStatusBadge(submittal.status)}</TableCell>
                  <TableCell>v{submittal.version}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(submittal.submitted_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No submittals yet</p>
            <p className="text-sm mt-1">Click "New Submittal" to upload your first document</p>
          </div>
        )}
      </div>

      {/* Features Info */}
      <div className="bg-muted/30 rounded-lg border border-border p-4">
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary" />
            <span>Upload form modal for PDFs + metadata</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary" />
            <span>Visual timeline (Draft → Submitted → Under Review → Approved)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary" />
            <span>Auto-notifications on upload or decision</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
