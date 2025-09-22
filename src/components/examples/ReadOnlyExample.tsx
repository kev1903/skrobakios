import React, { useState } from 'react';
import { ReadOnlyWrapper, useReadOnly } from '@/components/ReadOnlyWrapper';
import { ModuleWrapper } from '@/components/ModuleWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, Eye, Save } from 'lucide-react';

interface ReadOnlyExampleProps {
  companyId: string;
}

/**
 * Example component demonstrating how to use ReadOnlyWrapper for view-only permissions
 */
export const ReadOnlyExample: React.FC<ReadOnlyExampleProps> = ({ companyId }) => {
  const [projectName, setProjectName] = useState('Sample Construction Project');
  const [projectDescription, setProjectDescription] = useState('This is a sample project description that shows how read-only mode works.');
  const [budget, setBudget] = useState('$150,000');

  // Example using the hook directly
  const { isReadOnly, accessLevel } = useReadOnly({
    moduleId: 'projects',
    subModuleId: 'dashboard',
    companyId
  });

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Permission System Demo</h1>
        <p className="text-muted-foreground">
          This page shows how modules behave based on user permissions.
          Current access level: <Badge variant="secondary">{accessLevel}</Badge>
        </p>
      </div>

      {/* Business Map Module Example */}
      <ModuleWrapper
        moduleId="business_map"
        subModuleId="business_map" 
        companyId={companyId}
        fallback={
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Business Map - No Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">You don't have permission to view this module.</p>
            </CardContent>
          </Card>
        }
      >
        <ReadOnlyWrapper
          moduleId="business_map"
          subModuleId="business_map"
          companyId={companyId}
          customBannerMessage="Business Map is in view-only mode. You can see the data but cannot make changes."
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Business Map Dashboard
                <Badge variant="outline">Always Visible if Access Granted</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800">Active Projects</h3>
                  <p className="text-2xl font-bold text-blue-600">12</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800">Revenue This Month</h3>
                  <p className="text-2xl font-bold text-green-600">$45,600</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-800">Team Members</h3>
                  <p className="text-2xl font-bold text-purple-600">8</p>
                </div>
              </div>
              
              {/* Edit buttons - these will be disabled in read-only mode */}
              <div className="flex gap-2 pt-4">
                <Button data-edit-action className="flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit Dashboard
                </Button>
                <Button variant="outline" data-create-action className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Widget
                </Button>
              </div>
            </CardContent>
          </Card>
        </ReadOnlyWrapper>
      </ModuleWrapper>

      {/* Projects Module Example */}
      <ModuleWrapper
        moduleId="projects"
        subModuleId="dashboard"
        companyId={companyId}
        fallback={
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Projects - No Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">You don't have permission to view projects.</p>
            </CardContent>
          </Card>
        }
      >
        <ReadOnlyWrapper
          moduleId="projects"
          subModuleId="dashboard"
          companyId={companyId}
        >
          <Card>
            <CardHeader>
              <CardTitle>Project Details Form</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="Enter budget"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-2 pt-4">
                <Button data-edit-action className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
                <Button variant="destructive" data-delete-action className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete Project
                </Button>
                <Button variant="outline" data-view-action className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  View Details (Always Available)
                </Button>
              </div>
            </CardContent>
          </Card>
        </ReadOnlyWrapper>
      </ModuleWrapper>

      {/* Finance Module Example - might be completely hidden */}
      <ModuleWrapper
        moduleId="finance"
        subModuleId="invoicing"
        companyId={companyId}
        fallback={
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Finance - No Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">You don't have permission to view financial data.</p>
            </CardContent>
          </Card>
        }
      >
        <ReadOnlyWrapper
          moduleId="finance"
          subModuleId="invoicing"
          companyId={companyId}
          customBannerMessage="Financial data is sensitive. You have view-only access."
        >
          <Card>
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold">Outstanding Invoices</h3>
                  <p className="text-xl font-bold">$23,450</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold">Paid This Month</h3>
                  <p className="text-xl font-bold">$67,200</p>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button data-create-action>Create Invoice</Button>
                <Button variant="outline" data-edit-action>Edit Settings</Button>
                <Button variant="outline" data-view-action>View Reports</Button>
              </div>
            </CardContent>
          </Card>
        </ReadOnlyWrapper>
      </ModuleWrapper>

      {/* Information Panel */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">How This Works</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <ul className="list-disc list-inside space-y-2">
            <li><strong>No Access:</strong> Module completely hidden from navigation and pages</li>
            <li><strong>View Only:</strong> Module appears in navigation and content is visible, but editing is disabled</li>
            <li><strong>Full Access:</strong> Module appears with full functionality enabled</li>
            <li><strong>Special Attributes:</strong>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li><code>data-edit-action</code> - Hidden in read-only mode</li>
                <li><code>data-delete-action</code> - Hidden in read-only mode</li>
                <li><code>data-create-action</code> - Hidden in read-only mode</li>
                <li><code>data-view-action</code> - Always visible</li>
                <li><code>data-allow-readonly</code> - Bypasses read-only restrictions</li>
              </ul>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};