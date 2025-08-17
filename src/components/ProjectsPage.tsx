import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight, Home, User, Mail, FolderOpen } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
interface ProjectsPageProps {
  onNavigate: (page: string) => void;
}
export const ProjectsPage = ({
  onNavigate
}: ProjectsPageProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Sample gallery images - replace with actual project images
  const galleryImages = ['/lovable-uploads/adb381c0-ea77-44b9-9eed-b0885c7f134f.png', '/lovable-uploads/adb381c0-ea77-44b9-9eed-b0885c7f134f.png',
  // You can add more images here
  '/lovable-uploads/adb381c0-ea77-44b9-9eed-b0885c7f134f.png'];
  const sidebarItems = [{
    title: "Overview",
    icon: Home,
    id: "overview"
  }, {
    title: "Gallery",
    icon: FolderOpen,
    id: "gallery"
  }, {
    title: "Details",
    icon: User,
    id: "details"
  }, {
    title: "Contact",
    icon: Mail,
    id: "contact"
  }];
  const nextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % galleryImages.length);
  };
  const prevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + galleryImages.length) % galleryImages.length);
  };
  return <SidebarProvider>
      <div className="min-h-screen w-full flex">
        {/* Sidebar */}
        <Sidebar className="w-64">
          <div className="p-4 border-b">
            <button onClick={() => onNavigate('landing')} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">BACK</span>
            </button>
            <h2 className="text-lg font-semibold text-gray-900">Thanet Street, Malvern</h2>
            <p className="text-sm text-gray-600">Residential Architecture</p>
          </div>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map(item => <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>)}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <SidebarGroup>
              <SidebarGroupLabel>Project Info</SidebarGroupLabel>
              
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Project Details Section */}
          <div className="flex-1 p-8">
            <div className="max-w-4xl">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl lg:text-6xl font-light text-gray-900 mb-4 tracking-tight">
                  Thanet Street, Malvern
                </h1>
                <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
                  A contemporary residential project featuring modern architectural elements with sustainable design principles. 
                  This elegant home seamlessly blends indoor and outdoor living spaces.
                </p>
              </div>

              {/* Project Description */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-medium text-gray-900 mb-4">Project Overview</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Canada-based studio Bourgeois/Lechasseur Architectes has designed an elegant new modern mountain home 
                    adjacent to an existing lakeside chalet in Northern Quebec, at the edge of a ski resort. The design 
                    emphasizes natural materials and sustainable construction methods.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-medium text-gray-900 mb-4">Design Features</h2>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Contemporary facade with natural stone cladding</li>
                    <li>• Large format windows maximizing natural light</li>
                    <li>• Sustainable materials and energy-efficient systems</li>
                    <li>• Integrated landscape design</li>
                    <li>• Private outdoor spaces and courtyards</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-medium text-gray-900 mb-4">Awards & Recognition</h2>
                  <p className="text-gray-600">
                    This project has been featured in Architectural Digest and received the 2023 Australian Institute 
                    of Architects Award for Residential Architecture.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Section */}
          <div className="w-1/3 min-w-[400px] bg-gray-50 flex flex-col">
            <div className="p-6 border-b bg-white">
              <h3 className="text-lg font-semibold text-gray-900">Project Gallery</h3>
              <p className="text-sm text-gray-600">
                {currentImageIndex + 1} of {galleryImages.length}
              </p>
            </div>
            
            <div className="flex-1 relative">
              {/* Gallery Image */}
              <div className="relative h-full">
                <img src={galleryImages[currentImageIndex]} alt={`Project image ${currentImageIndex + 1}`} className="w-full h-full object-cover" />
                
                {/* Navigation Arrows */}
                <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-105">
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                
                <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-105">
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
                
                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {galleryImages.map((_, index) => <button key={index} onClick={() => setCurrentImageIndex(index)} className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`} />)}
                </div>
              </div>
            </div>
            
            {/* Gallery Controls */}
            <div className="p-4 bg-white border-t">
              <div className="flex justify-between items-center">
                <Button variant="outline" size="sm">
                  View All Images
                </Button>
                <Button size="sm">
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>;
};