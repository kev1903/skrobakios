
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square } from 'lucide-react';

export const TimeTracker = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentTime, setCurrentTime] = useState("02:45:30");
  
  const weeklyProgress = [
    { day: 'Mon', hours: 8, target: 8 },
    { day: 'Tue', hours: 7.5, target: 8 },
    { day: 'Wed', hours: 8.5, target: 8 },
    { day: 'Thu', hours: 6, target: 8 }, // Current day
    { day: 'Fri', hours: 0, target: 8 },
  ];

  const totalHours = 30;
  const weeklyGoal = 40;
  const progressPercentage = (totalHours / weeklyGoal) * 100;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">Time Tracker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Circular Progress */}
        <div className="relative flex items-center justify-center">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="#E6F0FF"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="#3366FF"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${progressPercentage * 3.39} 339`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{currentTime}</div>
              <div className="text-xs text-gray-500">Today</div>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center space-x-3">
          <Button
            onClick={() => setIsTracking(!isTracking)}
            className={`w-12 h-12 rounded-full shadow-lg transition-all duration-200 ${
              isTracking 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-[#3366FF] hover:bg-[#1F3D7A]'
            }`}
          >
            {isTracking ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          <Button
            variant="outline"
            className="w-12 h-12 rounded-full shadow-lg border-2 border-gray-200 hover:border-gray-300"
          >
            <Square className="w-4 h-4" />
          </Button>
        </div>

        {/* Weekly Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Weekly Progress</span>
            <span className="text-sm text-gray-500">{totalHours}h / {weeklyGoal}h</span>
          </div>
          
          <div className="flex justify-between items-end space-x-2 h-16">
            {weeklyProgress.map((day, index) => (
              <div key={day.day} className="flex flex-col items-center space-y-1 flex-1">
                <div 
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    index === 3 ? 'bg-[#3366FF]' : 'bg-[#E6F0FF]'
                  }`}
                  style={{ 
                    height: `${Math.max((day.hours / day.target) * 100, 10)}%`,
                    minHeight: '8px'
                  }}
                ></div>
                <span className={`text-xs font-medium ${
                  index === 3 ? 'text-[#3366FF]' : 'text-gray-500'
                }`}>
                  {day.day}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-[#E6F0FF] rounded-lg p-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700">This week goal:</span>
              <span className="font-semibold text-[#3366FF]">{Math.round(progressPercentage)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
