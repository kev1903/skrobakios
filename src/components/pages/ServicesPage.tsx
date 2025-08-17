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
  ClipboardList,
  Phone,
  Mail,
  Award
} from 'lucide-react';

interface ServicesPageProps {
  onNavigate: (page: string) => void;
}

export const ServicesPage = ({ onNavigate }: ServicesPageProps) => {
  return (
    <div className="min-h-screen bg-background">{/* Main Background */}
      {/* Fixed Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => onNavigate('landing')}
                className="text-white/70 hover:text-white text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <img src="/lovable-uploads/b0e435b5-f844-4b7c-bce4-cccf69ad4e5b.png" alt="Skrobaki" className="h-8 w-auto" />
            </div>
            
            <div className="hidden lg:flex items-center space-x-12">
              <button 
                onClick={() => onNavigate('services')}
                className="text-white font-medium text-sm tracking-wide"
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
              <button 
                onClick={() => onNavigate('contact')}
                className="text-white/90 hover:text-white text-sm font-medium tracking-wide transition-colors"
              >
                CONTACT
              </button>
            </div>

            <Button 
              variant="ghost" 
              onClick={() => onNavigate('auth')}
              className="text-white border border-white/30 hover:bg-white/10 backdrop-blur-sm"
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-20 flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside className="w-80 glass-card m-6 p-8 h-fit">
          {/* Main CTA */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Ready to start your construction project?
            </h2>
            <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
              Connect with our professional team and get expert guidance from planning to completion.
            </p>
            <Button 
              onClick={() => onNavigate('contact')}
              className="w-full button-blue rounded-xl"
            >
              Get Professional Consultation
            </Button>
          </div>

          {/* Service Advantages */}
          <div className="mb-8">
            <h3 className="font-medium text-foreground mb-4">
              Why Choose Our Services
            </h3>
            
            <div className="space-y-4">
              <div className="glass-light rounded-2xl p-4">
                <div 
                  className="w-full h-24 bg-cover bg-center rounded-xl mb-3"
                  style={{ backgroundImage: `url(/lovable-uploads/f3e6fb6d-ca4a-40dc-8303-ed7d871ea1ec.png)` }}
                />
                <h4 className="font-medium text-foreground mb-1 text-sm">Energy Efficiency</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sustainable construction practices with energy-efficient solutions and modern technologies.
                </p>
              </div>

              <div className="glass-light rounded-2xl p-4">
                <div 
                  className="w-full h-24 bg-cover bg-center rounded-xl mb-3"
                  style={{ backgroundImage: `url(${projectManagementImage})` }}
                />
                <h4 className="font-medium text-foreground mb-1 text-sm">Eco-friendly Materials</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Premium sustainable materials and environmentally conscious building methods.
                </p>
              </div>
            </div>
          </div>

          {/* Working with the Best */}
          <div className="mb-8">
            <h3 className="font-medium text-foreground mb-4">
              Working with the Best
            </h3>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Our professional team delivers projects using the latest construction technologies and proven methodologies.
            </p>
            <Button 
              variant="outline"
              onClick={() => onNavigate('contact')}
              className="w-full button-ghost rounded-xl"
            >
              Learn About Our Approach
            </Button>
          </div>

          {/* News */}
          <div className="mb-8">
            <h3 className="font-medium text-foreground mb-4">Latest News</h3>
            <div className="space-y-3">
              <div className="text-xs">
                <p className="text-foreground font-medium">New Sustainable Construction Standards</p>
                <p className="text-muted-foreground text-xs">March 15, 2024</p>
              </div>
              <div className="text-xs">
                <p className="text-foreground font-medium">Award for Excellence in Project Management</p>
                <p className="text-muted-foreground text-xs">March 10, 2024</p>
              </div>
              <div className="text-xs">
                <p className="text-foreground font-medium">New Technology Integration</p>
                <p className="text-muted-foreground text-xs">March 5, 2024</p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-medium text-foreground mb-4">Contacts</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Phone className="w-3 h-3" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3 h-3" />
                <span>info@skrobaki.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-3 h-3" />
                <span>Construction District, Building 1</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Hero Section */}
          <section className="mb-12">
            <div 
              className="relative h-96 bg-cover bg-center rounded-3xl overflow-hidden"
              style={{ backgroundImage: `url(${abstractGreyBackground})` }}
            >
              <div className="absolute inset-0 bg-black/50 rounded-3xl" />
              <div className="relative z-10 h-full flex items-center justify-center text-center text-white p-8">
                <div>
                  <h1 className="text-5xl lg:text-6xl font-bold mb-4">
                    Professional Services
                  </h1>
                  <p className="text-xl mb-8 max-w-2xl">
                    Comprehensive construction and project management solutions designed for excellence at every stage
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* About Project */}
          <section className="mb-12">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About Our Services</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Skrobaki provides comprehensive construction and project management services for residential and commercial projects. 
                  Our experienced team combines modern construction technologies with traditional craftsmanship to deliver exceptional results. 
                  From initial planning and design consultation to final completion, we ensure every project meets the highest standards 
                  of quality, safety, and efficiency. Our expertise spans advisory services, full project management, 
                  and hands-on construction management across all phases of development.
                </p>
                
                {/* Statistics */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">150+</div>
                    <div className="text-sm text-gray-600">Completed Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">15+</div>
                    <div className="text-sm text-gray-600">Years Experience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">98%</div>
                    <div className="text-sm text-gray-600">Client Satisfaction</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-4">
                  <Button 
                    variant="outline"
                    onClick={() => onNavigate('projects')}
                    className="flex items-center justify-center space-x-2 rounded-xl"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Projects</span>
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => onNavigate('contact')}
                    className="flex items-center justify-center space-x-2 rounded-xl"
                  >
                    <Calculator className="w-4 h-4" />
                    <span>Get Quote</span>
                  </Button>
                  <Button 
                    onClick={() => onNavigate('contact')}
                    className="bg-gray-900 text-white hover:bg-gray-800 flex items-center justify-center space-x-2 rounded-xl"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Schedule</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div 
                  className="h-48 bg-cover bg-center rounded-2xl"
                  style={{ backgroundImage: `url(/lovable-uploads/f3e6fb6d-ca4a-40dc-8303-ed7d871ea1ec.png)` }}
                />
                <div 
                  className="h-48 bg-cover bg-center rounded-2xl"
                  style={{ backgroundImage: `url(${projectManagementImage})` }}
                />
              </div>
            </div>
          </section>

          {/* Services Grid */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Service Areas</h2>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Advisory */}
              <Card className="rounded-3xl overflow-hidden shadow-lg">
                <div 
                  className="h-48 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(/lovable-uploads/f3e6fb6d-ca4a-40dc-8303-ed7d871ea1ec.png)` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-indigo-900/80" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                      01
                    </span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Advisory Services</h3>
                  <p className="text-gray-600 mb-4">
                    Help clients make informed decisions at every stage of their project, from feasibility and budgeting to design reviews.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Project Feasibility Analysis</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Budget Planning & Optimization</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Risk Assessment & Mitigation</span>
                    </div>
                  </div>
                  <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-xl">
                    Learn More
                  </Button>
                </CardContent>
              </Card>

              {/* Project Management */}
              <Card className="rounded-3xl overflow-hidden shadow-lg">
                <div 
                  className="h-48 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${projectManagementImage})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 to-emerald-900/80" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                      02
                    </span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Project Management</h3>
                  <p className="text-gray-600 mb-4">
                    End-to-end management ensuring projects are delivered on time, within budget, and to the highest quality standards.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Project Planning & Scheduling</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Budget Control & Cost Management</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Quality Assurance & Control</span>
                    </div>
                  </div>
                  <Button className="w-full bg-green-600 text-white hover:bg-green-700 rounded-xl">
                    Learn More
                  </Button>
                </CardContent>
              </Card>

              {/* Construction Management */}
              <Card className="rounded-3xl overflow-hidden shadow-lg">
                <div 
                  className="h-48 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(/lovable-uploads/f3e6fb6d-ca4a-40dc-8303-ed7d871ea1ec.png)` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-900/80 to-red-900/80" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                      03
                    </span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Construction Management</h3>
                  <p className="text-gray-600 mb-4">
                    Hands-on coordination and oversight of construction activities, managing trades, schedules, and compliance.
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Site Coordination & Supervision</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Trade Management & Scheduling</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Safety Compliance & Monitoring</span>
                    </div>
                  </div>
                  <Button className="w-full bg-orange-600 text-white hover:bg-orange-700 rounded-xl">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Call to Action */}
          <section className="bg-gray-900 rounded-3xl p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Project?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Let's discuss how our comprehensive services can bring your architectural vision to life with exceptional quality and attention to detail.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => onNavigate('contact')}
                className="bg-white text-gray-900 hover:bg-gray-100 font-medium px-8 rounded-xl"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Consultation
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={() => onNavigate('projects')}
                className="text-white border-white/30 hover:bg-white/10 backdrop-blur-sm px-8 rounded-xl"
              >
                View Our Work
              </Button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};