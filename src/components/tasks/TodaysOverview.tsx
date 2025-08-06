import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Target, FileText, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TodaysOverviewProps {
  currentDate: Date;
}

interface DailyData {
  id?: string;
  priorities: string[];
  priority_checked: boolean[];
  notes: string;
}

export const TodaysOverview = ({ currentDate }: TodaysOverviewProps) => {
  const [data, setData] = useState<DailyData>({
    priorities: ['', '', ''],
    priority_checked: [false, false, false],
    notes: ''
  });
  const [recordId, setRecordId] = useState<string | null>(null);
  
  // Use refs to avoid stale closures
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dataRef = useRef(data);
  
  // Update ref when data changes
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const dateString = currentDate.toISOString().split('T')[0];

  const loadDailyData = useCallback(async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: existingData, error } = await supabase
        .from('daily_data')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('date', dateString)
        .maybeSingle();

      if (error) {
        console.error('Error loading daily data:', error);
        return;
      }

      if (existingData) {
        const newData = {
          priorities: existingData.priorities || ['', '', ''],
          priority_checked: existingData.priority_checked || [false, false, false],
          notes: existingData.notes || ''
        };
        setData(newData);
        setRecordId(existingData.id);
      } else {
        const newData = {
          priorities: ['', '', ''],
          priority_checked: [false, false, false],
          notes: ''
        };
        setData(newData);
        setRecordId(null);
      }
    } catch (error) {
      console.error('Error loading daily data:', error);
    }
  }, [dateString]);

  // Load data on date change
  useEffect(() => {
    loadDailyData();
  }, [loadDailyData]);

  const saveData = useCallback(async (dataToSave: DailyData) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const payload = {
        user_id: user.user.id,
        date: dateString,
        priorities: dataToSave.priorities,
        priority_checked: dataToSave.priority_checked,
        notes: dataToSave.notes
      };

      if (recordId) {
        await supabase
          .from('daily_data')
          .update(payload)
          .eq('id', recordId);
      } else {
        const { data: insertedData } = await supabase
          .from('daily_data')
          .insert(payload)
          .select()
          .single();
        
        if (insertedData) {
          setRecordId(insertedData.id);
        }
      }
    } catch (error) {
      console.error('Error saving daily data:', error);
    }
  }, [dateString, recordId]);

  const debouncedSave = useCallback((dataToSave: DailyData) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveData(dataToSave);
    }, 500);
  }, [saveData]);

  const updatePriority = useCallback((index: number, value: string) => {
    const newPriorities = [...dataRef.current.priorities];
    newPriorities[index] = value;
    const newData = { ...dataRef.current, priorities: newPriorities };
    setData(newData);
    debouncedSave(newData);
  }, [debouncedSave]);

  const togglePriorityCheck = useCallback((index: number) => {
    const newChecked = [...dataRef.current.priority_checked];
    newChecked[index] = !newChecked[index];
    const newData = { ...dataRef.current, priority_checked: newChecked };
    setData(newData);
    saveData(newData); // Save immediately for checkbox changes
  }, [saveData]);

  const updateNotes = useCallback((value: string) => {
    const newData = { ...dataRef.current, notes: value };
    setData(newData);
    debouncedSave(newData);
  }, [debouncedSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="w-80 border-l border-white/20 glass-card flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/20">
        <h3 className="text-lg font-semibold text-white font-inter">Today's Overview</h3>
      </div>

      {/* Top 3 Priorities */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-4 w-4 text-accent" />
          <h4 className="font-medium text-white">Top 3 Priorities</h4>
        </div>
        <div className="space-y-2">
          {[0, 1, 2].map((index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-sm font-medium text-white/70 w-4">{index + 1}.</span>
              <input
                type="text"
                value={data.priorities[index]}
                onChange={(e) => updatePriority(index, e.target.value)}
                placeholder={`Priority ${index + 1}`}
                className={`flex-1 h-8 px-3 text-sm bg-white/10 border border-white/20 rounded-md text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/30 focus:outline-none ${
                  data.priority_checked[index] ? 'line-through' : ''
                }`}
              />
              <button
                onClick={() => togglePriorityCheck(index)}
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  data.priority_checked[index]
                    ? 'bg-green-500/80 border-green-400'
                    : 'bg-white/10 border-white/20 hover:bg-white/15'
                }`}
              >
                {data.priority_checked[index] && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Notes Section */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-accent" />
          <h4 className="font-medium text-white">Notes</h4>
        </div>
        <textarea
          value={data.notes}
          onChange={(e) => updateNotes(e.target.value)}
          placeholder="Add your notes here..."
          className="w-full flex-1 bg-white/10 border border-white/20 rounded-lg p-3 text-sm text-white placeholder:text-white/50 resize-none focus:bg-white/15 focus:border-white/30 focus:outline-none"
        />
      </div>
    </div>
  );
};