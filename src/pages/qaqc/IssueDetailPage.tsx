import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSearchParams } from 'react-router-dom';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { useProjects, Project } from '@/hooks/useProjects';
import { ArrowLeft, AlertTriangle, Calendar, User, FileText, ClipboardList, CheckCircle, XCircle } from 'lucide-react';
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
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (projectId && issueId) {
      const fetchData = async () => {
        try {
          const fetchedProject = await getProject(projectId);
          setProject(fetchedProject);
          
          // Mock comprehensive report data
          const mockReport = {
            id: issueId,
            issue_number: 'ISS-001',
            title: 'Foundation Quality Control Report',
            type: 'ncr',
            severity: 'major',
            status: 'investigating',
            reported_by: 'John Smith',
            description: 'Comprehensive quality control report for Foundation Section A-3 covering multiple non-conformance issues identified during inspection.',
            location: 'Foundation Section A-3',
            date_reported: '2024-01-15',
            due_date: '2024-01-25',
            created_at: '2024-01-15T10:30:00Z',
            
            // Report sections with multiple items
            sections: [
              {
                title: 'Concrete Quality Issues',
                items: [
                  {
                    id: 1,
                    description: 'Concrete mix did not meet specified strength requirements',
                    severity: 'major',
                    status: 'open',
                    findings: 'Slump test indicated 180mm instead of required 120mm ± 20mm',
                    corrective_action: 'Remove affected concrete and re-pour with correct mix'
                  },
                  {
                    id: 2,
                    description: 'Improper concrete curing procedures observed',
                    severity: 'medium',
                    status: 'resolved',
                    findings: 'Curing compound not applied within specified timeframe',
                    corrective_action: 'Retrained crew on proper curing procedures'
                  }
                ]
              },
              {
                title: 'Reinforcement Issues',
                items: [
                  {
                    id: 3,
                    description: 'Rebar spacing non-conformance',
                    severity: 'minor',
                    status: 'open',
                    findings: 'Spacing varies from 200mm to 250mm, specification requires 200mm ± 10mm',
                    corrective_action: 'Adjust rebar spacing to meet specifications'
                  }
                ]
              },
              {
                title: 'Documentation Issues',
                items: [
                  {
                    id: 4,
                    description: 'Missing test certificates',
                    severity: 'medium',
                    status: 'resolved',
                    findings: 'Concrete test certificates not provided for batch #347',
                    corrective_action: 'Obtained missing certificates from supplier'
                  }
                ]
              }
            ],
            
            attachments: [
              { name: 'concrete_test_results.pdf', url: '#' },
              { name: 'photo_evidence.jpg', url: '#' },
              { name: 'inspection_checklist.pdf', url: '#' }
            ],
            
            summary: {
              total_items: 4,
              open_items: 2,
              resolved_items: 2,
              major_issues: 1,
              medium_issues: 2,
              minor_issues: 1
            }
          };
          setReport(mockReport);
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

  if (!report) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Report Not Found</h2>
          <p className="text-gray-600 mb-4">The requested report could not be found.</p>
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
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h1 className="text-2xl font-bold text-gray-700">{report.issue_number}</h1>
              </div>
            </div>
            <div className="flex space-x-2">
              <Badge className={getSeverityColor(report.severity)}>{report.severity}</Badge>
              <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
            </div>
          </div>

          {/* Content area - all sections removed */}
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">All sections have been removed</p>
          </div>
        </div>
      </div>
    </div>
  );
};