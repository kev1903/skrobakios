import React from 'react';
import { CheckCircle2, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { Task } from './TaskContext';

interface TaskInsightsSummaryProps {
  tasks: Task[];
}

export const TaskInsightsSummary = ({ tasks }: TaskInsightsSummaryProps) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status.toLowerCase() === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status.toLowerCase() === 'in progress').length;
  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    const dueDate = new Date(t.dueDate);
    return dueDate < new Date() && t.status.toLowerCase() !== 'completed';
  }).length;
  
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const circumference = 2 * Math.PI * 18; // radius = 18
  const progress = (completionRate / 100) * circumference;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 animate-fade-in">
      {/* Completion Rate Card */}
      <div className="group relative bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300 border border-[hsl(var(--border))]">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 tracking-wide">Completion Rate</p>
            <p className="text-2xl font-semibold text-[hsl(var(--foreground))] mb-0.5">{completionRate}%</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{completedTasks} of {totalTasks} tasks</p>
          </div>
          <div className="relative">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 40 40">
              {/* Background circle */}
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="none"
                stroke="hsl(var(--accent))"
                strokeWidth="3"
              />
              {/* Progress circle */}
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="none"
                stroke="url(#goldGradient)"
                strokeWidth="3"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--luxury-gold))" />
                  <stop offset="100%" stopColor="hsl(var(--luxury-gold-light))" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-[hsl(var(--luxury-gold))]" />
            </div>
          </div>
        </div>
      </div>

      {/* In Progress Card */}
      <div className="group relative bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300 border border-[hsl(var(--border))]">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 tracking-wide">In Progress</p>
            <p className="text-2xl font-semibold text-[hsl(var(--foreground))]">{inProgressTasks}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Active tasks</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Pending Card */}
      <div className="group relative bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300 border border-[hsl(var(--border))]">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 tracking-wide">Pending</p>
            <p className="text-2xl font-semibold text-[hsl(var(--foreground))]">{totalTasks - completedTasks - inProgressTasks}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Not started</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Overdue Card */}
      <div className="group relative bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300 border border-[hsl(var(--border))]">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 tracking-wide">Overdue</p>
            <p className="text-2xl font-semibold text-[hsl(var(--destructive))]">{overdueTasks}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Past due date</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
};
