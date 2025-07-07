import React from 'react';
import { ModernGanttTask, TimelineHeader } from './types';
import { DependencyArrows } from './DependencyArrows';

interface TimelinePanelProps {
  tasks: ModernGanttTask[];
  timelineHeader: TimelineHeader;
  scrollPosition: number;
  onScroll: (position: number) => void;
}

export const TimelinePanel = ({
  tasks,
  timelineHeader,
  scrollPosition,
  onScroll
}: TimelinePanelProps) => {
  const { months, days } = timelineHeader;
  
  // Calculate total width needed for timeline (each day gets a minimum width)
  const dayWidth = 40; // pixels per day
  const totalWidth = days.length * dayWidth;
  const containerWidth = 800; // approximate visible width
  
  return (
    <div className="flex-1 bg-white relative">
      {/* Timeline Header */}
      <div className="h-12 bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
        <div 
          className="flex h-full overflow-hidden"
          style={{ 
            width: `${totalWidth}px`,
            transform: `translateX(-${scrollPosition}px)`
          }}
        >
          {/* Month and Day Headers */}
          {months.map((month, monthIndex) => {
            // Calculate how many days belong to this month
            const monthStartDay = monthIndex === 0 ? 0 : months.slice(0, monthIndex).reduce((acc, _, i) => {
              const monthDate = new Date(timelineHeader.startDate);
              monthDate.setMonth(monthDate.getMonth() + i);
              return acc + new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
            }, 0);
            
            const currentMonthDate = new Date(timelineHeader.startDate);
            currentMonthDate.setMonth(currentMonthDate.getMonth() + monthIndex);
            const daysInCurrentMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0).getDate();
            
            return (
              <div 
                key={month} 
                className="flex flex-col border-r border-slate-200 last:border-r-0"
                style={{ width: `${daysInCurrentMonth * dayWidth}px` }}
              >
                {/* Month Header */}
                <div className="h-6 flex items-center justify-center text-sm font-medium text-slate-900 border-b border-slate-200 bg-slate-50">
                  {month}
                </div>
                
                {/* Days Header */}
                <div className="h-6 flex">
                  {Array.from({ length: daysInCurrentMonth }, (_, dayIndex) => {
                    const dayNumber = dayIndex + 1;
                    const dayDate = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), dayNumber);
                    const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;
                    
                    return (
                      <div 
                        key={dayNumber}
                        className={`flex items-center justify-center text-xs border-r border-slate-100 last:border-r-0 ${
                          isWeekend ? 'bg-slate-100 text-slate-400' : 'text-slate-500'
                        }`}
                        style={{ width: `${dayWidth}px` }}
                      >
                        {dayNumber}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scrollable Timeline Content */}
      <div 
        className="flex-1 overflow-x-auto overflow-y-hidden"
        onScroll={(e) => onScroll(e.currentTarget.scrollLeft)}
      >
        <div style={{ width: `${totalWidth}px` }}>
          {/* Timeline Grid and Bars */}
          <div className="relative">
            {/* Dependency Arrows */}
            <DependencyArrows
              tasks={tasks}
              dayWidth={dayWidth}
              taskHeight={48} // 12 * 4 = 48px (h-12 class)
              timelineStartDate={timelineHeader.startDate}
            />
            
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className="h-12 border-b border-slate-100 relative group hover:bg-slate-50"
              >
              {/* Grid Lines with Weekend Highlighting */}
              <div className="absolute inset-0 flex">
                {Array.from({ length: Math.ceil(totalWidth / dayWidth) }).map((_, dayIndex) => {
                  const currentDate = new Date(timelineHeader.startDate);
                  currentDate.setDate(currentDate.getDate() + dayIndex);
                  const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
                  
                  return (
                    <div 
                      key={`grid-${dayIndex}`} 
                      className={`border-r border-slate-100 last:border-r-0 ${
                        isWeekend ? 'bg-slate-50' : ''
                      }`}
                      style={{ width: `${dayWidth}px` }}
                    ></div>
                  );
                })}
              </div>

                {/* Task Bar */}
                {task.barStyle && (
                  <div className="absolute inset-0 flex items-center px-1">
                    <div
                      className="h-6 rounded-lg flex items-center px-2 shadow-sm group-hover:shadow-md transition-shadow relative overflow-hidden"
                      style={{
                        left: task.barStyle.left,
                        width: task.barStyle.width,
                        backgroundColor: task.barStyle.backgroundColor,
                      }}
                    >
                      {/* Progress Fill */}
                      <div
                        className="absolute inset-0 bg-white/20 rounded-lg"
                        style={{ width: `${task.status}%` }}
                      ></div>
                      
                      <span className="text-xs text-white font-medium relative z-10 truncate">
                        {task.title}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Milestone for tasks without bars */}
                {!task.barStyle && task.status > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Horizontal Scroll Indicator */}
      {totalWidth > containerWidth && (
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-slate-100 border-t border-slate-200">
          <div 
            className="h-full bg-slate-400 rounded"
            style={{
              width: `${(containerWidth / totalWidth) * 100}%`,
              marginLeft: `${(scrollPosition / totalWidth) * 100}%`
            }}
          ></div>
        </div>
      )}
    </div>
  );
};