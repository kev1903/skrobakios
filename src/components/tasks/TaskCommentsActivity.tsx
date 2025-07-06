import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Activity, Send, Timer } from 'lucide-react';
import { useTaskComments } from '@/hooks/useTaskComments';
import { useTaskActivity } from '@/hooks/useTaskActivity';
import { useUser } from '@/contexts/UserContext';

interface TaskCommentsActivityProps {
  taskId: string;
}

export const TaskCommentsActivity = ({ taskId }: TaskCommentsActivityProps) => {
  const { comments, addComment, loading: commentsLoading } = useTaskComments(taskId);
  const { activities, loading: activitiesLoading } = useTaskActivity(taskId);
  const [newComment, setNewComment] = useState('');
  const { userProfile } = useUser();

  const handleAddComment = async () => {
    if (newComment.trim()) {
      try {
        await addComment({
          task_id: taskId,
          user_name: `${userProfile.firstName} ${userProfile.lastName}`.trim() || 'Anonymous User',
          user_avatar: userProfile.avatarUrl,
          comment: newComment.trim()
        });
        setNewComment('');
      } catch (error) {
        console.error('Failed to add comment:', error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleAddComment();
    }
  };

  const getActivityIcon = (actionType: string) => {
    switch (actionType) {
      case 'task_completed':
        return <div className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white rounded-full" />
        </div>;
      case 'task_updated':
        return <div className="w-3 h-3 rounded-full bg-blue-500" />;
      default:
        return <div className="w-3 h-3 rounded-full bg-gray-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
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
            {commentsLoading ? (
              <div className="text-center py-4 text-gray-500">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No comments yet</div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.user_avatar} />
                    <AvatarFallback className="text-xs">
                      {comment.user_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">{comment.user_name}</span>
                      <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <Timer className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="text-sm text-gray-700">
                      {comment.comment.includes('http') ? (
                        <a href={comment.comment} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {comment.comment}
                        </a>
                      ) : (
                        comment.comment
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Comment */}
          <div className="flex space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={userProfile.avatarUrl} />
              <AvatarFallback className="text-xs">
                {`${userProfile.firstName} ${userProfile.lastName}`.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
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
                <span className="text-xs text-gray-500">⌘ + Enter to send</span>
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
            {activitiesLoading ? (
              <div className="text-center py-4 text-gray-500">Loading activity...</div>
            ) : activities.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No activity yet</div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex space-x-3">
                  <div className="flex flex-col items-center">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={activity.user_avatar} />
                      <AvatarFallback className="text-xs">
                        {activity.user_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {getActivityIcon(activity.action_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">{activity.user_name}</span>
                      <span className="text-sm text-gray-600">{activity.action_description}</span>
                      <span className="text-xs text-gray-500">• {formatDate(activity.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};