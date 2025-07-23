import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Flag, FileText, Clock, Building, Check, ChevronsUpDown, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { taskService } from '@/components/tasks/taskService';
import { useToast } from '@/hooks/use-toast';
import { useProjects } from '@/hooks/useProjects';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const NewTaskPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getProjects } = useProjects();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [projectComboboxOpen, setProjectComboboxOpen] = useState(false);
  const [userComboboxOpen, setUserComboboxOpen] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    taskName: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
    assignedTo: '',
    assignedToUserId: '',
    projectId: ''
  });

  // Load projects and users on component mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectsData = await getProjects();
        setProjects(projectsData);
      } catch (error) {
        console.error('Error loading projects:', error);
        toast({
          title: "Error loading projects",
          description: "Could not load projects. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingProjects(false);
      }
    };

    const loadUsers = async () => {
      try {
        const { data: usersData, error } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, email, avatar_url')
          .eq('status', 'active')
          .order('first_name');
        
        if (error) throw error;
        setUsers(usersData || []);
      } catch (error) {
        console.error('Error loading users:', error);
        toast({
          title: "Error loading users",
          description: "Could not load users. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingUsers(false);
      }
    };

    loadProjects();
    loadUsers();
  }, [getProjects, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.taskName.trim()) {
      toast({
        title: "Task name required",
        description: "Please enter a task name.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Find selected user data
      const selectedUser = users.find(user => user.user_id === formData.assignedToUserId);
      
      await taskService.addTask({
        project_id: formData.projectId === 'no-project' || !formData.projectId ? null : formData.projectId,
        taskName: formData.taskName,
        taskType: 'Task',
        priority: formData.priority as 'High' | 'Medium' | 'Low',
        assignedTo: {
          name: selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}`.trim() : formData.assignedTo || 'Unassigned',
          avatar: selectedUser?.avatar_url || ''
        },
        dueDate: formData.dueDate,
        status: formData.status as 'Completed' | 'In Progress' | 'Pending' | 'Not Started',
        progress: 0,
        description: formData.description,
        duration: 0,
        is_milestone: false,
        is_critical_path: false
      });

      toast({
        title: "Task created successfully",
        description: "Your new task has been added to the backlog.",
      });
      
      // Always navigate to My Task Page regardless of project assignment
      navigate('/tasks');
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error creating task",
        description: "There was an error creating your task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            to="/tasks" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Back to Tasks</span>
          </Link>
        </div>

        {/* Main Card */}
        <Card className="bg-white/70 backdrop-blur-xl border border-gray-200/50 shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-500" />
              Create New Task
            </CardTitle>
            <p className="text-gray-600">Add a new task to your backlog and keep track of your work.</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Task Name */}
              <div className="space-y-2">
                <Label htmlFor="taskName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Task Name
                </Label>
                <Input
                  id="taskName"
                  placeholder="Enter task name..."
                  value={formData.taskName}
                  onChange={(e) => handleInputChange('taskName', e.target.value)}
                  className="bg-gray-50/50 border-gray-200/50 rounded-xl h-11"
                  required
                />
              </div>

              {/* Project Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Project
                </Label>
                <Popover open={projectComboboxOpen} onOpenChange={setProjectComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={projectComboboxOpen}
                      className="w-full justify-between bg-gray-50/50 border-gray-200/50 rounded-xl h-11 text-left font-normal"
                    >
                      {formData.projectId
                        ? formData.projectId === 'no-project'
                          ? 'No Project'
                          : projects.find((project) => project.id === formData.projectId)?.name
                        : loadingProjects
                        ? "Loading projects..."
                        : "Search and select a project..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 bg-white border-gray-200/50 rounded-xl shadow-lg">
                    <Command>
                      <CommandInput 
                        placeholder="Search projects..." 
                        className="h-11 border-0 rounded-t-xl bg-gray-50/50"
                      />
                      <CommandList>
                        <CommandEmpty>No project found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="no-project"
                            onSelect={() => {
                              handleInputChange('projectId', 'no-project');
                              setProjectComboboxOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.projectId === 'no-project' ? "opacity-100" : "opacity-0"
                              )}
                            />
                            No Project
                          </CommandItem>
                          {projects.map((project) => (
                            <CommandItem
                              key={project.id}
                              value={project.name}
                              onSelect={() => {
                                handleInputChange('projectId', project.id);
                                setProjectComboboxOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.projectId === project.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {project.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the task details..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="bg-gray-50/50 border-gray-200/50 rounded-xl min-h-[100px] resize-none"
                />
              </div>

              {/* Compact 4-section row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                    <Flag className="w-3 h-3" />
                    Priority
                  </Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger className="bg-gray-50/50 border-gray-200/50 rounded-lg h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                    <Flag className="w-3 h-3" />
                    Status
                  </Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger className="bg-gray-50/50 border-gray-200/50 rounded-lg h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="not-started">Not Started</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Due Date
                  </Label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    className="bg-gray-50/50 border-gray-200/50 rounded-lg h-9 text-sm"
                  />
                </div>

                 <div className="space-y-1">
                   <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                     <User className="w-3 h-3" />
                     Assigned To
                   </Label>
                   <Popover open={userComboboxOpen} onOpenChange={setUserComboboxOpen}>
                     <PopoverTrigger asChild>
                       <Button
                         variant="outline"
                         role="combobox"
                         aria-expanded={userComboboxOpen}
                         className="w-full justify-between bg-gray-50/50 border-gray-200/50 rounded-lg h-9 text-sm font-normal"
                       >
                         {formData.assignedToUserId ? (
                           <div className="flex items-center gap-2">
                             {(() => {
                               const selectedUser = users.find(user => user.user_id === formData.assignedToUserId);
                               return selectedUser ? (
                                 <>
                                   <Avatar className="h-5 w-5">
                                     <AvatarImage src={selectedUser.avatar_url} />
                                     <AvatarFallback className="text-xs">
                                       {selectedUser.first_name?.[0]}{selectedUser.last_name?.[0]}
                                     </AvatarFallback>
                                   </Avatar>
                                   <span className="truncate">
                                     {`${selectedUser.first_name} ${selectedUser.last_name}`.trim()}
                                   </span>
                                 </>
                               ) : 'Unassigned';
                             })()}
                           </div>
                         ) : loadingUsers ? (
                           "Loading..."
                         ) : (
                           "Assignee..."
                         )}
                         <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                       </Button>
                     </PopoverTrigger>
                     <PopoverContent className="w-full p-0 bg-white border-gray-200/50 rounded-xl shadow-lg">
                       <Command>
                         <CommandInput 
                           placeholder="Search users..." 
                           className="h-9 border-0 rounded-t-xl bg-gray-50/50"
                         />
                         <CommandList>
                           <CommandEmpty>No user found.</CommandEmpty>
                           <CommandGroup>
                             <CommandItem
                               value="unassigned"
                               onSelect={() => {
                                 handleInputChange('assignedToUserId', '');
                                 handleInputChange('assignedTo', '');
                                 setUserComboboxOpen(false);
                               }}
                             >
                               <Check
                                 className={cn(
                                   "mr-2 h-3 w-3",
                                   !formData.assignedToUserId ? "opacity-100" : "opacity-0"
                                 )}
                               />
                               <div className="flex items-center gap-2">
                                 <User className="h-4 w-4 text-gray-400" />
                                 <span>Unassigned</span>
                               </div>
                             </CommandItem>
                             {users.map((user) => (
                               <CommandItem
                                 key={user.user_id}
                                 value={`${user.first_name} ${user.last_name} ${user.email}`}
                                 onSelect={() => {
                                   handleInputChange('assignedToUserId', user.user_id);
                                   handleInputChange('assignedTo', `${user.first_name} ${user.last_name}`.trim());
                                   setUserComboboxOpen(false);
                                 }}
                               >
                                 <Check
                                   className={cn(
                                     "mr-2 h-3 w-3",
                                     formData.assignedToUserId === user.user_id ? "opacity-100" : "opacity-0"
                                   )}
                                 />
                                 <div className="flex items-center gap-2">
                                   <Avatar className="h-5 w-5">
                                     <AvatarImage src={user.avatar_url} />
                                     <AvatarFallback className="text-xs">
                                       {user.first_name?.[0]}{user.last_name?.[0]}
                                     </AvatarFallback>
                                   </Avatar>
                                   <div className="flex flex-col">
                                     <span className="text-sm">
                                       {`${user.first_name} ${user.last_name}`.trim()}
                                     </span>
                                     <span className="text-xs text-gray-500">{user.email}</span>
                                   </div>
                                 </div>
                               </CommandItem>
                             ))}
                           </CommandGroup>
                         </CommandList>
                       </Command>
                     </PopoverContent>
                   </Popover>
                 </div>
              </div>

              {/* Document Attachments */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Paperclip className="w-4 h-4" />
                  Attachments
                </Label>
                
                <div className="border-2 border-dashed border-gray-200/50 rounded-xl p-4 bg-gray-50/30">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                  />
                  <label 
                    htmlFor="file-upload" 
                    className="flex flex-col items-center justify-center cursor-pointer py-2"
                  >
                    <Paperclip className="w-6 h-6 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to attach files</span>
                    <span className="text-xs text-gray-400 mt-1">PDF, DOC, images up to 10MB</span>
                  </label>
                </div>

                {attachments.length > 0 && (
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/50 border border-gray-200/50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700 truncate">{file.name}</span>
                          <span className="text-xs text-gray-400">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                          className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/tasks')}
                  className="px-6 py-2.5 rounded-xl border-gray-200/50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/25"
                >
                  {loading ? 'Creating...' : 'Create Task'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewTaskPage;