import React from 'react';
import { ArrowLeft, Calendar, Download, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GanttChart, type GanttTask } from './GanttChart';
import { Project } from '@/hooks/useProjects';

interface GanttChartPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const GanttChartPage = ({ project, onNavigate }: GanttChartPageProps) => {
  const mockGanttTasks: GanttTask[] = [
    {
      id: 'planning',
      name: 'Planning',
      startDate: '',
      endDate: '',
      progress: 60,
      color: '#6B7280',
      level: 0,
      type: 'group',
      status: 'in-progress',
      priority: 'high',
      assignee: 'Project Manager',
      children: [
        {
          id: 'geotechnical',
          name: 'Geotechnical Soil Testing',
          startDate: '',
          endDate: '',
          progress: 100,
          color: '#4B5563',
          level: 1,
          type: 'task',
          status: 'completed',
          priority: 'high',
          assignee: 'John Smith'
        },
        {
          id: 'architectural',
          name: 'Architectural',
          startDate: '',
          endDate: '',
          progress: 100,
          color: '#6B7280',
          level: 1,
          type: 'task',
          status: 'completed',
          priority: 'medium',
          assignee: 'Sarah Wilson'
        },
        {
          id: 'engineering',
          name: 'Engineering',
          startDate: '',
          endDate: '',
          progress: 80,
          color: '#9CA3AF',
          level: 1,
          type: 'task',
          status: 'in-progress',
          priority: 'high',
          assignee: 'Mike Johnson'
        },
        {
          id: 'energy-report',
          name: 'Energy Report',
          startDate: '',
          endDate: '',
          progress: 40,
          color: '#6B7280',
          level: 1,
          type: 'task',
          status: 'in-progress',
          priority: 'medium',
          assignee: 'Lisa Brown'
        },
        {
          id: 'building-surveying',
          name: 'Building Surveying',
          startDate: '',
          endDate: '',
          progress: 0,
          color: '#FBBF24',
          level: 1,
          type: 'milestone',
          status: 'not-started',
          priority: 'medium'
        },
        {
          id: 'performance-solution',
          name: 'Performance Solution Report',
          startDate: '',
          endDate: '',
          progress: 0,
          color: '#FBBF24',
          level: 1,
          type: 'milestone',
          status: 'not-started',
          priority: 'medium'
        },
        {
          id: 'construction-management',
          name: 'Construction Management Services',
          startDate: '',
          endDate: '',
          progress: 0,
          color: '#FBBF24',
          level: 1,
          type: 'milestone',
          status: 'not-started',
          priority: 'low'
        },
        {
          id: 'builders-license',
          name: 'Builders License',
          startDate: '',
          endDate: '',
          progress: 0,
          color: '#FBBF24',
          level: 1,
          type: 'milestone',
          status: 'not-started',
          priority: 'critical'
        },
        {
          id: 'insurance',
          name: 'Insurance',
          startDate: '',
          endDate: '',
          progress: 0,
          color: '#FBBF24',
          level: 1,
          type: 'milestone',
          status: 'not-started',
          priority: 'high'
        },
        {
          id: 'project-estimate',
          name: 'Project Estimate',
          startDate: '',
          endDate: '',
          progress: 0,
          color: '#FBBF24',
          level: 1,
          type: 'milestone',
          status: 'not-started',
          priority: 'critical'
        },
        {
          id: 'civil-drainage',
          name: 'Civil Drainage Design',
          startDate: '',
          endDate: '',
          progress: 0,
          color: '#FBBF24',
          level: 1,
          type: 'milestone',
          status: 'not-started',
          priority: 'medium'
        },
        {
          id: 'roof-drainage',
          name: 'Roof Drainage Design',
          startDate: '',
          endDate: '',
          progress: 0,
          color: '#FBBF24',
          level: 1,
          type: 'milestone',
          status: 'not-started',
          priority: 'medium'
        },
        {
          id: 'interior-designer',
          name: 'Interior Designer / Interior Documentation',
          startDate: '',
          endDate: '',
          progress: 0,
          color: '#FBBF24',
          level: 1,
          type: 'milestone',
          status: 'not-started',
          priority: 'low'
        },
        {
          id: 'landscape-designer',
          name: 'Landscape Designer / Architect',
          startDate: '',
          endDate: '',
          progress: 20,
          color: '#6B7280',
          level: 1,
          type: 'task',
          status: 'in-progress',
          priority: 'medium',
          assignee: 'David Chen'
        },
        {
          id: '3d-renders',
          name: '3D Renders / Virtual Design Models',
          startDate: '',
          endDate: '',
          progress: 0,
          color: '#FBBF24',
          level: 1,
          type: 'milestone',
          status: 'not-started',
          priority: 'low'
        },
        {
          id: 'site-feature-survey',
          name: 'Site Feature & Re-establishment Survey',
          startDate: '',
          endDate: '',
          progress: 0,
          color: '#9CA3AF',
          level: 1,
          type: 'task',
          status: 'not-started',
          priority: 'medium',
          assignee: 'Robert Lee'
        }
      ]
    },
    {
      id: 'site-amenities',
      name: 'Site Amenities',
      startDate: '',
      endDate: '',
      progress: 0,
      color: '#6B7280',
      level: 0,
      type: 'group',
      status: 'not-started',
      priority: 'low',
      assignee: 'Site Supervisor',
      children: [
        {
          id: 'toilet-hire',
          name: 'Toilet Hire',
          startDate: '',
          endDate: '',
          progress: 0,
          color: '#FBBF24',
          level: 1,
          type: 'milestone',
          status: 'not-started',
          priority: 'low'
        }
      ]
    }
  ];

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Button
            variant="ghost"
            onClick={() => onNavigate("project-schedule")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Schedule</span>
          </Button>
          
          <div className="mb-2">
            <h2 className="text-lg font-semibold text-gray-900">{project.name}</h2>
            <p className="text-sm text-gray-500">Gantt Chart View</p>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg border border-blue-200">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Gantt Chart</span>
            </div>
            <button 
              onClick={() => onNavigate("project-schedule")}
              className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Timeline View</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Resource View</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Gantt Chart</h1>
              <p className="text-gray-600">{project.name} - Project Timeline</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Chart
              </Button>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                View Options
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Calendar className="w-4 h-4 mr-2" />
                Update Tasks
              </Button>
            </div>
          </div>

          {/* Project Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Project Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="text-lg font-semibold">{project.start_date}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="text-lg font-semibold">{project.deadline}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Total Tasks</p>
                  <p className="text-lg font-semibold">18</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Completion</p>
                  <p className="text-lg font-semibold">35%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gantt Chart */}
          <Card>
            <CardContent className="p-6">
              <GanttChart
                tasks={mockGanttTasks}
                startDate={new Date('2025-06-22')}
                endDate={new Date('2025-07-12')}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
