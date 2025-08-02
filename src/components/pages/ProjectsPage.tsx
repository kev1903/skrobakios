import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Calendar, 
  MapPin,
  Home,
  Building,
  Award,
  Star
} from 'lucide-react';
import heroImage from '@/assets/hero-architecture.jpg';
import modernBuilding from '@/assets/modern-building.jpg';
import whiteBuilding from '@/assets/white-building.jpg';

interface ProjectsPageProps {
  onNavigate: (page: string) => void;
}

export const ProjectsPage = ({ onNavigate }: ProjectsPageProps) => {
  const featuredProjects = [
    {
      title: "Modern Family Estate",
      location: "Toorak, VIC",
      image: modernBuilding,
      description: "Luxury 5-bedroom home with sustainable design principles and smart home integration",
      category: "Residential",
      year: "2024",
      area: "450 sqm",
      features: ["Sustainable Design", "Smart Home", "Pool & Landscaping"]
    },
    {
      title: "Contemporary Retreat",
      location: "Brighton, VIC", 
      image: whiteBuilding,
      description: "Minimalist design with premium finishes and seamless indoor-outdoor living",
      category: "Residential",
      year: "2023",
      area: "320 sqm",
      features: ["Minimalist Design", "Premium Finishes", "Open Plan"]
    },
    {
      title: "Architectural Masterpiece",
      location: "South Yarra, VIC",
      image: heroImage,
      description: "Award-winning design with innovative structural solutions and luxury amenities",
      category: "Luxury Residential",
      year: "2023",
      area: "680 sqm",
      features: ["Award Winning", "Innovative Structure", "Luxury Amenities"]
    }
  ];

  const projectCategories = [
    { name: "Luxury Residential", count: 12, icon: Home },
    { name: "Commercial", count: 8, icon: Building },
    { name: "Renovations", count: 15, icon: Award },
    { name: "Sustainable", count: 10, icon: Star }
  ];

  const achievements = [
    { number: "50+", label: "Projects Completed", icon: Building },
    { number: "15+", label: "Awards Won", icon: Award },
    { number: "100%", label: "Client Satisfaction", icon: Star },
    { number: "25+", label: "Years Experience", icon: Home }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-background via-background/95 to-card/30">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h1 className="heading-xl text-foreground mb-8 font-playfair">
              Our <span className="text-gradient-gold">Projects</span>
            </h1>
            <p className="body-lg text-muted-foreground max-w-3xl mx-auto">
              A curated portfolio showcasing our commitment to architectural excellence and innovative design solutions. Each project represents our dedication to quality, sustainability, and client satisfaction.
            </p>
          </div>

          {/* Achievements */}
          <div className="grid md:grid-cols-4 gap-6 mb-20">
            {achievements.map((achievement, idx) => (
              <div key={idx} className="glass-card p-6 text-center">
                <achievement.icon className="w-8 h-8 text-brand-gold mx-auto mb-4" />
                <div className="text-3xl font-bold text-foreground mb-2">{achievement.number}</div>
                <p className="text-muted-foreground text-sm">{achievement.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Categories */}
      <section className="py-16 bg-card/30">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="heading-lg text-card-foreground mb-12 text-center">
            Project Categories
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {projectCategories.map((category, idx) => (
              <Card key={idx} className="glass-card border-brand-gold/10 hover:border-brand-gold/20 transition-all duration-300 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <category.icon className="w-12 h-12 text-brand-gold mx-auto mb-4" />
                  <h3 className="font-medium text-card-foreground mb-2">{category.name}</h3>
                  <p className="text-muted-foreground text-sm">{category.count} Projects</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-16">
            <h2 className="heading-lg text-foreground mb-8 text-center">
              Featured Projects
            </h2>
          </div>

          <div className="space-y-20">
            {featuredProjects.map((project, idx) => (
              <div key={idx} className={`grid lg:grid-cols-2 gap-16 items-center ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                <div className={idx % 2 === 1 ? 'lg:order-2' : ''}>
                  <Card className="glass-card border-brand-gold/10 overflow-hidden">
                    <div className="relative h-96 overflow-hidden">
                      <img 
                        src={project.image} 
                        alt={project.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-brand-gold text-brand-charcoal">
                          {project.category}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </div>
                
                <div className={idx % 2 === 1 ? 'lg:order-1' : ''}>
                  <div className="space-y-6">
                    <div>
                      <h3 className="heading-md text-foreground mb-3 font-playfair">
                        {project.title}
                      </h3>
                      <div className="flex items-center gap-2 text-muted-foreground mb-4">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{project.location}</span>
                        <span className="text-sm">•</span>
                        <span className="text-sm">{project.year}</span>
                        <span className="text-sm">•</span>
                        <span className="text-sm">{project.area}</span>
                      </div>
                      <p className="body-md text-muted-foreground mb-6">
                        {project.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-foreground mb-3">Key Features</h4>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.features.map((feature, featureIdx) => (
                          <Badge key={featureIdx} variant="outline" className="border-brand-gold/30 text-brand-gold">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <button 
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium tracking-wide rounded-lg h-auto text-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                      style={{ 
                        backgroundColor: 'rgb(54,119,159)',
                        boxShadow: '0 4px 15px rgba(54, 119, 159, 0.2)',
                        border: 'none'
                      }}
                    >
                      View Project Details
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-card/30">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="heading-lg text-card-foreground mb-8">
            Start Your Next Project
          </h2>
          <p className="body-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Ready to create something extraordinary? Let's discuss your vision and bring it to life with the same attention to detail and quality you see in our portfolio.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium tracking-wide rounded-lg h-auto text-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              style={{ 
                backgroundColor: 'rgb(54,119,159)',
                boxShadow: '0 4px 15px rgba(54, 119, 159, 0.2)',
                border: 'none'
              }}
              onClick={() => onNavigate('contact')}
            >
              <Calendar className="w-4 h-4" />
              Book Consultation
              <ArrowRight className="w-4 h-4" />
            </button>
            <Button 
              variant="outline" 
              className="button-ghost px-6 py-3 text-sm font-medium tracking-wide rounded-lg h-auto flex items-center gap-2"
              onClick={() => onNavigate('services')}
            >
              View Our Services
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};