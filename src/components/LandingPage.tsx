import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowRight, 
  Mail,
  Phone,
  MapPin,
  ChevronUp,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage = ({ onNavigate }: LandingPageProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const slides = [
    { id: 'hero', title: 'Brand' },
    { id: 'gallery', title: 'Gallery' },
    { id: 'collections', title: 'Collections' },
    { id: 'lifestyle', title: 'Lifestyle' },
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
      const threshold = 50;

      if (Math.abs(deltaY) > threshold) {
        isSwipping = true;
        
        if (deltaY > 0) {
          nextSlide();
        } else {
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

  return (
    <div className="h-screen overflow-hidden relative bg-brand-white">
      
      {/* Fixed Header with Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-brand-white/95 border-b border-brand-gray/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/461d9849-11c8-4272-a62b-c5c846dae9c3.png"
                alt="SKROBAKI"
                className="h-6 sm:h-8 cursor-pointer"
                onClick={() => goToSlide(0)}
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center justify-center space-x-8 flex-1">
              <button 
                onClick={() => onNavigate('services')}
                className="text-sm font-medium text-brand-charcoal/80 hover:text-brand-charcoal transition-colors duration-200 uppercase tracking-wide"
              >
                Collections
              </button>
              <button 
                onClick={() => onNavigate('projects')}
                className="text-sm font-medium text-brand-charcoal/80 hover:text-brand-charcoal transition-colors duration-200 uppercase tracking-wide"
              >
                About
              </button>
              <button 
                onClick={() => onNavigate('about')}
                className="text-sm font-medium text-brand-charcoal/80 hover:text-brand-charcoal transition-colors duration-200 uppercase tracking-wide"
              >
                Studio
              </button>
              <button 
                onClick={() => onNavigate('contact')}
                className="text-sm font-medium text-brand-charcoal/80 hover:text-brand-charcoal transition-colors duration-200 uppercase tracking-wide"
              >
                Contact
              </button>
            </nav>

            {/* Desktop Login Button */}
            <button 
              onClick={() => onNavigate('auth')}
              className="hidden lg:flex px-6 py-2 text-sm font-medium text-brand-charcoal hover:text-brand-white hover:bg-brand-charcoal border border-brand-charcoal/30 hover:border-brand-charcoal transition-all duration-300 uppercase tracking-wider"
            >
              Login
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-brand-charcoal hover:bg-brand-gray/10 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-brand-white/95 backdrop-blur-md border-b border-brand-gray/10 shadow-lg">
            <div className="px-4 py-4 space-y-3">
              <button 
                onClick={() => {
                  onNavigate('services');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left py-3 text-sm font-medium text-brand-charcoal/80 hover:text-brand-charcoal transition-colors duration-200 uppercase tracking-wide border-b border-brand-gray/10"
              >
                Collections
              </button>
              <button 
                onClick={() => {
                  onNavigate('projects');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left py-3 text-sm font-medium text-brand-charcoal/80 hover:text-brand-charcoal transition-colors duration-200 uppercase tracking-wide border-b border-brand-gray/10"
              >
                About
              </button>
              <button 
                onClick={() => {
                  onNavigate('about');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left py-3 text-sm font-medium text-brand-charcoal/80 hover:text-brand-charcoal transition-colors duration-200 uppercase tracking-wide border-b border-brand-gray/10"
              >
                Studio
              </button>
              <button 
                onClick={() => {
                  onNavigate('contact');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left py-3 text-sm font-medium text-brand-charcoal/80 hover:text-brand-charcoal transition-colors duration-200 uppercase tracking-wide border-b border-brand-gray/10"
              >
                Contact
              </button>
              <button 
                onClick={() => {
                  onNavigate('auth');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left py-3 px-6 mt-4 text-sm font-medium text-brand-charcoal hover:text-brand-white hover:bg-brand-charcoal border border-brand-charcoal/30 hover:border-brand-charcoal transition-all duration-300 uppercase tracking-wider text-center"
              >
                Login
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Vertical Navigation Dots - Right Side (All Screens) */}
      <div className="fixed right-2 sm:right-3 lg:right-4 top-1/2 transform -translate-y-1/2 z-40 flex flex-col gap-1.5 sm:gap-2 bg-brand-white/70 backdrop-blur-sm rounded-full py-1.5 sm:py-2 px-1 sm:px-1.5">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => goToSlide(index)}
            aria-label={`Go to ${slide.title}`}
            className="group p-1 sm:p-1.5 m-0 border-0 bg-transparent cursor-pointer"
          >
            <span
              className={`block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-transform duration-300 ${
                currentSlide === index 
                  ? 'bg-brand-charcoal scale-110' 
                  : 'bg-brand-gray/40 group-hover:bg-brand-charcoal/60'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Navigation Arrows - Hidden on mobile, shown on tablets/desktop */}
      <button
        onClick={prevSlide}
        className="hidden sm:block fixed left-4 lg:left-6 top-1/2 transform -translate-y-1/2 z-40 bg-brand-white/80 backdrop-blur-sm rounded-full p-2 lg:p-3 hover:bg-brand-white transition-all duration-300 border border-brand-gray/20 disabled:opacity-50"
        disabled={currentSlide === 0}
      >
        <ChevronUp className="w-4 h-4 lg:w-5 lg:h-5 text-brand-charcoal" />
      </button>
      
      <button
        onClick={nextSlide}
        className="hidden sm:block fixed left-4 lg:left-6 top-1/2 transform translate-y-8 lg:translate-y-10 z-40 bg-brand-white/80 backdrop-blur-sm rounded-full p-2 lg:p-3 hover:bg-brand-white transition-all duration-300 border border-brand-gray/20 disabled:opacity-50"
        disabled={currentSlide === slides.length - 1}
      >
        <ChevronDown className="w-4 h-4 lg:w-5 lg:h-5 text-brand-charcoal" />
      </button>

      {/* Slides Container */}
      <div 
        className="flex flex-col transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateY(-${currentSlide * 100}vh)` }}
      >
        {/* Slide 1: Hero Brand Section */}
        <section className="min-h-screen flex items-center justify-center overflow-hidden relative pt-16 sm:pt-20">
          <div className="absolute inset-0 bg-brand-white"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left: Brand Image */}
            <div className="relative order-2 lg:order-1">
              <div className="aspect-square bg-brand-black/5 rounded-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="SKROBAKI project management"
                  className="w-full h-full object-cover grayscale opacity-80"
                />
                <div className="absolute inset-0 bg-brand-black/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-brand-white px-4">
                    <h1 className="text-4xl sm:text-6xl lg:text-8xl font-playfair font-extralight mb-2 sm:mb-4 tracking-tight">
                      SKROBAKI
                    </h1>
                    <p className="text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.3em] uppercase opacity-90">
                      Project Management Excellence
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Brand Story */}
            <div className="space-y-6 lg:space-y-8 order-1 lg:order-2">
              <div>
                <p className="text-brand-gray/60 font-inter text-xs sm:text-sm tracking-[0.2em] uppercase mb-4 lg:mb-6">
                  Brand Story
                </p>
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-playfair font-light text-brand-charcoal mb-6 lg:mb-8 leading-tight">
                  Delivering success<br />
                  <span className="italic">on every project</span>
                </h2>
              </div>
              
              <div className="space-y-4 lg:space-y-6 text-brand-gray leading-relaxed text-sm sm:text-base">
                <p>
                  SKROBAKI specializes in comprehensive project management solutions that transform complex challenges into successful outcomes. 
                  We orchestrate every detail from conception to completion with precision and expertise.
                </p>
                <p className="hidden sm:block">
                  Our methodology combines strategic planning with agile execution, ensuring projects are delivered on time, within budget, 
                  and exceed expectations while maintaining the highest standards of quality.
                </p>
              </div>

              <button 
                onClick={() => onNavigate('auth')}
                className="group flex items-center gap-2 sm:gap-3 text-brand-charcoal hover:text-brand-black transition-colors duration-300 text-sm sm:text-base"
              >
                <span className="text-xs sm:text-sm uppercase tracking-widest">View Our Services</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </section>

        {/* Slide 2: Gallery Grid */}
        <section className="min-h-screen flex items-center overflow-hidden relative pt-16 sm:pt-20">
          <div className="absolute inset-0 bg-brand-white"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
            <div className="mb-8 lg:mb-12 text-center">
              <h2 className="text-2xl sm:text-4xl font-playfair font-light text-brand-charcoal mb-4 lg:mb-6">
                Our Process
              </h2>
              <div className="w-12 sm:w-16 h-px bg-brand-charcoal mx-auto"></div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 h-[60vh] sm:h-[70vh]">
              {/* Image 1 */}
              <div className="col-span-1 row-span-2">
                <div className="h-full bg-brand-cream rounded-lg overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    alt="Project planning"
                    className="w-full h-full object-cover grayscale"
                  />
                </div>
              </div>

              {/* Image 2 */}
              <div className="col-span-1">
                <div className="h-full bg-brand-beige rounded-lg overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    alt="Team collaboration"
                    className="w-full h-full object-cover grayscale"
                  />
                </div>
              </div>

              {/* Image 3 */}
              <div className="col-span-1">
                <div className="h-full bg-brand-sand rounded-lg overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    alt="Strategic planning"
                    className="w-full h-full object-cover grayscale"
                  />
                </div>
              </div>

              {/* Image 4 */}
              <div className="col-span-1 row-span-2">
                <div className="h-full bg-brand-charcoal rounded-lg overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    alt="Project execution"
                    className="w-full h-full object-cover grayscale"
                  />
                </div>
              </div>

              {/* Image 5 */}
              <div className="col-span-1">
                <div className="h-full bg-brand-light-gray/30 rounded-lg overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    alt="Data analysis"
                    className="w-full h-full object-cover grayscale"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Slide 3: Collections */}
        <section className="min-h-screen flex items-center overflow-hidden relative pt-16 sm:pt-20">
          <div className="absolute inset-0 bg-brand-white"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-center">
              {/* Left: Collection Info */}
              <div className="lg:col-span-1 space-y-6 lg:space-y-8 order-2 lg:order-1">
                <div>
                  <p className="text-brand-gray/60 font-inter text-xs sm:text-sm tracking-[0.2em] uppercase mb-3 lg:mb-4">
                    Projects • 2024
                  </p>
                  <h2 className="text-2xl sm:text-4xl font-playfair font-light text-brand-charcoal mb-4 lg:mb-6 leading-tight">
                    Featured<br />
                    <span className="italic">Works</span>
                  </h2>
                </div>
                
                <div className="space-y-3 lg:space-y-4 text-brand-gray text-sm sm:text-base">
                  <p className="leading-relaxed">
                    Each project showcases our expertise in delivering complex initiatives across diverse industries, 
                    from technology implementations to organizational transformations that drive measurable results.
                  </p>
                </div>

                <div className="pt-4 lg:pt-6">
                  <button className="text-xs sm:text-sm text-brand-charcoal hover:text-brand-black uppercase tracking-widest border-b border-brand-charcoal/30 hover:border-brand-charcoal transition-colors duration-300">
                    View All Projects
                  </button>
                </div>
              </div>

              {/* Center & Right: Collection Images */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-4 lg:gap-6 order-1 lg:order-2">
                <div className="space-y-4 lg:space-y-6">
                  <div className="aspect-[3/4] bg-brand-white rounded-lg overflow-hidden shadow-sm">
                    <img 
                      src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                      alt="Tech Implementation"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center px-2">
                    <h3 className="font-medium text-brand-charcoal mb-1 text-sm sm:text-base">Digital Transformation</h3>
                    <p className="text-xs sm:text-sm text-brand-gray">Completed 2024</p>
                  </div>
                </div>

                <div className="space-y-4 lg:space-y-6 mt-6 sm:mt-12">
                  <div className="aspect-[3/4] bg-brand-white rounded-lg overflow-hidden shadow-sm">
                    <img 
                      src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                      alt="Organizational Change"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center px-2">
                    <h3 className="font-medium text-brand-charcoal mb-1 text-sm sm:text-base">Enterprise Restructure</h3>
                    <p className="text-xs sm:text-sm text-brand-gray">Completed 2023</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Slide 4: Lifestyle */}
        <section className="min-h-screen flex items-center overflow-hidden relative pt-16 sm:pt-20">
          <div className="absolute inset-0 bg-brand-black"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              {/* Left: Large Lifestyle Image */}
              <div className="relative order-2 lg:order-1">
                <div className="aspect-[4/5] sm:aspect-[4/5] rounded-lg overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="SKROBAKI project management"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Right: Lifestyle Content */}
              <div className="space-y-6 lg:space-y-8 text-brand-white order-1 lg:order-2">
                <div>
                  <p className="text-brand-white/60 font-inter text-xs sm:text-sm tracking-[0.2em] uppercase mb-4 lg:mb-6">
                    Methodology • Philosophy
                  </p>
                  <h2 className="text-2xl sm:text-4xl font-playfair font-light mb-6 lg:mb-8 leading-tight">
                    Execute with<br />
                    <span className="italic">precision</span>
                  </h2>
                </div>
                
                <div className="space-y-4 lg:space-y-6 text-brand-white/80 leading-relaxed text-sm sm:text-base">
                  <p>
                    SKROBAKI is more than project management—it's a philosophy of strategic execution. 
                    We believe in transforming complex challenges into streamlined solutions that deliver exceptional value.
                  </p>
                  <p className="hidden sm:block">
                    Every initiative is approached with meticulous planning and adaptive leadership, 
                    ensuring stakeholder alignment while maintaining focus on measurable outcomes and sustainable success.
                  </p>
                </div>

                <div className="pt-6 lg:pt-8">
                  <div className="text-xs sm:text-sm text-brand-white/60 font-inter italic leading-relaxed">
                    "Excellence is never an accident. It is always the result of high intention, sincere effort, and intelligent execution." — Aristotle
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Slide 5: Contact */}
        <section className="min-h-screen flex items-center justify-center overflow-hidden relative pt-16 sm:pt-20 pb-20 sm:pb-0">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-cream to-brand-white"></div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 text-center">
            <div className="mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-playfair font-light text-brand-charcoal mb-6 lg:mb-8 leading-tight">
                Get in<br />
                <span className="italic">Touch</span>
              </h2>
              <div className="w-12 sm:w-16 h-px bg-brand-charcoal mx-auto mb-6 lg:mb-8"></div>
              <p className="text-sm sm:text-lg text-brand-gray leading-relaxed max-w-2xl mx-auto px-4">
                Let's discuss your next project challenge. Contact us to explore how 
                SKROBAKI can transform your vision into successful outcomes through strategic project management.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-8 sm:gap-12 mb-12 lg:mb-16">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand-charcoal/5 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-brand-charcoal" />
                </div>
                <h3 className="text-xs sm:text-sm uppercase tracking-wider text-brand-charcoal mb-1 lg:mb-2">Email</h3>
                <p className="text-brand-gray text-sm sm:text-base">hello@skrobaki.studio</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand-charcoal/5 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-brand-charcoal" />
                </div>
                <h3 className="text-xs sm:text-sm uppercase tracking-wider text-brand-charcoal mb-1 lg:mb-2">Phone</h3>
                <p className="text-brand-gray text-sm sm:text-base">+1 (555) 123-4567</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand-charcoal/5 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-brand-charcoal" />
                </div>
                <h3 className="text-xs sm:text-sm uppercase tracking-wider text-brand-charcoal mb-1 lg:mb-2">Studio</h3>
                <p className="text-brand-gray text-sm sm:text-base">New York, NY</p>
              </div>
            </div>

            <div className="space-y-4 lg:space-y-6">
              <button 
                onClick={() => onNavigate('auth')}
                className="px-8 sm:px-12 py-3 sm:py-4 text-xs sm:text-sm font-medium text-brand-charcoal border border-brand-charcoal hover:bg-brand-charcoal hover:text-brand-white transition-all duration-500 uppercase tracking-widest"
              >
                Start Conversation
              </button>
              
              <p className="text-xs text-brand-gray/60 uppercase tracking-[0.2em] sm:tracking-[0.3em] px-4">
                SKROBAKI • Project Management Excellence • est. 2024
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};