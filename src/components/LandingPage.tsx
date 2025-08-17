import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Calendar, 
  CheckCircle, 
  Building, 
  Users,
  Clipboard,
  Shield,
  Clock,
  TrendingUp,
  Award,
  Star,
  Quote,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  Eye,
  FileCheck,
  HardHat,
  Home,
  Gavel,
  Calculator,
  BarChart3,
  FileText,
  Search,
  ChevronDown
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage = ({ onNavigate }: LandingPageProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const isMobile = useIsMobile();

  // Handle scroll to sections
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
    setIsMenuOpen(false);
  };

  // Handle scroll tracking for active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'about', 'why-hire', 'services', 'case-studies', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-skrobaki-white">
      {/* SEO Meta Tags */}
      <div style={{ display: 'none' }}>
        <h1>Residential Construction Project Management in Melbourne</h1>
        <meta name="description" content="Independent Project Managers protecting your build — keeping your project on budget, on time, and fully compliant. Expert construction project management in Melbourne for homeowners." />
        <meta name="keywords" content="Project Management Melbourne, Construction Project Manager Melbourne, Independent Project Management for Homeowners, Melbourne construction, residential project management" />
      </div>

      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-skrobaki-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/3a1e9978-cc53-4d2e-ae3a-8d5a295a8fdb.png" 
                alt="SKROBAKI - Independent Project Management"
                className="h-10 w-auto object-contain cursor-pointer"
                onClick={() => scrollToSection('hero')}
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {[
                { label: 'About Us', id: 'about' },
                { label: 'Why Hire Us', id: 'why-hire' },
                { label: 'Services', id: 'services' },
                { label: 'Case Studies', id: 'case-studies' },
                { label: 'Contact', id: 'contact' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    activeSection === item.id 
                      ? 'text-skrobaki-navy' 
                      : 'text-skrobaki-steel hover:text-skrobaki-navy'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* CTA Button */}
            <div className="hidden lg:flex items-center space-x-4">
              <Button 
                onClick={() => scrollToSection('contact')}
                className="bg-skrobaki-gold hover:bg-skrobaki-gold-light text-skrobaki-navy font-medium px-6 py-2 rounded-lg transition-all duration-300"
              >
                Book Free Consultation
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-skrobaki-steel hover:text-skrobaki-navy"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t border-neutral-200">
              <nav className="flex flex-col space-y-4">
                {[
                  { label: 'About Us', id: 'about' },
                  { label: 'Why Hire Us', id: 'why-hire' },
                  { label: 'Services', id: 'services' },
                  { label: 'Case Studies', id: 'case-studies' },
                  { label: 'Contact', id: 'contact' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="text-left text-skrobaki-steel hover:text-skrobaki-navy font-medium"
                  >
                    {item.label}
                  </button>
                ))}
                <Button 
                  onClick={() => scrollToSection('contact')}
                  className="bg-skrobaki-gold hover:bg-skrobaki-gold-light text-skrobaki-navy font-medium mt-4 w-full"
                >
                  Book Free Consultation
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* 1. Hero Section */}
      <section id="hero" className="pt-20 min-h-screen flex items-center bg-gradient-to-br from-skrobaki-navy to-skrobaki-navy-light relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`
          }}
        />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-playfair font-light text-white mb-6 leading-tight">
                Residential Construction 
                <br />
                <span className="text-skrobaki-gold">Project Management</span>
                <br />
                in Melbourne
              </h1>
              
              <h2 className="text-xl sm:text-2xl text-white/90 mb-8 font-light leading-relaxed">
                Independent Project Managers protecting your build — keeping your project on budget, on time, and fully compliant.
              </h2>

              {/* Trust Anchors */}
              <div className="grid sm:grid-cols-3 gap-6 mb-10">
                <div className="text-center">
                  <Shield className="w-8 h-8 text-skrobaki-gold mx-auto mb-3" />
                  <h3 className="text-white font-medium mb-2">Independent Representation</h3>
                  <p className="text-white/80 text-sm">We represent YOU, not the builder</p>
                </div>
                <div className="text-center">
                  <Clock className="w-8 h-8 text-skrobaki-gold mx-auto mb-3" />
                  <h3 className="text-white font-medium mb-2">Budget & Timeline Certainty</h3>
                  <p className="text-white/80 text-sm">Stay on track with expert oversight</p>
                </div>
                <div className="text-center">
                  <FileCheck className="w-8 h-8 text-skrobaki-gold mx-auto mb-3" />
                  <h3 className="text-white font-medium mb-2">Compliance & Quality</h3>
                  <p className="text-white/80 text-sm">Ensure standards are met every step</p>
                </div>
              </div>

              <Button 
                onClick={() => scrollToSection('contact')}
                size="lg"
                className="bg-skrobaki-gold hover:bg-skrobaki-gold-light text-skrobaki-navy font-semibold px-8 py-4 text-lg rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Book Your Free Consultation with a Project Manager
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Melbourne family moving into their completed home with blueprint overlay showing successful project management"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-skrobaki-navy/50 to-transparent"></div>
              </div>
              
              {/* Floating Stats */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-6 shadow-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-skrobaki-navy">95%</div>
                  <div className="text-sm text-skrobaki-steel">Projects On Time</div>
                </div>
              </div>
              
              <div className="absolute -top-6 -right-6 bg-skrobaki-gold rounded-xl p-6 shadow-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-skrobaki-navy">$2.3M</div>
                  <div className="text-sm text-skrobaki-navy">Avg. Savings</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. About Us Section */}
      <section id="about" className="py-20 bg-skrobaki-offwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-playfair text-skrobaki-navy mb-8">
                Builders represent themselves. 
                <span className="text-skrobaki-gold">We represent YOU.</span>
              </h2>
              
              <div className="space-y-6 text-lg text-skrobaki-steel leading-relaxed">
                <p>
                  Skrobaki is Melbourne's trusted independent project management consultancy, 
                  specializing in residential construction projects for discerning homeowners.
                </p>
                
                <p>
                  Unlike builders who have their own interests at heart, we work exclusively 
                  for you — ensuring your project stays on budget, on schedule, and meets 
                  the highest quality standards.
                </p>
                
                <p>
                  Our team of certified project managers brings decades of experience in 
                  Melbourne's construction industry, combined with deep knowledge of local 
                  regulations, building codes, and compliance requirements.
                </p>
              </div>

              {/* Accreditations */}
              <div className="mt-10">
                <h3 className="text-xl font-semibold text-skrobaki-navy mb-4">Our Credentials</h3>
                <div className="flex flex-wrap gap-4">
                  <Badge variant="outline" className="border-skrobaki-gold text-skrobaki-navy px-4 py-2">
                    HIA Licensed
                  </Badge>
                  <Badge variant="outline" className="border-skrobaki-gold text-skrobaki-navy px-4 py-2">
                    MBA Certified
                  </Badge>
                  <Badge variant="outline" className="border-skrobaki-gold text-skrobaki-navy px-4 py-2">
                    VBA Registered
                  </Badge>
                  <Badge variant="outline" className="border-skrobaki-gold text-skrobaki-navy px-4 py-2">
                    $10M Insurance
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-skrobaki-navy mb-2">150+</div>
                    <div className="text-skrobaki-steel">Projects Completed</div>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-skrobaki-navy mb-2">25</div>
                    <div className="text-skrobaki-steel">Years Experience</div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-6 mt-8">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-skrobaki-navy mb-2">98%</div>
                    <div className="text-skrobaki-steel">Client Satisfaction</div>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-skrobaki-navy mb-2">$450M</div>
                    <div className="text-skrobaki-steel">Projects Managed</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Why Hire a Project Manager Section */}
      <section id="why-hire" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-playfair text-skrobaki-navy mb-6">
              Why Melbourne Homeowners Need Independent Project Management
            </h2>
            <p className="text-xl text-skrobaki-steel max-w-3xl mx-auto leading-relaxed">
              Building your dream home shouldn't become your worst nightmare. Here's how we protect your investment.
            </p>
          </div>

          {/* Risk vs Solution Comparison */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Risks Without PM */}
            <div>
              <h3 className="text-2xl font-semibold text-red-600 mb-8">Without a Project Manager</h3>
              <div className="space-y-6">
                {[
                  'Budget blowouts averaging 30-50% over contract',
                  'Project delays of 6-12 months common',
                  'Quality issues discovered after completion',
                  'Disputes with builders and subcontractors',
                  'Non-compliance with building codes',
                  'Stress and overwhelm for homeowners'
                ].map((risk, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                    <span className="text-skrobaki-steel">{risk}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits With PM */}
            <div>
              <h3 className="text-2xl font-semibold text-green-600 mb-8">With Skrobaki Project Management</h3>
              <div className="space-y-6">
                {[
                  'Transparent budgeting with detailed cost control',
                  'Realistic timelines with milestone tracking',
                  'Quality assurance at every stage',
                  'Independent mediation and problem solving',
                  'Full compliance monitoring and reporting',
                  'Peace of mind throughout your build'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-skrobaki-steel">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-skrobaki-offwhite rounded-2xl p-8">
            <h3 className="text-2xl font-semibold text-skrobaki-navy mb-8 text-center">Frequently Asked Questions</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-skrobaki-navy mb-3">Do I need a project manager to build my home in Melbourne?</h4>
                <p className="text-skrobaki-steel mb-6">While not legally required, independent project management significantly reduces risks and often saves more than it costs through better budget control and timeline management.</p>
                
                <h4 className="font-semibold text-skrobaki-navy mb-3">How does an independent project manager save me money?</h4>
                <p className="text-skrobaki-steel">Through detailed cost control, variation management, quality oversight preventing expensive rework, and timeline management avoiding costly delays.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-skrobaki-navy mb-3">What's the difference between a project manager and a builder?</h4>
                <p className="text-skrobaki-steel mb-6">Builders execute the work and represent their own interests. Project managers oversee the entire process and represent YOUR interests exclusively.</p>
                
                <h4 className="font-semibold text-skrobaki-navy mb-3">When should I engage a project manager?</h4>
                <p className="text-skrobaki-steel">Ideally before you start the tender process. We can help with contractor selection, contract review, and planning from day one.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Services Section */}
      <section id="services" className="py-20 bg-skrobaki-offwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-playfair text-skrobaki-navy mb-6">
              Our Project Management Services in Melbourne
            </h2>
            <p className="text-xl text-skrobaki-steel max-w-3xl mx-auto">
              Comprehensive support through every phase of your residential construction project.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Pre-Construction */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-skrobaki-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-skrobaki-gold" />
                  </div>
                  <h3 className="text-xl font-semibold text-skrobaki-navy">Pre-Construction</h3>
                </div>
                
                <ul className="space-y-3 text-skrobaki-steel">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-skrobaki-gold mt-1 flex-shrink-0" />
                    Feasibility studies & site analysis
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-skrobaki-gold mt-1 flex-shrink-0" />
                    Detailed budget planning & cost estimates
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-skrobaki-gold mt-1 flex-shrink-0" />
                    Tender management & contractor selection
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-skrobaki-gold mt-1 flex-shrink-0" />
                    Contract review & negotiations
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-skrobaki-gold mt-1 flex-shrink-0" />
                    Permit applications & approvals
                  </li>
                </ul>

                <div className="mt-8 pt-6 border-t border-skrobaki-steel/20">
                  <div className="text-sm text-skrobaki-steel mb-2">Problems We Solve:</div>
                  <div className="text-sm text-skrobaki-steel/80">Poor planning, unrealistic budgets, contractor selection mistakes</div>
                </div>
              </CardContent>
            </Card>

            {/* Construction Phase */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-skrobaki-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HardHat className="w-8 h-8 text-skrobaki-gold" />
                  </div>
                  <h3 className="text-xl font-semibold text-skrobaki-navy">Construction</h3>
                </div>
                
                <ul className="space-y-3 text-skrobaki-steel">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-skrobaki-gold mt-1 flex-shrink-0" />
                    Contract administration & oversight
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-skrobaki-gold mt-1 flex-shrink-0" />
                    Regular site inspections & progress reports
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-skrobaki-gold mt-1 flex-shrink-0" />
                    Cost control & variation management
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-skrobaki-gold mt-1 flex-shrink-0" />
                    Quality assurance & defect identification
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-skrobaki-gold mt-1 flex-shrink-0" />
                    Timeline management & scheduling
                  </li>
                </ul>

                <div className="mt-8 pt-6 border-t border-skrobaki-steel/20">
                  <div className="text-sm text-skrobaki-steel mb-2">Problems We Solve:</div>
                  <div className="text-sm text-skrobaki-steel/80">Budget blowouts, delays, quality issues, communication breakdowns</div>
                </div>
              </CardContent>
            </Card>

            {/* Handover */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-skrobaki-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Home className="w-8 h-8 text-skrobaki-gold" />
                  </div>
                  <h3 className="text-xl font-semibold text-skrobaki-navy">Handover</h3>
                </div>
                
                <ul className="space-y-3 text-skrobaki-steel">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-skrobaki-gold mt-1 flex-shrink-0" />
                    Final compliance checks & certifications
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-skrobaki-gold mt-1 flex-shrink-0" />
                    Comprehensive quality inspections
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-skrobaki-gold mt-1 flex-shrink-0" />
                    Defect identification & rectification
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-skrobaki-gold mt-1 flex-shrink-0" />
                    Final project documentation
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-skrobaki-gold mt-1 flex-shrink-0" />
                    Warranty & maintenance guidance
                  </li>
                </ul>

                <div className="mt-8 pt-6 border-t border-skrobaki-steel/20">
                  <div className="text-sm text-skrobaki-steel mb-2">Problems We Solve:</div>
                  <div className="text-sm text-skrobaki-steel/80">Hidden defects, incomplete work, missing documentation</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. Case Studies Section */}
      <section id="case-studies" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-playfair text-skrobaki-navy mb-6">
              Project Management Success in Melbourne
            </h2>
            <p className="text-xl text-skrobaki-steel max-w-3xl mx-auto">
              Real projects, real results. See how our independent project management delivered success for Melbourne homeowners.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                title: "Luxury Family Estate - Toorak",
                image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                challenge: "Complex heritage overlay requirements, $4.2M budget, 18-month timeline",
                solution: "Comprehensive planning phase, council liaison, detailed cost control",
                outcome: "Delivered 2 weeks early, 3% under budget, zero compliance issues",
                savings: "$180,000"
              },
              {
                title: "Contemporary Home - Brighton",
                image: "https://images.unsplash.com/photo-1600566753151-384129cf4e3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                challenge: "First-time builders, complex architectural design, $2.8M budget",
                solution: "Education and guidance, design review, contractor vetting",
                outcome: "Completed on time, exceeded quality expectations, happy clients",
                savings: "$95,000"
              },
              {
                title: "Multi-Unit Development - South Yarra",
                image: "https://images.unsplash.com/photo-1600607687644-c7171b42498b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                challenge: "Multi-stakeholder coordination, $6.5M budget, strict council requirements",
                solution: "Stakeholder management, compliance monitoring, milestone tracking",
                outcome: "All units completed within budget and timeline constraints",
                savings: "$340,000"
              }
            ].map((project, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className="relative h-64">
                  <img 
                    src={project.image}
                    alt={`Residential construction project management case study - ${project.title}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-skrobaki-gold text-skrobaki-navy px-3 py-1 rounded-full text-sm font-semibold">
                    Saved {project.savings}
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-skrobaki-navy mb-4">{project.title}</h3>
                  
                  <div className="space-y-4 text-sm">
                    <div>
                      <div className="font-medium text-skrobaki-navy mb-1">Challenge:</div>
                      <div className="text-skrobaki-steel">{project.challenge}</div>
                    </div>
                    
                    <div>
                      <div className="font-medium text-skrobaki-navy mb-1">Our Solution:</div>
                      <div className="text-skrobaki-steel">{project.solution}</div>
                    </div>
                    
                    <div>
                      <div className="font-medium text-skrobaki-navy mb-1">Outcome:</div>
                      <div className="text-skrobaki-steel">{project.outcome}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Client Testimonials */}
          <div className="mt-20">
            <h3 className="text-2xl font-semibold text-skrobaki-navy text-center mb-12">What Our Clients Say</h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  quote: "Skrobaki saved us from what could have been a disaster. Their independent oversight caught issues early and kept our builder accountable.",
                  author: "Sarah & Michael Chen",
                  project: "Custom Family Home, Camberwell",
                  rating: 5
                },
                {
                  quote: "As first-time builders, we were overwhelmed. Skrobaki guided us through every step and our project finished on time and under budget.",
                  author: "David Thompson", 
                  project: "Modern Estate, Hawthorn",
                  rating: 5
                },
                {
                  quote: "The peace of mind was worth every dollar. Professional, knowledgeable, and truly independent representation throughout our build.",
                  author: "Emma Richardson",
                  project: "Contemporary Home, Kew",
                  rating: 5
                }
              ].map((testimonial, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-skrobaki-gold fill-current" />
                      ))}
                    </div>
                    
                    <Quote className="w-8 h-8 text-skrobaki-gold/30 mb-4" />
                    
                    <p className="text-skrobaki-steel mb-6 italic">"{testimonial.quote}"</p>
                    
                    <div>
                      <div className="font-semibold text-skrobaki-navy">{testimonial.author}</div>
                      <div className="text-sm text-skrobaki-steel">{testimonial.project}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Contact Section */}
      <section id="contact" className="py-20 bg-skrobaki-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-playfair text-white mb-6">
              Book a Free Consultation with a Project Manager in Melbourne
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Ready to protect your investment? Let's discuss how independent project management can benefit your build.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Contact Form */}
            <Card className="border-0 shadow-2xl">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold text-skrobaki-navy mb-6">Get Your Free Consultation</h3>
                
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-skrobaki-steel mb-2">First Name</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-skrobaki-gold focus:border-skrobaki-gold"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-skrobaki-steel mb-2">Last Name</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-skrobaki-gold focus:border-skrobaki-gold"
                        placeholder="Smith"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-skrobaki-steel mb-2">Email</label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-skrobaki-gold focus:border-skrobaki-gold"
                      placeholder="john.smith@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-skrobaki-steel mb-2">Phone</label>
                    <input 
                      type="tel" 
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-skrobaki-gold focus:border-skrobaki-gold"
                      placeholder="0400 000 000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-skrobaki-steel mb-2">Project Type</label>
                    <select className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-skrobaki-gold focus:border-skrobaki-gold">
                      <option>Select project type</option>
                      <option>New Home Build</option>
                      <option>Major Renovation</option>
                      <option>Extension/Addition</option>
                      <option>Multi-Unit Development</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-skrobaki-steel mb-2">Project Budget Range</label>
                    <select className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-skrobaki-gold focus:border-skrobaki-gold">
                      <option>Select budget range</option>
                      <option>$500K - $1M</option>
                      <option>$1M - $2M</option>
                      <option>$2M - $5M</option>
                      <option>$5M+</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-skrobaki-steel mb-2">Tell us about your project</label>
                    <textarea 
                      rows={4}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-skrobaki-gold focus:border-skrobaki-gold"
                      placeholder="Briefly describe your project, timeline, and any specific concerns..."
                    ></textarea>
                  </div>
                  
                  <Button 
                    type="submit"
                    size="lg"
                    className="w-full bg-skrobaki-gold hover:bg-skrobaki-gold-light text-skrobaki-navy font-semibold py-4 text-lg"
                  >
                    Talk to a Melbourne Construction Project Manager Today
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold text-white mb-6">Get In Touch</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Phone className="w-6 h-6 text-skrobaki-gold mt-1" />
                    <div>
                      <div className="text-white font-medium mb-1">Phone</div>
                      <div className="text-white/90">(03) 9XXX XXXX</div>
                      <div className="text-white/70 text-sm">Monday-Friday 8am-6pm</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <Mail className="w-6 h-6 text-skrobaki-gold mt-1" />
                    <div>
                      <div className="text-white font-medium mb-1">Email</div>
                      <div className="text-white/90">info@skrobaki.com.au</div>
                      <div className="text-white/70 text-sm">We respond within 24 hours</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-skrobaki-gold mt-1" />
                    <div>
                      <div className="text-white font-medium mb-1">Office</div>
                      <div className="text-white/90">Melbourne CBD</div>
                      <div className="text-white/70 text-sm">Serving all Melbourne metro areas</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Areas */}
              <div>
                <h4 className="text-xl font-semibold text-white mb-4">Service Areas</h4>
                <div className="grid grid-cols-2 gap-3 text-white/90 text-sm">
                  <div>Toorak</div>
                  <div>Brighton</div>
                  <div>South Yarra</div>
                  <div>Camberwell</div>
                  <div>Hawthorn</div>
                  <div>Kew</div>
                  <div>Malvern</div>
                  <div>Armadale</div>
                  <div>St Kilda</div>
                  <div>Richmond</div>
                  <div className="col-span-2 text-skrobaki-gold">+ All Melbourne metro areas</div>
                </div>
              </div>

              {/* Emergency Contact */}
              <Card className="border-skrobaki-gold/20 bg-skrobaki-gold/10">
                <CardContent className="p-6">
                  <h4 className="text-white font-semibold mb-3">Project Emergency Support</h4>
                  <p className="text-white/90 text-sm mb-3">
                    Existing clients have 24/7 access to emergency project support for urgent construction issues.
                  </p>
                  <div className="text-skrobaki-gold font-medium">Emergency Line: 0400 XXX XXX</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-skrobaki-navy-dark border-t border-skrobaki-navy-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <img 
                src="/lovable-uploads/3a1e9978-cc53-4d2e-ae3a-8d5a295a8fdb.png" 
                alt="SKROBAKI"
                className="h-8 w-auto object-contain mb-4"
              />
              <p className="text-white/70 mb-4 max-w-md">
                Independent project management consultancy for Melbourne homeowners. 
                Professional, reliable, and exclusively representing your interests.
              </p>
              <div className="text-white/60 text-sm">
                ABN: XX XXX XXX XXX | License: XXXXX | Insured: $10M Professional Indemnity
              </div>
            </div>
            
            <div>
              <h5 className="text-white font-semibold mb-4">Services</h5>
              <ul className="space-y-2 text-white/70 text-sm">
                <li>Pre-Construction Planning</li>
                <li>Construction Management</li>
                <li>Quality Assurance</li>
                <li>Contract Administration</li>
                <li>Compliance Monitoring</li>
              </ul>
            </div>
            
            <div>
              <h5 className="text-white font-semibold mb-4">Resources</h5>
              <ul className="space-y-2 text-white/70 text-sm">
                <li>Building Guide</li>
                <li>Cost Calculator</li>
                <li>HIA Contract Help</li>
                <li>Melbourne Building Codes</li>
                <li>Project Checklist</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-skrobaki-navy-light mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-white/60 text-sm">
              © 2024 Skrobaki Project Management. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-white/60 hover:text-white text-sm">Privacy Policy</a>
              <a href="#" className="text-white/60 hover:text-white text-sm">Terms of Service</a>
              <a href="#" className="text-white/60 hover:text-white text-sm">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};