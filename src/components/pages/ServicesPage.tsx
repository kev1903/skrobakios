import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import projectManagementImage from '@/assets/project-management-team.jpg';
import abstractGreyBackground from '@/assets/abstract-grey-background.jpg';
import { 
  ArrowRight, 
  ArrowLeft,
  Building, 
  Ruler, 
  Eye,
  Users,
  Clipboard,
  Settings,
  TrendingUp,
  CheckCircle,
  Star,
  Calendar,
  Lightbulb,
  MapPin,
  FileText,
  Home,
  LayoutGrid,
  Box,
  Camera,
  Printer,
  Wrench,
  TreePine,
  Heart,
  Tent,
  Square,
  Circle,
  Search,
  ShoppingCart,
  Network,
  DollarSign,
  Scan,
  Cog,
  Monitor,
  BarChart3,
  Brain,
  Target,
  Calculator,
  Grid3x3,
  ArrowRightLeft,
  LineChart,
  Shield,
  HardHat,
  Gem,
  MessageCircle,
  UserCheck,
  ClipboardList
} from 'lucide-react';

interface ServicesPageProps {
  onNavigate: (page: string) => void;
}

export const ServicesPage = ({ onNavigate }: ServicesPageProps) => {
  return (
    <div className="min-h-screen">
      {/* Fixed Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => onNavigate('landing')}
                className="text-white/70 hover:text-white text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <img src="/lovable-uploads/b0e435b5-f844-4b7c-bce4-cccf69ad4e5b.png" alt="Skrobaki" className="h-8 w-auto" />
            </div>
            
            <div className="hidden lg:flex items-center space-x-8">
              <button 
                onClick={() => onNavigate('services')}
                className="text-white font-medium text-sm uppercase tracking-wider"
              >
                Services
              </button>
              <button 
                onClick={() => onNavigate('projects')}
                className="text-white/70 hover:text-white text-sm font-medium uppercase tracking-wider transition-colors"
              >
                Projects
              </button>
              <button 
                onClick={() => onNavigate('about')}
                className="text-white/70 hover:text-white text-sm font-medium uppercase tracking-wider transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => onNavigate('contact')}
                className="text-white/70 hover:text-white text-sm font-medium uppercase tracking-wider transition-colors"
              >
                Contact
              </button>
            </div>

            <Button 
              variant="outline" 
              onClick={() => onNavigate('auth')}
              className="text-white border-white/30 hover:bg-white/10 backdrop-blur-sm"
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full Screen */}
      <section className="h-screen relative flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${abstractGreyBackground})` }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Building className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-6xl lg:text-8xl font-bold text-white mb-8 tracking-tight leading-none">
            CONSTRUCTION
            <br />
            <span className="text-white/70">SERVICES</span>
          </h1>
          <p className="text-xl lg:text-2xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
            Professional construction & project management solutions designed for excellence at every stage
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              size="lg"
              onClick={() => onNavigate('contact')}
              className="bg-white text-black hover:bg-white/90 font-medium px-8 py-4 text-lg"
            >
              Get Started
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="text-white border-white/30 hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex flex-col items-center text-white/60">
            <span className="text-sm mb-2 uppercase tracking-wider">Scroll</span>
            <div className="w-6 h-10 border border-white/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-bounce"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Advisory Section - Full Screen */}
      <section className="h-screen relative flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(/lovable-uploads/f3e6fb6d-ca4a-40dc-8303-ed7d871ea1ec.png)` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-indigo-900/80" />
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-6">
              <span className="text-white/60 text-sm font-medium mr-4">01</span>
              <div className="h-px bg-white/30 flex-1 max-w-20"></div>
            </div>
            <h2 className="text-5xl lg:text-7xl font-bold text-white mb-8 leading-none">
              ADVISORY
            </h2>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Help clients make informed decisions at every stage of their project, from feasibility and budgeting to design reviews and procurement strategies.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center lg:justify-start space-x-3">
                <CheckCircle className="w-5 h-5 text-white/60" />
                <span className="text-white/80">Project Feasibility Analysis</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-3">
                <CheckCircle className="w-5 h-5 text-white/60" />
                <span className="text-white/80">Budget Planning & Optimization</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-3">
                <CheckCircle className="w-5 h-5 text-white/60" />
                <span className="text-white/80">Risk Assessment & Mitigation</span>
              </div>
            </div>
            <Button 
              size="lg"
              onClick={() => onNavigate('contact')}
              className="bg-white text-black hover:bg-white/90 font-medium px-8"
            >
              Learn More
            </Button>
          </div>
          
          <div className="flex justify-center">
            <div className="w-80 h-80 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Lightbulb className="w-32 h-32 text-white/60" />
            </div>
          </div>
        </div>
      </section>

      {/* Project Management Section - Full Screen */}
      <section className="h-screen relative flex items-center justify-center overflow-hidden bg-white">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${projectManagementImage})` }}
        />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="flex justify-center lg:order-2">
            <div className="w-80 h-80 bg-gray-900/10 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Settings className="w-32 h-32 text-gray-900/60" />
            </div>
          </div>
          
          <div className="text-center lg:text-left lg:order-1">
            <div className="flex items-center justify-center lg:justify-start mb-6">
              <span className="text-gray-600 text-sm font-medium mr-4">02</span>
              <div className="h-px bg-gray-300 flex-1 max-w-20"></div>
            </div>
            <h2 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-8 leading-none">
              PROJECT
              <br />
              <span className="text-gray-600">MANAGEMENT</span>
            </h2>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              End-to-end management of projects, ensuring they are delivered on time, within budget, and to the highest quality standards while protecting the client's interest.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center lg:justify-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Project Planning & Scheduling</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-3">
                <TrendingUp className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Budget Control & Cost Management</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-3">
                <Users className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Quality Assurance & Control</span>
              </div>
            </div>
            <Button 
              size="lg"
              onClick={() => onNavigate('contact')}
              className="bg-gray-900 text-white hover:bg-gray-800 font-medium px-8"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Construction Management Section - Full Screen */}
      <section className="h-screen relative flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(/lovable-uploads/f3e6fb6d-ca4a-40dc-8303-ed7d871ea1ec.png)` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-900/80 to-red-900/80" />
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-6">
              <span className="text-white/60 text-sm font-medium mr-4">03</span>
              <div className="h-px bg-white/30 flex-1 max-w-20"></div>
            </div>
            <h2 className="text-5xl lg:text-7xl font-bold text-white mb-8 leading-none">
              CONSTRUCTION
              <br />
              <span className="text-white/70">MANAGEMENT</span>
            </h2>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Hands-on coordination and oversight of construction activities, managing trades, schedules, compliance, and site operations to achieve seamless project execution.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center lg:justify-start space-x-3">
                <HardHat className="w-5 h-5 text-white/60" />
                <span className="text-white/80">Site Coordination & Supervision</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-3">
                <Clipboard className="w-5 h-5 text-white/60" />
                <span className="text-white/80">Trade Management & Scheduling</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-3">
                <Shield className="w-5 h-5 text-white/60" />
                <span className="text-white/80">Safety Compliance & Monitoring</span>
              </div>
            </div>
            <Button 
              size="lg"
              onClick={() => onNavigate('contact')}
              className="bg-white text-black hover:bg-white/90 font-medium px-8"
            >
              Learn More
            </Button>
          </div>
          
          <div className="flex justify-center">
            <div className="w-80 h-80 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
              <HardHat className="w-32 h-32 text-white/60" />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section - Full Screen */}
      <section className="h-screen relative flex items-center justify-center overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <h2 className="text-5xl lg:text-7xl font-bold text-white mb-8 leading-none">
            READY TO START
            <br />
            <span className="text-white/70">YOUR PROJECT?</span>
          </h2>
          <p className="text-xl lg:text-2xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
            Let's discuss how our comprehensive services can bring your architectural vision to life with exceptional quality and attention to detail.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              size="lg"
              onClick={() => onNavigate('contact')}
              className="bg-white text-black hover:bg-white/90 font-medium px-12 py-4 text-lg"
            >
              <Calendar className="w-5 h-5 mr-3" />
              Book Consultation
            </Button>
            <Button 
              variant="outline"
              size="lg"
              onClick={() => onNavigate('projects')}
              className="text-white border-white/30 hover:bg-white/10 backdrop-blur-sm px-12 py-4 text-lg"
            >
              View Our Work
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};