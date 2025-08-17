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
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    }}>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/3a1e9978-cc53-4d2e-ae3a-8d5a295a8fdb.png" 
                alt="SKROBAKI - Independent Project Management"
                className="h-10 w-auto object-contain cursor-pointer"
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
                  className="text-sm font-medium text-neutral-700 hover:text-primary transition-all duration-300 hover:scale-105"
                  onClick={() => scrollToSection(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* CTA and Sign In Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <Button 
                variant="ghost"
                onClick={() => onNavigate('auth')}
                className="text-neutral-700 hover:text-primary font-medium glass-hover rounded-2xl px-6"
              >
                Sign In
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-3 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #34739B 0%, #2a5d7f 100%)',
                  boxShadow: '0 4px 20px rgba(52, 115, 155, 0.3)'
                }}
              >
                Book Free Consultation
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-neutral-700 hover:text-primary transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t border-white/20">
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
                    className="text-left text-neutral-700 hover:text-primary font-medium transition-colors"
                    onClick={() => scrollToSection(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
                <Button 
                  variant="ghost"
                  onClick={() => onNavigate('auth')}
                  className="text-left text-neutral-700 hover:text-primary font-medium justify-start"
                >
                  Sign In
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-white font-medium mt-4 w-full rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #34739B 0%, #2a5d7f 100%)',
                  }}
                >
                  Book Free Consultation
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content - Centered Logo with Glass Card */}
      <div className="pt-20 min-h-screen flex items-center justify-center p-6">
        <div className="glass-mountain rounded-3xl p-12 max-w-md w-full text-center relative overflow-hidden">
          {/* Mountain backdrop effect */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: 'linear-gradient(135deg, rgba(52, 115, 155, 0.1) 0%, rgba(52, 115, 155, 0.05) 100%)',
            }}
          />
          
          <div className="relative z-10">
            <img 
              src="/lovable-uploads/3a1e9978-cc53-4d2e-ae3a-8d5a295a8fdb.png" 
              alt="SKROBAKI - Independent Project Management"
              className="h-20 w-auto object-contain mx-auto mb-6"
            />
            
            <h1 className="text-2xl font-display font-light text-neutral-800 mb-3">
              Welcome to SKROBAKI
            </h1>
            
            <p className="text-neutral-600 font-inter text-sm leading-relaxed">
              Independent Project Management Excellence
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};