
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Mail, 
  Shield, 
  Server,
  User,
  Settings
} from 'lucide-react';

export const EmailDeliveryTroubleshooting = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Delivery Troubleshooting Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This guide helps diagnose and resolve email delivery issues based on recipient domain types and delivery patterns.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Microsoft Domains */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Microsoft Domains (Outlook, Hotmail, Live)
            <Badge variant="destructive">High Risk</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Microsoft domains have extremely aggressive spam filtering. Even "delivered" emails are often quarantined.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <h4 className="font-medium">Common Issues:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <span>Emails marked as "delivered" but filtered to junk/quarantine</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <span>Advanced Threat Protection (ATP) blocking automated emails</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <span>"noreply" addresses flagged as suspicious</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Solutions:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Use kevin@skrobaki.com instead of noreply@skrobaki.com</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Add sender to safe senders list</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Check junk/spam folder and quarantine folder</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Contact IT department about ATP settings</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Business Domains */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-purple-500" />
            Business/Corporate Domains
            <Badge variant="secondary">Medium Risk</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Business domains often have additional security layers and administrative email routing.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <h4 className="font-medium">Common Issues:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <span>Corporate firewalls blocking emails from new senders</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <span>Administrative emails routed differently than personal emails</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <span>Domain reputation filtering</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Solutions:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Contact IT department for domain whitelisting</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Request whitelisting of skrobaki.com domain</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Try alternative email addresses (personal vs administrative)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Check administrative email routing rules</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Gmail Domains */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-red-500" />
            Gmail Domains
            <Badge variant="outline">Low Risk</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Gmail generally has good delivery rates but may categorize emails into different tabs.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <h4 className="font-medium">Common Issues:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <span>Emails filtered to promotions tab</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <span>Occasional spam folder placement</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Solutions:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Check promotions tab</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Mark sender as important</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Add sender to contacts</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* General Troubleshooting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-500" />
            General Troubleshooting Steps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium">Domain Authentication:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Verify SPF record for skrobaki.com</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Ensure DKIM is properly configured</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Check DMARC policy settings</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Sender Reputation:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Monitor domain reputation scores</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Use personal email addresses for better reputation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Avoid "noreply" addresses when possible</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Alternative Solutions:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Send follow-up emails from different addresses</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Use alternative communication channels (SMS, phone)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Create email templates with better engagement</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-green-500" />
            Quick Reference - Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">For Microsoft Domains:</h4>
              <ul className="text-sm space-y-1">
                <li>• Use kevin@skrobaki.com</li>
                <li>• Check junk/quarantine folders</li>
                <li>• Contact IT for ATP settings</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">For Business Domains:</h4>
              <ul className="text-sm space-y-1">
                <li>• Request domain whitelisting</li>
                <li>• Check administrative routing</li>
                <li>• Try alternative email addresses</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
