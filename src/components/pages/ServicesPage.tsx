import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowRight, 
  Building, 
  Ruler, 
  Eye,
  Users,
  Clipboard,
  Settings,
  TrendingUp,
  CheckCircle,
  Star,
  Calendar
} from 'lucide-react';

interface ServicesPageProps {
  onNavigate: (page: string) => void;
}

export const ServicesPage = ({ onNavigate }: ServicesPageProps) => {
  const services = [
    {
      category: "Project Management",
      description: "Complete oversight from concept to completion",
      items: [
        { name: "7-Stage Lifecycle Management", icon: Clipboard, description: "Comprehensive project management from initial concept through final handover, ensuring every phase is executed with precision and attention to detail." },
        { name: "Construction Advisory", icon: Users, description: "Expert guidance and consultation throughout your build journey, providing professional insights and recommendations at every decision point." },
        { name: "Construction Management", icon: Settings, description: "On-site coordination and quality control with dedicated project managers ensuring timelines, budgets, and quality standards are met." }
      ]
    },
    {
      category: "Standalone Services", 
      description: "Individual services tailored to your specific needs",
      items: [
        { name: "Cost Estimating", icon: TrendingUp, description: "Accurate budgeting and comprehensive cost analysis using industry-leading methodologies and current market data for reliable financial planning." },
        { name: "Building Inspections", icon: Eye, description: "Thorough quality and compliance assessments conducted by certified professionals to ensure your project meets all regulatory requirements." },
        { name: "3D Design & Rendering", icon: Building, description: "Advanced visualization services allowing you to see and experience your project before construction begins, reducing costly changes later." }
      ]
    },
    {
      category: "BIM & Digital Services",
      description: "Cutting-edge technology for modern construction",
      items: [
        { name: "BIM Models", icon: Ruler, description: "Advanced building information modeling creating detailed 3D representations with integrated data for improved coordination and efficiency." },
        { name: "Shop Drawings", icon: Clipboard, description: "Detailed construction documentation and technical drawings ensuring precise fabrication and installation of all building components." },
        { name: "AI Timeline & Dashboards", icon: Settings, description: "Smart project tracking and analytics using artificial intelligence to optimize schedules and provide real-time project insights." }
      ]
    }
  ];

  const features = [
    { icon: CheckCircle, title: "Quality Assurance", description: "Rigorous quality control at every stage" },
    { icon: Star, title: "Award-Winning", description: "Recognized excellence in architectural construction" },
    { icon: Users, title: "Expert Team", description: "Skilled professionals with decades of experience" },
    { icon: TrendingUp, title: "Value Engineering", description: "Optimizing cost without compromising quality" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-background via-background/95 to-card/30">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h1 className="heading-xl text-foreground mb-8 font-playfair">
              Our <span className="text-gradient-gold">Services</span>
            </h1>
            <p className="body-lg text-muted-foreground max-w-3xl mx-auto">
              Comprehensive architectural and construction services designed for clients who value precision, quality, and innovative solutions. From initial concept to final handover, we deliver excellence at every stage.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-20">
            {features.map((feature, idx) => (
              <div key={idx} className="glass-card p-6 text-center">
                <feature.icon className="w-8 h-8 text-brand-gold mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Details */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="space-y-20">
            {services.map((category, idx) => (
              <div key={idx} className="grid lg:grid-cols-2 gap-16 items-center">
                <div className={idx % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-12 bg-gradient-to-b from-brand-gold to-brand-gold-light rounded-full"></div>
                    <h2 className="heading-lg text-foreground font-playfair">
                      {category.category}
                    </h2>
                  </div>
                  <p className="body-lg text-muted-foreground mb-8">
                    {category.description}
                  </p>
                  <div className="space-y-6">
                    {category.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-brand-gold/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                          <item.icon className="w-5 h-5 text-brand-gold" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground mb-2">{item.name}</h4>
                          <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className={idx % 2 === 1 ? 'lg:order-1' : ''}>
                  <Card className="glass-card border-brand-gold/10 p-8">
                    <CardContent className="p-0">
                      <div className="aspect-square bg-gradient-to-br from-brand-gold/10 to-brand-gold/5 rounded-2xl flex items-center justify-center">
                        <div className="text-6xl text-brand-gold/20">{idx + 1}</div>
                      </div>
                    </CardContent>
                  </Card>
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
            Ready to Start Your Project?
          </h2>
          <p className="body-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Let's discuss how our comprehensive services can bring your architectural vision to life with exceptional quality and attention to detail.
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
              onClick={() => onNavigate('projects')}
            >
              View Our Work
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};