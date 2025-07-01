
import { useState, useEffect } from "react";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Mail, 
  Settings, 
  UserPlus, 
  MoreHorizontal, 
  Copy,
  Link as LinkIcon,
  Shield,
  User,
  Crown
} from "lucide-react";
import { Project } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TeamManagementPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Project admin' | 'Editor' | 'Guest';
  avatar?: string;
  status: 'active' | 'pending';
}

export const TeamManagementPage = ({ project, onNavigate }: TeamManagementPageProps) => {
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<'Editor' | 'Guest'>('Editor');
  const [notifyOnTaskAdd, setNotifyOnTaskAdd] = useState(false);
  const [accessSetting, setAccessSetting] = useState("Private to members");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Task collaborators',
      email: '',
      role: 'Editor',
      status: 'active'
    },
    {
      id: '2',
      name: 'Kevin Enassee',
      email: 'kevin@skrobaki.com',
      role: 'Project admin',
      status: 'active'
    },
    {
      id: '3',
      name: 'Romulo Bartolome',
      email: 'projects@skrobaki.com',
      role: 'Editor',
      status: 'active'
    },
    {
      id: '4',
      name: 'Smy',
      email: 'smy.cherith@gmail.com',
      role: 'Guest',
      status: 'active'
    },
    {
      id: '5',
      name: 'Zayra Panaligan',
      email: 'admin@skrobaki.com',
      role: 'Project admin',
      status: 'active'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "in_progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "on_hold": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "Completed";
      case "in_progress": return "In Progress";
      case "pending": return "Pending";
      case "on_hold": return "On Hold";
      default: return "Unknown";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Project admin':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'Editor':
        return <Shield className="w-4 h-4 text-blue-600" />;
      case 'Guest':
        return <User className="w-4 h-4 text-gray-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Project admin':
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'Editor':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'Guest':
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to send the invitation.",
        variant: "destructive",
      });
      return;
    }

    // In a real application, this would send an invitation email
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'pending'
    };

    setTeamMembers(prev => [...prev, newMember]);
    setInviteEmail("");
    
    toast({
      title: "Invitation Sent",
      description: `Invitation has been sent to ${inviteEmail}`,
    });
  };

  const handleCopyProjectLink = () => {
    const projectLink = `${window.location.origin}/project/${project.id}`;
    navigator.clipboard.writeText(projectLink);
    
    toast({
      title: "Link Copied",
      description: "Project link has been copied to clipboard.",
    });
  };

  const handleRoleChange = (memberId: string, newRole: 'Project admin' | 'Editor' | 'Guest') => {
    setTeamMembers(prev => 
      prev.map(member => 
        member.id === memberId ? { ...member, role: newRole } : member
      )
    );
    
    toast({
      title: "Role Updated",
      description: "Team member role has been updated successfully.",
    });
  };

  const handleRemoveMember = (memberId: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== memberId));
    
    toast({
      title: "Member Removed",
      description: "Team member has been removed from the project.",
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <ProjectSidebar 
        project={project} 
        onNavigate={onNavigate} 
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        activeSection="team"
      />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Share {project.project_id} - {project.name}
            </h1>
            <p className="text-gray-600 mt-1">Manage team access and collaboration settings</p>
          </div>

          <div className="max-w-2xl space-y-6">
            {/* Invite Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Invite with email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Add people, emails, or teams..."
                      className="bg-gray-800 text-white border-gray-700 placeholder-gray-400"
                    />
                  </div>
                  <Select value={inviteRole} onValueChange={(value: 'Editor' | 'Guest') => setInviteRole(value)}>
                    <SelectTrigger className="w-32 bg-gray-800 text-white border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Editor">Editor</SelectItem>
                      <SelectItem value="Guest">Guest</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleInvite}>
                    Invite
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="notify-tasks" 
                    checked={notifyOnTaskAdd}
                    onCheckedChange={(checked) => setNotifyOnTaskAdd(checked as boolean)}
                  />
                  <Label htmlFor="notify-tasks" className="text-sm text-gray-400">
                    Notify when tasks are added to the project
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Access Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Access settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={accessSetting} onValueChange={setAccessSetting}>
                  <SelectTrigger className="bg-gray-800 text-white border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Private to members">Private to members</SelectItem>
                    <SelectItem value="Anyone with link">Anyone with link</SelectItem>
                    <SelectItem value="Public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Members
                  </CardTitle>
                  <Button variant="link" className="text-blue-400 p-0 h-auto">
                    Manage notifications
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {teamMembers.map((member, index) => (
                  <div key={member.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className={`${getAvatarColor(member.name)} text-white text-sm font-medium`}>
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{member.name}</span>
                            {member.status === 'pending' && (
                              <Badge variant="outline" className="text-xs">
                                Guest
                              </Badge>
                            )}
                          </div>
                          {member.email && (
                            <p className="text-sm text-gray-400">{member.email}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Select 
                          value={member.role} 
                          onValueChange={(value: 'Project admin' | 'Editor' | 'Guest') => 
                            handleRoleChange(member.id, value)
                          }
                        >
                          <SelectTrigger className="w-40 bg-gray-800 text-white border-gray-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Project admin">Project admin</SelectItem>
                            <SelectItem value="Editor">Editor</SelectItem>
                            <SelectItem value="Guest">Guest</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleRemoveMember(member.id)}>
                              Remove from project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    {index < teamMembers.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Copy Project Link */}
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={handleCopyProjectLink}
                className="flex items-center gap-2"
              >
                <LinkIcon className="w-4 h-4" />
                Copy project link
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
