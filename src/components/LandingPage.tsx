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
              className="text-gray-600 hover:text-gray-700 transition-colors text-sm font-medium"
            >
              Login
            </button>
            <span className="text-gray-400">/</span>
            <button 
              onClick={() => onNavigate('auth')}
              className="text-blue-600 hover:text-blue-500 transition-colors text-sm font-medium"
            >
              Register
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center text-gray-600 hover:text-gray-700 transition-colors text-sm font-medium"
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
          <div className="text-gray-400 text-8xl md:text-9xl lg:text-[12rem] font-light leading-none mb-4">
            01
          </div>
          
          {/* Main Heading */}
          <div className="mb-8">
            <h1 className="text-gray-700 text-4xl md:text-6xl lg:text-7xl font-light leading-tight mb-4">
              <span className="text-blue-600 font-medium">Project Management</span> Essential
              <br />
              Services
            </h1>
            
            {/* Underlined CTA */}
            <div className="mt-8">
              <span className="text-gray-600 text-xl border-b-2 border-blue-600 pb-1">
                Start today
              </span>
            </div>
          </div>
        </div>

        {/* Right Navigation Arrow */}
        <div className="col-span-1 row-span-6 flex items-center justify-end">
          <button className="text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowRight className="w-8 h-8" />
          </button>
        </div>

        {/* Bottom Left - Watch Trailer */}
        <div className="col-span-3 row-span-2 flex items-end">
          <button className="flex items-center text-gray-600 hover:text-gray-700 transition-colors group">
            <div className="w-12 h-12 rounded-full border border-blue-600 flex items-center justify-center mr-4 group-hover:bg-blue-600/10 transition-colors">
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="text-gray-700 font-medium">Watch</div>
              <div className="text-gray-500 text-sm">our trailer</div>
            </div>
          </button>
        </div>

        {/* Bottom Center - Gallery */}
        <div className="col-span-3 row-span-2 flex items-end">
          <div className="text-left">
            <div className="text-gray-700 font-medium mb-1">Gallery</div>
            <div className="text-gray-400 text-xs tracking-wider">0A</div>
          </div>
        </div>

        {/* Bottom Center Right - Training */}
        <div className="col-span-3 row-span-2 flex items-end">
          <div className="text-left">
            <div className="text-gray-700 font-medium mb-1">Training</div>
            <div className="text-gray-400 text-xs tracking-wider">0B</div>
          </div>
        </div>

        {/* Bottom Right - Certificate */}
        <div className="col-span-3 row-span-2 flex items-end">
          <div className="text-left">
            <div className="text-gray-700 font-medium mb-1">Certificate</div>
            <div className="text-gray-400 text-xs tracking-wider">0C</div>
          </div>
        </div>
      </div>

      {/* Bottom Blue Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-[100] lg:hidden">
          <div className="flex flex-col items-center justify-center h-full text-gray-700 space-y-8">
            <button 
              onClick={() => onNavigate('auth')}
              className="text-2xl font-light hover:text-blue-600 transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => onNavigate('auth')}
              className="text-2xl font-light text-blue-600 hover:text-blue-500 transition-colors"
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