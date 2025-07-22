import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit2, MoreHorizontal, ArrowLeft, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, ChevronLeft, ChevronRight, Calendar, Home, DollarSign, Monitor, Download, Book, ChevronDown, Clock, MapPin, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const TasksPage = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(2024, 4)); // May 2024

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

  const taskBacklog = [
    { id: 1, title: 'Review quarterly goals', project: 'Q2 Strategic Planning', priority: 'High', tags: ['Planning'] },
    { id: 2, title: 'Update portfolio website', project: 'Personal Branding', priority: 'Medium', tags: ['Development', 'Portfolio'] },
    { id: 3, title: 'Research competitor analysis', project: 'Market Research', priority: 'Low', tags: ['Research'] },
    { id: 4, title: 'Schedule team sync meeting', project: 'Team Management', priority: 'High', tags: ['Meeting'] },
    { id: 5, title: 'Complete certification course', project: 'Professional Development', priority: 'Medium', tags: ['Learning'] }
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
            <button className="text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors">
              + Add to backlog
            </button>
          </div>
          <div className="space-y-3">
            {taskBacklog.map((task) => (
              <div key={task.id} className="p-3 rounded-xl hover:bg-gray-50/50 cursor-pointer transition-colors group border border-gray-100/50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">{task.title}</h4>
                    <p className="text-xs text-gray-500">{task.project}</p>
                  </div>
                  <span className={cn(
                    "px-2 py-1 rounded-lg text-xs font-medium ml-2 flex-shrink-0",
                    task.priority === 'High' ? 'bg-red-50 text-red-600' :
                    task.priority === 'Medium' ? 'bg-yellow-50 text-yellow-600' :
                    'bg-green-50 text-green-600'
                  )}>
                    {task.priority}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {task.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Music Player */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200/50">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-800 font-semibold">this is what sadness feels like</p>
            <p className="text-xs text-gray-500 mt-1">JVKE</p>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>1:15</span>
              <span>3:11</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" style={{ width: '38%' }}></div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Shuffle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
            <SkipBack className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
            <Button 
              size="sm" 
              className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </Button>
            <SkipForward className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
            <Volume2 className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
          </div>
        </div>

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
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-gray-700">
              <span className="font-semibold">Day</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-3 bg-white/70 backdrop-blur-xl px-4 py-2.5 rounded-xl border border-gray-200/50 shadow-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-700">May 03, 2024</span>
            </div>
          </div>
          <Button className="bg-blue-500 hover:bg-blue-600 rounded-xl px-6 py-2.5 font-medium shadow-lg shadow-blue-500/25">
            <Plus className="w-4 h-4 mr-2" />
            New Tasks
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 mb-8 border-b border-gray-200">
          {[
            { name: 'All', count: 4 },
            { name: 'On going', count: 3 },
            { name: 'Done', count: 1 }
          ].map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={cn(
                "pb-3 px-1 text-sm font-medium border-b-2 transition-all duration-300 flex items-center gap-2",
                activeTab === tab.name
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.name}
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Tasks */}
        <div className="space-y-6">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm">
                    {task.time}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">{task.title}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <Edit2 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
                  <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
                </div>
              </div>

              {task.tags && (
                <div className="flex gap-3 mb-5">
                  {task.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border",
                        tag === 'Creative' ? 'bg-green-50 text-green-600 border-green-200' :
                        tag === 'UIF' ? 'bg-cyan-50 text-cyan-600 border-cyan-200' :
                        'bg-red-50 text-red-600 border-red-200'
                      )}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {task.subtasks && (
                <div className="space-y-4">
                  {task.subtasks.map((subtask, index) => (
                    <div key={index} className="flex items-start gap-3 group">
                      <div className="mt-1">
                        {task.completed[index] ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
                        )}
                      </div>
                      <span className={cn(
                        "text-sm leading-relaxed",
                        task.completed[index] ? "line-through text-gray-400" : "text-gray-700"
                      )}>
                        {subtask}
                      </span>
                    </div>
                  ))}
                  <button className="text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors mt-4">
                    + Add new task list
                  </button>
                </div>
              )}

              {task.details && (
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4" />
                    <span>Time {task.details.time}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4" />
                    <span>Location {task.details.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Check list {task.details.checklist}</span>
                  </div>
                  <div className="flex items-start gap-3 mt-4">
                    <Circle className="w-4 h-4 mt-0.5 text-gray-300" />
                    <span>{task.details.call}</span>
                  </div>
                </div>
              )}

              {task.description && (
                <p className="text-sm text-gray-600 leading-relaxed">{task.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 bg-white/70 backdrop-blur-xl border-l border-gray-200/50 p-6 space-y-6 shadow-sm">
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