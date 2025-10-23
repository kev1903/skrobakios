import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Building2, Zap, Brain, ChevronRight, Layers, BarChart3, Calendar, Shield, HardHat, Truck, Users, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-slate-50 overflow-hidden relative">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-200/40 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Navigation - Glass morphism */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-white/80 border-b border-slate-200/50 shadow-sm">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/3a1e9978-cc53-4d2e-ae3a-8d5a295a8fdb.png" 
              alt="Skrobaki Logo" 
              className="h-12 object-contain"
            />
          </div>
          <Button 
            onClick={() => onNavigate('auth')} 
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-105"
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 backdrop-blur-xl border border-blue-200 mb-4">
              <HardHat className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-slate-700 font-medium">Built for Construction Professionals</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold text-slate-900 leading-tight tracking-tight">
              Construction Projects
              <br />
              <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
                Done Right
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              From groundbreaking to handover - manage every phase of your construction projects 
              with precision. No delays. No surprises. Just results.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
              <Button 
                onClick={() => onNavigate('auth')} 
                size="lg" 
                className="text-lg px-10 py-7 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-2xl shadow-blue-500/30 transition-all duration-300 hover:scale-105 hover:shadow-blue-600/40"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                onClick={() => onNavigate('auth')} 
                variant="outline" 
                size="lg"
                className="text-lg px-10 py-7 bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-300 hover:border-slate-400 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Watch Demo
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Construction Stats Preview */}
          <div className="relative mt-20 mx-auto max-w-6xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200/30 to-orange-200/30 blur-3xl" />
            <div className="relative bg-white/80 backdrop-blur-2xl border border-slate-200 rounded-3xl p-1 shadow-2xl">
              <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-2xl p-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <StatCard number="500+" label="Active Projects" />
                  <StatCard number="98%" label="On-Time Delivery" />
                  <StatCard number="$2.5B+" label="Projects Managed" />
                  <StatCard number="5,000+" label="Construction Teams" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Construction Project Lifecycle */}
      <section className="py-32 px-6 relative bg-gradient-to-b from-transparent via-blue-50/50 to-transparent">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 backdrop-blur-xl border border-orange-200 mb-6">
              <Building2 className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-slate-700 font-medium">Complete Project Lifecycle</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              Every Phase. Every Detail.
              <br />
              <span className="text-orange-600">Under Control.</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Manage your construction projects from pre-construction planning through closeout 
              with specialized tools for each critical phase
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ModuleCard
              icon={<FileText className="h-8 w-8" />}
              title="Pre-Construction Planning"
              description="Bid management, estimating, contract administration, and procurement planning for construction projects"
              gradient="from-blue-500/20 to-cyan-500/20"
            />
            <ModuleCard
              icon={<Calendar className="h-8 w-8" />}
              title="Construction Scheduling"
              description="Critical path method (CPM) scheduling, resource leveling, and construction phase coordination"
              gradient="from-orange-500/20 to-amber-500/20"
            />
            <ModuleCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="Cost Control & Budgeting"
              description="Track construction costs, change orders, draw requests, and payment applications in real-time"
              gradient="from-green-500/20 to-emerald-500/20"
            />
            <ModuleCard
              icon={<HardHat className="h-8 w-8" />}
              title="Field & Site Management"
              description="Daily reports, site inspections, punch lists, and construction progress tracking from the field"
              gradient="from-purple-500/20 to-pink-500/20"
            />
            <ModuleCard
              icon={<Shield className="h-8 w-8" />}
              title="Safety & Compliance"
              description="OSHA compliance, safety inspections, incident reporting, and construction risk management"
              gradient="from-red-500/20 to-orange-500/20"
            />
            <ModuleCard
              icon={<CheckCircle2 className="h-8 w-8" />}
              title="Quality Assurance / QC"
              description="Construction QA/QC checklists, inspections, RFIs, submittals, and material testing coordination"
              gradient="from-indigo-500/20 to-blue-500/20"
            />
            <ModuleCard
              icon={<Users className="h-8 w-8" />}
              title="Subcontractor Management"
              description="Subcontractor coordination, compliance tracking, performance monitoring, and payment management"
              gradient="from-yellow-500/20 to-orange-500/20"
            />
            <ModuleCard
              icon={<Layers className="h-8 w-8" />}
              title="Document & Drawing Control"
              description="Construction drawings, specifications, submittals, RFIs, and as-built documentation management"
              gradient="from-teal-500/20 to-cyan-500/20"
            />
            <ModuleCard
              icon={<Truck className="h-8 w-8" />}
              title="Equipment & Materials"
              description="Track construction equipment, material deliveries, inventory, and logistics coordination"
              gradient="from-amber-500/20 to-yellow-500/20"
            />
          </div>
        </div>
      </section>

      {/* Construction Challenges Section */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-50/30 to-transparent" />
        <div className="container mx-auto max-w-7xl relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 backdrop-blur-xl border border-red-200 mb-6">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-slate-700 font-medium">Common Construction Challenges</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              Stop Fighting These Problems
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <ChallengeCard
              title="Schedule Delays"
              problem="Weather delays, permit issues, and subcontractor coordination causing projects to fall behind"
              solution="Real-time schedule updates, weather integration, and automated alerts keep everyone aligned"
            />
            <ChallengeCard
              title="Budget Overruns"
              problem="Change orders, material cost fluctuations, and hidden costs eating into profit margins"
              solution="Live cost tracking, change order management, and predictive budget forecasting"
            />
            <ChallengeCard
              title="Safety Incidents"
              problem="OSHA violations, on-site accidents, and compliance documentation gaps creating liability"
              solution="Digital safety checklists, incident tracking, and automated compliance reporting"
            />
            <ChallengeCard
              title="Communication Breakdowns"
              problem="Lost RFIs, unclear drawings, and miscommunication between GC, subs, and owners"
              solution="Centralized communication hub, automated RFI workflows, and version-controlled drawings"
            />
          </div>
        </div>
      </section>

      {/* SkAi Section */}
      <section className="py-32 px-6 relative bg-gradient-to-br from-blue-50 via-purple-50/30 to-pink-50/30">
        <div className="container mx-auto max-w-7xl relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 backdrop-blur-xl border border-purple-200">
                <Brain className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-slate-700 font-medium">AI Assistant</span>
              </div>
              
              <h2 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
                Meet SkAi
                <br />
                <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-orange-600 bg-clip-text text-transparent">
                  Your AI Construction Assistant
                </span>
              </h2>
              
              <p className="text-xl text-slate-600 leading-relaxed">
                SkAi understands construction. Trained on thousands of projects, it predicts delays, 
                identifies risks, and helps you make better decisions on every job site.
              </p>

              <div className="space-y-4">
                <AIFeature 
                  title="Delay Prediction"
                  description="Identify schedule risks before they impact your critical path and milestone dates"
                />
                <AIFeature 
                  title="Cost Intelligence"
                  description="Track budget burn rate and predict overruns based on historical construction data"
                />
                <AIFeature 
                  title="Ask About Your Projects"
                  description="'Which projects are behind schedule?' 'What's the status of the HVAC rough-in?'"
                />
                <AIFeature 
                  title="Safety Risk Detection"
                  description="AI-powered analysis of safety reports to identify patterns and prevent incidents"
                />
              </div>

              <Button 
                onClick={() => onNavigate('auth')} 
                size="lg"
                className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-2xl shadow-purple-500/30 transition-all duration-300 hover:scale-105"
              >
                Try SkAi Now
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-200/40 to-blue-200/40 blur-3xl" />
              <div className="relative bg-white/90 backdrop-blur-2xl border border-slate-200 rounded-3xl p-8 shadow-2xl">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
                    <div className="flex items-start gap-4">
                      <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-3">
                        <Brain className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-500 mb-2 font-medium">SkAi Construction Analysis</p>
                        <p className="text-slate-800 text-sm">
                          "Downtown Tower Project: Structural steel installation is 3 days behind critical path. 
                          Weather delays and crane availability issues detected. Recommend expediting MEP rough-in crew."
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200">
                    <div className="flex items-start gap-4">
                      <div className="bg-gradient-to-br from-orange-600 to-amber-600 rounded-xl p-3">
                        <HardHat className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-500 mb-2 font-medium">Site Risk Alert</p>
                        <p className="text-slate-800 text-sm">
                          "Riverside Apartments: Foundation concrete pour scheduled for tomorrow. 
                          Severe weather expected. Suggest rescheduling to maintain quality standards."
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
          <div className="absolute inset-0 bg-gradient-to-r from-blue-200/40 to-orange-200/40 blur-3xl" />
          <div className="relative bg-white/90 backdrop-blur-2xl border border-slate-200 rounded-3xl p-16 shadow-2xl">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900">
              Build Your Next Project
              <br />
              <span className="text-orange-600">The Right Way</span>
            </h2>
            <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
              Join thousands of general contractors, builders, and construction managers 
              delivering projects on time and under budget with Skrobaki.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => onNavigate('auth')} 
                size="lg"
                className="text-lg px-10 py-7 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-2xl shadow-blue-500/30 transition-all duration-300 hover:scale-105"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                onClick={() => onNavigate('auth')} 
                size="lg"
                className="text-lg px-10 py-7 bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-300 hover:border-slate-400 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-200 bg-white/50 backdrop-blur-xl">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img 
              src="/lovable-uploads/3a1e9978-cc53-4d2e-ae3a-8d5a295a8fdb.png" 
              alt="Skrobaki Logo" 
              className="h-10 object-contain"
            />
          </div>
          <p className="text-slate-500">&copy; 2024 Skrobaki. Empowering construction excellence.</p>
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
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-500`} />
    <div className="relative bg-white/80 backdrop-blur-2xl border border-slate-200 rounded-2xl p-8 hover:border-blue-300 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] h-full">
      <div className="text-blue-600 mb-6 transform group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-slate-900">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  </div>
);

const AIFeature = ({ title, description }: { title: string; description: string }) => (
  <div className="flex items-start gap-4 p-4 rounded-xl bg-white/80 backdrop-blur-xl border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300">
    <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg p-2 mt-1">
      <Sparkles className="h-4 w-4 text-white" />
    </div>
    <div>
      <h4 className="text-slate-900 font-semibold mb-1">{title}</h4>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  </div>
);

const StatCard = ({ number, label }: { number: string; label: string }) => (
  <div className="text-center">
    <div className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">{number}</div>
    <div className="text-sm text-slate-600">{label}</div>
  </div>
);

const ChallengeCard = ({ 
  title, 
  problem, 
  solution 
}: { 
  title: string; 
  problem: string; 
  solution: string;
}) => (
  <div className="bg-white/80 backdrop-blur-2xl border border-slate-200 rounded-2xl p-8 hover:border-orange-300 hover:shadow-xl transition-all duration-300">
    <div className="flex items-start gap-4 mb-6">
      <div className="bg-red-100 rounded-xl p-3">
        <AlertTriangle className="h-6 w-6 text-red-600" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600">{problem}</p>
      </div>
    </div>
    <div className="flex items-start gap-4 pt-6 border-t border-slate-200">
      <div className="bg-green-100 rounded-xl p-3">
        <CheckCircle2 className="h-6 w-6 text-green-600" />
      </div>
      <div>
        <h4 className="text-slate-900 font-semibold mb-2">Skrobaki Solution</h4>
        <p className="text-slate-600">{solution}</p>
      </div>
    </div>
  </div>
);
