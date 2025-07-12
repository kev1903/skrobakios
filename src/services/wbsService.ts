import { supabase } from '@/integrations/supabase/client';
import { WBSItem } from '@/types/wbs';
import { createSampleWBSData } from '@/data/wbsSampleData';

interface WBSItemInput {
  project_id: string;
  parent_id?: string | null;
  wbs_id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  start_date: string;
  end_date: string;
  duration: number;
  budgeted_cost: number;
  actual_cost: number;
  progress: number;
  level: number;
  is_expanded: boolean;
  linked_tasks: string[];
}

export class WBSService {
  // Create sample data for a project - temporarily disabled for company isolation
  static async createSampleData(projectId: string): Promise<WBSItem[]> {
    console.warn('WBS sample data creation is temporarily disabled for company isolation');
    return [];
  }

  // Create a new WBS item - temporarily disabled for company isolation
  static async createWBSItem(itemData: WBSItemInput): Promise<any> {
    console.warn('WBS item creation is temporarily disabled for company isolation');
    throw new Error('WBS item creation temporarily disabled during company isolation implementation');
  }

  // Fetch all WBS items for a project - temporarily disabled for company isolation
  static async getWBSItems(projectId: string): Promise<WBSItem[]> {
    console.warn('WBS item fetching is temporarily disabled for company isolation');
    return [];
  }

  // Update a WBS item
  static async updateWBSItem(id: string, updates: Partial<WBSItemInput>): Promise<boolean> {
    const { error } = await supabase
      .from('wbs_items')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating WBS item:', error);
      return false;
    }

    return true;
  }

  // Delete a WBS item
  static async deleteWBSItem(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('wbs_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting WBS item:', error);
      return false;
    }

    return true;
  }

  // Get children of a specific WBS item - temporarily disabled for company isolation
  static async getChildren(parentId: string): Promise<WBSItem[]> {
    console.warn('WBS child item fetching is temporarily disabled for company isolation');
    return [];
  }

  // Legacy alias for compatibility
  static async loadWBSItems(projectId: string): Promise<WBSItem[]> {
    return this.getWBSItems(projectId);
  }
}