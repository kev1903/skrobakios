
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search,
  Plus,
  Filter,
  List,
  LayoutGrid,
  Calendar,
  Users,
  DollarSign
} from 'lucide-react';

export const ProjectsDashboard = () => {
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');

  const projects = [
    {
      id: '1',
      name: 'Residential Extension',
      address: '123 Smith Street, Melbourne',
      client: 'John Smith',
      budget: '$250,000',
      actual: '$180,000',
      status: 'Active',
      pm: 'Sarah Wilson',
      serviceType: 'Residential',
      completion: 65,
      startDate: '2024-01-01',
      team: [
        { name: 'Mike Johnson', role: 'Engineer', avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png' },
        { name: 'Lisa Brown', role: 'Architect', avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png' }
      ],
      milestones: [
        { name: 'Design Complete', status: 'completed' },
        { name: 'Permits Approved', status: 'completed' },
        { name: 'Construction Started', status: 'active' },
        { name: 'Final Inspection', status: 'pending' }
      ]
    },
    {
      id: '2',
      name: 'Office Fitout',
      address: '456 Collins Street, Melbourne',
      client: 'TechCorp Ltd',
      budget: '$180,000',
      actual: '$95,000',
      status: 'On Hold',
      pm: 'David Miller',
      serviceType: 'Commercial',
      completion: 30,
      startDate: '2024-02-15',
      team: [
        { name: 'John Smith', role: 'PM', avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png' }
      ],
      milestones: [
        { name: 'Design Complete', status: 'completed' },
        { name: 'Material Orders', status: 'active' },
        { name: 'Installation', status: 'pending' },
        { name: 'Handover', status: 'pending' }
      ]
    },
    {
      id: '3',
      name: 'Kitchen Renovation',
      address: '789 High Street, Richmond',
      client: 'Emma Davis',
      budget: '$45,000',
      actual: '$45,000',
      status: 'Completed',
      pm: 'Lisa Brown',
      serviceType: 'Residential',
      completion: 100,
      startDate: '2023-11-01',
      team: [
        { name: 'David Miller', role: 'Electrician', avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png' },
        { name: 'Sarah Wilson', role: 'Designer', avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png' }
      ],
      milestones: [
        { name: 'Design Complete', status: 'completed' },
        { name: 'Demolition', status: 'completed' },
        { name: 'Installation', status: 'completed' },
        { name: 'Final Inspection', status: 'completed' }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'On Hold': return 'bg-yellow-100 text-yellow-700';
      case 'Completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const ProjectCard = ({ project }: { project: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">{project.name}</h3>
            <p className="text-sm text-gray-600">{project.address}</p>
            <p className="text-sm text-gray-600">Client: {project.client}</p>
          </div>
          <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Budget vs Actual</p>
            <p className="font-medium text-green-600">{project.budget}</p>
            <p className="text-sm text-gray-600">Spent: {project.actual}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Completion</p>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${project.completion}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{project.completion}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-400" />
            <div className="flex -space-x-2">
              {project.team.slice(0, 3).map((member: any, index: number) => (
                <Avatar key={index} className="w-6 h-6 border-2 border-white">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="text-xs">{member.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                </Avatar>
              ))}
              {project.team.length > 3 && (
                <div className="w-6 h-6 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-xs">+{project.team.length - 3}</span>
                </div>
              )}
            </div>
          </div>
          <Button size="sm" variant="outline">View Details</Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Projects Dashboard</h2>
          <p className="text-gray-600">Manage and track all your projects</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All PM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All PM</SelectItem>
              <SelectItem value="sarah">Sarah Wilson</SelectItem>
              <SelectItem value="david">David Miller</SelectItem>
              <SelectItem value="lisa">Lisa Brown</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === 'cards' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('cards')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button 
            variant={viewMode === 'table' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Projects</CardTitle>
            <CardDescription>Detailed view of all projects</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>PM</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-gray-600">{project.address}</div>
                      </div>
                    </TableCell>
                    <TableCell>{project.client}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-green-600">{project.budget}</div>
                        <div className="text-sm text-gray-600">Spent: {project.actual}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${project.completion}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{project.completion}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{project.pm}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
