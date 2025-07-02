
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  FileText,
  Upload,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  Target,
  DollarSign
} from 'lucide-react';

export const SalesDashboard = () => {
  const stats = [
    {
      title: 'Active Projects',
      value: '12',
      change: '+3 this month',
      icon: Target,
      color: 'text-blue-600'
    },
    {
      title: 'New Leads This Week',
      value: '8',
      change: '+25% from last week',
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Estimations Sent',
      value: '15',
      change: '6 approved',
      icon: FileText,
      color: 'text-orange-600'
    },
    {
      title: 'Submittals Pending',
      value: '4',
      change: '2 overdue',
      icon: Clock,
      color: 'text-red-600'
    }
  ];

  const activeProjects = [
    {
      name: 'Residential Extension - Smith House',
      client: 'John Smith',
      status: 'In Progress',
      budget: '$250,000',
      completion: 65
    },
    {
      name: 'Commercial Fitout - Tech Office',
      client: 'TechCorp Ltd',
      status: 'Planning',
      budget: '$180,000',
      completion: 25
    },
    {
      name: 'Kitchen Renovation - Davis Home',
      client: 'Sarah Davis',
      status: 'Materials',
      budget: '$45,000',
      completion: 80
    }
  ];

  const recentActivity = [
    { action: 'New lead added', item: 'Michael Chen - Bathroom Renovation', time: '2 hours ago' },
    { action: 'Estimate approved', item: 'Office Renovation Project', time: '4 hours ago' },
    { action: 'Submittal approved', item: 'Kitchen Cabinets - Davis Home', time: '1 day ago' },
    { action: 'Project completed', item: 'Garden Deck - Wilson House', time: '2 days ago' }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add New Lead
        </Button>
        <Button variant="outline">
          <FileText className="w-4 h-4 mr-2" />
          Create Estimate
        </Button>
        <Button variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Upload Submittal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
            <CardDescription>Current projects and their status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeProjects.map((project, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold">{project.name}</h4>
                  <p className="text-sm text-gray-600">{project.client}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{project.status}</Badge>
                    <span className="text-sm text-green-600 font-medium">{project.budget}</span>
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
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and changes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.item}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
