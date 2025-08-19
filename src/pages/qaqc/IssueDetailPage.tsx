import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSearchParams } from 'react-router-dom';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { useProjects, Project } from '@/hooks/useProjects';
import { ArrowLeft, AlertTriangle, Calendar, User, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface IssueDetailPageProps {
  onNavigate: (page: string) => void;
}

export const IssueDetailPage = ({ onNavigate }: IssueDetailPageProps) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const issueId = searchParams.get('issueId');
  const { getProject } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  const [issue, setIssue] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (projectId && issueId) {
      const fetchData = async () => {
        try {
          const fetchedProject = await getProject(projectId);
          setProject(fetchedProject);
          
          // Mock issue data for now - in real app, fetch from API
          const mockIssue = {
            id: issueId,
            issue_number: 'ISS-001',
            title: 'Concrete Pour Non-Conformance',
            type: 'ncr',
            severity: 'major',
            status: 'investigating',
            reported_by: 'John Smith',
            description: 'During the concrete pour for foundation section A-3, the concrete mix did not meet the specified strength requirements. The slump test indicated 180mm instead of the required 120mm ± 20mm.',
            location: 'Foundation Section A-3',
            date_reported: '2024-01-15',
            due_date: '2024-01-25',
            corrective_action: 'Remove affected concrete section and re-pour with correct mix design.',
            attachments: [
              { name: 'concrete_test_results.pdf', url: '#' },
              { name: 'photo_evidence.jpg', url: '#' }
            ],
            created_at: '2024-01-15T10:30:00Z'
          };
          setIssue(mockIssue);
        } catch (error) {
          console.error('Failed to fetch data:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [projectId, issueId, getProject]);

  const handleBack = () => {
    onNavigate(`project-qaqc&projectId=${projectId}`);
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

  if (!issue) {
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

  return (
    <div className="flex h-screen bg-gray-50">
      <ProjectSidebar
        project={project}
        onNavigate={onNavigate}
        getStatusColor={() => "bg-blue-100 text-blue-800"}
        getStatusText={() => "Active"}
        activeSection="qaqc"
      />

      <div className="flex-1 ml-48 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to QA/QC
              </Button>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h1 className="text-2xl font-bold text-foreground">{issue.issue_number}</h1>
              </div>
            </div>
            <div className="flex space-x-2">
              <Badge className={getSeverityColor(issue.severity)}>{issue.severity}</Badge>
              <Badge className={getStatusColor(issue.status)}>{issue.status}</Badge>
            </div>
          </div>

          <div className="grid gap-6">
            {/* Main Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Issue Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{issue.title}</h3>
                  <p className="text-sm text-muted-foreground capitalize">Type: {issue.type.replace('_', ' ')}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Location</label>
                    <p className="text-foreground">{issue.location}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Reported By</label>
                    <p className="text-foreground">{issue.reported_by}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date Reported</label>
                    <p className="text-foreground">{format(new Date(issue.date_reported), 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                    <p className="text-foreground">{format(new Date(issue.due_date), 'MMM dd, yyyy')}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-foreground mt-1">{issue.description}</p>
                </div>

                {issue.corrective_action && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Corrective Action</label>
                    <p className="text-foreground mt-1">{issue.corrective_action}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Attachments */}
            {issue.attachments && issue.attachments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Attachments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {issue.attachments.map((attachment: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{attachment.name}</span>
                        <Button variant="outline" size="sm">Download</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline">Edit</Button>
              <Button>Update Status</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};