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
    construction: "Hands-on coordination and oversight of construction activities, managing trades, schedules, compliance, and site operations to achieve seamless project execution.",
    estimating: "Accurate cost estimation and budgeting services to ensure project financial viability and competitive pricing.",
    inspection: "Comprehensive site inspections and condition assessments to identify potential issues and ensure compliance with standards.",
    design: "Creative design solutions and 3D visualizations to bring your vision to life with cutting-edge technology.",
    bim: "Building Information Modeling services for enhanced project coordination, clash detection, and digital collaboration.",
    digital: "Advanced digital delivery solutions and analytics to optimize project performance and data-driven decision making."
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

      {/* Main Layout with Glass Panel */}
      <div className="relative z-40 h-screen flex">
        {/* Left Glass Panel - Centered and Smaller */}
        <div className="w-1/3 h-full mx-auto">
          <div className="bg-black w-full h-full flex flex-col p-8 lg:p-12 !rounded-none !shadow-none">
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

            {/* Main Content */}
            <div className="flex-1 flex items-center">
              <div className="w-full space-y-8">
                {/* Section Content */}
                <div className="space-y-8">
                  {/* Service Package Group */}
                  <div className="space-y-4">
                    <h3 className="text-white/80 text-sm font-medium tracking-widest uppercase mb-6">Service Package</h3>
                    
                    <div 
                      className="flex items-center space-x-4 cursor-pointer transition-all duration-300"
                      onMouseEnter={() => setHoveredService('advisory')}
                      onMouseLeave={() => setHoveredService(null)}
                    >
                      <span className="text-white/60 text-sm">01</span>
                      <div className="flex-1">
                        <h2 className="text-white font-light text-lg tracking-wide">Advisory</h2>
                      </div>
                    </div>
                    
                    <div 
                      className="flex items-center space-x-4 cursor-pointer transition-all duration-300"
                      onMouseEnter={() => setHoveredService('project')}
                      onMouseLeave={() => setHoveredService(null)}
                    >
                      <span className="text-white/60 text-sm">02</span>
                      <div className="flex-1">
                        <h2 className="text-white font-light text-lg tracking-wide">Project Management</h2>
                      </div>
                    </div>
                    
                    <div 
                      className="flex items-center space-x-4 cursor-pointer transition-all duration-300"
                      onMouseEnter={() => setHoveredService('construction')}
                      onMouseLeave={() => setHoveredService(null)}
                    >
                      <span className="text-white/60 text-sm">03</span>
                      <div className="flex-1">
                        <h2 className="text-white font-light text-lg tracking-wide">Construction Management</h2>
                      </div>
                    </div>
                  </div>

                  {/* Stand-alone Services Group */}
                  <div className="space-y-4">
                    <h3 className="text-white/80 text-sm font-medium tracking-widest uppercase mb-6">Stand-alone Services</h3>
                    
                    <div 
                      className="flex items-center space-x-4 cursor-pointer transition-all duration-300"
                      onMouseEnter={() => setHoveredService('estimating')}
                      onMouseLeave={() => setHoveredService(null)}
                    >
                      <span className="text-white/60 text-sm">04</span>
                      <div className="flex-1">
                        <h2 className="text-white font-light text-lg tracking-wide">Estimating Services</h2>
                      </div>
                    </div>
                    
                    <div 
                      className="flex items-center space-x-4 cursor-pointer transition-all duration-300"
                      onMouseEnter={() => setHoveredService('inspection')}
                      onMouseLeave={() => setHoveredService(null)}
                    >
                      <span className="text-white/60 text-sm">05</span>
                      <div className="flex-1">
                        <h2 className="text-white font-light text-lg tracking-wide">Site Inspection Services</h2>
                      </div>
                    </div>
                    
                    <div 
                      className="flex items-center space-x-4 cursor-pointer transition-all duration-300"
                      onMouseEnter={() => setHoveredService('design')}
                      onMouseLeave={() => setHoveredService(null)}
                    >
                      <span className="text-white/60 text-sm">06</span>
                      <div className="flex-1">
                        <h2 className="text-white font-light text-lg tracking-wide">Design & Visualisation</h2>
                      </div>
                    </div>
                    
                    <div 
                      className="flex items-center space-x-4 cursor-pointer transition-all duration-300"
                      onMouseEnter={() => setHoveredService('bim')}
                      onMouseLeave={() => setHoveredService(null)}
                    >
                      <span className="text-white/60 text-sm">07</span>
                      <div className="flex-1">
                        <h2 className="text-white font-light text-lg tracking-wide">BIM Services</h2>
                      </div>
                    </div>
                    
                    <div 
                      className="flex items-center space-x-4 cursor-pointer transition-all duration-300"
                      onMouseEnter={() => setHoveredService('digital')}
                      onMouseLeave={() => setHoveredService(null)}
                    >
                      <span className="text-white/60 text-sm">08</span>
                      <div className="flex-1">
                        <h2 className="text-white font-light text-lg tracking-wide">Digital Delivery & Analytics</h2>
                      </div>
                    </div>
                  </div>

                  {/* Dedicated Description Area */}
                  <div className="mt-8 min-h-[120px] flex items-center">
                    {hoveredService && (
                      <p className="text-white/80 text-sm leading-relaxed animate-fade-in">
                        {serviceDescriptions[hoveredService as keyof typeof serviceDescriptions]}
                      </p>
                    )}
                  </div>
                </div>
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

        {/* Centered Header - Full Screen Center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="text-center">
            <h1 className="text-5xl lg:text-7xl xl:text-8xl font-bold text-white leading-none tracking-tight">
              Skrobaki
            </h1>
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