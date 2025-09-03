import React from 'react';
import { Eye, EyeOff, Shield, Mail, Phone, Smartphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { isContactDataMasked } from '@/hooks/useSecureStakeholderContacts';

interface SecureContactDisplayProps {
  contact: {
    id: string;
    name: string;
    title?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    is_primary: boolean;
    is_preferred: boolean;
  };
  canViewSensitiveData: boolean;
  onRequestSensitiveAccess?: () => void;
}

export const SecureContactDisplay = ({ 
  contact, 
  canViewSensitiveData,
  onRequestSensitiveAccess 
}: SecureContactDisplayProps) => {
  const hasEmail = !!contact.email;
  const hasPhone = !!contact.phone;
  const hasMobile = !!contact.mobile;
  const hasSensitiveData = hasEmail || hasPhone || hasMobile;

  const isEmailMasked = isContactDataMasked(contact.email);
  const isPhoneMasked = isContactDataMasked(contact.phone);
  const isMobileMasked = isContactDataMasked(contact.mobile);
  const hasAnyMaskedData = isEmailMasked || isPhoneMasked || isMobileMasked;

  const ContactValue = ({ 
    value, 
    icon: Icon, 
    type 
  }: { 
    value: string | null; 
    icon: React.ElementType; 
    type: string; 
  }) => {
    if (!value) {
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4" />
          <span className="text-sm">No {type}</span>
        </div>
      );
    }

    const isMasked = isContactDataMasked(value);

    return (
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{value}</span>
        {isMasked ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                  <Shield className="h-3 w-3" />
                  <EyeOff className="h-3 w-3" />
                  <span>Protected</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Contact information is protected. Only administrators can view full details.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Eye className="h-3 w-3 text-muted-foreground" />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-card">
      {/* Contact Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{contact.name}</h4>
          {contact.is_primary && (
            <Badge variant="default" className="text-xs">Primary</Badge>
          )}
          {contact.is_preferred && (
            <Badge variant="secondary" className="text-xs">Preferred</Badge>
          )}
        </div>

        {/* Security Status Indicator */}
        {hasAnyMaskedData && !canViewSensitiveData && onRequestSensitiveAccess && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRequestSensitiveAccess}
                  className="flex items-center gap-1"
                >
                  <Shield className="h-3 w-3" />
                  <span className="text-xs">Request Access</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to request access to full contact details</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Contact Title */}
      {contact.title && (
        <p className="text-sm text-muted-foreground">{contact.title}</p>
      )}

      {/* Contact Information */}
      <div className="space-y-2">
        <ContactValue value={contact.email} icon={Mail} type="email" />
        <ContactValue value={contact.phone} icon={Phone} type="phone" />
        <ContactValue value={contact.mobile} icon={Smartphone} type="mobile" />
      </div>

      {/* Security Notice */}
      {hasAnyMaskedData && (
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
          <Shield className="h-3 w-3" />
          <span>
            Contact information is protected by security policies. 
            {canViewSensitiveData ? ' You have administrative access.' : ' Contact your administrator for full access.'}
          </span>
        </div>
      )}

      {/* No Sensitive Data Notice */}
      {!hasSensitiveData && (
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
          <Eye className="h-3 w-3" />
          <span>No contact information available for this person.</span>
        </div>
      )}
    </div>
  );
};