import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSearchParams } from 'react-router-dom';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { useProjects, Project } from '@/hooks/useProjects';
import { ArrowLeft, HelpCircle, Calendar, User, FileText, ClipboardList, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface RFIDetailPageProps {
  onNavigate: (page: string) => void;
}

export const RFIDetailPage = ({ onNavigate }: RFIDetailPageProps) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const rfiId = searchParams.get('rfiId');
  const { getProject } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (projectId && rfiId) {
      const fetchData = async () => {
        try {
          const fetchedProject = await getProject(projectId);
          setProject(fetchedProject);
          
          // Fetch the actual RFI/issue from the database
          const { data: issue, error: issueError } = await supabase
            .from('issues')
            .select('*')
            .eq('id', rfiId)
            .single();
          
          if (issueError) throw issueError;
          
          if (issue) {
            // Fetch all issues in the same report to calculate auto_number
            const { data: allIssues, error: allIssuesError } = await supabase
              .from('issues')
              .select('id')
              .eq('report_id', issue.report_id)
              .order('created_at', { ascending: true });
            
            if (allIssuesError) throw allIssuesError;
            
            // Calculate the auto_number for this issue
            const autoNumber = (allIssues || []).findIndex(i => i.id === rfiId) + 1;
            
            // Set the report with auto_number and map fields correctly
            setReport({
              ...issue,
              auto_number: autoNumber,
              rfi_number: autoNumber.toString(), // Use auto_number as display number
              requested_by: issue.created_by || 'Unknown',
              date_requested: issue.created_at,
              sections: [],
              summary: {
                total_questions: 0,
                answered: 0,
                pending: 0,
                overdue: 0
              },
              attachments: issue.attachments || []
            });
          }
        } catch (error) {
          console.error('Error fetching RFI:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [projectId, rfiId, getProject]);

  const handleBack = () => {
    onNavigate(`project-qaqc&projectId=${projectId}`);
  };

  const getPriorityColor = (priority: string) => {
    const priorityMap: Record<string, string> = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return priorityMap[priority] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      open: 'bg-blue-100 text-blue-800',
      answered: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
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

  if (!report) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">RFI Not Found</h2>
          <p className="text-gray-600 mb-4">The requested RFI could not be found.</p>
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
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to QA/QC
              </Button>
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-6 h-6 text-orange-600" />
                <h1 className="text-2xl font-bold text-foreground">{report.rfi_number}</h1>
              </div>
            </div>
            <div className="flex space-x-2">
              <Badge className={getPriorityColor(report.priority)}>{report.priority}</Badge>
              <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
            </div>
          </div>

          <div className="grid gap-6">
            {/* RFI Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>{report.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Location</label>
                    <p className="text-foreground">{report.location}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Requested By</label>
                    <p className="text-foreground">{report.requested_by}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date Requested</label>
                    <p className="text-foreground">
                      {report.date_requested ? format(new Date(report.date_requested), 'MMM dd, yyyy') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                    <p className="text-foreground">
                      {report.due_date ? format(new Date(report.due_date), 'MMM dd, yyyy') : 'Not Set'}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-foreground mt-1">{report.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Summary Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ClipboardList className="w-5 h-5" />
                  <span>RFI Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{report.summary.total_questions}</div>
                    <div className="text-sm text-muted-foreground">Total Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{report.summary.answered}</div>
                    <div className="text-sm text-muted-foreground">Answered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{report.summary.pending}</div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{report.summary.overdue}</div>
                    <div className="text-sm text-muted-foreground">Overdue</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* RFI Sections with Questions */}
            {report.sections.map((section: any, sectionIndex: number) => (
              <Card key={sectionIndex}>
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {section.items.map((item: any, itemIndex: number) => (
                      <div key={item.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {item.status === 'answered' ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-yellow-600" />
                              )}
                              <h4 className="font-medium text-foreground">{item.question}</h4>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <span className="text-sm font-medium text-muted-foreground">Category: </span>
                                <span className="text-sm text-foreground">{item.category}</span>
                              </div>
                              {item.response && (
                                <>
                                  <div>
                                    <span className="text-sm font-medium text-muted-foreground">Response: </span>
                                    <span className="text-sm text-foreground">{item.response}</span>
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium text-muted-foreground">Answered by: </span>
                                    <span className="text-sm text-foreground">{item.answered_by}</span>
                                    <span className="text-sm text-muted-foreground ml-2">
                                      on {format(new Date(item.answered_date), 'MMM dd, yyyy')}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Attachments */}
            {report.attachments && report.attachments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Attachments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {report.attachments.map((attachment: any, index: number) => (
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
              <Button variant="outline">Export RFI</Button>
              <Button variant="outline">Add Response</Button>
              <Button>Close RFI</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};