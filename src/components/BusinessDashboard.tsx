
import { useState } from "react";
import { UserWelcomePanel } from "@/components/dashboard/UserWelcomePanel";
import { TimeTracker } from "@/components/dashboard/TimeTracker";
import { CalendarPreview } from "@/components/dashboard/CalendarPreview";

interface BusinessDashboardProps {
  onSelectProject: (projectId: string) => void;
  onNavigate: (page: string) => void;
}

export const BusinessDashboard = ({ onSelectProject, onNavigate }: BusinessDashboardProps) => {
  const statsData = [
    { number: "78", label: "Employee", icon: "👥" },
    { number: "56", label: "Hirings", icon: "📊" },
    { number: "203", label: "Projects", icon: "📁" },
  ];

  const progressData = [
    { label: "Interviews", value: 15, color: "bg-slate-800" },
    { label: "Hired", value: 15, color: "bg-yellow-400" },
    { label: "Project time", value: 60, color: "bg-gray-300", striped: true },
  ];

  const onboardingTasks = [
    { name: "Interview", date: "Sep 15, 08:30", completed: true },
    { name: "Team Meeting", date: "Sep 15, 10:30", completed: true },
    { name: "Project Update", date: "Sep 15, 15:00", completed: false },
    { name: "Discuss Q3 Goals", date: "Sep 15, 16:45", completed: false },
    { name: "HR Policy Review", date: "Sep 15, 16:30", completed: false },
  ];

  return (
    <div className="h-full w-full bg-gradient-to-br from-[#F5F3E8] via-[#F8F6ED] to-[#FEFDF8] font-manrope">
      {/* Main Container taking full screen width */}
      <div className="h-full w-full bg-gradient-to-br from-[#F5F1E3] to-[#FEFCF5] p-4">
          
          {/* Welcome Section */}
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Welcome in, Nixtio</h2>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {statsData.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-6xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Progress Bars */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              {progressData.map((item, index) => (
                <div key={index} className="flex flex-col items-center space-y-2">
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <div className="w-16 h-16 bg-gray-200 rounded-lg relative overflow-hidden">
                    <div 
                      className={`${item.color} rounded-lg transition-all duration-500 ${
                        item.striped ? 'bg-gradient-to-r from-gray-300 to-gray-200' : ''
                      }`}
                      style={{ 
                        height: `${item.value}%`,
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-600">{item.value}%</span>
                </div>
              ))}
              
              {/* Output Section */}
              <div className="flex flex-col items-center space-y-2">
                <span className="text-sm font-medium text-gray-700">Output</span>
                <div className="bg-gray-200 px-4 py-2 rounded-full">
                  <span className="text-sm font-medium text-gray-700">10%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - User Panel & Progress */}
            <div className="col-span-12 lg:col-span-3 space-y-6">
              <UserWelcomePanel />
              
              {/* Progress Widget */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
                  <span className="text-sm text-gray-500">📈</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">6.1h</div>
                    <div className="text-sm text-gray-600">Work Time this week</div>
                  </div>
                  
                  {/* Weekly Progress Chart */}
                  <div className="flex items-end space-x-2 h-16">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                      <div key={day} className="flex flex-col items-center space-y-1 flex-1">
                        <div 
                          className={`w-full rounded-t-lg ${
                            index === 4 ? 'bg-yellow-400' : 'bg-gray-300'
                          }`}
                          style={{ 
                            height: `${Math.random() * 60 + 20}%`
                          }}
                        />
                        <span className="text-xs text-gray-500">{day}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-yellow-100 rounded-lg p-2 mt-2">
                    <span className="text-xs font-medium text-yellow-800">5h 25m</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column - Time Tracker & Calendar */}
            <div className="col-span-12 lg:col-span-6 space-y-6">
              <TimeTracker />
              <CalendarPreview />
            </div>

            {/* Right Column - Onboarding Tasks */}
            <div className="col-span-12 lg:col-span-3">
              <div className="bg-gray-800 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Onboarding</h3>
                  <div className="text-2xl font-bold">18%</div>
                </div>
                
                <div className="flex items-center space-x-2 mb-6">
                  <span className="text-sm text-gray-300">30%</span>
                  <span className="text-sm text-gray-300">25%</span>
                  <span className="text-sm text-gray-300">0%</span>
                </div>
                
                <div className="bg-yellow-400 text-gray-800 px-3 py-1 rounded-full text-sm font-medium mb-6 inline-block">
                  Task
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Onboarding Task</h4>
                    <span className="text-xl font-bold">2/8</span>
                  </div>
                  
                  <div className="space-y-3">
                    {onboardingTasks.map((task, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          task.completed 
                            ? 'bg-yellow-400 text-gray-800' 
                            : 'bg-gray-600 text-gray-300'
                        }`}>
                          {task.completed ? '✓' : '○'}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{task.name}</div>
                          <div className="text-xs text-gray-400">{task.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};
