import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight, Home, FolderOpen, FileText, Mail, Download } from 'lucide-react';
import heroImage from '@/assets/new-architecture-background.png';

interface ProjectsPageProps {
  onNavigate: (page: string) => void;
}

export const ProjectsPage = ({
  onNavigate
}: ProjectsPageProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeSection, setActiveSection] = useState('overview');

  // Sample gallery images - replace with actual project images
  const galleryImages = [
    '/lovable-uploads/121a0a8f-2d3d-4510-8eea-aa8d66ca2e81.png',
    '/lovable-uploads/adb381c0-ea77-44b9-9eed-b0885c7f134f.png',
    '/lovable-uploads/adb381c0-ea77-44b9-9eed-b0885c7f134f.png'
  ];

  const sidebarItems = [
    { title: "Overview", icon: Home, id: "overview" },
    { title: "Gallery", icon: FolderOpen, id: "gallery" },
    { title: "Details", icon: FileText, id: "details" },
    { title: "Contact", icon: Mail, id: "contact" }
  ];

  const nextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Hero Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Main Layout */}
      <div className="relative z-40 h-screen flex">
        {/* Left Sidebar - Glass Panel */}
        <div className="w-80 h-full">
          <div 
            className="backdrop-blur-xl border border-white/20 w-full h-full flex flex-col p-6 shadow-2xl shadow-black/60 backdrop-saturate-150"
            style={{ backgroundColor: 'rgba(0,10,20,0.8)' }}
          >
            {/* Header */}
            <div className="mb-8">
              <button 
                onClick={() => onNavigate('landing')} 
                className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium tracking-wide">BACK</span>
              </button>
              
              <h1 className="text-white text-xl font-light tracking-wide mb-2">
                Thanet Street, Malvern
              </h1>
              <p className="text-white/60 text-sm tracking-wide">
                Residential Architecture
              </p>
            </div>

            {/* Navigation */}
            <div className="mb-8">
              <h3 className="text-white/80 text-xs font-medium tracking-widest uppercase mb-4">
                Navigation
              </h3>
              <div className="space-y-1">
                {sidebarItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium tracking-wide transition-all duration-200 ${
                      activeSection === item.id 
                        ? 'bg-white/20 text-white' 
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Project Info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-white/80 text-xs font-medium tracking-widest uppercase mb-3">
                  Project Info
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-white/60 text-xs tracking-wide mb-1">Type</p>
                    <p className="text-white text-sm">Residential</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs tracking-wide mb-1">Year</p>
                    <p className="text-white text-sm">2023</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs tracking-wide mb-1">Status</p>
                    <p className="text-white text-sm">Completed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Project Details Section */}
          <div className="flex-1 p-8 overflow-y-auto">
            <div 
              className="backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
            >
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl lg:text-5xl font-light text-gray-900 mb-4 tracking-tight">
                  Thanet Street, Malvern
                </h1>
                <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">
                  A contemporary residential project featuring modern architectural elements with sustainable design principles. 
                  This elegant home seamlessly blends indoor and outdoor living spaces.
                </p>
              </div>

              {/* Project Description */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-light text-gray-900 mb-4 tracking-wide">Project Overview</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Canada-based studio Bourgeois/Lechasseur Architectes has designed an elegant new modern mountain home 
                    adjacent to an existing lakeside chalet in Northern Quebec, at the edge of a ski resort. The design 
                    emphasizes natural materials and sustainable construction methods.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-light text-gray-900 mb-4 tracking-wide">Design Features</h2>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Contemporary facade with natural stone cladding</li>
                    <li>• Large format windows maximizing natural light</li>
                    <li>• Sustainable materials and energy-efficient systems</li>
                    <li>• Integrated landscape design</li>
                    <li>• Private outdoor spaces and courtyards</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-light text-gray-900 mb-4 tracking-wide">Awards & Recognition</h2>
                  <p className="text-gray-600">
                    This project has been featured in Architectural Digest and received the 2023 Australian Institute 
                    of Architects Award for Residential Architecture.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Section */}
          <div className="w-96 h-full flex flex-col">
            <div 
              className="backdrop-blur-xl border border-white/20 h-full flex flex-col shadow-2xl"
              style={{ backgroundColor: 'rgba(0,10,20,0.85)' }}
            >
              {/* Gallery Header */}
              <div className="p-6 border-b border-white/10">
                <h3 className="text-white text-lg font-light tracking-wide mb-1">Project Gallery</h3>
                <p className="text-white/60 text-sm">
                  {currentImageIndex + 1} of {galleryImages.length}
                </p>
              </div>
              
              {/* Gallery Image */}
              <div className="flex-1 relative">
                <img 
                  src={galleryImages[currentImageIndex]} 
                  alt={`Project image ${currentImageIndex + 1}`} 
                  className="w-full h-full object-cover" 
                />
                
                {/* Navigation Arrows */}
                <button 
                  onClick={prevImage} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 backdrop-blur-sm"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                
                <button 
                  onClick={nextImage} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 backdrop-blur-sm"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
                
                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {galleryImages.map((_, index) => (
                    <button 
                      key={index} 
                      onClick={() => setCurrentImageIndex(index)} 
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`} 
                    />
                  ))}
                </div>
              </div>
              
              {/* Gallery Controls */}
              <div className="p-4 border-t border-white/10">
                <div className="flex justify-between items-center space-x-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white/80 hover:text-white hover:bg-white/10 border border-white/20"
                  >
                    View All Images
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};