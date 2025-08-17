import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import heroImage from '@/assets/hero-architecture.png';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage = ({ onNavigate }: LandingPageProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const isMobile = useIsMobile();

  // Navigation handler for menu items
  const handleNavigation = (section: string) => {
    // For now, just close mobile menu
    setIsMenuOpen(false);
    // Future: navigate to different pages or show modals
  };

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Hero Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Navigation Header */}
      <header className="relative z-50 pt-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Social and Secondary Nav */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6 text-sm text-white/80">
              <span className="font-medium">FOLLOW US</span>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border border-white/30 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white/60 rounded-full" />
                </div>
                <div className="w-6 h-6 border border-white/30 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white/60 rounded-full" />
                </div>
                <div className="w-6 h-6 border border-white/30 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white/60 rounded-full" />
                </div>
              </div>
            </div>

            {/* Main Navigation */}
            <nav className="hidden lg:flex items-center space-x-12">
              <button 
                className="text-white/90 hover:text-white text-sm font-medium tracking-wide transition-colors"
                onClick={() => handleNavigation('services')}
              >
                SERVICES
              </button>
              <button 
                className="text-white/90 hover:text-white text-sm font-medium tracking-wide transition-colors"
                onClick={() => handleNavigation('projects')}
              >
                PROJECTS
              </button>
              <button 
                className="text-white/90 hover:text-white text-sm font-medium tracking-wide transition-colors"
                onClick={() => handleNavigation('offers')}
              >
                SPECIAL OFFERS
              </button>
              <button 
                className="text-white/90 hover:text-white text-sm font-medium tracking-wide transition-colors"
                onClick={() => handleNavigation('about')}
              >
                ABOUT US
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-white p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-black/90 backdrop-blur-md py-6 px-6">
              <nav className="flex flex-col space-y-4">
                <button 
                  className="text-white/90 hover:text-white text-left font-medium tracking-wide transition-colors"
                  onClick={() => handleNavigation('services')}
                >
                  SERVICES
                </button>
                <button 
                  className="text-white/90 hover:text-white text-left font-medium tracking-wide transition-colors"
                  onClick={() => handleNavigation('projects')}
                >
                  PROJECTS
                </button>
                <button 
                  className="text-white/90 hover:text-white text-left font-medium tracking-wide transition-colors"
                  onClick={() => handleNavigation('offers')}
                >
                  SPECIAL OFFERS
                </button>
                <button 
                  className="text-white/90 hover:text-white text-left font-medium tracking-wide transition-colors"
                  onClick={() => handleNavigation('about')}
                >
                  ABOUT US
                </button>
                <Button 
                  variant="ghost"
                  onClick={() => onNavigate('auth')}
                  className="text-white border-white/30 hover:bg-white/10 mt-4"
                >
                  Sign In
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Hero Content */}
      <div className="relative z-40 h-screen flex items-center">
        <div className="w-full h-full flex">
          {/* Left Glass Panel - Half Screen */}
          <div className="w-1/2 h-full flex items-center">
            <div className="glass-card w-full h-full flex items-center justify-center p-8 lg:p-12">
              <div className="w-full max-w-lg space-y-8">
                {/* Large Typography */}
                <div className="space-y-4">
                  <h1 className="text-5xl lg:text-7xl xl:text-8xl font-bold text-white leading-none tracking-tight">
                    skro
                    <br />
                    <span className="text-white/90">baki</span>
                  </h1>
                </div>

                {/* Section Content */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <span className="text-white/60 font-mono text-sm">01</span>
                    <h2 className="text-white font-semibold text-lg tracking-wide">
                      DISCOVER SERVICES
                    </h2>
                  </div>
                  
                  <p className="text-white/80 text-sm leading-relaxed">
                    Independent project management excellence delivering comprehensive solutions 
                    for your business growth and operational efficiency.
                  </p>

                  <button 
                    className="group flex items-center space-x-3 text-white/90 hover:text-white transition-colors"
                    onClick={() => handleNavigation('services')}
                  >
                    <span className="text-sm font-medium tracking-wide">VIEW ALL SERVICES</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Clear Background */}
          <div className="w-1/2 h-full hidden lg:flex items-center justify-end pr-12">
            <div className="writing-mode-vertical text-white/40 text-sm font-medium tracking-widest">
              <span style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                EXCELLENCE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sign In Button - Floating */}
      <div className="fixed top-8 right-6 lg:right-12 z-50">
        <Button 
          variant="ghost"
          onClick={() => onNavigate('auth')}
          className="text-white border border-white/30 hover:bg-white/10 backdrop-blur-sm hidden lg:flex"
        >
          Sign In
        </Button>
      </div>
    </div>
  );
};