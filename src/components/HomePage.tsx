import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Building2, Users, BarChart3, Map, Briefcase, Calendar } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export const HomePage = ({ onNavigate }: HomePageProps) => {
  const features = [
    {
      icon: Building2,
      title: "Project Management",
      description: "Manage construction projects with advanced tools and real-time tracking.",
      action: () => onNavigate('projects')
    },
    {
      icon: Map,
      title: "3D Dashboard",
      description: "Visualize your projects on an interactive 3D globe with location mapping.",
      action: () => onNavigate('dashboard')
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Coordinate teams, assign tasks, and track progress across all projects.",
      action: () => onNavigate('tasks')
    },
    {
      icon: BarChart3,
      title: "Financial Tracking",
      description: "Monitor budgets, expenses, and financial performance in real-time.",
      action: () => onNavigate('finance')
    },
    {
      icon: Briefcase,
      title: "Sales Pipeline",
      description: "Track leads, manage estimates, and close more deals efficiently.",
      action: () => onNavigate('sales')
    },
    {
      icon: Calendar,
      title: "Schedule Management",
      description: "Plan and track project timelines with advanced scheduling tools.",
      action: () => onNavigate('project-schedule')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:50px_50px] opacity-20" />
      
      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-8 pt-20 pb-16">
        <div className="text-center mb-20">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Project
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              Excellence
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            The ultimate construction project management platform. Streamline workflows, 
            track progress, and deliver projects on time and under budget.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              onClick={() => onNavigate('dashboard')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 px-8 py-6 text-lg font-semibold shadow-2xl shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 hover:scale-105"
            >
              Launch Dashboard
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => onNavigate('projects')}
              className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 px-8 py-6 text-lg font-semibold backdrop-blur-sm transition-all duration-300"
            >
              View Projects
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={index}
                className="group bg-black/20 border-white/10 backdrop-blur-xl hover:bg-black/30 hover:border-white/20 transition-all duration-300 hover:scale-105 cursor-pointer"
                onClick={feature.action}
              >
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center mb-6 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300">
                    <IconComponent className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-300 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">500+</div>
            <div className="text-slate-400">Projects Completed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">50k+</div>
            <div className="text-slate-400">Tasks Managed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">99.9%</div>
            <div className="text-slate-400">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">24/7</div>
            <div className="text-slate-400">Support</div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-blue-500/20 backdrop-blur-xl">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Transform Your Projects?
              </h2>
              <p className="text-slate-300 mb-8 text-lg max-w-2xl mx-auto">
                Join thousands of construction professionals who trust our platform 
                to deliver exceptional results.
              </p>
              <Button 
                size="lg"
                onClick={() => onNavigate('create-project')}
                className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white border-0 px-8 py-6 text-lg font-semibold shadow-2xl shadow-emerald-500/25 transition-all duration-300 hover:shadow-emerald-500/40 hover:scale-105"
              >
                Start Your First Project
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-10 w-20 h-20 bg-blue-500/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute top-3/4 right-20 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-1000" />
      <div className="absolute bottom-1/4 left-1/3 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl animate-pulse delay-500" />
    </div>
  );
};