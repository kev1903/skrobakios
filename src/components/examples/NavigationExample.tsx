import React from 'react';
import { ModuleWrapper } from '@/components/ModuleWrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Map, 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Users,
  Eye,
  Edit,
  X
} from 'lucide-react';

interface NavigationExampleProps {
  companyId: string;
  showPermissionStatus?: boolean;
}

/**
 * Example navigation component showing how to use ModuleWrapper
 * to conditionally render modules based on user permissions
 */
export const NavigationExample: React.FC<NavigationExampleProps> = ({
  companyId,
  showPermissionStatus = false
}) => {
  const modules = [
    {
      id: 'business_map',
      name: 'Business Map',
      icon: Map,
      description: 'Dashboard overview and business intelligence',
      color: 'text-blue-600'
    },
    {
      id: 'projects',
      name: 'Projects',
      icon: Building2,
      description: 'Manage construction projects',
      color: 'text-green-600'
    },
    {
      id: 'sales',
      name: 'Sales',
      icon: TrendingUp,
      description: 'Lead management and CRM',
      color: 'text-purple-600'
    },
    {
      id: 'finance',
      name: 'Finance',
      icon: DollarSign,
      description: 'Invoicing and financial reporting',
      color: 'text-orange-600'
    },
    {
      id: 'stakeholders',
      name: 'Stakeholders',
      icon: Users,
      description: 'Manage vendors and clients',
      color: 'text-indigo-600'
    }
  ];

  const getAccessIcon = (accessLevel: string) => {
    switch (accessLevel) {
      case 'can_edit':
        return <Edit className="w-3 h-3 text-green-600" />;
      case 'can_view':
        return <Eye className="w-3 h-3 text-blue-600" />;
      default:
        return <X className="w-3 h-3 text-red-600" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Navigation Ribbon Example</h3>
        <p className="text-sm text-muted-foreground">
          This shows what modules are visible to the current user based on their permissions.
          Modules with "No Access" are completely hidden.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module) => (
          <ModuleWrapper
            key={module.id}
            moduleId={module.id}
            companyId={companyId}
            fallback={
              showPermissionStatus ? (
                <Card className="opacity-50 border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <module.icon className={`w-5 h-5 text-gray-400`} />
                      <span className="text-gray-400 font-medium">{module.name}</span>
                      <Badge variant="destructive" className="text-xs">
                        Hidden
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400">{module.description}</p>
                  </CardContent>
                </Card>
              ) : null // In real navigation, hidden modules return null (completely hidden)
            }
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <module.icon className={`w-5 h-5 ${module.color}`} />
                  <span className="font-medium">{module.name}</span>
                  {showPermissionStatus && (
                    <Badge variant="secondary" className="text-xs">
                      Visible
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{module.description}</p>
              </CardContent>
            </Card>
          </ModuleWrapper>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">How It Works</h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• <strong>No Access:</strong> Module is completely hidden from navigation</li>
          <li>• <strong>View Only:</strong> Module appears but with read-only access</li>
          <li>• <strong>Full Access:</strong> Module appears with all features enabled</li>
        </ul>
      </div>

      {/* Example of submodule permissions */}
      <div className="mt-6">
        <h4 className="font-medium mb-3">Project Submodules Example</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            'dashboard',
            'project_control',
            'cost',
            'qa_qc',
            'task',
            'team',
            'procurement',
            'contracts',
            'settings'
          ].map((subModuleId) => (
            <ModuleWrapper
              key={subModuleId}
              moduleId="projects"
              subModuleId={subModuleId}
              companyId={companyId}
              fallback={
                showPermissionStatus ? (
                  <div className="px-3 py-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    {subModuleId.replace('_', ' ')} - Hidden
                  </div>
                ) : null
              }
            >
              <div className="px-3 py-2 bg-green-50 border border-green-200 rounded text-xs text-green-700 capitalize">
                {subModuleId.replace('_', ' ')} - Visible
              </div>
            </ModuleWrapper>
          ))}
        </div>
      </div>
    </div>
  );
};