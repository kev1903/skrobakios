import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';

interface WBSActivity {
  id: string;
  title: string;
  wbs_id: string;
  level: number;
}

interface WBSActivitySelectProps {
  projectId: string;
  value: string | null;
  onValueChange: (value: string | null) => void;
}

export const WBSActivitySelect = ({ projectId, value, onValueChange }: WBSActivitySelectProps) => {
  const [open, setOpen] = useState(false);
  const [activities, setActivities] = useState<WBSActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [projectId]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wbs_items')
        .select('id, title, wbs_id, level')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error loading WBS activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedActivity = activities.find((activity) => activity.id === value);

  const getIndentation = (level: number) => {
    return '\u00A0'.repeat(level * 3); // Non-breaking spaces for indentation
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-7 text-xs bg-background hover:bg-accent border-border"
        >
          <span className="truncate">
            {selectedActivity
              ? `${selectedActivity.wbs_id} - ${selectedActivity.title}`
              : "Select activity..."}
          </span>
          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 bg-popover border-border shadow-lg z-50" align="start">
        <Command className="bg-popover">
          <CommandInput placeholder="Search activities..." className="h-8 text-sm" />
          <CommandList>
            <CommandEmpty>No activity found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-y-auto">
              <CommandItem
                value=""
                onSelect={() => {
                  onValueChange(null);
                  setOpen(false);
                }}
                className="text-xs"
              >
                <Check
                  className={cn(
                    "mr-2 h-3 w-3",
                    !value ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="text-muted-foreground italic">None</span>
              </CommandItem>
              {activities.map((activity) => (
                <CommandItem
                  key={activity.id}
                  value={`${activity.wbs_id} ${activity.title}`}
                  onSelect={() => {
                    onValueChange(activity.id);
                    setOpen(false);
                  }}
                  className="text-xs"
                >
                  <Check
                    className={cn(
                      "mr-2 h-3 w-3 shrink-0",
                      value === activity.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">
                    {getIndentation(activity.level)}
                    <span className="font-medium text-primary">{activity.wbs_id}</span>
                    {' - '}
                    <span className="text-foreground">{activity.title}</span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
