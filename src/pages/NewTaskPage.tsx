import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Calendar, Clock, User, Tag, Save, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTimerBarSpacing } from '@/hooks/useTimerBarSpacing';

const NewTaskPage = () => {
  const navigate = useNavigate();
  const { spacingClasses, minHeightClasses } = useTimerBarSpacing();

  return (
    <div className={cn("bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-6", minHeightClasses, spacingClasses)}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            to="/tasks" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Back to Tasks</span>
          </Link>
        </div>

        {/* Main Card */}
        <Card className="bg-white/70 backdrop-blur-xl border border-gray-200/50 shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Plus className="w-6 h-6 text-blue-500" />
              Create New Task
            </CardTitle>
            <p className="text-gray-600">Add a new task to your backlog and keep track of your work.</p>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              {/* Task Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Task Name
                </label>
                <Input
                  placeholder="Enter task name..."
                  className="bg-gray-50/50 border-gray-200/50 rounded-xl h-11"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <Textarea
                  placeholder="Describe the task details..."
                  className="bg-gray-50/50 border-gray-200/50 rounded-xl min-h-[100px] resize-none"
                />
              </div>

              {/* Compact 3-section row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Priority
                  </label>
                  <Select defaultValue="medium">
                    <SelectTrigger className="bg-gray-50/50 border-gray-200/50 rounded-xl h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Due Date
                  </label>
                  <Input
                    type="date"
                    className="bg-gray-50/50 border-gray-200/50 rounded-xl h-11"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Assigned To
                  </label>
                  <Select defaultValue="me">
                    <SelectTrigger className="bg-gray-50/50 border-gray-200/50 rounded-xl h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="me">Assign to me</SelectItem>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200/50">
                <Button
                  variant="outline"
                  onClick={() => navigate('/tasks')}
                  className="px-6 py-2.5 rounded-xl border-gray-200/50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => navigate('/tasks')}
                  className="bg-blue-500 hover:bg-blue-600 px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/25"
                >
                  Create Task
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewTaskPage;