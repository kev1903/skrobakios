import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserCreatedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userDetails: {
    email: string;
    tempPassword: string;
    firstName: string;
    lastName: string;
  } | null;
}

export const UserCreatedDialog = ({ isOpen, onClose, userDetails }: UserCreatedDialogProps) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

  const copyAllDetails = () => {
    if (!userDetails) return;
    
    const details = `Login Details for ${userDetails.firstName} ${userDetails.lastName}
Email: ${userDetails.email}
Temporary Password: ${userDetails.tempPassword}

Please change your password after first login.`;
    
    navigator.clipboard.writeText(details);
    toast({
      title: "Copied",
      description: "All login details copied to clipboard",
    });
  };

  if (!userDetails) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            User Created Successfully
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-medium text-green-800 mb-2">
              {userDetails.firstName} {userDetails.lastName}
            </h3>
            <p className="text-sm text-green-700 mb-3">
              User account has been created. Please share these temporary login details:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white p-3 rounded border">
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-500">Email</label>
                  <p className="text-sm font-mono">{userDetails.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(userDetails.email, 'Email')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between bg-white p-3 rounded border">
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-500">Temporary Password</label>
                  <p className="text-sm font-mono">{userDetails.tempPassword}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(userDetails.tempPassword, 'Password')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 p-3 rounded border border-amber-200">
            <p className="text-xs text-amber-800">
              ⚠️ Make sure to share these credentials securely. The user should change their password on first login.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={copyAllDetails} className="flex-1">
              <Copy className="w-4 h-4 mr-2" />
              Copy All Details
            </Button>
            <Button variant="outline" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};