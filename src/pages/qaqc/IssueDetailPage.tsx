import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { useProjects, Project } from '@/hooks/useProjects';
import { useNavigationWithHistory } from '@/hooks/useNavigationWithHistory';
import { useIssue } from '@/hooks/useQAQCData';
import { ArrowLeft, AlertTriangle, Calendar, User, FileText, ClipboardList, CheckCircle, XCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface IssueDetailPageProps {
  onNavigate: (page: string) => void;
}

export const IssueDetailPage = ({ onNavigate }: IssueDetailPageProps) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const issueId = searchParams.get('issueId');
  const navigate = useNavigate();
  const { getProject } = useProjects();
  const { navigateBack } = useNavigationWithHistory({ 
    onNavigate, 
    currentPage: 'qaqc-issue-detail' 
  });
  const { data: issue, isLoading: issueLoading, error: issueError } = useIssue(issueId || '');
  const [project, setProject] = useState<Project | null>(null);
  
  // Debug logging
  console.log('IssueDetailPage - issueId:', issueId);
  console.log('IssueDetailPage - issue data:', issue);
  console.log('IssueDetailPage - isLoading:', issueLoading);
  console.log('IssueDetailPage - error:', issueError);

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

  const isLoading = issueLoading || !project;

  const handleBack = () => {
    navigateBack();
  };

  const handleAddIssue = () => {
    navigate(`/qaqc/issues/create?projectId=${projectId}`);
  };

  const getSeverityColor = (severity: string) => {
    const severityMap: Record<string, string> = {
      minor: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      major: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return severityMap[severity] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      open: 'bg-red-100 text-red-800',
      investigating: 'bg-orange-100 text-orange-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  if (!project || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
        </div>
      </div>
    );
  }

  if (issueError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Issue</h2>
          <p className="text-gray-600 mb-4">Failed to load issue: {issueError.message}</p>
          <Button onClick={handleBack}>Back to QA/QC</Button>
        </div>
      </div>
    );
  }

  if (!issue && !issueLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Issue Not Found</h2>
          <p className="text-gray-600 mb-4">The requested issue could not be found.</p>
          <Button onClick={handleBack}>Back to QA/QC</Button>
        </div>
      </div>
    );
  }

  // Only render the main content if we have both project and issue data
  if (!issue) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Issue...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <ProjectSidebar
        project={project}
        onNavigate={onNavigate}
        getStatusColor={() => "bg-blue-100 text-blue-800"}
        getStatusText={() => "Active"}
        activeSection="qaqc"
      />

      <div className="flex-1 ml-48 flex flex-col h-full">
        <div className="p-6 overflow-y-auto">
          <div className="min-h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to QA/QC
                </Button>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <h1 className="text-2xl font-bold text-gray-700">{issue.issue_number || 'Issue Detail'}</h1>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button onClick={handleAddIssue} className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Issue</span>
                </Button>
                <div className="flex space-x-2">
                  <Badge className={getStatusColor(issue.priority?.toLowerCase() || 'medium')}>{issue.priority || 'Medium'}</Badge>
                  <Badge className={getStatusColor(issue.status || 'open')}>{issue.status || 'Open'}</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4 pb-8">
              {/* Issue Info */}
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4" />
                  <h2 className="font-semibold">{issue.title}</h2>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-muted-foreground">Location:</span>
                    <div className="font-medium">{issue.location || 'Not specified'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <div className="font-medium">{issue.category}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date Created:</span>
                    <div className="font-medium">{format(new Date(issue.created_at), 'MMM dd, yyyy')}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Due Date:</span>
                    <div className="font-medium">
                      {issue.due_date ? format(new Date(issue.due_date), 'MMM dd, yyyy') : 'Not set'}
                    </div>
                  </div>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Description:</span>
                  <p className="mt-1">{issue.description || 'No description provided'}</p>
                </div>
                {issue.assigned_to && (
                  <div className="text-sm mt-3">
                    <span className="text-muted-foreground">Assigned To:</span>
                    <div className="font-medium mt-1">{issue.assigned_to}</div>
                  </div>
                )}
              </Card>

              {/* Comments Section */}
              {issue.comments && Array.isArray(issue.comments) && issue.comments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Comments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(issue.comments as any[]).map((comment: any, index: number) => (
                        <div key={index} className="border-l-4 border-blue-200 pl-4">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">{comment.author || 'Unknown'}</span>
                            <span className="text-xs text-muted-foreground">
                              {comment.date ? format(new Date(comment.date), 'MMM dd, yyyy HH:mm') : 'No date'}
                            </span>
                          </div>
                          <p className="text-sm">{comment.text || comment.comment}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Attachments Section */}
              {issue.attachments && Array.isArray(issue.attachments) && issue.attachments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Attachments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {(issue.attachments as any[]).map((attachment: any, index: number) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm font-medium truncate">
                              {attachment.name || `Attachment ${index + 1}`}
                            </span>
                          </div>
                          {attachment.url && (
                            <a 
                              href={attachment.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline mt-1 block"
                            >
                              View File
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};