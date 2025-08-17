import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import projectManagementImage from '@/assets/project-management-team.jpg';
import abstractGreyBackground from '@/assets/abstract-grey-background.jpg';
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
    <div className="min-h-screen bg-white">
      {/* Clean Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => onNavigate('landing')}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <img src="/lovable-uploads/b0e435b5-f844-4b7c-bce4-cccf69ad4e5b.png" alt="Skrobaki" className="h-8 w-auto" />
            </div>
            
            <nav className="hidden lg:flex items-center space-x-8">
              <button 
                onClick={() => onNavigate('services')}
                className="text-gray-900 font-medium text-sm"
              >
                Services
              </button>
              <button 
                onClick={() => onNavigate('projects')}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                Projects
              </button>
              <button 
                onClick={() => onNavigate('about')}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => onNavigate('contact')}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                Contact
              </button>
              <Button 
                variant="outline" 
                onClick={() => onNavigate('auth')}
                className="ml-4"
              >
                Sign In
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${abstractGreyBackground})` }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              Professional construction & project management services
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Award-winning expertise in architectural construction
            </p>
            <Button 
              size="lg"
              onClick={() => onNavigate('contact')}
              className="bg-white text-gray-900 hover:bg-gray-100 font-medium px-8"
            >
              Explore & Book
            </Button>
          </div>
        </div>
      </section>

      {/* Services Introduction */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Services</h2>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Explore our comprehensive construction & project management services designed for excellence at every stage.
            </h3>
          </div>
        </div>
      </section>

      {/* Service Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="space-y-12">
            {/* Advisory Service Card */}
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="relative rounded-2xl overflow-hidden h-80">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(/lovable-uploads/f3e6fb6d-ca4a-40dc-8303-ed7d871ea1ec.png)` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 to-indigo-700/80" />
                </div>
                <div className="absolute top-4 left-4">
                  <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Advisory
                  </span>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-600">5.0</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Advisory Services</h3>
                <p className="text-gray-600">
                  Help clients make informed decisions at every stage of their project, from feasibility and budgeting to design reviews and procurement strategies.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Project Feasibility Analysis</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Budget Planning & Optimization</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Risk Assessment & Mitigation</span>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <Button 
                    onClick={() => onNavigate('contact')}
                    className="bg-gray-900 text-white hover:bg-gray-800"
                  >
                    Book now
                  </Button>
                  <Button variant="outline">
                    Learn more
                  </Button>
                </div>
              </div>
            </div>

            {/* Project Management Service Card */}
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-6 lg:order-2">
                <div className="flex items-center space-x-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-600">4.9</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Project Management</h3>
                <p className="text-gray-600">
                  End-to-end management of projects, ensuring they are delivered on time, within budget, and to the highest quality standards while protecting the client's interest.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Project Planning & Scheduling</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Budget Control & Cost Management</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Settings className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Quality Assurance & Control</span>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <Button 
                    onClick={() => onNavigate('contact')}
                    className="bg-gray-900 text-white hover:bg-gray-800"
                  >
                    Book now
                  </Button>
                  <Button variant="outline">
                    Learn more
                  </Button>
                </div>
              </div>
              <div className="relative rounded-2xl overflow-hidden h-80 lg:order-1">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${projectManagementImage})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-600/80 to-emerald-700/80" />
                </div>
                <div className="absolute top-4 left-4">
                  <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Project Management
                  </span>
                </div>
              </div>
            </div>

            {/* Construction Management Service Card */}
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="relative rounded-2xl overflow-hidden h-80">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(/lovable-uploads/f3e6fb6d-ca4a-40dc-8303-ed7d871ea1ec.png)` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-600/80 to-red-700/80" />
                </div>
                <div className="absolute top-4 left-4">
                  <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Construction
                  </span>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-600">4.8</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Construction Management</h3>
                <p className="text-gray-600">
                  Hands-on coordination and oversight of construction activities, managing trades, schedules, compliance, and site operations to achieve seamless project execution.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <HardHat className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Site Coordination & Supervision</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clipboard className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Trade Management & Scheduling</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Safety Compliance & Monitoring</span>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <Button 
                    onClick={() => onNavigate('contact')}
                    className="bg-gray-900 text-white hover:bg-gray-800"
                  >
                    Book now
                  </Button>
                  <Button variant="outline">
                    Learn more
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Let's discuss how our comprehensive services can bring your architectural vision to life with exceptional quality and attention to detail.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => onNavigate('contact')}
              className="bg-gray-900 text-white hover:bg-gray-800 px-8"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Consultation
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => onNavigate('projects')}
              className="px-8"
            >
              View Our Work
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};