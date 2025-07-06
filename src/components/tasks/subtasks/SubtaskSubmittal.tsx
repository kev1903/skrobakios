import React, { useState } from 'react';
import { FileText, Upload, Check, X, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type SubmittalStatus = 'not_submitted' | 'submitted' | 'under_review' | 'approved' | 'rejected';

interface SubtaskSubmittalProps {
  subtaskId: string;
  subtaskTitle: string;
}

export const SubtaskSubmittal = ({ subtaskId, subtaskTitle }: SubtaskSubmittalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<SubmittalStatus>('not_submitted');
  const [files, setFiles] = useState<File[]>([]);
  const [reviewComments, setReviewComments] = useState('');

  const getStatusColor = (status: SubmittalStatus) => {
    switch (status) {
      case 'not_submitted':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
    }
  };

  const getStatusIcon = (status: SubmittalStatus) => {
    switch (status) {
      case 'not_submitted':
        return <FileText className="w-4 h-4" />;
      case 'submitted':
        return <Upload className="w-4 h-4" />;
      case 'under_review':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <Check className="w-4 h-4" />;
      case 'rejected':
        return <X className="w-4 h-4" />;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = () => {
    setStatus('submitted');
    // Here you would typically save to database
    console.log('Submitting files for subtask:', subtaskId, files);
  };

  const handleStatusChange = (newStatus: SubmittalStatus) => {
    setStatus(newStatus);
    // Here you would typically save to database
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="p-1 h-8 w-8"
      >
        {getStatusIcon(status)}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submittal - {subtaskTitle}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              <Badge className={getStatusColor(status)}>
                {status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>

            {status === 'not_submitted' && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Upload Files</label>
                  <Input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="mt-1"
                  />
                </div>
                
                {files.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-sm font-medium">Selected Files:</span>
                    {files.map((file, index) => (
                      <div key={index} className="text-sm text-gray-600 flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        {file.name}
                      </div>
                    ))}
                  </div>
                )}
                
                <Button onClick={handleSubmit} disabled={files.length === 0} className="w-full">
                  Submit for Review
                </Button>
              </div>
            )}

            {status !== 'not_submitted' && (
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium">Change Status:</span>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button
                      variant={status === 'under_review' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusChange('under_review')}
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                    <Button
                      variant={status === 'approved' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusChange('approved')}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant={status === 'rejected' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusChange('rejected')}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange('not_submitted')}
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Review Comments</label>
                  <Textarea
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    placeholder="Add review comments..."
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};