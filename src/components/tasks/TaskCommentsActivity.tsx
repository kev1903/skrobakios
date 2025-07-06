import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Activity, Send, ThumbsUp } from 'lucide-react';

interface Comment {
  id: string;
  author: { name: string; avatar: string };
  content: string;
  timestamp: string;
}

interface ActivityItem {
  id: string;
  author: { name: string; avatar: string };
  action: string;
  timestamp: string;
  type: 'task_created' | 'task_completed' | 'comment_added' | 'task_updated';
}

interface TaskCommentsActivityProps {
  taskId: string;
}

export const TaskCommentsActivity = ({ taskId }: TaskCommentsActivityProps) => {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: { name: 'Zayra Panaligan', avatar: '' },
      content: 'PDF link: https://enassee.sharepoint.com/.../ESqJOTUPnVKmvPdeBL_6FwB2h_82Ru-9fo62yDqziyxw?e=TnyLH0',
      timestamp: '29 Jun, 2023'
    }
  ]);

  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: '1',
      author: { name: 'Kevin Enassee', avatar: '' },
      action: 'created this task',
      timestamp: '28 Jun, 2023',
      type: 'task_created'
    },
    {
      id: '2',
      author: { name: 'Kevin Enassee', avatar: '' },
      action: 'completed this task',
      timestamp: '11 Jun, 2024',
      type: 'task_completed'
    }
  ]);

  const [newComment, setNewComment] = useState('');
  const [collaborators] = useState([
    { name: 'Kevin Enassee', avatar: '' },
    { name: 'Zayra Panaligan', avatar: '' }
  ]);

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        author: { name: 'Current User', avatar: '' },
        content: newComment.trim(),
        timestamp: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleAddComment();
    }
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'task_completed':
        return <div className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white rounded-full" />
        </div>;
      default:
        return <div className="w-3 h-3 rounded-full bg-gray-400" />;
    }
  };

  return (
    <div className="border-t pt-6 mt-8">
      <Tabs defaultValue="comments" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="comments" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Comments</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>All activity</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comments" className="space-y-4">
          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.author.avatar} />
                  <AvatarFallback className="text-xs">
                    {comment.author.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm">{comment.author.name}</span>
                    <span className="text-xs text-gray-500">{comment.timestamp}</span>
                    <Button variant="ghost" size="sm" className="h-6 px-2">
                      <ThumbsUp className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="text-sm text-gray-700">
                    {comment.content.includes('http') ? (
                      <a href={comment.content} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {comment.content}
                      </a>
                    ) : (
                      comment.content
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Comment */}
          <div className="flex space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs">U</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a comment..."
                className="min-h-[60px] resize-none"
              />
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Collaborators</span>
                  <div className="flex -space-x-1">
                    {collaborators.map((collaborator, index) => (
                      <Avatar key={index} className="w-6 h-6 border-2 border-white">
                        <AvatarImage src={collaborator.avatar} />
                        <AvatarFallback className="text-xs">
                          {collaborator.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>
                <Button onClick={handleAddComment} disabled={!newComment.trim()} size="sm">
                  <Send className="w-4 h-4 mr-2" />
                  Comment
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          {/* Activity List */}
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex space-x-3">
                <div className="flex flex-col items-center">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={activity.author.avatar} />
                    <AvatarFallback className="text-xs">
                      {activity.author.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm">{activity.author.name}</span>
                    <span className="text-sm text-gray-600">{activity.action}</span>
                    <span className="text-xs text-gray-500">• {activity.timestamp}</span>
                    <Button variant="ghost" size="sm" className="h-6 px-2">
                      <ThumbsUp className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};