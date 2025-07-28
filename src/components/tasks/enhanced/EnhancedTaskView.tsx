import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskListView } from '../TaskListView';
import { TeamWorkloadView } from './TeamWorkloadView';
import { useTaskContext } from '../useTaskContext';
import { Users, List, BarChart3, Calendar } from 'lucide-react';

interface EnhancedTaskViewProps {
  projectId: string;
  viewMode?: "grid" | "list";
  selectedTaskIds?: string[];
  onTaskSelectionChange?: (selectedIds: string[]) => void;
  isAddTaskDialogOpen?: boolean;
  onCloseAddTaskDialog?: () => void;
}

export function EnhancedTaskView({ 
  projectId, 
  viewMode = "list", 
  selectedTaskIds = [], 
  onTaskSelectionChange,
  isAddTaskDialogOpen = false,
  onCloseAddTaskDialog
}: EnhancedTaskViewProps) {
  const [activeTab, setActiveTab] = useState('tasks');
  const { tasks } = useTaskContext();

  const projectTasks = tasks.filter(task => task.project_id === projectId);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

        <TabsContent value="tasks" className="space-y-6">
          <TaskListView 
            projectId={projectId} 
            viewMode={viewMode}
            selectedTaskIds={selectedTaskIds}
            onTaskSelectionChange={onTaskSelectionChange}
            isAddTaskDialogOpen={isAddTaskDialogOpen}
            onCloseAddTaskDialog={onCloseAddTaskDialog}
          />
        </TabsContent>

        <TabsContent value="workload" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TeamWorkloadView projectId={projectId} tasks={projectTasks} />
            </div>
            <div className="space-y-6">
              <Card className="backdrop-blur-xl bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center text-lg">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-white">{projectTasks.length}</p>
                      <p className="text-sm text-white/70">Total Tasks</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-green-400">
                        {projectTasks.filter(t => t.status === 'Completed').length}
                      </p>
                      <p className="text-sm text-white/70">Completed</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-blue-400">
                        {projectTasks.filter(t => t.status === 'In Progress').length}
                      </p>
                      <p className="text-sm text-white/70">In Progress</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-red-400">
                        {projectTasks.filter(t => {
                          const dueDate = new Date(t.dueDate);
                          const now = new Date();
                          return dueDate < now && t.status !== 'Completed';
                        }).length}
                      </p>
                      <p className="text-sm text-white/70">Overdue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center text-lg">
                    <Calendar className="w-5 h-5 mr-2" />
                    Upcoming Deadlines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {projectTasks
                      .filter(task => task.status !== 'Completed')
                      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                      .slice(0, 3)
                      .map(task => (
                        <div key={task.id} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{task.taskName}</p>
                            <p className="text-white/70 text-sm">{task.assignedTo.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white/90 text-sm">{task.dueDate}</p>
                            <p className={`text-xs ${
                              new Date(task.dueDate) < new Date() ? 'text-red-400' : 'text-white/70'
                            }`}>
                              {new Date(task.dueDate) < new Date() ? 'Overdue' : 'Upcoming'}
                            </p>
                          </div>
                        </div>
                      ))}
                    {projectTasks.filter(task => task.status !== 'Completed').length === 0 && (
                      <p className="text-white/70 text-center py-4">No upcoming deadlines</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="backdrop-blur-xl bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Task Distribution by Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['High', 'Medium', 'Low'].map(priority => {
                    const count = projectTasks.filter(t => t.priority === priority).length;
                    const percentage = projectTasks.length > 0 ? (count / projectTasks.length) * 100 : 0;
                    return (
                      <div key={priority} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-white/80">{priority} Priority</span>
                          <span className="text-white">{count}</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              priority === 'High' ? 'bg-red-400' :
                              priority === 'Medium' ? 'bg-yellow-400' : 'bg-green-400'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Task Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Completed', 'In Progress', 'Pending', 'Not Started'].map(status => {
                    const count = projectTasks.filter(t => t.status === status).length;
                    const percentage = projectTasks.length > 0 ? (count / projectTasks.length) * 100 : 0;
                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-white/80">{status}</span>
                          <span className="text-white">{count}</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              status === 'Completed' ? 'bg-green-400' :
                              status === 'In Progress' ? 'bg-blue-400' :
                              status === 'Pending' ? 'bg-yellow-400' : 'bg-white/60'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}