import { supabase } from '@/integrations/supabase/client';

export interface WBSItem {
  id?: string;
  project_id: string;
  parent_id?: string;
  wbs_id: string;
  title: string;
  description: string;
  assigned_to: string;
  start_date: string;
  end_date: string;
  duration: number;
  budgeted_cost: number;
  actual_cost: number;
  progress: number;
  level: number;
  is_expanded: boolean;
  linked_tasks: any[];
}

// Sample data creation is temporarily disabled for company isolation implementation
export const createSampleWBSData = async (projectId: string): Promise<WBSItem[]> => {
  console.log('Creating sample WBS data for project:', projectId);
  console.warn('Sample WBS data creation is temporarily disabled for company isolation');
  return [];
};

export const createChildWBSItems = async (projectId: string, parentId: string): Promise<WBSItem[]> => {
  console.log('Creating child WBS items for parent:', parentId);
  console.warn('Child WBS item creation is temporarily disabled for company isolation');
  return [];
};

// Original sample data kept for reference but not used
const sampleWBSData = [
  {
    parent_id: null,
    wbs_id: "1.0",
    title: "Project Initiation",
    description: "Initial project setup and planning",
    assigned_to: "Project Manager",
    start_date: "2024-01-01",
    end_date: "2024-01-15",
    duration: 14,
    budgeted_cost: 5000,
    actual_cost: 4800,
    progress: 100,
    level: 0,
    is_expanded: true,
    linked_tasks: []
  },
  {
    parent_id: null,
    wbs_id: "2.0",
    title: "Design Phase",
    description: "Detailed design and specification development",
    assigned_to: "Lead Designer",
    start_date: "2024-01-16",
    end_date: "2024-02-28",
    duration: 44,
    budgeted_cost: 12000,
    actual_cost: 11500,
    progress: 95,
    level: 0,
    is_expanded: true,
    linked_tasks: []
  },
  {
    parent_id: null,
    wbs_id: "3.0",
    title: "Development Phase",
    description: "Software development and coding",
    assigned_to: "Lead Developer",
    start_date: "2024-03-01",
    end_date: "2024-05-31",
    duration: 91,
    budgeted_cost: 25000,
    actual_cost: 22000,
    progress: 88,
    level: 0,
    is_expanded: true,
    linked_tasks: []
  },
  {
    parent_id: null,
    wbs_id: "4.0",
    title: "Testing Phase",
    description: "System testing and quality assurance",
    assigned_to: "QA Team",
    start_date: "2024-06-01",
    end_date: "2024-06-30",
    duration: 30,
    budgeted_cost: 8000,
    actual_cost: 7500,
    progress: 92,
    level: 0,
    is_expanded: true,
    linked_tasks: []
  },
  {
    parent_id: null,
    wbs_id: "5.0",
    title: "Deployment Phase",
    description: "Deployment to production environment",
    assigned_to: "DevOps Team",
    start_date: "2024-07-01",
    end_date: "2024-07-15",
    duration: 15,
    budgeted_cost: 4000,
    actual_cost: 3800,
    progress: 100,
    level: 0,
    is_expanded: true,
    linked_tasks: []
  }
];

const childSampleData = [
  {
    wbs_id: "1.1",
    title: "Requirements Gathering",
    description: "Collect and analyze project requirements",
    assigned_to: "Business Analyst",
    start_date: "2024-02-01",
    end_date: "2024-02-10",
    duration: 9,
    budgeted_cost: 3000,
    actual_cost: 0,
    progress: 0,
    level: 1,
    is_expanded: false,
    linked_tasks: []
  },
  {
    wbs_id: "1.2",
    title: "Scope Definition",
    description: "Define project scope and objectives",
    assigned_to: "Project Manager",
    start_date: "2024-02-11",
    end_date: "2024-02-20",
    duration: 9,
    budgeted_cost: 2000,
    actual_cost: 0,
    progress: 0,
    level: 1,
    is_expanded: false,
    linked_tasks: []
  },
  {
    wbs_id: "2.1",
    title: "UI Design",
    description: "Design user interface and user experience",
    assigned_to: "UI Designer",
    start_date: "2024-03-01",
    end_date: "2024-03-15",
    duration: 14,
    budgeted_cost: 4000,
    actual_cost: 0,
    progress: 0,
    level: 1,
    is_expanded: false,
    linked_tasks: []
  },
  {
    wbs_id: "2.2",
    title: "Database Design",
    description: "Design database schema and architecture",
    assigned_to: "Database Architect",
    start_date: "2024-03-16",
    end_date: "2024-03-31",
    duration: 15,
    budgeted_cost: 5000,
    actual_cost: 0,
    progress: 0,
    level: 1,
    is_expanded: false,
    linked_tasks: []
  },
  {
    wbs_id: "3.1",
    title: "Frontend Development",
    description: "Develop user interface components",
    assigned_to: "Frontend Developer",
    start_date: "2024-04-01",
    end_date: "2024-04-30",
    duration: 30,
    budgeted_cost: 8000,
    actual_cost: 0,
    progress: 0,
    level: 1,
    is_expanded: false,
    linked_tasks: []
  },
  {
    wbs_id: "3.2",
    title: "Backend Development",
    description: "Develop server-side logic and APIs",
    assigned_to: "Backend Developer",
    start_date: "2024-05-01",
    end_date: "2024-05-31",
    duration: 30,
    budgeted_cost: 10000,
    actual_cost: 0,
    progress: 0,
    level: 1,
    is_expanded: false,
    linked_tasks: []
  },
  {
    wbs_id: "4.1",
    title: "Unit Testing",
    description: "Perform unit tests on individual components",
    assigned_to: "Software Tester",
    start_date: "2024-06-01",
    end_date: "2024-06-10",
    duration: 9,
    budgeted_cost: 2000,
    actual_cost: 0,
    progress: 0,
    level: 1,
    is_expanded: false,
    linked_tasks: []
  },
  {
    wbs_id: "4.2",
    title: "Integration Testing",
    description: "Perform integration tests on combined components",
    assigned_to: "Software Tester",
    start_date: "2024-06-11",
    end_date: "2024-06-20",
    duration: 9,
    budgeted_cost: 3000,
    actual_cost: 0,
    progress: 0,
    level: 1,
    is_expanded: false,
    linked_tasks: []
  },
  {
    wbs_id: "5.1",
    title: "Staging Deployment",
    description: "Deploy to staging environment for final testing",
    assigned_to: "DevOps Engineer",
    start_date: "2024-07-01",
    end_date: "2024-07-07",
    duration: 6,
    budgeted_cost: 1500,
    actual_cost: 0,
    progress: 0,
    level: 1,
    is_expanded: false,
    linked_tasks: []
  },
  {
    wbs_id: "5.2",
    title: "Production Deployment",
    description: "Deploy to production environment",
    assigned_to: "DevOps Engineer",
    start_date: "2024-07-08",
    end_date: "2024-07-15",
    duration: 7,
    budgeted_cost: 2500,
    actual_cost: 0,
    progress: 0,
    level: 1,
    is_expanded: false,
    linked_tasks: []
  }
];
