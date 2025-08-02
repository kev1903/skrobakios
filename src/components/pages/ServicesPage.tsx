import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowRight, 
  Building, 
  Ruler, 
  Eye,
  Users,
  Clipboard,
  Settings,
  TrendingUp,
  CheckCircle,
  Star,
  Calendar,
  Lightbulb,
  MapPin,
  FileText,
  Home,
  LayoutGrid,
  Box,
  Camera,
  Printer,
  Wrench,
  TreePine,
  Heart,
  Tent,
  Square,
  Circle,
  Search,
  ShoppingCart,
  Network,
  DollarSign,
  Scan,
  Cog,
  Monitor,
  BarChart3,
  Brain,
  Target,
  Calculator,
  Grid3x3,
  ArrowRightLeft,
  LineChart,
  Shield,
  HardHat,
  Gem,
  MessageCircle,
  UserCheck,
  ClipboardList
} from 'lucide-react';

interface ServicesPageProps {
  onNavigate: (page: string) => void;
}

export const ServicesPage = ({ onNavigate }: ServicesPageProps) => {
  const services = [
    {
      category: "Design",
      description: "Crafting visions with precision and elegance.",
      items: [
        { name: "Concept Design", icon: Lightbulb, description: "Turning your ideas into creative design proposals." },
        { name: "Town Planning Drawings", icon: MapPin, description: "Documentation tailored for planning approvals." },
        { name: "Working Drawings & Construction Documentation", icon: FileText, description: "Full sets for accurate construction and compliance." },
        { name: "Interior Design", icon: Home, description: "Elegant, functional spaces designed for modern living." },
        { name: "Spacial Design", icon: LayoutGrid, description: "Designing flow and form to enhance everyday experiences." },
        { name: "3D Modelling & Visualisation", icon: Box, description: "See your project in 3D before it's built." },
        { name: "3D Renderings", icon: Camera, description: "Photorealistic visuals for presentations or approvals." },
        { name: "3D Printed Models", icon: Printer, description: "Scaled architectural models, printed with precision." }
      ]
    },
    {
      category: "Build",
      description: "From vision to completion — we build with expertise.",
      items: [
        { name: "New Home Construction", icon: Building, description: "Custom-designed family homes with luxury and efficiency." },
        { name: "High-End Renovations", icon: Wrench, description: "Transforming existing homes with style and structure." },
        { name: "Hardscapes & Landscaping", icon: TreePine, description: "Durable, aesthetic outdoor spaces, tailored to your lifestyle." },
        { name: "SDA Home Construction", icon: Heart, description: "Specialist Disability Accommodation built for comfort and compliance." },
        { name: "Outdoor Pavilions & Alfresco Areas", icon: Tent, description: "Entertain and relax outdoors, all year round." },
        { name: "Custom Brick Fences", icon: Square, description: "Elegant boundary walls with architectural details." },
        { name: "Basketball Courts (via CourtScapes)", icon: Circle, description: "Backyard courts designed for performance and fun." }
      ]
    },
    {
      category: "Project Management",
      description: "Guiding every stage with control and clarity.",
      items: [
        { name: "Full-Service Project Management", icon: Settings, description: "End-to-end oversight for seamless delivery." },
        { name: "Client-Side Project Management (Home Build Assist)", icon: Users, description: "Acting in your best interest, from plans to handover." },
        { name: "Construction Administration", icon: Clipboard, description: "Managing contracts, site processes, and documentation." },
        { name: "Site Inspections & Reports", icon: Search, description: "On-site evaluations with actionable recommendations." },
        { name: "Procurement Management", icon: ShoppingCart, description: "Securing quality materials and trades, on budget." },
        { name: "Contractor Coordination", icon: Network, description: "Managing all site professionals under one system." },
        { name: "Budget & Cost Monitoring", icon: DollarSign, description: "Transparent cost tracking across all phases." },
        { name: "Timeline & Progress Tracking", icon: Calendar, description: "Keeping your project on schedule, every step of the way." }
      ]
    },
    {
      category: "Digital & Technical",
      description: "Built smarter, through innovation and precision.",
      items: [
        { name: "BIM Modelling", icon: Box, description: "Intelligent 3D models for planning and coordination." },
        { name: "Scan to BIM", icon: Scan, description: "Digitising real-world buildings for updates or retrofits." },
        { name: "Shop Drawings", icon: Ruler, description: "Fabrication-ready technical drawings for builders and fabricators." },
        { name: "DfMA (Design for Manufacturing and Assembly)", icon: Cog, description: "Optimised designs for efficient off-site manufacturing." },
        { name: "Digital Twin Systems", icon: Monitor, description: "Live digital replicas of your construction project." },
        { name: "Live Project Dashboards", icon: BarChart3, description: "Real-time updates on budget, schedule, and progress." },
        { name: "AI-Powered Estimating (Coming Soon)", icon: Brain, description: "Instant, intelligent cost analysis using AI." }
      ]
    },
    {
      category: "Estimating & Cost Planning",
      description: "Plan with clarity. Build with confidence.",
      items: [
        { name: "Budget Benchmarking", icon: Target, description: "Early-stage financial planning using real data." },
        { name: "Elemental Cost Planning (BCIS Method)", icon: Calculator, description: "Detailed estimates broken down by building components." },
        { name: "Quantity Take-offs", icon: Ruler, description: "Accurate measurements and scope breakdowns." },
        { name: "Quote Vetting & Matrix System", icon: Grid3x3, description: "Compare and review multiple quotes with our structured approach." },
        { name: "Variation Management", icon: ArrowRightLeft, description: "Handle changes smoothly, with full transparency." },
        { name: "Live Cost Tracker", icon: TrendingUp, description: "Track spend vs budget in real-time." },
        { name: "Cash Flow Forecasting", icon: LineChart, description: "Anticipate cash needs, month by month." }
      ]
    },
    {
      category: "Consulting",
      description: "Expert advice to simplify complex decisions.",
      items: [
        { name: "Feasibility Studies", icon: CheckCircle, description: "Know if your idea is viable before investing." },
        { name: "Design Compliance Reviews", icon: Shield, description: "Ensure your plans meet building code and planning rules." },
        { name: "Buildability Assessments", icon: HardHat, description: "Identify design risks early to avoid costly delays." },
        { name: "Value Engineering", icon: Gem, description: "Maximise value without compromising quality." },
        { name: "Private Building Consultation", icon: MessageCircle, description: "Independent advice on-site or during design." },
        { name: "Expert Advice for Owner Builders", icon: UserCheck, description: "Guidance to help you manage your own build." },
        { name: "Pre-Construction Planning", icon: ClipboardList, description: "Set up your project for success before starting on site." }
      ]
    }
  ];

  const features = [
    { icon: CheckCircle, title: "Quality Assurance", description: "Rigorous quality control at every stage" },
    { icon: Star, title: "Award-Winning", description: "Recognized excellence in architectural construction" },
    { icon: Users, title: "Expert Team", description: "Skilled professionals with decades of experience" },
    { icon: TrendingUp, title: "Value Engineering", description: "Optimizing cost without compromising quality" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-background via-background/95 to-card/30">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h1 className="heading-xl text-foreground mb-8 font-playfair">
              Our <span className="text-gradient-gold">Services</span>
            </h1>
            <p className="body-lg text-muted-foreground max-w-3xl mx-auto">
              Comprehensive architectural and construction services designed for clients who value precision, quality, and innovative solutions. From initial concept to final handover, we deliver excellence at every stage.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-20">
            {features.map((feature, idx) => (
              <div key={idx} className="glass-card p-6 text-center">
                <feature.icon className="w-8 h-8 text-brand-gold mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Details */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="space-y-20">
            {services.map((category, idx) => (
              <div key={idx} className="grid lg:grid-cols-2 gap-16 items-center">
                <div className={idx % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-12 bg-gradient-to-b from-brand-gold to-brand-gold-light rounded-full"></div>
                    <h2 className="heading-lg text-foreground font-playfair">
                      {category.category}
                    </h2>
                  </div>
                  <p className="body-lg text-muted-foreground mb-8">
                    {category.description}
                  </p>
                  <div className="space-y-6">
                    {category.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-brand-gold/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                          <item.icon className="w-5 h-5 text-brand-gold" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground mb-2">{item.name}</h4>
                          <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className={idx % 2 === 1 ? 'lg:order-1' : ''}>
                  <Card className="glass-card border-brand-gold/10 p-8">
                    <CardContent className="p-0">
                      <div className="aspect-square bg-gradient-to-br from-brand-gold/10 to-brand-gold/5 rounded-2xl flex items-center justify-center">
                        <div className="text-6xl text-brand-gold/20">{idx + 1}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-card/30">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="heading-lg text-card-foreground mb-8">
            Ready to Start Your Project?
          </h2>
          <p className="body-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Let's discuss how our comprehensive services can bring your architectural vision to life with exceptional quality and attention to detail.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium tracking-wide rounded-lg h-auto text-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              style={{ 
                backgroundColor: 'rgb(54,119,159)',
                boxShadow: '0 4px 15px rgba(54, 119, 159, 0.2)',
                border: 'none'
              }}
              onClick={() => onNavigate('contact')}
            >
              <Calendar className="w-4 h-4" />
              Book Consultation
              <ArrowRight className="w-4 h-4" />
            </button>
            <Button 
              variant="outline" 
              className="button-ghost px-6 py-3 text-sm font-medium tracking-wide rounded-lg h-auto flex items-center gap-2"
              onClick={() => onNavigate('projects')}
            >
              View Our Work
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};