import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useProjectUsers, formatUserName } from '@/hooks/useProjectUsers';
import { User, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface SimpleTeamAssignmentProps {
  projectId: string;
  currentAssignee?: { name: string; avatar: string; userId?: string };
  onAssigneeChange: (assignee: { name: string; avatar: string; userId: string } | null) => void;
  className?: string;
}

export function SimpleTeamAssignment({ 
  projectId, 
  currentAssignee, 
  onAssigneeChange, 
  className 
}: SimpleTeamAssignmentProps) {
  const { data: teamMembers, isLoading } = useProjectUsers(projectId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [selectOpen, setSelectOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleChange = (value: string) => {
    if (value === 'add_new') {
      setSelectOpen(false);
      setDialogOpen(true);
      return;
    }
    
    if (value === 'unassign') {
      onAssigneeChange(null);
      setSelectOpen(false);
      return;
    }
    
    const member = teamMembers?.find(m => (m.user_id || m.id) === value);
    if (member) {
      onAssigneeChange({
        name: formatUserName(member),
        avatar: member.profile?.avatar_url || '',
        userId: member.user_id || member.id
      });
      setSelectOpen(false);
    }
  };

  const filteredMembers = teamMembers?.filter(member => {
    const memberId = member.user_id || member.id;
    if (!memberId || memberId.trim() === '') return false;
    
    if (!searchQuery) return true;
    
    const memberName = formatUserName(member).toLowerCase();
    return memberName.includes(searchQuery.toLowerCase());
  }) || [];

  const handleManualSubmit = () => {
    if (manualName.trim() && manualEmail.trim()) {
      const tempUserId = `manual_${manualEmail.toLowerCase()}`;
      onAssigneeChange({
        name: manualName.trim(),
        avatar: '',
        userId: tempUserId
      });
      setDialogOpen(false);
      setManualName('');
      setManualEmail('');
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setManualName('');
    setManualEmail('');
  };

  if (isLoading) {
    return (
      <div className={`h-7 flex items-center text-xs border-0 bg-transparent p-1 ${className}`}>
        <span className="text-xs text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <>
      <Select 
        value={currentAssignee?.userId || 'unassigned'} 
        onValueChange={handleChange}
        open={selectOpen}
        onOpenChange={setSelectOpen}
      >
        <SelectTrigger className={`h-7 text-xs border-0 bg-transparent hover:bg-accent/30 focus:ring-0 focus:ring-offset-0 p-1 ${className}`}>
        {currentAssignee?.name ? (
          <div className="flex items-center gap-1.5">
            <Avatar className="h-4 w-4">
              {currentAssignee.avatar ? (
                <AvatarImage src={currentAssignee.avatar} alt={currentAssignee.name} />
              ) : null}
              <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                {getInitials(currentAssignee.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">
              {currentAssignee.name}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground truncate">
            Assign to...
          </span>
        )}
        </SelectTrigger>
        <SelectContent className="min-w-[280px] bg-background border shadow-lg z-50 p-0">
          <div className="p-2 border-b">
            <Input
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 text-xs"
              autoFocus
            />
          </div>
          <div className="p-1 max-h-[200px] overflow-y-auto">
            <SelectItem value="unassign" className="text-xs py-2 pr-2 cursor-pointer">
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[10px] bg-muted">
                    <User className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-muted-foreground">Unassigned</span>
              </div>
            </SelectItem>
            {filteredMembers.map((member) => {
              const memberName = formatUserName(member);
              const avatarUrl = member.profile?.avatar_url;
              
              return (
                <SelectItem 
                  key={member.id} 
                  value={member.user_id || member.id} 
                  className="text-xs py-2 pr-2 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      {avatarUrl ? (
                        <AvatarImage src={avatarUrl} alt={memberName} />
                      ) : null}
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                        {getInitials(memberName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{memberName}</span>
                    {member.isCurrentUser && (
                      <span className="text-xs text-blue-600">(Me)</span>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </div>
          <Separator />
          <SelectItem 
            value="add_new" 
            className="text-xs py-2 cursor-pointer text-primary font-medium justify-center"
          >
            <div className="flex items-center gap-2 justify-center w-full">
              <UserPlus className="h-4 w-4" />
              <span>Add New</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-background">
          <DialogHeader>
            <DialogTitle>Add New</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Input
                id="name"
                placeholder="Name"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Input
                id="email"
                type="email"
                placeholder="Email Address"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                className="bg-background"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleDialogClose}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleManualSubmit}
              disabled={!manualName.trim() || !manualEmail.trim()}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
