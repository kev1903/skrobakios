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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="relative z-50 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/3a1e9978-cc53-4d2e-ae3a-8d5a295a8fdb.png" 
              alt="SKROBAKI Logo"
              className="h-8 w-auto object-contain"
            />
          </div>

          {/* Desktop Header Actions */}
          <div className="hidden lg:flex items-center space-x-6">
            <button 
              onClick={() => onNavigate('auth')}
              className="text-gray-600 hover:text-gray-700 transition-colors text-sm font-inter font-medium"
            >
              Login
            </button>
            <span className="text-gray-400">/</span>
            <button 
              onClick={() => onNavigate('auth')}
              className="text-skrobaki-blue hover:text-skrobaki-blue-light transition-colors text-sm font-inter font-medium"
            >
              Register
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center text-gray-600 hover:text-gray-700 transition-colors text-sm font-inter font-medium"
            >
              <Menu className="w-4 h-4 mr-2" />
              Menu
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden flex items-center text-gray-600 hover:text-gray-700 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="relative grid grid-cols-12 grid-rows-12 h-[calc(100vh-120px)] max-w-7xl mx-auto px-6 gap-4">
        {/* Left Navigation Arrow */}
        <div className="col-span-1 row-span-6 flex items-center justify-start">
          <button className="text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowRight className="w-8 h-8 rotate-180" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="col-span-10 row-span-8 flex flex-col justify-center">
          {/* Section Number */}
          <div className="text-gray-400 text-8xl md:text-9xl lg:text-[12rem] font-poppins font-extralight leading-none mb-4">
            01
          </div>
        </div>

        {/* Right Navigation Arrow */}
        <div className="col-span-1 row-span-6 flex items-center justify-end">
          <button className="text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowRight className="w-8 h-8" />
          </button>
        </div>

      </div>

      {/* Bottom Skrobaki Blue Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-skrobaki-blue"></div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-[100] lg:hidden">
          <div className="flex flex-col items-center justify-center h-full text-gray-700 space-y-8">
            <button 
              onClick={() => onNavigate('auth')}
              className="text-2xl font-light hover:text-skrobaki-blue transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => onNavigate('auth')}
              className="text-2xl font-light text-skrobaki-blue hover:text-skrobaki-blue-light transition-colors"
            >
              Register
            </button>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-6 right-6 text-gray-600 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};