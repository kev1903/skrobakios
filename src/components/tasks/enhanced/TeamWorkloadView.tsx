import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Task } from '../types';

interface TeamMember {
  id: string;
  user_id: string | null;
  email: string | null;
  role: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    professional_title: string | null;
  } | null;
}

interface TeamWorkloadViewProps {
  projectId: string;
  tasks: Task[];
}

interface MemberWorkload {
  member: TeamMember;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
}

export function TeamWorkloadView({ projectId, tasks }: TeamWorkloadViewProps) {
  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ["project-team-members", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_members")
        .select(`
          *,
          profiles!project_members_user_id_fkey (
            first_name,
            last_name,
            avatar_url,
            professional_title
          )
        `)
        .eq("project_id", projectId)
        .eq("status", "active");
      
      if (error) throw error;
      return (data || []) as any;
    },
    enabled: !!projectId,
  });

  const calculateWorkload = (): MemberWorkload[] => {
    if (!teamMembers) return [];

    return teamMembers.map(member => {
      const memberName = `${member.profiles?.first_name || ''} ${member.profiles?.last_name || ''}`.trim() || member.email || 'Unknown';
      
      // Find tasks assigned to this member
      const memberTasks = tasks.filter(task => 
        task.assignedTo.name === memberName || 
        task.assignedTo.userId === member.user_id
      );

      const totalTasks = memberTasks.length;
      const completedTasks = memberTasks.filter(task => task.status === 'Completed').length;
      const inProgressTasks = memberTasks.filter(task => task.status === 'In Progress').length;
      const pendingTasks = memberTasks.filter(task => task.status === 'Pending').length;
      
      // Calculate overdue tasks (simplified - tasks with past due dates that aren't completed)
      const now = new Date();
      const overdueTasks = memberTasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        return dueDate < now && task.status !== 'Completed';
      }).length;

      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      return {
        member,
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        overdueTasks,
        completionRate
      };
    });
  };

  const workloadData = calculateWorkload();

  const getWorkloadColor = (workload: MemberWorkload) => {
    if (workload.overdueTasks > 0) return 'text-red-400';
    if (workload.inProgressTasks > 3) return 'text-yellow-400';
    if (workload.completionRate > 80) return 'text-green-400';
    return 'text-white/80';
  };

  const getWorkloadStatus = (workload: MemberWorkload) => {
    if (workload.overdueTasks > 0) return 'Overdue Tasks';
    if (workload.inProgressTasks > 3) return 'Heavy Load';
    if (workload.completionRate > 80) return 'On Track';
    return 'Available';
  };

  if (isLoading) {
    return (
      <Card className="backdrop-blur-xl bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Team Workload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-white/20 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="w-32 h-4 bg-white/20 rounded animate-pulse" />
                  <div className="w-24 h-3 bg-white/20 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-xl bg-white/10 border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Team Workload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {workloadData.map(workload => (
          <div key={workload.member.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={workload.member.profiles?.avatar_url || ''} />
                  <AvatarFallback className="bg-white/20 text-white">
                    {`${workload.member.profiles?.first_name?.[0] || ''}${workload.member.profiles?.last_name?.[0] || ''}`}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium text-white">
                    {`${workload.member.profiles?.first_name || ''} ${workload.member.profiles?.last_name || ''}`.trim() || workload.member.email}
                  </h4>
                  <p className="text-sm text-white/70">
                    {workload.member.profiles?.professional_title || workload.member.role}
                  </p>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={`${getWorkloadColor(workload)} border-current/30`}
              >
                {getWorkloadStatus(workload)}
              </Badge>
            </div>

            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="space-y-1">
                <p className="text-sm text-white/70">Total</p>
                <p className="text-lg font-semibold text-white">{workload.totalTasks}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-white/70">Completed</p>
                <p className="text-lg font-semibold text-green-400">{workload.completedTasks}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-white/70">In Progress</p>
                <p className="text-lg font-semibold text-blue-400">{workload.inProgressTasks}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-white/70">Overdue</p>
                <p className="text-lg font-semibold text-red-400">{workload.overdueTasks}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">Completion Rate</span>
                <span className="text-white">{Math.round(workload.completionRate)}%</span>
              </div>
              <Progress 
                value={workload.completionRate} 
                className="h-2 bg-white/20"
              />
            </div>
          </div>
        ))}

        {workloadData.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-white/50 mx-auto mb-3" />
            <p className="text-white/70">No team members found</p>
            <p className="text-sm text-white/50">Add team members to see workload distribution</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}