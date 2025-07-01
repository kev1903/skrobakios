
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Download,
  MessageSquare,
  CheckCircle,
  FileText,
  Calendar,
  DollarSign,
  Home
} from 'lucide-react';

export const ClientPortal = () => {
  const projectSummary = {
    name: 'Kitchen Renovation Project',
    address: '123 Main Street, Melbourne VIC 3000',
    status: 'In Progress',
    completion: 65,
    startDate: '2024-01-01',
    expectedCompletion: '2024-04-30',
    budget: '$45,000',
    pm: 'Sarah Wilson',
    pmEmail: 's.wilson@company.com',
    pmPhone: '+61 400 123 456'
  };

  const estimates = [
    {
      id: '1',
      name: 'Initial Kitchen Renovation Estimate',
      amount: '$45,000',
      status: 'Approved',
      date: '2023-12-15',
      description: 'Complete kitchen renovation including cabinets, countertops, and appliances'
    },
    {
      id: '2',
      name: 'Additional Electrical Work',
      amount: '$3,500',
      status: 'Pending Approval',
      date: '2024-01-20',
      description: 'Additional GFCI outlets and under-cabinet lighting'
    }
  ];

  const submittals = [
    {
      id: '1',
      title: 'Cabinet Color Selection',
      type: 'Selections',
      sentDate: '2024-01-15',
      dueDate: '2024-01-22',
      status: 'Pending Review',
      description: 'Please review and approve the cabinet color options'
    },
    {
      id: '2',
      title: 'Countertop Material Specs',
      type: 'Materials',
      sentDate: '2024-01-10',
      dueDate: '2024-01-17',
      status: 'Approved',
      description: 'Quartz countertop specifications and edge profiles'
    },
    {
      id: '3',
      title: 'Electrical Layout Plan',
      type: 'Plans',
      sentDate: '2024-01-18',
      dueDate: '2024-01-25',
      status: 'Pending Review',
      description: 'Updated electrical layout with additional outlets'
    }
  ];

  const files = [
    {
      id: '1',
      name: 'Kitchen Design Plans.pdf',
      type: 'Plans',
      uploadDate: '2024-01-01',
      size: '2.4 MB',
      category: 'Design'
    },
    {
      id: '2',
      name: 'Material Specifications.pdf',
      type: 'Specifications',
      uploadDate: '2024-01-05',
      size: '1.8 MB',
      category: 'Materials'
    },
    {
      id: '3',
      name: 'Progress Photos - Week 3.zip',
      type: 'Photos',
      uploadDate: '2024-01-20',
      size: '15.2 MB',
      category: 'Progress'
    },
    {
      id: '4',
      name: 'Warranty Information.pdf',
      type: 'Documents',
      uploadDate: '2024-01-22',
      size: '850 KB',
      category: 'Warranty'
    }
  ];

  const milestones = [
    { name: 'Design Approval', status: 'completed', date: '2024-01-05' },
    { name: 'Permits Obtained', status: 'completed', date: '2024-01-12' },
    { name: 'Demolition Complete', status: 'completed', date: '2024-01-20' },
    { name: 'Rough-in Complete', status: 'active', date: '2024-02-01' },
    { name: 'Installation Phase', status: 'pending', date: '2024-02-15' },
    { name: 'Final Inspection', status: 'pending', date: '2024-04-20' },
    { name: 'Project Completion', status: 'pending', date: '2024-04-30' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': case 'completed': return 'bg-green-100 text-green-700';
      case 'Pending Review': case 'Pending Approval': case 'active': return 'bg-yellow-100 text-yellow-700';
      case 'pending': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'active': return <div className="w-5 h-5 bg-yellow-500 rounded-full" />;
      case 'pending': return <div className="w-5 h-5 bg-gray-300 rounded-full" />;
      default: return <div className="w-5 h-5 bg-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Home className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Client Portal</h1>
                <p className="text-gray-600">Welcome back, John Smith</p>
              </div>
            </div>
            <Button variant="outline">
              <MessageSquare className="w-4 h-4 mr-2" />
              Contact PM
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Project Overview */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h2 className="text-xl font-bold mb-2">{projectSummary.name}</h2>
                <p className="text-gray-600 mb-4">{projectSummary.address}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Project Status</p>
                    <Badge className="bg-blue-100 text-blue-700">{projectSummary.status}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Budget</p>
                    <p className="font-semibold text-green-600">{projectSummary.budget}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">{projectSummary.startDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Expected Completion</p>
                    <p className="font-medium">{projectSummary.expectedCompletion}</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-500">Progress</p>
                    <p className="text-sm font-medium">{projectSummary.completion}% Complete</p>
                  </div>
                  <Progress value={projectSummary.completion} className="h-3" />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Project Manager</h3>
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar>
                    <AvatarImage src="/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png" />
                    <AvatarFallback>SW</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{projectSummary.pm}</p>
                    <p className="text-sm text-gray-600">Project Manager</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <p>{projectSummary.pmEmail}</p>
                  <p>{projectSummary.pmPhone}</p>
                </div>
                <Button size="sm" className="w-full mt-3">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Project Summary</TabsTrigger>
            <TabsTrigger value="estimates">Estimates</TabsTrigger>
            <TabsTrigger value="submittals">Submittals</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Project Milestones</CardTitle>
                <CardDescription>Track the progress of your project</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      {getMilestoneIcon(milestone.status)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{milestone.name}</h4>
                          <Badge className={getStatusColor(milestone.status)}>
                            {milestone.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">Target: {milestone.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estimates">
            <Card>
              <CardHeader>
                <CardTitle>Estimates & Quotes</CardTitle>
                <CardDescription>Review and approve project estimates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {estimates.map((estimate) => (
                    <div key={estimate.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{estimate.name}</h3>
                          <p className="text-sm text-gray-600">{estimate.description}</p>
                          <p className="text-xs text-gray-500 mt-1">Date: {estimate.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-600">{estimate.amount}</p>
                          <Badge className={getStatusColor(estimate.status)}>{estimate.status}</Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        {estimate.status === 'Pending Approval' && (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Comment
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submittals">
            <Card>
              <CardHeader>
                <CardTitle>Submittals for Review</CardTitle>
                <CardDescription>Items requiring your review and approval</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {submittals.map((submittal) => (
                    <div key={submittal.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{submittal.title}</h3>
                            <Badge variant="outline">{submittal.type}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{submittal.description}</p>
                          <div className="text-xs text-gray-500 space-y-1">
                            <p>Sent: {submittal.sentDate}</p>
                            <p>Due: {submittal.dueDate}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(submittal.status)}>{submittal.status}</Badge>
                      </div>
                      {submittal.status === 'Pending Review' && (
                        <div className="flex space-x-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline">
                            Request Changes
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Comment
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files">
            <Card>
              <CardHeader>
                <CardTitle>Project Files</CardTitle>
                <CardDescription>Access all project documents and files</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {files.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell className="font-medium">{file.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{file.category}</Badge>
                        </TableCell>
                        <TableCell>{file.uploadDate}</TableCell>
                        <TableCell>{file.size}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
