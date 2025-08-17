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
  const [selectedService, setSelectedService] = useState<string | null>(null);
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

  const serviceDetails = {
    advisory: {
      title: "ADVISORY",
      description: "Robust front-end planning has been shown to lower total capital cost 10%, shorten schedule 7% and trim change-orders 5%.",
      scope: "Stages 1-3 only - brief, concept, definition. PDF reports & meeting workshops.",
      typicalFee: "Lump-sum",
      whoIsFor: "Ideal for clients who just want early clarity before committing.",
      benefits: [
        "Front-end clarity prevents downstream chaos.",
        "Aligns brief, scope & budget before design spend.",
        "Early risk workshops cut late design changes and permit re-submissions.",
        "Owners get a 'go / no-go' decision for < 2 % of project cost."
      ]
    },
    project: {
      title: "PROJECT MANAGEMENT",
      description: "End-to-end management of projects, ensuring they are delivered on time, within budget, and to the highest quality standards while protecting the client's interest.",
      scope: "Full project lifecycle management from inception to completion.",
      typicalFee: "Percentage of construction cost",
      whoIsFor: "Clients who want professional oversight and coordination throughout their project.",
      benefits: [
        "Expert project coordination and scheduling",
        "Budget management and cost control",
        "Quality assurance and compliance oversight",
        "Risk management and mitigation strategies"
      ]
    },
    construction: {
      title: "CONSTRUCTION MANAGEMENT",
      description: "Hands-on coordination and oversight of construction activities, managing trades, schedules, compliance, and site operations to achieve seamless project execution.",
      scope: "On-site construction oversight and coordination.",
      typicalFee: "Fixed fee or percentage",
      whoIsFor: "Projects requiring dedicated on-site management and coordination.",
      benefits: [
        "Direct trade coordination and scheduling",
        "Quality control and safety oversight",
        "Progress monitoring and reporting",
        "Issue resolution and problem-solving"
      ]
    },
    estimating: {
      title: "ESTIMATING SERVICES",
      description: "Accurate cost estimation and budgeting services to ensure project financial viability and competitive pricing.",
      scope: "Detailed cost analysis and budget preparation.",
      typicalFee: "Fixed fee per estimate",
      whoIsFor: "Clients needing accurate project costing for planning or tendering.",
      benefits: [
        "Precise cost forecasting",
        "Market-based pricing analysis",
        "Risk assessment and contingency planning",
        "Competitive advantage in tendering"
      ]
    },
    inspection: {
      title: "SITE INSPECTION SERVICES",
      description: "Comprehensive site inspections and condition assessments to identify potential issues and ensure compliance with standards.",
      scope: "Detailed site surveys and condition reporting.",
      typicalFee: "Per inspection basis",
      whoIsFor: "Property owners and developers requiring professional assessments.",
      benefits: [
        "Comprehensive condition assessments",
        "Compliance verification",
        "Risk identification and mitigation",
        "Professional reporting and documentation"
      ]
    },
    design: {
      title: "DESIGN & VISUALISATION",
      description: "Creative design solutions and 3D visualizations to bring your vision to life with cutting-edge technology.",
      scope: "Concept through detailed design with 3D modeling.",
      typicalFee: "Design fee percentage",
      whoIsFor: "Clients wanting innovative design solutions and clear visualizations.",
      benefits: [
        "Creative and functional design solutions",
        "Photorealistic 3D visualizations",
        "Design optimization and value engineering",
        "Clear communication of design intent"
      ]
    },
    bim: {
      title: "BIM SERVICES",
      description: "Building Information Modeling services for enhanced project coordination, clash detection, and digital collaboration.",
      scope: "3D modeling, coordination, and digital project delivery.",
      typicalFee: "Project-based fee",
      whoIsFor: "Complex projects requiring advanced coordination and collaboration.",
      benefits: [
        "Enhanced project coordination",
        "Clash detection and resolution",
        "Improved collaboration and communication",
        "Digital asset creation and management"
      ]
    },
    digital: {
      title: "DIGITAL DELIVERY & ANALYTICS",
      description: "Advanced digital delivery solutions and analytics to optimize project performance and data-driven decision making.",
      scope: "Digital tools implementation and performance analytics.",
      typicalFee: "Technology licensing and consulting",
      whoIsFor: "Forward-thinking clients embracing digital transformation.",
      benefits: [
        "Data-driven decision making",
        "Performance optimization",
        "Digital workflow automation",
        "Advanced analytics and reporting"
      ]
    }
  };

  // Navigation handler for menu items
  const handleNavigation = (section: string) => {
    // For now, just close mobile menu
    setIsMenuOpen(false);
    // Future: navigate to different pages or show modals
  };

  // Service click handler
  const handleServiceClick = (service: string) => {
    setSelectedService(service);
  };

  // Close modal handler
  const closeModal = () => {
    setSelectedService(null);
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
          <div className="backdrop-blur-xl border border-white/20 w-full h-full flex flex-col p-8 lg:p-12 shadow-2xl shadow-black/60 backdrop-saturate-150" style={{backgroundColor: 'rgba(0,10,20,0.8)'}}>
            {/* Navigation in Glass Panel */}
            <header className="mb-8">
              {/* Logo and Navigation */}
              <div className="flex items-center justify-between mb-8">
                {/* Logo */}
                <div className="flex items-center">
                  <img src="/lovable-uploads/aa6861f1-3bf5-44ab-a1cb-bae5b3907e13.png" alt="Skrobaki Logo" className="h-10 w-auto" />
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
            <div className="flex-1 flex items-start pt-8">
              <div className="w-full space-y-8">
                {/* Section Content */}
                <div className="space-y-8">
                  {/* Service Package Group */}
                  <div className="space-y-2">
                    <h3 className="text-white/80 text-sm font-medium tracking-widest uppercase mb-6">Service Package</h3>
                    
                    <div 
                      className="flex items-center space-x-4 cursor-pointer transition-all duration-300"
                      onMouseEnter={() => setHoveredService('advisory')}
                      onMouseLeave={() => setHoveredService(null)}
                      onClick={() => handleServiceClick('advisory')}
                    >
                      <span className="text-white/60 text-sm">01</span>
                      <div className="flex-1">
                        <h2 className="text-white font-light text-base tracking-wide">Advisory</h2>
                      </div>
                    </div>
                    
                    <div 
                      className="flex items-center space-x-4 cursor-pointer transition-all duration-300"
                      onMouseEnter={() => setHoveredService('project')}
                      onMouseLeave={() => setHoveredService(null)}
                      onClick={() => handleServiceClick('project')}
                    >
                      <span className="text-white/60 text-sm">02</span>
                      <div className="flex-1">
                        <h2 className="text-white font-light text-base tracking-wide">Project Management</h2>
                      </div>
                    </div>
                    
                    <div 
                      className="flex items-center space-x-4 cursor-pointer transition-all duration-300"
                      onMouseEnter={() => setHoveredService('construction')}
                      onMouseLeave={() => setHoveredService(null)}
                      onClick={() => handleServiceClick('construction')}
                    >
                      <span className="text-white/60 text-sm">03</span>
                      <div className="flex-1">
                        <h2 className="text-white font-light text-base tracking-wide">Construction Management</h2>
                      </div>
                    </div>
                  </div>

                  {/* Stand-alone Services Group */}
                  <div className="space-y-2">
                    <h3 className="text-white/80 text-sm font-medium tracking-widest uppercase mb-6">Stand-alone Services</h3>
                    
                    <div 
                      className="flex items-center space-x-4 cursor-pointer transition-all duration-300"
                      onMouseEnter={() => setHoveredService('estimating')}
                      onMouseLeave={() => setHoveredService(null)}
                      onClick={() => handleServiceClick('estimating')}
                    >
                      <span className="text-white/60 text-sm">04</span>
                      <div className="flex-1">
                        <h2 className="text-white font-light text-base tracking-wide">Estimating Services</h2>
                      </div>
                    </div>
                    
                    <div 
                      className="flex items-center space-x-4 cursor-pointer transition-all duration-300"
                      onMouseEnter={() => setHoveredService('inspection')}
                      onMouseLeave={() => setHoveredService(null)}
                      onClick={() => handleServiceClick('inspection')}
                    >
                      <span className="text-white/60 text-sm">05</span>
                      <div className="flex-1">
                        <h2 className="text-white font-light text-base tracking-wide">Site Inspection Services</h2>
                      </div>
                    </div>
                    
                    <div 
                      className="flex items-center space-x-4 cursor-pointer transition-all duration-300"
                      onMouseEnter={() => setHoveredService('design')}
                      onMouseLeave={() => setHoveredService(null)}
                      onClick={() => handleServiceClick('design')}
                    >
                      <span className="text-white/60 text-sm">06</span>
                      <div className="flex-1">
                        <h2 className="text-white font-light text-base tracking-wide">Design & Visualisation</h2>
                      </div>
                    </div>
                    
                    <div 
                      className="flex items-center space-x-4 cursor-pointer transition-all duration-300"
                      onMouseEnter={() => setHoveredService('bim')}
                      onMouseLeave={() => setHoveredService(null)}
                      onClick={() => handleServiceClick('bim')}
                    >
                      <span className="text-white/60 text-sm">07</span>
                      <div className="flex-1">
                        <h2 className="text-white font-light text-base tracking-wide">BIM Services</h2>
                      </div>
                    </div>
                    
                    <div 
                      className="flex items-center space-x-4 cursor-pointer transition-all duration-300"
                      onMouseEnter={() => setHoveredService('digital')}
                      onMouseLeave={() => setHoveredService(null)}
                      onClick={() => handleServiceClick('digital')}
                    >
                      <span className="text-white/60 text-sm">08</span>
                      <div className="flex-1">
                        <h2 className="text-white font-light text-base tracking-wide">Digital Delivery & Analytics</h2>
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

        {/* Right Side - Clear Background with Navigation or Service Details */}
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

          {/* Service Details Panel or Vertical Excellence Text */}
          {selectedService ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="bg-white/95 backdrop-blur-md rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {serviceDetails[selectedService as keyof typeof serviceDetails]?.title}
                  </h2>
                  <Button variant="ghost" size="icon" onClick={closeModal}>
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8 font-inter">
                  {/* Header */}
                  <article className="space-y-3">
                    <h1 className="text-3xl font-medium text-gray-900">
                      {serviceDetails[selectedService as keyof typeof serviceDetails]?.title}
                    </h1>
                    <p className="text-gray-600 text-lg font-light leading-relaxed">
                      {serviceDetails[selectedService as keyof typeof serviceDetails]?.description}
                    </p>
                  </article>

                  {/* Key Details */}
                  <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Scope</h3>
                      <p className="text-gray-600 font-light">
                        {serviceDetails[selectedService as keyof typeof serviceDetails]?.scope}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Typical Fee Basis*</h3>
                      <p className="text-gray-600 font-light">
                        {serviceDetails[selectedService as keyof typeof serviceDetails]?.typicalFee}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Who is this for?</h3>
                      <p className="text-gray-600 font-light">
                        {serviceDetails[selectedService as keyof typeof serviceDetails]?.whoIsFor}
                      </p>
                    </div>
                  </section>

                  {/* Value Proposition */}
                  <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Value Added</h3>
                    <ul className="space-y-3">
                      {(serviceDetails[selectedService as keyof typeof serviceDetails]?.benefits || []).map((benefit, idx) => (
                        <li key={idx} className="flex items-start space-x-3">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-gray-600 font-light">{benefit}</p>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

              </div>
            </div>
          ) : (
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
          )}
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