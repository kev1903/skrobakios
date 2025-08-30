import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { Project } from '@/hooks/useProjects';
import { useScreenSize } from '@/hooks/use-mobile';

interface ProjectScopePageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

interface ScopeComponent {
  id: string;
  name: string;
  description?: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  progress: number;
  isExpanded: boolean;
  elements: ScopeElement[];
}

interface ScopeElement {
  id: string;
  name: string;
  description?: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  progress: number;
  deliverable?: string;
  assignedTo?: string;
}

// Sample data
const sampleScopeData: ScopeComponent[] = [
  {
    id: 'comp-1',
    name: 'Site Preparation',
    description: 'Initial site preparation and setup activities',
    status: 'In Progress',
    progress: 65,
    isExpanded: true,
    elements: [
      {
        id: 'elem-1-1',
        name: 'Site Survey',
        description: 'Conduct detailed site survey and measurements',
        status: 'Completed',
        progress: 100,
        deliverable: 'Survey Report',
        assignedTo: 'John Smith'
      },
      {
        id: 'elem-1-2',
        name: 'Soil Testing',
        description: 'Perform geotechnical soil analysis',
        status: 'In Progress',
        progress: 75,
        deliverable: 'Soil Test Results',
        assignedTo: 'Jane Doe'
      },
      {
        id: 'elem-1-3',
        name: 'Clearing & Grading',
        description: 'Clear vegetation and grade the site',
        status: 'Not Started',
        progress: 0,
        deliverable: 'Graded Site',
        assignedTo: 'Mike Johnson'
      }
    ]
  },
  {
    id: 'comp-2',
    name: 'Foundation Work',
    description: 'Foundation design and construction',
    status: 'Not Started',
    progress: 0,
    isExpanded: false,
    elements: [
      {
        id: 'elem-2-1',
        name: 'Foundation Design',
        description: 'Structural foundation design and calculations',
        status: 'Not Started',
        progress: 0,
        deliverable: 'Foundation Drawings',
        assignedTo: 'Sarah Wilson'
      },
      {
        id: 'elem-2-2',
        name: 'Excavation',
        description: 'Excavate foundation areas',
        status: 'Not Started',
        progress: 0,
        deliverable: 'Excavated Site',
        assignedTo: 'Tom Brown'
      }
    ]
  },
  {
    id: 'comp-3',
    name: 'Structural Framework',
    description: 'Main structural elements and framework',
    status: 'Not Started',
    progress: 0,
    isExpanded: false,
    elements: [
      {
        id: 'elem-3-1',
        name: 'Steel Framework',
        description: 'Install primary steel structural framework',
        status: 'Not Started',
        progress: 0,
        deliverable: 'Steel Structure',
        assignedTo: 'Alex Davis'
      }
    ]
  }
];

export const ProjectScopePage = ({ project, onNavigate }: ProjectScopePageProps) => {
  const [scopeData, setScopeData] = useState<ScopeComponent[]>(sampleScopeData);
  const screenSize = useScreenSize();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800';
      case 'Not Started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 0) return 'bg-gray-200';
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const toggleComponent = (componentId: string) => {
    setScopeData(prev => 
      prev.map(comp => 
        comp.id === componentId 
          ? { ...comp, isExpanded: !comp.isExpanded }
          : comp
      )
    );
  };

  const calculateOverallProgress = () => {
    const totalElements = scopeData.reduce((sum, comp) => sum + comp.elements.length, 0);
    const totalProgress = scopeData.reduce((sum, comp) => 
      sum + comp.elements.reduce((elemSum, elem) => elemSum + elem.progress, 0), 0
    );
    return totalElements > 0 ? Math.round(totalProgress / totalElements) : 0;
  };

  // Responsive classes based on screen size
  const mainClasses = {
    mobile: "flex flex-col h-screen",
    tablet: "flex flex-col h-screen", 
    desktop: "flex h-screen"
  };

  const contentClasses = {
    mobile: "flex-1 overflow-hidden",
    tablet: "flex-1 overflow-hidden",
    desktop: "flex-1 ml-48 overflow-hidden"
  };

  return (
    <div className={mainClasses[screenSize]}>
      {/* Project Sidebar */}
      <ProjectSidebar 
        project={project}
        onNavigate={onNavigate}
        getStatusColor={getStatusColor}
        getStatusText={(status) => status}
        activeSection="specification"
      />

      {/* Main Content */}
      <div className={contentClasses[screenSize]}>
        <div className="flex flex-col h-full bg-white">
          {/* Header */}
          <div className="flex-shrink-0 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Project Scope</h1>
                <p className="text-gray-600 mt-1">{project.name}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Overall Progress</div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${getProgressColor(calculateOverallProgress())}`}
                        style={{ width: `${calculateOverallProgress()}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{calculateOverallProgress()}%</span>
                  </div>
                </div>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Component
                </Button>
              </div>
            </div>
          </div>

          {/* Scope Table */}
          <div className="flex-1 overflow-auto px-6 py-4">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deliverable</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {scopeData.map((component) => (
                    <React.Fragment key={component.id}>
                      {/* Component Row */}
                      <tr className="hover:bg-gray-50 bg-blue-50/30">
                        <td className="px-4 py-4">
                          <button
                            onClick={() => toggleComponent(component.id)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            {component.isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-600" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-semibold text-gray-900">{component.name}</div>
                        </td>
                        <td className="px-4 py-4 text-gray-600">{component.description}</td>
                        <td className="px-4 py-4">
                          <Badge className={getStatusColor(component.status)}>
                            {component.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-300 ${getProgressColor(component.progress)}`}
                                style={{ width: `${component.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">{component.progress}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-600">-</td>
                        <td className="px-4 py-4 text-gray-600">-</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm">
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Element Rows */}
                      {component.isExpanded && component.elements.map((element) => (
                        <tr key={element.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3"></td>
                          <td className="px-4 py-3">
                            <div className="pl-6 text-gray-900">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                {element.name}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-sm">{element.description}</td>
                          <td className="px-4 py-3">
                            <Badge className={getStatusColor(element.status)}>
                              {element.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-300 ${getProgressColor(element.progress)}`}
                                  style={{ width: `${element.progress}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600">{element.progress}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-sm">{element.assignedTo}</td>
                          <td className="px-4 py-3 text-gray-600 text-sm">{element.deliverable}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm">
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};