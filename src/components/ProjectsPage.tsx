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
  const [selectedProject, setSelectedProject] = useState('thanet-street');

  const featuredProjects = [
    { id: 'thanet-street', name: 'Thanet Street', location: 'Malvern', type: 'Residential' },
    { id: 'st-john-ave', name: 'St John Ave', location: 'Melbourne', type: 'Commercial' },
    { id: 'gordon-street', name: 'Gordon Street', location: 'Richmond', type: 'Mixed Use' }
  ];

  const servicePackages = [
    { id: "01", title: "Advisory", category: "SERVICE PACKAGE" },
    { id: "02", title: "Project Management", category: "SERVICE PACKAGE" },
    { id: "03", title: "Construction Management", category: "SERVICE PACKAGE" }
  ];

  const standAloneServices = [
    { id: "04", title: "Estimating Services", category: "STAND-ALONE SERVICES" },
    { id: "05", title: "Site Inspection Services", category: "STAND-ALONE SERVICES" },
    { id: "06", title: "Design & Visualisation", category: "STAND-ALONE SERVICES" },
    { id: "07", title: "BIM Services", category: "STAND-ALONE SERVICES" },
    { id: "08", title: "Digital Delivery & Analytics", category: "STAND-ALONE SERVICES" }
  ];

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
                Feature Projects
              </h1>
              <p className="text-white/60 text-sm tracking-wide">
                Our Latest Work
              </p>
            </div>

            {/* Service Package */}
            <div className="space-y-6 flex-1 overflow-y-auto">
              <div>
                <h3 className="text-white/80 text-xs font-medium tracking-widest uppercase mb-4">
                  Service Package
                </h3>
                <div className="space-y-2">
                  {servicePackages.map((service) => (
                    <button
                      key={service.id}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/15 transition-all duration-200 cursor-pointer border border-white/10 text-left"
                    >
                      <span className="text-white/60 text-sm font-mono">{service.id}</span>
                      <span className="text-white text-sm font-medium tracking-wide">{service.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-white/80 text-xs font-medium tracking-widest uppercase mb-4">
                  Stand-Alone Services
                </h3>
                <div className="space-y-2">
                  {standAloneServices.map((service) => (
                    <button
                      key={service.id}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/15 transition-all duration-200 cursor-pointer border border-white/10 text-left"
                    >
                      <span className="text-white/60 text-sm font-mono">{service.id}</span>
                      <span className="text-white text-sm font-medium tracking-wide">{service.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area - Feature Projects */}
        <div className="flex-1 p-8">
          <div 
            className="backdrop-blur-xl border border-white/20 h-full flex flex-col shadow-2xl"
            style={{ backgroundColor: 'rgba(0,10,20,0.85)' }}
          >
            {/* Feature Projects Header */}
            <div className="p-8 border-b border-white/10">
              <h1 className="text-white text-4xl lg:text-5xl font-light tracking-tight mb-4">
                Feature Projects
              </h1>
              <p className="text-white/80 text-lg">
                Explore our portfolio of exceptional architectural projects
              </p>
            </div>
            
            {/* Projects List */}
            <div className="flex-1 p-8">
              <div className="space-y-4">
                {featuredProjects.map((project, index) => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProject(project.id)}
                    className={`w-full p-6 rounded-xl border transition-all duration-300 text-left ${
                      selectedProject === project.id
                        ? 'bg-white/20 border-white/30 shadow-lg'
                        : 'bg-white/10 border-white/20 hover:bg-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-4 mb-2">
                          <span className="text-white/60 text-sm font-mono">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <h3 className="text-white text-xl font-medium tracking-wide">
                            {project.name}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-white/70 text-sm">{project.location}</span>
                          <span className="text-white/50 text-sm">•</span>
                          <span className="text-white/70 text-sm">{project.type}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/60" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="p-8 border-t border-white/10">
              <div className="flex space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white/80 hover:text-white hover:bg-white/10 border border-white/20"
                >
                  View All Projects
                </Button>
                <Button 
                  size="sm" 
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Portfolio
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};