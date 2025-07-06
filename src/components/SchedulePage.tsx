import React from 'react';
import { Calendar, Clock, Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SchedulePageProps {
  onNavigate?: (page: string) => void;
}

export const SchedulePage = ({ onNavigate }: SchedulePageProps) => {
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Mock schedule data
  const scheduleItems = [
    {
      id: 1,
      title: 'Project Meeting - Melbourne Office Tower',
      time: '09:00 AM',
      duration: '1h 30m',
      type: 'meeting',
      priority: 'high',
      location: 'Conference Room A'
    },
    {
      id: 2,
      title: 'Site Inspection - Residential Complex',
      time: '11:30 AM',
      duration: '2h 00m',
      type: 'site-visit',
      priority: 'medium',
      location: 'Brighton, VIC'
    },
    {
      id: 3,
      title: 'Design Review Session',
      time: '02:00 PM',
      duration: '45m',
      type: 'review',
      priority: 'high',
      location: 'Virtual Meeting'
    },
    {
      id: 4,
      title: 'Client Presentation',
      time: '04:00 PM',
      duration: '1h 15m',
      type: 'presentation',
      priority: 'high',
      location: 'Client Office'
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'site-visit':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'review':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'presentation':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="h-full bg-white/5 backdrop-blur-sm overflow-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white font-poppins">My Schedule</h1>
              <p className="text-white/70 font-inter">Manage your daily appointments and tasks</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              New Event
            </Button>
          </div>
        </div>

        {/* Calendar Navigation */}
        <Card className="glass-card mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white font-poppins">{currentMonth}</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  Today
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Today's Schedule */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white font-poppins flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Today's Schedule
              </CardTitle>
              <Badge variant="secondary" className="bg-white/20 text-white">
                {scheduleItems.length} Events
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {scheduleItems.map((item) => (
              <div
                key={item.id}
                className="glass-card p-4 hover:glass-hover transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-white font-poppins">{item.title}</h3>
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/70 font-inter">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.time}
                      </span>
                      <span>{item.duration}</span>
                      <span>{item.location}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={`${getTypeColor(item.type)}`}>
                    {item.type.replace('-', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/70 font-inter">Today's Events</p>
                  <p className="text-2xl font-bold text-white font-poppins">4</p>
                </div>
                <Calendar className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/70 font-inter">Total Hours</p>
                  <p className="text-2xl font-bold text-white font-poppins">6.5</p>
                </div>
                <Clock className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/70 font-inter">High Priority</p>
                  <p className="text-2xl font-bold text-white font-poppins">3</p>
                </div>
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">!</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};