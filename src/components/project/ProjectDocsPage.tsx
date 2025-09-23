import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'react-router-dom';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { useProjects, Project } from '@/hooks/useProjects';
import { 
  Plus, 
  FileText,
  Link,
  Download,
  Eye,
  Edit,
  Trash2,
  Upload,
  ExternalLink
} from 'lucide-react';
import { getStatusColor, getStatusText } from '../tasks/utils/taskUtils';

interface ProjectDocsPageProps {
  onNavigate: (page: string) => void;
}

export const ProjectDocsPage = ({ onNavigate }: ProjectDocsPageProps) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const tabParam = searchParams.get('tab') || 'files';
  const defaultTab = (['files', 'links'] as const).includes(tabParam as any) ? (tabParam as any) : 'files';
  const { getProject } = useProjects();
  const [project, setProject] = useState<Project | null>(null);

  // Mock data for demonstration - replace with actual data fetching
  const [files] = useState([
    {
      id: '1',
      name: 'Project Specifications.pdf',
      type: 'pdf',
      size: '2.4 MB',
      uploadedBy: 'John Doe',
      uploadedAt: '2024-01-15',
      category: 'Specifications'
    },
    {
      id: '2',
      name: 'Site Plans.dwg',
      type: 'dwg',
      size: '8.1 MB',
      uploadedBy: 'Jane Smith',
      uploadedAt: '2024-01-14',
      category: 'Drawings'
    },
    {
      id: '3',
      name: 'Material List.xlsx',
      type: 'xlsx',
      size: '156 KB',
      uploadedBy: 'Mike Johnson',
      uploadedAt: '2024-01-13',
      category: 'Lists'
    }
  ]);

  const [links] = useState([
    {
      id: '1',
      title: 'Company Portal',
      url: 'https://company.com/portal',
      description: 'Main company portal for project resources',
      category: 'Portal',
      addedBy: 'John Doe',
      addedAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'Supplier Database',
      url: 'https://suppliers.example.com',
      description: 'Access to approved suppliers and materials',
      category: 'Suppliers',
      addedBy: 'Jane Smith',
      addedAt: '2024-01-14'
    },
    {
      id: '3',
      title: 'Project Guidelines',
      url: 'https://guidelines.company.com',
      description: 'Standard operating procedures and guidelines',
      category: 'Guidelines',
      addedBy: 'Mike Johnson',
      addedAt: '2024-01-13'
    }
  ]);

  useEffect(() => {
    if (projectId) {
      const fetchProject = async () => {
        try {
          const fetchedProject = await getProject(projectId);
          setProject(fetchedProject);
        } catch (error) {
          console.error('Failed to fetch project:', error);
        }
      };
      fetchProject();
    }
  }, [projectId, getProject]);

  const getFileIcon = (type: string) => {
    return <FileText className="w-5 h-5 text-blue-600" />;
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The requested project could not be found.</p>
          <Button onClick={() => onNavigate('projects')}>Back to Projects</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-background min-h-screen">
      {/* Fixed Project Sidebar */}
      <div className="fixed left-0 top-0 h-full w-40 z-40">
        <ProjectSidebar 
          project={project} 
          onNavigate={onNavigate} 
          getStatusColor={getStatusColor} 
          getStatusText={getStatusText} 
          activeSection="docs" 
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-40 bg-background">
        {/* Header Section */}
        <div className="sticky top-0 z-30 border-b border-border px-6 py-4 bg-white backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground font-inter">Project Documents</h1>
              <p className="text-muted-foreground mt-1 text-sm font-inter">{project.name}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {/* Main Content with Tabs */}
          <div className="bg-card border rounded-lg">
            <Tabs defaultValue={defaultTab} className="w-full">
              {/* Tab Header */}
              <div className="bg-muted/30 border-b px-6 py-3">
                <div className="flex items-center justify-between">
                  {/* Left side - Tab buttons */}
                  <div className="flex items-center gap-6">
                    <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                      <TabsTrigger 
                        value="files"
                        className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground"
                      >
                        <FileText className="h-4 w-4" />
                        <span>Files</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="links"
                        className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground"
                      >
                        <Link className="h-4 w-4" />
                        <span>Links</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Right side - Action buttons */}
                  <div className="flex items-center gap-4">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add New
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                <TabsContent value="files" className="space-y-4 mt-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Project Files</h3>
                    <Button>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload File
                    </Button>
                  </div>
                  
                  <div className="grid gap-4">
                    {files.map((file) => (
                      <Card key={file.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getFileIcon(file.type)}
                              <div>
                                <h4 className="font-medium text-foreground">{file.name}</h4>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>{file.size}</span>
                                  <span>•</span>
                                  <span>{file.category}</span>
                                  <span>•</span>
                                  <span>Uploaded by {file.uploadedBy}</span>
                                  <span>•</span>
                                  <span>{file.uploadedAt}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="links" className="space-y-4 mt-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Project Links</h3>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Link
                    </Button>
                  </div>
                  
                  <div className="grid gap-4">
                    {links.map((link) => (
                      <Card key={link.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Link className="w-5 h-5 text-green-600" />
                              <div>
                                <h4 className="font-medium text-foreground">{link.title}</h4>
                                <p className="text-sm text-muted-foreground mb-1">{link.description}</p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>{link.category}</span>
                                  <span>•</span>
                                  <span>Added by {link.addedBy}</span>
                                  <span>•</span>
                                  <span>{link.addedAt}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => window.open(link.url, '_blank')}>
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};