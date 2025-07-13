import { useState, useCallback } from 'react';
import { Measurement } from '../components/TakeoffCanvas';

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

export const useTakeoffMeasurements = () => {
  const [takeoffs, setTakeoffs] = useState<TakeoffItem[]>([
    {
      id: '1',
      name: 'Foundation Areas',
      type: 'Area',
      quantity: '45.5 m²',
      status: 'complete',
      measurements: [],
      createdAt: new Date(),
      unit: 'm²'
    },
    {
      id: '2',
      name: 'Wall Lengths',
      type: 'Linear',
      quantity: '180 m',
      status: 'complete',
      measurements: [],
      createdAt: new Date(),
      unit: 'm'
    },
    {
      id: '3',
      name: 'Door Count',
      type: 'Number',
      quantity: '8 units',
      status: 'pending',
      measurements: [],
      createdAt: new Date(),
      unit: 'count'
    }
  ]);

  const [measurements, setMeasurements] = useState<Measurement[]>([]);

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

  const createTakeoff = useCallback((data: {
    description: string;
    type: 'Area' | 'Linear' | 'Number' | 'Volume';
  }) => {
    const newTakeoff: TakeoffItem = {
      id: Date.now().toString(),
      name: data.description,
      type: data.type,
      quantity: '0 ' + (data.type === 'Area' ? 'm²' : data.type === 'Linear' ? 'm' : 'count'),
      status: 'pending',
      measurements: [],
      createdAt: new Date(),
      unit: data.type === 'Area' ? 'm²' : data.type === 'Linear' ? 'm' : 'count'
    };

    setTakeoffs(prev => [...prev, newTakeoff]);
    return newTakeoff;
  }, []);

  const updateTakeoff = useCallback((id: string, updates: Partial<TakeoffItem>) => {
    setTakeoffs(prev =>
      prev.map(t => t.id === id ? { ...t, ...updates } : t)
    );
  }, []);

  const deleteTakeoff = useCallback((id: string) => {
    setTakeoffs(prev => prev.filter(t => t.id !== id));
    // Also remove associated measurements
    setMeasurements(prev => prev.filter(m => !m.id.startsWith(id)));
  }, []);

  const addMeasurementToTakeoff = useCallback((takeoffId: string, measurement: Measurement) => {
    // Update the measurement ID to associate it with the takeoff
    const updatedMeasurement = { ...measurement, id: `${takeoffId}_${measurement.id}` };
    
    addMeasurement(updatedMeasurement);
    
    // Update takeoff with the new measurement
    setTakeoffs(prev =>
      prev.map(takeoff => {
        if (takeoff.id === takeoffId) {
          const updatedMeasurements = [...takeoff.measurements, updatedMeasurement];
          const totalQuantity = updatedMeasurements.reduce((sum, m) => sum + m.value, 0);
          
          return {
            ...takeoff,
            measurements: updatedMeasurements,
            quantity: `${totalQuantity.toFixed(2)} ${takeoff.unit}`,
            status: 'complete' as const
          };
        }
        return takeoff;
      })
    );
  }, [addMeasurement]);

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