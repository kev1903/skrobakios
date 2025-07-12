import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/contexts/CompanyContext';
import { 
  Plug, 
  Check, 
  ExternalLink, 
  Settings,
  Zap,
  Building,
  DollarSign,
  Mail,
  Calendar
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'Accounting' | 'Communication' | 'Project Management' | 'Finance';
  status: 'connected' | 'available' | 'coming_soon';
  features: string[];
  website?: string;
}

const integrations: Integration[] = [
  {
    id: 'xero',
    name: 'Xero',
    description: 'Sync your financial data with Xero accounting software.',
    icon: DollarSign,
    category: 'Accounting',
    status: 'available',
    features: ['Invoice Sync', 'Expense Tracking', 'Financial Reporting', 'Tax Management'],
    website: 'https://xero.com'
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Connect with QuickBooks for comprehensive accounting integration.',
    icon: Building,
    category: 'Accounting', 
    status: 'available',
    features: ['Accounting Sync', 'Payroll Integration', 'Tax Preparation', 'Financial Reports']
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Get notifications and updates directly in your Slack workspace.',
    icon: Zap,
    category: 'Communication',
    status: 'available',
    features: ['Task Notifications', 'Project Updates', 'Team Collaboration', 'File Sharing']
  },
  {
    id: 'microsoft-teams',
    name: 'Microsoft Teams',
    description: 'Integrate with Microsoft Teams for seamless collaboration.',
    icon: Mail,
    category: 'Communication',
    status: 'coming_soon',
    features: ['Meeting Integration', 'Chat Notifications', 'File Sync', 'Calendar Integration']
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync project deadlines and meetings with Google Calendar.',
    icon: Calendar,
    category: 'Project Management',
    status: 'available',
    features: ['Event Sync', 'Deadline Tracking', 'Meeting Scheduling', 'Reminder Notifications']
  }
];

export const CompanyIntegrationsTab = () => {
  const { currentCompany } = useCompany();
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const { toast } = useToast();

  const getStatusBadge = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Check className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        );
      case 'available':
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            Available
          </Badge>
        );
      case 'coming_soon':
        return (
          <Badge variant="secondary" className="text-slate-600">
            Coming Soon
          </Badge>
        );
    }
  };

  const handleConnect = async (integrationId: string) => {
    try {
      // Here you would handle the actual integration connection
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Integration Connected",
        description: `Successfully connected to ${integrations.find(i => i.id === integrationId)?.name}`
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect integration. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    try {
      // Here you would handle disconnecting the integration
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      
      toast({
        title: "Integration Disconnected",
        description: `Successfully disconnected from ${integrations.find(i => i.id === integrationId)?.name}`
      });
    } catch (error) {
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect integration. Please try again.",
        variant: "destructive"
      });
    }
  };

  const groupedIntegrations = integrations.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = [];
    }
    acc[integration.category].push(integration);
    return acc;
  }, {} as Record<string, Integration[]>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5" />
            Company Integrations
          </CardTitle>
          <CardDescription>
            Connect {currentCompany?.name || 'your company'} with external services to streamline workflows and improve productivity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {Object.entries(groupedIntegrations).map(([category, categoryIntegrations]) => (
              <div key={category} className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryIntegrations.map((integration) => {
                    const IconComponent = integration.icon;
                    
                    return (
                      <Card key={integration.id} className="border-slate-200 hover:border-slate-300 transition-colors">
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-slate-100 rounded-lg">
                                <IconComponent className="h-5 w-5 text-slate-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold">{integration.name}</h4>
                                {getStatusBadge(integration.status)}
                              </div>
                            </div>
                            {integration.website && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={integration.website} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                          <p className="text-sm text-slate-600">{integration.description}</p>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          <div className="space-y-4">
                            <div>
                              <h5 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                                Features
                              </h5>
                              <div className="flex flex-wrap gap-1">
                                {integration.features.map((feature, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="flex space-x-2">
                              {integration.status === 'available' && (
                                <Button 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={() => handleConnect(integration.id)}
                                >
                                  Connect
                                </Button>
                              )}
                              {integration.status === 'connected' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => setSelectedIntegration(integration.id)}
                                  >
                                    <Settings className="h-4 w-4 mr-1" />
                                    Configure
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => handleDisconnect(integration.id)}
                                  >
                                    Disconnect
                                  </Button>
                                </>
                              )}
                              {integration.status === 'coming_soon' && (
                                <Button size="sm" disabled className="flex-1">
                                  Coming Soon
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Integration Section */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Integrations</CardTitle>
          <CardDescription>
            Need a specific integration? Contact our support team to discuss custom integration options.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input 
              placeholder="What integration do you need?"
              className="flex-1"
            />
            <Button>Request Integration</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};