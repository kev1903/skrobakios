import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp } from 'lucide-react';

interface CostSummaryDashboardProps {
  onNavigate?: (page: string) => void;
}

export const CostSummaryDashboard = ({ onNavigate }: CostSummaryDashboardProps) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white font-playfair">Cost Summary Dashboard</h2>
        <p className="text-white/70 font-helvetica">Visual summary of project costs and performance</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-helvetica">Total Contract Value</p>
                <p className="text-2xl font-bold text-white">$450,000</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-helvetica">Total Paid</p>
                <p className="text-2xl font-bold text-white">$275,000</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-helvetica">Remaining</p>
                <p className="text-2xl font-bold text-white">$175,000</p>
              </div>
              <span className="text-purple-400 text-2xl">📊</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white font-playfair">Cost Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">Interactive charts and analytics coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};