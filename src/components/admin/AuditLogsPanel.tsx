import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Search, Filter, Download, User, Server, Shield } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuditLog {
  id: string;
  action_type: string;
  resource_type: string;
  resource_id: string | null;
  user_id: string | null;
  action_details: any;
  severity_level: string;
  created_at: string;
}

export const AuditLogsPanel: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { toast } = useToast();

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('platform_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch audit logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.resource_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || log.severity_level === filterType;
    return matchesSearch && matchesFilter;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge variant="destructive">Critical</Badge>;
      case 'warning': return <Badge variant="destructive" className="bg-yellow-500">Warning</Badge>;
      case 'info': return <Badge variant="default">Info</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getActionIcon = (actionType: string) => {
    if (actionType.includes('USER') || actionType.includes('LOGIN')) {
      return <User className="h-4 w-4" />;
    } else if (actionType.includes('SECURITY') || actionType.includes('AUTH')) {
      return <Shield className="h-4 w-4" />;
    } else {
      return <Server className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Audit Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading audit logs...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Platform Audit Logs
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search audit logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-border/40 rounded-md bg-background text-sm"
          >
            <option value="all">All Levels</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <div key={log.id} className="border border-border/40 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getActionIcon(log.action_type)}
                  <div>
                    <h3 className="font-semibold">{log.action_type.replace(/_/g, ' ')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {log.resource_type} {log.resource_id && `• ID: ${log.resource_id.substring(0, 8)}...`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getSeverityBadge(log.severity_level)}
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {log.action_details && Object.keys(log.action_details).length > 0 && (
                <div className="mt-3 p-3 bg-muted/30 rounded border">
                  <p className="text-sm font-medium mb-2">Details:</p>
                  <pre className="text-xs text-muted-foreground overflow-x-auto">
                    {JSON.stringify(log.action_details, null, 2)}
                  </pre>
                </div>
              )}

              {log.user_id && (
                <div className="mt-3 text-xs text-muted-foreground">
                  User ID: {log.user_id}
                </div>
              )}
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Audit Logs</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterType !== 'all' ? 'No logs match your search criteria.' : 'No audit logs available.'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};