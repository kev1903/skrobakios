import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Activity } from "lucide-react";
import { format } from "date-fns";

interface AuditLogEntry {
  id: string;
  action: string;
  actor: string;
  target: string;
  details: string;
  timestamp: string;
  type: 'permission' | 'role' | 'user';
}

export const PermissionAuditLog: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - would fetch from database in real implementation
    const mockLogs: AuditLogEntry[] = [
      {
        id: '1',
        action: 'Role Updated',
        actor: 'admin@company.com',
        target: 'john.doe@company.com',
        details: 'Changed role from Company Admin to Platform Admin',
        timestamp: new Date().toISOString(),
        type: 'role'
      },
      {
        id: '2',
        action: 'Permission Granted',
        actor: 'admin@company.com',
        target: 'jane.smith@company.com',
        details: 'Granted manage_platform_users permission',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        type: 'permission'
      },
      {
        id: '3',
        action: 'User Invited',
        actor: 'admin@company.com',
        target: 'new.user@company.com',
        details: 'Sent platform invitation as Company Admin',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        type: 'user'
      }
    ];

    setTimeout(() => {
      setAuditLogs(mockLogs);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getActionBadgeColor = (type: string) => {
    switch (type) {
      case 'permission':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'role':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'user':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const filteredLogs = auditLogs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading audit logs...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Permission Audit Log
            </CardTitle>
            <p className="text-muted-foreground">
              Track all permission and role changes
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search audit logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No audit logs found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge className={getActionBadgeColor(log.type)}>
                        {log.action}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{log.actor}</TableCell>
                  <TableCell className="font-mono text-sm">{log.target}</TableCell>
                  <TableCell className="text-sm">{log.details}</TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};