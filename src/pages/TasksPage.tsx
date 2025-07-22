import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit2, MoreHorizontal, ArrowLeft, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, ChevronLeft, ChevronRight, Calendar, Home, DollarSign, Monitor, Download, Book, ChevronDown } from 'lucide-react';
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

  const recentItems = [
    { name: 'Weekly Challenge', icon: '🏆', color: 'bg-orange-100' },
    { name: 'UIF Homework', icon: '📝', color: 'bg-blue-100' },
    { name: 'Music', icon: '🎵', color: 'bg-purple-100' }
  ];

  const quickSearchCategories = [
    { name: 'Event', color: 'bg-red-100 text-red-700' },
    { name: 'Study', color: 'bg-green-100 text-green-700' },
    { name: 'Reading', color: 'bg-blue-100 text-blue-700' },
    { name: 'Books', color: 'bg-purple-100 text-purple-700' },
    { name: 'UXFoundation', color: 'bg-pink-100 text-pink-700' },
    { name: 'UIF', color: 'bg-cyan-100 text-cyan-700' }
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

  const formatTime = (minutes: number) => {
    const mins = Math.floor(minutes);
    const secs = Math.floor((minutes - mins) * 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className="w-80 bg-white p-6 space-y-6">
        {/* Return to Home Button */}
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Return to Home</span>
        </Link>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Type here to search" 
            className="pl-10 bg-gray-50 border-0"
          />
        </div>

        {/* Recent */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Recent</h3>
          <div className="space-y-2">
            {recentItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center text-sm`}>
                  {item.icon}
                </div>
                <span className="text-gray-700">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Search */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Quick Search</h3>
          <div className="flex flex-wrap gap-2">
            {quickSearchCategories.map((category, index) => (
              <span key={index} className={`px-3 py-1 rounded-full text-xs font-medium ${category.color}`}>
                {category.name}
              </span>
            ))}
          </div>
        </div>

        {/* Music Player */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600 font-medium">this is what sadness feels like</p>
            <p className="text-xs text-gray-400">JVKE</p>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>1:15</span>
              <span>3:11</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div className="bg-blue-500 h-1 rounded-full" style={{ width: '38%' }}></div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Shuffle className="w-4 h-4 text-gray-400" />
            <SkipBack className="w-4 h-4 text-gray-400" />
            <Button 
              size="sm" 
              className="w-8 h-8 rounded-full"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <SkipForward className="w-4 h-4 text-gray-400" />
            <Volume2 className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Focus Timer */}
        <div className="text-center">
          <Button className="w-full mb-4">
            Focus
          </Button>
          <div className="text-2xl font-mono font-bold text-gray-900">
            00:30:00 <span className="text-sm text-gray-400">min</span>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2">
            <Button variant="ghost" size="sm">
              <span className="text-xl">−</span>
            </Button>
            <Button variant="ghost" size="sm">
              <span className="text-xl">+</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">Day</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg">
              <Calendar className="w-4 h-4" />
              <span>May 03, 2024</span>
            </div>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Tasks
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-6">
          {['All', 'On going', 'Done'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-2 px-1 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {tab}
              {tab === 'All' && <span className="ml-1 text-xs bg-gray-100 px-1.5 py-0.5 rounded">4</span>}
              {tab === 'On going' && <span className="ml-1 text-xs bg-gray-100 px-1.5 py-0.5 rounded">3</span>}
              {tab === 'Done' && <span className="ml-1 text-xs bg-gray-100 px-1.5 py-0.5 rounded">1</span>}
            </button>
          ))}
        </div>

        {/* Tasks */}
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-900 text-white px-3 py-1 rounded-lg text-sm font-medium">
                    {task.time}
                  </div>
                  <h3 className="font-semibold text-gray-900">{task.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-gray-400 cursor-pointer" />
                  <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer" />
                </div>
              </div>

              {task.tags && (
                <div className="flex gap-2 mb-4">
                  {task.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        tag === 'Creative' ? 'bg-green-100 text-green-700' :
                        tag === 'UIF' ? 'bg-cyan-100 text-cyan-700' :
                        'bg-red-100 text-red-700'
                      )}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {task.subtasks && (
                <div className="space-y-3">
                  {task.subtasks.map((subtask, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed[index]}
                        className="mt-1"
                        readOnly
                      />
                      <span className={cn(
                        "text-sm",
                        task.completed[index] ? "line-through text-gray-400" : "text-gray-700"
                      )}>
                        {subtask}
                      </span>
                    </div>
                  ))}
                  <button className="text-blue-500 text-sm font-medium">
                    + Add new task list
                  </button>
                </div>
              )}

              {task.details && (
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span>⏰ Time {task.details.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📍 Location {task.details.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>✅ Check list {task.details.checklist}</span>
                  </div>
                  <div>
                    <input type="checkbox" className="mr-2" />
                    <span>{task.details.call}</span>
                  </div>
                </div>
              )}

              {task.description && (
                <p className="text-sm text-gray-600">{task.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 bg-white p-6 space-y-6">
        {/* Calendar */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium">Month</span>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">May, 2024</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <ChevronLeft className="w-5 h-5 text-gray-400 cursor-pointer" />
              <span className="font-medium">Fri, May 3, 2024</span>
              <ChevronRight className="w-5 h-5 text-gray-400 cursor-pointer" />
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                <div key={day} className="text-xs text-gray-500 text-center py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentMonth).map((day, index) => (
                <div key={index} className="aspect-square flex items-center justify-center">
                  {day && (
                    <span className={cn(
                      "w-8 h-8 flex items-center justify-center text-sm rounded-full",
                      day === 3 ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
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
          <h3 className="font-semibold text-gray-900 mb-3">Dashboard</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-orange-500" />
                <span className="text-sm">Finance</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-gray-600" />
                <span className="text-sm">Screen Time</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          <button className="w-full text-left p-3 text-blue-500 text-sm">
            + Add
          </button>
        </div>

        {/* Resources */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Resources</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Home className="w-5 h-5 text-gray-600" />
                <span className="text-sm">Web development technology</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Book className="w-5 h-5 text-gray-600" />
                <span className="text-sm">Data management system</span>
              </div>
              <span className="text-xs text-blue-500">Books</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-gray-600" />
                <span className="text-sm">Adobe Premiere</span>
              </div>
            </div>
          </div>
          <button className="w-full text-left p-3 text-blue-500 text-sm">
            + Add
          </button>
        </div>

        {/* Gallery */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Gallery</h3>
            <span className="text-sm text-blue-500">Open with Photo</span>
          </div>
          <p className="text-sm text-gray-600">Sunrise | Sunset | Klaud</p>
          <p className="text-sm text-gray-600">Mi & Mao</p>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;