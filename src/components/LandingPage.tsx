import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Calendar, 
  CheckCircle, 
  Building, 
  Ruler, 
  Eye,
  Users,
  Clipboard,
  Settings,
  TrendingUp,
  Award,
  Star,
  Quote,
  Phone,
  Mail,
  MapPin,
  LogIn
} from 'lucide-react';
import heroImage from '@/assets/hero-architecture.jpg';
import modernBuilding from '@/assets/modern-building.jpg';
import whiteBuilding from '@/assets/white-building.jpg';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage = ({ onNavigate }: LandingPageProps) => {
  const services = [
    {
      category: "Project Management",
      items: [
        { name: "7-Stage Lifecycle Management", icon: Clipboard, description: "Complete project oversight from concept to completion" },
        { name: "Construction Advisory", icon: Users, description: "Expert guidance throughout your build journey" },
        { name: "Construction Management", icon: Settings, description: "On-site coordination and quality control" }
      ]
    },
    {
      category: "Standalone Services", 
      items: [
        { name: "Cost Estimating", icon: TrendingUp, description: "Accurate budgeting and cost analysis" },
        { name: "Building Inspections", icon: Eye, description: "Thorough quality and compliance assessments" },
        { name: "3D Design & Rendering", icon: Building, description: "Visualize your project before construction begins" }
      ]
    },
    {
      category: "BIM & Digital Services",
      items: [
        { name: "BIM Models", icon: Ruler, description: "Advanced building information modeling" },
        { name: "Shop Drawings", icon: Clipboard, description: "Detailed construction documentation" },
        { name: "AI Timeline & Dashboards", icon: Settings, description: "Smart project tracking and analytics" }
      ]
    }
  ];

  const projectLifecycle = [
    { stage: "1", title: "Concept & Design", description: "Initial planning and architectural design development" },
    { stage: "2", title: "Planning & Permits", description: "Regulatory approvals and detailed planning" },
    { stage: "3", title: "Pre-Construction", description: "Final preparations and contractor selection" },
    { stage: "4", title: "Foundation & Structure", description: "Site preparation and structural development" },
    { stage: "5", title: "Building Envelope", description: "Exterior walls, roofing, and weatherproofing" },
    { stage: "6", title: "Interior & Finishes", description: "Internal systems and finishing touches" },
    { stage: "7", title: "Completion & Handover", description: "Final inspections and project delivery" }
  ];

  const featuredProjects = [
    {
      title: "Modern Family Estate",
      location: "Toorak, VIC",
      image: modernBuilding,
      description: "Luxury 5-bedroom home with sustainable design"
    },
    {
      title: "Contemporary Retreat",
      location: "Brighton, VIC", 
      image: whiteBuilding,
      description: "Minimalist design with premium finishes"
    },
    {
      title: "Architectural Masterpiece",
      location: "South Yarra, VIC",
      image: heroImage,
      description: "Award-winning design with innovative features"
    }
  ];

  const testimonials = [
    {
      quote: "Skrobaki transformed our vision into reality with exceptional attention to detail and professionalism.",
      author: "Sarah & Michael Chen",
      project: "Custom Family Home, Camberwell"
    },
    {
      quote: "The team's expertise in luxury residential construction is unmatched. Our dream home exceeded expectations.",
      author: "David Thompson",
      project: "Modern Estate, Hawthorn"
    },
    {
      quote: "From concept to completion, Skrobaki delivered outstanding quality and service throughout our build.",
      author: "Emma Richardson",
      project: "Contemporary Home, Kew"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <h1 className="text-2xl font-playfair font-bold text-gray-900">SKROBAKI</h1>
            </div>

            {/* Login Button */}
            <Button 
              onClick={() => onNavigate('auth')}
              variant="outline"
              className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-playfair font-bold text-white mb-6 leading-tight">
            We design & build<br />
            <span className="text-gray-200">Luxury Family Homes</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
            Crafting your dream home with elegance, expertise, and excellence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-4 h-auto"
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Services
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10 text-lg px-8 py-4 h-auto"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Calendar className="mr-2 w-5 h-5" />
              Book Free Consultation
            </Button>
          </div>

          {/* Trust Bar */}
          <div className="flex flex-wrap justify-center gap-6 text-white/80">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span>Registered Builder</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>BIM-Integrated</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              <span>Award-Winning</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-gray-900 mb-6">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive construction project management services tailored for luxury residential builds
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {services.map((category, idx) => (
              <Card key={idx} className="bg-white shadow-lg border-0 rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-playfair font-semibold text-gray-900 mb-6">
                    {category.category}
                  </h3>
                  <div className="space-y-4">
                    {category.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-5 h-5 text-gray-700" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                          <p className="text-gray-600 text-sm">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Project Lifecycle Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-gray-900 mb-6">
              7-Stage Project Lifecycle
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our systematic approach ensures every project is delivered on time, on budget, and to the highest standards
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gray-300 hidden lg:block"></div>
            
            <div className="space-y-12">
              {projectLifecycle.map((stage, idx) => (
                <div key={idx} className={`relative flex items-center ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  <div className={`flex-1 ${idx % 2 === 0 ? 'lg:pr-12' : 'lg:pl-12'}`}>
                    <Card className="bg-gray-50 border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-3">
                          <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
                            {stage.stage}
                          </Badge>
                          <h3 className="text-xl font-playfair font-semibold text-gray-900">
                            {stage.title}
                          </h3>
                        </div>
                        <p className="text-gray-600">{stage.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Timeline Dot */}
                  <div className="relative z-10 w-4 h-4 bg-gray-900 rounded-full hidden lg:block"></div>
                  
                  <div className="flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-gray-900 mb-6">
              Featured Projects
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Showcasing our expertise in luxury residential construction and design excellence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredProjects.map((project, idx) => (
              <Card key={idx} className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-playfair font-semibold text-gray-900 mb-2">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 mb-3">{project.location}</p>
                  <p className="text-gray-700">{project.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-gray-900 mb-6">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Trusted by families across Melbourne for exceptional construction and service
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="bg-gray-50 border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8">
                  <Quote className="w-8 h-8 text-gray-400 mb-4" />
                  <p className="text-gray-700 mb-6 italic text-lg leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">{testimonial.author}</p>
                    <p className="text-gray-600 text-sm">{testimonial.project}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & CTA Section */}
      <section id="contact" className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-6">
                Ready to Build Your Dream Home?
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Let's discuss your vision and create something extraordinary together. 
                Book a free consultation to get started.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span>+61 3 9876 5432</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span>hello@skrobaki.com.au</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span>Melbourne, Victoria</span>
                </div>
              </div>

              <Button 
                size="lg" 
                className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-4 h-auto"
              >
                <Calendar className="mr-2 w-5 h-5" />
                Book Free Consultation
              </Button>
            </div>

            <div>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-playfair font-semibold mb-6">Get In Touch</h3>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="First Name"
                        className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:border-white/40"
                      />
                      <input 
                        type="text" 
                        placeholder="Last Name"
                        className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:border-white/40"
                      />
                    </div>
                    <input 
                      type="email" 
                      placeholder="Email Address"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:border-white/40"
                    />
                    <input 
                      type="tel" 
                      placeholder="Phone Number"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:border-white/40"
                    />
                    <select className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/40">
                      <option value="">Select Service Type</option>
                      <option value="project-management">Project Management</option>
                      <option value="estimating">Cost Estimating</option>
                      <option value="inspections">Building Inspections</option>
                      <option value="bim">BIM & Digital Services</option>
                      <option value="other">Other</option>
                    </select>
                    <textarea 
                      placeholder="Tell us about your project..."
                      rows={4}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:border-white/40 resize-none"
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-white text-gray-900 hover:bg-gray-100"
                    >
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold">S</span>
                </div>
                <h3 className="text-xl font-playfair font-bold">SKROBAKI</h3>
              </div>
              <p className="text-gray-400">
                Crafting luxury family homes with elegance, expertise, and excellence.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Project Management</li>
                <li>Cost Estimating</li>
                <li>Building Inspections</li>
                <li>BIM & Digital Services</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Projects</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <p>+61 3 9876 5432</p>
                <p>hello@skrobaki.com.au</p>
                <p>Melbourne, Victoria</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Skrobaki. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};