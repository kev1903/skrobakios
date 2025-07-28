import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit2, MoreHorizontal, ArrowLeft, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, ChevronLeft, ChevronRight, Calendar, Home, DollarSign, Monitor, Download, Book, ChevronDown, Clock, MapPin, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { taskService } from '@/components/tasks/taskService';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Task } from '@/components/tasks/types';

const TasksPage = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(2024, 4)); // May 2024
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Load tasks assigned to the current user
  useEffect(() => {
    const loadUserTasks = async () => {
      try {
        setLoading(true);
        const tasks = await taskService.loadTasksAssignedToUser();
        setUserTasks(tasks);
      } catch (error) {
        console.error('Error loading user tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserTasks();
  }, []);

  const tasks = [
    {
      id: 1,
      time: '12:00 AM',
      title: 'W7 Challenge - UI Design',
      tags: ['Creative', 'UIF'],
      subtasks: [
        'Analyze the topic, search for ideas, brainstorm, outline the design.',
        'Create styles: Color, Typo, Grid, Icons',
        'Moodboard',
        'Design',
        'Showcase; Update Dribbble'
      ],
      completed: [true, false, false, false, false]
    },
    {
      id: 2,
      time: '14:00 PM',
      title: 'Polygon Event - Live Band',
      tags: ['Event'],
      details: {
        time: '16:00 PM',
        location: 'COMPLEX 01, Google Map',
        checklist: 'Ticket, Wallet, Camera',
        call: 'Call Na'
      }
    },
    {
      id: 3,
      time: '21:00 PM',
      title: 'MindSpace Meeting',
      description: 'The meeting will explore the JTBD framework and discuss potential solutions for user groups and the pain points the team wants to tackle.'
    }
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex font-sans">
      {/* Left Sidebar */}
      <div className="w-80 bg-white/70 backdrop-blur-xl border-r border-gray-200/50 p-6 space-y-6 shadow-sm">
        {/* Return to Home Button */}
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">Return to Home</span>
        </Link>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Type here to search" 
            className="pl-10 bg-gray-50/50 border-gray-200/50 rounded-xl h-11 text-sm placeholder:text-gray-400"
          />
        </div>

        {/* Task Backlog */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 text-sm">Task Backlog</h3>
            <Link 
              to="/tasks/new" 
              className="text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors"
            >
              + Add to backlog
            </Link>
          </div>

          {/* Task Type Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setActiveTab('All')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                activeTab === 'All' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('Task')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                activeTab === 'Task' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveTab('Issue')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                activeTab === 'Issue' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              Issues
            </button>
            <button
              onClick={() => setActiveTab('Bug')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                activeTab === 'Bug' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              Bugs
            </button>
            <button
              onClick={() => setActiveTab('Feature')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                activeTab === 'Feature' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              Features
            </button>
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-4">
                <div className="text-sm text-gray-500">Loading tasks...</div>
              </div>
            ) : userTasks.length === 0 ? (
              <div className="text-center py-4">
                <div className="text-sm text-gray-500">No tasks assigned to you</div>
              </div>
            ) : (
              userTasks
                .filter(task => activeTab === 'All' || task.taskType === activeTab)
                .map((task) => (
                <div key={task.id} className="px-3 py-2 rounded-lg hover:bg-gray-50/50 cursor-pointer transition-colors group border border-gray-100/50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-gray-800 truncate">{task.taskName}</h4>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-xs font-medium flex-shrink-0",
                          task.taskType === 'Task' ? 'bg-green-50 text-green-600' :
                          task.taskType === 'Issue' ? 'bg-orange-50 text-orange-600' :
                          task.taskType === 'Bug' ? 'bg-red-50 text-red-600' :
                          task.taskType === 'Feature' ? 'bg-purple-50 text-purple-600' :
                          'bg-gray-50 text-gray-600'
                        )}>
                          {task.taskType}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium truncate">{task.projectName || 'No Project'}</p>
                      <p className="text-xs text-gray-600 truncate">{task.description || 'No description'}</p>
                    </div>
                    <span className={cn(
                      "ml-2 px-2 py-0.5 rounded text-xs font-medium flex-shrink-0",
                      task.priority === 'High' ? 'bg-red-50 text-red-600' :
                      task.priority === 'Medium' ? 'bg-yellow-50 text-yellow-600' :
                      'bg-green-50 text-green-600'
                    )}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Main Content - Calendar View */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-gray-700">
              <span className="font-semibold">Calendar</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-3 bg-white/70 backdrop-blur-xl px-4 py-2.5 rounded-xl border border-gray-200/50 shadow-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-700">May 2024</span>
            </div>
          </div>
          <Button className="bg-blue-500 hover:bg-blue-600 rounded-xl px-6 py-2.5 font-medium shadow-lg shadow-blue-500/25">
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </Button>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-8 h-8 rounded-full"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-8 h-8 rounded-full"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Large Calendar Grid */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-sm">
          {/* Week Headers */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
              <div key={day} className="text-center py-3 text-sm font-semibold text-gray-600">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(currentMonth).map((day, index) => (
              <div key={index} className="aspect-square">
                {day && (
                  <div className={cn(
                    "h-full min-h-[120px] p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-all cursor-pointer",
                    day === 3 
                      ? "bg-blue-50 border-blue-200 shadow-sm" 
                      : "bg-gray-50/50 hover:bg-gray-50"
                  )}>
                    <div className={cn(
                      "text-sm font-semibold mb-2",
                      day === 3 ? "text-blue-600" : "text-gray-700"
                    )}>
                      {day}
                    </div>
                    
                    {/* Sample events for May 3rd */}
                    {day === 3 && (
                      <div className="space-y-1">
                        <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md font-medium">
                          UI Design
                        </div>
                        <div className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-md font-medium">
                          Live Band
                        </div>
                        <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-medium">
                          Meeting
                        </div>
                      </div>
                    )}
                    
                    {/* Sample events for other days */}
                    {day === 15 && (
                      <div className="space-y-1">
                        <div className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md font-medium">
                          Team Sync
                        </div>
                      </div>
                    )}
                    
                    {day === 22 && (
                      <div className="space-y-1">
                        <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-md font-medium">
                          Review
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Today's Tasks Summary */}
        <div className="mt-6 bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Today's Schedule</h3>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-4 p-3 bg-gray-50/50 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="bg-slate-800 text-white px-3 py-1 rounded-lg text-xs font-semibold">
                  {task.time}
                </div>
                <span className="font-medium text-gray-800">{task.title}</span>
                {task.tags && (
                  <div className="flex gap-2 ml-auto">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className={cn(
                          "px-2 py-1 rounded-md text-xs font-medium",
                          tag === 'Creative' ? 'bg-green-100 text-green-600' :
                          tag === 'UIF' ? 'bg-cyan-100 text-cyan-600' :
                          'bg-red-100 text-red-600'
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 bg-white/70 backdrop-blur-xl border-l border-gray-200/50 p-6 space-y-6 shadow-sm">
        {/* Focus Timer */}
        <div className="text-center bg-white/50 rounded-2xl p-5 border border-gray-200/50">
          <Button className="w-full mb-4 bg-blue-500 hover:bg-blue-600 rounded-xl font-medium">
            🎯 Focus
          </Button>
          <div className="text-3xl font-mono font-bold text-gray-900 mb-2">
            00:30:00
          </div>
          <span className="text-sm text-gray-500">min</span>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button variant="ghost" size="sm" className="w-8 h-8 rounded-full text-gray-400 hover:text-gray-600">
              <span className="text-lg">−</span>
            </Button>
            <Button variant="ghost" size="sm" className="w-8 h-8 rounded-full text-gray-400 hover:text-gray-600">
              <span className="text-lg">+</span>
            </Button>
          </div>
        </div>
        {/* Calendar */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-gray-900 text-sm">Month</span>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">May, 2024</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200/50">
            <div className="flex items-center justify-between mb-4">
              <ChevronLeft className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
              <span className="font-semibold text-gray-900">Fri, May 3, 2024</span>
              <ChevronRight className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
            </div>

            <div className="grid grid-cols-7 gap-1 mb-3">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                <div key={day} className="text-xs text-gray-500 text-center py-2 font-medium">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentMonth).map((day, index) => (
                <div key={index} className="aspect-square flex items-center justify-center">
                  {day && (
                    <span className={cn(
                      "w-8 h-8 flex items-center justify-center text-sm rounded-xl cursor-pointer transition-all",
                      day === 3 
                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25" 
                        : "text-gray-700 hover:bg-gray-200"
                    )}>
                      {day}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dashboard */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4 text-sm">Dashboard</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200/50 hover:shadow-sm transition-shadow cursor-pointer group">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">Finance</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200/50 hover:shadow-sm transition-shadow cursor-pointer group">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Screen Time</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </div>
          <button className="w-full text-left p-3 text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors">
            + Add
          </button>
        </div>

        {/* Resources */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4 text-sm">Resources</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200/50 hover:shadow-sm transition-shadow cursor-pointer group">
              <div className="flex items-center gap-3">
                <Home className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Web development technology</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200/50 hover:shadow-sm transition-shadow cursor-pointer group">
              <div className="flex items-center gap-3">
                <Book className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Data management system</span>
              </div>
              <span className="text-xs text-blue-500 font-medium bg-blue-50 px-2 py-1 rounded">Books</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200/50 hover:shadow-sm transition-shadow cursor-pointer group">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Adobe Premiere</span>
              </div>
            </div>
          </div>
          <button className="w-full text-left p-3 text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors">
            + Add
          </button>
        </div>

        {/* Gallery */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 text-sm">Gallery</h3>
            <span className="text-sm text-blue-500 font-medium hover:text-blue-600 cursor-pointer transition-colors">Open with Photo</span>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Sunrise | Sunset | Klaud</p>
            <p>Mi & Mao</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;