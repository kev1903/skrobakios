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
      description: "Comprehensive cost estimation and budget management services to maintain financial control throughout your project lifecycle.",
      scope: "Single-point estimates to detailed quantity take-offs and ongoing cost monitoring.",
      typicalFee: "Fixed fee per service",
      whoIsFor: "Clients requiring accurate cost control and competitive tendering strategies.",
      benefits: [
        "Single-Point Budget Estimate: Reality-check the design early",
        "Cost Plan — 3 Updates: DD → Tender → Pre-let. Keep the budget honest at every design gate",
        "Detailed Quantity Take-Off & BoQ: Apples-to-apples tendering",
        "Trade Bid Analysis: Close scope gaps and cut 3-7% from trade prices",
        "Variation Review: Independent check that stops inflated claims",
        "Progress-Claim Assessment: Pay only for work actually done"
      ]
    },
    inspection: {
      title: "SITE INSPECTION SERVICES",
      description: "Professional inspection services to protect your investment and optimize building performance throughout its lifecycle.",
      scope: "Comprehensive health-checks from construction through post-occupancy performance monitoring.",
      typicalFee: "Per inspection basis / A$250 call-out (first 60 min incl.)",
      whoIsFor: "Property owners seeking to maximize asset performance and protect final payments.",
      benefits: [
        "Schedule Health-Check: Recover lost days on the critical path",
        "Defects & Practical Completion Inspection: Snag list with severity coding to protect final-payment retention",
        "Post-Occupancy Health Check Audit: 12-month operating-cost benchmark to uncover lifecycle savings",
        "On-Site Issue Diagnosis & Advice: A$250 call-out (first 60 min incl.) for rapid defect triage, with photo log and next-step guidance"
      ]
    },
    design: {
      title: "DESIGN & VISUALISATION",
      description: "Creative design solutions and advanced visualization services to bring your vision to life with cutting-edge technology.",
      scope: "Concept design through construction documentation with comprehensive 3D modeling and visualization.",
      typicalFee: "Design fee percentage",
      whoIsFor: "Clients wanting innovative design solutions, clear visualizations, and comprehensive documentation.",
      benefits: [
        "Concept Design Sketch: 2-3 options plus cost range",
        "Spatial Design: Interior Spaces; Functional, Aesthetic, Compliant Outdoor Spaces",
        "3D Rendering: Photorealistic visualizations for marketing and approvals",
        "3D Virtual Walk-through: Immersive client experience and design validation",
        "3D Printing – Scale Models: High-res resin/PLA models for client approvals or 1:1 component testing",
        "Construction Drawings: Permit & tender-ready documentation"
      ]
    },
    bim: {
      title: "BIM SERVICES",
      description: "Advanced Building Information Modeling services for enhanced project coordination, digital collaboration, and lifecycle management.",
      scope: "Comprehensive BIM authoring, clash detection, digital fabrication, and asset management solutions.",
      typicalFee: "Project-based fee / Technology licensing",
      whoIsFor: "Complex projects requiring advanced coordination, digital fabrication, and long-term asset management.",
      benefits: [
        "BIM Authoring & Clash: LOD 300-350 Archicad model + clash reports feeding CostX & SkrobakiOS",
        "Shop-Drawings for Trades: Tekla fabrication sheets with CNC outputs",
        "Drone Survey: Capturing Site Photography, Project Progress Imagery",
        "5D Cost Estimation: Integrated costing and scheduling",
        "7D Modeling: As-Built Model for Asset Management"
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

      {/* Main Layout - Mobile First Design */}
      <div className="relative z-40 h-screen flex">
        {/* Mobile: Full Width Glass Panel, Desktop: Left Panel */}
        <div className={`${isMobile ? 'w-full' : 'w-1/3'} h-full ${isMobile ? '' : 'mx-auto'}`}>
          <div className={`backdrop-blur-xl border border-white/20 w-full h-full flex flex-col ${isMobile ? 'p-4' : 'p-8 lg:p-12'} shadow-2xl shadow-black/60 backdrop-saturate-150`} style={{backgroundColor: 'rgba(0,10,20,0.8)'}}>
            {/* Navigation in Glass Panel */}
            <header className={`${isMobile ? 'mb-4' : 'mb-8'}`}>
              {/* Logo and Navigation */}
              <div className={`flex items-center justify-between ${isMobile ? 'mb-4' : 'mb-8'}`}>
                {/* Logo */}
                <div className="flex items-center">
                  <img src="/lovable-uploads/aa6861f1-3bf5-44ab-a1cb-bae5b3907e13.png" alt="Skrobaki Logo" className={`${isMobile ? 'h-8' : 'h-10'} w-auto`} />
                </div>

                {/* Mobile Menu Button */}
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white p-2">
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-6">
                  <Button variant="ghost" onClick={() => onNavigate('auth')} className="text-white border-white/30 hover:bg-white/10">
                    Sign In
                  </Button>
                </div>
              </div>

              {/* Mobile Navigation */}
              {(isMenuOpen && isMobile) && <div className="bg-black/30 backdrop-blur-md py-4 px-4 rounded-lg mb-4">
                  <nav className="flex flex-col space-y-3">
                    <button className="text-white/90 hover:text-white text-left font-medium tracking-wide transition-colors text-sm" onClick={() => handleNavigation('services')}>
                      SERVICES
                    </button>
                    <button className="text-white/90 hover:text-white text-left font-medium tracking-wide transition-colors text-sm" onClick={() => handleNavigation('projects')}>
                      PROJECTS
                    </button>
                    <button className="text-white/90 hover:text-white text-left font-medium tracking-wide transition-colors text-sm" onClick={() => handleNavigation('about')}>
                      ABOUT US
                    </button>
                    <Button variant="ghost" onClick={() => onNavigate('auth')} className="text-white border-white/30 hover:bg-white/10 mt-2 text-sm">
                      Sign In
                    </Button>
                  </nav>
                </div>}
            </header>

            {/* Main Content */}
            <div className={`flex-1 flex items-start ${isMobile ? 'pt-2' : 'pt-8'} overflow-y-auto`}>
              <div className="w-full space-y-6">
                {/* Section Content */}
                <div className={`space-y-${isMobile ? '6' : '8'}`}>
                  {/* Service Package Group */}
                  <div className="space-y-2">
                    <h3 className={`text-white/80 ${isMobile ? 'text-xs' : 'text-sm'} font-medium tracking-widest uppercase ${isMobile ? 'mb-4' : 'mb-6'}`}>
                      SERVICE PACKAGE
                    </h3>
                    
                    <div 
                      className={`flex items-center ${isMobile ? 'space-x-3' : 'space-x-4'} cursor-pointer transition-all duration-300 ${isMobile ? 'py-2' : ''}`}
                      onMouseEnter={() => setHoveredService('advisory')}
                      onMouseLeave={() => setHoveredService(null)}
                      onClick={() => handleServiceClick('advisory')}
                    >
                      <span className={`text-white/60 ${isMobile ? 'text-xs' : 'text-sm'}`}>01</span>
                      <div className="flex-1">
                        <h2 className={`text-white font-light ${isMobile ? 'text-sm' : 'text-base'} tracking-wide`}>Advisory</h2>
                      </div>
                    </div>
                    
                    <div 
                      className={`flex items-center ${isMobile ? 'space-x-3' : 'space-x-4'} cursor-pointer transition-all duration-300 ${isMobile ? 'py-2' : ''}`}
                      onMouseEnter={() => setHoveredService('project')}
                      onMouseLeave={() => setHoveredService(null)}
                      onClick={() => handleServiceClick('project')}
                    >
                      <span className={`text-white/60 ${isMobile ? 'text-xs' : 'text-sm'}`}>02</span>
                      <div className="flex-1">
                        <h2 className={`text-white font-light ${isMobile ? 'text-sm' : 'text-base'} tracking-wide`}>Project Management</h2>
                      </div>
                    </div>
                    
                    <div 
                      className={`flex items-center ${isMobile ? 'space-x-3' : 'space-x-4'} cursor-pointer transition-all duration-300 ${isMobile ? 'py-2' : ''}`}
                      onMouseEnter={() => setHoveredService('construction')}
                      onMouseLeave={() => setHoveredService(null)}
                      onClick={() => handleServiceClick('construction')}
                    >
                      <span className={`text-white/60 ${isMobile ? 'text-xs' : 'text-sm'}`}>03</span>
                      <div className="flex-1">
                        <h2 className={`text-white font-light ${isMobile ? 'text-sm' : 'text-base'} tracking-wide`}>Construction Management</h2>
                      </div>
                    </div>
                  </div>

                  {/* Stand-alone Services Group */}
                  <div className="space-y-2">
                    <h3 className={`text-white/80 ${isMobile ? 'text-xs' : 'text-sm'} font-medium tracking-widest uppercase ${isMobile ? 'mb-4' : 'mb-6'}`}>
                      STAND-ALONE SERVICES
                    </h3>
                    
                    <div 
                      className={`flex items-center ${isMobile ? 'space-x-3' : 'space-x-4'} cursor-pointer transition-all duration-300 ${isMobile ? 'py-2' : ''}`}
                      onMouseEnter={() => setHoveredService('estimating')}
                      onMouseLeave={() => setHoveredService(null)}
                      onClick={() => handleServiceClick('estimating')}
                    >
                      <span className={`text-white/60 ${isMobile ? 'text-xs' : 'text-sm'}`}>04</span>
                      <div className="flex-1">
                        <h2 className={`text-white font-light ${isMobile ? 'text-sm' : 'text-base'} tracking-wide`}>Estimating Services</h2>
                      </div>
                    </div>
                    
                    <div 
                      className={`flex items-center ${isMobile ? 'space-x-3' : 'space-x-4'} cursor-pointer transition-all duration-300 ${isMobile ? 'py-2' : ''}`}
                      onMouseEnter={() => setHoveredService('inspection')}
                      onMouseLeave={() => setHoveredService(null)}
                      onClick={() => handleServiceClick('inspection')}
                    >
                      <span className={`text-white/60 ${isMobile ? 'text-xs' : 'text-sm'}`}>05</span>
                      <div className="flex-1">
                        <h2 className={`text-white font-light ${isMobile ? 'text-sm' : 'text-base'} tracking-wide`}>Site Inspection Services</h2>
                      </div>
                    </div>
                    
                    <div 
                      className={`flex items-center ${isMobile ? 'space-x-3' : 'space-x-4'} cursor-pointer transition-all duration-300 ${isMobile ? 'py-2' : ''}`}
                      onMouseEnter={() => setHoveredService('design')}
                      onMouseLeave={() => setHoveredService(null)}
                      onClick={() => handleServiceClick('design')}
                    >
                      <span className={`text-white/60 ${isMobile ? 'text-xs' : 'text-sm'}`}>06</span>
                      <div className="flex-1">
                        <h2 className={`text-white font-light ${isMobile ? 'text-sm' : 'text-base'} tracking-wide`}>Design & Visualisation</h2>
                      </div>
                    </div>
                    
                    <div 
                      className={`flex items-center ${isMobile ? 'space-x-3' : 'space-x-4'} cursor-pointer transition-all duration-300 ${isMobile ? 'py-2' : ''}`}
                      onMouseEnter={() => setHoveredService('bim')}
                      onMouseLeave={() => setHoveredService(null)}
                      onClick={() => handleServiceClick('bim')}
                    >
                      <span className={`text-white/60 ${isMobile ? 'text-xs' : 'text-sm'}`}>07</span>
                      <div className="flex-1">
                        <h2 className={`text-white font-light ${isMobile ? 'text-sm' : 'text-base'} tracking-wide`}>BIM Services</h2>
                      </div>
                    </div>
                    
                    <div 
                      className={`flex items-center ${isMobile ? 'space-x-3' : 'space-x-4'} cursor-pointer transition-all duration-300 ${isMobile ? 'py-2' : ''}`}
                      onMouseEnter={() => setHoveredService('digital')}
                      onMouseLeave={() => setHoveredService(null)}
                      onClick={() => handleServiceClick('digital')}
                    >
                      <span className={`text-white/60 ${isMobile ? 'text-xs' : 'text-sm'}`}>08</span>
                      <div className="flex-1">
                        <h2 className={`text-white font-light ${isMobile ? 'text-sm' : 'text-base'} tracking-wide`}>Digital Delivery & Analytics</h2>
                      </div>
                    </div>
                  </div>

                  {/* Dedicated Description Area - Only show on desktop or when service is hovered */}
                  {!isMobile && (
                    <div className="mt-8 min-h-[120px] flex items-center">
                      {hoveredService && (
                        <p className="text-white/80 text-sm leading-relaxed animate-fade-in">
                          {serviceDescriptions[hoveredService as keyof typeof serviceDescriptions]}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Only visible on desktop */}
        {!isMobile && (
          <div className="w-2/3 h-full flex flex-col">
            {/* Navigation for Desktop */}
            <header className="hidden lg:flex justify-end pt-8 pr-12">
              <nav className="flex items-center space-x-12">
                <button className="text-white/90 hover:text-white text-sm font-medium tracking-wide transition-colors" onClick={() => onNavigate('projects')}>
                  PORTFOLIO
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
        )}
      </div>

      {/* Mobile Service Detail Modal */}
      {(selectedService && isMobile) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="h-full bg-white overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
              <h2 className="text-lg font-bold text-gray-900">
                {serviceDetails[selectedService as keyof typeof serviceDetails]?.title}
              </h2>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
              {/* Header */}
              <article className="space-y-3">
                <h1 className="text-2xl font-medium text-gray-900">
                  {serviceDetails[selectedService as keyof typeof serviceDetails]?.title}
                </h1>
                <p className="text-gray-600 text-base leading-relaxed">
                  {serviceDetails[selectedService as keyof typeof serviceDetails]?.description}
                </p>
              </article>

              {/* Key Details */}
              <section className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Scope</h3>
                  <p className="text-gray-600 text-sm">
                    {serviceDetails[selectedService as keyof typeof serviceDetails]?.scope}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Typical Fee Basis*</h3>
                  <p className="text-gray-600 text-sm">
                    {serviceDetails[selectedService as keyof typeof serviceDetails]?.typicalFee}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Who is this for?</h3>
                  <p className="text-gray-600 text-sm">
                    {serviceDetails[selectedService as keyof typeof serviceDetails]?.whoIsFor}
                  </p>
                </div>
              </section>

              {/* Value Proposition */}
              <section className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="text-base font-medium text-gray-900 mb-3">Value Added</h3>
                <ul className="space-y-2">
                  {(serviceDetails[selectedService as keyof typeof serviceDetails]?.benefits || []).map((benefit, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-600 text-sm">{benefit}</p>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Follow Us - Bottom of Screen */}
      <div className={`absolute bottom-4 ${isMobile ? 'left-4' : 'left-8 lg:left-12'} z-40`}>
        <div className={`flex items-center ${isMobile ? 'space-x-4' : 'space-x-6'} ${isMobile ? 'text-xs' : 'text-sm'} text-white/80`}>
          <span className="font-medium">FOLLOW US</span>
          <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
            <div className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} border border-white/30 rounded-full flex items-center justify-center`}>
              <div className="w-2 h-2 bg-white/60 rounded-full" />
            </div>
            <div className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} border border-white/30 rounded-full flex items-center justify-center`}>
              <div className="w-2 h-2 bg-white/60 rounded-full" />
            </div>
            <div className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} border border-white/30 rounded-full flex items-center justify-center`}>
              <div className="w-2 h-2 bg-white/60 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>;
};