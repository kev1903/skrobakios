import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowRight, 
  Award,
  Users,
  Building,
  Target,
  Heart,
  Lightbulb,
  CheckCircle,
  Calendar
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

export const AboutPage = ({ onNavigate }: AboutPageProps) => {
  const values = [
    {
      icon: Target,
      title: "Precision",
      description: "Every detail matters. We approach each project with meticulous attention to precision, ensuring excellence in every aspect of design and construction."
    },
    {
      icon: Heart,
      title: "Passion",
      description: "Architecture is our passion. We bring enthusiasm and creative energy to every project, transforming visions into extraordinary built environments."
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We embrace cutting-edge technology and innovative solutions, from BIM modeling to AI-powered project management, staying ahead of industry trends."
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Success comes through partnership. We work closely with clients, consultants, and contractors to achieve shared goals and exceptional outcomes."
    }
  ];

  const team = [
    {
      name: "Alex Skrobaki",
      role: "Founder & Principal Architect",
      description: "With over 25 years of experience in luxury residential architecture, Alex leads our team with a vision for architectural excellence and innovation.",
      expertise: ["Residential Design", "Project Management", "Sustainable Architecture"]
    },
    {
      name: "Sarah Mitchell",
      role: "Senior Project Manager",
      description: "Sarah brings expertise in construction management and quality assurance, ensuring every project meets our exacting standards.",
      expertise: ["Construction Management", "Quality Control", "Client Relations"]
    },
    {
      name: "Michael Chen",
      role: "BIM Technology Director",
      description: "Michael leads our digital innovation initiatives, implementing cutting-edge BIM solutions and AI-powered project tracking systems.",
      expertise: ["BIM Modeling", "Digital Innovation", "Technology Integration"]
    }
  ];

  const milestones = [
    { year: "1998", event: "Founded", description: "Skrobaki established with a vision for architectural excellence" },
    { year: "2005", event: "First Award", description: "Received first industry recognition for residential design" },
    { year: "2015", event: "BIM Integration", description: "Pioneered BIM technology adoption in residential construction" },
    { year: "2020", event: "AI Innovation", description: "Launched AI-powered project management and timeline optimization" },
    { year: "2024", event: "50+ Projects", description: "Celebrated completion of 50+ luxury residential projects" }
  ];

  const certifications = [
    { name: "Registered Builder", icon: Building },
    { name: "BIM Certified", icon: CheckCircle },
    { name: "Award-Winning", icon: Award },
    { name: "Industry Leader", icon: Target }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-background via-background/95 to-card/30">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h1 className="heading-xl text-foreground mb-8 font-playfair">
              About <span className="text-gradient-gold">Skrobaki</span>
            </h1>
            <p className="body-lg text-muted-foreground max-w-3xl mx-auto">
              For over 25 years, Skrobaki has been at the forefront of architectural excellence, transforming visions into extraordinary built environments through sophisticated design philosophy and uncompromising attention to detail.
            </p>
          </div>

          {/* Certifications */}
          <div className="grid md:grid-cols-4 gap-6 mb-20">
            {certifications.map((cert, idx) => (
              <div key={idx} className="glass-card p-6 text-center">
                <cert.icon className="w-8 h-8 text-brand-gold mx-auto mb-4" />
                <p className="text-foreground font-medium">{cert.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <h2 className="heading-lg text-foreground mb-8 font-playfair">
                Our Story
              </h2>
              <div className="space-y-6">
                <p className="body-md text-muted-foreground">
                  Founded in 1998 by Alex Skrobaki, our practice began with a simple yet powerful vision: to create architectural solutions that inspire and endure. What started as a boutique residential practice has evolved into a comprehensive architectural and construction management firm.
                </p>
                <p className="body-md text-muted-foreground">
                  Our journey has been marked by continuous innovation, from early adoption of sustainable design principles to pioneering the integration of BIM technology and AI-powered project management in residential construction.
                </p>
                <p className="body-md text-muted-foreground">
                  Today, we're proud to have completed over 50 luxury residential projects, each one reflecting our commitment to architectural excellence and our clients' unique visions.
                </p>
              </div>
            </div>
            
            <Card className="glass-card border-brand-gold/10 overflow-hidden">
              <CardContent className="p-8">
                <div className="aspect-square bg-gradient-to-br from-brand-gold/10 to-brand-gold/5 rounded-2xl flex items-center justify-center">
                  <Building className="w-24 h-24 text-brand-gold/30" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <div className="mb-20">
            <h3 className="heading-md text-foreground mb-12 text-center font-playfair">
              Our Journey
            </h3>
            <div className="space-y-8">
              {milestones.map((milestone, idx) => (
                <div key={idx} className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-20 text-right">
                    <span className="text-brand-gold font-bold text-lg">{milestone.year}</span>
                  </div>
                  <div className="w-4 h-4 bg-brand-gold rounded-full flex-shrink-0 mt-1"></div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-1">{milestone.event}</h4>
                    <p className="text-muted-foreground text-sm">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="heading-lg text-card-foreground mb-8 font-playfair">
              Our Values
            </h2>
            <p className="body-lg text-muted-foreground max-w-3xl mx-auto">
              These core principles guide every decision we make and every project we undertake.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, idx) => (
              <Card key={idx} className="glass-card border-brand-gold/10 h-full">
                <CardContent className="p-6">
                  <value.icon className="w-12 h-12 text-brand-gold mb-4" />
                  <h3 className="font-medium text-card-foreground mb-3">{value.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="heading-lg text-foreground mb-8 font-playfair">
              Our Team
            </h2>
            <p className="body-lg text-muted-foreground max-w-3xl mx-auto">
              Meet the experienced professionals who bring your architectural visions to life.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, idx) => (
              <Card key={idx} className="glass-card border-brand-gold/10">
                <CardContent className="p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-brand-gold/20 to-brand-gold/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <Users className="w-10 h-10 text-brand-gold" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium text-foreground mb-1">{member.name}</h3>
                    <p className="text-brand-gold text-sm mb-4">{member.role}</p>
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{member.description}</p>
                    <div className="space-y-1">
                      {member.expertise.map((skill, skillIdx) => (
                        <span key={skillIdx} className="inline-block text-xs text-muted-foreground bg-muted px-2 py-1 rounded mr-1">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-card/30">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="heading-lg text-card-foreground mb-8">
            Let's Create Something Extraordinary
          </h2>
          <p className="body-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Ready to work with a team that shares your passion for architectural excellence? Let's discuss your vision and explore how we can bring it to life.
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
              Schedule a Meeting
              <ArrowRight className="w-4 h-4" />
            </button>
            <Button 
              variant="outline" 
              className="button-ghost px-6 py-3 text-sm font-medium tracking-wide rounded-lg h-auto flex items-center gap-2"
              onClick={() => onNavigate('projects')}
            >
              View Our Portfolio
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};