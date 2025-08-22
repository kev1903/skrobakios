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
      
      {/* Fixed Header with Navigation - Hidden */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md opacity-0 pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/3a1e9978-cc53-4d2e-ae3a-8d5a295a8fdb.png" 
                alt="SOLEIL ECLAT"
                className="h-8 w-auto object-contain cursor-pointer"
                onClick={() => goToSlide(0)}
              />
            </div>

            {/* Centered Navigation */}
            <nav className="hidden lg:flex items-center justify-center space-x-8 flex-1">
              <button 
                onClick={() => onNavigate('services')}
                className="text-sm font-medium text-brand-navy/90 hover:text-brand-navy transition-colors duration-200"
              >
                Services
              </button>
              <button 
                onClick={() => onNavigate('projects')}
                className="text-sm font-medium text-brand-navy/90 hover:text-brand-navy transition-colors duration-200"
              >
                Projects
              </button>
              <button 
                onClick={() => onNavigate('about')}
                className="text-sm font-medium text-brand-navy/90 hover:text-brand-navy transition-colors duration-200"
              >
                About
              </button>
              <button 
                onClick={() => onNavigate('contact')}
                className="text-sm font-medium text-brand-navy/90 hover:text-brand-navy transition-colors duration-200"
              >
                Contact
              </button>
            </nav>

            {/* Mobile Navigation Menu */}
            <div className="lg:hidden flex items-center space-x-4">
              <nav className="flex items-center space-x-4">
                <button 
                  onClick={() => onNavigate('services')}
                  className="text-xs font-medium text-brand-navy/90 hover:text-brand-navy transition-colors duration-200"
                >
                  Services
                </button>
                <button 
                  onClick={() => onNavigate('projects')}
                  className="text-xs font-medium text-brand-navy/90 hover:text-brand-navy transition-colors duration-200"
                >
                  Projects
                </button>
              </nav>
            </div>

            {/* Login Button */}
            <button 
              onClick={() => onNavigate('auth')}
              className="px-4 py-2 text-sm font-medium text-brand-navy/90 hover:text-brand-navy border border-brand-navy/20 hover:border-brand-navy/40 transition-all duration-200 uppercase tracking-wider"
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
          {/* Elegant Background Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-cream/80 via-background/70 to-brand-cream/60"></div>
          
          {/* Main Content - Centered */}
          <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
            {/* Brand Logo/Title */}
            <div className="mb-16">
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-playfair font-light text-brand-navy mb-8 leading-none tracking-tight">
                Soleil<br />
                <span className="italic font-normal text-brand-gold">Éclat</span>
              </h1>
              
              {/* Elegant Subtitle */}
              <p className="text-xl sm:text-2xl md:text-3xl text-brand-gray font-inter font-light leading-relaxed max-w-3xl mx-auto">
                Luxury redefined through<br className="hidden sm:block" />
                timeless elegance and sophistication
              </p>
            </div>
            
            {/* Minimal CTA */}
            <button 
              onClick={() => onNavigate('auth')}
              className="group px-12 py-4 text-sm font-medium text-brand-navy border border-brand-navy/30 hover:border-brand-navy hover:bg-brand-navy hover:text-white transition-all duration-500 uppercase tracking-widest"
            >
              Discover Collection
            </button>
          </div>
          
          {/* Minimal Brand Mark */}
          <div className="absolute bottom-12 right-12 z-10">
            <div className="text-right">
              <p className="text-brand-gray/60 font-inter text-xs tracking-[0.3em] uppercase mb-2">
                Est. 2024
              </p>
              <div className="w-16 h-px bg-brand-navy/30"></div>
            </div>
          </div>
        </section>

        {/* Slide 2: Color Variations */}
        <section className="min-h-screen flex items-center overflow-hidden relative">
          {/* Elegant Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-cream/90 to-background/95"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              {/* Left: Text Content */}
              <div className="max-w-2xl">
                <div className="mb-8">
                  <p className="text-brand-gray/60 font-inter text-sm tracking-[0.2em] uppercase mb-4">
                    Brand • Variations • 2024
                  </p>
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-playfair font-light text-brand-navy mb-8 leading-tight">
                    Color<br />
                    <span className="italic text-brand-gold">Variations</span>
                  </h2>
                  <p className="text-lg text-brand-gray leading-relaxed font-inter font-light mb-8">
                    Here, you can show off your logo in different color variations.
                  </p>
                </div>
                
                <div className="text-sm text-brand-gray/70 font-inter leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
                </div>
              </div>

              {/* Right: Color Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Navy Blue */}
                <div className="aspect-square bg-brand-navy rounded-lg flex items-center justify-center group hover:scale-105 transition-transform duration-300">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-playfair font-light text-white mb-2">
                      Soleil<br />
                      <span className="italic">Éclat</span>
                    </div>
                  </div>
                </div>

                {/* Light Blue */}
                <div className="aspect-square bg-brand-blue rounded-lg flex items-center justify-center group hover:scale-105 transition-transform duration-300">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-playfair font-light text-white mb-2">
                      Soleil<br />
                      <span className="italic">Éclat</span>
                    </div>
                  </div>
                </div>

                {/* Gold */}
                <div className="aspect-square bg-brand-gold rounded-lg flex items-center justify-center group hover:scale-105 transition-transform duration-300">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-playfair font-light text-white mb-2">
                      Soleil<br />
                      <span className="italic">Éclat</span>
                    </div>
                  </div>
                </div>

                {/* Amber */}
                <div className="aspect-square bg-brand-amber rounded-lg flex items-center justify-center group hover:scale-105 transition-transform duration-300">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-playfair font-light text-white mb-2">
                      Soleil<br />
                      <span className="italic">Éclat</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Slide 3: Secondary Logo */}
        <section className="min-h-screen flex items-center overflow-hidden relative">
          {/* Clean Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-background to-brand-cream/30"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              {/* Left: Text Content */}
              <div className="max-w-2xl">
                <div className="mb-12">
                  <p className="text-brand-gray/60 font-inter text-sm tracking-[0.2em] uppercase mb-4">
                    Brand • Name • Guidelines • 2024
                  </p>
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-playfair font-light text-brand-navy mb-8 leading-tight">
                    Secondary<br />
                    <span className="italic text-brand-gold">Logo</span>
                  </h2>
                </div>
                
                <div className="space-y-6">
                  <p className="text-lg text-brand-gray leading-relaxed font-inter font-light">
                    Here is your secondary logo. Use this space to explain how your secondary logo will be used.
                  </p>
                  
                  <div className="pt-6 border-t border-brand-gray/20">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-2 h-2 rounded-full bg-brand-navy"></div>
                      <p className="text-sm text-brand-gray/70 font-inter">
                        Minimum size: 24px height
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-brand-gold"></div>
                      <p className="text-sm text-brand-gray/70 font-inter">
                        Clear space: 1x logo height on all sides
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Large Logo Display */}
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center p-16 border border-brand-gray/20 rounded-lg bg-white/50 backdrop-blur-sm">
                  <div className="text-7xl sm:text-8xl lg:text-9xl font-playfair font-light text-brand-navy mb-4 leading-none">
                    Soleil<br />
                    <span className="italic text-brand-gold">Éclat</span>
                  </div>
                  
                  <div className="mt-8 pt-8 border-t border-brand-gray/20">
                    <p className="text-sm text-brand-gray/60 font-inter tracking-widest uppercase">
                      Secondary Mark
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Slide 4: Colors Palette */}
        <section className="min-h-screen flex items-center overflow-hidden relative">
          {/* Elegant Background with Image */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`
            }}
          >
            <div className="absolute inset-0 bg-brand-cream/85"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              {/* Left: Color Swatches */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {/* Navy */}
                  <div className="group">
                    <div className="w-full h-32 bg-brand-navy rounded-lg mb-3 group-hover:scale-105 transition-transform duration-300"></div>
                    <p className="text-sm font-medium text-brand-navy">#1E3C40</p>
                  </div>
                  
                  {/* Gold */}
                  <div className="group">
                    <div className="w-full h-32 bg-brand-gold rounded-lg mb-3 group-hover:scale-105 transition-transform duration-300"></div>
                    <p className="text-sm font-medium text-brand-navy">#BF9F54</p>
                  </div>
                  
                  {/* Blue */}
                  <div className="group">
                    <div className="w-full h-32 bg-brand-blue rounded-lg mb-3 group-hover:scale-105 transition-transform duration-300"></div>
                    <p className="text-sm font-medium text-brand-navy">#4284D0</p>
                  </div>
                  
                  {/* Amber */}
                  <div className="group">
                    <div className="w-full h-32 bg-brand-amber rounded-lg mb-3 group-hover:scale-105 transition-transform duration-300"></div>
                    <p className="text-sm font-medium text-brand-navy">#A29E21</p>
                  </div>
                </div>
              </div>

              {/* Right: Text Content */}
              <div className="max-w-2xl">
                <div className="mb-8">
                  <p className="text-brand-gray/60 font-inter text-sm tracking-[0.2em] uppercase mb-4">
                    Brand • Guidelines • 2024
                  </p>
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-playfair font-light text-brand-navy mb-8 leading-tight">
                    <span className="italic text-brand-gold">Colors</span>
                  </h2>
                </div>
                
                <div className="space-y-6">
                  <p className="text-lg text-brand-gray leading-relaxed font-inter font-light">
                    The primary color palette is consistent throughout all communications. Use this space to explain the use of the colors within the brand.
                  </p>
                  
                  <div className="pt-6">
                    <p className="text-sm text-brand-gray/70 font-inter leading-relaxed">
                      Each color has been carefully selected to convey sophistication, elegance, and timeless appeal. The navy represents stability and trust, while gold adds luxury and refinement.
                    </p>
                  </div>
                </div>
              </div>
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

        {/* Slide 5: Contact Section */}
        <section className="min-h-screen flex items-center overflow-hidden relative">
          {/* Elegant Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-cream/95 to-background"></div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="text-center mb-16">
              <p className="text-brand-gray/60 font-inter text-sm tracking-[0.2em] uppercase mb-6">
                Contact • Connect • 2024
              </p>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-playfair font-light text-brand-navy mb-12 leading-tight">
                Get in<br />
                <span className="italic text-brand-gold">Touch</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12 mb-16">
              <div className="text-center group">
                <div className="w-16 h-16 bg-brand-navy/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-navy/20 transition-colors duration-300">
                  <Mail className="w-6 h-6 text-brand-navy" />
                </div>
                <h3 className="text-lg font-medium text-brand-navy mb-2 font-inter">Email</h3>
                <p className="text-brand-gray text-sm">hello@soleileclat.com</p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-gold/20 transition-colors duration-300">
                  <Phone className="w-6 h-6 text-brand-gold" />
                </div>
                <h3 className="text-lg font-medium text-brand-navy mb-2 font-inter">Phone</h3>
                <p className="text-brand-gray text-sm">+1 (555) 123-4567</p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-blue/20 transition-colors duration-300">
                  <MapPin className="w-6 h-6 text-brand-blue" />
                </div>
                <h3 className="text-lg font-medium text-brand-navy mb-2 font-inter">Location</h3>
                <p className="text-brand-gray text-sm">New York, NY</p>
              </div>
            </div>

            <div className="text-center">
              <button 
                onClick={() => onNavigate('auth')}
                className="group px-12 py-4 text-sm font-medium text-brand-navy border border-brand-navy/30 hover:border-brand-navy hover:bg-brand-navy hover:text-white transition-all duration-500 uppercase tracking-widest"
              >
                Start Conversation
              </button>
            </div>
          </div>
        </section>

        {/* Slide 6: Brand Footer */}
        <section className="min-h-screen flex items-center justify-center overflow-hidden relative">
          {/* Elegant Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-navy/95 to-brand-blue/20"></div>
          
          {/* Main Content - Centered */}
          <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            {/* Large Brand Logo */}
            <div className="mb-16">
              <h1 className="text-8xl sm:text-9xl md:text-[12rem] lg:text-[14rem] font-playfair font-light text-white/10 mb-8 leading-none tracking-tight">
                Soleil<br />
                <span className="italic font-normal">Éclat</span>
              </h1>
              
              {/* Brand Tagline */}
              <p className="text-lg sm:text-xl text-white/70 font-inter font-light leading-relaxed max-w-2xl mx-auto mb-12">
                Where luxury meets sophistication.<br />
                Crafting experiences that transcend time.
              </p>
            </div>
            
            {/* Brand Credits */}
            <div className="text-center">
              <div className="inline-block">
                <p className="text-white/40 font-inter text-xs tracking-[0.3em] uppercase mb-4">
                  Brand Guidelines • Soleil Éclat • 2024
                </p>
                <div className="w-32 h-px bg-white/20 mx-auto"></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};