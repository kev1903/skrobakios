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
                  className="text-sm font-medium text-skrobaki-steel hover:text-skrobaki-navy transition-colors duration-200"
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
                className="text-skrobaki-steel hover:text-skrobaki-navy font-medium"
              >
                Sign In
              </Button>
              <Button 
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
                    className="text-left text-skrobaki-steel hover:text-skrobaki-navy font-medium"
                  >
                    {item.label}
                  </button>
                ))}
                <Button 
                  variant="ghost"
                  onClick={() => onNavigate('auth')}
                  className="text-left text-skrobaki-steel hover:text-skrobaki-navy font-medium justify-start"
                >
                  Sign In
                </Button>
                <Button 
                  className="bg-skrobaki-gold hover:bg-skrobaki-gold-light text-skrobaki-navy font-medium mt-4 w-full"
                >
                  Book Free Consultation
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content - Centered Logo */}
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <img 
            src="/lovable-uploads/3a1e9978-cc53-4d2e-ae3a-8d5a295a8fdb.png" 
            alt="SKROBAKI - Independent Project Management"
            className="h-20 w-auto object-contain mx-auto"
          />
        </div>
      </div>
    </div>
  );
};