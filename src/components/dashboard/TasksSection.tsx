
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, Calendar, Video, FileText, MoreHorizontal, CheckCircle2 } from 'lucide-react';

export const TasksSection = () => {
  const tasks = [
    {
      id: 1,
      title: 'Google Meet Call',
      assignee: 'Peter Thomas',
      avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png',
      time: '28/01/2025 • 2 pm',
      type: 'call',
      status: 'scheduled',
      icon: Video,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Send Proposal',
      assignee: 'Alexis Hayworth',
      avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png',
      amount: '$20,000',
      type: 'proposal',
      status: 'pending',
      icon: FileText,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Google Meet Call',
      assignee: 'Vivian Franco',
      avatar: '/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png',
      time: '28/01/2025 • 3 pm',
      type: 'call',
      status: 'scheduled',
      icon: Video,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      priority: 'low'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Your Day's Tasks</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-[#E6F0FF] text-[#3366FF] border-[#4D8BFF] px-3 py-1 text-xs font-medium">
              16 New
            </Badge>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-sm text-gray-500 mt-4 border-b border-gray-100">
          <button className="text-[#3366FF] border-b-2 border-[#3366FF] pb-2 font-medium transition-colors">
            All
          </button>
          <button className="hover:text-gray-700 pb-2 transition-colors">Due Today</button>
          <button className="hover:text-gray-700 pb-2 transition-colors">Overdue</button>
          <button className="hover:text-gray-700 pb-2 transition-colors">Completed</button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {tasks.map((task) => {
            const IconComponent = task.icon;
            return (
              <div key={task.id} className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-md transition-all duration-200 border border-gray-100">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-3 rounded-xl ${task.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent className={`w-5 h-5 ${task.iconColor}`} />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-[#3366FF] transition-colors">{task.title}</h4>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6 ring-2 ring-white">
                          <AvatarImage src={task.avatar} />
                          <AvatarFallback className="bg-[#3366FF] text-white text-xs">
                            {task.assignee.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600">{task.assignee}</span>
                      </div>
                      {task.time && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{task.time}</span>
                        </div>
                      )}
                      {task.amount && (
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs px-2 py-1 font-medium">
                          {task.amount}
                        </Badge>
                      )}
                      <Badge className={`${getPriorityColor(task.priority)} text-xs px-2 py-1 font-medium border`}>
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 rounded-full bg-[#3366FF] hover:bg-[#1F3D7A] text-white shadow-lg group-hover:scale-110 transition-all duration-200"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
