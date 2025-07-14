import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Milestone } from '../tasks/types';

interface MilestoneFiltersProps {
  currentFilter: 'all' | 'pending' | 'in-progress' | 'completed' | 'overdue';
  onFilterChange: (filter: 'all' | 'pending' | 'in-progress' | 'completed' | 'overdue') => void;
  milestones: Milestone[];
}

export const MilestoneFilters = ({ currentFilter, onFilterChange, milestones }: MilestoneFiltersProps) => {
  const getFilterCount = (filter: string) => {
    switch (filter) {
      case 'all':
        return milestones.length;
      case 'pending':
        return milestones.filter(m => m.status === 'Pending').length;
      case 'in-progress':
        return milestones.filter(m => m.status === 'In Progress').length;
      case 'completed':
        return milestones.filter(m => m.status === 'Completed').length;
      case 'overdue':
        return milestones.filter(m => m.status === 'Overdue').length;
      default:
        return 0;
    }
  };

  const filters = [
    { key: 'all', label: 'All Milestones' },
    { key: 'pending', label: 'Pending' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'overdue', label: 'Overdue' }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const count = getFilterCount(filter.key);
        const isActive = currentFilter === filter.key;
        
        return (
          <Button
            key={filter.key}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange(filter.key as any)}
            className="flex items-center space-x-2"
          >
            <span>{filter.label}</span>
            <Badge 
              variant={isActive ? 'secondary' : 'outline'}
              className="ml-1 px-1.5 py-0.5 text-xs"
            >
              {count}
            </Badge>
          </Button>
        );
      })}
    </div>
  );
};