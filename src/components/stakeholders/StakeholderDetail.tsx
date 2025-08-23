import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft,
  Edit,
  MapPin,
  Phone,
  Mail,
  Globe,
  FileText,
  Calendar,
  Users,
  Building2,
  Wrench,
  Truck,
  Lightbulb,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StakeholderDetailProps {
  stakeholderId: string;
  onBack: () => void;
}

interface Stakeholder {
  id: string;
  display_name: string;
  category: string;
  trade_industry?: string;
  primary_contact_name?: string;
  primary_email?: string;
  primary_phone?: string;
  abn?: string;
  status: string;
  compliance_status: string;
  tags: string[];
  notes?: string;
  website?: string;
  created_at: string;
}

interface Contact {
  id: string;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  is_preferred: boolean;
  is_primary: boolean;
}

interface Address {
  id: string;
  type: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_primary: boolean;
}

interface Document {
  id: string;
  document_name: string;
  document_type: string;
  expiry_date?: string;
  status: string;
}

interface Activity {
  id: string;
  activity_type: string;
  title: string;
  description?: string;
  activity_date: string;
  created_by: string;
}

interface ProjectRole {
  id: string;
  role: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  project: {
    id: string;
    name: string;
    status: string;
  };
}

const CATEGORY_ICONS = {
  client: Users,
  trade: Wrench,
  subcontractor: Building2,
  supplier: Truck,
  consultant: Lightbulb,
};

