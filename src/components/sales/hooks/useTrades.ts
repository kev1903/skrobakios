import { useState } from 'react';

export interface Measurement {
  id: string;
  type: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Trade {
  id: string;
  name: string;
  measurements: Measurement[];
}

export const useTrades = () => {
  const [trades, setTrades] = useState<Trade[]>([{
    id: '1',
    name: 'Concrete Works',
    measurements: [{
      id: '1',
      type: 'M3',
      description: 'Foundation concrete',
      quantity: 45.5,
      rate: 350,
      amount: 15925
    }, {
      id: '2',
      type: 'M2',
      description: 'Floor slab',
      quantity: 120,
      rate: 85,
      amount: 10200
    }]
  }, {
    id: '2',
    name: 'Framing',
    measurements: [{
      id: '3',
      type: 'linear',
      description: 'Wall framing',
      quantity: 180,
      rate: 25,
      amount: 4500
    }, {
      id: '4',
      type: 'number',
      description: 'Doors',
      quantity: 8,
      rate: 450,
      amount: 3600
    }]
  }]);

  const addTrade = () => {
    const newTrade = {
      id: Date.now().toString(),
      name: 'New Trade',
      measurements: []
    };
    setTrades([...trades, newTrade]);
  };

  const addMeasurement = (tradeId: string) => {
    const newMeasurement = {
      id: Date.now().toString(),
      type: 'M2',
      description: '',
      quantity: 0,
      rate: 0,
      amount: 0
    };
    setTrades(trades.map(trade => trade.id === tradeId ? {
      ...trade,
      measurements: [...trade.measurements, newMeasurement]
    } : trade));
  };

  const updateMeasurement = (tradeId: string, measurementId: string, field: string, value: any) => {
    setTrades(trades.map(trade => trade.id === tradeId ? {
      ...trade,
      measurements: trade.measurements.map(measurement => measurement.id === measurementId ? {
        ...measurement,
        [field]: value,
        amount: field === 'quantity' || field === 'rate' ? (field === 'quantity' ? value : measurement.quantity) * (field === 'rate' ? value : measurement.rate) : measurement.amount
      } : measurement)
    } : trade));
  };

  const removeMeasurement = (tradeId: string, measurementId: string) => {
    setTrades(trades.map(trade => trade.id === tradeId ? {
      ...trade,
      measurements: trade.measurements.filter(m => m.id !== measurementId)
    } : trade));
  };

  const updateTradeName = (tradeId: string, name: string) => {
    setTrades(trades.map(trade => trade.id === tradeId ? {
      ...trade,
      name
    } : trade));
  };

  return {
    trades,
    addTrade,
    addMeasurement,
    updateMeasurement,
    removeMeasurement,
    updateTradeName
  };
};