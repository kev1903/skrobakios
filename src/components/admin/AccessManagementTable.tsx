import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Eye, 
  Edit, 
  Trash2, 
  RotateCcw, 
  Shield, 
  Users,
  Building2
} from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

// Predefined roles as specified
const PREDEFINED_ROLES = [
  'Super Admin',
  'Project Manager', 
  'Project Admin',
  'Consultant',
  'SubContractor',
  'Estimator',
  'Accounts',
  'Client Viewer'
] as const;

type PredefinedRole = typeof PREDEFINED_ROLES[number];

interface AccessUser {
  id: string;
  fullName: string;
  email: string;
  company: string;
  role: PredefinedRole;
  status: 'Active' | 'Suspended';
  avatar?: string;
  lastActive?: string;
  projectsAssigned?: number;
}

interface AccessManagementTableProps {
  users?: AccessUser[];
  onEditUser?: (userId: string) => void;
  onViewUser?: (userId: string) => void;
  onRemoveUser?: (userId: string) => void;
  onReactivateUser?: (userId: string) => void;
  onRoleChange?: (userId: string, newRole: PredefinedRole) => void;
}

// Mock data for demonstration
const mockUsers: AccessUser[] = [
  {
    id: '1',
    fullName: 'Kevin Skrobaki',
    email: 'kevin@skrobaki.com',
    company: 'Skrobaki Construction',
    role: 'Super Admin',
    status: 'Active',
    avatar: '',
    lastActive: '2 minutes ago',
    projectsAssigned: 15
  },
  {
    id: '2', 
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    company: 'Johnson Engineering',
    role: 'Project Manager',
    status: 'Active',
    avatar: '',
    lastActive: '1 hour ago',
    projectsAssigned: 8
  },
  {
    id: '3',
    fullName: 'Mike Davis',
    email: 'mike.davis@example.com', 
    company: 'Davis Construction',
    role: 'SubContractor',
    status: 'Suspended',
    avatar: '',
    lastActive: '2 days ago',
    projectsAssigned: 3
  },
  {
    id: '4',
    fullName: 'Emily Chen',
    email: 'emily.chen@example.com',
    company: 'Chen Consulting',
    role: 'Consultant',
    status: 'Active',
    avatar: '',
    lastActive: '30 minutes ago',
    projectsAssigned: 5
  }
];

export const AccessManagementTable = ({
  users = mockUsers,
  onEditUser,
  onViewUser,
  onRemoveUser,
  onReactivateUser,
  onRoleChange
}: AccessManagementTableProps) => {
  const [selectedUser, setSelectedUser] = useState<AccessUser | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const getStatusBadge = (status: 'Active' | 'Suspended') => {
    if (status === 'Active') {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">
          ✅ Active
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200">
        ⛔ Suspended
      </Badge>
    );
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    if (onRoleChange && PREDEFINED_ROLES.includes(newRole as PredefinedRole)) {
      onRoleChange(userId, newRole as PredefinedRole);
    }
  };

  const handleViewUser = (user: AccessUser) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
    if (onViewUser) onViewUser(user.id);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  const canRemoveUser = (user: AccessUser) => {
    return user.role !== 'Super Admin';
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="heading-modern text-2xl text-gradient flex items-center gap-3">
          <Shield className="w-7 h-7" />
          Access Management
        </CardTitle>
        <p className="body-modern text-muted-foreground">
          Manage user roles and access levels across projects
        </p>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-white/30 bg-white/40 backdrop-blur-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/30 bg-white/20">
                <TableHead className="font-poppins font-semibold text-slate-800">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    User
                  </div>
                </TableHead>
                <TableHead className="font-poppins font-semibold text-slate-800 hidden md:table-cell">
                  Email
                </TableHead>
                <TableHead className="font-poppins font-semibold text-slate-800 hidden lg:table-cell">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Company
                  </div>
                </TableHead>
                <TableHead className="font-poppins font-semibold text-slate-800">
                  Role
                </TableHead>
                <TableHead className="font-poppins font-semibold text-slate-800">
                  Status
                </TableHead>
                <TableHead className="font-poppins font-semibold text-slate-800 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow 
                  key={user.id} 
                  className="border-white/20 hover:bg-white/30 transition-all duration-200 group"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ring-2 ring-white/30">
                        <AvatarImage src={user.avatar} alt={user.fullName} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                          {getInitials(user.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-slate-800 body-modern">
                          {user.fullName}
                        </div>
                        <div className="text-sm text-slate-600 md:hidden body-modern">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell body-modern text-slate-700">
                    {user.email}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell body-modern text-slate-700">
                    {user.company}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) => handleRoleChange(user.id, value)}
                      disabled={user.role === 'Super Admin'}
                    >
                      <SelectTrigger className="w-full bg-white/60 border-white/30 focus:bg-white/80">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-lg border-white/30">
                        {PREDEFINED_ROLES.map((role) => (
                          <SelectItem key={role} value={role} className="body-modern">
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(user.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewUser(user)}
                        className="hover:bg-blue-100 hover:text-blue-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline ml-1">View</span>
                      </Button>
                      
                      {user.status === 'Suspended' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onReactivateUser?.(user.id)}
                          className="hover:bg-green-100 hover:text-green-700 transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span className="hidden sm:inline ml-1">Reactivate</span>
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditUser?.(user.id)}
                            className="hover:bg-amber-100 hover:text-amber-700 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            <span className="hidden sm:inline ml-1">Edit</span>
                          </Button>
                          
                          {canRemoveUser(user) ? (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="hover:bg-red-100 hover:text-red-700 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span className="hidden sm:inline ml-1">Remove</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="glass-card">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="heading-modern">
                                    Remove User Access
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="body-modern">
                                    Are you sure you want to remove {user.fullName}'s access? 
                                    This will revoke their permissions across all projects.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="body-modern">Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => onRemoveUser?.(user.id)}
                                    className="bg-red-600 hover:bg-red-700 body-modern"
                                  >
                                    Remove Access
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <div className="group relative">
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled
                                className="opacity-50 cursor-not-allowed"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden sm:inline ml-1">Remove</span>
                              </Button>
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                Super Admin cannot be removed or restricted
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* User Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="glass-card max-w-md">
            <DialogHeader>
              <DialogTitle className="heading-modern text-xl">
                User Details
              </DialogTitle>
              <DialogDescription className="body-modern text-slate-600">
                Detailed information about the selected user
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 ring-2 ring-white/30">
                    <AvatarImage src={selectedUser.avatar} alt={selectedUser.fullName} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
                      {getInitials(selectedUser.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg heading-modern">{selectedUser.fullName}</h3>
                    <p className="text-slate-600 body-modern">{selectedUser.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/30">
                  <div>
                    <label className="text-sm font-medium text-slate-700 body-modern">Company</label>
                    <p className="text-slate-800 body-modern">{selectedUser.company}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 body-modern">Role</label>
                    <p className="text-slate-800 body-modern">{selectedUser.role}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 body-modern">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedUser.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 body-modern">Projects</label>
                    <p className="text-slate-800 body-modern">{selectedUser.projectsAssigned} assigned</p>
                  </div>
                </div>
                
                {selectedUser.lastActive && (
                  <div className="pt-4 border-t border-white/30">
                    <label className="text-sm font-medium text-slate-700 body-modern">Last Active</label>
                    <p className="text-slate-800 body-modern">{selectedUser.lastActive}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};