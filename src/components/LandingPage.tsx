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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass backdrop-blur-lg border-b border-border/30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-foreground to-foreground/80 rounded-xl flex items-center justify-center">
                <span className="text-background font-bold text-lg">S</span>
              </div>
              <h1 className="text-2xl font-elegant font-bold text-foreground">SKROBAKI</h1>
            </div>

            {/* Login Button */}
            <Button 
              onClick={() => onNavigate('auth')}
              variant="outline"
              className="flex items-center gap-2 border-border/40 hover:bg-accent/20 text-foreground"
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
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/80" />
        
        <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
          <h1 className="text-5xl md:text-8xl font-elegant font-light text-foreground mb-8 leading-tight tracking-wide">
            The project <span className="italic font-normal">itself</span><br />
            <span className="text-muted-foreground">holds the key to inspiration.</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Crafting architectural excellence through sophisticated design and unparalleled craftsmanship.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button 
              size="lg" 
              className="bg-foreground text-background hover:bg-foreground/90 text-lg px-12 py-6 h-auto rounded-full font-light tracking-wide"
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Services
              <ArrowRight className="ml-3 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-border/40 text-foreground hover:bg-accent/20 text-lg px-12 py-6 h-auto rounded-full font-light tracking-wide backdrop-blur-sm"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Calendar className="mr-3 w-5 h-5" />
              Book Consultation
            </Button>
          </div>

          {/* Trust Bar */}
          <div className="flex flex-wrap justify-center gap-8 text-muted-foreground/80">
            <div className="flex items-center gap-3 glass-light rounded-full px-6 py-3">
              <Award className="w-5 h-5" />
              <span className="font-light">Registered Builder</span>
            </div>
            <div className="flex items-center gap-3 glass-light rounded-full px-6 py-3">
              <CheckCircle className="w-5 h-5" />
              <span className="font-light">BIM-Integrated</span>
            </div>
            <div className="flex items-center gap-3 glass-light rounded-full px-6 py-3">
              <Star className="w-5 h-5" />
              <span className="font-light">Award-Winning</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section id="services" className="py-32 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-elegant font-light text-foreground mb-8 tracking-wide">
              Our Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto font-light leading-relaxed">
              Comprehensive architectural and construction services tailored for discerning clients who demand excellence
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {services.map((category, idx) => (
              <Card key={idx} className="glass-card border-border/20 overflow-hidden hover:glass-hover transition-all duration-500 group">
                <CardContent className="p-10">
                  <h3 className="text-2xl font-elegant font-normal text-foreground mb-8 tracking-wide">
                    {category.category}
                  </h3>
                  <div className="space-y-6">
                    {category.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex items-start gap-5">
                        <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors duration-300">
                          <item.icon className="w-6 h-6 text-foreground/70" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground mb-2 font-inter">{item.name}</h4>
                          <p className="text-muted-foreground text-sm font-light leading-relaxed">{item.description}</p>
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
      <section className="py-32 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-elegant font-light text-card-foreground mb-8 tracking-wide">
              7-Stage Project Lifecycle
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto font-light leading-relaxed">
              Our methodical approach ensures seamless execution from conceptual design to final delivery
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-px h-full w-px bg-border/30 hidden lg:block"></div>
            
            <div className="space-y-16">
              {projectLifecycle.map((stage, idx) => (
                <div key={idx} className={`relative flex items-center ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  <div className={`flex-1 ${idx % 2 === 0 ? 'lg:pr-16' : 'lg:pl-16'}`}>
                    <Card className="glass-card border-border/20 hover:glass-hover transition-all duration-500">
                      <CardContent className="p-8">
                        <div className="flex items-center gap-6 mb-4">
                          <Badge variant="secondary" className="text-xl font-light px-4 py-2 bg-accent/20 text-accent-foreground rounded-full">
                            {stage.stage}
                          </Badge>
                          <h3 className="text-2xl font-elegant font-normal text-card-foreground tracking-wide">
                            {stage.title}
                          </h3>
                        </div>
                        <p className="text-muted-foreground font-light leading-relaxed">{stage.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Timeline Dot */}
                  <div className="relative z-10 w-6 h-6 bg-foreground rounded-full hidden lg:block shadow-lg"></div>
                  
                  <div className="flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-32 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-elegant font-light text-foreground mb-8 tracking-wide">
              Featured Projects
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto font-light leading-relaxed">
              A curated selection of architectural masterpieces that embody our commitment to excellence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {featuredProjects.map((project, idx) => (
              <Card key={idx} className="glass-card border-border/20 overflow-hidden group hover:glass-hover transition-all duration-500">
                <div className="relative h-80 overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent group-hover:from-background/80 transition-all duration-500"></div>
                </div>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-elegant font-normal text-card-foreground mb-3 tracking-wide">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 font-light">{project.location}</p>
                  <p className="text-muted-foreground font-light leading-relaxed">{project.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-elegant font-light text-card-foreground mb-8 tracking-wide">
              What Our Clients Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto font-light leading-relaxed">
              Testimonials from discerning clients who have experienced our commitment to architectural excellence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="glass-card border-border/20 hover:glass-hover transition-all duration-500">
                <CardContent className="p-10">
                  <Quote className="w-10 h-10 text-muted-foreground/40 mb-6" />
                  <p className="text-card-foreground mb-8 italic text-lg leading-relaxed font-light">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <p className="font-medium text-card-foreground mb-2 font-inter">{testimonial.author}</p>
                    <p className="text-muted-foreground text-sm font-light">{testimonial.project}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & CTA Section */}
      <section id="contact" className="py-32 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-elegant font-light mb-8 tracking-wide text-foreground">
                Ready to Create Something Extraordinary?
              </h2>
              <p className="text-xl text-muted-foreground mb-12 leading-relaxed font-light">
                Let's discuss your architectural vision and bring it to life with uncompromising attention to detail.
              </p>
              
              <div className="space-y-6 mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-foreground/70" />
                  </div>
                  <span className="text-foreground font-light">+61 3 9876 5432</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-foreground/70" />
                  </div>
                  <span className="text-foreground font-light">hello@skrobaki.com.au</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-foreground/70" />
                  </div>
                  <span className="text-foreground font-light">Melbourne, Victoria</span>
                </div>
              </div>

              <Button 
                size="lg" 
                className="bg-foreground text-background hover:bg-foreground/90 text-lg px-12 py-6 h-auto rounded-full font-light tracking-wide"
              >
                <Calendar className="mr-3 w-5 h-5" />
                Book Consultation
              </Button>
            </div>

            <div>
              <Card className="glass-card border-border/20">
                <CardContent className="p-10">
                  <h3 className="text-2xl font-elegant font-normal mb-8 text-card-foreground tracking-wide">Get In Touch</h3>
                  <form className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="First Name"
                        className="bg-input border border-border/40 rounded-2xl px-6 py-4 text-foreground placeholder-muted-foreground focus:outline-none focus:border-border font-light backdrop-blur-sm"
                      />
                      <input 
                        type="text" 
                        placeholder="Last Name"
                        className="bg-input border border-border/40 rounded-2xl px-6 py-4 text-foreground placeholder-muted-foreground focus:outline-none focus:border-border font-light backdrop-blur-sm"
                      />
                    </div>
                    <input 
                      type="email" 
                      placeholder="Email Address"
                      className="w-full bg-input border border-border/40 rounded-2xl px-6 py-4 text-foreground placeholder-muted-foreground focus:outline-none focus:border-border font-light backdrop-blur-sm"
                    />
                    <input 
                      type="tel" 
                      placeholder="Phone Number"
                      className="w-full bg-input border border-border/40 rounded-2xl px-6 py-4 text-foreground placeholder-muted-foreground focus:outline-none focus:border-border font-light backdrop-blur-sm"
                    />
                    <select className="w-full bg-input border border-border/40 rounded-2xl px-6 py-4 text-foreground focus:outline-none focus:border-border font-light backdrop-blur-sm">
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
                      className="w-full bg-input border border-border/40 rounded-2xl px-6 py-4 text-foreground placeholder-muted-foreground focus:outline-none focus:border-border resize-none font-light backdrop-blur-sm"
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-foreground text-background hover:bg-foreground/90 py-4 rounded-2xl font-light tracking-wide"
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
      <footer className="bg-card/50 backdrop-blur-sm text-card-foreground py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-foreground rounded-2xl flex items-center justify-center">
                  <span className="text-background font-bold text-lg">S</span>
                </div>
                <h3 className="text-xl font-elegant font-bold tracking-wide">SKROBAKI</h3>
              </div>
              <p className="text-muted-foreground font-light leading-relaxed">
                Crafting architectural excellence through sophisticated design and unparalleled craftsmanship.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-6 text-card-foreground font-inter">Services</h4>
              <ul className="space-y-3 text-muted-foreground font-light">
                <li>Project Management</li>
                <li>Cost Estimating</li>
                <li>Building Inspections</li>
                <li>BIM & Digital Services</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-6 text-card-foreground font-inter">Company</h4>
              <ul className="space-y-3 text-muted-foreground font-light">
                <li>About Us</li>
                <li>Projects</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-6 text-card-foreground font-inter">Contact</h4>
              <div className="space-y-3 text-muted-foreground font-light">
                <p>+61 3 9876 5432</p>
                <p>hello@skrobaki.com.au</p>
                <p>Melbourne, Victoria</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border/30 mt-16 pt-8 text-center text-muted-foreground font-light">
            <p>&copy; 2024 Skrobaki. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};