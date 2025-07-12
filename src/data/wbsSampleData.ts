import { supabase } from '@/integrations/supabase/client';

export interface WBSItem {
  id?: string;
  company_id: string;
  project_id: string;
  parent_id?: string | null;
  wbs_id: string;
  title: string;
  description?: string | null;
  assigned_to?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  duration?: number | null;
  budgeted_cost?: number | null;
  actual_cost?: number | null;
  progress?: number | null;
  level?: number | null;
  is_expanded?: boolean | null;
  linked_tasks?: any;
  children?: WBSItem[];
  created_at?: string;
  updated_at?: string;
}

export const createSampleWBSData = async (projectId: string, companyId: string): Promise<WBSItem[]> => {
  if (!companyId) {
    throw new Error('Company ID is required to create WBS items');
  }

  const sampleItems = [
    {
      company_id: companyId,
      project_id: projectId,
      parent_id: null,
      wbs_id: '1.0',
      title: 'Site Preparation',
      description: 'Initial site preparation and setup activities',
      assigned_to: 'John Smith',
      start_date: '2024-07-15',
      end_date: '2024-08-15',
      duration: 31,
      budgeted_cost: 50000,
      actual_cost: 45000,
      progress: 85,
      level: 0,
      is_expanded: true,
      linked_tasks: []
    },
    {
      company_id: companyId,
      project_id: projectId,
      parent_id: null,
      wbs_id: '2.0',
      title: 'Foundation Work',
      description: 'Foundation excavation and concrete pouring',
      assigned_to: 'Mike Johnson',
      start_date: '2024-08-16',
      end_date: '2024-09-30',
      duration: 45,
      budgeted_cost: 120000,
      actual_cost: 85000,
      progress: 65,
      level: 0,
      is_expanded: true,
      linked_tasks: []
    },
    {
      company_id: companyId,
      project_id: projectId,
      parent_id: null,
      wbs_id: '3.0',
      title: 'Structural Framework',
      description: 'Steel and concrete structural work',
      assigned_to: 'Sarah Davis',
      start_date: '2024-10-01',
      end_date: '2024-12-15',
      duration: 75,
      budgeted_cost: 200000,
      actual_cost: 0,
      progress: 0,
      level: 0,
      is_expanded: false,
      linked_tasks: []
    }
  ];

  // Create the items in the database
  const createdItems: WBSItem[] = [];
  
  for (const item of sampleItems) {
    try {
      const { data, error } = await supabase
        .from('wbs_items')
        .insert(item)
        .select()
        .single();

      if (error) throw error;

      createdItems.push({
        id: data.id,
        company_id: data.company_id,
        project_id: data.project_id,
        parent_id: data.parent_id,
        wbs_id: data.wbs_id,
        title: data.title,
        description: data.description,
        assigned_to: data.assigned_to,
        start_date: data.start_date,
        end_date: data.end_date,
        duration: data.duration || 0,
        budgeted_cost: data.budgeted_cost ? Number(data.budgeted_cost) : undefined,
        actual_cost: data.actual_cost ? Number(data.actual_cost) : undefined,
        progress: data.progress || 0,
        level: data.level,
        is_expanded: data.is_expanded,
        linked_tasks: Array.isArray(data.linked_tasks) ? (data.linked_tasks as string[]) : [],
        children: [],
        created_at: data.created_at,
        updated_at: data.updated_at
      });
    } catch (err) {
      console.error('Error creating sample WBS item:', err);
    }
  }

  // Now create some child items for the first parent
  if (createdItems.length > 0) {
    const parentId = createdItems[0].id;
    const childItems = [
      {
        company_id: companyId,
        project_id: projectId,
        parent_id: parentId,
        wbs_id: '1.1',
        title: 'Site Survey',
        description: 'Conduct detailed site survey',
        assigned_to: 'John Smith',
        start_date: '2024-07-15',
        end_date: '2024-07-20',
        duration: 5,
        budgeted_cost: 15000,
        actual_cost: 14000,
        progress: 100,
        level: 1,
        is_expanded: false,
        linked_tasks: []
      },
      {
        company_id: companyId,
        project_id: projectId,
        parent_id: parentId,
        wbs_id: '1.2',
        title: 'Site Clearing',
        description: 'Clear vegetation and debris',
        assigned_to: 'John Smith',
        start_date: '2024-07-21',
        end_date: '2024-08-15',
        duration: 25,
        budgeted_cost: 35000,
        actual_cost: 31000,
        progress: 75,
        level: 1,
        is_expanded: false,
        linked_tasks: []
      }
    ];

    for (const childItem of childItems) {
      try {
        const { data, error } = await supabase
          .from('wbs_items')
          .insert(childItem)
          .select()
          .single();

        if (error) throw error;

        const child: WBSItem = {
          id: data.id,
          company_id: data.company_id,
          project_id: data.project_id,
          parent_id: data.parent_id,
          wbs_id: data.wbs_id,
          title: data.title,
          description: data.description,
          assigned_to: data.assigned_to,
          start_date: data.start_date,
          end_date: data.end_date,
          duration: data.duration || 0,
          budgeted_cost: data.budgeted_cost ? Number(data.budgeted_cost) : undefined,
          actual_cost: data.actual_cost ? Number(data.actual_cost) : undefined,
          progress: data.progress || 0,
          level: data.level,
          is_expanded: data.is_expanded,
          linked_tasks: Array.isArray(data.linked_tasks) ? (data.linked_tasks as string[]) : [],
          children: [],
          created_at: data.created_at,
          updated_at: data.updated_at
        };

        createdItems[0].children!.push(child);
      } catch (err) {
        console.error('Error creating sample child WBS item:', err);
      }
    }
  }

  return createdItems;
};