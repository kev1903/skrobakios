import { useState } from 'react';
import { CostItem } from './types';

export const useCostBreakdown = () => {
  const [costItems, setCostItems] = useState<CostItem[]>([{
    id: '1',
    costCode: 'EXC-001',
    tradeScope: 'Site Excavation',
    budget: 25000,
    committed: 24500,
    paid: 20000,
    remaining: 1000,
    notes: 'Includes rock removal'
  }, {
    id: '2',
    costCode: 'CON-001',
    tradeScope: 'Concrete Foundations',
    budget: 45000,
    committed: 47000,
    paid: 35000,
    remaining: -2000,
    notes: 'Over budget due to additional reinforcement'
  }]);

  const [editingId, setEditingId] = useState<string | null>(null);

  const addNewRow = () => {
    const newItem: CostItem = {
      id: Date.now().toString(),
      costCode: '',
      tradeScope: '',
      budget: 0,
      committed: 0,
      paid: 0,
      remaining: 0,
      notes: ''
    };
    setCostItems([...costItems, newItem]);
    setEditingId(newItem.id);
  };

  const updateItem = (id: string, field: keyof CostItem, value: string | number) => {
    setCostItems(items => items.map(item => {
      if (item.id === id) {
        const updated = {
          ...item,
          [field]: value
        };
        if (field === 'budget' || field === 'committed' || field === 'paid') {
          updated.remaining = updated.budget - Math.max(updated.committed, updated.paid);
        }
        return updated;
      }
      return item;
    }));
  };

  const deleteItem = (id: string) => {
    setCostItems(items => items.filter(item => item.id !== id));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const totals = costItems.reduce((acc, item) => ({
    budget: acc.budget + item.budget,
    committed: acc.committed + item.committed,
    paid: acc.paid + item.paid,
    remaining: acc.remaining + item.remaining
  }), {
    budget: 0,
    committed: 0,
    paid: 0,
    remaining: 0
  });

  return {
    costItems,
    editingId,
    setEditingId,
    addNewRow,
    updateItem,
    deleteItem,
    formatCurrency,
    totals
  };
};