export const StakeholderDetail: React.FC<StakeholderDetailProps> = ({
  stakeholderId,
  onBack,
}) => {
  const [stakeholder, setStakeholder] = useState<Stakeholder | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [projectRoles, setProjectRoles] = useState<ProjectRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStakeholderData();
  }, [stakeholderId]);

  const fetchStakeholderData = async () => {
    try {
      setLoading(true);

      // Fetch main stakeholder data
      const { data: stakeholderData, error: stakeholderError } = await supabase
        .from('stakeholders')
        .select('*')
        .eq('id', stakeholderId)
        .single();

      if (stakeholderError) throw stakeholderError;

      setStakeholder(stakeholderData);

      // Fetch contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('stakeholder_contacts')
        .select('*')
        .eq('stakeholder_id', stakeholderId)
        .order('is_primary', { ascending: false });

      if (contactsError) throw contactsError;
      setContacts(contactsData || []);

      // Fetch addresses
      const { data: addressesData, error: addressesError } = await supabase
        .from('stakeholder_addresses')
        .select('*')
        .eq('stakeholder_id', stakeholderId)
        .order('is_primary', { ascending: false });

      if (addressesError) throw addressesError;
      setAddresses(addressesData || []);

      // Fetch documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('stakeholder_documents')
        .select('*')
        .eq('stakeholder_id', stakeholderId)
        .order('created_at', { ascending: false });

      if (documentsError) throw documentsError;
      setDocuments(documentsData || []);

      // Fetch activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('stakeholder_activities')
        .select('*')
        .eq('stakeholder_id', stakeholderId)
        .order('activity_date', { ascending: false });

      if (activitiesError) throw activitiesError;
      setActivities(activitiesData || []);

      // Fetch project roles
      const { data: projectRolesData, error: projectRolesError } = await supabase
        .from('stakeholder_project_roles')
        .select(`
          *,
          projects:project_id (
            id,
            name,
            status
          )
        `)
        .eq('stakeholder_id', stakeholderId)
        .order('is_active', { ascending: false });

      if (projectRolesError) throw projectRolesError;
      
      // Map the data to match our interface
      const mappedProjectRoles = projectRolesData?.map(role => ({
        ...role,
        project: role.projects
      })) || [];
      
      setProjectRoles(mappedProjectRoles);

    } catch (error) {
      console.error('Error fetching stakeholder data:', error);
      toast.error('Failed to load stakeholder details');
    } finally {
      setLoading(false);
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'expiring': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          Loading stakeholder details...
        </div>
      </div>
    );
  }

  if (!stakeholder) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          Stakeholder not found
        </div>
      </div>
    );
  }

  const CategoryIcon = CATEGORY_ICONS[stakeholder.category as keyof typeof CATEGORY_ICONS] || Users;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <CategoryIcon className="h-6 w-6 text-muted-foreground" />
            <div>
              <h1 className="text-2xl font-semibold">{stakeholder.display_name}</h1>
              <p className="text-muted-foreground capitalize">
                {stakeholder.category} - {stakeholder.trade_industry}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={getComplianceColor(stakeholder.compliance_status)}
          >
            {stakeholder.compliance_status}
          </Badge>
          <Badge variant={stakeholder.status === 'active' ? 'default' : 'secondary'}>
            {stakeholder.status}
          </Badge>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p>{stakeholder.display_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <p className="capitalize">{stakeholder.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Trade/Industry</label>
                  <p>{stakeholder.trade_industry || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ABN</label>
                  <p>{stakeholder.abn || '-'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Primary Contact</label>
                  <p>{stakeholder.primary_contact_name || '-'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p>{stakeholder.primary_email || '-'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p>{stakeholder.primary_phone || '-'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <p>{stakeholder.website || '-'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tags */}
          {stakeholder.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {stakeholder.tags.map(tag => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {stakeholder.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{stakeholder.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Contacts</CardTitle>
              <Button size="sm">
                <Users className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contacts.map(contact => (
                  <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{contact.name}</span>
                        {contact.is_primary && (
                          <Badge variant="default" className="text-xs">Primary</Badge>
                        )}
                        {contact.is_preferred && (
                          <Badge variant="secondary" className="text-xs">Preferred</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{contact.title}</p>
                      <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                        {contact.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {contact.email}
                          </span>
                        )}
                        {contact.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {contact.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Set Preferred
                    </Button>
                  </div>
                ))}
                {contacts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No contacts found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Addresses Tab */}
        <TabsContent value="addresses" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Addresses</CardTitle>
              <Button size="sm">
                <MapPin className="h-4 w-4 mr-2" />
                Add Address
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {addresses.map(address => (
                  <div key={address.id} className="flex items-start justify-between p-3 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium capitalize">{address.type.replace('_', ' ')}</span>
                        {address.is_primary && (
                          <Badge variant="default" className="text-xs">Primary</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>{address.address_line_1}</p>
                        {address.address_line_2 && <p>{address.address_line_2}</p>}
                        <p>{address.city}, {address.state} {address.postal_code}</p>
                        <p>{address.country}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Map
                    </Button>
                  </div>
                ))}
                {addresses.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No addresses found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Project Roles</CardTitle>
              <Button size="sm">
                <Building2 className="h-4 w-4 mr-2" />
                Add to Project
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projectRoles.map(role => (
                  <div key={role.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{role.project?.name}</span>
                        <Badge variant={role.is_active ? 'default' : 'secondary'}>
                          {role.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground capitalize">
                        {role.role} • {role.project?.status}
                      </p>
                      <div className="text-xs text-muted-foreground mt-1">
                        {role.start_date && `Started: ${new Date(role.start_date).toLocaleDateString()}`}
                        {role.end_date && ` • Ended: ${new Date(role.end_date).toLocaleDateString()}`}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Project
                    </Button>
                  </div>
                ))}
                {projectRoles.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No project roles found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Compliance Documents</CardTitle>
              <Button size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.map(document => (
                  <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{document.document_name}</span>
                        <Badge
                          variant="outline"
                          className={getComplianceColor(document.status)}
                        >
                          {document.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground capitalize">
                        {document.document_type}
                        {document.expiry_date && (
                          <span> • Expires: {new Date(document.expiry_date).toLocaleDateString()}</span>
                        )}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                ))}
                {documents.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No documents found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Button size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Add Activity
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.map(activity => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{activity.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.activity_date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground capitalize mb-1">
                        {activity.activity_type}
                      </p>
                      {activity.description && (
                        <p className="text-sm">{activity.description}</p>
                      )}
                    </div>
                  </div>
                ))}
                {activities.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No activities found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};