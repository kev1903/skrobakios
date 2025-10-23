import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Building2, Zap, Brain, ChevronRight, Layers, BarChart3, Calendar, Shield } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage = ({ onNavigate }: LandingPageProps) => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 20;
      const y = (clientY / innerHeight - 0.5) * 20;
      heroRef.current.style.transform = `translate(${x}px, ${y}px)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 overflow-hidden relative">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Navigation - Glass morphism */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-white/5 border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Building2 className="h-8 w-8 text-blue-400" />
              <div className="absolute inset-0 blur-xl bg-blue-400/50" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">BuildNet</span>
          </div>
          <Button 
            onClick={() => onNavigate('auth')} 
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xl transition-all duration-300 hover:scale-105"
            size="lg"
          >
            Sign In
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center space-y-8 mb-20" ref={heroRef}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 mb-4">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-300">Powered by AI</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold text-white leading-tight tracking-tight">
              Build Smarter
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Deliver Faster
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Enterprise-grade construction management with AI-powered insights. 
              Transform how you plan, execute, and deliver projects.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
              <Button 
                onClick={() => onNavigate('auth')} 
                size="lg" 
                className="text-lg px-10 py-7 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-2xl shadow-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-blue-500/70"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                onClick={() => onNavigate('auth')} 
                variant="outline" 
                size="lg"
                className="text-lg px-10 py-7 bg-white/5 hover:bg-white/10 text-white border border-white/20 backdrop-blur-xl transition-all duration-300 hover:scale-105"
              >
                Watch Demo
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Glass Card Preview */}
          <div className="relative mt-20 mx-auto max-w-6xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl" />
            <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-1 shadow-2xl">
              <div className="bg-gradient-to-br from-slate-900/50 to-blue-900/30 rounded-2xl p-8 min-h-[400px] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Layers className="h-20 w-20 text-blue-400 mx-auto opacity-50" />
                  <p className="text-gray-400">Interactive Dashboard Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Modules Section */}
      <section className="py-32 px-6 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 mb-6">
              <Layers className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-gray-300">Comprehensive Modules</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Complete Project Control
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to manage construction projects from start to finish
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ModuleCard
              icon={<Calendar className="h-8 w-8" />}
              title="Smart Scheduling"
              description="AI-powered Gantt charts with critical path analysis and resource optimization"
              gradient="from-blue-500/20 to-cyan-500/20"
            />
            <ModuleCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="Cost Management"
              description="Real-time budgeting, forecasting, and financial reporting with predictive analytics"
              gradient="from-purple-500/20 to-pink-500/20"
            />
            <ModuleCard
              icon={<Building2 className="h-8 w-8" />}
              title="Site Management"
              description="Multi-site coordination with live updates and progress tracking"
              gradient="from-orange-500/20 to-red-500/20"
            />
            <ModuleCard
              icon={<Shield className="h-8 w-8" />}
              title="Safety & QA/QC"
              description="Comprehensive safety protocols and quality assurance workflows"
              gradient="from-green-500/20 to-emerald-500/20"
            />
            <ModuleCard
              icon={<Layers className="h-8 w-8" />}
              title="Document Control"
              description="Centralized document management with version control and collaboration"
              gradient="from-indigo-500/20 to-blue-500/20"
            />
            <ModuleCard
              icon={<Zap className="h-8 w-8" />}
              title="Workflow Automation"
              description="Automate repetitive tasks and approvals to boost productivity"
              gradient="from-yellow-500/20 to-orange-500/20"
            />
          </div>
        </div>
      </section>

      {/* SkAi Section */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/30 to-transparent" />
        <div className="container mx-auto max-w-7xl relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10">
                <Brain className="h-4 w-4 text-pink-400" />
                <span className="text-sm text-gray-300">AI Assistant</span>
              </div>
              
              <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                Meet SkAi
                <br />
                <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Your AI Project Manager
                </span>
              </h2>
              
              <p className="text-xl text-gray-400 leading-relaxed">
                SkAi is your intelligent construction assistant that learns from your projects, 
                predicts potential issues, and provides actionable insights to keep everything on track.
              </p>

              <div className="space-y-4">
                <AIFeature 
                  title="Predictive Analytics"
                  description="Forecast project delays and cost overruns before they happen"
                />
                <AIFeature 
                  title="Smart Recommendations"
                  description="Get AI-powered suggestions for resource allocation and scheduling"
                />
                <AIFeature 
                  title="Natural Language Queries"
                  description="Ask questions about your projects in plain English"
                />
                <AIFeature 
                  title="Risk Assessment"
                  description="Automated risk identification and mitigation strategies"
                />
              </div>

              <Button 
                onClick={() => onNavigate('auth')} 
                size="lg"
                className="text-lg px-8 py-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 shadow-2xl shadow-pink-500/50 transition-all duration-300 hover:scale-105"
              >
                Try SkAi Now
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 blur-3xl" />
              <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-2xl p-6 border border-white/10">
                    <div className="flex items-start gap-4">
                      <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl p-3">
                        <Brain className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-400 mb-2">SkAi Analysis</p>
                        <p className="text-white text-sm">
                          "Project Alpha is 12% ahead of schedule. I recommend reallocating 
                          resources to Project Beta which shows early signs of delay."
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl p-6 border border-white/10">
                    <div className="flex items-start gap-4">
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-3">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-400 mb-2">Smart Insight</p>
                        <p className="text-white text-sm">
                          "Weather forecast shows rain next week. Consider rescheduling 
                          outdoor concrete work to avoid delays."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative">
        <div className="container mx-auto max-w-4xl text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl" />
          <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              Ready to Transform
              <br />
              Your Construction Process?
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Join leading construction companies using BuildNet to deliver projects 
              faster, smarter, and more profitably.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => onNavigate('auth')} 
                size="lg"
                className="text-lg px-10 py-7 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-2xl shadow-blue-500/50 transition-all duration-300 hover:scale-105"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                onClick={() => onNavigate('auth')} 
                size="lg"
                className="text-lg px-10 py-7 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xl transition-all duration-300 hover:scale-105"
              >
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10 backdrop-blur-xl">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Building2 className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold text-white">BuildNet</span>
          </div>
          <p className="text-gray-500">&copy; 2024 BuildNet. Empowering construction excellence.</p>
        </div>
      </footer>
    </div>
  );
};

const ModuleCard = ({ 
  icon, 
  title, 
  description, 
  gradient 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  gradient: string;
}) => (
  <div className="group relative">
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
    <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] h-full">
      <div className="text-blue-400 mb-6 transform group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-white">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  </div>
);

const AIFeature = ({ title, description }: { title: string; description: string }) => (
  <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300">
    <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg p-2 mt-1">
      <Sparkles className="h-4 w-4 text-white" />
    </div>
    <div>
      <h4 className="text-white font-semibold mb-1">{title}</h4>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  </div>
);
