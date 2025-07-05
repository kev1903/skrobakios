import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Globe } from 'lucide-react';

export const InfoPanel = () => {
  return (
    <Card className="absolute bottom-6 left-6 z-40 bg-black/10 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50">
      <CardContent className="p-5">
        <div className="text-white space-y-3">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
              <Globe className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-lg font-semibold">3D Earth Environment</div>
          </div>
          <div className="text-sm text-slate-200 space-y-2 leading-relaxed">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <span>Click and drag to rotate</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span>Scroll to zoom in/out</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-purple-400"></div>
              <span>Globe auto-rotates when idle</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-orange-400"></div>
              <span>Click project markers for details</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};