import React from 'react';
import { TrendingUp, Target, Award, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ProductivityTab = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-luxury-gold" />
        <h2 className="text-2xl font-bold text-foreground">Productivity Analysis</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="backdrop-blur-xl bg-white/80 border-border/30 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="w-5 h-5 text-luxury-gold" />
              Goals & Targets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Track your productivity goals</p>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 border-border/30 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="w-5 h-5 text-luxury-gold" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Your productivity milestones</p>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 border-border/30 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-5 h-5 text-luxury-gold" />
              Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Detailed productivity insights</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="backdrop-blur-xl bg-white/80 border-border/30 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <CardContent className="p-12">
          <div className="text-center space-y-4">
            <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground/30" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Productivity Features Coming Soon
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Advanced analytics, productivity scores, focus time analysis, and personalized recommendations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
