import React from 'react';
import { cn } from '@/lib/utils';

const timeSlots = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00'
];

const placeholderBlocks = [
  { day: 0, startHour: 9, duration: 2, title: 'Morning Work Block', category: 'work' },
  { day: 0, startHour: 14, duration: 1, title: 'Team Meeting', category: 'meeting' },
  { day: 1, startHour: 10, duration: 1.5, title: 'Deep Focus', category: 'work' },
  { day: 1, startHour: 16, duration: 1, title: 'Personal Time', category: 'personal' },
  { day: 2, startHour: 8, duration: 2, title: 'Project Planning', category: 'work' },
  { day: 2, startHour: 13, duration: 0.5, title: 'Lunch Break', category: 'break' },
  { day: 3, startHour: 11, duration: 1, title: 'Client Call', category: 'meeting' },
  { day: 4, startHour: 9, duration: 3, title: 'Development Sprint', category: 'work' },
  { day: 4, startHour: 15, duration: 1, title: 'Exercise', category: 'personal' },
];

const categoryStyles = {
  work: 'bg-blue-100 border-blue-300 text-blue-800',
  personal: 'bg-green-100 border-green-300 text-green-800',
  meeting: 'bg-purple-100 border-purple-300 text-purple-800',
  break: 'bg-amber-100 border-amber-300 text-amber-800'
};

export const TimeBlockPreview = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700">Time Block Preview</h3>
        <p className="text-xs text-gray-500 mt-1">Example of how time blocks appear on your calendar</p>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-8 divide-x divide-gray-200">
        {/* Time column */}
        <div className="col-span-1 bg-gray-50">
          <div className="h-12 border-b border-gray-200 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-500">Time</span>
          </div>
          {timeSlots.map((time) => (
            <div key={time} className="h-12 border-b border-gray-200 flex items-center justify-center">
              <span className="text-xs text-gray-600">{time}</span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dayIndex) => (
          <div key={day} className="col-span-1 relative">
            {/* Day header */}
            <div className="h-12 border-b border-gray-200 flex items-center justify-center bg-gray-50">
              <span className="text-xs font-medium text-gray-700">{day}</span>
            </div>

            {/* Time slots */}
            <div className="relative">
              {timeSlots.map((time, index) => (
                <div key={time} className="h-12 border-b border-gray-200" />
              ))}

              {/* Time blocks for this day */}
              {placeholderBlocks
                .filter(block => block.day === dayIndex)
                .map((block, blockIndex) => (
                  <div
                    key={blockIndex}
                    className={cn(
                      'absolute left-1 right-1 rounded border-l-2 px-2 py-1',
                      categoryStyles[block.category as keyof typeof categoryStyles]
                    )}
                    style={{
                      top: `${(block.startHour - 6) * 48}px`,
                      height: `${block.duration * 48}px`,
                      minHeight: '24px'
                    }}
                  >
                    <div className="text-xs font-medium truncate">
                      {block.title}
                    </div>
                    {block.duration >= 1 && (
                      <div className="text-xs opacity-75 truncate">
                        {block.duration}h
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};