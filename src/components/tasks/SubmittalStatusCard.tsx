import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

export type SubmittalStatus = 'Pending' | 'In Review' | 'Approved' | 'Rejected' | 'Revision Required';

interface SubmittalStatusCardProps {
  title: string;
  status: SubmittalStatus;
  submittedBy: string;
  submittedDate: Date;
  reviewedBy?: string;
  fileCount: number;
  onClick?: () => void;
}

export const SubmittalStatusCard = ({
  title,
  status,
  submittedBy,
  submittedDate,
  reviewedBy,
  fileCount,
  onClick,
}: SubmittalStatusCardProps) => {
  const getStatusColor = (status: SubmittalStatus) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-500/10 text-green-700 border-green-500/30';
      case 'In Review':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/30';
      case 'Rejected':
        return 'bg-red-500/10 text-red-700 border-red-500/30';
      case 'Revision Required':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-500/30';
    }
  };

  return (
    <Card
      className="p-4 hover:shadow-md transition-all cursor-pointer border-l-4 border-l-primary/30"
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2 flex-1">
            <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">{title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={`text-xs ${getStatusColor(status)}`}>
                  {status}
                </Badge>
                <span className="text-xs text-muted-foreground">{fileCount} files</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{submittedBy}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{format(submittedDate, 'MMM dd, yyyy')}</span>
          </div>
        </div>

        {reviewedBy && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Reviewed by: <span className="font-medium">{reviewedBy}</span>
          </div>
        )}
      </div>
    </Card>
  );
};
