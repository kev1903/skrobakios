
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Goal, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const SummarySection = () => {
  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className="bg-gray-900 text-white border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Summary</CardTitle>
            <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm">Documents</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-3 aspect-square flex items-center justify-center">
              <FileText className="w-8 h-8 text-white/80" />
            </div>
            <div className="bg-white/10 rounded-lg p-3 aspect-square flex items-center justify-center">
              <FileText className="w-8 h-8 text-white/80" />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-sm">Goal</span>
          </div>
          
          <div className="space-y-2">
            <p className="text-xs text-gray-300">
              Reduce the number of support tickets by 60% within the first 6 months and renewals
            </p>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="bg-blue-400 h-2 rounded-full w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Progress Indicator */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  );
};
