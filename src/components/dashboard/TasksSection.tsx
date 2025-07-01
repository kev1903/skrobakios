
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, Calendar, Video, FileText, MoreHorizontal } from 'lucide-react';

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
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
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
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
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
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    }
  ];

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Your Days Tasks</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs px-2 py-1">
              16 New
            </Badge>
            <Button variant="ghost" size="sm">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
          <span className="text-blue-600 border-b-2 border-blue-600 pb-1">All</span>
          <span>Due Today</span>
          <span>Overdue</span>
          <span>Completed</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {tasks.map((task) => {
            const IconComponent = task.icon;
            return (
              <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${task.bgColor}`}>
                    <IconComponent className={`w-4 h-4 ${task.iconColor}`} />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={task.avatar} />
                          <AvatarFallback className="bg-blue-500 text-white text-xs">
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
                        <Badge className="bg-green-100 text-green-700 text-xs px-2 py-1">
                          {task.amount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <Button variant="ghost" size="sm">
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
