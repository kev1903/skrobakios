import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Menu, X, ChevronDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import heroImage from '@/assets/new-architecture-background.png';
interface LandingPageProps {
  onNavigate: (page: string) => void;
}
export const LandingPage = ({
  onNavigate
}: LandingPageProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [hoveredService, setHoveredService] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const serviceDescriptions = {
    advisory: "Help clients make informed decisions at every stage of their project, from feasibility and budgeting to design reviews and procurement strategies.",
    project: "End-to-end management of projects, ensuring they are delivered on time, within budget, and to the highest quality standards while protecting the client's interest.",
    construction: "Hands-on coordination and oversight of construction activities, managing trades, schedules, compliance, and site operations to achieve seamless project execution."
  };

  // Navigation handler for menu items
  const handleNavigation = (section: string) => {
    // For now, just close mobile menu
    setIsMenuOpen(false);
    // Future: navigate to different pages or show modals
  };
  return <div className="h-screen relative overflow-hidden">
      {/* Hero Background Image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
      backgroundImage: `url(${heroImage})`
    }}>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Service Package Header - Top of Page */}
      <div className="relative z-50 pt-20 lg:pt-24">
        <div className="max-w-7xl mx-auto px-8 lg:px-12">
          <div className="text-center mb-8">
            <h2 className="text-white text-2xl lg:text-3xl font-semibold tracking-wide mb-8">SERVICE PACKAGE</h2>
            <div className="flex flex-col lg:flex-row justify-center items-center lg:space-x-16 space-y-6 lg:space-y-0">
              <div 
                className="flex items-center space-x-4 cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredService('advisory')}
                onMouseLeave={() => setHoveredService(null)}
              >
                <span className="text-white/60 text-sm">01</span>
                <h3 className="text-white font-semibold text-lg tracking-wide">ADVISORY</h3>
              </div>
              
              <div 
                className="flex items-center space-x-4 cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredService('project')}
                onMouseLeave={() => setHoveredService(null)}
              >
                <span className="text-white/60 text-sm">02</span>
                <h3 className="text-white font-semibold text-lg tracking-wide">PROJECT MANAGEMENT</h3>
              </div>
              
              <div 
                className="flex items-center space-x-4 cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredService('construction')}
                onMouseLeave={() => setHoveredService(null)}
              >
                <span className="text-white/60 text-sm">03</span>
                <h3 className="text-white font-semibold text-lg tracking-wide">CONSTRUCTION MANAGEMENT</h3>
              </div>
            </div>
            
            {/* Service Description */}
            <div className="mt-8 min-h-[80px] flex items-center justify-center">
              {hoveredService && (
                <p className="text-white/80 text-sm leading-relaxed animate-fade-in max-w-2xl">
                  {serviceDescriptions[hoveredService as keyof typeof serviceDescriptions]}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout with Glass Panel */}
      <div className="relative z-40 h-screen flex">
        {/* Left Glass Panel - Centered and Smaller */}
        <div className="w-1/3 h-full mx-auto">
          <div className="glass-card w-full h-full flex flex-col p-8 lg:p-12 !rounded-none !shadow-none">
            {/* Navigation in Glass Panel */}
            <header className="mb-8">
              {/* Logo and Navigation */}
              <div className="flex items-center justify-between mb-8">
                {/* Logo */}
                <div className="flex items-center">
                  <img src="/lovable-uploads/b0e435b5-f844-4b7c-bce4-cccf69ad4e5b.png" alt="Skrobaki Logo" className="h-8 w-auto" />
                </div>

                {/* Mobile Menu Button */}
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden text-white p-2">
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>

              {/* Mobile Navigation */}
              {isMenuOpen && <div className="lg:hidden bg-black/30 backdrop-blur-md py-6 px-6 rounded-lg mb-8">
                  <nav className="flex flex-col space-y-4">
                    <button className="text-white/90 hover:text-white text-left font-medium tracking-wide transition-colors" onClick={() => handleNavigation('services')}>
                      SERVICES
                    </button>
                    <button className="text-white/90 hover:text-white text-left font-medium tracking-wide transition-colors" onClick={() => handleNavigation('projects')}>
                      PROJECTS
                    </button>
                    <button className="text-white/90 hover:text-white text-left font-medium tracking-wide transition-colors" onClick={() => handleNavigation('about')}>
                      ABOUT US
                    </button>
                    <Button variant="ghost" onClick={() => onNavigate('auth')} className="text-white border-white/30 hover:bg-white/10 mt-4">
                      Sign In
                    </Button>
                  </nav>
                </div>}
            </header>

            {/* Main Content - Empty for now */}
            <div className="flex-1 flex items-center">
              <div className="w-full">
                {/* Content can be added here later */}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Clear Background with Navigation */}
        <div className="w-2/3 h-full flex flex-col">
          {/* Navigation for Desktop */}
          <header className="hidden lg:flex justify-end pt-8 pr-12">
            <nav className="flex items-center space-x-12">
              <button className="text-white/90 hover:text-white text-sm font-medium tracking-wide transition-colors" onClick={() => handleNavigation('services')}>
                SERVICES
              </button>
              <button className="text-white/90 hover:text-white text-sm font-medium tracking-wide transition-colors" onClick={() => handleNavigation('projects')}>
                PROJECTS
              </button>
              <button className="text-white/90 hover:text-white text-sm font-medium tracking-wide transition-colors" onClick={() => handleNavigation('about')}>
                ABOUT US
              </button>
              <Button variant="ghost" onClick={() => onNavigate('auth')} className="text-white border border-white/30 hover:bg-white/10 backdrop-blur-sm">
                Sign In
              </Button>
            </nav>
          </header>

          {/* Vertical Excellence Text */}
          <div className="hidden lg:flex items-center justify-end pr-12 absolute right-0 top-1/2 transform -translate-y-1/2">
            <div className="writing-mode-vertical text-white/40 text-sm font-medium tracking-widest">
              <span style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed'
            }}>
                EXCELLENCE
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Follow Us - Bottom of Screen */}
      <div className="absolute bottom-8 left-8 lg:left-12 z-50">
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
      </div>
    </div>;
};