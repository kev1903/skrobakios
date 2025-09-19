import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, RefreshCw, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CreateUserForBusinessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  companyName: string;
  onUserCreated: () => void;
}

export const CreateUserForBusinessDialog = ({ 
  open, 
  onOpenChange, 
  companyId, 
  companyName,
  onUserCreated 
}: CreateUserForBusinessDialogProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'admin' as 'admin' | 'manager' | 'supplier' | 'sub_contractor' | 'consultant' | 'client'
  });

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    
    // Ensure at least one character from each type
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*";
    
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    setFormData(prev => ({ ...prev, password }));
    toast({
      title: "Password Generated",
      description: "A secure password has been generated",
    });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.firstName) {
      toast({
        title: "Error",
        description: "Email, password, and first name are required",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      // Create user through edge function
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found. Please login again.');

      const { data, error } = await supabase.functions.invoke('create-user-manually', {
        body: {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          companyId: companyId,
          companyRole: formData.role,
          appRole: formData.role === 'admin' ? 'business_admin' : 'user'
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to create user');
      }

      if (!data || !data.success) {
        const errorMsg = data?.error || 'User creation failed';
        throw new Error(errorMsg);
      }

      const roleLabel = formData.role === 'admin' ? 'Business Admin' : 
                       formData.role === 'manager' ? 'Manager' :
                       formData.role === 'supplier' ? 'Supplier' :
                       formData.role === 'sub_contractor' ? 'Sub-Contractor' :
                       formData.role === 'consultant' ? 'Consultant' :
                       formData.role === 'client' ? 'Client' : formData.role;

      toast({
        title: "Success",
        description: `${roleLabel} ${formData.email} created and added to ${companyName} successfully`,
      });

      // Reset form and close dialog
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'admin'
      });
      onOpenChange(false);
      
      // Add a small delay to ensure database operations are completed
      setTimeout(() => {
        onUserCreated();
      }, 500);

    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create New Business Admin for {companyName}
          </DialogTitle>
          <DialogDescription>
            Create a new user account and automatically add them to this business.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="John"
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Doe"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="john.doe@example.com"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter secure password"
                className="pr-20"
                required
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="h-8 w-8 p-0"
                  title={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={generatePassword}
                  className="h-8 w-8 p-0"
                  title="Generate Password"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="role">Role in Company</Label>
            <Select value={formData.role} onValueChange={(value: any) => handleInputChange('role', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Business Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="supplier">Supplier</SelectItem>
                <SelectItem value="sub_contractor">Sub-Contractor</SelectItem>
                <SelectItem value="consultant">Consultant</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};