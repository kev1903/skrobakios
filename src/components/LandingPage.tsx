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
  LogIn,
  Compass,
  Home,
  Sparkles
} from 'lucide-react';
import heroImage from '@/assets/hero-architecture.jpg';
import modernBuilding from '@/assets/modern-building.jpg';
import whiteBuilding from '@/assets/white-building.jpg';
import { Architectural3DScene } from '@/components/3d/Architectural3DScene';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/playfair-display/300.css';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/700.css';

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
      <header className="fixed top-0 left-0 right-0 z-50 glass backdrop-blur-xl border-b border-brand-gold/20">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-4 architectural-accent">
              <div className="relative">
                <img 
                  src="/lovable-uploads/3a1e9978-cc53-4d2e-ae3a-8d5a295a8fdb.png" 
                  alt="SKROBAKI"
                  className="h-10 w-auto object-contain drop-shadow-lg"
                />
                <div className="absolute -inset-2 bg-gradient-to-r from-brand-gold/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </div>
            </div>

            {/* Login Button */}
            <Button 
              onClick={() => onNavigate('auth')}
              variant="outline"
              className="button-minimal flex items-center gap-2 border-brand-gold/30 hover:bg-brand-gold/10 hover:border-brand-gold/50 text-foreground rounded-xl px-6 py-3 font-light tracking-wide"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-start overflow-hidden">
        {/* Enhanced background with architectural elements */}
        <div className="absolute inset-0">
          <div className="w-full h-full bg-gradient-to-br from-background via-brand-charcoal/40 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(200,145,70,0.15)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(200,145,70,0.08)_0%,transparent_50%)]" />
        </div>
        
        {/* Architectural grid overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(200,145,70,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(200,145,70,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }} />
        </div>
        
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/85 to-background/90" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-8 py-24">
          <div className="max-w-5xl">
            {/* Decorative element */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-px bg-gradient-to-r from-brand-gold to-transparent"></div>
              <Compass className="w-5 h-5 text-brand-gold" />
              <span className="text-sm font-light text-brand-gold tracking-wider uppercase">Architectural Excellence</span>
            </div>
            
            <h1 className="heading-xl text-foreground mb-12 max-w-4xl font-playfair">
              The project <span className="text-gradient-gold italic font-light">itself</span><br />
              <span className="text-muted-foreground">holds the key to inspiration.</span>
            </h1>
            
            <p className="body-lg text-muted-foreground mb-16 max-w-2xl leading-relaxed">
              Architectural excellence through sophisticated design philosophy and uncompromising attention to detail. 
              We transform visions into extraordinary built environments.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 mb-20">
              <Button 
                size="lg" 
                className="button-gold interactive-minimal text-lg px-10 py-5 h-auto rounded-xl font-medium tracking-wide"
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Sparkles className="mr-3 w-5 h-5" />
                Explore Services
                <ArrowRight className="ml-3 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="interactive-minimal border-brand-gold/40 text-foreground hover:bg-brand-gold/10 hover:border-brand-gold/60 text-lg px-10 py-5 h-auto rounded-xl font-light backdrop-blur-sm"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Calendar className="mr-3 w-5 h-5" />
                Book Consultation
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-10 text-muted-foreground/70">
              <div className="flex items-center gap-3 group">
                <div className="w-8 h-8 bg-brand-gold/20 rounded-lg flex items-center justify-center group-hover:bg-brand-gold/30 transition-colors">
                  <Award className="w-4 h-4 text-brand-gold" />
                </div>
                <span className="text-sm font-light tracking-wide">Registered Builder</span>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="w-8 h-8 bg-brand-gold/20 rounded-lg flex items-center justify-center group-hover:bg-brand-gold/30 transition-colors">
                  <CheckCircle className="w-4 h-4 text-brand-gold" />
                </div>
                <span className="text-sm font-light tracking-wide">BIM-Integrated</span>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="w-8 h-8 bg-brand-gold/20 rounded-lg flex items-center justify-center group-hover:bg-brand-gold/30 transition-colors">
                  <Star className="w-4 h-4 text-brand-gold" />
                </div>
                <span className="text-sm font-light tracking-wide">Award-Winning</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-8 text-muted-foreground/50">
          <div className="text-xs font-light space-y-2 tracking-wider">
            <div className="flex items-center gap-2">
              <Home className="w-3 h-3 text-brand-gold" />
              <span>Melbourne</span>
            </div>
            <div className="text-xs opacity-60">Victoria, Australia</div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section id="services" className="py-40 bg-background">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-24">
            <div className="max-w-3xl">
              <h2 className="heading-lg text-foreground mb-8">
                Our Approach
              </h2>
              <p className="body-lg text-muted-foreground">
                Comprehensive architectural and construction services designed for clients who value precision, quality, and innovative solutions.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {services.map((category, idx) => (
              <div key={idx} className="interactive-minimal group architectural-accent">
                <Card className="glass-card border-brand-gold/10 overflow-hidden h-full group-hover:border-brand-gold/20 transition-all duration-500">
                  <CardContent className="p-10">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-2 h-12 bg-gradient-to-b from-brand-gold to-brand-gold-light rounded-full"></div>
                      <h3 className="heading-md text-foreground font-playfair">
                        {category.category}
                      </h3>
                    </div>
                    <div className="space-y-8">
                      {category.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-start gap-5 group/item hover:translate-x-2 transition-transform duration-300">
                          <div className="w-10 h-10 bg-brand-gold/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 group-hover/item:bg-brand-gold/30 transition-colors">
                            <item.icon className="w-5 h-5 text-brand-gold" />
                          </div>
                          <div className="space-y-3">
                            <h4 className="font-medium text-foreground text-base tracking-wide">{item.name}</h4>
                            <p className="text-muted-foreground text-sm font-light leading-relaxed">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Lifecycle Timeline */}
      <section className="py-40 bg-card/30">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-24">
            <div className="max-w-3xl">
              <h2 className="heading-lg text-card-foreground mb-8">
                Project Lifecycle
              </h2>
              <p className="body-lg text-muted-foreground">
                A systematic seven-stage approach ensuring seamless execution from initial concept to final delivery.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {projectLifecycle.map((stage, idx) => (
              <div key={idx} className="interactive-minimal">
                <Card className="glass-card border-border/10 h-full">
                  <CardContent className="p-6">
                    <div className="mb-6">
                      <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
                        <span className="text-foreground font-medium">{stage.stage}</span>
                      </div>
                      <h3 className="heading-md text-card-foreground mb-3">
                        {stage.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground text-sm font-light leading-relaxed">{stage.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-40 bg-background">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-end mb-24">
            <div className="max-w-3xl">
              <h2 className="heading-lg text-foreground mb-8">
                Selected Works
              </h2>
              <p className="body-lg text-muted-foreground">
                A curated portfolio showcasing our commitment to architectural excellence and innovative design solutions.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project, idx) => (
              <div key={idx} className="interactive-minimal group">
                <Card className="glass-card border-border/10 overflow-hidden h-full">
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent"></div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="heading-md text-card-foreground mb-2">
                      {project.title}
                    </h3>
                    <p className="text-muted-foreground text-sm font-light mb-3">{project.location}</p>
                    <p className="text-muted-foreground text-sm font-light leading-relaxed">{project.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-40 bg-card/30">
        <div className="max-w-6xl mx-auto px-8">
          <div className="mb-24">
            <div className="max-w-3xl">
              <h2 className="heading-lg text-card-foreground mb-8">
                Client Testimonials
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="interactive-minimal">
                <Card className="glass-card border-border/10 h-full">
                  <CardContent className="p-8">
                    <div className="mb-6">
                      <Quote className="w-6 h-6 text-muted-foreground/30 mb-4" />
                      <p className="text-card-foreground text-base leading-relaxed font-light italic">
                        "{testimonial.quote}"
                      </p>
                    </div>
                    <div className="border-t border-border/20 pt-6">
                      <p className="font-medium text-card-foreground text-sm mb-1">{testimonial.author}</p>
                      <p className="text-muted-foreground text-xs font-light">{testimonial.project}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & CTA Section */}
      <section id="contact" className="py-40 bg-background">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-start">
            <div>
              <h2 className="heading-lg text-foreground mb-8">
                Let's Create Something Exceptional
              </h2>
              <p className="body-lg text-muted-foreground mb-16">
                Begin your architectural journey with a conversation about your vision and aspirations.
              </p>
              
              <div className="space-y-6 mb-16">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-foreground/60" />
                  </div>
                  <span className="text-foreground font-light">+61 3 9876 5432</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-foreground/60" />
                  </div>
                  <span className="text-foreground font-light">hello@skrobaki.com.au</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-foreground/60" />
                  </div>
                  <span className="text-foreground font-light">Melbourne, Victoria</span>
                </div>
              </div>

              <Button 
                size="lg" 
                className="interactive-minimal bg-foreground text-background hover:bg-foreground/90 px-8 py-4 h-auto rounded-lg font-light"
              >
                <Calendar className="mr-2 w-4 h-4" />
                Schedule Consultation
              </Button>
            </div>

            <div>
              <Card className="glass-card border-border/10">
                <CardContent className="p-8">
                  <h3 className="heading-md text-card-foreground mb-8">Get In Touch</h3>
                  <form className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="First Name"
                        className="input-minimal px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none font-light"
                      />
                      <input 
                        type="text" 
                        placeholder="Last Name"
                        className="input-minimal px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none font-light"
                      />
                    </div>
                    <input 
                      type="email" 
                      placeholder="Email Address"
                      className="w-full input-minimal px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none font-light"
                    />
                    <input 
                      type="tel" 
                      placeholder="Phone Number"
                      className="w-full input-minimal px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none font-light"
                    />
                    <select className="w-full input-minimal px-4 py-3 text-foreground focus:outline-none font-light">
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
                      className="w-full input-minimal px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none resize-none font-light"
                    />
                    <Button 
                      type="submit" 
                      className="w-full button-minimal bg-foreground text-background hover:bg-foreground/90 py-3 rounded-lg font-light"
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
      <footer className="bg-card/30 backdrop-blur-xl text-card-foreground py-24 border-t border-brand-gold/20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-4 gap-20">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-4 mb-8 architectural-accent">
                <img 
                  src="/lovable-uploads/3a1e9978-cc53-4d2e-ae3a-8d5a295a8fdb.png" 
                  alt="SKROBAKI"
                  className="h-8 w-auto object-contain drop-shadow-lg"
                />
                <div className="w-px h-8 bg-brand-gold/30"></div>
                <span className="text-brand-gold font-light tracking-wider text-sm">ARCHITECTURAL EXCELLENCE</span>
              </div>
              <p className="text-muted-foreground font-light leading-relaxed text-base max-w-md">
                Transforming architectural visions into extraordinary built environments through sophisticated design 
                philosophy and uncompromising attention to detail.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-6 text-card-foreground text-sm">Services</h4>
              <ul className="space-y-3 text-muted-foreground font-light text-sm">
                <li>Project Management</li>
                <li>Cost Estimating</li>
                <li>Building Inspections</li>
                <li>BIM & Digital Services</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-6 text-card-foreground text-sm">Company</h4>
              <ul className="space-y-3 text-muted-foreground font-light text-sm">
                <li>About</li>
                <li>Projects</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-6 text-card-foreground text-sm">Contact</h4>
              <div className="space-y-3 text-muted-foreground font-light text-sm">
                <p>+61 3 9876 5432</p>
                <p>hello@skrobaki.com.au</p>
                <p>Melbourne, Victoria</p>
              </div>
            </div>
          </div>
          
          <div className="divider-minimal mt-16 mb-8"></div>
          <div className="text-center text-muted-foreground font-light text-xs">
            <p>&copy; 2024 Skrobaki. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};