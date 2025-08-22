import React from 'react';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ContactInfoMaskProps {
  value: string | null;
  type: 'email' | 'phone';
  isMasked?: boolean;
}

export const ContactInfoMask = ({ value, type, isMasked = false }: ContactInfoMaskProps) => {
  if (!value) return <span className="text-muted-foreground">-</span>;

  if (isMasked && (value.includes('***') || value.includes('*'))) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{value}</span>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <EyeOff className="h-3 w-3" />
                <span className="text-xs">Protected</span>
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Contact information is protected. Only company owners and admins can view full details.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span>{value}</span>
      <Eye className="h-3 w-3 text-muted-foreground" />
    </div>
  );
};