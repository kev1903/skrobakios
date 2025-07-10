import React from 'react';
import { Eye, Edit, Trash2, UserCheck } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import type { AccessUser } from './types';

interface UserActionsProps {
  user: AccessUser;
  onViewUser: (userId: string) => void;
  onEditUser: (userId: string) => void;
  onRemoveUser: (userId: string) => void;
  onReactivateUser: (userId: string) => void;
}

const isSuperAdmin = (role: string) => role === 'superadmin';

export const UserActions = ({
  user,
  onViewUser,
  onEditUser,
  onRemoveUser,
  onReactivateUser,
}: UserActionsProps) => {
  const isUserSuperAdmin = isSuperAdmin(user.role);
  const isSuspended = user.status === 'Suspended';
  const isInvited = user.status === 'Invited';

  if (isSuspended || isInvited) {
    return (
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewUser(user.id)}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View User</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReactivateUser(user.id)}
                className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
              >
                <UserCheck className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isInvited ? 'Resend Invitation' : 'Reactivate User'}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {isInvited && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveUser(user.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete Invited User</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewUser(user.id)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>View User</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditUser(user.id)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit User</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => !isUserSuperAdmin && onRemoveUser(user.id)}
                disabled={isUserSuperAdmin}
                className={`h-8 w-8 p-0 ${
                  isUserSuperAdmin 
                    ? 'text-muted-foreground cursor-not-allowed' 
                    : 'text-red-600 hover:text-red-700'
                }`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {isUserSuperAdmin 
              ? 'Super Admin cannot be removed or restricted.' 
              : 'Remove User'
            }
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};