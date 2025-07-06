import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Lead } from '@/hooks/useLeads';
import { 
  X,
  Save,
  Phone,
  Mail,
  MapPin,
  Building2,
  Calendar,
  DollarSign,
  User,
  FileText,
  MessageSquare,
  Clock,
  TrendingUp,
  Edit3
} from 'lucide-react';

interface LeadDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onSave: (updatedLead: Lead) => void;
}

export const LeadDetailsModal = ({ isOpen, onClose, lead, onSave }: LeadDetailsModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    company: lead.company,
    contact: lead.contact_name,
    description: lead.description || '',
    value: Number(lead.value),
    priority: lead.priority,
    source: lead.source,
    email: lead.contact_email || '',
    phone: lead.contact_phone || '',
    address: lead.location || '',
    website: lead.website || '',
    notes: lead.notes || '',
  });

  const handleSave = () => {
    onSave({ ...lead, ...formData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      company: lead.company,
      contact: lead.contact_name,
      description: lead.description || '',
      value: Number(lead.value),
      priority: lead.priority,
      source: lead.source,
      email: lead.contact_email || '',
      phone: lead.contact_phone || '',
      address: lead.location || '',
      website: lead.website || '',
      notes: lead.notes || '',
    });
    setIsEditing(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'Medium': return 'bg-orange-500/20 text-orange-700 border-orange-500/30';
      case 'Low': return 'bg-green-500/20 text-green-700 border-green-500/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const activities = [
    {
      id: '1',
      type: 'Email',
      description: 'Sent initial proposal',
      date: '2 days ago',
      user: 'Sarah Wilson'
    },
    {
      id: '2',
      type: 'Call',
      description: 'Discovery call completed',
      date: '1 week ago',
      user: 'Mike Johnson'
    },
    {
      id: '3',
      type: 'Meeting',
      description: 'Initial consultation scheduled',
      date: '2 weeks ago',
      user: 'Sarah Wilson'
    }
  ];

  const tasks = [
    {
      id: '1',
      title: 'Follow up on proposal',
      dueDate: 'Today',
      priority: 'High',
      assignee: 'Sarah Wilson'
    },
    {
      id: '2',
      title: 'Schedule demo call',
      dueDate: 'Tomorrow',
      priority: 'Medium',
      assignee: 'Mike Johnson'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0 glass-card">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={lead.avatar_url || ''} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-poppins">
                  {lead.contact_name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl font-bold text-foreground font-poppins">
                  {formData.company}
                </DialogTitle>
                <p className="text-muted-foreground font-inter">{formData.contact}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getPriorityColor(formData.priority)}>
                    {formData.priority} Priority
                  </Badge>
                  <Badge variant="outline" className="font-inter">
                    {lead.stage}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline" className="font-inter">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button onClick={handleSave} className="font-inter">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={handleCancel} variant="outline" className="font-inter">
                    Cancel
                  </Button>
                </>
              )}
              <Button onClick={onClose} variant="ghost" size="sm" className="h-8 w-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="overview" className="font-inter">Overview</TabsTrigger>
              <TabsTrigger value="contact" className="font-inter">Contact Info</TabsTrigger>
              <TabsTrigger value="activity" className="font-inter">Activity</TabsTrigger>
              <TabsTrigger value="tasks" className="font-inter">Tasks</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lead Summary */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="text-foreground font-poppins">Lead Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="font-inter">Description</Label>
                        {isEditing ? (
                          <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="mt-1 font-inter"
                            rows={3}
                          />
                        ) : (
                          <p className="text-muted-foreground mt-1 font-inter">{formData.description}</p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="font-inter">Lead Value</Label>
                          {isEditing ? (
                            <Input
                              type="number"
                              value={formData.value}
                              onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) })}
                              className="mt-1 font-inter"
                            />
                          ) : (
                            <p className="text-2xl font-bold text-primary mt-1 font-poppins">
                              ${formData.value.toLocaleString()}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <Label className="font-inter">Priority</Label>
                          {isEditing ? (
                            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as any })}>
                              <SelectTrigger className="mt-1 font-inter">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="High">High</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge className={`${getPriorityColor(formData.priority)} mt-1`}>
                              {formData.priority}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className="font-inter">Lead Source</Label>
                        {isEditing ? (
                          <Input
                            value={formData.source}
                            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                            className="mt-1 font-inter"
                          />
                        ) : (
                          <p className="text-muted-foreground mt-1 font-inter">{formData.source}</p>
                        )}
                      </div>

                      <div>
                        <Label className="font-inter">Notes</Label>
                        {isEditing ? (
                          <Textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="mt-1 font-inter"
                            rows={4}
                          />
                        ) : (
                          <p className="text-muted-foreground mt-1 font-inter">{formData.notes}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="text-foreground font-poppins">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full justify-start font-inter" variant="outline">
                        <Phone className="w-4 h-4 mr-2" />
                        Call Contact
                      </Button>
                      <Button className="w-full justify-start font-inter" variant="outline">
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </Button>
                      <Button className="w-full justify-start font-inter" variant="outline">
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Meeting
                      </Button>
                      <Button className="w-full justify-start font-inter" variant="outline">
                        <FileText className="w-4 h-4 mr-2" />
                        Send Proposal
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="text-foreground font-poppins">Lead Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-inter">Last Activity</span>
                        <span className="font-medium font-inter">{lead.last_activity}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-inter">Created</span>
                        <span className="font-medium font-inter">2 weeks ago</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-inter">Stage Duration</span>
                        <span className="font-medium font-inter">5 days</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-foreground font-poppins">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="font-inter">Contact Name</Label>
                        {isEditing ? (
                          <Input
                            value={formData.contact}
                            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                            className="mt-1 font-inter"
                          />
                        ) : (
                          <p className="text-muted-foreground mt-1 font-inter">{formData.contact}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label className="font-inter">Company</Label>
                        {isEditing ? (
                          <Input
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="mt-1 font-inter"
                          />
                        ) : (
                          <p className="text-muted-foreground mt-1 font-inter">{formData.company}</p>
                        )}
                      </div>

                      <div>
                        <Label className="font-inter">Email</Label>
                        {isEditing ? (
                          <Input
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="mt-1 font-inter"
                          />
                        ) : (
                          <div className="flex items-center gap-2 mt-1">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <p className="text-muted-foreground font-inter">{formData.email}</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <Label className="font-inter">Phone</Label>
                        {isEditing ? (
                          <Input
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="mt-1 font-inter"
                          />
                        ) : (
                          <div className="flex items-center gap-2 mt-1">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <p className="text-muted-foreground font-inter">{formData.phone}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="font-inter">Address</Label>
                        {isEditing ? (
                          <Textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="mt-1 font-inter"
                            rows={3}
                          />
                        ) : (
                          <div className="flex items-start gap-2 mt-1">
                            <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                            <p className="text-muted-foreground font-inter">{formData.address}</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <Label className="font-inter">Website</Label>
                        {isEditing ? (
                          <Input
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            className="mt-1 font-inter"
                          />
                        ) : (
                          <div className="flex items-center gap-2 mt-1">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            <p className="text-muted-foreground font-inter">{formData.website}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-foreground font-poppins">Recent Activity</CardTitle>
                  <CardDescription className="font-inter">All interactions with this lead</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4 p-4 border border-border rounded-lg">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          {activity.type === 'Email' && <Mail className="w-4 h-4 text-primary" />}
                          {activity.type === 'Call' && <Phone className="w-4 h-4 text-primary" />}
                          {activity.type === 'Meeting' && <Calendar className="w-4 h-4 text-primary" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-foreground font-inter">{activity.type}</h4>
                            <span className="text-sm text-muted-foreground font-inter">{activity.date}</span>
                          </div>
                          <p className="text-muted-foreground font-inter">{activity.description}</p>
                          <p className="text-sm text-muted-foreground font-inter">by {activity.user}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks">
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-foreground font-poppins">Tasks & Follow-ups</CardTitle>
                      <CardDescription className="font-inter">Pending tasks for this lead</CardDescription>
                    </div>
                    <Button className="font-inter">
                      <Calendar className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" className="rounded" />
                          <div>
                            <h4 className="font-medium text-foreground font-inter">{task.title}</h4>
                            <p className="text-sm text-muted-foreground font-inter">
                              Assigned to {task.assignee} • Due {task.dueDate}
                            </p>
                          </div>
                        </div>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};