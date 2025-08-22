import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowRight, 
  Mail,
  Phone,
  MapPin,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage = ({ onNavigate }: LandingPageProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

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
      
      {/* Fixed Header with Navigation - Restored */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-brand-white/80 border-b border-brand-gray/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/461d9849-11c8-4272-a62b-c5c846dae9c3.png"
                alt="SKROBAKI"
                className="h-8 cursor-pointer"
                onClick={() => goToSlide(0)}
              />
            </div>

            {/* Centered Navigation */}
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

            {/* Mobile Navigation Menu */}
            <div className="lg:hidden flex items-center space-x-4">
              <nav className="flex items-center space-x-4">
                <button 
                  onClick={() => onNavigate('services')}
                  className="text-xs font-medium text-brand-charcoal/80 hover:text-brand-charcoal transition-colors duration-200 uppercase tracking-wide"
                >
                  Collections
                </button>
                <button 
                  onClick={() => onNavigate('projects')}
                  className="text-xs font-medium text-brand-charcoal/80 hover:text-brand-charcoal transition-colors duration-200 uppercase tracking-wide"
                >
                  Studio
                </button>
              </nav>
            </div>

            {/* Shop Button */}
            <button 
              onClick={() => onNavigate('auth')}
              className="px-6 py-2 text-sm font-medium text-brand-charcoal hover:text-brand-white hover:bg-brand-charcoal border border-brand-charcoal/30 hover:border-brand-charcoal transition-all duration-300 uppercase tracking-wider"
            >
              Projects
            </button>
          </div>
        </div>
      </header>

      {/* Slide Navigation */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 flex flex-col gap-3">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === index 
                ? 'bg-brand-charcoal scale-125' 
                : 'bg-brand-gray/30 hover:bg-brand-charcoal/50'
            }`}
            title={slide.title}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="fixed left-6 top-1/2 transform -translate-y-1/2 z-40 bg-brand-white/80 backdrop-blur-sm rounded-full p-3 hover:bg-brand-white transition-all duration-300 border border-brand-gray/20"
        disabled={currentSlide === 0}
      >
        <ChevronUp className="w-5 h-5 text-brand-charcoal" />
      </button>
      
      <button
        onClick={nextSlide}
        className="fixed left-6 top-1/2 transform translate-y-10 z-40 bg-brand-white/80 backdrop-blur-sm rounded-full p-3 hover:bg-brand-white transition-all duration-300 border border-brand-gray/20"
        disabled={currentSlide === slides.length - 1}
      >
        <ChevronDown className="w-5 h-5 text-brand-charcoal" />
      </button>

      {/* Slides Container */}
      <div 
        className="flex flex-col transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateY(-${currentSlide * 100}vh)` }}
      >
        {/* Slide 1: Hero Brand Section */}
        <section className="min-h-screen flex items-center justify-center overflow-hidden relative">
          <div className="absolute inset-0 bg-brand-white"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Brand Image */}
            <div className="relative">
              <div className="aspect-square bg-brand-black/5 rounded-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="SKROBAKI architecture"
                  className="w-full h-full object-cover grayscale opacity-80"
                />
                <div className="absolute inset-0 bg-brand-black/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-brand-white">
                    <h1 className="text-6xl lg:text-8xl font-playfair font-extralight mb-4 tracking-tight">
                      SKROBAKI
                    </h1>
                    <p className="text-sm tracking-[0.3em] uppercase opacity-90">
                      Architectural Innovation
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Brand Story */}
            <div className="space-y-8">
              <div>
                <p className="text-brand-gray/60 font-inter text-sm tracking-[0.2em] uppercase mb-6">
                  Brand Story
                </p>
                <h2 className="text-4xl lg:text-5xl font-playfair font-light text-brand-charcoal mb-8 leading-tight">
                  Designed for the<br />
                  <span className="italic">modern world</span>
                </h2>
              </div>
              
              <div className="space-y-6 text-brand-gray leading-relaxed">
                <p>
                  SKROBAKI represents the intersection of innovative design and functional architecture. 
                  Every project is thoughtfully conceived to create spaces that inspire and endure.
                </p>
                <p>
                  Our philosophy embraces both form and function, creating environments that evolve 
                  with the changing needs of modern life while maintaining timeless aesthetic appeal.
                </p>
              </div>

              <button 
                onClick={() => onNavigate('auth')}
                className="group flex items-center gap-3 text-brand-charcoal hover:text-brand-black transition-colors duration-300"
              >
                <span className="text-sm uppercase tracking-widest">Explore Projects</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </section>

        {/* Slide 2: Gallery Grid */}
        <section className="min-h-screen flex items-center overflow-hidden relative">
          <div className="absolute inset-0 bg-brand-white"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="mb-12 text-center">
              <h2 className="text-4xl font-playfair font-light text-brand-charcoal mb-6">
                Gallery
              </h2>
              <div className="w-16 h-px bg-brand-charcoal mx-auto"></div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 h-[70vh]">
              {/* Image 1 */}
              <div className="col-span-1 row-span-2">
                <div className="h-full bg-brand-cream rounded-lg overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    alt="Architectural detail"
                    className="w-full h-full object-cover grayscale"
                  />
                </div>
              </div>

              {/* Image 2 */}
              <div className="col-span-1">
                <div className="h-full bg-brand-beige rounded-lg overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    alt="Modern architecture"
                    className="w-full h-full object-cover grayscale"
                  />
                </div>
              </div>

              {/* Image 3 */}
              <div className="col-span-1">
                <div className="h-full bg-brand-sand rounded-lg overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    alt="Interior design"
                    className="w-full h-full object-cover grayscale"
                  />
                </div>
              </div>

              {/* Image 4 */}
              <div className="col-span-1 row-span-2">
                <div className="h-full bg-brand-charcoal rounded-lg overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    alt="Architectural structure"
                    className="w-full h-full object-cover grayscale"
                  />
                </div>
              </div>

              {/* Image 5 */}
              <div className="col-span-1">
                <div className="h-full bg-brand-light-gray/30 rounded-lg overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1511818966892-d7d671e672a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    alt="Geometric design"
                    className="w-full h-full object-cover grayscale"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Slide 3: Collections */}
        <section className="min-h-screen flex items-center overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-cream to-brand-beige/50"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid lg:grid-cols-3 gap-12 items-center">
              {/* Left: Collection Info */}
              <div className="lg:col-span-1 space-y-8">
                <div>
                  <p className="text-brand-gray/60 font-inter text-sm tracking-[0.2em] uppercase mb-4">
                    Projects • 2024
                  </p>
                  <h2 className="text-4xl font-playfair font-light text-brand-charcoal mb-6 leading-tight">
                    Featured<br />
                    <span className="italic">Works</span>
                  </h2>
                </div>
                
                <div className="space-y-4 text-brand-gray">
                  <p className="leading-relaxed">
                    Each project represents our commitment to innovative design and exceptional craftsmanship, 
                    created for clients who value both aesthetic excellence and functional integrity.
                  </p>
                </div>

                <div className="pt-6">
                  <button className="text-sm text-brand-charcoal hover:text-brand-black uppercase tracking-widest border-b border-brand-charcoal/30 hover:border-brand-charcoal transition-colors duration-300">
                    View All Projects
                  </button>
                </div>
              </div>

              {/* Center & Right: Collection Images */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="aspect-[3/4] bg-brand-white rounded-lg overflow-hidden shadow-sm">
                    <img 
                      src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                      alt="Residential Project"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium text-brand-charcoal mb-1">Urban Villa</h3>
                    <p className="text-sm text-brand-gray">Completed 2024</p>
                  </div>
                </div>

                <div className="space-y-6 mt-12">
                  <div className="aspect-[3/4] bg-brand-white rounded-lg overflow-hidden shadow-sm">
                    <img 
                      src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                      alt="Commercial Project"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium text-brand-charcoal mb-1">Corporate Tower</h3>
                    <p className="text-sm text-brand-gray">Completed 2023</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Slide 4: Lifestyle */}
        <section className="min-h-screen flex items-center overflow-hidden relative">
          <div className="absolute inset-0 bg-brand-black"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left: Large Lifestyle Image */}
              <div className="relative">
                <div className="aspect-[4/5] rounded-lg overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="SKROBAKI architecture"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Right: Lifestyle Content */}
              <div className="space-y-8 text-brand-white">
                <div>
                  <p className="text-brand-white/60 font-inter text-sm tracking-[0.2em] uppercase mb-6">
                    Design • Philosophy
                  </p>
                  <h2 className="text-4xl font-playfair font-light mb-8 leading-tight">
                    Build with<br />
                    <span className="italic">purpose</span>
                  </h2>
                </div>
                
                <div className="space-y-6 text-brand-white/80 leading-relaxed">
                  <p>
                    SKROBAKI is more than architecture—it's a philosophy of conscious design. 
                    We believe in creating spaces that honor both human connection and environmental harmony.
                  </p>
                  <p>
                    Every structure is conceived to enhance the lives of those who inhabit it, 
                    from intimate residences to inspiring commercial spaces, always with respect for context and community.
                  </p>
                </div>

                <div className="pt-8">
                  <div className="text-sm text-brand-white/60 font-inter italic">
                    "Architecture is the thoughtful making of spaces." — Louis Kahn
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Slide 5: Contact */}
        <section className="min-h-screen flex items-center justify-center overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-cream to-brand-white"></div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <div className="mb-16">
              <h2 className="text-4xl lg:text-5xl font-playfair font-light text-brand-charcoal mb-8 leading-tight">
                Get in<br />
                <span className="italic">Touch</span>
              </h2>
              <div className="w-16 h-px bg-brand-charcoal mx-auto mb-8"></div>
              <p className="text-lg text-brand-gray leading-relaxed max-w-2xl mx-auto">
                Let's discuss your next architectural project. Contact us to explore how 
                SKROBAKI can bring your vision to life with innovative design solutions.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 mb-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-brand-charcoal/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-brand-charcoal" />
                </div>
                <h3 className="text-sm uppercase tracking-wider text-brand-charcoal mb-2">Email</h3>
                <p className="text-brand-gray">hello@skrobaki.studio</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-brand-charcoal/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-brand-charcoal" />
                </div>
                <h3 className="text-sm uppercase tracking-wider text-brand-charcoal mb-2">Phone</h3>
                <p className="text-brand-gray">+1 (555) 123-4567</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-brand-charcoal/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-brand-charcoal" />
                </div>
                <h3 className="text-sm uppercase tracking-wider text-brand-charcoal mb-2">Studio</h3>
                <p className="text-brand-gray">New York, NY</p>
              </div>
            </div>

            <div className="space-y-6">
              <button 
                onClick={() => onNavigate('auth')}
                className="px-12 py-4 text-sm font-medium text-brand-charcoal border border-brand-charcoal hover:bg-brand-charcoal hover:text-brand-white transition-all duration-500 uppercase tracking-widest"
              >
                Start Conversation
              </button>
              
              <p className="text-xs text-brand-gray/60 uppercase tracking-[0.3em]">
                SKROBAKI • Architectural Innovation • est. 2024
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};