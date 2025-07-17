import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Zap, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Globe, 
  Code,
  Webhook,
  Activity,
  Send
} from 'lucide-react';

interface ApiConnection {
  connected: boolean;
  webhook: string;
  lastSync?: string;
  events?: string[];
}

interface ApiIntegrationProps {
  connections: {
    n8n: ApiConnection;
    skai: ApiConnection;
  };
  onConnectionUpdate: (connections: any) => void;
  onTestConnection: (action: string, data: any) => Promise<void>;
}

export const ApiIntegration = ({ 
  connections, 
  onConnectionUpdate, 
  onTestConnection 
}: ApiIntegrationProps) => {
  const [testing, setTesting] = useState<{ n8n: boolean; skai: boolean }>({
    n8n: false,
    skai: false
  });
  
  const { toast } = useToast();

  const handleWebhookUpdate = (service: 'n8n' | 'skai', webhook: string) => {
    onConnectionUpdate({
      ...connections,
      [service]: {
        ...connections[service],
        webhook,
        connected: webhook.length > 0
      }
    });
  };

  const handleTestConnection = async (service: 'n8n' | 'skai') => {
    if (!connections[service].webhook) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL first",
        variant: "destructive"
      });
      return;
    }

    setTesting(prev => ({ ...prev, [service]: true }));
    
    try {
      await onTestConnection('test_connection', {
        service,
        timestamp: new Date().toISOString(),
        message: `Test connection from ${service} integration`
      });

      // Update last sync time
      onConnectionUpdate({
        ...connections,
        [service]: {
          ...connections[service],
          lastSync: new Date().toISOString()
        }
      });

      toast({
        title: "Connection Successful",
        description: `${service.toUpperCase()} webhook is working correctly`,
      });

    } catch (error) {
      console.error(`Error testing ${service} connection:`, error);
      toast({
        title: "Connection Failed",
        description: `Unable to reach ${service.toUpperCase()} webhook`,
        variant: "destructive"
      });
    } finally {
      setTesting(prev => ({ ...prev, [service]: false }));
    }
  };

  const availableEvents = [
    'task_created',
    'task_updated', 
    'task_deleted',
    'task_completed',
    'milestone_reached',
    'project_started',
    'project_completed'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5" />
          API Integrations
        </h3>
        <p className="text-sm text-muted-foreground">
          Connect external services to sync timeline changes automatically
        </p>
      </div>

      {/* n8n Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              n8n Automation
            </div>
            <Badge variant={connections.n8n.connected ? "default" : "secondary"}>
              {connections.n8n.connected ? (
                <><CheckCircle className="w-3 h-3 mr-1" /> Connected</>
              ) : (
                <><XCircle className="w-3 h-3 mr-1" /> Disconnected</>
              )}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="n8n-webhook">Webhook URL</Label>
            <Input
              id="n8n-webhook"
              placeholder="https://your-n8n-instance.com/webhook/..."
              value={connections.n8n.webhook}
              onChange={(e) => handleWebhookUpdate('n8n', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Create a webhook trigger in n8n and paste the URL here
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleTestConnection('n8n')}
              disabled={!connections.n8n.webhook || testing.n8n}
            >
              <Send className="w-4 h-4 mr-2" />
              {testing.n8n ? 'Testing...' : 'Test Connection'}
            </Button>
            
            {connections.n8n.lastSync && (
              <span className="text-xs text-muted-foreground">
                Last sync: {new Date(connections.n8n.lastSync).toLocaleString()}
              </span>
            )}
          </div>

          {connections.n8n.connected && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-sm">
                <div className="font-medium mb-1">Integration Active</div>
                <div className="text-muted-foreground">
                  Timeline changes will be automatically sent to your n8n workflow
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skai Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Skai AI Integration
            </div>
            <Badge variant={connections.skai.connected ? "default" : "secondary"}>
              {connections.skai.connected ? (
                <><CheckCircle className="w-3 h-3 mr-1" /> Connected</>
              ) : (
                <><XCircle className="w-3 h-3 mr-1" /> Disconnected</>
              )}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skai-webhook">Webhook URL</Label>
            <Input
              id="skai-webhook"
              placeholder="https://skai-api.com/webhook/..."
              value={connections.skai.webhook}
              onChange={(e) => handleWebhookUpdate('skai', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Get your Skai webhook URL from the Skai dashboard
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleTestConnection('skai')}
              disabled={!connections.skai.webhook || testing.skai}
            >
              <Send className="w-4 h-4 mr-2" />
              {testing.skai ? 'Testing...' : 'Test Connection'}
            </Button>
            
            {connections.skai.lastSync && (
              <span className="text-xs text-muted-foreground">
                Last sync: {new Date(connections.skai.lastSync).toLocaleString()}
              </span>
            )}
          </div>

          {connections.skai.connected && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-sm">
                <div className="font-medium mb-1">Integration Active</div>
                <div className="text-muted-foreground">
                  Skai AI will receive timeline updates for intelligent insights
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Webhook className="w-5 h-5" />
            Event Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Configure which events trigger webhook notifications to your integrated services
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableEvents.map(event => (
              <div key={event} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-sm capitalize">
                    {event.replace('_', ' ')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Triggers when {event.replace('_', ' ').toLowerCase()}
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Webhook Payload Example */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Code className="w-5 h-5" />
            Webhook Payload Format
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Example payload that will be sent to your webhooks:
            </p>
            
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-xs overflow-x-auto">
{`{
  "action": "task_updated",
  "projectId": "proj_123",
  "projectName": "Website Redesign",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "taskId": "task_456",
    "updates": {
      "status": "completed",
      "progress": 100
    }
  }
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};