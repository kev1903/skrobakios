import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Edit, FileText, Calendar, User, AlertCircle, X, Upload, Paperclip } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { useProjects, Project } from '@/hooks/useProjects';

interface RFIDetailPageProps {
  onNavigate: (page: string) => void;
}

export const RFIDetailPage = ({ onNavigate }: RFIDetailPageProps) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const rfiId = searchParams.get('rfiId');
  const type = searchParams.get('type') || 'rfi';
  const { getProject } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Mock RFI data - in real app, fetch based on rfiId
  const [rfiData, setRfiData] = useState({
    id: rfiId || "RFI-001",
    title: "Clarification on Foundation Details",
    description: "Need clarification on foundation depth requirements for the east wing. The current specifications indicate a depth of 2.5m, but the soil report suggests a minimum of 3.0m for stable foundation. Please provide clarification on the required depth and any additional reinforcement needed.",
    status: "open",
    priority: "high",
    created: "2024-01-15",
    createdBy: "John Smith",
    assigned: "Project Manager",
    assignedTo: "Sarah Johnson",
    dueDate: "2024-01-25",
    category: "Structural",
    location: "East Wing - Foundation Area",
    attachments: ["foundation_plan.pdf", "soil_report.pdf"],
    responses: [
      {
        id: "1",
        author: "Sarah Johnson",
        date: "2024-01-16",
        message: "Reviewing the soil report and consulting with structural engineer. Will provide response by EOD tomorrow."
      }
    ]
  });

  useEffect(() => {
    if (projectId) {
      const fetchProject = async () => {
        try {
          const fetchedProject = await getProject(projectId);
          setProject(fetchedProject);
        } catch (error) {
          console.error('Failed to fetch project:', error);
        }
      };
      fetchProject();
    }
  }, [projectId, getProject]);

  const handleSave = () => {
    // Save logic here
    setIsEditing(false);
    console.log('Saving RFI data:', rfiData);
  };

  const handleInputChange = (field: string, value: string) => {
    setRfiData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeleteAttachment = (index: number) => {
    setRfiData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const newAttachments = Array.from(files).map(file => file.name);
      setRfiData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newAttachments]
      }));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const files = e.clipboardData.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'destructive';
      case 'pending':
        return 'secondary';
      case 'resolved':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'default';
      default:
        return 'outline';
    }
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The requested project could not be found.</p>
          <Button onClick={() => onNavigate('projects')}>Back to Projects</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Project Sidebar */}
      <ProjectSidebar
        project={project}
        onNavigate={onNavigate}
        getStatusColor={() => "bg-blue-100 text-blue-800"}
        getStatusText={() => "Active"}
        activeSection="qaqc"
      />

      {/* Main Content */}
      <div className="flex-1 ml-48 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onNavigate(`rfi-list?projectId=${projectId}&type=${type}`)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to {type.toUpperCase()} List
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{rfiData.id} - {rfiData.title}</h1>
                  <p className="text-muted-foreground">{project.name} - #{project.project_id}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit {type.toUpperCase()}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {type.toUpperCase()} Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      {isEditing ? (
                        <Input
                          id="title"
                          value={rfiData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                        />
                      ) : (
                        <p className="mt-1 text-sm text-foreground">{rfiData.title}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      {isEditing ? (
                        <Select value={rfiData.category} onValueChange={(value) => handleInputChange('category', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Structural">Structural</SelectItem>
                            <SelectItem value="Electrical">Electrical</SelectItem>
                            <SelectItem value="Mechanical">Mechanical</SelectItem>
                            <SelectItem value="Plumbing">Plumbing</SelectItem>
                            <SelectItem value="General">General</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="mt-1 text-sm text-foreground">{rfiData.category}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    {isEditing ? (
                      <Textarea
                        id="description"
                        value={rfiData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={4}
                      />
                    ) : (
                      <p className="mt-1 text-sm text-foreground">{rfiData.description}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    {isEditing ? (
                      <Input
                        id="location"
                        value={rfiData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                      />
                    ) : (
                      <p className="mt-1 text-sm text-foreground">{rfiData.location}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Responses */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-foreground">Responses & Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rfiData.responses.map((response) => (
                      <div key={response.id} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-foreground">{response.author}</span>
                          <span className="text-xs text-muted-foreground">{response.date}</span>
                        </div>
                        <p className="text-sm text-foreground">{response.message}</p>
                      </div>
                    ))}
                    
                    {isEditing && (
                      <div className="mt-4">
                        <Label htmlFor="newResponse">Add Response</Label>
                        <Textarea
                          id="newResponse"
                          placeholder="Add your response or comment..."
                          rows={3}
                        />
                        <Button size="sm" className="mt-2">Add Response</Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status & Priority */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Status & Priority
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Status</Label>
                    {isEditing ? (
                      <Select value={rfiData.status} onValueChange={(value) => handleInputChange('status', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={getStatusColor(rfiData.status)} className="mt-1">
                        {rfiData.status}
                      </Badge>
                    )}
                  </div>

                  <div>
                    <Label>Priority</Label>
                    {isEditing ? (
                      <Select value={rfiData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={getPriorityColor(rfiData.priority)} className="mt-1">
                        {rfiData.priority}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Assignment & Dates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Assignment & Dates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Created By</Label>
                    <p className="mt-1 text-sm text-foreground">{rfiData.createdBy}</p>
                    <p className="text-xs text-muted-foreground">{rfiData.created}</p>
                  </div>

                  <div>
                    <Label>Assigned To</Label>
                    {isEditing ? (
                      <Input
                        value={rfiData.assignedTo}
                        onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                      />
                    ) : (
                      <p className="mt-1 text-sm text-foreground">{rfiData.assignedTo}</p>
                    )}
                  </div>

                  <div>
                    <Label>Due Date</Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={rfiData.dueDate}
                        onChange={(e) => handleInputChange('dueDate', e.target.value)}
                      />
                    ) : (
                      <p className="mt-1 text-sm text-foreground">{rfiData.dueDate}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Attachments */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-foreground">Attachments</CardTitle>
                </CardHeader>
                <CardContent 
                  className="space-y-4"
                  onPaste={handlePaste}
                  tabIndex={0}
                >
                  {/* Existing Attachments */}
                  <div className="space-y-2">
                    {rfiData.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="text-blue-600 hover:text-blue-800 cursor-pointer text-foreground">
                            {attachment}
                          </span>
                        </div>
                        {isEditing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAttachment(index)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {isEditing && (
                    <>
                      {/* Drag & Drop Zone */}
                      <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                          dragActive 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600 mb-2">
                          Drag and drop files here, or click to browse
                        </p>
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          id="file-upload"
                          onChange={(e) => handleFileUpload(e.target.files)}
                        />
                        <div className="flex gap-2 justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('file-upload')?.click()}
                          >
                            <Paperclip className="w-4 h-4 mr-2" />
                            Browse Files
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Focus the container to enable paste
                              const container = document.activeElement;
                              if (container) {
                                (container as HTMLElement).focus();
                              }
                            }}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Paste Files
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Supports PDF, DOC, JPG, PNG files up to 10MB
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};