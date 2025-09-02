import { supabase } from '@/integrations/supabase/client';
import { WBSItem, WBSItemInput } from '@/types/wbs';
import { buildHierarchy } from '@/utils/wbsUtils';


export class WBSService {
  // Load WBS items for a project
  static async loadWBSItems(projectId: string, companyId: string): Promise<WBSItem[]> {
    console.log('🔍 Loading WBS items for project:', projectId);
    
    const { data, error } = await supabase
      .from('wbs_items')
      .select('*')
      .eq('project_id', projectId)
      .eq('company_id', companyId)
      .order('level', { ascending: true })
      .order('wbs_id', { ascending: true });

    if (error) throw error;

    console.log('📊 Raw WBS data from database:', data?.length || 0, 'items');
    data?.forEach(item => console.log(`  ${item.wbs_id}: ${item.title} (Level ${item.level})`));

    // If no data exists, seed a minimal default WBS so users always see something
    if (!data || data.length === 0) {
      console.log('🏗️ No WBS data found. Seeding default structure...');

      // 1) Create default Phase (level 0)
      const { data: phase, error: phaseErr } = await supabase
        .from('wbs_items')
        .insert({
          company_id: companyId,
          project_id: projectId,
          parent_id: null,
          wbs_id: '1.0',
          title: 'Phase 1',
          description: 'Initial phase',
          level: 0,
          category: 'Stage',
          is_expanded: true,
          linked_tasks: [],
          progress: 0,
          status: 'Not Started'
        })
        .select()
        .single();
      if (phaseErr) throw phaseErr;

      // 2) Create default Component (level 1)
      const { data: component, error: compErr } = await supabase
        .from('wbs_items')
        .insert({
          company_id: companyId,
          project_id: projectId,
          parent_id: phase.id,
          wbs_id: '1.1',
          title: 'Component 1',
          description: 'First component',
          level: 1,
          category: 'Component',
          is_expanded: true,
          linked_tasks: [],
          progress: 0,
          status: 'Not Started'
        })
        .select()
        .single();
      if (compErr) throw compErr;

      // 3) Create default Element (level 2)
      const { data: element, error: elemErr } = await supabase
        .from('wbs_items')
        .insert({
          company_id: companyId,
          project_id: projectId,
          parent_id: component.id,
          wbs_id: '1.1.1',
          title: 'Task 1',
          description: 'First task',
          level: 2,
          category: 'Element',
          is_expanded: false,
          linked_tasks: [],
          progress: 0,
          status: 'Not Started',
          duration: 1
        })
        .select()
        .single();
      if (elemErr) throw elemErr;

      const inserted = [phase, component, element];
      const hierarchyData = buildHierarchy(inserted);
      console.log('🌳 Seeded hierarchy with', hierarchyData.length, 'root items');
      return hierarchyData;
    }

    // Build and return hierarchy
    const hierarchyData = buildHierarchy(data);
    console.log('🌳 Built hierarchy with', hierarchyData.length, 'root items');
    return hierarchyData;
  }

  // Create a new WBS item
  static async createWBSItem(itemData: WBSItemInput): Promise<any> {
    const { data, error } = await supabase
      .from('wbs_items')
      .insert({
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
        is_expanded: itemData.is_expanded,
        linked_tasks: itemData.linked_tasks
      })
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
      if (key !== 'children' && key !== 'created_at' && key !== 'updated_at') {
        dbUpdates[key] = updates[key as keyof WBSItem];
      }
    });

    const { error } = await supabase
      .from('wbs_items')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;
  }

  // Delete a WBS item
  static async deleteWBSItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('wbs_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}