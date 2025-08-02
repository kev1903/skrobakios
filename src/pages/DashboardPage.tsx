import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, Calendar, TrendingUp, Target, Users, Timer, BarChart3, PieChart, Activity, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { taskService } from '@/components/tasks/taskService';
import { Task } from '@/components/tasks/types';
import { useUser } from '@/contexts/UserContext';
import { useTimerBarSpacing } from '@/hooks/useTimerBarSpacing';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';

const DashboardPage = () => {
  const { userProfile } = useUser();
  const { spacingClasses, minHeightClasses } = useTimerBarSpacing();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    averageCompletionTime: 0,
    productivityScore: 0,
    timeSpentToday: 0,
    weeklyProgress: [],
    taskDistribution: [],
    priorityBreakdown: [],
    projectProgress: []
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        // Fetch user's tasks for analytics
        const userTasks = await taskService.loadTasksAssignedToUser();
        setTasks(userTasks);
        
        // Calculate analytics
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const totalTasks = userTasks.length;
        const completedTasks = userTasks.filter(t => t.status === 'Completed').length;
        const inProgressTasks = userTasks.filter(t => t.status === 'In Progress').length;
        const overdueTasks = userTasks.filter(t => {
          if (!t.dueDate) return false;
          return new Date(t.dueDate) < now && t.status !== 'Completed';
        }).length;
        
        // Weekly progress data
        const weeklyProgress = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dayTasks = userTasks.filter(t => {
            if (!t.dueDate) return false;
            const taskDate = new Date(t.dueDate);
            return taskDate.toDateString() === date.toDateString();
          });
          
          weeklyProgress.push({
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            completed: dayTasks.filter(t => t.status === 'Completed').length,
            total: dayTasks.length,
            efficiency: dayTasks.length > 0 ? Math.round((dayTasks.filter(t => t.status === 'Completed').length / dayTasks.length) * 100) : 0
          });
        }
        
        // Task distribution by status
        const taskDistribution = [
          { name: 'Completed', value: completedTasks, color: '#22c55e' },
          { name: 'In Progress', value: inProgressTasks, color: '#3b82f6' },
          { name: 'Pending', value: userTasks.filter(t => t.status === 'Pending').length, color: '#f59e0b' },
          { name: 'Not Started', value: userTasks.filter(t => t.status === 'Not Started').length, color: '#e5e7eb' }
        ];
        
        // Priority breakdown
        const priorityBreakdown = [
          { name: 'High', value: userTasks.filter(t => t.priority === 'High').length, color: '#ef4444' },
          { name: 'Medium', value: userTasks.filter(t => t.priority === 'Medium').length, color: '#f59e0b' },
          { name: 'Low', value: userTasks.filter(t => t.priority === 'Low').length, color: '#22c55e' }
        ];
        
        // Calculate productivity score
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        const onTimeRate = totalTasks > 0 ? ((totalTasks - overdueTasks) / totalTasks) * 100 : 0;
        const productivityScore = Math.round((completionRate + onTimeRate) / 2);
        
        // Simulate time spent today (in hours)
        const timeSpentToday = Math.round(Math.random() * 8 + 2); // 2-10 hours
        
        setAnalytics({
          totalTasks,
          completedTasks,
          inProgressTasks,
          overdueTasks,
          averageCompletionTime: Math.round(Math.random() * 24 + 6), // 6-30 hours average
          productivityScore,
          timeSpentToday,
          weeklyProgress,
          taskDistribution: taskDistribution.filter(item => item.value > 0),
          priorityBreakdown: priorityBreakdown.filter(item => item.value > 0),
          projectProgress: [] // Can be expanded later
        });
        
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [userProfile]);

  if (loading) {
    return (
      <div className={cn("bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center", minHeightClasses, spacingClasses)}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100", minHeightClasses, spacingClasses)}>
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-gray-200/50 p-6 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/tasks" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium text-sm">Back to Tasks</span>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">Your productivity insights and task management analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {analytics.productivityScore}% Productive
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/60 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalTasks}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.completedTasks} completed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{analytics.inProgressTasks}</div>
              <p className="text-xs text-muted-foreground">
                Active tasks
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{analytics.overdueTasks}</div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Today</CardTitle>
              <Timer className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{analytics.timeSpentToday}h</div>
              <p className="text-xs text-muted-foreground">
                Hours worked
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="productivity" className="space-y-6">
          <TabsList className="bg-white/60 backdrop-blur-sm">
            <TabsTrigger value="productivity">Productivity</TabsTrigger>
            <TabsTrigger value="tasks">Task Analysis</TabsTrigger>
            <TabsTrigger value="time">Time Management</TabsTrigger>
          </TabsList>

          <TabsContent value="productivity" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Progress Chart */}
              <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle>Weekly Progress</CardTitle>
                  <CardDescription>Task completion over the last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics.weeklyProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="completed" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Productivity Score */}
              <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle>Productivity Score</CardTitle>
                  <CardDescription>Based on completion rate and timeliness</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">{analytics.productivityScore}%</div>
                    <Progress value={analytics.productivityScore} className="w-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold">{Math.round((analytics.completedTasks / analytics.totalTasks) * 100)}%</div>
                      <div className="text-muted-foreground">Completion Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{analytics.averageCompletionTime}h</div>
                      <div className="text-muted-foreground">Avg. Completion</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Task Distribution */}
              <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle>Task Distribution</CardTitle>
                  <CardDescription>Tasks by status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        dataKey="value"
                        data={analytics.taskDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {analytics.taskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Priority Breakdown */}
              <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle>Priority Distribution</CardTitle>
                  <CardDescription>Tasks by priority level</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.priorityBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8">
                        {analytics.priorityBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Tasks */}
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle>Recent Tasks</CardTitle>
                <CardDescription>Your latest task activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-white/40 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          task.status === 'Completed' ? 'bg-green-500' :
                          task.status === 'In Progress' ? 'bg-blue-500' :
                          task.status === 'Pending' ? 'bg-yellow-500' : 'bg-gray-300'
                        }`} />
                        <div>
                          <p className="font-medium">{task.taskName}</p>
                          <p className="text-sm text-muted-foreground">{task.projectName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={
                          task.priority === 'High' ? 'border-red-200 text-red-700' :
                          task.priority === 'Medium' ? 'border-yellow-200 text-yellow-700' :
                          'border-green-200 text-green-700'
                        }>
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="time" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Time Tracking */}
              <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle>Time Distribution</CardTitle>
                  <CardDescription>How you spend your time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Focused Work</span>
                      <span className="text-sm text-muted-foreground">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Meetings</span>
                      <span className="text-sm text-muted-foreground">20%</span>
                    </div>
                    <Progress value={20} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Planning</span>
                      <span className="text-sm text-muted-foreground">15%</span>
                    </div>
                    <Progress value={15} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Time Trend */}
              <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle>Weekly Time Trend</CardTitle>
                  <CardDescription>Daily hours worked this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={analytics.weeklyProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="efficiency" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        dot={{ fill: '#8b5cf6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Items */}
        <Card className="bg-white/60 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle>Recommended Actions</CardTitle>
            <CardDescription>Improve your productivity with these suggestions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analytics.overdueTasks > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 mb-2" />
                  <h4 className="font-medium text-red-900">Address Overdue Tasks</h4>
                  <p className="text-sm text-red-700">You have {analytics.overdueTasks} overdue tasks that need immediate attention.</p>
                </div>
              )}
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Target className="w-5 h-5 text-blue-600 mb-2" />
                <h4 className="font-medium text-blue-900">Set Daily Goals</h4>
                <p className="text-sm text-blue-700">Establish clear daily objectives to improve focus and productivity.</p>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600 mb-2" />
                <h4 className="font-medium text-green-900">Track Progress</h4>
                <p className="text-sm text-green-700">Regular progress reviews help maintain momentum and identify improvements.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;