import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useSearchParams } from 'react-router-dom';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { useProjects, Project } from '@/hooks/useProjects';
import { useProjectLinks, ProjectLink } from '@/hooks/useProjectLinks';
import { ProjectLinkDialog } from './ProjectLinkDialog';
import { ProjectPageHeader } from './ProjectPageHeader';
import { Plus, FileText, Link, Download, Eye, Edit, Trash2, ExternalLink, Upload } from 'lucide-react';
import { getStatusColor, getStatusText } from '../tasks/utils/taskUtils';
import { DocumentUpload } from '@/components/project-documents/DocumentUpload';
import { useProjectDocuments } from '@/hooks/useProjectDocuments';

const documentCategories = [
  // 1. Application & Administrative Documents
  { id: 'app-form', name: 'Application Form for a Building Permit', type: 'document' },
  { id: 'owner-builder', name: 'Owner–Builder / Agent Authority Form', type: 'document' },
  { id: 'sec-30a', name: 'Section 30A – Document Checklist', type: 'document' },
  { id: 'sec-80', name: 'Section 80 – Builder Appointment Form', type: 'document' },
  { id: 're-establishment', name: 'Re-establishment, Feature & Level Survey', type: 'document' },
  { id: 'title-plan', name: 'Title, Plan of Subdivision & Covenant', type: 'document' },
  { id: 'property-report', name: 'Property Report / Land Data Report', type: 'report' },
  { id: 'planning-report', name: 'Planning Property Report', type: 'report' },
  { id: 'council-zoning', name: 'Council Zoning / Planning Information Letter', type: 'document' },
  { id: 'google-photos', name: 'Google Site Photos / Site Inspection Photos', type: 'image' },
  { id: 'dbi', name: 'Domestic Building Insurance Certificate (DBI)', type: 'document' },
  { id: 'builders-contract', name: 'Builders Contract & Construction Management Letter', type: 'document' },
  { id: 'surveyor-appointment', name: 'Building Surveyor Appointment Form', type: 'document' },
  { id: 'form-2', name: 'Form 2 – Building Permit', type: 'document' },
  { id: 'form-6', name: 'Form 6 – Protection Work Determination', type: 'document' },
  { id: 'form-7', name: 'Form 7 – Protection Work Notice(s)', type: 'document' },
  { id: 'form-8', name: 'Form 8 – Protection Work Agreement(s)', type: 'document' },
  { id: 'reg-51', name: 'Reg 51 – Property Information', type: 'document' },
  { id: 'reg-74', name: 'Reg 74 – Approved Permit (and Extension of Time)', type: 'document' },
  { id: 'reg-133', name: 'Reg 133 – Performance Solution Report / LPD', type: 'report' },
  { id: 'reg-126', name: 'Reg 126 – Certificate of Compliance (Structural, Civil, Stormwater)', type: 'document' },

  // 2. Engineering & Technical Reports
  { id: 'structural-plans', name: 'Structural Engineering Plans (Stamped)', type: 'drawing' },
  { id: 'structural-computations', name: 'Structural Computations & Certification (Reg 126 CoC)', type: 'report' },
  { id: 'civil-plans', name: 'Civil Engineering Plans (Drainage, Stormwater, Driveway)', type: 'drawing' },
  { id: 'civil-cert', name: 'Civil / Structural Combined Certificate of Compliance (Reg 126)', type: 'document' },
  { id: 'drainage-computations', name: 'Drainage Computations', type: 'report' },
  { id: 'sewer-plan', name: 'Sewer Plan & Stormwater Layout Plan', type: 'drawing' },
  { id: 'soil-report', name: 'Soil Report (Geotechnical Investigation)', type: 'report' },
  { id: 'energy-rating', name: 'Energy Rating Report (NatHERS or Section J)', type: 'report' },
  { id: 'energy-drawings', name: 'Energy-Endorsed Drawings', type: 'drawing' },
  { id: 'performance-solution', name: 'Performance Solution – Regulation 38 Statement (if applicable)', type: 'report' },
  { id: 'engineering-schedule', name: 'Engineering Design Schedule / Compliance Summary', type: 'document' },
  { id: 'sewer-connection', name: 'Site Sewer / Drainage Connection Approval', type: 'document' },
  { id: 're-establishment-survey', name: 'Re-establishment Survey Plan (Feature & Level)', type: 'drawing' },

  // 3. Architectural & Design Drawings
  { id: 'arch-plans', name: 'Architectural Plans (Working Drawings – Site, Floor, Elevations, Sections, Roof Plan)', type: 'drawing' },
  { id: 'design-plans', name: 'Design Plans & Details (Architectural Set)', type: 'drawing' },
  { id: 'ld-planning', name: 'LD Planning & Basic Property Reports', type: 'report' },
  { id: '3d-design', name: '3D / Rendered Design Package (if applicable)', type: 'drawing' },
  { id: 'landscape-design', name: 'Landscape Detail Design Package', type: 'drawing' },
  { id: 'window-schedule', name: 'Skylight / Window / Door Schedule', type: 'specification' },
  { id: 'nathers-drawings', name: 'Nathers Energy Drawings (Stamped)', type: 'drawing' },
  { id: 'form-18', name: 'Form 18 – Partial Compliance (Energy Efficiency)', type: 'document' },
  { id: 'sec-10-app', name: 'Section 10 Application (BCA / NCC Compliance)', type: 'document' },
  { id: 'sec-10-det', name: 'Section 10 Determination (Pre-May 2023 NCC)', type: 'document' },
  { id: 'spec-book', name: 'Specification Book / Building Notes', type: 'specification' },
  { id: 'site-signage', name: 'Site Signage & Project Sign Plan', type: 'drawing' },

  // 4. Product Certifications & Technical Data
  { id: 'codemarks', name: 'Manufacturer Codemarks & Product Certificates (e.g., Axon, Knauf, Skylight, Cladding Systems)', type: 'specification' },
  { id: 'installation-manuals', name: 'Installation Manuals & Technical Datasheets', type: 'specification' },
  { id: 'warranty-certs', name: 'Warranty Certificates (Cladding, Roofing, Windows, etc.)', type: 'document' },
  { id: 'bal-report', name: 'Bushfire Attack Level (BAL) Report (if applicable)', type: 'report' },
  { id: 'acoustic-report', name: 'Acoustic Report / Engineer\'s Certification (if required)', type: 'report' },

  // 5. Protection & Inspection Reports
  { id: 'protection-forms', name: 'Protection Work Forms (6, 7, 8)', type: 'document' },
  { id: 'protection-insurance', name: 'Protection Work Insurance Certificate', type: 'document' },
  { id: 'dilapidation', name: 'Dilapidation Reports (Pre- and Post-Construction)', type: 'report' },
  { id: 'inspection-reports', name: 'Inspection Reports (e.g., Bored Piers, Frame, Slab, etc.)', type: 'report' },
  { id: 'surveyor-inspections', name: 'Building Surveyor Inspection Requirements & Sign-Offs', type: 'document' },
  { id: 'safety-signage', name: 'Site Safety Signage Documentation', type: 'document' },

  // 6. Compliance & Authority Approvals
  { id: 'building-permit', name: 'Building Permit (Stamped & Signed)', type: 'document' },
  { id: 'planning-permit', name: 'Planning Permit (if applicable)', type: 'document' },
  { id: 'energy-compliance', name: 'Energy Efficiency Compliance Certificates', type: 'document' },
  { id: 'drainage-cert', name: 'Drainage Certificate of Compliance', type: 'document' },
  { id: 'structural-cert', name: 'Structural Certificate of Compliance (Reg 126)', type: 'document' },
  { id: 'stormwater-cert', name: 'Stormwater Certificate of Compliance', type: 'document' },
  { id: 'consent-report', name: 'Consent & Report (if required by adjoining properties or authorities)', type: 'report' },
  { id: 'melbourne-water', name: 'Melbourne Water / Council Approval Letters', type: 'document' },
  { id: 'performance-reports', name: 'Performance Solution Reports (Reg 38 / Reg 233)', type: 'report' },

  // 7. Optional / Project-Specific Documents
  { id: 'construction-mgmt', name: 'Construction Management Plan', type: 'document' },
  { id: 'environmental-plan', name: 'Environmental / Waste Management Plan', type: 'document' },
  { id: 'traffic-mgmt', name: 'Traffic Management Plan', type: 'document' },
  { id: 'site-signoff', name: 'Site Sign-Off Documents', type: 'document' },
  { id: 'as-built', name: 'As-Built Drawings (post-construction)', type: 'drawing' },
  { id: 'occupancy-permit', name: 'Occupancy Permit or Certificate of Final Inspection', type: 'document' },
];
interface ProjectDocsPageProps {
  onNavigate: (page: string) => void;
}
export const ProjectDocsPage = ({
  onNavigate
}: ProjectDocsPageProps) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const tabParam = searchParams.get('tab') || 'files';
  const defaultTab = (['files', 'links'] as const).includes(tabParam as any) ? tabParam as any : 'files';
  const {
    getProject
  } = useProjects();
  const [project, setProject] = useState<Project | null>(null);

  // Project links management
  const {
    links,
    loading: linksLoading,
    createLink,
    updateLink,
    deleteLink
  } = useProjectLinks(projectId || undefined);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkDialogMode, setLinkDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedLink, setSelectedLink] = useState<ProjectLink | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<ProjectLink | undefined>();

  // Project documents management
  const {
    documents,
    loading: documentsLoading,
    deleteDocument,
    formatFileSize,
    refetch: refetchDocuments,
  } = useProjectDocuments(projectId || undefined);
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
  const getFileIcon = (contentType: string | null) => {
    if (!contentType) return <FileText className="w-5 h-5 text-muted-foreground/60" />;
    
    if (contentType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (contentType.includes('image')) return <FileText className="w-5 h-5 text-blue-500" />;
    if (contentType.includes('word') || contentType.includes('document')) return <FileText className="w-5 h-5 text-blue-600" />;
    if (contentType.includes('excel') || contentType.includes('spreadsheet')) return <FileText className="w-5 h-5 text-green-600" />;
    
    return <FileText className="w-5 h-5 text-muted-foreground/60" />;
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    window.open(fileUrl, '_blank');
  };
  const handleAddLink = () => {
    setLinkDialogMode('create');
    setSelectedLink(undefined);
    setLinkDialogOpen(true);
  };
  const handleEditLink = (link: ProjectLink) => {
    setLinkDialogMode('edit');
    setSelectedLink(link);
    setLinkDialogOpen(true);
  };
  const handleDeleteLink = (link: ProjectLink) => {
    setLinkToDelete(link);
    setDeleteDialogOpen(true);
  };
  const confirmDeleteLink = async () => {
    if (linkToDelete) {
      await deleteLink(linkToDelete.id);
      setDeleteDialogOpen(false);
      setLinkToDelete(undefined);
    }
  };
  const handleLinkSubmit = async (data: any) => {
    if (linkDialogMode === 'create') {
      await createLink(data);
    } else if (selectedLink) {
      await updateLink(selectedLink.id, data);
    }
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  if (!project) {
    return <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The requested project could not be found.</p>
          <Button onClick={() => onNavigate('projects')}>Back to Projects</Button>
        </div>
      </div>;
  }
  return <div className="flex bg-background min-h-screen">
      {/* Fixed Project Sidebar */}
      <div className="fixed left-0 top-0 h-full w-40 z-40">
        <ProjectSidebar project={project} onNavigate={onNavigate} getStatusColor={getStatusColor} getStatusText={getStatusText} activeSection="docs" />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-40 bg-background">
        {/* Header Section */}
        <ProjectPageHeader 
          projectName={project.name}
          pageTitle="Project Documents"
          onNavigate={onNavigate}
        />
        
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
                      <TabsTrigger value="files" className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground">
                        <FileText className="h-4 w-4" />
                        <span>Files</span>
                      </TabsTrigger>
                      <TabsTrigger value="links" className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground">
                        <Link className="h-4 w-4" />
                        <span>Links</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Right side - Action buttons */}
                  <div className="flex items-center gap-4">
                    <Button onClick={() => {
                    if (defaultTab === 'links') {
                      handleAddLink();
                    } else {
                      // TODO: Handle file upload when implemented
                      console.log('File upload not implemented yet');
                    }
                  }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add New
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                <TabsContent value="files" className="space-y-0 mt-0">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-semibold text-foreground">Project Files</h3>
                  </div>
                  
                  {documentsLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading files...</div>
                  ) : (
                    <div className="space-y-0.5">
                      {documentCategories.map((category) => {
                        const categoryDocs = documents.filter(doc => 
                          doc.document_type === category.type
                        );
                        
                        return (
                          <div
                            key={category.id}
                            className="group flex items-center justify-between px-4 py-2 hover:bg-accent/30 transition-colors border-b border-border/20 last:border-b-0"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="flex-shrink-0">
                                <FileText className="w-4 h-4 text-muted-foreground/50" />
                              </div>
                              <span className="font-medium text-sm text-foreground truncate">{category.name}</span>
                            </div>
                            
                            <div className="flex items-center gap-4 flex-shrink-0">
                              <span className="text-xs text-muted-foreground/70 min-w-[100px] text-right">
                                {categoryDocs.length === 0 
                                  ? 'No files uploaded' 
                                  : `${categoryDocs.length} file${categoryDocs.length > 1 ? 's' : ''}`}
                              </span>
                              {projectId && (
                                <DocumentUpload 
                                  projectId={projectId} 
                                  onUploadComplete={refetchDocuments}
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="links" className="space-y-4 mt-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Project Links</h3>
                    <Button onClick={handleAddLink}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Link
                    </Button>
                  </div>
                  
                  {linksLoading ? <div className="text-center py-8">Loading links...</div> : links.length === 0 ? <div className="text-center py-8 text-muted-foreground">
                      No links added yet. Click "Add Link" to get started.
                    </div> : <div className="space-y-2">
                      {links.map(link => <div key={link.id} className="group flex items-center justify-between p-3 rounded-lg border border-border/40 hover:border-border hover:bg-accent/20 transition-all duration-200">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-2 h-2 rounded-full bg-primary/60 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-foreground truncate">{link.title}</h4>
                                <span className="text-xs text-muted-foreground/70 bg-muted/30 px-2 py-0.5 rounded-full flex-shrink-0">
                                  {link.category}
                                </span>
                              </div>
                              {link.description && <p className="text-sm text-muted-foreground/80 truncate">{link.description}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10" onClick={() => window.open(link.url, '_blank')} title="Open link">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10" onClick={() => handleEditLink(link)} title="Edit link">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDeleteLink(link)} title="Delete link">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>)}
                    </div>}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Link Dialog */}
      {projectId && <ProjectLinkDialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen} onSubmit={handleLinkSubmit} link={selectedLink} projectId={projectId} mode={linkDialogMode} />}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{linkToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteLink}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
};