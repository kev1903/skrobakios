import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Users, Clock, BarChart3, Shield, Zap, Globe } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage = ({ onNavigate }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.15)_1px,transparent_0)] bg-[length:24px_24px] pointer-events-none" />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center p-6 md:p-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-white">SkrobakiOS</h1>
          </div>
          
          <div className="flex space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => onNavigate('auth')}
              className="text-white hover:bg-white/10"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => onNavigate('auth')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Get Started
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="text-center py-20 px-6 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Project Management
              <span className="block text-primary">Reimagined</span>
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Transform your construction and engineering projects with intelligent automation, 
              real-time collaboration, and powerful analytics. Built for modern teams.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => onNavigate('auth')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-lg"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => onNavigate('platform')}
                className="border-white/20 text-white hover:bg-white/10 px-8 py-3 text-lg"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 md:px-8">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold text-white text-center mb-12">
              Everything you need to deliver projects on time
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Team Collaboration</h4>
                <p className="text-slate-300">
                  Real-time collaboration tools that keep your entire team synchronized and productive.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Time Tracking</h4>
                <p className="text-slate-300">
                  Automated time tracking and resource management to optimize project efficiency.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Advanced Analytics</h4>
                <p className="text-slate-300">
                  Powerful insights and reporting to make data-driven decisions for your projects.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Enterprise Security</h4>
                <p className="text-slate-300">
                  Bank-level security with role-based access control and data encryption.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Automation</h4>
                <p className="text-slate-300">
                  Intelligent automation that reduces manual work and eliminates human error.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Global Access</h4>
                <p className="text-slate-300">
                  Access your projects from anywhere with our cloud-based platform.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-6 md:px-8 bg-white/5 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-white mb-6">
                  Why teams choose SkrobakiOS
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Reduce project delays by 40%</h4>
                      <p className="text-slate-300">Better planning and real-time tracking prevent bottlenecks</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Save 20+ hours per week</h4>
                      <p className="text-slate-300">Automated reporting and streamlined workflows</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Improve team productivity</h4>
                      <p className="text-slate-300">Clear communication and task management tools</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">Scale with confidence</h4>
                      <p className="text-slate-300">Enterprise-grade infrastructure that grows with you</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 rounded-2xl p-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">95%</div>
                  <div className="text-primary font-semibold mb-4">Customer Satisfaction</div>
                  <div className="text-slate-300 text-sm mb-6">
                    "SkrobakiOS transformed how we manage our construction projects. 
                    The visibility and control we have now is incredible."
                  </div>
                  <div className="text-white font-medium">— Sarah Chen, Project Director</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 md:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to transform your projects?
            </h3>
            <p className="text-xl text-slate-300 mb-8">
              Join thousands of teams already using SkrobakiOS to deliver projects faster and more efficiently.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => onNavigate('auth')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-lg"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => onNavigate('platform')}
                className="border-white/20 text-white hover:bg-white/10 px-8 py-3 text-lg"
              >
                Contact Sales
              </Button>
            </div>
            
            <p className="text-sm text-slate-400 mt-4">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-8 px-6 md:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Globe className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-white font-semibold">SkrobakiOS</span>
            </div>
            <p className="text-slate-400 text-sm">
              © 2024 SkrobakiOS. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};