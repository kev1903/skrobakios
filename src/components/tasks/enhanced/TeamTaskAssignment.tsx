import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronDown, User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: string;
  user_id: string | null;
  email: string | null;
  role: string;
  status: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    avatar_url: string | null;
    professional_title: string | null;
  } | null;
}

interface TeamTaskAssignmentProps {
  projectId: string;
  currentAssignee?: { name: string; avatar: string; userId?: string };
  onAssigneeChange: (assignee: { name: string; avatar: string; userId: string }) => void;
  className?: string;
}

export function TeamTaskAssignment({ 
  projectId, 
  currentAssignee, 
  onAssigneeChange, 
  className 
}: TeamTaskAssignmentProps) {
  const [open, setOpen] = useState(false);

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
            email,
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

  const formatMemberName = (member: TeamMember) => {
    if (member.profiles?.first_name || member.profiles?.last_name) {
      return `${member.profiles.first_name || ''} ${member.profiles.last_name || ''}`.trim();
    }
    return member.email || 'Unknown User';
  };

  const getMemberAvatar = (member: TeamMember) => {
    return member.profiles?.avatar_url || '';
  };

  const getMemberInitials = (member: TeamMember) => {
    const name = formatMemberName(member);
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleMemberSelect = (member: TeamMember) => {
    onAssigneeChange({
      name: formatMemberName(member),
      avatar: getMemberAvatar(member),
      userId: member.user_id || member.id
    });
    setOpen(false);
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse" />
        <div className="w-24 h-4 bg-white/20 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between bg-white/10 border-white/20 text-white hover:bg-white/20",
            className
          )}
        >
          {currentAssignee ? (
            <div className="flex items-center space-x-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={currentAssignee.avatar} />
                <AvatarFallback className="bg-white/20 text-white text-xs">
                  {currentAssignee.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{currentAssignee.name}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Assign to member</span>
            </div>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 bg-white/95 backdrop-blur-xl border-white/20">
        <Command>
          <CommandInput placeholder="Search team members..." className="h-9" />
          <CommandList>
            <CommandEmpty>No team members found.</CommandEmpty>
            <CommandGroup>
              {teamMembers?.map((member) => (
                <CommandItem
                  key={member.id}
                  value={formatMemberName(member)}
                  onSelect={() => handleMemberSelect(member)}
                  className="flex items-center space-x-3 p-3"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={getMemberAvatar(member)} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {getMemberInitials(member)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {formatMemberName(member)}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {member.profiles?.professional_title || member.role}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {member.role}
                  </Badge>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      currentAssignee?.userId === (member.user_id || member.id)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}