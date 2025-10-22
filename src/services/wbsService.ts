import { supabase } from '@/integrations/supabase/client';
import { WBSItem, WBSItemInput, WBSPredecessor } from '@/types/wbs';
import { buildHierarchy } from '@/utils/wbsUtils';


export class WBSService {
  // Load WBS items for a project
  static async loadWBSItems(projectId: string, companyId: string): Promise<WBSItem[]> {
    console.log('🔍 Loading WBS items for project:', projectId);
    
    const { data, error } = await supabase
      .from('wbs_items')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;

    console.log('📊 Raw WBS data from database:', data?.length || 0, 'items');
    data?.forEach(item => console.log(`  ${item.wbs_id}: ${item.title} (Level ${item.level}) - RFQ: ${item.rfq_required}`));

    // If no data exists, return empty array (no seeding)
    if (!data || data.length === 0) {
      console.log('🏗️ No WBS data found for project. Returning empty dataset.');
      return [];
    }

    // Convert database records to WBSItem format with proper predecessors handling
    const wbsItems = data.map(item => {
      // Normalize is_expanded to always be a boolean
      let isExpanded = true; // default
      if (typeof item.is_expanded === 'boolean') {
        isExpanded = item.is_expanded;
      } else if (item.is_expanded === null || item.is_expanded === undefined) {
        isExpanded = true; // default for null/undefined
      } else if (typeof item.is_expanded === 'object' && item.is_expanded !== null) {
        // Handle malformed object case like { "_type": "undefined", "value": "undefined" }
        const expandedObj = item.is_expanded as any;
        if (expandedObj.value === 'false' || expandedObj.value === false) {
          isExpanded = false;
        } else if (expandedObj.value === 'true' || expandedObj.value === true) {
          isExpanded = true;
        }
      }
      
      // Log task-enabled items for debugging
      if (item.is_task_enabled) {
        console.log(`🟢 Task-enabled WBS item: ${item.title} (${item.id}) - linked_task_id: ${item.linked_task_id}`);
      }
      
      return {
        ...item,
        is_expanded: isExpanded, // Ensure it's always a boolean
        is_task_enabled: item.is_task_enabled || false, // Explicitly include task conversion fields
        linked_task_id: item.linked_task_id || null,
        task_conversion_date: item.task_conversion_date || null,
        predecessors: (item.predecessors as unknown as WBSPredecessor[]) || [],
        linked_tasks: Array.isArray(item.linked_tasks) ? (item.linked_tasks as string[]) : []
      };
    });

    // Build and return hierarchy
    const hierarchyData = buildHierarchy(wbsItems);
    console.log('🌳 Built hierarchy with', hierarchyData.length, 'root items');
    return hierarchyData;
  }

  // Create a new WBS item
  static async createWBSItem(itemData: WBSItemInput & { sort_order?: number }): Promise<any> {
    const insertData = {
      company_id: itemData.company_id,
      project_id: itemData.project_id,
      parent_id: itemData.parent_id || null,
      wbs_id: itemData.wbs_id,
      title: itemData.title,
      description: itemData.description,
      assigned_to: itemData.assigned_to,
      start_date: itemData.start_date,
      end_date: itemData.end_date,
      duration: itemData.duration,
      budgeted_cost: itemData.budgeted_cost,
      actual_cost: itemData.actual_cost,
      progress: itemData.progress,
      status: itemData.status,
      health: itemData.health,
      progress_status: itemData.progress_status,
      at_risk: itemData.at_risk,
      level: itemData.level,
      category: itemData.category,
      priority: itemData.priority,
      is_expanded: itemData.is_expanded !== undefined ? Boolean(itemData.is_expanded) : true,
      predecessors: (itemData.predecessors || []) as any,
      linked_tasks: itemData.linked_tasks,
      sort_order: itemData.sort_order
    };

    const { data, error } = await supabase
      .from('wbs_items')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update a WBS item
  static async updateWBSItem(id: string, updates: Partial<WBSItem>): Promise<void> {
    const dbUpdates: any = {};
    
    // Map fields to database columns
    Object.keys(updates).forEach(key => {
      if (key !== 'children' && key !== 'updated_at') {
        const value = updates[key as keyof WBSItem];
        
        // Ensure is_expanded is always a boolean
        if (key === 'is_expanded') {
          dbUpdates[key] = Boolean(value);
        }
        // Handle parent_id specially - ensure it's a proper UUID or null
        else if (key === 'parent_id') {
          // Convert to string and validate it's a proper UUID or null
          if (value === null || value === undefined) {
            dbUpdates[key] = null;
          } else if (typeof value === 'string') {
            dbUpdates[key] = value;
          } else {
            console.error('Invalid parent_id format:', value);
            dbUpdates[key] = null;
          }
        }
        // Handle predecessors field specially - ensure it's properly formatted as JSON
        else if (key === 'predecessors' && Array.isArray(value)) {
          dbUpdates[key] = value as any;
        } else {
          dbUpdates[key] = value;
        }
      }
    });

    const { error } = await supabase
      .from('wbs_items')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;
  }

  // Delete a WBS item and all its descendants
  static async deleteWBSItem(id: string): Promise<void> {
    console.log('🗑️ Deleting WBS item:', id);
    
    // Use the database function which handles recursive deletion
    // This bypasses RLS issues with CASCADE deletes
    const { data, error } = await supabase.rpc('delete_wbs_item_with_children', {
      item_id: id
    });

    if (error) {
      console.error('❌ Error deleting WBS item:', error);
      throw error;
    }
    
    console.log('✅ Successfully deleted WBS item:', id);
  }
}