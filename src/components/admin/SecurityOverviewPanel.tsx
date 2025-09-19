import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, AlertTriangle, CheckCircle, XCircle, Lock, Key } from "lucide-react";
import { SecurityRecommendations } from '@/security/SecurityRecommendations';

export const SecurityOverviewPanel: React.FC = () => {
  // Mock security metrics for demonstration
  const securityMetrics = {
    overallScore: 85,
    riskLevel: 'Medium',
    activeThreats: 2,
    blockedAttacks: 47,
    lastScan: '2 hours ago',
    sslCertificate: 'Valid',
    dataEncryption: 'Enabled',
    backupsEncrypted: true,
    twoFactorEnabled: 34,
    totalUsers: 127
  };

  const securityChecks = [
    { name: 'SSL Certificate', status: 'pass', description: 'Valid and up to date' },
    { name: 'Data Encryption', status: 'pass', description: 'AES-256 encryption enabled' },
    { name: 'Password Policy', status: 'pass', description: 'Strong password requirements' },
    { name: 'Rate Limiting', status: 'pass', description: 'API rate limits configured' },
    { name: 'Session Security', status: 'warning', description: 'Consider shorter session timeout' },
    { name: 'Audit Logging', status: 'pass', description: 'Comprehensive logging enabled' },
    { name: 'Database Security', status: 'warning', description: 'Some RLS policies need review' },
    { name: 'File Upload Security', status: 'pass', description: 'File type restrictions active' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'fail': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass': return <Badge variant="default" className="bg-green-500">Pass</Badge>;
      case 'warning': return <Badge variant="destructive" className="bg-yellow-500">Warning</Badge>;
      case 'fail': return <Badge variant="destructive">Fail</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Security Score</p>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-primary">{securityMetrics.overallScore}/100</p>
                <Progress value={securityMetrics.overallScore} className="h-2" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
              <Badge variant={securityMetrics.riskLevel === 'Low' ? 'default' : securityMetrics.riskLevel === 'Medium' ? 'destructive' : 'destructive'}>
                {securityMetrics.riskLevel}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Active Threats</p>
              <p className="text-2xl font-bold text-destructive">{securityMetrics.activeThreats}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Blocked Attacks</p>
              <p className="text-2xl font-bold text-green-500">{securityMetrics.blockedAttacks}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 border border-border/40 rounded-lg">
              <Lock className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">SSL Certificate</p>
                <p className="text-sm text-muted-foreground">{securityMetrics.sslCertificate}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border border-border/40 rounded-lg">
              <Shield className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Data Encryption</p>
                <p className="text-sm text-muted-foreground">{securityMetrics.dataEncryption}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border border-border/40 rounded-lg">
              <Key className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">2FA Users</p>
                <p className="text-sm text-muted-foreground">
                  {securityMetrics.twoFactorEnabled}/{securityMetrics.totalUsers} users
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Checks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Security Checks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityChecks.map((check, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-border/40 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <p className="font-medium">{check.name}</p>
                    <p className="text-sm text-muted-foreground">{check.description}</p>
                  </div>
                </div>
                {getStatusBadge(check.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <SecurityRecommendations />
    </div>
  );
};