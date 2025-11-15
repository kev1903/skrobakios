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
  const [trades, setTrades] = useState<Trade[]>([]);

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
    updateTradeName,
    setTradesData: setTrades
  };
};