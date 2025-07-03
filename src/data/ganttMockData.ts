import { GanttTask } from '@/components/GanttChart';

export const mockGanttTasks: GanttTask[] = [
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