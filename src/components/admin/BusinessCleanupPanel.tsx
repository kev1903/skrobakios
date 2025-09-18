import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trash2, 
  AlertTriangle, 
  RefreshCw, 
  Merge,
  CheckCircle,
  XCircle,
  Zap,
  Building2,
  Users,
  Calendar
} from "lucide-react";
import { useBusinessCleanup } from '@/hooks/useBusinessCleanup';
import { BusinessIssue, DuplicateGroup, generateCleanupSummary } from '@/utils/businessValidation';

export const BusinessCleanupPanel: React.FC = () => {
  const {
    loading,
    issues,
    duplicateGroups,
    companies,
    analyzeBusinesses,
    deleteCompany,
    bulkDeleteCompanies,
    mergeCompanies,
    resolveIssue,
    autoCleanup
  } = useBusinessCleanup();

  useEffect(() => {
    analyzeBusinesses();
  }, [analyzeBusinesses]);

  const getSeverityColor = (severity: BusinessIssue['severity']) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: BusinessIssue['type']) => {
    switch (type) {
      case 'test_data': return <XCircle className="h-4 w-4" />;
      case 'incomplete': return <AlertTriangle className="h-4 w-4" />;
      case 'duplicate': return <Users className="h-4 w-4" />;
      case 'invalid_format': return <Building2 className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const highPriorityIssues = issues.filter(i => i.severity === 'high');
  const autoCleanupCount = issues.filter(i => 
    i.severity === 'high' && (i.type === 'test_data' || i.type === 'incomplete')
  ).length;

  return (
    <Card className="glass-panel">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Business Data Cleanup
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={analyzeBusinesses}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Analyze
            </Button>
            {autoCleanupCount > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={autoCleanup}
                disabled={loading}
              >
                <Zap className="h-4 w-4" />
                Auto Cleanup ({autoCleanupCount})
              </Button>
            )}
          </div>
        </div>
        
        {issues.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {generateCleanupSummary(issues)}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              Overview
              {highPriorityIssues.length > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {highPriorityIssues.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="issues">
              Issues ({issues.length})
            </TabsTrigger>
            <TabsTrigger value="duplicates">
              Duplicates ({duplicateGroups.length})
            </TabsTrigger>
            <TabsTrigger value="stats">
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{companies.length}</p>
                      <p className="text-xs text-muted-foreground">Total Businesses</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-8 w-8 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">{issues.length}</p>
                      <p className="text-xs text-muted-foreground">Issues Found</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Users className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{duplicateGroups.length}</p>
                      <p className="text-xs text-muted-foreground">Duplicate Groups</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {highPriorityIssues.length > 0 && (
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    High Priority Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {highPriorityIssues.slice(0, 5).map((issue) => (
                      <div key={issue.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(issue.type)}
                          <span className="text-sm">{issue.description}</span>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => resolveIssue(issue.id, 'delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {highPriorityIssues.length > 5 && (
                      <p className="text-sm text-muted-foreground">
                        And {highPriorityIssues.length - 5} more...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="issues" className="space-y-4">
            {issues.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Issues Found</h3>
                <p className="text-muted-foreground">All businesses look good!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {issues.map((issue) => {
                  const company = companies.find(c => c.id === issue.companyId);
                  return (
                    <Card key={issue.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={company?.logo_url || ''} alt={company?.name} />
                              <AvatarFallback>
                                {company?.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{company?.name}</h4>
                                <Badge variant={getSeverityColor(issue.severity)}>
                                  {issue.severity}
                                </Badge>
                                <Badge variant="outline">
                                  {getTypeIcon(issue.type)}
                                  <span className="ml-1">{issue.type.replace('_', ' ')}</span>
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{issue.description}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                <span>Created: {company && new Date(company.created_at).toLocaleDateString()}</span>
                                <span>Onboarded: {company?.onboarding_completed ? 'Yes' : 'No'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resolveIssue(issue.id, 'ignore')}
                            >
                              Ignore
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => resolveIssue(issue.id, 'delete')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="duplicates" className="space-y-4">
            {duplicateGroups.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Duplicates Found</h3>
                <p className="text-muted-foreground">All businesses appear to be unique!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {duplicateGroups.map((group) => (
                  <Card key={group.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Duplicate Group ({group.companies.length} companies)
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge>Similarity: {group.similarity}%</Badge>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => mergeCompanies(
                              group.mergeCandidate!.id,
                              group.companies.filter(c => c.id !== group.mergeCandidate!.id).map(c => c.id)
                            )}
                          >
                            <Merge className="h-4 w-4" />
                            Merge
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {group.companies.map((company) => (
                          <div key={company.id} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={company.logo_url || ''} alt={company.name} />
                                <AvatarFallback>
                                  {company.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{company.name}</span>
                                  {company.id === group.mergeCandidate?.id && (
                                    <Badge variant="default">Best Candidate</Badge>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Created: {new Date(company.created_at).toLocaleDateString()}
                                  {company.abn && ` • ABN: ${company.abn}`}
                                  {company.website && ` • ${company.website}`}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteCompany(company.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(
                      companies.reduce((acc, c) => {
                        acc[c.business_type || 'company'] = (acc[c.business_type || 'company'] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([type, count]) => (
                      <div key={type} className="flex justify-between">
                        <span className="capitalize">{type.replace('_', ' ')}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Completion Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Onboarding Complete</span>
                      <Badge variant="default">
                        {companies.filter(c => c.onboarding_completed).length}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Incomplete</span>
                      <Badge variant="secondary">
                        {companies.filter(c => !c.onboarding_completed).length}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Verified</span>
                      <Badge variant="default">
                        {companies.filter(c => c.verified).length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};