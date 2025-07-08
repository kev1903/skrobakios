import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plug, 
  ExternalLink, 
  Settings, 
  Check, 
  AlertCircle,
  DollarSign,
  FileText,
  Building
} from 'lucide-react';
import { XeroIntegration } from './XeroIntegration';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  status: 'available' | 'connected' | 'error';
  features: string[];
}

const integrations: Integration[] = [
  {
    id: 'xero',
    name: 'Xero',
    description: 'Sync your financial data with Xero accounting software for seamless bookkeeping and reporting.',
    icon: DollarSign,
    category: 'Accounting',
    status: 'available',
    features: ['Invoice Management', 'Expense Tracking', 'Financial Reporting', 'Bank Reconciliation']
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Connect with QuickBooks for comprehensive financial management and reporting.',
    icon: FileText,
    category: 'Accounting',
    status: 'available',
    features: ['Accounting', 'Payroll', 'Tax Management', 'Financial Reports']
  },
  {
    id: 'sage',
    name: 'Sage',
    description: 'Integrate with Sage for enterprise-level accounting and business management.',
    icon: Building,
    category: 'Accounting',
    status: 'available',
    features: ['Enterprise Accounting', 'HR Management', 'Business Intelligence', 'Compliance']
  }
];

export const IntegrationsTab = () => {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

  const getStatusBadge = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Check className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Plug className="w-3 h-3 mr-1" />
            Available
          </Badge>
        );
    }
  };

  if (selectedIntegration === 'xero') {
    return <XeroIntegration onBack={() => setSelectedIntegration(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground heading-modern mb-2">
          Integrations
        </h2>
        <p className="text-muted-foreground body-modern">
          Connect your platform with external services to streamline your workflow
        </p>
      </div>

      {/* Integration Categories */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground heading-modern mb-4">
            Accounting & Finance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration) => {
              const IconComponent = integration.icon;
              return (
                <Card key={integration.id} className="glass-card hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg heading-modern">{integration.name}</CardTitle>
                        </div>
                      </div>
                      {getStatusBadge(integration.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-sm body-modern">
                      {integration.description}
                    </CardDescription>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-foreground heading-modern">Features:</h4>
                      <div className="flex flex-wrap gap-1">
                        {integration.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => setSelectedIntegration(integration.id)}
                      >
                        {integration.status === 'connected' ? (
                          <>
                            <Settings className="w-4 h-4" />
                            Configure
                          </>
                        ) : (
                          <>
                            <Plug className="w-4 h-4" />
                            Connect
                          </>
                        )}
                      </Button>
                      
                      {integration.status === 'connected' && (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">Auto-sync</span>
                          <Switch defaultChecked />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Coming Soon Section */}
        <div>
          <h3 className="text-lg font-semibold text-foreground heading-modern mb-4">
            Coming Soon
          </h3>
          <Card className="glass-card border-dashed border-2">
            <CardContent className="text-center py-8">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plug className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="text-lg font-semibold text-foreground heading-modern mb-2">
                More Integrations
              </h4>
              <p className="text-muted-foreground body-modern mb-4">
                We're working on adding more integrations including CRM systems, project management tools, and communication platforms.
              </p>
              <Button variant="outline" className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Request Integration
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};