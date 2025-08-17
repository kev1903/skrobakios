import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ProjectsPageProps {
  onNavigate: (page: string) => void;
}

export const ProjectsPage = ({ onNavigate }: ProjectsPageProps) => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div className="relative h-screen bg-cover bg-center" style={{
        backgroundImage: 'url(/lovable-uploads/adb381c0-ea77-44b9-9eed-b0885c7f134f.png)'
      }}>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Navigation */}
        <header className="relative z-10 flex items-center justify-between p-8 lg:p-12">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <button 
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-2 text-white hover:text-white/80 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium tracking-wide">BACK</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-12">
            <button className="text-white/90 hover:text-white text-sm font-medium tracking-wide transition-colors border-b border-white/60 pb-1">
              PROJECTS
            </button>
            <button className="text-white/90 hover:text-white text-sm font-medium tracking-wide transition-colors" onClick={() => onNavigate('about')}>
              ABOUT
            </button>
            <button className="text-white/90 hover:text-white text-sm font-medium tracking-wide transition-colors" onClick={() => onNavigate('contact')}>
              CONTACT
            </button>
          </nav>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 flex items-center h-full px-8 lg:px-12">
          <div className="max-w-4xl">
            {/* Project Title */}
            <h1 className="text-6xl lg:text-8xl font-light text-white mb-8 tracking-tight">
              Thanet Street, Malvern
            </h1>
            
            {/* Project Description */}
            <div className="max-w-md space-y-6">
              <p className="text-white/90 text-sm leading-relaxed">
                Canada-based studio Bourgeois/Lechasseur Architectes has designed an elegant new modern mountain home adjacent to an existing lakeside chalet in Northern Quebec, at the edge of a ski resort.
              </p>
              
              <div className="space-y-2">
                <p className="text-white/70 text-xs uppercase tracking-widest">
                  Project Type
                </p>
                <p className="text-white/90 text-sm">
                  Residential Architecture
                </p>
              </div>
              
              <Button 
                variant="outline" 
                className="text-white border-white/60 hover:bg-white/10 backdrop-blur-sm"
              >
                Learn more
              </Button>
            </div>
          </div>
        </div>

        {/* Social Media Icons */}
        <div className="absolute right-8 lg:right-12 top-1/2 transform -translate-y-1/2 space-y-6">
          <div className="w-8 h-8 border border-white/30 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white/60 rounded-full" />
          </div>
          <div className="w-8 h-8 border border-white/30 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white/60 rounded-full" />
          </div>
          <div className="w-8 h-8 border border-white/30 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white/60 rounded-full" />
          </div>
        </div>

        {/* Photography Credit */}
        <div className="absolute bottom-8 right-8 lg:right-12 text-white/60 text-xs">
          <p>Photography by</p>
          <p>Adrien Williams</p>
        </div>
      </div>

      {/* Projects Grid Section */}
      <section className="py-16 lg:py-24 px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-light text-gray-900 mb-16 text-center">
            Featured Projects
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Project Card 1 */}
            <div className="group cursor-pointer">
              <div className="aspect-[4/3] bg-gray-300 rounded-lg overflow-hidden mb-4">
                <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 group-hover:scale-105 transition-transform duration-500"></div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Modern Residence</h3>
              <p className="text-gray-600 text-sm">Residential • 2023</p>
            </div>
            
            {/* Project Card 2 */}
            <div className="group cursor-pointer">
              <div className="aspect-[4/3] bg-gray-300 rounded-lg overflow-hidden mb-4">
                <div className="w-full h-full bg-gradient-to-br from-gray-500 to-gray-700 group-hover:scale-105 transition-transform duration-500"></div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Commercial Complex</h3>
              <p className="text-gray-600 text-sm">Commercial • 2023</p>
            </div>
            
            {/* Project Card 3 */}
            <div className="group cursor-pointer">
              <div className="aspect-[4/3] bg-gray-300 rounded-lg overflow-hidden mb-4">
                <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-800 group-hover:scale-105 transition-transform duration-500"></div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Urban Development</h3>
              <p className="text-gray-600 text-sm">Mixed Use • 2022</p>
            </div>
            
            {/* Project Card 4 */}
            <div className="group cursor-pointer">
              <div className="aspect-[4/3] bg-gray-300 rounded-lg overflow-hidden mb-4">
                <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-400 group-hover:scale-105 transition-transform duration-500"></div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Cultural Center</h3>
              <p className="text-gray-600 text-sm">Institutional • 2022</p>
            </div>
            
            {/* Project Card 5 */}
            <div className="group cursor-pointer">
              <div className="aspect-[4/3] bg-gray-300 rounded-lg overflow-hidden mb-4">
                <div className="w-full h-full bg-gradient-to-br from-gray-500 to-gray-600 group-hover:scale-105 transition-transform duration-500"></div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Sustainable Housing</h3>
              <p className="text-gray-600 text-sm">Residential • 2021</p>
            </div>
            
            {/* Project Card 6 */}
            <div className="group cursor-pointer">
              <div className="aspect-[4/3] bg-gray-300 rounded-lg overflow-hidden mb-4">
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-500 group-hover:scale-105 transition-transform duration-500"></div>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Industrial Renovation</h3>
              <p className="text-gray-600 text-sm">Industrial • 2021</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};