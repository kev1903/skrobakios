
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Target, MoreHorizontal, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const SummarySection = () => {
  return (
    <div className="space-y-6">
      {/* Enhanced Summary Card */}
      <Card className="bg-gradient-to-br from-[#3366FF] to-[#1F3D7A] text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Summary
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 h-8 w-8 p-0">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-6">
          {/* Documents Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full ring-2 ring-green-200"></div>
              <span className="text-sm font-medium">Documents</span>
              <Badge className="bg-white/20 text-white text-xs px-2 py-1">
                12 files
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 aspect-square flex items-center justify-center hover:bg-white/25 transition-colors duration-200 cursor-pointer group">
                <FileText className="w-8 h-8 text-white/90 group-hover:scale-110 transition-transform duration-200" />
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 aspect-square flex items-center justify-center hover:bg-white/25 transition-colors duration-200 cursor-pointer group">
                <FileText className="w-8 h-8 text-white/90 group-hover:scale-110 transition-transform duration-200" />
              </div>
            </div>
          </div>
          
          {/* Goal Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-300 rounded-full ring-2 ring-blue-200"></div>
              <span className="text-sm font-medium">Goal</span>
              <Target className="w-4 h-4 text-blue-300" />
            </div>
            
            <div className="space-y-3">
              <p className="text-xs text-blue-100 leading-relaxed">
                Reduce the number of support tickets by 60% within the first 6 months and increase renewals
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-blue-200">Progress</span>
                  <span className="font-semibold">75%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-300 to-blue-400 h-3 rounded-full w-3/4 transition-all duration-500 shadow-lg"></div>
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-100">Monthly target:</span>
                  <span className="font-semibold text-blue-200">85% achieved</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Enhanced Progress Indicator */}
      <div className="flex items-center justify-center gap-3">
        <div className="w-3 h-3 bg-[#3366FF] rounded-full shadow-lg animate-pulse"></div>
        <div className="w-3 h-3 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors cursor-pointer"></div>
        <div className="w-3 h-3 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors cursor-pointer"></div>
      </div>

      {/* Quick Stats Card */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-[#3366FF]">24</div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">Active</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">18</div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">Done</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
