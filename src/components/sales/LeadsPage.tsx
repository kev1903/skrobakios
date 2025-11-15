import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Phone, 
  Mail,
  MapPin,
  TrendingUp,
  Target,
  DollarSign,
  Calendar
} from 'lucide-react';

export const LeadsPage = () => {
  const stats = [
    { number: "124", label: "Active Leads", icon: Users, color: "text-primary" },
    { number: "45", label: "This Month", icon: TrendingUp, color: "text-emerald-500" },
    { number: "$2.4M", label: "Pipeline Value", icon: DollarSign, color: "text-amber-500" },
    { number: "89%", label: "Conversion Rate", icon: Target, color: "text-primary" }
  ];

  const leadCategories = [
    { name: "Hot Leads", count: 28, icon: TrendingUp, description: "Ready to close" },
    { name: "Warm Leads", count: 56, icon: Phone, description: "In discussion" },
    { name: "Cold Leads", count: 40, icon: Mail, description: "Initial contact" },
    { name: "Follow Up", count: 32, icon: Calendar, description: "Needs attention" }
  ];

  const recentLeads = [
    {
      name: "Sarah Johnson",
      company: "Tech Innovations Ltd",
      email: "sarah@techinnovations.com",
      phone: "+61 412 345 678",
      location: "Melbourne, VIC",
      value: "$180,000",
      status: "Hot",
      source: "Website Inquiry",
      date: "2 days ago"
    },
    {
      name: "Michael Chen",
      company: "Urban Developments",
      email: "michael@urbandev.com",
      phone: "+61 423 456 789",
      location: "Sydney, NSW",
      value: "$350,000",
      status: "Warm",
      source: "Referral",
      date: "5 days ago"
    },
    {
      name: "Emma Williams",
      company: "Green Living Spaces",
      email: "emma@greenliving.com",
      phone: "+61 434 567 890",
      location: "Brisbane, QLD",
      value: "$220,000",
      status: "Hot",
      source: "Social Media",
      date: "1 week ago"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hot': return 'bg-red-500/20 text-red-600 border-red-500/30';
      case 'Warm': return 'bg-amber-500/20 text-amber-600 border-amber-500/30';
      case 'Cold': return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
      default: return 'bg-muted/20 text-muted-foreground border-border';
    }
  };

  return (
    <div className="min-h-full">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-3 font-playfair">
            Lead <span className="text-primary">Contacts</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Track and manage your sales prospects efficiently. Convert leads into loyal clients with our comprehensive contact management system.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <div key={idx} className="glass-card p-6 text-center hover:shadow-lg transition-shadow">
              <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-4`} />
              <div className="text-3xl font-bold text-foreground mb-2">{stat.number}</div>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Lead Categories */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
          Lead Categories
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          {leadCategories.map((category, idx) => (
            <Card key={idx} className="glass-card hover:shadow-lg transition-all hover:scale-[1.02]">
              <CardContent className="p-6 text-center">
                <category.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                <div className="text-2xl font-bold text-foreground mb-2">{category.count}</div>
                <h3 className="font-medium text-foreground mb-1">{category.name}</h3>
                <p className="text-muted-foreground text-sm">{category.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent Leads */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Recent Leads
          </h2>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Users className="w-4 h-4 mr-2" />
            Add New Lead
          </Button>
        </div>

        <div className="grid gap-6">
          {recentLeads.map((lead, idx) => (
            <Card key={idx} className="glass-card hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">{lead.name}</h3>
                        <p className="text-muted-foreground text-sm">{lead.company}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={`${getStatusColor(lead.status)} border`}>
                          {lead.status} Lead
                        </Badge>
                        <span className="text-xl font-bold text-primary">{lead.value}</span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4 text-primary" />
                        <span className="text-sm">{lead.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4 text-primary" />
                        <span className="text-sm">{lead.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="text-sm">{lead.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-sm">Added {lead.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {lead.source}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button size="sm" variant="outline" className="whitespace-nowrap">
                      <Phone className="w-4 h-4 mr-2" />
                      Contact
                    </Button>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 whitespace-nowrap">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
