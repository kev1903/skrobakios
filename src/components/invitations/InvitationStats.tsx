import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  total: number;
  pending: number;
  accepted: number;
  expired: number;
}

export const InvitationStats: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    accepted: 0,
    expired: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase
          .from('platform_invitations')
          .select('status, expires_at');

        if (error) throw error;

        const now = new Date();
        const stats = data.reduce((acc, invitation) => {
          acc.total++;
          
          const isExpired = new Date(invitation.expires_at) < now;
          
          if (invitation.status === 'accepted') {
            acc.accepted++;
          } else if (invitation.status === 'pending') {
            if (isExpired) {
              acc.expired++;
            } else {
              acc.pending++;
            }
          }
          
          return acc;
        }, { total: 0, pending: 0, accepted: 0, expired: 0 });

        setStats(stats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Invitations",
      value: stats.total,
      icon: Users,
      description: "All time invitations sent",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock,
      description: "Awaiting response",
    },
    {
      title: "Accepted",
      value: stats.accepted,
      icon: UserCheck,
      description: "Successfully joined",
    },
    {
      title: "Expired",
      value: stats.expired,
      icon: UserX,
      description: "No longer valid",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};