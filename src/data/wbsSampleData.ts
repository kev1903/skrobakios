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
    // Level 0 - Main Phases
    {
      company_id: companyId,
      project_id: projectId,
      parent_id: null,
      wbs_id: '1',
      title: 'Planning & Design Phase',
      description: 'Initial planning, design and preparation activities',
      assigned_to: null,
      start_date: '2024-07-01',
      end_date: '2024-09-30',
      duration: 91,
      budgeted_cost: 150000,
      actual_cost: 65000,
      progress: 45,
      level: 0,
      is_expanded: true,
      linked_tasks: []
    },
    {
      company_id: companyId,
      project_id: projectId,
      parent_id: null,
      wbs_id: '2',
      title: 'Construction Phase',
      description: 'Main construction and implementation activities',
      assigned_to: null,
      start_date: '2024-10-01',
      end_date: '2025-06-30',
      duration: 270,
      budgeted_cost: 850000,
      actual_cost: 0,
      progress: 0,
      level: 0,
      is_expanded: true,
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

  // Create sub-items for Planning & Design Phase
  if (createdItems.length > 0) {
    const planningPhaseId = createdItems[0].id;
    
    // Level 1 - Components under Planning & Design
    const planningComponents = [
      {
        company_id: companyId,
        project_id: projectId,
        parent_id: planningPhaseId,
        wbs_id: '1.1',
        title: 'Site Preparation',
        description: 'Initial site preparation and setup activities',
        assigned_to: null,
        start_date: '2024-07-01',
        end_date: '2024-08-15',
        duration: 45,
        budgeted_cost: 50000,
        actual_cost: 45000,
        progress: 65,
        level: 1,
        is_expanded: true,
        linked_tasks: []
      },
      {
        company_id: companyId,
        project_id: projectId,
        parent_id: planningPhaseId,
        wbs_id: '1.2',
        title: 'Design Development',
        description: 'Architectural and engineering design',
        assigned_to: null,
        start_date: '2024-07-15',
        end_date: '2024-09-30',
        duration: 76,
        budgeted_cost: 100000,
        actual_cost: 20000,
        progress: 0,
        level: 1,
        is_expanded: true,
        linked_tasks: []
      }
    ];

    const createdComponents: any[] = [];
    
    for (const component of planningComponents) {
      try {
        const { data, error } = await supabase
          .from('wbs_items')
          .insert(component)
          .select()
          .single();
        if (error) throw error;
        createdComponents.push(data);
      } catch (err) {
        console.error('Error creating component:', err);
      }
    }

    // Level 2 - Elements under Site Preparation
    if (createdComponents.length > 0) {
      const sitePrepId = createdComponents[0].id;
      const sitePrepElements = [
        {
          company_id: companyId,
          project_id: projectId,
          parent_id: sitePrepId,
          wbs_id: '1.1.1',
          title: 'Site Survey',
          description: 'Conduct detailed site survey and measurements',
          assigned_to: 'John Smith',
          start_date: '2024-07-01',
          end_date: '2024-07-07',
          duration: 7,
          budgeted_cost: 15000,
          actual_cost: 15000,
          progress: 100,
          level: 2,
          is_expanded: false,
          linked_tasks: []
        },
        {
          company_id: companyId,
          project_id: projectId,
          parent_id: sitePrepId,
          wbs_id: '1.1.2',
          title: 'Soil Testing',
          description: 'Perform geotechnical soil analysis',
          assigned_to: 'Jane Doe',
          start_date: '2024-07-08',
          end_date: '2024-07-21',
          duration: 14,
          budgeted_cost: 20000,
          actual_cost: 18000,
          progress: 75,
          level: 2,
          is_expanded: false,
          linked_tasks: []
        }
      ];

      for (const element of sitePrepElements) {
        try {
          const { data, error } = await supabase
            .from('wbs_items')
            .insert(element)
            .select()
            .single();
          if (error) throw error;
        } catch (err) {
          console.error('Error creating element:', err);
        }
      }

      // Elements under Design Development
      const designDevId = createdComponents[1].id;
      const designElements = [
        {
          company_id: companyId,
          project_id: projectId,
          parent_id: designDevId,
          wbs_id: '1.2.1',
          title: 'Architectural Design',
          description: 'Create detailed architectural drawings',
          assigned_to: 'Sarah Wilson',
          start_date: '2024-07-15',
          end_date: '2024-08-30',
          duration: 46,
          budgeted_cost: 60000,
          actual_cost: 0,
          progress: 0,
          level: 2,
          is_expanded: false,
          linked_tasks: []
        }
      ];

      for (const element of designElements) {
        try {
          const { data, error } = await supabase
            .from('wbs_items')
            .insert(element)
            .select()
            .single();
          if (error) throw error;
        } catch (err) {
          console.error('Error creating design element:', err);
        }
      }
    }
  }

  // Create sub-items for Construction Phase
  if (createdItems.length > 1) {
    const constructionPhaseId = createdItems[1].id;
    
    const constructionComponents = [
      {
        company_id: companyId,
        project_id: projectId,
        parent_id: constructionPhaseId,
        wbs_id: '2.1',
        title: 'Foundation Work',
        description: 'Foundation design and construction',
        assigned_to: null,
        start_date: '2024-10-01',
        end_date: '2024-11-30',
        duration: 60,
        budgeted_cost: 200000,
        actual_cost: 0,
        progress: 0,
        level: 1,
        is_expanded: true,
        linked_tasks: []
      },
      {
        company_id: companyId,
        project_id: projectId,
        parent_id: constructionPhaseId,
        wbs_id: '2.2',
        title: 'Structural Framework',
        description: 'Main structural elements and framework',
        assigned_to: null,
        start_date: '2024-12-01',
        end_date: '2025-03-31',
        duration: 120,
        budgeted_cost: 400000,
        actual_cost: 0,
        progress: 0,
        level: 1,
        is_expanded: true,
        linked_tasks: []
      }
    ];

    const createdConstructionComponents: any[] = [];
    
    for (const component of constructionComponents) {
      try {
        const { data, error } = await supabase
          .from('wbs_items')
          .insert(component)
          .select()
          .single();
        if (error) throw error;
        createdConstructionComponents.push(data);
      } catch (err) {
        console.error('Error creating construction component:', err);
      }
    }

    // Add elements under Foundation Work
    if (createdConstructionComponents.length > 0) {
      const foundationId = createdConstructionComponents[0].id;
      const foundationElements = [
        {
          company_id: companyId,
          project_id: projectId,
          parent_id: foundationId,
          wbs_id: '2.1.1',
          title: 'Foundation Design',
          description: 'Structural foundation design and calculations',
          assigned_to: 'Tom Brown',
          start_date: '2024-10-01',
          end_date: '2024-10-15',
          duration: 15,
          budgeted_cost: 30000,
          actual_cost: 0,
          progress: 0,
          level: 2,
          is_expanded: false,
          linked_tasks: []
        },
        {
          company_id: companyId,
          project_id: projectId,
          parent_id: foundationId,
          wbs_id: '2.1.2',
          title: 'Excavation',
          description: 'Excavate foundation areas',
          assigned_to: 'Mike Johnson',
          start_date: '2024-10-16',
          end_date: '2024-11-30',
          duration: 45,
          budgeted_cost: 50000,
          actual_cost: 0,
          progress: 0,
          level: 2,
          is_expanded: false,
          linked_tasks: []
        }
      ];

      for (const element of foundationElements) {
        try {
          const { data, error } = await supabase
            .from('wbs_items')
            .insert(element)
            .select()
            .single();
          if (error) throw error;
        } catch (err) {
          console.error('Error creating foundation element:', err);
        }
      }

      // Add elements under Structural Framework
      if (createdConstructionComponents.length > 1) {
        const structuralId = createdConstructionComponents[1].id;
        const structuralElements = [
          {
            company_id: companyId,
            project_id: projectId,
            parent_id: structuralId,
            wbs_id: '2.2.1',
            title: 'Steel Framework',
            description: 'Install primary steel structural framework',
            assigned_to: 'Alex Davis',
            start_date: '2024-12-01',
            end_date: '2025-02-28',
            duration: 89,
            budgeted_cost: 250000,
            actual_cost: 0,
            progress: 0,
            level: 2,
            is_expanded: false,
            linked_tasks: []
          }
        ];

        for (const element of structuralElements) {
          try {
            const { data, error } = await supabase
              .from('wbs_items')
              .insert(element)
              .select()
              .single();
            if (error) throw error;
          } catch (err) {
            console.error('Error creating structural element:', err);
          }
        }
      }
    }
  }

  return createdItems;
};