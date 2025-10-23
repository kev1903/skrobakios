import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Building2, Brain, ChevronRight, Layers, BarChart3, Calendar, Shield, HardHat, Truck, Users, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage = ({ onNavigate }: LandingPageProps) => {
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('.fade-in-section');
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) {
          section.classList.add('is-visible');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden relative">
      <style>{`
        .fade-in-section {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .fade-in-section.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .hover-lift {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-lift:hover {
          transform: translateY(-4px);
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/3a1e9978-cc53-4d2e-ae3a-8d5a295a8fdb.png" 
              alt="Skrobaki Logo" 
              className="h-10 object-contain"
            />
          </div>
          <Button 
            onClick={() => onNavigate('auth')} 
            className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl px-6"
          >
            Sign In
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6 mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 mb-4">
              <HardHat className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-slate-700 font-medium">Built for Construction Professionals</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight">
              Construction Projects
              <br />
              <span className="text-orange-600">Done Right</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
              From groundbreaking to handover - manage every phase of your construction projects 
              with precision. No delays. No surprises. Just results.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
              <Button 
                onClick={() => onNavigate('auth')} 
                className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl px-8 py-6 text-base font-medium"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                onClick={() => onNavigate('auth')} 
                variant="outline"
                className="bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 hover:border-slate-300 transition-all duration-200 rounded-xl px-8 py-6 text-base font-medium"
              >
                Watch Demo
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Construction Stats */}
          <div className="relative mt-20 mx-auto max-w-6xl fade-in-section">
            <div className="bg-white rounded-3xl p-1 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.05)]">
              <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-[22px] py-12 px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
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
      <section className="py-24 px-6 relative fade-in-section">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-slate-700 font-medium">Complete Project Lifecycle</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Every Phase. Every Detail.
              <br />
              <span className="text-blue-600">Under Control.</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Manage your construction projects from pre-construction planning through closeout 
              with specialized tools for each critical phase
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ModuleCard
              icon={<FileText className="h-7 w-7" />}
              title="Pre-Construction Planning"
              description="Bid management, estimating, contract administration, and procurement planning for construction projects"
              gradient="from-blue-500/20 to-cyan-500/20"
            />
            <ModuleCard
              icon={<Calendar className="h-7 w-7" />}
              title="Construction Scheduling"
              description="Critical path method (CPM) scheduling, resource leveling, and construction phase coordination"
              gradient="from-orange-500/20 to-amber-500/20"
            />
            <ModuleCard
              icon={<BarChart3 className="h-7 w-7" />}
              title="Cost Control & Budgeting"
              description="Track construction costs, change orders, draw requests, and payment applications in real-time"
              gradient="from-green-500/20 to-emerald-500/20"
            />
            <ModuleCard
              icon={<HardHat className="h-7 w-7" />}
              title="Field & Site Management"
              description="Daily reports, site inspections, punch lists, and construction progress tracking from the field"
              gradient="from-purple-500/20 to-pink-500/20"
            />
            <ModuleCard
              icon={<Shield className="h-7 w-7" />}
              title="Safety & Compliance"
              description="OSHA compliance, safety inspections, incident reporting, and construction risk management"
              gradient="from-red-500/20 to-orange-500/20"
            />
            <ModuleCard
              icon={<CheckCircle2 className="h-7 w-7" />}
              title="Quality Assurance / QC"
              description="Construction QA/QC checklists, inspections, RFIs, submittals, and material testing coordination"
              gradient="from-indigo-500/20 to-blue-500/20"
            />
            <ModuleCard
              icon={<Users className="h-7 w-7" />}
              title="Subcontractor Management"
              description="Subcontractor coordination, compliance tracking, performance monitoring, and payment management"
              gradient="from-yellow-500/20 to-orange-500/20"
            />
            <ModuleCard
              icon={<Layers className="h-7 w-7" />}
              title="Document & Drawing Control"
              description="Construction drawings, specifications, submittals, RFIs, and as-built documentation management"
              gradient="from-teal-500/20 to-cyan-500/20"
            />
            <ModuleCard
              icon={<Truck className="h-7 w-7" />}
              title="Equipment & Materials"
              description="Track construction equipment, material deliveries, inventory, and logistics coordination"
              gradient="from-amber-500/20 to-yellow-500/20"
            />
          </div>
        </div>
      </section>

      {/* Construction Challenges Section */}
      <section className="py-20 px-6 relative fade-in-section">
        <div className="container mx-auto max-w-6xl relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100 mb-4">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-slate-700 font-medium">Common Construction Challenges</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
              Stop Fighting These Problems
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
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
      <section className="py-24 px-6 relative bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/30 fade-in-section">
        <div className="container mx-auto max-w-6xl relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100">
                <Brain className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-slate-700 font-medium">AI Assistant</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                Meet SkAi
                <br />
                <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-orange-600 bg-clip-text text-transparent">
                  Your AI Construction Assistant
                </span>
              </h2>
              
              <p className="text-lg text-slate-600 leading-relaxed">
                SkAi understands construction. Trained on thousands of projects, it predicts delays, 
                identifies risks, and helps you make better decisions on every job site.
              </p>

              <div className="space-y-3">
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
                className="bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl px-6 py-5 text-base font-medium mt-6"
              >
                Try SkAi Now
                <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="relative">
              <div className="bg-white rounded-3xl p-1 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.05)]">
                <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-[22px] p-6">
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-5 border border-purple-100">
                      <div className="flex items-start gap-3">
                        <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg p-2.5">
                          <Brain className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 mb-1.5 font-medium">SkAi Construction Analysis</p>
                          <p className="text-slate-800 text-sm leading-relaxed">
                            "Downtown Tower Project: Structural steel installation is 3 days behind critical path. 
                            Weather delays and crane availability issues detected. Recommend expediting MEP rough-in crew."
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-100">
                      <div className="flex items-start gap-3">
                        <div className="bg-gradient-to-br from-orange-600 to-amber-600 rounded-lg p-2.5">
                          <HardHat className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 mb-1.5 font-medium">Site Risk Alert</p>
                          <p className="text-slate-800 text-sm leading-relaxed">
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative fade-in-section">
        <div className="container mx-auto max-w-5xl text-center relative">
          <div className="bg-white rounded-3xl p-1 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.05)]">
            <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-[22px] py-16 px-8">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 leading-tight">
                Build Your Next Project
                <br />
                <span className="text-orange-600">The Right Way</span>
              </h2>
              <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
                Join thousands of general contractors, builders, and construction managers 
                delivering projects on time and under budget with Skrobaki.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => onNavigate('auth')}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl px-8 py-6 text-base font-medium"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  onClick={() => onNavigate('auth')}
                  variant="outline"
                  className="bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 hover:border-slate-300 transition-all duration-200 rounded-xl px-8 py-6 text-base font-medium"
                >
                  Schedule Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-100 bg-white">
        <div className="container mx-auto text-center max-w-6xl">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img 
              src="/lovable-uploads/3a1e9978-cc53-4d2e-ae3a-8d5a295a8fdb.png" 
              alt="Skrobaki Logo" 
              className="h-8 object-contain"
            />
          </div>
          <p className="text-sm text-slate-500">&copy; 2024 Skrobaki. Empowering construction excellence.</p>
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
  <div className="group relative hover-lift">
    <div className="relative bg-white border border-slate-100 rounded-2xl p-7 hover:border-slate-200 hover:shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.05)] transition-all duration-300 h-full">
      <div className="text-slate-700 mb-5 bg-slate-50 rounded-xl p-3 inline-flex group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-3 text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    </div>
  </div>
);

const AIFeature = ({ title, description }: { title: string; description: string }) => (
  <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-100 hover:border-purple-200 hover:shadow-sm transition-all duration-200">
    <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg p-2 mt-0.5">
      <Sparkles className="h-3.5 w-3.5 text-white" />
    </div>
    <div>
      <h4 className="text-slate-900 font-semibold mb-1 text-sm">{title}</h4>
      <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
    </div>
  </div>
);

const StatCard = ({ number, label }: { number: string; label: string }) => (
  <div className="text-center">
    <div className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">{number}</div>
    <div className="text-sm text-slate-600 font-medium">{label}</div>
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
  <div className="bg-white border border-slate-100 rounded-2xl p-7 hover:border-slate-200 hover:shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.05)] transition-all duration-300 hover-lift">
    <div className="flex items-start gap-3 mb-6">
      <div className="bg-red-50 rounded-xl p-3">
        <AlertTriangle className="h-5 w-5 text-red-600" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{problem}</p>
      </div>
    </div>
    <div className="flex items-start gap-3 pt-6 border-t border-slate-100">
      <div className="bg-green-50 rounded-xl p-3">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
      </div>
      <div>
        <h4 className="text-slate-900 font-semibold mb-2 text-sm">Skrobaki Solution</h4>
        <p className="text-sm text-slate-600 leading-relaxed">{solution}</p>
      </div>
    </div>
  </div>
);
