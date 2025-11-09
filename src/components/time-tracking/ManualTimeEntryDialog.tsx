import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';
import { useToast } from '@/hooks/use-toast';

const timeEntrySchema = z.object({
  project_id: z.string().optional(),
  task_activity: z.string()
    .trim()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters'),
  category: z.string().optional(),
  entry_type: z.enum(['time_range', 'duration']),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  duration_value: z.string().optional(),
  duration_unit: z.enum(['minutes', 'hours']).optional(),
}).refine((data) => {
  if (data.entry_type === 'time_range') {
    return data.start_time && data.end_time;
  }
  return data.duration_value && data.duration_unit;
}, {
  message: 'Please provide either start/end time or duration',
});

type TimeEntryFormData = z.infer<typeof timeEntrySchema>;

interface ManualTimeEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: string;
  onEntryCreated: () => void;
  categories: string[];
}

export const ManualTimeEntryDialog = ({
  open,
  onOpenChange,
  selectedDate,
  onEntryCreated,
  categories,
}: ManualTimeEntryDialogProps) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentCompany } = useCompany();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TimeEntryFormData>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
      entry_type: 'time_range',
      duration_unit: 'hours',
      start_time: format(new Date(), 'HH:mm'),
      end_time: format(new Date(), 'HH:mm'),
    },
  });

  const entryType = watch('entry_type');
  const durationUnit = watch('duration_unit');

  useEffect(() => {
    if (currentCompany?.id) {
      loadProjects();
    }
  }, [currentCompany?.id]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('company_id', currentCompany?.id)
        .order('name');

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const onSubmit = async (data: TimeEntryFormData) => {
    if (!currentCompany?.id) {
      toast({
        title: 'Error',
        description: 'No company selected',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      let entryData: any = {
        company_id: currentCompany.id,
        user_id: user.id,
        task_activity: data.task_activity.trim(),
        category: data.category || null,
        project_id: data.project_id && data.project_id !== 'none' ? data.project_id : null,
        status: 'completed',
      };

      if (data.entry_type === 'time_range') {
        // Time range input
        const startDateTime = new Date(`${selectedDate}T${data.start_time}`);
        const endDateTime = new Date(`${selectedDate}T${data.end_time}`);
        
        // Handle case where end time is on next day
        if (endDateTime < startDateTime) {
          endDateTime.setDate(endDateTime.getDate() + 1);
        }

        const durationSeconds = Math.floor((endDateTime.getTime() - startDateTime.getTime()) / 1000);
        
        if (durationSeconds <= 0) {
          toast({
            title: 'Error',
            description: 'End time must be after start time',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        entryData.start_time = startDateTime.toISOString();
        entryData.end_time = endDateTime.toISOString();
        entryData.duration = durationSeconds;
      } else {
        // Duration input
        const durationValue = parseFloat(data.duration_value || '0');
        
        if (data.duration_unit === 'hours') {
          if (durationValue < 0.25 || durationValue > 24) {
            toast({
              title: 'Error',
              description: 'Duration must be between 0.25 hours (15 minutes) and 24 hours',
              variant: 'destructive',
            });
            setLoading(false);
            return;
          }
        } else { // minutes
          if (durationValue < 15 || durationValue > 1440) {
            toast({
              title: 'Error',
              description: 'Duration must be between 15 minutes and 1440 minutes (24 hours)',
              variant: 'destructive',
            });
            setLoading(false);
            return;
          }
        }

        const durationInMinutes = data.duration_unit === 'hours' 
          ? durationValue * 60 
          : durationValue;
        
        const startDateTime = new Date(`${selectedDate}T${format(new Date(), 'HH:mm')}`);
        const endDateTime = new Date(startDateTime.getTime() + durationInMinutes * 60 * 1000);

        entryData.start_time = startDateTime.toISOString();
        entryData.end_time = endDateTime.toISOString();
        entryData.duration = Math.floor(durationInMinutes * 60);
      }

      const { error } = await supabase
        .from('time_entries')
        .insert(entryData);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Time entry added successfully',
      });

      reset();
      onOpenChange(false);
      onEntryCreated();
    } catch (error: any) {
      console.error('Error creating time entry:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create time entry',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="backdrop-blur-xl bg-white/95 border-border/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            Add Manual Time Entry
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Project Selection */}
          <div className="space-y-2">
            <Label htmlFor="project">Project (Optional)</Label>
            <Select
              onValueChange={(value) => setValue('project_id', value)}
            >
              <SelectTrigger id="project" className="glass">
                <SelectValue placeholder="Select project..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Project</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Select
              onValueChange={(value) => setValue('category', value)}
            >
              <SelectTrigger id="category" className="glass">
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('task_activity')}
              placeholder="What did you work on?"
              className="glass resize-none"
              rows={3}
            />
            {errors.task_activity && (
              <p className="text-sm text-red-600">{errors.task_activity.message}</p>
            )}
          </div>

          {/* Entry Type Selection */}
          <div className="space-y-2">
            <Label>Time Entry Type</Label>
            <RadioGroup
              defaultValue="time_range"
              onValueChange={(value) => setValue('entry_type', value as 'time_range' | 'duration')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="time_range" id="time_range" />
                <Label htmlFor="time_range" className="font-normal cursor-pointer">
                  Start & End Time
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="duration" id="duration" />
                <Label htmlFor="duration" className="font-normal cursor-pointer">
                  Duration
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Time Range Inputs */}
          {entryType === 'time_range' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time *</Label>
                <Input
                  id="start_time"
                  type="time"
                  {...register('start_time')}
                  className="glass"
                />
                {errors.start_time && (
                  <p className="text-sm text-red-600">{errors.start_time.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">End Time *</Label>
                <Input
                  id="end_time"
                  type="time"
                  {...register('end_time')}
                  className="glass"
                />
                {errors.end_time && (
                  <p className="text-sm text-red-600">{errors.end_time.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Duration Input */}
          {entryType === 'duration' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration_value">Duration *</Label>
                <Input
                  id="duration_value"
                  type="number"
                  step={durationUnit === 'hours' ? '0.25' : '15'}
                  min={durationUnit === 'hours' ? '0.25' : '15'}
                  max={durationUnit === 'hours' ? '24' : '1440'}
                  placeholder={durationUnit === 'hours' ? '1.5' : '30'}
                  {...register('duration_value')}
                  className="glass"
                />
                {errors.duration_value && (
                  <p className="text-sm text-red-600">{errors.duration_value.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration_unit">Unit</Label>
                <Select
                  defaultValue="hours"
                  onValueChange={(value) => setValue('duration_unit', value as 'hours' | 'minutes')}
                >
                  <SelectTrigger id="duration_unit" className="glass">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="minutes">Minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="glass"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-luxury-gold hover:bg-luxury-gold/90 text-white"
            >
              {loading ? 'Adding...' : 'Add Entry'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
