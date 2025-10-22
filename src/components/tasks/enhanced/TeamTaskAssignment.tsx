import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Check, ChevronDown, User, Users, UserCheck, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectUsers, formatUserName, getUserInitials, getUserAvatar, ProjectUser, useCurrentUserForAssignment } from '@/hooks/useProjectUsers';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');

  const { data: teamMembers, isLoading } = useProjectUsers(projectId);

  const handleMemberSelect = (member: ProjectUser) => {
    onAssigneeChange({
      name: formatUserName(member),
      avatar: getUserAvatar(member),
      userId: member.user_id || member.id
    });
    setOpen(false);
    setShowManualEntry(false);
  };

  const handleManualSubmit = () => {
    if (manualName.trim() && manualEmail.trim()) {
      // Generate a temporary userId from email for manual entries
      const tempUserId = `manual_${manualEmail.toLowerCase()}`;
      onAssigneeChange({
        name: manualName.trim(),
        avatar: '',
        userId: tempUserId
      });
      setOpen(false);
      setShowManualEntry(false);
      setManualName('');
      setManualEmail('');
    }
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
            "justify-between bg-background/50 border-border text-foreground hover:bg-background/70",
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
      <PopoverContent className="w-[300px] p-0 bg-background border-border z-50">
        <Command>
          {!showManualEntry ? (
            <>
              <CommandInput placeholder="Search team members..." className="h-9" />
              <CommandList>
                <CommandEmpty>No team members found.</CommandEmpty>
                <CommandGroup>
                  {teamMembers?.map((member) => (
                    <CommandItem
                      key={member.id}
                      value={formatUserName(member)}
                      onSelect={() => handleMemberSelect(member)}
                      className={cn(
                        "flex items-center space-x-3 p-3",
                        member.isCurrentUser && "bg-blue-50 border-l-4 border-blue-500"
                      )}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={getUserAvatar(member)} />
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {getUserInitials(member)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          "font-medium truncate flex items-center gap-2",
                          member.isCurrentUser && "text-blue-700"
                        )}>
                          {formatUserName(member)}
                          {member.isCurrentUser && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                              Me
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {member.isCurrentUser ? "You" : (member.profile?.professional_title || member.role)}
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
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => setShowManualEntry(true)}
                    className="flex items-center space-x-2 p-3 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="font-medium">Add external assignee</span>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </>
          ) : (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">Add External Assignee</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowManualEntry(false);
                    setManualName('');
                    setManualEmail('');
                  }}
                >
                  Back
                </Button>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="manual-name" className="text-sm">Name</Label>
                  <Input
                    id="manual-name"
                    placeholder="Enter full name"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-email" className="text-sm">Email</Label>
                  <Input
                    id="manual-email"
                    type="email"
                    placeholder="Enter email address"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <Button 
                  onClick={handleManualSubmit}
                  disabled={!manualName.trim() || !manualEmail.trim()}
                  className="w-full"
                >
                  Add Assignee
                </Button>
              </div>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}