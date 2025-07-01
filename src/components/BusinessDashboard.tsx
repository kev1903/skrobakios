
import React from "react";
import { UserWelcomePanel } from "@/components/dashboard/UserWelcomePanel";
import { TimeTracker } from "@/components/dashboard/TimeTracker";
import { CalendarPreview } from "@/components/dashboard/CalendarPreview";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useTimeTracker } from "@/hooks/useTimeTracker";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BusinessDashboardProps {
  onSelectProject: (projectId: string) => void;
  onNavigate: (page: string) => void;
}

export const BusinessDashboard = ({ onSelectProject, onNavigate }: BusinessDashboardProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const { 
    stats, 
    onboardingTasks, 
    loading, 
    error, 
    toggleTaskCompletion, 
    getOnboardingProgress,
    refreshStats 
  } = useDashboardData();
  const { getTotalWeeklyHours } = useTimeTracker();

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    let greeting;
    
    if (hour >= 1 && hour < 12) {
      greeting = "Good Morning";
    } else if (hour >= 12 && hour < 17) {
      greeting = "Good Afternoon";
    } else {
      greeting = "Good Evening";
    }

    const firstName = profile?.first_name;
    if (firstName) {
      return `${greeting}, ${firstName}!`;
    }
    return user?.email ? `${greeting}, ${user.email.split('@')[0]}!` : `${greeting}!`;
  };

  const handleRefreshStats = async () => {
    await refreshStats();
    toast({
      title: "Data Refreshed",
      description: "Dashboard statistics have been updated.",
    });
  };

  const statsData = [
    { number: stats.totalEmployees.toString(), label: "Employees", icon: "👥" },
    { number: stats.totalHirings.toString(), label: "Hirings", icon: "📊" },
    { number: stats.totalProjects.toString(), label: "Projects", icon: "📁" },
  ];

  const progressData = [
    { 
      label: "Active Projects", 
      value: stats.totalProjects > 0 ? Math.round((stats.activeProjects / stats.totalProjects) * 100) : 0, 
      color: "bg-[#3366FF]" 
    },
    { 
      label: "Completed", 
      value: stats.totalProjects > 0 ? Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0, 
      color: "bg-yellow-400" 
    },
    { 
      label: "Weekly Time", 
      value: Math.min(Math.round((getTotalWeeklyHours() / 40) * 100), 100), 
      color: "bg-green-500" 
    },
  ];

  const onboardingProgress = getOnboardingProgress();
  const completedTasks = onboardingTasks.filter(task => task.completed).length;

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[#F5F3E8] via-[#F8F6ED] to-[#FEFDF8] font-manrope-thin font-extralight overflow-y-auto flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#F5F3E8] via-[#F8F6ED] to-[#FEFDF8] font-manrope-thin font-extralight overflow-y-auto">
      <div className="min-h-screen w-full bg-gradient-to-br from-[#F5F1E3] to-[#FEFCF5] p-4">
        {/* Header with refresh button */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-bold text-gray-900 font-manrope-thin font-extralight">{getTimeBasedGreeting()}</h2>
          <Button
            onClick={handleRefreshStats}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            Error: {error}
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-6xl font-bold text-gray-900 mb-2">{stat.number}</div>
              <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - User Panel & Progress */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <UserWelcomePanel />
            
            {/* Weekly Progress Widget */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Weekly Progress</h3>
                <span className="text-sm text-gray-500">📈</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{getTotalWeeklyHours().toFixed(1)}h</div>
                  <div className="text-sm text-gray-600">Work Time this week</div>
                </div>
                
                <div className="bg-yellow-100 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-yellow-800">Target: 40h</span>
                    <span className="text-sm font-medium text-yellow-800">
                      {Math.round((getTotalWeeklyHours() / 40) * 100)}%
                    </span>
                  </div>
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
                <div className="text-2xl font-bold">{onboardingProgress}%</div>
              </div>
              
              <div className="bg-yellow-400 text-gray-800 px-3 py-1 rounded-full text-sm font-medium mb-6 inline-block">
                Tasks
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Onboarding Tasks</h4>
                  <span className="text-xl font-bold">{completedTasks}/{onboardingTasks.length}</span>
                </div>
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {onboardingTasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleTaskCompletion(task.id)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          task.completed 
                            ? 'bg-yellow-400 text-gray-800 hover:bg-yellow-500' 
                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        }`}
                      >
                        {task.completed ? '✓' : '○'}
                      </button>
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${task.completed ? 'line-through opacity-75' : ''}`}>
                          {task.name}
                        </div>
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
