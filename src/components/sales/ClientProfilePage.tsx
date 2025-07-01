
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Phone,
  Mail,
  MapPin,
  Building,
  Calendar,
  FileText,
  Send,
  MessageSquare
} from 'lucide-react';

export const ClientProfilePage = () => {
  const [selectedClient] = useState({
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+61 400 123 456',
    company: 'Smith Enterprises',
    address: '123 Main Street, Melbourne VIC 3000',
    avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png'
  });

  const communications = [
    {
      id: '1',
      type: 'Email',
      subject: 'Project Update - Kitchen Renovation',
      date: '2024-01-15',
      status: 'Sent'
    },
    {
      id: '2',
      type: 'Phone',
      subject: 'Initial Consultation Call',
      date: '2024-01-10',
      status: 'Completed'
    },
    {
      id: '3',
      type: 'Meeting',
      subject: 'Site Visit and Measurements',
      date: '2024-01-08',
      status: 'Completed'
    }
  ];

  const files = [
    {
      id: '1',
      name: 'Kitchen Plans v2.pdf',
      type: 'Plans',
      uploadDate: '2024-01-12',
      size: '2.4 MB'
    },
    {
      id: '2',
      name: 'Material Specifications.docx',
      type: 'Specifications',
      uploadDate: '2024-01-10',
      size: '1.2 MB'
    },
    {
      id: '3',
      name: 'Project Photos.zip',
      type: 'Photos',
      uploadDate: '2024-01-08',
      size: '15.8 MB'
    }
  ];

  const projects = [
    {
      id: '1',
      name: 'Kitchen Renovation',
      status: 'In Progress',
      startDate: '2024-01-01',
      budget: '$45,000',
      completion: 65
    },
    {
      id: '2',
      name: 'Bathroom Upgrade',
      status: 'Completed',
      startDate: '2023-08-15',
      budget: '$25,000',
      completion: 100
    }
  ];

  const tasks = [
    {
      id: '1',
      title: 'Final cabinet selection',
      dueDate: '2024-01-20',
      status: 'Pending',
      type: 'Task'
    },
    {
      id: '2',
      title: 'Progress meeting',
      dueDate: '2024-01-22',
      status: 'Scheduled',
      type: 'Meeting'
    },
    {
      id: '3',
      title: 'Electrical inspection',
      dueDate: '2024-01-25',
      status: 'Pending',
      type: 'Task'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Client Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={selectedClient.avatar} />
                <AvatarFallback className="text-lg">
                  {selectedClient.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{selectedClient.name}</h2>
                <p className="text-gray-600 mb-2">{selectedClient.company}</p>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {selectedClient.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {selectedClient.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {selectedClient.address}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Email
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Send className="w-4 h-4 mr-2" />
                Send Proposal
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Details Tabs */}
      <Tabs defaultValue="communications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="files">Files & Documents</TabsTrigger>
          <TabsTrigger value="projects">Project History</TabsTrigger>
          <TabsTrigger value="tasks">Tasks & Meetings</TabsTrigger>
        </TabsList>

        <TabsContent value="communications">
          <Card>
            <CardHeader>
              <CardTitle>Communications Log</CardTitle>
              <CardDescription>All communications with this client</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {communications.map((comm) => (
                    <TableRow key={comm.id}>
                      <TableCell>
                        <Badge variant="outline">{comm.type}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{comm.subject}</TableCell>
                      <TableCell>{comm.date}</TableCell>
                      <TableCell>
                        <Badge className={comm.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                          {comm.status}
                        </Badge>
                      </TableCell>
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
              <CardTitle>Files & Documents</CardTitle>
              <CardDescription>All files and documents for this client</CardDescription>
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

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Project History</CardTitle>
              <CardDescription>All projects for this client</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{project.name}</h4>
                      <p className="text-sm text-gray-600">Started: {project.startDate}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={project.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                          {project.status}
                        </Badge>
                        <span className="text-sm font-medium text-green-600">{project.budget}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{project.completion}%</div>
                      <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${project.completion}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Tasks & Meetings</CardTitle>
              <CardDescription>Upcoming tasks and scheduled meetings</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{task.type}</Badge>
                      </TableCell>
                      <TableCell>{task.dueDate}</TableCell>
                      <TableCell>
                        <Badge className={task.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}>
                          {task.status}
                        </Badge>
                      </TableCell>
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
      </Tabs>
    </div>
  );
};
