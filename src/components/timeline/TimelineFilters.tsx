import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Filter, SortAsc, Group } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineFiltersProps {
  dateRange: 'today' | 'week' | 'month' | 'custom';
  onDateRangeChange: (range: 'today' | 'week' | 'month' | 'custom') => void;
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  selectedProjects: string[];
  onProjectsChange: (projects: string[]) => void;
  availableCategories: string[];
  availableProjects: string[];
  sortBy: 'date' | 'duration' | 'category' | 'project';
  onSortByChange: (sort: 'date' | 'duration' | 'category' | 'project') => void;
  groupBy: 'none' | 'category' | 'project' | 'date';
  onGroupByChange: (group: 'none' | 'category' | 'project' | 'date') => void;
  screenSize: 'mobile-small' | 'mobile' | 'tablet' | 'desktop';
}

export const TimelineFilters = ({
  dateRange,
  onDateRangeChange,
  selectedCategories,
  onCategoriesChange,
  selectedProjects,
  onProjectsChange,
  availableCategories,
  availableProjects,
  sortBy,
  onSortByChange,
  groupBy,
  onGroupByChange,
  screenSize
}: TimelineFiltersProps) => {

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  const toggleProject = (project: string) => {
    if (selectedProjects.includes(project)) {
      onProjectsChange(selectedProjects.filter(p => p !== project));
    } else {
      onProjectsChange([...selectedProjects, project]);
    }
  };

  const clearAllFilters = () => {
    onCategoriesChange([]);
    onProjectsChange([]);
    onDateRangeChange('week');
    onSortByChange('date');
    onGroupByChange('date');
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedProjects.length > 0 || dateRange !== 'week';

  if (screenSize === 'mobile' || screenSize === 'mobile-small') {
    return (
      <div className="space-y-4">
        {/* Date Range - Mobile */}
        <div className="grid grid-cols-4 gap-2">
          {(['today', 'week', 'month', 'custom'] as const).map((range) => (
            <Button
              key={range}
              variant={dateRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => onDateRangeChange(range)}
              className="text-xs capitalize"
            >
              {range}
            </Button>
          ))}
        </div>

        {/* Sort and Group - Mobile */}
        <div className="grid grid-cols-2 gap-2">
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort by Date</SelectItem>
              <SelectItem value="duration">Sort by Duration</SelectItem>
              <SelectItem value="category">Sort by Category</SelectItem>
              <SelectItem value="project">Sort by Project</SelectItem>
            </SelectContent>
          </Select>

          <Select value={groupBy} onValueChange={onGroupByChange}>
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Grouping</SelectItem>
              <SelectItem value="date">Group by Date</SelectItem>
              <SelectItem value="category">Group by Category</SelectItem>
              <SelectItem value="project">Group by Project</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Categories - Mobile */}
        {availableCategories.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Categories</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {availableCategories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategories.includes(category) ? 'default' : 'outline'}
                  className="text-xs cursor-pointer"
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Projects - Mobile */}
        {availableProjects.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Projects</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {availableProjects.map((project) => (
                <Badge
                  key={project}
                  variant={selectedProjects.includes(project) ? 'default' : 'outline'}
                  className="text-xs cursor-pointer"
                  onClick={() => toggleProject(project)}
                >
                  {project}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Clear Filters - Mobile */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="w-full text-xs"
          >
            Clear All Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Row - Date Range and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Date Range:</span>
          <div className="flex items-center space-x-1">
            {(['today', 'week', 'month', 'custom'] as const).map((range) => (
              <Button
                key={range}
                variant={dateRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => onDateRangeChange(range)}
                className="capitalize"
              >
                {range}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="w-40">
              <SortAsc className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort by Date</SelectItem>
              <SelectItem value="duration">Sort by Duration</SelectItem>
              <SelectItem value="category">Sort by Category</SelectItem>
              <SelectItem value="project">Sort by Project</SelectItem>
            </SelectContent>
          </Select>

          <Select value={groupBy} onValueChange={onGroupByChange}>
            <SelectTrigger className="w-40">
              <Group className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Grouping</SelectItem>
              <SelectItem value="date">Group by Date</SelectItem>
              <SelectItem value="category">Group by Category</SelectItem>
              <SelectItem value="project">Group by Project</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bottom Row - Category and Project Filters */}
      <div className="space-y-3">
        {availableCategories.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Categories:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategories.includes(category) ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/80 transition-colors"
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {availableProjects.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Projects:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableProjects.map((project) => (
                <Badge
                  key={project}
                  variant={selectedProjects.includes(project) ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/80 transition-colors"
                  onClick={() => toggleProject(project)}
                >
                  {project}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {hasActiveFilters && (
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};