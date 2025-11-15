import { supabase } from '@/integrations/supabase/client';
import { WBSItem, WBSItemInput, WBSPredecessor } from '@/types/wbs';
import { buildHierarchy } from '@/utils/wbsUtils';


export class WBSService {
  // Load WBS items for a project
  static async loadWBSItems(projectId: string, companyId: string): Promise<WBSItem[]> {
    console.log('🔍 Loading WBS items for project:', projectId);
    
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout - please try again')), 15000); // 15 second timeout
    });
    
    // Race between the query and timeout
    const queryPromise = supabase
      .from('wbs_items')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });

    const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

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
    console.log('🔍 WBSService.createWBSItem called with:', itemData);
    
    // Validate required fields
    if (!itemData.company_id) {
      throw new Error('company_id is required');
    }
    if (!itemData.project_id) {
      throw new Error('project_id is required');
    }
    if (!itemData.wbs_id) {
      throw new Error('wbs_id is required');
    }
    if (itemData.title === undefined || itemData.title === null) {
      throw new Error('title is required');
    }
    
    const insertData = {
      company_id: itemData.company_id,
      project_id: itemData.project_id,
      parent_id: itemData.parent_id || null,
      wbs_id: itemData.wbs_id,
      title: itemData.title || '', // Ensure title is never null
      description: itemData.description || '',
      assigned_to: itemData.assigned_to || null,
      start_date: itemData.start_date || null,
      end_date: itemData.end_date || null,
      duration: itemData.duration ?? 0,
      budgeted_cost: itemData.budgeted_cost ?? 0,
      actual_cost: itemData.actual_cost ?? 0,
      progress: itemData.progress ?? 0,
      status: itemData.status || 'Not Started',
      health: itemData.health || 'Good',
      progress_status: itemData.progress_status || 'On Track',
      at_risk: itemData.at_risk ?? false,
      level: itemData.level ?? 0,
      category: itemData.category || null,
      priority: itemData.priority || 'Medium',
      is_expanded: itemData.is_expanded !== undefined ? Boolean(itemData.is_expanded) : true,
      predecessors: (itemData.predecessors || []) as any,
      linked_tasks: itemData.linked_tasks || [],
      sort_order: itemData.sort_order ?? null
    };

    console.log('📝 Inserting WBS item with data:', insertData);

    const { data, error } = await supabase
      .from('wbs_items')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase insert error:', error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log('✅ WBS item created successfully:', data);
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
        // Handle date fields - ensure null is passed for clearing, not empty strings
        else if ((key === 'start_date' || key === 'end_date') && (value === '' || value === null || value === undefined)) {
          dbUpdates[key] = null;
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