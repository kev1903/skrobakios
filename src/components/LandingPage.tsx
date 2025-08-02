import React, { useState, useEffect } from 'react';
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
  Sparkles,
  ChevronUp,
  ChevronDown,
  Circle
} from 'lucide-react';
import heroImage from '@/assets/hero-architecture.jpg';
import modernBuilding from '@/assets/modern-building.jpg';
import whiteBuilding from '@/assets/white-building.jpg';
import { Architectural3DScene } from '@/components/3d/Architectural3DScene';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage = ({ onNavigate }: LandingPageProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { id: 'hero', title: 'Welcome' },
    { id: 'services', title: 'Services' },
    { id: 'lifecycle', title: 'Process' },
    { id: 'projects', title: 'Portfolio' },
    { id: 'testimonials', title: 'Testimonials' },
    { id: 'contact', title: 'Contact' }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Scroll navigation
  useEffect(() => {
    let isScrolling = false;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (isScrolling) return;
      isScrolling = true;

      if (e.deltaY > 0) {
        nextSlide();
      } else {
        prevSlide();
      }

      setTimeout(() => {
        isScrolling = false;
      }, 800);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentSlide]);

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
    <div className="h-screen overflow-hidden bg-background relative">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass backdrop-blur-xl border-b border-brand-gold/20">
        <div className="max-w-7xl mx-auto px-8 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-4 architectural-accent">
              <div className="relative">
                <img 
                  src="/lovable-uploads/3a1e9978-cc53-4d2e-ae3a-8d5a295a8fdb.png" 
                  alt="SKROBAKI"
                  className="h-8 w-auto object-contain drop-shadow-lg cursor-pointer"
                  onClick={() => goToSlide(0)}
                />
                <div className="absolute -inset-2 bg-gradient-to-r from-brand-gold/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => onNavigate('services')}
                className="text-sm font-medium text-muted-foreground hover:text-brand-gold transition-colors duration-200"
              >
                Services
              </button>
              <button 
                onClick={() => onNavigate('projects')}
                className="text-sm font-medium text-muted-foreground hover:text-brand-gold transition-colors duration-200"
              >
                Projects
              </button>
              <button 
                onClick={() => onNavigate('about')}
                className="text-sm font-medium text-muted-foreground hover:text-brand-gold transition-colors duration-200"
              >
                About
              </button>
              <button 
                onClick={() => onNavigate('contact')}
                className="text-sm font-medium text-muted-foreground hover:text-brand-gold transition-colors duration-200"
              >
                Contact
              </button>
            </nav>

            {/* Login Button */}
            <Button 
              onClick={() => onNavigate('auth')}
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs font-medium rounded-md border-0 hover:bg-brand-gold/10 text-muted-foreground hover:text-brand-gold transition-all duration-200"
            >
              Login
            </Button>
          </div>
        </div>
      </header>

      {/* Slide Navigation */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-40 flex flex-col gap-3">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === index 
                ? 'bg-brand-gold scale-125' 
                : 'bg-muted-foreground/30 hover:bg-brand-gold/50'
            }`}
            title={slide.title}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="fixed left-8 top-1/2 transform -translate-y-1/2 z-40 glass rounded-full p-3 hover:bg-brand-gold/20 transition-all duration-300"
        disabled={currentSlide === 0}
      >
        <ChevronUp className="w-5 h-5 text-brand-gold" />
      </button>
      
      <button
        onClick={nextSlide}
        className="fixed left-8 top-1/2 transform translate-y-4 z-40 glass rounded-full p-3 hover:bg-brand-gold/20 transition-all duration-300"
        disabled={currentSlide === slides.length - 1}
      >
        <ChevronDown className="w-5 h-5 text-brand-gold" />
      </button>

      {/* Slides Container */}
      <div 
        className="flex flex-col transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateY(-${currentSlide * 100}vh)` }}
      >
        {/* Slide 1: Hero Section */}
        <section className="min-h-screen flex items-center justify-start overflow-hidden relative">
          {/* Enhanced background with architectural elements */}
          <div className="absolute inset-0">
            <div className="w-full h-full bg-gradient-to-br from-background via-background/90 to-background" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(200,145,70,0.05)_0%,transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(200,145,70,0.02)_0%,transparent_50%)]" />
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
          <div className="absolute inset-0 bg-gradient-to-br from-background/98 via-background/95 to-background/98" />
          
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
              
              <div className="flex flex-col sm:flex-row gap-4 mb-20">
                <button 
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium tracking-wide rounded-lg h-auto text-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                  style={{ 
                    backgroundColor: 'rgb(54,119,159)',
                    boxShadow: '0 4px 15px rgba(54, 119, 159, 0.2)',
                    border: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgb(44,99,139)';
                    e.currentTarget.style.boxShadow = '0 6px 25px rgba(54, 119, 159, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgb(54,119,159)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(54, 119, 159, 0.2)';
                  }}
                  onClick={() => {
                    console.log('Custom blue button clicked - color should be rgb(54,119,159)');
                    goToSlide(1);
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  Explore Services
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Button 
                  variant="outline" 
                  className="button-ghost px-6 py-3 text-sm font-medium tracking-wide rounded-lg h-auto flex items-center gap-2"
                  onClick={() => goToSlide(5)}
                >
                  <Calendar className="w-4 h-4" />
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

        {/* Slide 2: Services Overview */}
        <section className="min-h-screen flex items-center bg-background">
          <div className="max-w-7xl mx-auto px-8 py-20">
            <div className="mb-16">
              <div className="max-w-3xl">
                <h2 className="heading-lg text-foreground mb-8">
                  Our Approach
                </h2>
                <p className="body-lg text-muted-foreground">
                  Comprehensive architectural and construction services designed for clients who value precision, quality, and innovative solutions.
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {services.map((category, idx) => (
                <div key={idx} className="interactive-minimal group architectural-accent">
                  <Card className="glass-card border-brand-gold/10 overflow-hidden h-full group-hover:border-brand-gold/20 transition-all duration-500">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-8 bg-gradient-to-b from-brand-gold to-brand-gold-light rounded-full"></div>
                        <h3 className="heading-md text-foreground font-playfair text-xl">
                          {category.category}
                        </h3>
                      </div>
                      <div className="space-y-6">
                        {category.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex items-start gap-4 group/item hover:translate-x-2 transition-transform duration-300">
                            <div className="w-8 h-8 bg-brand-gold/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 group-hover/item:bg-brand-gold/30 transition-colors">
                              <item.icon className="w-4 h-4 text-brand-gold" />
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-medium text-foreground text-sm tracking-wide">{item.name}</h4>
                              <p className="text-muted-foreground text-xs font-light leading-relaxed">{item.description}</p>
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

        {/* Slide 3: Project Lifecycle Timeline */}
        <section className="min-h-screen flex items-center bg-card/30">
          <div className="max-w-7xl mx-auto px-8 py-20">
            <div className="mb-16">
              <div className="max-w-3xl">
                <h2 className="heading-lg text-card-foreground mb-8">
                  Project Lifecycle
                </h2>
                <p className="body-lg text-muted-foreground">
                  A systematic seven-stage approach ensuring seamless execution from initial concept to final delivery.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projectLifecycle.map((stage, idx) => (
                <div key={idx} className="interactive-minimal">
                  <Card className="glass-card border-border/10 h-full">
                    <CardContent className="p-6">
                      <div className="mb-4">
                        <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
                          <span className="text-foreground font-medium text-sm">{stage.stage}</span>
                        </div>
                        <h3 className="heading-md text-card-foreground mb-3 text-lg">
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

        {/* Slide 4: Featured Projects */}
        <section className="min-h-screen flex items-center bg-background">
          <div className="max-w-7xl mx-auto px-8 py-20">
            <div className="flex justify-between items-end mb-16">
              <div className="max-w-3xl">
                <h2 className="heading-lg text-foreground mb-8">
                  Selected Works
                </h2>
                <p className="body-lg text-muted-foreground">
                  A curated portfolio showcasing our commitment to architectural excellence and innovative design solutions.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map((project, idx) => (
                <div key={idx} className="interactive-minimal group">
                  <Card className="glass-card border-border/10 overflow-hidden h-full">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={project.image} 
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent"></div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="heading-md text-card-foreground mb-2 text-lg">
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

        {/* Slide 5: Testimonials */}
        <section className="min-h-screen flex items-center bg-card/30">
          <div className="max-w-6xl mx-auto px-8 py-20">
            <div className="mb-16">
              <div className="max-w-3xl">
                <h2 className="heading-lg text-card-foreground mb-8">
                  Client Testimonials
                </h2>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
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

        {/* Slide 6: Contact Section */}
        <section className="min-h-screen flex items-center bg-background">
          <div className="max-w-4xl mx-auto px-8 py-20 text-center">
            <div className="mb-16">
              <h2 className="heading-lg text-foreground mb-8">
                Start Your Project
              </h2>
              <p className="body-lg text-muted-foreground max-w-2xl mx-auto">
                Ready to transform your vision into reality? Contact us today to discuss your architectural project and discover how we can bring your dreams to life.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="glass-card p-8 rounded-2xl">
                <Phone className="w-8 h-8 text-brand-gold mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">Phone</h3>
                <p className="text-muted-foreground text-sm">+61 3 9xxx xxxx</p>
              </div>
              <div className="glass-card p-8 rounded-2xl">
                <Mail className="w-8 h-8 text-brand-gold mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">Email</h3>
                <p className="text-muted-foreground text-sm">hello@skrobaki.com</p>
              </div>
              <div className="glass-card p-8 rounded-2xl">
                <MapPin className="w-8 h-8 text-brand-gold mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">Location</h3>
                <p className="text-muted-foreground text-sm">Melbourne, VIC</p>
              </div>
            </div>

            <button 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium tracking-wide rounded-lg h-auto text-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              style={{ 
                backgroundColor: 'rgb(54,119,159)',
                boxShadow: '0 4px 15px rgba(54, 119, 159, 0.2)',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgb(44,99,139)';
                e.currentTarget.style.boxShadow = '0 6px 25px rgba(54, 119, 159, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgb(54,119,159)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(54, 119, 159, 0.2)';
              }}
              onClick={() => onNavigate('auth')}
            >
              Get Started Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};