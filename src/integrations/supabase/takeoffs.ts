import { supabase } from './client';

export interface DatabaseTakeoff {
  id: string;
  estimate_id: string;
  name: string;
  type: 'Area' | 'Linear' | 'Number' | 'Volume';
  quantity: string;
  status: 'pending' | 'complete';
  unit: string;
  measurements: any[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

export const takeoffService = {
  // Get all takeoffs for an estimate
  async getTakeoffsByEstimate(estimateId: string): Promise<DatabaseTakeoff[]> {
    const { data, error } = await supabase
      .from('takeoffs')
      .select('*')
      .eq('estimate_id', estimateId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as DatabaseTakeoff[];
  },

  // Create a new takeoff
  async createTakeoff(takeoff: {
    estimate_id: string;
    name: string;
    type: 'Area' | 'Linear' | 'Number' | 'Volume';
    quantity?: string;
    status?: 'pending' | 'complete';
    unit: string;
    measurements?: any[];
  }): Promise<DatabaseTakeoff> {
    const { data, error } = await supabase
      .from('takeoffs')
      .insert({
        ...takeoff,
        quantity: takeoff.quantity || '0',
        status: takeoff.status || 'pending',
        measurements: takeoff.measurements || []
      })
      .select()
      .single();

    if (error) throw error;
    return data as DatabaseTakeoff;
  },

  // Update a takeoff
  async updateTakeoff(id: string, updates: Partial<DatabaseTakeoff>): Promise<DatabaseTakeoff> {
    const { data, error } = await supabase
      .from('takeoffs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as DatabaseTakeoff;
  },

  // Delete a takeoff
  async deleteTakeoff(id: string): Promise<void> {
    const { error } = await supabase
      .from('takeoffs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};