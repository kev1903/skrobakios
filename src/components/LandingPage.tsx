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
import heroBackground from '@/assets/hero-background.png';
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
    setCurrentSlide((prev) => prev < slides.length - 1 ? prev + 1 : prev);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => prev > 0 ? prev - 1 : prev);
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
      }, 1400);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentSlide]);

  // Touch/swipe navigation
  useEffect(() => {
    let startY = 0;
    let isSwipping = false;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      isSwipping = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isSwipping) return;
      
      const endY = e.changedTouches[0].clientY;
      const deltaY = startY - endY;
      const threshold = 50; // Minimum swipe distance

      if (Math.abs(deltaY) > threshold) {
        isSwipping = true;
        
        if (deltaY > 0) {
          // Swipe up - next slide
          nextSlide();
        } else {
          // Swipe down - previous slide
          prevSlide();
        }

        setTimeout(() => {
          isSwipping = false;
        }, 800);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
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
    <div className="h-screen overflow-hidden relative">
      {/* Full Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroBackground})`
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      {/* Fixed Header with Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md opacity-0 pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/3a1e9978-cc53-4d2e-ae3a-8d5a295a8fdb.png" 
                alt="SKROBAKI"
                className="h-8 w-auto object-contain cursor-pointer"
                onClick={() => goToSlide(0)}
              />
            </div>

            {/* Centered Navigation */}
            <nav className="hidden lg:flex items-center justify-center space-x-8 flex-1">
              <button 
                onClick={() => onNavigate('services')}
                className="text-sm font-medium text-white/90 hover:text-white transition-colors duration-200"
              >
                Services
              </button>
              <button 
                onClick={() => onNavigate('projects')}
                className="text-sm font-medium text-white/90 hover:text-white transition-colors duration-200"
              >
                Projects
              </button>
              <button 
                onClick={() => onNavigate('about')}
                className="text-sm font-medium text-white/90 hover:text-white transition-colors duration-200"
              >
                About
              </button>
              <button 
                onClick={() => onNavigate('contact')}
                className="text-sm font-medium text-white/90 hover:text-white transition-colors duration-200"
              >
                Contact
              </button>
            </nav>

            {/* Mobile Navigation Menu */}
            <div className="lg:hidden flex items-center space-x-4">
              <nav className="flex items-center space-x-4">
                <button 
                  onClick={() => onNavigate('services')}
                  className="text-xs font-medium text-white/90 hover:text-white transition-colors duration-200"
                >
                  Services
                </button>
                <button 
                  onClick={() => onNavigate('projects')}
                  className="text-xs font-medium text-white/90 hover:text-white transition-colors duration-200"
                >
                  Projects
                </button>
              </nav>
            </div>

            {/* Login Button */}
            <button 
              onClick={() => onNavigate('auth')}
              className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white border border-white/20 rounded-full hover:border-white/40 transition-all duration-200"
            >
              Login
            </button>
          </div>
        </div>
      </header>

      {/* Slide Navigation */}
      <div className="fixed right-3 sm:right-6 lg:right-8 top-1/2 transform -translate-y-1/2 z-40 flex flex-col gap-2 sm:gap-3">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
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
        className="fixed left-3 sm:left-6 lg:left-8 top-1/2 transform -translate-y-1/2 z-40 glass rounded-full p-2 sm:p-3 hover:bg-brand-gold/20 transition-all duration-300"
        disabled={currentSlide === 0}
      >
        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-brand-gold" />
      </button>
      
      <button
        onClick={nextSlide}
        className="fixed left-3 sm:left-6 lg:left-8 top-1/2 transform translate-y-8 sm:translate-y-10 z-40 glass rounded-full p-2 sm:p-3 hover:bg-brand-gold/20 transition-all duration-300"
        disabled={currentSlide === slides.length - 1}
      >
        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-brand-gold" />
      </button>

      {/* Slides Container */}
      <div 
        className="flex flex-col transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateY(-${currentSlide * 100}vh)` }}
      >
        {/* Slide 1: Hero Section */}
        <section className="min-h-screen flex items-center justify-center overflow-hidden relative">
          {/* Main Content - Centered on Background */}
          <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-playfair font-light text-white mb-6 leading-tight">
              Transform your<br />
              <span className="italic font-normal">digital presence.</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed font-inter font-light">
              From zero to extraordinary. Let's create your digital reality.
            </p>
            
            {/* CTA Button */}
            <button 
              onClick={() => onNavigate('auth')}
              className="px-8 py-4 text-base font-medium text-white/90 hover:text-white border border-white/30 rounded-full hover:border-white/60 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
            >
              Send a message
            </button>
          </div>
          
          {/* Bottom Tagline */}
          <div className="absolute bottom-8 left-8 z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-light text-white mb-4">
              Work fast. Live slow.
            </h2>
            <p className="text-white/70 font-inter text-sm tracking-wide">
              skrobaki.design • web • product • brand
            </p>
          </div>
        </section>

        {/* Slide 2: Services Overview */}
        <section className="min-h-screen flex items-center overflow-hidden relative">
          {/* Background Image for Services */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`
            }}
          >
            <div className="absolute inset-0 bg-black/60"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="mb-12 sm:mb-16">
              <div className="max-w-3xl">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl text-white mb-6 sm:mb-8 font-playfair">
                  Our Approach
                </h2>
                <p className="text-base sm:text-lg lg:text-xl text-white/90">
                  Comprehensive architectural and construction services designed for clients who value precision, quality, and innovative solutions.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {services.map((category, idx) => (
                <div key={idx} className="interactive-minimal group architectural-accent">
                  <Card className="glass-card border-white/10 overflow-hidden h-full group-hover:border-white/20 transition-all duration-500 bg-white/5 backdrop-blur-xl">
                    <CardContent className="p-6 sm:p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-8 bg-gradient-to-b from-white/60 to-white/30 rounded-full"></div>
                        <h3 className="text-lg sm:text-xl text-white font-playfair">
                          {category.category}
                        </h3>
                      </div>
                      <div className="space-y-4 sm:space-y-6">
                        {category.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex items-start gap-3 sm:gap-4 group/item hover:translate-x-2 transition-transform duration-300">
                            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 group-hover/item:bg-white/30 transition-colors">
                              <item.icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-medium text-white text-sm tracking-wide">{item.name}</h4>
                              <p className="text-white/80 text-xs font-light leading-relaxed">{item.description}</p>
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
        <section className="min-h-screen flex items-center overflow-hidden relative">
          {/* Background Image for Process */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`
            }}
          >
            <div className="absolute inset-0 bg-black/65"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="mb-12 sm:mb-16">
              <div className="max-w-3xl">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl text-white mb-6 sm:mb-8 font-playfair">
                  Project Lifecycle
                </h2>
                <p className="text-base sm:text-lg lg:text-xl text-white/90">
                  A systematic seven-stage approach ensuring seamless execution from initial concept to final delivery.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {projectLifecycle.map((stage, idx) => (
                <div key={idx} className="interactive-minimal">
                  <Card className="glass-card border-white/10 h-full bg-white/5 backdrop-blur-xl">
                    <CardContent className="p-4 sm:p-6">
                      <div className="mb-4">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                          <span className="text-white font-medium text-sm">{stage.stage}</span>
                        </div>
                        <h3 className="text-base sm:text-lg text-white mb-3">
                          {stage.title}
                        </h3>
                      </div>
                      <p className="text-white/80 text-sm font-light leading-relaxed">{stage.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Slide 4: Featured Projects */}
        <section className="min-h-screen flex items-center overflow-hidden relative">
          {/* Background Image for Projects */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1545558014-8692077e9b5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`
            }}
          >
            <div className="absolute inset-0 bg-black/55"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="flex justify-between items-end mb-12 sm:mb-16">
              <div className="max-w-3xl">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl text-white mb-6 sm:mb-8 font-playfair">
                  Selected Works
                </h2>
                <p className="text-base sm:text-lg lg:text-xl text-white/90">
                  A curated portfolio showcasing our commitment to architectural excellence and innovative design solutions.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {featuredProjects.map((project, idx) => (
                <div key={idx} className="interactive-minimal group">
                  <Card className="glass-card border-white/10 overflow-hidden h-full bg-white/5 backdrop-blur-xl">
                    <div className="relative h-40 sm:h-48 overflow-hidden">
                      <img 
                        src={project.image} 
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    </div>
                    <CardContent className="p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg text-white mb-2">
                        {project.title}
                      </h3>
                      <p className="text-white/80 text-sm font-light mb-3">{project.location}</p>
                      <p className="text-white/70 text-sm font-light leading-relaxed">{project.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Slide 5: Testimonials */}
        <section className="min-h-screen flex items-center overflow-hidden relative">
          {/* Background Image for Testimonials */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`
            }}
          >
            <div className="absolute inset-0 bg-black/70"></div>
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="mb-12 sm:mb-16">
              <div className="max-w-3xl">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl text-white mb-6 sm:mb-8 font-playfair">
                  Client Testimonials
                </h2>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {testimonials.map((testimonial, idx) => (
                <div key={idx} className="interactive-minimal">
                  <Card className="glass-card border-white/10 h-full bg-white/5 backdrop-blur-xl">
                    <CardContent className="p-6 sm:p-8">
                      <div className="mb-6">
                        <Quote className="w-6 h-6 text-white/30 mb-4" />
                        <p className="text-white text-sm sm:text-base leading-relaxed font-light italic">
                          "{testimonial.quote}"
                        </p>
                      </div>
                      <div className="border-t border-white/20 pt-6">
                        <p className="font-medium text-white text-sm mb-1">{testimonial.author}</p>
                        <p className="text-white/70 text-xs font-light">{testimonial.project}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Slide 6: Contact Section */}
        <section className="min-h-screen flex items-center overflow-hidden relative">
          {/* Background Image for Contact */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`
            }}
          >
            <div className="absolute inset-0 bg-black/65"></div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
            <div className="mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl text-white mb-6 sm:mb-8 font-playfair">
                Start Your Project
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto">
                Ready to transform your vision into reality? Contact us today to discuss your architectural project and discover how we can bring your dreams to life.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
              <div className="glass-card p-6 sm:p-8 rounded-2xl bg-white/5 backdrop-blur-xl border-white/10">
                <Phone className="w-8 h-8 text-white mx-auto mb-4" />
                <h3 className="font-medium text-white mb-2">Phone</h3>
                <p className="text-white/80 text-sm">+61 3 9xxx xxxx</p>
              </div>
              <div className="glass-card p-6 sm:p-8 rounded-2xl bg-white/5 backdrop-blur-xl border-white/10">
                <Mail className="w-8 h-8 text-white mx-auto mb-4" />
                <h3 className="font-medium text-white mb-2">Email</h3>
                <p className="text-white/80 text-sm">hello@skrobaki.com</p>
              </div>
              <div className="glass-card p-6 sm:p-8 rounded-2xl sm:col-span-2 lg:col-span-1 bg-white/5 backdrop-blur-xl border-white/10">
                <MapPin className="w-8 h-8 text-white mx-auto mb-4" />
                <h3 className="font-medium text-white mb-2">Location</h3>
                <p className="text-white/80 text-sm">Melbourne, VIC</p>
              </div>
            </div>

            <button 
              onClick={() => onNavigate('auth')}
              className="px-8 py-4 text-base font-medium text-white/90 hover:text-white border border-white/30 rounded-full hover:border-white/60 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
            >
              Get Started Today
              <ArrowRight className="ml-2 w-5 h-5 inline" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};