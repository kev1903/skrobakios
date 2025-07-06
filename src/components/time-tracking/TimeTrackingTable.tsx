import React, { useState } from 'react';
import { format } from 'date-fns';
import { Edit2, Trash2, Copy, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { TimeEntry, DEFAULT_CATEGORIES, useTimeTracking } from '@/hooks/useTimeTracking';

interface TimeTrackingTableProps {
  entries: TimeEntry[];
  activeTimer: TimeEntry | null;
  onStartTimer: (task: string, category?: string, project?: string) => void;
  onStopTimer: () => void;
  onUpdateEntry: (id: string, updates: Partial<TimeEntry>) => void;
  onDeleteEntry: (id: string) => void;
  onDuplicateEntry: (entry: TimeEntry) => void;
  categoryColors: Record<string, string>;
}

export const TimeTrackingTable = ({
  entries,
  activeTimer,
  onStartTimer,
  onStopTimer,
  onUpdateEntry,
  onDeleteEntry,
  onDuplicateEntry,
  categoryColors
}: TimeTrackingTableProps) => {
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [newTimerTask, setNewTimerTask] = useState('');
  const [newTimerCategory, setNewTimerCategory] = useState('Other');
  const [newTimerProject, setNewTimerProject] = useState('');

  const handleStartTimer = () => {
    if (newTimerTask.trim()) {
      onStartTimer(newTimerTask.trim(), newTimerCategory, newTimerProject.trim() || undefined);
      setNewTimerTask('');
      setNewTimerProject('');
    }
  };

  const handleSaveEdit = () => {
    if (editingEntry) {
      onUpdateEntry(editingEntry.id, editingEntry);
      setEditingEntry(null);
    }
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm');
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getCurrentTimerDuration = () => {
    if (!activeTimer) return 0;
    const start = new Date(activeTimer.start_time);
    const now = new Date();
    return Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
  };

  return (
    <div className="space-y-6">
      {/* Timer Controls */}
      <Card className="border-white/20 bg-white/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white font-playfair">Live Timer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeTimer ? (
            <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/20">
              <div className="flex-1">
                <div className="font-medium text-white">{activeTimer.task_activity}</div>
                <div className="text-sm text-white/70">
                  {activeTimer.category} • Started at {formatTime(activeTimer.start_time)} • 
                  <span className="font-medium"> {formatDuration(getCurrentTimerDuration())}</span>
                </div>
              </div>
              <Button
                onClick={onStopTimer}
                variant="destructive"
                size="sm"
                className="ml-4"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="What are you working on?"
                value={newTimerTask}
                onChange={(e) => setNewTimerTask(e.target.value)}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder-white/50"
                onKeyPress={(e) => e.key === 'Enter' && handleStartTimer()}
              />
              <Select value={newTimerCategory} onValueChange={setNewTimerCategory}>
                <SelectTrigger className="w-full sm:w-40 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20">
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-white">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: categoryColors[cat] || '#6B7280' }}
                        />
                        {cat}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Project (optional)"
                value={newTimerProject}
                onChange={(e) => setNewTimerProject(e.target.value)}
                className="w-full sm:w-40 bg-white/10 border-white/20 text-white placeholder-white/50"
              />
              <Button
                onClick={handleStartTimer}
                disabled={!newTimerTask.trim()}
                className="bg-primary hover:bg-primary/80"
              >
                <Play className="w-4 h-4 mr-2" />
                Start
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time Entries Table */}
      <Card className="border-white/20 bg-white/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white font-playfair">Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/20 hover:bg-white/5">
                  <TableHead className="text-white/90 font-helvetica">Start Time</TableHead>
                  <TableHead className="text-white/90 font-helvetica">End Time</TableHead>
                  <TableHead className="text-white/90 font-helvetica">Duration</TableHead>
                  <TableHead className="text-white/90 font-helvetica">Task/Activity</TableHead>
                  <TableHead className="text-white/90 font-helvetica">Category</TableHead>
                  <TableHead className="text-white/90 font-helvetica">Project</TableHead>
                  <TableHead className="text-white/90 font-helvetica">Notes</TableHead>
                  <TableHead className="text-white/90 font-helvetica">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="text-white/90 font-helvetica">
                      {formatTime(entry.start_time)}
                    </TableCell>
                    <TableCell className="text-white/90 font-helvetica">
                      {entry.end_time ? formatTime(entry.end_time) : (entry.is_active ? 'Running...' : '-')}
                    </TableCell>
                    <TableCell className="text-white/90 font-helvetica font-medium">
                      {entry.is_active ? formatDuration(getCurrentTimerDuration()) : formatDuration(entry.duration)}
                    </TableCell>
                    <TableCell className="text-white font-medium">
                      {entry.task_activity}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: categoryColors[entry.category] || '#6B7280' }}
                        />
                        <span className="text-white/90 font-helvetica">{entry.category}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-white/90 font-helvetica">
                      {entry.project_name || '-'}
                    </TableCell>
                    <TableCell className="text-white/70 font-helvetica text-sm max-w-32 truncate">
                      {entry.notes || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white/70 hover:text-white hover:bg-white/10"
                              onClick={() => setEditingEntry({ ...entry })}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-black/90 border-white/20 text-white">
                            <DialogHeader>
                              <DialogTitle className="font-playfair">Edit Time Entry</DialogTitle>
                            </DialogHeader>
                            {editingEntry && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-white/90">Start Time</Label>
                                    <Input
                                      type="datetime-local"
                                      value={format(new Date(editingEntry.start_time), "yyyy-MM-dd'T'HH:mm")}
                                      onChange={(e) => setEditingEntry({
                                        ...editingEntry,
                                        start_time: new Date(e.target.value).toISOString()
                                      })}
                                      className="bg-white/10 border-white/20 text-white"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-white/90">End Time</Label>
                                    <Input
                                      type="datetime-local"
                                      value={editingEntry.end_time ? format(new Date(editingEntry.end_time), "yyyy-MM-dd'T'HH:mm") : ''}
                                      onChange={(e) => setEditingEntry({
                                        ...editingEntry,
                                        end_time: e.target.value ? new Date(e.target.value).toISOString() : null
                                      })}
                                      className="bg-white/10 border-white/20 text-white"
                                    />
                                  </div>
                                </div>
                                
                                <div>
                                  <Label className="text-white/90">Task/Activity</Label>
                                  <Input
                                    value={editingEntry.task_activity}
                                    onChange={(e) => setEditingEntry({
                                      ...editingEntry,
                                      task_activity: e.target.value
                                    })}
                                    className="bg-white/10 border-white/20 text-white"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-white/90">Category</Label>
                                    <Select
                                      value={editingEntry.category}
                                      onValueChange={(value) => setEditingEntry({
                                        ...editingEntry,
                                        category: value
                                      })}
                                    >
                                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="bg-black/90 border-white/20">
                                        {DEFAULT_CATEGORIES.map((cat) => (
                                          <SelectItem key={cat} value={cat} className="text-white">
                                            <div className="flex items-center gap-2">
                                              <div 
                                                className="w-3 h-3 rounded-full" 
                                                style={{ backgroundColor: categoryColors[cat] || '#6B7280' }}
                                              />
                                              {cat}
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label className="text-white/90">Project</Label>
                                    <Input
                                      value={editingEntry.project_name || ''}
                                      onChange={(e) => setEditingEntry({
                                        ...editingEntry,
                                        project_name: e.target.value || null
                                      })}
                                      className="bg-white/10 border-white/20 text-white"
                                      placeholder="Optional"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-white/90">Notes</Label>
                                  <Textarea
                                    value={editingEntry.notes || ''}
                                    onChange={(e) => setEditingEntry({
                                      ...editingEntry,
                                      notes: e.target.value || null
                                    })}
                                    className="bg-white/10 border-white/20 text-white"
                                    placeholder="Optional notes..."
                                    rows={3}
                                  />
                                </div>

                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setEditingEntry(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button onClick={handleSaveEdit}>
                                    Save Changes
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white/70 hover:text-white hover:bg-white/10"
                          onClick={() => onDuplicateEntry(entry)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => onDeleteEntry(entry.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};