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
  predecessors?: any; // Structured predecessor data
  children?: WBSItem[];
  created_at?: string;
  updated_at?: string;
}

export const createSampleWBSData = async (projectId: string, companyId: string): Promise<WBSItem[]> => {
  if (!companyId) {
    throw new Error('Company ID is required to create WBS items');
  }

  console.log('🏗️ Creating comprehensive WBS sample data for project:', projectId);

  // Clear any existing data for this project first
  try {
    await supabase
      .from('wbs_items')
      .delete()
      .eq('project_id', projectId);
    console.log('🧹 Cleared existing WBS data');
  } catch (error) {
    console.warn('⚠️ Could not clear existing data:', error);
  }

  // Create comprehensive WBS structure matching the Project Scope
  const allItems = [
    // Phase 1: Planning & Design Phase (Level 0)
    {
      company_id: companyId,
      project_id: projectId,
      parent_id: null,
      wbs_id: '1.0',
      title: 'Planning & Design Phase',
      description: 'Initial planning, design and preparation activities',
      assigned_to: 'Project Manager',
      start_date: '2024-07-01',
      end_date: '2024-09-30',
      duration: 91,
      budgeted_cost: 150000,
      actual_cost: 65000,
      progress: 45,
      level: 0,
      is_expanded: true,
      linked_tasks: [],
      predecessors: []
    },
    // Components under Planning & Design (Level 1)
    {
      company_id: companyId,
      project_id: projectId,
      parent_id: null, // Will be updated after parent is created
      wbs_id: '1.1',
      title: 'Site Preparation',
      description: 'Initial site preparation and setup activities',
      assigned_to: 'Site Supervisor',
      start_date: '2024-07-01',
      end_date: '2024-08-15',
      duration: 45,
      budgeted_cost: 50000,
      actual_cost: 45000,
      progress: 90,
      level: 1,
      is_expanded: true,
      linked_tasks: [],
      predecessors: []
    },
    // Elements under Site Preparation (Level 2)
    {
      company_id: companyId,
      project_id: projectId,
      parent_id: null, // Will be updated
      wbs_id: '1.1.1',
      title: 'Site Survey',
      description: 'Topographical and boundary survey',
      assigned_to: 'Survey Team',
      start_date: '2024-07-01',
      end_date: '2024-07-14',
      duration: 14,
      budgeted_cost: 15000,
      actual_cost: 15000,
      progress: 100,
      level: 2,
      is_expanded: false,
      linked_tasks: [],
      predecessors: []
    },
    {
      company_id: companyId,
      project_id: projectId,
      parent_id: null, // Will be updated
      wbs_id: '1.1.2',
      title: 'Site Clearing',
      description: 'Clear vegetation and prepare site',
      assigned_to: 'Clearing Crew',
      start_date: '2024-07-15',
      end_date: '2024-08-15',
      duration: 31,
      budgeted_cost: 35000,
      actual_cost: 30000,
      progress: 80,
      level: 2,
      is_expanded: false,
      linked_tasks: [],
      predecessors: [{ id: '1.1.1', type: 'FS', lag: 0 }] // Depends on Site Survey
    },
    // Design Development Component (Level 1)
    {
      company_id: companyId,
      project_id: projectId,
      parent_id: null, // Will be updated
      wbs_id: '1.2',
      title: 'Design Development',
      description: 'Architectural and engineering design',
      assigned_to: 'Design Team',
      start_date: '2024-07-15',
      end_date: '2024-09-30',
      duration: 76,
      budgeted_cost: 100000,
      actual_cost: 20000,
      progress: 25,
      level: 1,
      is_expanded: true,
      linked_tasks: [],
      predecessors: [{ id: '1.1.1', type: 'FS', lag: 0 }] // Can start after Site Survey
    },
    // Elements under Design Development (Level 2)
    {
      company_id: companyId,
      project_id: projectId,
      parent_id: null, // Will be updated
      wbs_id: '1.2.1',
      title: 'Architectural Plans',
      description: 'Detailed architectural drawings',
      assigned_to: 'Architect',
      start_date: '2024-07-15',
      end_date: '2024-08-30',
      duration: 46,
      budgeted_cost: 50000,
      actual_cost: 15000,
      progress: 30,
      level: 2,
      is_expanded: false,
      linked_tasks: [],
      predecessors: []
    },
    {
      company_id: companyId,
      project_id: projectId,
      parent_id: null, // Will be updated
      wbs_id: '1.2.2',
      title: 'Structural Engineering',
      description: 'Structural design and calculations',
      assigned_to: 'Structural Engineer',
      start_date: '2024-08-01',
      end_date: '2024-09-30',
      duration: 60,
      budgeted_cost: 50000,
      actual_cost: 5000,
      progress: 10,
      level: 2,
      is_expanded: false,
      linked_tasks: [],
      predecessors: [{ id: '1.2.1', type: 'SS', lag: 15 }] // Can start 15 days after Architectural Plans start
    },

    // Phase 2: Construction Phase (Level 0)
    {
      company_id: companyId,
      project_id: projectId,
      parent_id: null,
      wbs_id: '2.0',
      title: 'Construction Phase',
      description: 'Main construction and implementation activities',
      assigned_to: 'Construction Manager',
      start_date: '2024-10-01',
      end_date: '2025-06-30',
      duration: 270,
      budgeted_cost: 850000,
      actual_cost: 0,
      progress: 0,
      level: 0,
      is_expanded: true,
      linked_tasks: [],
      predecessors: [{ id: '1.2.2', type: 'FS', lag: 0 }] // Must complete design first
    },
    // Foundation Work Component (Level 1)
    {
      company_id: companyId,
      project_id: projectId,
      parent_id: null, // Will be updated
      wbs_id: '2.1',
      title: 'Foundation Work',
      description: 'Foundation excavation and concrete work',
      assigned_to: 'Foundation Contractor',
      start_date: '2024-10-01',
      end_date: '2024-12-15',
      duration: 75,
      budgeted_cost: 200000,
      actual_cost: 0,
      progress: 0,
      level: 1,
      is_expanded: true,
      linked_tasks: [],
      predecessors: [{ id: '1.1.2', type: 'FS', lag: 0 }] // Needs site clearing complete
    },
    // Elements under Foundation Work (Level 2)
    {
      company_id: companyId,
      project_id: projectId,
      parent_id: null, // Will be updated
      wbs_id: '2.1.1',
      title: 'Excavation',
      description: 'Site excavation for foundations',
      assigned_to: 'Excavation Crew',
      start_date: '2024-10-01',
      end_date: '2024-10-30',
      duration: 30,
      budgeted_cost: 50000,
      actual_cost: 0,
      progress: 0,
      level: 2,
      is_expanded: false,
      linked_tasks: [],
      predecessors: []
    },
    {
      company_id: companyId,
      project_id: projectId,
      parent_id: null, // Will be updated
      wbs_id: '2.1.2',
      title: 'Concrete Footings',
      description: 'Pour concrete footings and foundations',
      assigned_to: 'Concrete Crew',
      start_date: '2024-11-01',
      end_date: '2024-12-15',
      duration: 45,
      budgeted_cost: 150000,
      actual_cost: 0,
      progress: 0,
      level: 2,
      is_expanded: false,
      linked_tasks: [],
      predecessors: [{ id: '2.1.1', type: 'FS', lag: 0 }] // Must complete excavation first
    },
    // Structural Framework Component (Level 1)
    {
      company_id: companyId,
      project_id: projectId,
      parent_id: null, // Will be updated
      wbs_id: '2.2',
      title: 'Structural Framework',
      description: 'Steel or concrete structural framework',
      assigned_to: 'Structural Contractor',
      start_date: '2024-12-16',
      end_date: '2025-03-31',
      duration: 105,
      budgeted_cost: 350000,
      actual_cost: 0,
      progress: 0,
      level: 1,
      is_expanded: true,
      linked_tasks: [],
      predecessors: [{ id: '2.1.2', type: 'FS', lag: 0 }] // Foundation must be complete
    },
    // Elements under Structural Framework (Level 2)
    {
      company_id: companyId,
      project_id: projectId,
      parent_id: null, // Will be updated
      wbs_id: '2.2.1',
      title: 'Steel Erection',
      description: 'Erect steel structural framework',
      assigned_to: 'Steel Crew',
      start_date: '2024-12-16',
      end_date: '2025-02-28',
      duration: 75,
      budgeted_cost: 200000,
      actual_cost: 0,
      progress: 0,
      level: 2,
      is_expanded: false,
      linked_tasks: [],
      predecessors: []
    },
    {
      company_id: companyId,
      project_id: projectId,
      parent_id: null, // Will be updated
      wbs_id: '2.2.2',
      title: 'Floor Systems',
      description: 'Install floor decking and systems',
      assigned_to: 'Floor Crew',
      start_date: '2025-03-01',
      end_date: '2025-03-31',
      duration: 30,
      budgeted_cost: 150000,
      actual_cost: 0,
      progress: 0,
      level: 2,
      is_expanded: false,
      linked_tasks: [],
      predecessors: [{ id: '2.2.1', type: 'FS', lag: 0 }] // Steel must be erected first
    },

    // Phase 3: Finishing Phase (Level 0)
    {
      company_id: companyId,
      project_id: projectId,
      parent_id: null,
      wbs_id: '3.0',
      title: 'Finishing Phase',
      description: 'Interior and exterior finishing work',
      assigned_to: 'Finishing Manager',
      start_date: '2025-04-01',
      end_date: '2025-08-31',
      duration: 150,
      budgeted_cost: 400000,
      actual_cost: 0,
      progress: 0,
      level: 0,
      is_expanded: true,
      linked_tasks: [],
      predecessors: [{ id: '2.2.2', type: 'FS', lag: 0 }] // Structure must be complete
    },
    // Building Envelope Component (Level 1)
    {
      company_id: companyId,
      project_id: projectId,
      parent_id: null, // Will be updated
      wbs_id: '3.1',
      title: 'Building Envelope',
      description: 'Exterior walls, windows, and roofing',
      assigned_to: 'Envelope Contractor',
      start_date: '2025-04-01',
      end_date: '2025-06-30',
      duration: 90,
      budgeted_cost: 200000,
      actual_cost: 0,
      progress: 0,
      level: 1,
      is_expanded: true,
      linked_tasks: [],
      predecessors: []
    },
    // Elements under Building Envelope (Level 2)
    {
      company_id: companyId,
      project_id: projectId,
      parent_id: null, // Will be updated
      wbs_id: '3.1.1',
      title: 'Exterior Walls',
      description: 'Install exterior wall systems',
      assigned_to: 'Wall Crew',
      start_date: '2025-04-01',
      end_date: '2025-05-15',
      duration: 45,
      budgeted_cost: 100000,
      actual_cost: 0,
      progress: 0,
      level: 2,
      is_expanded: false,
      linked_tasks: [],
      predecessors: []
    },
    {
      company_id: companyId,
      project_id: projectId,
      parent_id: null, // Will be updated
      wbs_id: '3.1.2',
      title: 'Roofing System',
      description: 'Install roofing and waterproofing',
      assigned_to: 'Roofing Crew',
      start_date: '2025-05-16',
      end_date: '2025-06-30',
      duration: 45,
      budgeted_cost: 100000,
      actual_cost: 0,
      progress: 0,
      level: 2,
      is_expanded: false,
      linked_tasks: [],
      predecessors: [{ id: '3.1.1', type: 'FS', lag: 0 }] // Walls must be complete first
    },
    // Interior Finishes Component (Level 1)
    {
      company_id: companyId,
      project_id: projectId,
      parent_id: null, // Will be updated
      wbs_id: '3.2',
      title: 'Interior Finishes',
      description: 'Interior finishing and fixtures',
      assigned_to: 'Interior Contractor',
      start_date: '2025-07-01',
      end_date: '2025-08-31',
      duration: 60,
      budgeted_cost: 200000,
      actual_cost: 0,
      progress: 0,
      level: 1,
      is_expanded: true,
      linked_tasks: [],
      predecessors: [{ id: '3.1.2', type: 'FS', lag: 0 }] // Envelope must be complete
    },
    // Elements under Interior Finishes (Level 2)
    {
      company_id: companyId,
      project_id: projectId,
      parent_id: null, // Will be updated
      wbs_id: '3.2.1',
      title: 'Flooring',
      description: 'Install flooring throughout building',
      assigned_to: 'Flooring Crew',
      start_date: '2025-07-01',
      end_date: '2025-07-31',
      duration: 30,
      budgeted_cost: 80000,
      actual_cost: 0,
      progress: 0,
      level: 2,
      is_expanded: false,
      linked_tasks: [],
      predecessors: []
    },
    {
      company_id: companyId,
      project_id: projectId,
      parent_id: null, // Will be updated
      wbs_id: '3.2.2',
      title: 'Painting & Finishes',
      description: 'Paint and final interior finishes',
      assigned_to: 'Paint Crew',
      start_date: '2025-08-01',
      end_date: '2025-08-31',
      duration: 30,
      budgeted_cost: 120000,
      actual_cost: 0,
      progress: 0,
      level: 2,
      is_expanded: false,
      linked_tasks: [],
      predecessors: [{ id: '3.2.1', type: 'FS', lag: 0 }] // Flooring must be installed first
    }
  ];

  console.log(`📊 Creating ${allItems.length} WBS items...`);

  // Create all items and track parent-child relationships
  const createdItems: WBSItem[] = [];
  const itemsByWbsId: Record<string, WBSItem> = {};

  // First pass: Create all items
  for (const item of allItems) {
    try {
      const { data, error } = await supabase
        .from('wbs_items')
        .insert(item)
        .select()
        .single();

      if (error) throw error;

      const createdItem: WBSItem = {
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
        predecessors: Array.isArray(data.predecessors) ? data.predecessors : [],
        linked_tasks: Array.isArray(data.linked_tasks) ? (data.linked_tasks as string[]) : [],
        children: [],
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      createdItems.push(createdItem);
      itemsByWbsId[createdItem.wbs_id] = createdItem;
      console.log(`✅ Created: ${createdItem.wbs_id} - ${createdItem.title}`);
    } catch (err) {
      console.error(`❌ Error creating WBS item ${item.wbs_id}:`, err);
    }
  }

  // Second pass: Update parent-child relationships
  for (const item of createdItems) {
    if (item.level === 1) {
      // Level 1 items belong to level 0 items
      const parentWbsId = item.wbs_id.split('.')[0] + '.0';
      const parent = itemsByWbsId[parentWbsId];
      if (parent) {
        await supabase
          .from('wbs_items')
          .update({ parent_id: parent.id })
          .eq('id', item.id);
        console.log(`🔗 Linked ${item.wbs_id} to parent ${parentWbsId}`);
      }
    } else if (item.level === 2) {
      // Level 2 items belong to level 1 items
      const wbsParts = item.wbs_id.split('.');
      const parentWbsId = wbsParts[0] + '.' + wbsParts[1];
      const parent = itemsByWbsId[parentWbsId];
      if (parent) {
        await supabase
          .from('wbs_items')
          .update({ parent_id: parent.id })
          .eq('id', item.id);
        console.log(`🔗 Linked ${item.wbs_id} to parent ${parentWbsId}`);
      }
    }
  }

  // Third pass: Update predecessor relationships with actual IDs
  for (const item of createdItems) {
    if (item.predecessors && Array.isArray(item.predecessors) && item.predecessors.length > 0) {
      const updatedPredecessors = item.predecessors.map((pred: any) => {
        const predecessorItem = itemsByWbsId[pred.id];
        if (predecessorItem && predecessorItem.id) {
          return {
            ...pred,
            id: predecessorItem.id // Replace WBS ID with actual database ID
          };
        }
        return pred;
      }).filter((pred: any) => itemsByWbsId[pred.id] || createdItems.some(ci => ci.id === pred.id));

      if (updatedPredecessors.length > 0) {
        await supabase
          .from('wbs_items')
          .update({ predecessors: updatedPredecessors })
          .eq('id', item.id);
        console.log(`🔗 Updated predecessors for ${item.wbs_id}`);
      }
    }
  }

  console.log(`🎉 Successfully created ${createdItems.length} WBS items with proper hierarchy and dependencies`);
  return createdItems;
};