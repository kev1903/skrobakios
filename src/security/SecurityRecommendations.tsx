import React from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Security Assessment Component
 * Displays current security status and recommendations
 */
export const SecurityRecommendations = () => {
  const criticalIssues = [
    {
      id: 1,
      severity: 'critical',
      title: 'Database Function Security',
      description: '49 database functions lack proper search_path settings',
      impact: 'Potential SQL injection vulnerability',
      action: 'Fix function search paths in Supabase'
    }
  ];

  const warnings = [
    {
      id: 1,
      severity: 'warning',
      title: 'Client-Side Authentication Only',
      description: 'No server-side validation for sensitive operations',
      impact: 'Bypass potential through client manipulation',
      action: 'Implement Edge Functions for critical operations'
    },
    {
      id: 2,
      severity: 'warning', 
      title: 'Session Timeout Management',
      description: 'No explicit session timeout handling',
      impact: 'Sessions may persist longer than intended',
      action: 'Implement automatic session timeout'
    }
  ];

  const implemented = [
    'Supabase Authentication Integration',
    'Role-Based Access Control (RBAC)',
    'Route Protection Layers',
    'Session State Management',
    'Password Reset Functionality',
    'Email Confirmation Flow'
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h1 className="text-3xl font-bold">Security Assessment</h1>
        <p className="text-muted-foreground">Platform Authentication & Access Control Review</p>
      </div>

      {/* Critical Issues */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center text-red-700">
            <XCircle className="w-5 h-5 mr-2" />
            Critical Security Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          {criticalIssues.map(issue => (
            <Alert key={issue.id} className="mb-4 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-800">{issue.title}</h4>
                  <p className="text-red-700">{issue.description}</p>
                  <p className="text-sm text-red-600"><strong>Impact:</strong> {issue.impact}</p>
                  <p className="text-sm text-red-600"><strong>Action:</strong> {issue.action}</p>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>

      {/* Warnings */}
      <Card className="border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center text-yellow-700">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Security Warnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {warnings.map(warning => (
            <Alert key={warning.id} className="mb-4 border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription>
                <div className="space-y-2">
                  <h4 className="font-semibold text-yellow-800">{warning.title}</h4>
                  <p className="text-yellow-700">{warning.description}</p>
                  <p className="text-sm text-yellow-600"><strong>Impact:</strong> {warning.impact}</p>
                  <p className="text-sm text-yellow-600"><strong>Action:</strong> {warning.action}</p>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>

      {/* Security Features Implemented */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center text-green-700">
            <CheckCircle className="w-5 h-5 mr-2" />
            Security Features Implemented
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {implemented.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-700">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Access Control Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Access Control Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Page Type</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Authentication</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Subscription</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Role</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Examples</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">Public</td>
                  <td className="border border-gray-300 px-4 py-2">❌ Not Required</td>
                  <td className="border border-gray-300 px-4 py-2">❌ Not Required</td>
                  <td className="border border-gray-300 px-4 py-2">❌ Not Required</td>
                  <td className="border border-gray-300 px-4 py-2">Landing, Directory, Public Profiles</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">Basic Protected</td>
                  <td className="border border-gray-300 px-4 py-2">✅ Required</td>
                  <td className="border border-gray-300 px-4 py-2">❌ Not Required</td>
                  <td className="border border-gray-300 px-4 py-2">❌ Not Required</td>
                  <td className="border border-gray-300 px-4 py-2">Home, Settings, Support</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">Subscription Protected</td>
                  <td className="border border-gray-300 px-4 py-2">✅ Required</td>
                  <td className="border border-gray-300 px-4 py-2">✅ Required</td>
                  <td className="border border-gray-300 px-4 py-2">❌ Not Required</td>
                  <td className="border border-gray-300 px-4 py-2">Projects, Files, Finance</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">Role Protected</td>
                  <td className="border border-gray-300 px-4 py-2">✅ Required</td>
                  <td className="border border-gray-300 px-4 py-2">✅ Required</td>
                  <td className="border border-gray-300 px-4 py-2">✅ Required</td>
                  <td className="border border-gray-300 px-4 py-2">Admin Panel, User Management</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};