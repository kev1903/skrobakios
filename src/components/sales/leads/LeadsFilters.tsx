
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search,
  LayoutGrid,
  List
} from 'lucide-react';

interface LeadsFiltersProps {
  viewMode: string;
  setViewMode: (mode: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const LeadsFilters = ({ viewMode, setViewMode, searchTerm, setSearchTerm }: LeadsFiltersProps) => {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search leads by name, company, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass border-white/20 focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Select>
            <SelectTrigger className="w-40 glass border-white/20">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent className="glass-card border-white/20">
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="google">Google Ads</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-40 glass border-white/20">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="glass-card border-white/20">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="quoted">Quoted</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-primary hover:bg-primary/90' : 'glass border-white/20 hover:bg-white/10'}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-primary hover:bg-primary/90' : 'glass border-white/20 hover:bg-white/10'}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
