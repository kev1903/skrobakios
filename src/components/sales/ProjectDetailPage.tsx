
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Calendar,
  Users,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const ProjectDetailPage = () => {
  const project = {
    name: 'Residential Extension - Smith House',
    address: '123 Smith Street, Melbourne VIC 3000',
    client: 'John Smith',
    status: 'In Progress',
    budget: '$250,000',
    actual: '$180,000',
    completion: 65,
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    pm: 'Sarah Wilson',
    currentPhase: 'Construction',
    nextMilestone: 'Electrical Rough-in',
    nextDate: '2024-02-15'
  };

  const tasks = [
    { id: '1', name: 'Foundation Pour', status: 'Completed', assignee: 'Mike Johnson', dueDate: '2024-01-15' },
    { id: '2', name: 'Framing', status: 'In Progress', assignee: 'David Miller', dueDate: '2024-02-01' },
    { id: '3', name: 'Electrical Rough-in', status: 'Pending', assignee: 'Lisa Brown', dueDate: '2024-02-15' },
    { id: '4', name: 'Plumbing Rough-in', status: 'Pending', assignee: 'Tom Wilson', dueDate: '2024-02-20' }
  ];

  const estimates = [
    { id: '1', name: 'Initial Estimate', amount: '$250,000', status: 'Approved', date: '2023-12-15' },
    { id: '2', name: 'Change Order #1', amount: '$15,000', status: 'Pending', date: '2024-01-20' },
    { id: '3', name: 'Additional Materials', amount: '$8,500', status: 'Draft', date: '2024-01-25' }
  ];

  const submittals = [
    { id: '1', title: 'Structural Plans', type: 'Plans', status: 'Approved', sentDate: '2024-01-05', responseDate: '2024-01-08' },
    { id: '2', title: 'Window Specifications', type: 'Materials', status: 'Pending', sentDate: '2024-01-15', responseDate: null },
    { id: '3', title: 'Electrical Layout', type: 'Plans', status: 'Rejected', sentDate: '2024-01-10', responseDate: '2024-01-12' }
  ];

  const files = [
    { id: '1', name: 'Architectural Plans.pdf', type: 'Plans', uploadDate: '2024-01-01', size: '3.2 MB' },
    { id: '2', name: 'Permits.pdf', type: 'Documents', uploadDate: '2024-01-05', size: '1.8 MB' },
    { id: '3', name: 'Progress Photos.zip', type: 'Photos', uploadDate: '2024-01-20', size: '25.4 MB' }
  ];

  const teamMembers = [
    { name: 'Sarah Wilson', role: 'Project Manager', avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png' },
    { name: 'Mike Johnson', role: 'Site Supervisor', avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png' },
    { name: 'Lisa Brown', role: 'Electrician', avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png' },
    { name: 'David Miller', role: 'Carpenter', avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': case 'Approved': return 'bg-green-100 text-green-700';
      case 'In Progress': case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      case 'Draft': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <p className="text-gray-600">{project.address}</p>
              <p className="text-gray-600">Client: {project.client}</p>
            </div>
            <Badge className="bg-blue-100 text-blue-700">{project.status}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Budget</p>
                <p className="font-semibold">{project.budget}</p>
                <p className="text-xs text-gray-600">Spent: {project.actual}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Timeline</p>
                <p className="font-semibold">{project.startDate} - {project.endDate}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Progress</p>
                <p className="font-semibold">{project.completion}%</p>
                <Progress value={project.completion} className="w-20 h-2 mt-1" />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Project Manager</p>
                <p className="font-semibold">{project.pm}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-blue-800">Current Phase: {project.currentPhase}</p>
                <p className="text-sm text-blue-600">Next Milestone: {project.nextMilestone} - {project.nextDate}</p>
              </div>
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Detail Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="estimates">Estimates</TabsTrigger>
          <TabsTrigger value="submittals">Submittals</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Project team and their roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map((member, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Internal Notes</CardTitle>
                <CardDescription>Internal comments and notes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm">Client requested additional electrical outlets in kitchen.</p>
                    <p className="text-xs text-gray-500 mt-1">Sarah Wilson - 2024-01-20</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-sm">Weather delay expected next week - adjust timeline accordingly.</p>
                    <p className="text-xs text-gray-500 mt-1">Mike Johnson - 2024-01-18</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Project Tasks</CardTitle>
              <CardDescription>All tasks and their current status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.name}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                      </TableCell>
                      <TableCell>{task.assignee}</TableCell>
                      <TableCell>{task.dueDate}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
              <CardDescription>Gantt-style timeline view</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-500">Gantt chart visualization would be implemented here</p>
                <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                  <p className="text-gray-400">Timeline Chart Placeholder</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estimates">
          <Card>
            <CardHeader>
              <CardTitle>Estimates & Quotes</CardTitle>
              <CardDescription>All project estimates and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estimate</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estimates.map((estimate) => (
                    <TableRow key={estimate.id}>
                      <TableCell className="font-medium">{estimate.name}</TableCell>
                      <TableCell className="font-medium text-green-600">{estimate.amount}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(estimate.status)}>{estimate.status}</Badge>
                      </TableCell>
                      <TableCell>{estimate.date}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">View</Button>
                          <Button size="sm" variant="outline">Edit</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submittals">
          <Card>
            <CardHeader>
              <CardTitle>Submittals</CardTitle>
              <CardDescription>All project submittals and approvals</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent Date</TableHead>
                    <TableHead>Response Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submittals.map((submittal) => (
                    <TableRow key={submittal.id}>
                      <TableCell className="font-medium">{submittal.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{submittal.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(submittal.status)}>{submittal.status}</Badge>
                      </TableCell>
                      <TableCell>{submittal.sentDate}</TableCell>
                      <TableCell>{submittal.responseDate || 'Pending'}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle>Project Files</CardTitle>
              <CardDescription>All files and documents related to this project</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
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
                        <Badge variant="outline">{file.type}</Badge>
                      </TableCell>
                      <TableCell>{file.uploadDate}</TableCell>
                      <TableCell>{file.size}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">Download</Button>
                          <Button size="sm" variant="outline">View</Button>
                        </div>
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
  );
};
