import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle } from 'lucide-react';

interface TrialCountdownProps {
  trialEndDate: string;
  planName: string;
}

export const TrialCountdown = ({ trialEndDate, planName }: TrialCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [isExpired, setIsExpired] = useState(false);

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
        setIsExpired(false);
      } else {
        setIsExpired(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [trialEndDate]);

  if (isExpired) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-semibold text-amber-800">Trial Expired</h3>
              <p className="text-sm text-amber-700">
                Your {planName} trial has ended. Subscribe to continue accessing premium features.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isLowTime = timeLeft.days < 7;

  return (
    <Card className={`${isLowTime ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className={`w-5 h-5 ${isLowTime ? 'text-orange-600' : 'text-blue-600'}`} />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className={`font-semibold ${isLowTime ? 'text-orange-800' : 'text-blue-800'}`}>
                  {planName} Trial
                </h3>
                <Badge variant={isLowTime ? "destructive" : "secondary"}>
                  {isLowTime ? 'Ending Soon' : 'Active'}
                </Badge>
              </div>
              <p className={`text-sm ${isLowTime ? 'text-orange-700' : 'text-blue-700'}`}>
                Trial ends in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-1 text-center">
            <div className="text-center">
              <div className={`text-lg font-bold ${isLowTime ? 'text-orange-800' : 'text-blue-800'}`}>
                {timeLeft.days}
              </div>
              <div className={`text-xs ${isLowTime ? 'text-orange-600' : 'text-blue-600'}`}>
                days
              </div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${isLowTime ? 'text-orange-800' : 'text-blue-800'}`}>
                {timeLeft.hours}
              </div>
              <div className={`text-xs ${isLowTime ? 'text-orange-600' : 'text-blue-600'}`}>
                hrs
              </div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${isLowTime ? 'text-orange-800' : 'text-blue-800'}`}>
                {timeLeft.minutes}
              </div>
              <div className={`text-xs ${isLowTime ? 'text-orange-600' : 'text-blue-600'}`}>
                min
              </div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${isLowTime ? 'text-orange-800' : 'text-blue-800'}`}>
                {timeLeft.seconds}
              </div>
              <div className={`text-xs ${isLowTime ? 'text-orange-600' : 'text-blue-600'}`}>
                sec
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};