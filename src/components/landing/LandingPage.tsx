import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Building2, Users, Calendar, ClipboardList } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage = ({ onNavigate }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">BuildNet</span>
          </div>
          <Button onClick={() => onNavigate('auth')} variant="default" size="lg">
            Sign In
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6 mb-16">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
              Construction Project
              <br />
              <span className="text-primary">Management Made Simple</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Streamline your construction projects with powerful tools for planning, 
              tracking, and collaboration. Built for modern construction teams.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Button 
                onClick={() => onNavigate('auth')} 
                size="lg" 
                className="text-lg px-8 py-6"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                onClick={() => onNavigate('auth')} 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-6"
              >
                Sign In
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            <FeatureCard
              icon={<ClipboardList className="h-8 w-8" />}
              title="Project Management"
              description="Organize and track all your construction projects in one place"
            />
            <FeatureCard
              icon={<Calendar className="h-8 w-8" />}
              title="Smart Scheduling"
              description="Plan and visualize project timelines with Gantt charts"
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Team Collaboration"
              description="Keep your team aligned with real-time updates and communication"
            />
            <FeatureCard
              icon={<Building2 className="h-8 w-8" />}
              title="Multi-Site Management"
              description="Manage multiple construction sites from a single dashboard"
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-card/50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-12 text-foreground">
            Why Choose BuildNet?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <BenefitItem text="Real-time project tracking and updates" />
            <BenefitItem text="Powerful scheduling and timeline management" />
            <BenefitItem text="Secure document storage and sharing" />
            <BenefitItem text="Mobile-friendly for on-site access" />
            <BenefitItem text="Team collaboration tools" />
            <BenefitItem text="Comprehensive reporting and analytics" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6 text-foreground">
            Ready to Transform Your Construction Management?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of construction professionals who trust BuildNet
          </p>
          <Button 
            onClick={() => onNavigate('auth')} 
            size="lg"
            className="text-lg px-8 py-6"
          >
            Start Your Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 BuildNet. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all hover:shadow-lg">
    <div className="text-primary mb-4">{icon}</div>
    <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

const BenefitItem = ({ text }: { text: string }) => (
  <div className="flex items-start gap-3">
    <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
    <p className="text-muted-foreground">{text}</p>
  </div>
);
