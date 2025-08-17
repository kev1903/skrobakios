import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import projectManagementImage from '@/assets/project-management-team.jpg';
import { 
  ArrowRight, 
  ArrowLeft,
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with overlay - consistent with landing page */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
           style={{ backgroundImage: `url(/lovable-uploads/f3e6fb6d-ca4a-40dc-8303-ed7d871ea1ec.png)` }}>
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header - consistent with landing page */}
        <header className="p-6 lg:p-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => onNavigate('landing')}
                className="text-white/70 hover:text-white text-sm font-medium tracking-wide transition-colors flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <img src="/lovable-uploads/b0e435b5-f844-4b7c-bce4-cccf69ad4e5b.png" alt="Skrobaki Logo" className="h-8 w-auto" />
            </div>
            
            <nav className="hidden lg:flex items-center space-x-12">
              <button 
                onClick={() => onNavigate('services')}
                className="text-white font-medium text-sm tracking-wide transition-colors"
              >
                SERVICES
              </button>
              <button 
                onClick={() => onNavigate('projects')}
                className="text-white/90 hover:text-white text-sm font-medium tracking-wide transition-colors"
              >
                PROJECTS
              </button>
              <button 
                onClick={() => onNavigate('about')}
                className="text-white/90 hover:text-white text-sm font-medium tracking-wide transition-colors"
              >
                ABOUT US
              </button>
              <Button variant="ghost" onClick={() => onNavigate('auth')} className="text-white border border-white/30 hover:bg-white/10 backdrop-blur-sm">
                Sign In
              </Button>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          {/* Page Title */}
          <div className="text-center mb-16">
            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-none tracking-tight mb-6">
              Our Services
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Comprehensive construction and project management solutions designed to deliver excellence 
              at every stage of your project lifecycle.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-20">
            {features.map((feature, idx) => (
              <div key={idx} className="glass-card p-6 text-center">
                <feature.icon className="w-8 h-8 text-white/80 mx-auto mb-4" />
                <h3 className="font-medium text-white mb-2">{feature.title}</h3>
                <p className="text-white/70 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </main>

        {/* Services Details */}
        <section className="py-20 relative z-10">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="space-y-20">
              {services.map((category, idx) => (
                <div key={idx} className="grid lg:grid-cols-2 gap-16 items-center">
                  <div className={idx % 2 === 1 ? 'lg:order-2' : ''}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-2 h-12 bg-gradient-to-b from-white/60 to-white/40 rounded-full"></div>
                      <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-wide">
                        {category.category}
                      </h2>
                    </div>
                    <p className="text-lg text-white/80 mb-8 leading-relaxed">
                      {category.description}
                    </p>
                    <div className="space-y-6">
                      {category.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 backdrop-blur-sm">
                            <item.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-white mb-2">{item.name}</h4>
                            <p className="text-white/70 text-sm leading-relaxed">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className={idx % 2 === 1 ? 'lg:order-1' : ''}>
                    <div className="glass-card p-8">
                      <div className="p-0">
                        {category.category === "Project Management" ? (
                          <div 
                            className="aspect-square rounded-2xl bg-cover bg-center bg-no-repeat relative overflow-hidden"
                            style={{ backgroundImage: `url(${projectManagementImage})` }}
                          >
                            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
                              <div className="text-6xl text-white font-bold drop-shadow-lg">{idx + 1}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-square bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <div className="text-6xl text-white/40 font-bold">{idx + 1}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 relative z-10">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <div className="glass-card p-12">
              <h2 className="text-3xl font-bold text-white mb-8">
                Ready to Start Your Project?
              </h2>
              <p className="text-lg text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
                Let's discuss how our comprehensive services can bring your architectural vision to life with exceptional quality and attention to detail.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  onClick={() => onNavigate('contact')}
                  className="text-white bg-white/20 border border-white/30 hover:bg-white/30 backdrop-blur-sm"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Consultation
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => onNavigate('projects')}
                  className="text-white border-white/30 hover:bg-white/10 backdrop-blur-sm"
                >
                  View Our Work
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};