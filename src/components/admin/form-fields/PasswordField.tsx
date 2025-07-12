import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Eye, EyeOff, Copy } from 'lucide-react';
import { generateRandomPassword } from '@/utils/passwordGenerator';
import { useToast } from '@/hooks/use-toast';

interface PasswordFieldProps {
  password: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

export const PasswordField = ({ password, disabled, onChange }: PasswordFieldProps) => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword(16);
    onChange(newPassword);
    toast({
      title: "Password Generated",
      description: "A secure random password has been generated",
    });
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(password);
      toast({
        title: "Password Copied",
        description: "Password has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy password to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label htmlFor="password">Password *</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGeneratePassword}
          disabled={disabled}
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Generate
        </Button>
      </div>
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter or generate password"
          disabled={disabled}
          className="pr-20"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
            className="h-6 w-6 p-0"
          >
            {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </Button>
          {password && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopyPassword}
              disabled={disabled}
              className="h-6 w-6 p-0"
            >
              <Copy className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};