
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus,
  Upload,
  Send,
  MessageSquare,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

export const SubmittalsPage = () => {
  const [viewMode, setViewMode] = useState('timeline');

  const submittals = [
    {
      id: '1',
      title: 'Structural Steel Plans',
      type: 'Plans',
      project: 'Smith House Extension',
      sentDate: '2024-01-15',
      clientResponse: '2024-01-18',
      status: 'Approved',
      description: 'Detailed structural steel fabrication drawings',
      comments: 'Approved with minor revisions to beam connections'
    },
    {
      id: '2',
      title: 'Window Specifications',
      type: 'Materials',
      project: 'Office Fitout',
      sentDate: '2024-01-20',
      clientResponse: null,
      status: 'Pending',
      description: 'Double-glazed window specifications and energy ratings',
      comments: null,
      daysOverdue: 5
    },
    {
      id: '3',
      title: 'Electrical Layout Revision',
      type: 'Plans',
      project: 'Kitchen Renovation',
      sentDate: '2024-01-10',
      clientResponse: '2024-01-12',
      status: 'Rejected',
      description: 'Revised electrical layout with additional outlets',
      comments: 'Client requested additional GFCI outlets near sink area'
    },
    {
      id: '4',
      title: 'Flooring Material Samples',
      type: 'Selections',
      project: 'Davis Home Renovation',
      sentDate: '2024-01-22',
      clientResponse: null,
      status: 'Pending',
      description: 'Hardwood flooring samples for client selection',
      comments: null,
      daysOverdue: null
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="w-4 h-4" />;
      case 'Pending': return <Clock className="w-4 h-4" />;
      case 'Rejected': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const SubmittalCard = ({ submittal }: { submittal: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold">{submittal.title}</h3>
              <Badge variant="outline">{submittal.type}</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">{submittal.project}</p>
            <p className="text-sm text-gray-500">{submittal.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(submittal.status)}
            <Badge className={getStatusColor(submittal.status)}>{submittal.status}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500">Sent Date</p>
            <p className="text-sm font-medium">{submittal.sentDate}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Client Response</p>
            <p className="text-sm font-medium">
              {submittal.clientResponse || (
                <span className="text-yellow-600">
                  Pending
                  {submittal.daysOverdue && ` (${submittal.daysOverdue} days overdue)`}
                </span>
              )}
            </p>
          </div>
        </div>

        {submittal.comments && (
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <p className="text-sm">{submittal.comments}</p>
          </div>
        )}

        <div className="flex justify-between items-center">
          <Button size="sm" variant="outline">
            <MessageSquare className="w-3 h-3 mr-2" />
            Add Comment
          </Button>
          <div className="flex space-x-2">
            {submittal.status === 'Pending' && (
              <Button size="sm" variant="outline">
                <Send className="w-3 h-3 mr-2" />
                Send Reminder
              </Button>
            )}
            <Button size="sm" variant="outline">View Details</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const TimelineView = () => (
    <div className="space-y-6">
      {submittals.map((submittal, index) => (
        <div key={submittal.id} className="relative">
          {/* Timeline Line */}
          {index < submittals.length - 1 && (
            <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200 z-0"></div>
          )}
          
          {/* Timeline Node */}
          <div className="relative flex items-start space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${
              submittal.status === 'Approved' ? 'bg-green-100' :
              submittal.status === 'Rejected' ? 'bg-red-100' : 'bg-yellow-100'
            }`}>
              {getStatusIcon(submittal.status)}
            </div>
            
            <div className="flex-1">
              <SubmittalCard submittal={submittal} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const KanbanView = () => {
    const stages = ['Pending', 'Approved', 'Rejected'];
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stages.map((stage) => (
          <div key={stage} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{stage}</h3>
              <Badge variant="outline">
                {submittals.filter(s => s.status === stage).length}
              </Badge>
            </div>
            <div className="space-y-4">
              {submittals
                .filter(submittal => submittal.status === stage)
                .map(submittal => (
                  <SubmittalCard key={submittal.id} submittal={submittal} />
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Submittals Management</h2>
          <p className="text-gray-600">Track and manage project submittals and approvals</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Upload New Submittal
        </Button>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="smith">Smith House</SelectItem>
              <SelectItem value="office">Office Fitout</SelectItem>
              <SelectItem value="kitchen">Kitchen Renovation</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="plans">Plans</SelectItem>
              <SelectItem value="materials">Materials</SelectItem>
              <SelectItem value="specs">Specifications</SelectItem>
              <SelectItem value="selections">Selections</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === 'timeline' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('timeline')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Timeline
          </Button>
          <Button 
            variant={viewMode === 'kanban' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('kanban')}
          >
            Kanban
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'timeline' ? <TimelineView /> : <KanbanView />}

      {/* Upload New Submittal Modal Trigger */}
      <Card>
        <CardHeader>
          <CardTitle>Upload New Submittal</CardTitle>
          <CardDescription>Add a new submittal for client review</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Submittal Title</label>
              <Input placeholder="e.g., Kitchen Cabinet Specs" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plans">Plans</SelectItem>
                  <SelectItem value="materials">Materials</SelectItem>
                  <SelectItem value="specs">Specifications</SelectItem>
                  <SelectItem value="selections">Selections</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea 
              rows={3} 
              placeholder="Describe what this submittal contains..."
            />
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <Button variant="outline">
                  Upload Files
                </Button>
                <p className="mt-2 text-sm text-gray-500">PDF, DWG, images up to 10MB each</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline">Save as Draft</Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4 mr-2" />
              Send to Client
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
