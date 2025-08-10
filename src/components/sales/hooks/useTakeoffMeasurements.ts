import { useState, useCallback, useEffect } from 'react';
import { Measurement } from '../components/TakeoffCanvas';
import { takeoffService, DatabaseTakeoff } from '@/integrations/supabase/takeoffs';
import { toast } from 'sonner';

export interface TakeoffItem {
  id: string;
  name: string;
  type: 'Area' | 'Linear' | 'Number' | 'Volume';
  quantity: string;
  status: 'complete' | 'pending';
  measurements: Measurement[];
  createdAt: Date;
  unit: string;
}

// Convert database takeoff to local takeoff item
const convertDatabaseTakeoff = (dbTakeoff: DatabaseTakeoff): TakeoffItem => ({
  id: dbTakeoff.id,
  name: dbTakeoff.name,
  type: dbTakeoff.type,
  quantity: dbTakeoff.quantity,
  status: dbTakeoff.status,
  measurements: dbTakeoff.measurements || [],
  createdAt: new Date(dbTakeoff.created_at),
  unit: dbTakeoff.unit
});

export const useTakeoffMeasurements = (estimateId?: string) => {
  const [takeoffs, setTakeoffs] = useState<TakeoffItem[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(false);

  // Load takeoffs from database
  const loadTakeoffs = useCallback(async () => {
    if (!estimateId) return;
    
    setLoading(true);
    try {
      const dbTakeoffs = await takeoffService.getTakeoffsByEstimate(estimateId);
      const convertedTakeoffs = dbTakeoffs.map(convertDatabaseTakeoff);
      setTakeoffs(convertedTakeoffs);
    } catch (error) {
      console.error('Failed to load takeoffs:', error);
      toast.error('Failed to load takeoffs');
    } finally {
      setLoading(false);
    }
  }, [estimateId]);

  useEffect(() => {
    loadTakeoffs();
  }, [loadTakeoffs]);

  const addMeasurement = useCallback((measurement: Measurement) => {
    setMeasurements(prev => [...prev, measurement]);
  }, []);

  const updateMeasurement = useCallback((id: string, updates: Partial<Measurement>) => {
    setMeasurements(prev =>
      prev.map(m => m.id === id ? { ...m, ...updates } : m)
    );
  }, []);

  const deleteMeasurement = useCallback((id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
  }, []);

  const createTakeoff = useCallback(async (data: {
    description: string;
    type: 'Area' | 'Linear' | 'Number' | 'Volume';
  }) => {
    if (!estimateId) {
      toast.error('No estimate selected');
      return;
    }

    const unit = data.type === 'Area' ? 'm²' : data.type === 'Linear' ? 'm' : 'count';
    
    try {
      const dbTakeoff = await takeoffService.createTakeoff({
        estimate_id: estimateId,
        name: data.description,
        type: data.type,
        quantity: `0 ${unit}`,
        status: 'pending',
        unit,
        measurements: []
      });

      const newTakeoff = convertDatabaseTakeoff(dbTakeoff);
      setTakeoffs(prev => [...prev, newTakeoff]);
      toast.success('Take-off created successfully');
      return newTakeoff;
    } catch (error) {
      console.error('Failed to create takeoff:', error);
      toast.error('Failed to create take-off');
    }
  }, [estimateId]);

  const updateTakeoff = useCallback(async (id: string, updates: Partial<TakeoffItem>) => {
    try {
      const dbTakeoff = await takeoffService.updateTakeoff(id, updates);
      const updatedTakeoff = convertDatabaseTakeoff(dbTakeoff);
      
      setTakeoffs(prev =>
        prev.map(t => t.id === id ? updatedTakeoff : t)
      );
      toast.success('Take-off updated successfully');
    } catch (error) {
      console.error('Failed to update takeoff:', error);
      toast.error('Failed to update take-off');
    }
  }, []);

  const deleteTakeoff = useCallback(async (id: string) => {
    try {
      await takeoffService.deleteTakeoff(id);
      setTakeoffs(prev => prev.filter(t => t.id !== id));
      // Also remove associated measurements
      setMeasurements(prev => prev.filter(m => !m.id.startsWith(id)));
      toast.success('Take-off deleted successfully');
    } catch (error) {
      console.error('Failed to delete takeoff:', error);
      toast.error('Failed to delete take-off');
    }
  }, []);

  const addMeasurementToTakeoff = useCallback(async (takeoffId: string, measurement: Measurement) => {
    // Update the measurement ID to associate it with the takeoff
    const updatedMeasurement = { ...measurement, id: `${takeoffId}_${measurement.id}` };
    
    addMeasurement(updatedMeasurement);
    
    // Find the takeoff and update it with new measurements
    const takeoff = takeoffs.find(t => t.id === takeoffId);
    if (takeoff) {
      const updatedMeasurements = [...takeoff.measurements, updatedMeasurement];
      const totalQuantity = updatedMeasurements.reduce((sum, m) => sum + m.value, 0);
      
      await updateTakeoff(takeoffId, {
        measurements: updatedMeasurements,
        quantity: `${totalQuantity.toFixed(2)} ${takeoff.unit}`,
        status: 'complete'
      });
    }
  }, [addMeasurement, takeoffs, updateTakeoff]);

  const getTakeoffMeasurements = useCallback((takeoffId: string) => {
    return measurements.filter(m => m.id.startsWith(takeoffId));
  }, [measurements]);

  const calculateTotalQuantity = useCallback((takeoffId: string, type: string) => {
    const takeoffMeasurements = getTakeoffMeasurements(takeoffId);
    const total = takeoffMeasurements.reduce((sum, m) => sum + m.value, 0);
    const unit = type === 'Area' ? 'm²' : type === 'Linear' ? 'm' : 'count';
    return `${total.toFixed(2)} ${unit}`;
  }, [getTakeoffMeasurements]);

  return {
    takeoffs,
    measurements,
    loading,
    addMeasurement,
    updateMeasurement,
    deleteMeasurement,
    createTakeoff,
    updateTakeoff,
    deleteTakeoff,
    addMeasurementToTakeoff,
    getTakeoffMeasurements,
    calculateTotalQuantity
  };
};