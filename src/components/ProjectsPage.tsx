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

  const services = [
    { title: "Interior Design", description: "Complete interior architecture solutions", icon: Home, id: "service-4" },
    { title: "Project Management", description: "End-to-end project coordination", icon: FolderOpen, id: "service-5" },
    { title: "Consulting", description: "Expert architectural consultation", icon: FileText, id: "service-6" },
    { title: "3D Visualization", description: "Photorealistic architectural renders", icon: Mail, id: "service-7" },
    { title: "Sustainable Design", description: "Eco-friendly building solutions", icon: Download, id: "service-8" }
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

            {/* Our Services */}
            <div className="space-y-6">
              <div>
                <h3 className="text-white/80 text-xs font-medium tracking-widest uppercase mb-4">
                  Our Services
                </h3>
                <div className="space-y-4">
                  {services.map((service, index) => (
                    <div 
                      key={service.id}
                      className="p-4 rounded-lg bg-white/10 hover:bg-white/15 transition-all duration-200 cursor-pointer border border-white/10"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                          <service.icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white text-sm font-medium tracking-wide mb-1">
                            {service.title}
                          </h4>
                          <p className="text-white/60 text-xs leading-relaxed">
                            {service.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area - Gallery */}
        <div className="flex-1 p-8">
          <div 
            className="backdrop-blur-xl border border-white/20 h-full flex flex-col shadow-2xl"
            style={{ backgroundColor: 'rgba(0,10,20,0.85)' }}
          >
            {/* Gallery Header */}
            <div className="p-8 border-b border-white/10">
              <h1 className="text-white text-4xl lg:text-5xl font-light tracking-tight mb-4">
                Project Gallery
              </h1>
              <p className="text-white/80 text-lg">
                Thanet Street, Malvern - Residential Architecture
              </p>
              <p className="text-white/60 text-sm mt-2">
                {currentImageIndex + 1} of {galleryImages.length} images
              </p>
            </div>
            
            {/* Main Gallery Display */}
            <div className="flex-1 relative overflow-hidden">
              <div className="h-full flex items-center justify-center p-8">
                <div className="relative w-full h-full max-w-6xl">
                  <img 
                    src={galleryImages[currentImageIndex]} 
                    alt={`Project image ${currentImageIndex + 1}`} 
                    className="w-full h-full object-cover rounded-xl shadow-2xl" 
                  />
                  
                  {/* Navigation Arrows */}
                  <button 
                    onClick={prevImage} 
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105 backdrop-blur-sm"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  
                  <button 
                    onClick={nextImage} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105 backdrop-blur-sm"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Gallery Controls */}
            <div className="p-8 border-t border-white/10">
              <div className="flex justify-between items-center">
                <div className="flex space-x-3">
                  {galleryImages.map((_, index) => (
                    <button 
                      key={index} 
                      onClick={() => setCurrentImageIndex(index)} 
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/30 hover:bg-white/50'
                      }`} 
                    />
                  ))}
                </div>
                <div className="flex space-x-3">
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