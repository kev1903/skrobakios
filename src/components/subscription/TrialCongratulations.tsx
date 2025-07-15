import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Sparkles } from 'lucide-react';

interface TrialCongratulationsProps {
  planName: string;
  trialEndDate: string;
  onClose: () => void;
}

export const TrialCongratulations = ({ 
  planName, 
  trialEndDate, 
  onClose 
}: TrialCongratulationsProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(trialEndDate).getTime();
      const difference = end - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [trialEndDate]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-2xl mb-2">
              Congratulations! 🎉
            </CardTitle>
            <p className="text-muted-foreground">
              You're set for the next 90 days with full access to all {planName} features!
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Trial countdown */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-center space-x-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Trial ends in:</span>
            </div>
            
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-white rounded-lg p-2">
                <div className="text-lg font-bold text-primary">{timeLeft.days}</div>
                <div className="text-xs text-muted-foreground">Days</div>
              </div>
              <div className="bg-white rounded-lg p-2">
                <div className="text-lg font-bold text-primary">{timeLeft.hours}</div>
                <div className="text-xs text-muted-foreground">Hours</div>
              </div>
              <div className="bg-white rounded-lg p-2">
                <div className="text-lg font-bold text-primary">{timeLeft.minutes}</div>
                <div className="text-xs text-muted-foreground">Minutes</div>
              </div>
              <div className="bg-white rounded-lg p-2">
                <div className="text-lg font-bold text-primary">{timeLeft.seconds}</div>
                <div className="text-xs text-muted-foreground">Seconds</div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-sm">Full access to all premium features</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">No credit card required during trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Cancel anytime with no charges</span>
            </div>
          </div>

          {/* Action button */}
          <Button onClick={onClose} className="w-full">
            Start Exploring
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            We'll remind you before your trial expires so you can choose to continue with a paid subscription.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};