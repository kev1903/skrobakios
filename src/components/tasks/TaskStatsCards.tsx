import React from 'react';
import { Task } from './types';
import { CheckCircle2, Clock, AlertCircle, TrendingUp, ListTodo } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isThisWeek, isPast } from 'date-fns';

interface TaskStatsCardsProps {
  tasks: Task[];
}

export function TaskStatsCards({ tasks }: TaskStatsCardsProps) {
  // Filter out backlog tasks (midnight timestamps)
  const scheduledTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDateTime = new Date(task.dueDate);
    return !(taskDateTime.getHours() === 0 && taskDateTime.getMinutes() === 0);
  });

  const stats = {
    total: scheduledTasks.length,
    toDo: scheduledTasks.filter(t => t.status === 'Not Started' || t.status === 'Pending').length,
    inProgress: scheduledTasks.filter(t => t.status === 'In Progress').length,
    completed: scheduledTasks.filter(t => t.status === 'Completed').length,
    overdue: scheduledTasks.filter(t => {
      if (!t.dueDate || t.status === 'Completed') return false;
      return isPast(new Date(t.dueDate)) && !isThisWeek(new Date(t.dueDate));
    }).length,
    thisWeek: scheduledTasks.filter(t => t.dueDate && isThisWeek(new Date(t.dueDate))).length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const cards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: ListTodo,
      color: 'bg-blue-500/10 text-blue-600 border-blue-200',
      iconBg: 'bg-blue-500/20',
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      color: 'bg-orange-500/10 text-orange-600 border-orange-200',
      iconBg: 'bg-orange-500/20',
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle2,
      color: 'bg-green-500/10 text-green-600 border-green-200',
      iconBg: 'bg-green-500/20',
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      icon: AlertCircle,
      color: 'bg-red-500/10 text-red-600 border-red-200',
      iconBg: 'bg-red-500/20',
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: 'bg-purple-500/10 text-purple-600 border-purple-200',
      iconBg: 'bg-purple-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={cn(
              "relative overflow-hidden rounded-xl border p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
              card.color
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium opacity-80 mb-1 font-inter">
                  {card.title}
                </p>
                <p className="text-3xl font-bold font-inter">
                  {card.value}
                </p>
              </div>
              <div className={cn("p-3 rounded-lg", card.iconBg)}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full -mr-16 -mt-16 blur-2xl" />
          </div>
        );
      })}
    </div>
  );
}
