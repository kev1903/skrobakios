import React, { useState } from 'react';
import { Plus, Upload, FileText, MessageSquare, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type SubmittalStatus = 'Not Submitted' | 'Submitted' | 'Under Review' | 'Requires Revision' | 'Approved' | 'Rejected';

interface Submittal {
  id: string;
  title: string;
  submitter: { name: string; avatar: string };
  submissionDate: string;
  files: Array<{ name: string; url: string }>;
  reviewer: { name: string; avatar: string };
  reviewComments: string;
  status: SubmittalStatus;
  createdAt: string;
}

interface SubmittalWorkflowProps {
  taskId: string;
  projectMembers: Array<{ name: string; avatar: string }>;
}

export const SubmittalWorkflow = ({ taskId, projectMembers }: SubmittalWorkflowProps) => {
  const [submittals, setSubmittals] = useState<Submittal[]>([]);
  const [isAddingSubmittal, setIsAddingSubmittal] = useState(false);
  const [selectedSubmittal, setSelectedSubmittal] = useState<Submittal | null>(null);
  const [newSubmittal, setNewSubmittal] = useState({
    title: '',
    submitter: projectMembers[0] || { name: '', avatar: '' },
    reviewer: projectMembers[0] || { name: '', avatar: '' },
    files: [] as Array<{ name: string; url: string }>
  });

  const getStatusColor = (status: SubmittalStatus) => {
    switch (status) {
      case 'Not Submitted':
        return 'bg-gray-100 text-gray-800';
      case 'Submitted':
        return 'bg-blue-100 text-blue-800';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Requires Revision':
        return 'bg-orange-100 text-orange-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddSubmittal = () => {
    if (newSubmittal.title.trim()) {
      const submittal: Submittal = {
        id: `sub${Date.now()}`,
        title: newSubmittal.title,
        submitter: newSubmittal.submitter,
        submissionDate: new Date().toISOString().split('T')[0],
        files: newSubmittal.files,
        reviewer: newSubmittal.reviewer,
        reviewComments: '',
        status: 'Not Submitted',
        createdAt: new Date().toISOString()
      };
      setSubmittals([...submittals, submittal]);
      setNewSubmittal({
        title: '',
        submitter: projectMembers[0] || { name: '', avatar: '' },
        reviewer: projectMembers[0] || { name: '', avatar: '' },
        files: []
      });
      setIsAddingSubmittal(false);
    }
  };

  const handleStatusChange = (submittalId: string, newStatus: SubmittalStatus, comments?: string) => {
    setSubmittals(prev => prev.map(sub => 
      sub.id === submittalId 
        ? { 
            ...sub, 
            status: newStatus,
            reviewComments: comments || sub.reviewComments,
            submissionDate: newStatus === 'Submitted' ? new Date().toISOString().split('T')[0] : sub.submissionDate
          }
        : sub
    ));
    setSelectedSubmittal(null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newFiles = files.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file) // In real app, upload to storage
    }));
    setNewSubmittal(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles]
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Submittal Workflow</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsAddingSubmittal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Submittal
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Submitter</TableHead>
              <TableHead>Reviewer</TableHead>
              <TableHead>Submission Date</TableHead>
              <TableHead>Files</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submittals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-6">
                  No submittals yet. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              submittals.map((submittal) => (
                <TableRow key={submittal.id}>
                  <TableCell className="font-medium">{submittal.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={submittal.submitter.avatar} />
                        <AvatarFallback className="text-xs">
                          {submittal.submitter.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{submittal.submitter.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={submittal.reviewer.avatar} />
                        <AvatarFallback className="text-xs">
                          {submittal.reviewer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{submittal.reviewer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {submittal.submissionDate ? formatDate(submittal.submissionDate) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{submittal.files.length}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(submittal.status)}>
                      {submittal.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSubmittal(submittal)}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Submittal Dialog */}
      <Dialog open={isAddingSubmittal} onOpenChange={setIsAddingSubmittal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Submittal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Title
              </label>
              <Input
                placeholder="Submittal title"
                value={newSubmittal.title}
                onChange={(e) => setNewSubmittal({ ...newSubmittal, title: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Submitter
                </label>
                <Select
                  value={newSubmittal.submitter.name}
                  onValueChange={(value) => {
                    const member = projectMembers.find(m => m.name === value);
                    if (member) {
                      setNewSubmittal({ ...newSubmittal, submitter: member });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projectMembers.map((member) => (
                      <SelectItem key={member.name} value={member.name}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Reviewer
                </label>
                <Select
                  value={newSubmittal.reviewer.name}
                  onValueChange={(value) => {
                    const member = projectMembers.find(m => m.name === value);
                    if (member) {
                      setNewSubmittal({ ...newSubmittal, reviewer: member });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projectMembers.map((member) => (
                      <SelectItem key={member.name} value={member.name}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Files
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Click to upload files</span>
                </label>
                {newSubmittal.files.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {newSubmittal.files.map((file, index) => (
                      <div key={index} className="text-sm text-gray-600 flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        {file.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={handleAddSubmittal}>
                Add Submittal
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsAddingSubmittal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Status Dialog */}
      <Dialog open={!!selectedSubmittal} onOpenChange={() => setSelectedSubmittal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Submittal</DialogTitle>
          </DialogHeader>
          {selectedSubmittal && (
            <div className="space-y-4 mt-4">
              <div>
                <h4 className="font-medium">{selectedSubmittal.title}</h4>
                <p className="text-sm text-gray-600">
                  Current Status: <Badge variant="outline" className={getStatusColor(selectedSubmittal.status)}>
                    {selectedSubmittal.status}
                  </Badge>
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Change Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Submitted', 'Under Review', 'Requires Revision', 'Approved', 'Rejected'].map((status) => (
                    <Button
                      key={status}
                      variant={selectedSubmittal.status === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusChange(selectedSubmittal.id, status as SubmittalStatus)}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Review Comments
                </label>
                <Textarea
                  value={selectedSubmittal.reviewComments}
                  onChange={(e) => setSelectedSubmittal({
                    ...selectedSubmittal,
                    reviewComments: e.target.value
                  })}
                  placeholder="Add review comments..."
                  className="min-h-[100px]"
                />
              </div>
              
              <Button 
                onClick={() => handleStatusChange(
                  selectedSubmittal.id, 
                  selectedSubmittal.status, 
                  selectedSubmittal.reviewComments
                )}
              >
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};