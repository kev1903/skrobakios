import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowRight, 
  Menu, 
  X, 
  Building, 
  Users, 
  HardHat,
  Target,
  Heart,
  Lightbulb,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  Calendar,
  MessageSquare,
  Eye,
  Calculator,
  Award,
  Star,
  Home
 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import heroImage from '@/assets/hero-architecture-new.png';
import projectManagementImage from '@/assets/project-management-team.jpg';
import modernBuilding from '@/assets/modern-building.jpg';
import whiteBuilding from '@/assets/white-building.jpg';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage = ({ onNavigate }: LandingPageProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: '',
    message: ''
  });
  const isMobile = useIsMobile();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const scrollToSection = (sectionId: string) => {
    setIsMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const services = [
    {
      title: "Advisory Services",
      description: "Expert guidance from project conception to completion with strategic planning and risk assessment.",
      icon: Building,
      features: ["Project Feasibility Analysis", "Budget Planning & Optimization", "Risk Assessment & Mitigation"]
    },
    {
      title: "Project Management", 
      description: "End-to-end project coordination ensuring timely delivery within budget and quality standards.",
      icon: Users,
      features: ["Project Planning & Scheduling", "Budget Control & Cost Management", "Quality Assurance & Control"]
    },
    {
      title: "Construction Management",
      description: "On-site coordination and oversight ensuring safety compliance and seamless execution.",
      icon: HardHat,
      features: ["Site Coordination & Supervision", "Trade Management & Scheduling", "Safety Compliance & Monitoring"]
    }
  ];

  const projects = [
    {
      title: "Modern Family Estate",
      location: "Toorak, VIC",
      image: modernBuilding,
      description: "Luxury 5-bedroom home with sustainable design principles and smart home integration",
      category: "Residential",
      year: "2024",
      area: "450 sqm"
    },
    {
      title: "Contemporary Retreat",
      location: "Brighton, VIC",
      image: whiteBuilding,
      description: "Minimalist design with premium finishes and seamless indoor-outdoor living",
      category: "Residential", 
      year: "2023",
      area: "320 sqm"
    },
    {
      title: "Architectural Masterpiece",
      location: "South Yarra, VIC",
      image: heroImage,
      description: "Award-winning design with innovative structural solutions and luxury amenities",
      category: "Luxury Residential",
      year: "2023", 
      area: "680 sqm"
    }
  ];

  const values = [
    {
      icon: Target,
      title: "Precision",
      description: "Every detail matters. We approach each project with meticulous attention to precision, ensuring excellence in every aspect."
    },
    {
      icon: Heart,
      title: "Passion", 
      description: "Architecture is our passion. We bring enthusiasm and creative energy to every project, transforming visions into reality."
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We embrace cutting-edge technology and innovative solutions, staying ahead of industry trends."
    }
  ];

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      value: "+61 3 9xxx xxxx",
      description: "Mon-Fri 9:00 AM - 6:00 PM"
    },
    {
      icon: Mail,
      title: "Email", 
      value: "hello@skrobaki.com",
      description: "We'll respond within 24 hours"
    },
    {
      icon: MapPin,
      title: "Location",
      value: "Melbourne, VIC",
      description: "Serving greater Melbourne area"
    },
    {
      icon: Clock,
      title: "Office Hours",
      value: "Mon-Fri 9:00-6:00",
      description: "Consultations by appointment"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-border/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src="/lovable-uploads/b0e435b5-f844-4b7c-bce4-cccf69ad4e5b.png" alt="Skrobaki" className="h-8 w-auto" />
            </div>
            
            <div className="hidden lg:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('hero')}
                className="text-foreground/80 hover:text-foreground text-sm font-medium transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('services')}
                className="text-foreground/80 hover:text-foreground text-sm font-medium transition-colors"
              >
                Services
              </button>
              <button 
                onClick={() => scrollToSection('portfolio')}
                className="text-foreground/80 hover:text-foreground text-sm font-medium transition-colors"
              >
                Portfolio
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className="text-foreground/80 hover:text-foreground text-sm font-medium transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-foreground/80 hover:text-foreground text-sm font-medium transition-colors"
              >
                Contact
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => onNavigate('auth')}
                className="text-foreground border border-border/20 hover:bg-muted/50 rounded-full px-6"
              >
                Sign In
              </Button>
              
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="lg:hidden text-foreground p-2"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden bg-black/30 backdrop-blur-md py-6 px-6 rounded-lg mt-4">
              <nav className="flex flex-col space-y-4">
                <button 
                  onClick={() => scrollToSection('hero')}
                  className="text-white/90 hover:text-white text-left font-medium tracking-wide transition-colors"
                >
                  HOME
                </button>
                <button 
                  onClick={() => scrollToSection('services')}
                  className="text-white/90 hover:text-white text-left font-medium tracking-wide transition-colors"
                >
                  SERVICES
                </button>
                <button 
                  onClick={() => scrollToSection('portfolio')}
                  className="text-white/90 hover:text-white text-left font-medium tracking-wide transition-colors"
                >
                  PORTFOLIO
                </button>
                <button 
                  onClick={() => scrollToSection('about')}
                  className="text-white/90 hover:text-white text-left font-medium tracking-wide transition-colors"
                >
                  ABOUT
                </button>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="text-white/90 hover:text-white text-left font-medium tracking-wide transition-colors"
                >
                  CONTACT
                </button>
              </nav>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="h-screen relative overflow-hidden bg-gray-50">
        {/* Hero Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gray-900/40" />

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center justify-center text-center text-white">
          <div className="max-w-4xl px-6">
            <h1 className="text-6xl lg:text-8xl font-bold mb-6 leading-tight">
              A construction system that works like an 
              <span className="text-blue-400"> Organiser</span>
            </h1>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Great projects deserve a system that does it all, from making plans and smooth checkouts to helping you market and track performance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => scrollToSection('services')}
                className="bg-gray-900 text-white hover:bg-gray-800 px-8 rounded-full"
              >
                Get an Invite
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={() => scrollToSection('contact')}
                className="border-white/30 text-white hover:bg-white/10 px-8 rounded-full"
              >
                Book a Call
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60">
          <div className="flex flex-col items-center">
            <span className="text-sm mb-2">Scroll to explore</span>
            <div className="w-6 h-10 border border-white/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-8">
              Our <span className="text-accent">Services</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Comprehensive construction and project management solutions designed for excellence at every stage
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="bg-white border border-border/10 p-8 hover:shadow-lg transition-all duration-300 rounded-2xl">
                <CardContent className="p-0">
                  <div className="text-center mb-6">
                    <service.icon className="w-16 h-16 text-accent mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-foreground mb-3">{service.title}</h3>
                  </div>
                  <p className="text-muted-foreground mb-6 text-center">{service.description}</p>
                  <div className="space-y-3">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-8">
              Featured <span className="text-accent">Portfolio</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              A curated showcase of our most exceptional projects, demonstrating our commitment to architectural excellence
            </p>
          </div>

          {/* Statistics */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            <div className="glass-card p-6 text-center">
              <div className="text-3xl font-bold text-brand-gold mb-2">50+</div>
              <p className="text-muted-foreground text-sm">Projects Completed</p>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-3xl font-bold text-brand-gold mb-2">15+</div>
              <p className="text-muted-foreground text-sm">Awards Won</p>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-3xl font-bold text-brand-gold mb-2">100%</div>
              <p className="text-muted-foreground text-sm">Client Satisfaction</p>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-3xl font-bold text-brand-gold mb-2">25+</div>
              <p className="text-muted-foreground text-sm">Years Experience</p>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <Card key={index} className="glass-card overflow-hidden hover:shadow-lg transition-all duration-300">
                <div 
                  className="h-64 bg-cover bg-center"
                  style={{ backgroundImage: `url(${project.image})` }}
                />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-card-foreground">{project.title}</h3>
                    <span className="text-brand-gold text-sm font-medium">{project.year}</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">{project.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-4 text-xs text-muted-foreground">
                      <span>{project.area}</span>
                      <span>{project.category}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-brand-gold hover:text-brand-gold/80"
                    >
                      View Details <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-xl text-foreground mb-8 font-playfair">
              About <span className="text-gradient-gold">Skrobaki</span>
            </h2>
            <p className="body-lg text-muted-foreground max-w-3xl mx-auto">
              For over 25 years, Skrobaki has been at the forefront of architectural excellence, transforming visions into extraordinary built environments through sophisticated design philosophy and uncompromising attention to detail.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-3xl font-bold text-foreground mb-6">25+ Years of Excellence</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Since our founding, we have consistently delivered projects that exceed expectations, combining innovative design with practical construction expertise. Our commitment to quality and client satisfaction has earned us recognition as leaders in the architectural and construction industry.
              </p>
              
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="text-4xl font-bold text-brand-gold mb-2">150+</div>
                  <div className="text-sm text-muted-foreground">Completed Projects</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-brand-gold mb-2">98%</div>
                  <div className="text-sm text-muted-foreground">Client Satisfaction</div>
                </div>
              </div>
            </div>
            
            <div 
              className="h-96 bg-cover bg-center rounded-3xl"
              style={{ backgroundImage: `url(${projectManagementImage})` }}
            />
          </div>

          {/* Values */}
          <div className="grid lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="glass-card p-8 text-center">
                <value.icon className="w-12 h-12 text-brand-gold mx-auto mb-4" />
                <h4 className="text-xl font-bold text-foreground mb-3">{value.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-xl text-card-foreground mb-8 font-playfair">
              Get In <span className="text-gradient-gold">Touch</span>
            </h2>
            <p className="body-lg text-muted-foreground max-w-3xl mx-auto">
              Ready to start your project? Contact our team for a consultation and let's bring your architectural vision to life.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="glass-card p-8">
              <h3 className="text-2xl font-bold text-card-foreground mb-6">Start Your Project</h3>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Name</label>
                    <Input 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Email</label>
                    <Input 
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Phone</label>
                    <Input 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Project Type</label>
                    <select 
                      value={formData.projectType}
                      onChange={(e) => setFormData({...formData, projectType: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    >
                      <option value="">Select project type</option>
                      <option value="new">New Construction</option>
                      <option value="renovation">Renovation</option>
                      <option value="extension">Extension</option>
                      <option value="commercial">Commercial</option>
                      <option value="consultation">Consultation Only</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Message</label>
                  <Textarea 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={4}
                    className="w-full"
                    placeholder="Tell us about your project..."
                  />
                </div>
                
                <Button type="submit" className="button-blue w-full">
                  Send Message
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="grid gap-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="glass-card p-6">
                    <div className="flex items-start space-x-4">
                      <info.icon className="w-6 h-6 text-brand-gold mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-card-foreground mb-1">{info.title}</h4>
                        <p className="text-card-foreground font-medium">{info.value}</p>
                        <p className="text-muted-foreground text-sm">{info.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Call to Action */}
              <div className="glass-card p-8 text-center">
                <Calendar className="w-12 h-12 text-brand-gold mx-auto mb-4" />
                <h4 className="text-xl font-bold text-card-foreground mb-3">Book a Consultation</h4>
                <p className="text-muted-foreground mb-6 text-sm">
                  Schedule a complimentary consultation to discuss your project requirements and explore how we can help.
                </p>
                <Button className="button-blue w-full">
                  Schedule Meeting
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <img src="/lovable-uploads/b0e435b5-f844-4b7c-bce4-cccf69ad4e5b.png" alt="Skrobaki" className="h-8 w-auto" />
          </div>
          <p className="text-muted-foreground text-sm">
            © 2024 Skrobaki. All rights reserved. | Transforming architectural visions into reality.
          </p>
        </div>
      </footer>
    </div>
  );
};