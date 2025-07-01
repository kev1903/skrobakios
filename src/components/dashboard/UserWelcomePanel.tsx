
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const UserWelcomePanel = () => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 font-manrope">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="relative">
            <Avatar className="w-20 h-20 mx-auto ring-4 ring-[#E6F0FF]">
              <AvatarImage src="/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png" />
              <AvatarFallback className="bg-[#3366FF] text-white text-lg font-semibold">
                LP
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900">Lora Peterson</h3>
            <p className="text-sm text-gray-600">Project Manager</p>
            <Badge className="bg-[#E6F0FF] text-[#3366FF] border-[#4D8BFF] px-3 py-1 text-xs font-medium">
              $85,000/year
            </Badge>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Welcome back! 👋</p>
            <p className="text-xs text-gray-500">
              You have 5 tasks pending today
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
