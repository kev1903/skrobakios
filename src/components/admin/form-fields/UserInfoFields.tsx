import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UserInfoFieldsProps {
  firstName: string;
  lastName: string;
  email: string;
  disabled: boolean;
  onChange: (field: string, value: string) => void;
}

export const UserInfoFields = ({ 
  firstName, 
  lastName, 
  email, 
  disabled, 
  onChange 
}: UserInfoFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            placeholder="John"
            disabled={disabled}
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
            placeholder="Doe"
            disabled={disabled}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => onChange('email', e.target.value)}
          placeholder="john.doe@example.com"
          disabled={disabled}
        />
      </div>
    </>
  );
};