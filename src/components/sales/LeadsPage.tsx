import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search,
  Plus,
  MoreHorizontal,
  Phone,
  Mail,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Filter,
  Download,
  User
} from 'lucide-react';

export const LeadsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const leads = [
    {
      id: 1,
      name: "Sarah Johnson",
      company: "Tech Innovations Ltd",
      email: "sarah@techinnovations.com",
      phone: "+61 412 345 678",
      location: "Melbourne, VIC",
      value: 180000,
      status: "New",
      source: "Website",
      lastContact: "2024-11-13",
      assignedTo: "John Smith"
    },
    {
      id: 2,
      name: "Michael Chen",
      company: "Urban Developments",
      email: "michael@urbandev.com",
      phone: "+61 423 456 789",
      location: "Sydney, NSW",
      value: 350000,
      status: "Contacted",
      source: "Referral",
      lastContact: "2024-11-10",
      assignedTo: "Jane Doe"
    },
    {
      id: 3,
      name: "Emma Williams",
      company: "Green Living Spaces",
      email: "emma@greenliving.com",
      phone: "+61 434 567 890",
      location: "Brisbane, QLD",
      value: 220000,
      status: "Qualified",
      source: "Social Media",
      lastContact: "2024-11-08",
      assignedTo: "John Smith"
    },
    {
      id: 4,
      name: "James Thompson",
      company: "Modern Build Co",
      email: "james@modernbuild.com",
      phone: "+61 445 678 901",
      location: "Perth, WA",
      value: 420000,
      status: "Proposal Sent",
      source: "LinkedIn",
      lastContact: "2024-11-12",
      assignedTo: "Jane Doe"
    },
    {
      id: 5,
      name: "Olivia Martinez",
      company: "Sustainable Homes",
      email: "olivia@sustainhomes.com",
      phone: "+61 456 789 012",
      location: "Adelaide, SA",
      value: 295000,
      status: "Negotiation",
      source: "Trade Show",
      lastContact: "2024-11-14",
      assignedTo: "John Smith"
    },
    {
      id: 6,
      name: "David Park",
      company: "Elite Properties",
      email: "david@eliteprops.com",
      phone: "+61 467 890 123",
      location: "Gold Coast, QLD",
      value: 510000,
      status: "Qualified",
      source: "Website",
      lastContact: "2024-11-09",
      assignedTo: "Jane Doe"
    },
    {
      id: 7,
      name: "Sophie Anderson",
      company: "Coastal Construction",
      email: "sophie@coastal.com",
      phone: "+61 478 901 234",
      location: "Newcastle, NSW",
      value: 175000,
      status: "New",
      source: "Email Campaign",
      lastContact: "2024-11-15",
      assignedTo: "John Smith"
    },
    {
      id: 8,
      name: "Ryan Foster",
      company: "Heritage Builders",
      email: "ryan@heritage.com",
      phone: "+61 489 012 345",
      location: "Hobart, TAS",
      value: 380000,
      status: "Contacted",
      source: "Google Ads",
      lastContact: "2024-11-11",
      assignedTo: "Jane Doe"
    }
  ];

  const stats = [
    { label: "Total Leads", value: "247", change: "+12%", color: "text-primary" },
    { label: "Qualified", value: "89", change: "+8%", color: "text-emerald-600" },
    { label: "In Negotiation", value: "34", change: "+15%", color: "text-amber-600" },
    { label: "Closed Won", value: "23", change: "+23%", color: "text-emerald-600" }
  ];

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'New': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      'Contacted': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      'Qualified': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      'Proposal Sent': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      'Negotiation': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    };
    return statusColors[status] || 'bg-muted text-muted-foreground';
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-playfair">Leads</h1>
          <p className="text-muted-foreground mt-1">Manage and track your sales pipeline</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="glass-card p-6 rounded-2xl border border-border/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                {stat.change}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="glass-card p-6 rounded-2xl border border-border/30">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search leads by name, company, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/60 border-border/30"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-background/60 border-border/30">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Contacted">Contacted</SelectItem>
                <SelectItem value="Qualified">Qualified</SelectItem>
                <SelectItem value="Proposal Sent">Proposal Sent</SelectItem>
                <SelectItem value="Negotiation">Negotiation</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="glass-card rounded-2xl border border-border/30 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/30">
              <TableHead className="font-semibold text-foreground">Lead Name</TableHead>
              <TableHead className="font-semibold text-foreground">Company</TableHead>
              <TableHead className="font-semibold text-foreground">Contact</TableHead>
              <TableHead className="font-semibold text-foreground">Location</TableHead>
              <TableHead className="font-semibold text-foreground">Value</TableHead>
              <TableHead className="font-semibold text-foreground">Status</TableHead>
              <TableHead className="font-semibold text-foreground">Owner</TableHead>
              <TableHead className="font-semibold text-foreground"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.map((lead) => (
              <TableRow 
                key={lead.id} 
                className="hover:bg-accent/30 transition-colors border-b border-border/30"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{lead.name}</div>
                      <div className="text-xs text-muted-foreground">{lead.source}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span>{lead.company}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span>{lead.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      <span>{lead.phone}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{lead.location}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 font-semibold text-foreground">
                    <DollarSign className="w-4 h-4" />
                    {(lead.value / 1000).toFixed(0)}K
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${getStatusBadge(lead.status)} border`}>
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">{lead.assignedTo}</div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Send Email</DropdownMenuItem>
                      <DropdownMenuItem>Schedule Call</DropdownMenuItem>
                      <DropdownMenuItem>Convert to Project</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Delete Lead</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>Showing {filteredLeads.length} of {leads.length} leads</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
};
