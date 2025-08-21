import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus } from 'lucide-react';
import { useManualUserCreate } from '@/hooks/useManualUserCreate';
import { UserInfoFields } from './form-fields/UserInfoFields';
import { PasswordField } from './form-fields/PasswordField';

interface ManualUserCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated?: () => void;
}

export const ManualUserCreateDialog = ({
  open,
  onOpenChange,
  onUserCreated
}: ManualUserCreateDialogProps) => {
  const {
    formData,
    creating,
    handleInputChange,
    handleSubmit,
    handleCancel
  } = useManualUserCreate({ onUserCreated, onOpenChange });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Create New User
          </DialogTitle>
          <DialogDescription>
            Create a new user account with login credentials. The user will be able to log in immediately. Roles and company assignments can be managed later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <UserInfoFields
            firstName={formData.firstName}
            lastName={formData.lastName}
            email={formData.email}
            disabled={creating}
            onChange={handleInputChange}
          />

          <PasswordField
            password={formData.password}
            disabled={creating}
            onChange={(value) => handleInputChange('password', value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={creating}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={creating}>
            {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};