import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeadDetailsModal } from './LeadDetailsModal';
import { useLeads, Lead } from '@/hooks/useLeads';
import { 
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Users,
  Building2,
  DollarSign,
  Clock,
  Calendar,
  Phone,
  Mail,
  Loader2
} from 'lucide-react';

interface Opportunity {
  id: string;
  company: string;
  contact: string;
  avatar: string;
  description: string;
  value: number;
  priority: 'High' | 'Medium' | 'Low';
  source: string;
  lastActivity: string;
}

interface OpportunityWithStage extends Opportunity {
  stage: string;
}

interface Stage {
  id: string;
  name: string;
  color: string;
  count: number;
  totalValue: number;
  opportunities: Opportunity[];
}

export const SalesDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { leads, leadsByStage, isLoading, error, updateLead } = useLeads();

  const stageConfig = [
    { id: 'Lead', name: 'Lead', color: 'bg-blue-500' },
    { id: 'Contacted', name: 'Contacted', color: 'bg-orange-500' },
    { id: 'Qualified', name: 'Qualified', color: 'bg-purple-500' },
    { id: 'Proposal made', name: 'Proposal made', color: 'bg-yellow-500' },
    { id: 'Won', name: 'Won', color: 'bg-green-500' },
    { id: 'Lost', name: 'Lost', color: 'bg-red-500' }
  ];

  // Calculate stats from real data
  const totalOpportunities = leads.length;
  const totalValue = leads.reduce((sum, lead) => sum + Number(lead.value), 0);
  const activeLeads = leadsByStage['Lead']?.length || 0;
  const wonThisMonth = leadsByStage['Won']?.length || 0;

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleSaveLead = async (updatedLead: Lead) => {
    await updateLead(updatedLead.id, updatedLead);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'Medium': return 'bg-orange-500/20 text-orange-700 border-orange-500/30';
      case 'Low': return 'bg-green-500/20 text-green-700 border-green-500/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground font-inter">Loading leads...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive font-inter">Error loading leads: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground font-inter">Total Opportunities</p>
                <p className="text-2xl font-bold text-foreground font-poppins">{totalOpportunities}</p>
              </div>
              <Building2 className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground font-inter">Pipeline Value</p>
                <p className="text-2xl font-bold text-foreground font-poppins">${totalValue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground font-inter">Active Leads</p>
                <p className="text-2xl font-bold text-foreground font-poppins">{activeLeads}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground font-inter">Won This Month</p>
                <p className="text-2xl font-bold text-foreground font-poppins">{wonThisMonth}</p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-card border-border w-64 font-inter"
            />
          </div>
          <Select>
            <SelectTrigger className="w-40 glass-card border-border font-inter">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent className="glass-card border-border">
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="social">Social Media</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-inter">
          <Plus className="w-4 h-4 mr-2" />
          Create Opportunity
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-6 min-w-max pb-6">
          {stageConfig.map((stage) => {
            const stageLeads = leadsByStage[stage.id] || [];
            const stageValue = stageLeads.reduce((sum, lead) => sum + Number(lead.value), 0);
            
            return (
              <div key={stage.id} className="flex-shrink-0 w-80">
                <Card className="glass-card h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                        <CardTitle className="text-sm font-semibold text-foreground font-inter">
                          {stage.name}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                          {stageLeads.length}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${stageValue.toLocaleString()}
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-3 pt-0">
                    {stageLeads.map((lead) => (
                      <Card 
                        key={lead.id} 
                        className="glass-card hover:glass-hover transition-colors cursor-pointer"
                        onClick={() => handleLeadClick(lead)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={lead.avatar_url || ''} />
                                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                    {lead.contact_name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-semibold text-sm text-foreground font-poppins">{lead.company}</h4>
                                  <p className="text-xs text-muted-foreground font-inter">{lead.contact_name}</p>
                                </div>
                              </div>
                              <Badge variant="outline" className={`text-xs ${getPriorityColor(lead.priority)}`}>
                                {lead.priority}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground font-inter">{lead.description}</p>
                            
                            <div className="flex items-center justify-between">
                              <div className="text-lg font-bold text-primary font-poppins">
                                ${Number(lead.value).toLocaleString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-muted">
                                  <Phone className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-muted">
                                  <Mail className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground font-inter">
                              <span>{lead.source}</span>
                              <span>{lead.last_activity}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    <Button 
                      variant="ghost" 
                      className="w-full justify-center glass-card border-dashed hover:bg-muted font-inter"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Opportunity
                    </Button>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lead Details Modal */}
      {selectedLead && (
        <LeadDetailsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedLead(null);
          }}
          lead={selectedLead}
          onSave={handleSaveLead}
        />
      )}
    </div>
  );
};