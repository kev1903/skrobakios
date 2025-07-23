import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CompanyOption {
  id: string;
  name: string;
}

interface RoleSelectionFieldsProps {
  platformRole: string;
  companyId: string;
  companyRole: string;
  companies: CompanyOption[];
  disabled: boolean;
  onChange: (field: string, value: string) => void;
}

export const RoleSelectionFields = ({ 
  platformRole, 
  companyId, 
  companyRole, 
  companies, 
  disabled, 
  onChange 
}: RoleSelectionFieldsProps) => {
  return (
    <>
      <div>
        <Label htmlFor="platformRole">Platform Role</Label>
        <Select 
          value={platformRole} 
          onValueChange={(value) => onChange('platformRole', value)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="client">Client</SelectItem>
            <SelectItem value="project_admin">Project Admin</SelectItem>
            <SelectItem value="business_admin">Business Admin</SelectItem>
            <SelectItem value="superadmin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="company">Assign to Company (Optional)</Label>
        <Select 
          value={companyId} 
          onValueChange={(value) => onChange('companyId', value)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a company" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No company assignment</SelectItem>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {companyId && companyId !== 'none' && (
        <div>
          <Label htmlFor="companyRole">Company Role</Label>
          <Select 
            value={companyRole} 
            onValueChange={(value) => onChange('companyRole', value)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
};