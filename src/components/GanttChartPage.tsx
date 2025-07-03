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
      id: 'project-kickoff',
      name: 'Project Kickoff & Planning',
      startDate: '2025-05-15',
      endDate: '2025-05-23',
      progress: 100,
      color: '#10B981',
      level: 0,
      type: 'group',
      status: 'completed',
      priority: 'high',
      assignee: 'Project Manager',
      children: [
        {
          id: 'define-objectives',
          name: 'Define project objectives and goals.',
          startDate: '2025-05-15',
          endDate: '2025-05-19',
          progress: 100,
          color: '#10B981',
          level: 1,
          type: 'task',
          status: 'completed',
          priority: 'high',
          assignee: 'Sarah Wilson'
        },
        {
          id: 'identify-audience',
          name: 'Identify target audience and user personas.',
          startDate: '2025-05-22',
          endDate: '2025-05-23',
          progress: 100,
          color: '#10B981',
          level: 1,
          type: 'task',
          status: 'completed',
          priority: 'medium',
          assignee: 'John Smith'
        }
      ]
    },
    {
      id: 'research-analysis',
      name: 'Research and Analysis',
      startDate: '2025-05-26',
      endDate: '2025-06-08',
      progress: 90,
      color: '#10B981',
      level: 0,
      type: 'group',
      status: 'completed',
      priority: 'high',
      assignee: 'Research Team',
      children: [
        {
          id: 'user-research',
          name: 'Conduct user research and surveys.',
          startDate: '2025-05-26',
          endDate: '2025-06-08',
          progress: 100,
          color: '#10B981',
          level: 1,
          type: 'task',
          status: 'completed',
          priority: 'high',
          assignee: 'Lisa Brown'
        },
        {
          id: 'competitor-analysis',
          name: 'Analyze competitor products and user experience.',
          startDate: '2025-05-26',
          endDate: '2025-06-08',
          progress: 100,
          color: '#10B981',
          level: 1,
          type: 'task',
          status: 'completed',
          priority: 'medium',
          assignee: 'Mike Johnson'
        },
        {
          id: 'user-personas',
          name: 'Create user personas and user journey maps.',
          startDate: '2025-05-28',
          endDate: '2025-06-05',
          progress: 75,
          color: '#6B7280',
          level: 1,
          type: 'task',
          status: 'in-progress',
          priority: 'medium',
          assignee: 'David Chen'
        }
      ]
    },
    {
      id: 'wireframing',
      name: 'Wireframing',
      startDate: '2025-05-27',
      endDate: '2025-05-30',
      progress: 85,
      color: '#F59E0B',
      level: 0,
      type: 'group',
      status: 'review',
      priority: 'medium',
      assignee: 'Design Team',
      children: [
        {
          id: 'low-fidelity-wireframes',
          name: 'Design low-fidelity wireframes for different screens.',
          startDate: '2025-05-27',
          endDate: '2025-05-29',
          progress: 100,
          color: '#10B981',
          level: 1,
          type: 'task',
          status: 'completed',
          priority: 'high',
          assignee: 'Emma Davis'
        },
        {
          id: 'review-wireframes',
          name: 'Review and iterate on wireframes based on feedback.',
          startDate: '2025-05-27',
          endDate: '2025-05-30',
          progress: 60,
          color: '#F59E0B',
          level: 1,
          type: 'task',
          status: 'review',
          priority: 'medium',
          assignee: 'Alex Turner'
        }
      ]
    },
    {
      id: 'visual-design',
      name: 'Visual Design',
      startDate: '2025-05-28',
      endDate: '2025-06-05',
      progress: 70,
      color: '#3B82F6',
      level: 0,
      type: 'group',
      status: 'in-progress',
      priority: 'high',
      assignee: 'Design Team',
      children: [
        {
          id: 'visual-style',
          name: 'Develop the visual style and aesthetic direction.',
          startDate: '2025-05-28',
          endDate: '2025-05-30',
          progress: 80,
          color: '#3B82F6',
          level: 1,
          type: 'task',
          status: 'in-progress',
          priority: 'high',
          assignee: 'Sophie Clark'
        },
        {
          id: 'high-fidelity-mockups',
          name: 'Create high-fidelity mockups and design systems.',
          startDate: '2025-05-30',
          endDate: '2025-06-05',
          progress: 60,
          color: '#10B981',
          level: 1,
          type: 'task',
          status: 'completed',
          priority: 'high',
          assignee: 'Ryan Miller'
        }
      ]
    },
    {
      id: 'prototyping',
      name: 'Prototyping',
      startDate: '2025-05-23',
      endDate: '2025-05-29',
      progress: 45,
      color: '#3B82F6',
      level: 0,
      type: 'group',
      status: 'in-progress',
      priority: 'medium',
      assignee: 'Dev Team',
      children: [
        {
          id: 'interactive-prototypes',
          name: 'Create interactive prototypes using tools like Figma or Framer.',
          startDate: '2025-05-23',
          endDate: '2025-05-26',
          progress: 30,
          color: '#6B7280',
          level: 1,
          type: 'task',
          status: 'in-progress',
          priority: 'medium',
          assignee: 'Tom Wilson'
        },
        {
          id: 'test-prototypes',
          name: 'Test the prototypes with users to gather feedback and iterate.',
          startDate: '2025-05-23',
          endDate: '2025-05-24',
          progress: 60,
          color: '#3B82F6',
          level: 1,
          type: 'task',
          status: 'in-progress',
          priority: 'high',
          assignee: 'Kate Anderson'
        },
        {
          id: 'refine-prototypes',
          name: 'Refine the prototypes based on user testing feedback.',
          startDate: '2025-05-27',
          endDate: '2025-05-29',
          progress: 40,
          color: '#3B82F6',
          level: 1,
          type: 'task',
          status: 'in-progress',
          priority: 'medium',
          assignee: 'Chris Lee'
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
                startDate={new Date('2025-05-15')}
                endDate={new Date('2025-06-10')}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
