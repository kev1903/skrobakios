import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle, Users, Clock, BarChart3, Shield, Zap, Globe, Bot, Calendar, Target, TrendingUp, Building2, FileText, MessageCircle, Settings, Play, ChevronRight, Workflow, PieChart, Smartphone, Briefcase, Layers, Activity, Star, Award, Rocket, UserCheck, Building, Factory, Hammer, Code, Lightbulb, HeartHandshake, ExternalLink } from 'lucide-react';
import { SignupForm } from './SignupForm';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage = ({
  onNavigate
}: LandingPageProps) => {
  const [showSignupForm, setShowSignupForm] = useState(false);

  if (showSignupForm) {
    return (
      <SignupForm 
        onNavigate={onNavigate}
        onBack={() => setShowSignupForm(false)}
      />
    );
  }
  return <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex justify-between items-center p-6 md:p-8 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">SkrobakiOS</h1>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <div className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 cursor-pointer">
            <span>Product</span>
            <ChevronRight className="w-4 h-4" />
          </div>
          <div className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 cursor-pointer">
            <span>Solutions</span>
            <ChevronRight className="w-4 h-4" />
          </div>
          <span className="text-gray-700 hover:text-gray-900 cursor-pointer">Resources</span>
          <span className="text-gray-700 hover:text-gray-900 cursor-pointer">Pricing</span>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Button onClick={() => onNavigate('auth')} className="bg-purple-700 text-white hover:bg-purple-800">
            Log in
          </Button>
          <Button onClick={() => setShowSignupForm(true)} className="bg-purple-700 text-white hover:bg-purple-800">
            Sign Up
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center py-16 px-6 md:px-8 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-6">
            <Rocket className="w-4 h-4 mr-2" />
            Now supporting all business types - from freelancers to enterprises
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Your complete business
            <span className="block text-purple-700">management platform</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Whether you're a freelancer, small business, agency, or enterprise - seamlessly manage projects, teams, and business operations with AI-powered insights.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" onClick={() => setShowSignupForm(true)} className="bg-purple-700 text-white hover:bg-purple-800 px-8 py-4 text-lg rounded-full">
              <UserCheck className="mr-2 w-5 h-5" />
              Start Your Journey
            </Button>
            <Button size="lg" variant="outline" onClick={() => onNavigate('auth')} className="border-purple-700 text-purple-700 hover:bg-purple-50 px-8 py-4 text-lg rounded-full">
              <Play className="mr-2 w-5 h-5" />
              See Demo
            </Button>
          </div>

          <p className="text-sm text-gray-500 mb-12">
            <strong>Trusted by 10,000+</strong> professionals across all business types
          </p>

          {/* Business Type Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <UserCheck className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900">Freelancers</div>
              <div className="text-xs text-gray-500">Solo professionals</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <Building className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900">Small Business</div>
              <div className="text-xs text-gray-500">Growing teams</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <Lightbulb className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900">Agencies</div>
              <div className="text-xs text-gray-500">Creative studios</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <Factory className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900">Enterprise</div>
              <div className="text-xs text-gray-500">Large organizations</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <Code className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900">Tech Teams</div>
              <div className="text-xs text-gray-500">Development teams</div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Hero Image Section */}
      <section className="py-16 px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-purple-100 via-blue-50 to-orange-50 rounded-2xl p-8 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.3),transparent_70%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,206,84,0.3),transparent_70%)]" />
            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  SkrobakiOS AI analyzing your project...
                </h3>
                <p className="text-gray-600 mb-6">
                  Our AI assistant helps optimize project timelines, resource allocation, and identifies potential risks before they impact your deadlines.
                </p>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/50">
                  <div className="flex items-center space-x-3">
                    <Bot className="w-6 h-6 text-purple-600" />
                    <div>
                      <div className="font-medium text-gray-900">AI Recommendation</div>
                      <div className="text-sm text-gray-600">Schedule steel delivery 2 days earlier to avoid weather delays</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-xl p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-800 font-medium">Foundation Complete</span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-orange-800 font-medium">Steel Frame - 60%</span>
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Electrical Rough-in</span>
                    <span className="text-sm text-gray-500">Scheduled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Type Solutions */}
      <section className="py-16 px-6 md:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Tailored solutions for every business type
            </h3>
            <p className="text-xl text-gray-600">
              From individual freelancers to large enterprises, we adapt to your unique needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <UserCheck className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Freelancers</CardTitle>
                <CardDescription>Perfect for solo professionals managing multiple client projects</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Time tracking & invoicing</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Client project portals</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Personal productivity dashboard</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Small Business</CardTitle>
                <CardDescription>Grow your team and manage increasing project complexity</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Team collaboration tools</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Project management suite</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Basic CRM & finance</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Lightbulb className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Agencies</CardTitle>
                <CardDescription>Creative studios and service providers managing multiple clients</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Multi-client management</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Creative workflow tools</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Resource allocation</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                  <Factory className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Enterprise</CardTitle>
                <CardDescription>Large organizations with complex operations and compliance needs</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Advanced permissions</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />SSO & security</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Custom integrations</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                  <Code className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle className="text-lg">Tech Teams</CardTitle>
                <CardDescription>Development teams and technology-focused organizations</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Agile project management</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />API integrations</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Development workflows</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
                  <HeartHandshake className="w-6 h-6 text-pink-600" />
                </div>
                <CardTitle className="text-lg">Custom Solutions</CardTitle>
                <CardDescription>Unique business models requiring specialized workflows</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Tailored workflows</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Dedicated support</li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Custom development</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button onClick={() => setShowSignupForm(true)} size="lg" className="bg-purple-700 text-white hover:bg-purple-800 px-8 py-3 rounded-full">
              Find Your Perfect Setup
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section className="py-16 px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to run successful projects
            </h3>
            <p className="text-xl text-gray-600">
              From planning to completion, SkrobakiOS provides the tools and intelligence your team needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900">AI Project Assistant</h4>
              <p className="text-gray-600">
                Intelligent automation that predicts delays, optimizes schedules, and suggests resource allocation improvements.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <PieChart className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900">Real-time Dashboard</h4>
              <p className="text-gray-600">
                Comprehensive dashboards showing project health, budget status, team performance, and key metrics at a glance.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900">Team Collaboration</h4>
              <p className="text-gray-600">
                Seamless communication tools, file sharing, and real-time updates keep everyone aligned and productive.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900">Business Management</h4>
              <p className="text-gray-600">
                Integrated CRM, invoicing, cost tracking, and financial reporting to manage your entire business operations.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-red-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900">Mobile Access</h4>
              <p className="text-gray-600">
                Full-featured mobile apps ensure your team stays connected and productive whether in the office or on-site.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Workflow className="w-6 h-6 text-indigo-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900">Workflow Automation</h4>
              <p className="text-gray-600">
                Automate repetitive tasks, approvals, and notifications to reduce manual work and eliminate bottlenecks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-16 px-6 md:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Connects with your favorite tools
          </h3>
          <p className="text-xl text-gray-600 mb-12">
            SkrobakiOS integrates seamlessly with the software you already use
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Microsoft</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Slack</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <Calendar className="w-8 h-8 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Google</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <Layers className="w-8 h-8 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">AutoCAD</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <Shield className="w-8 h-8 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Xero</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <Activity className="w-8 h-8 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Zapier</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats & Social Proof */}
      <section className="py-16 px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">40%</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">Faster Project Delivery</div>
              <div className="text-gray-600">Teams using SkrobakiOS complete projects 40% faster on average</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">95%</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">Customer Satisfaction</div>
              <div className="text-gray-600">Our customers consistently rate us 5 stars for ease of use and results</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">$2M+</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">Cost Savings</div>
              <div className="text-gray-600">Average annual savings per company through improved efficiency</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-16 px-6 md:px-8 bg-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <blockquote className="text-2xl font-medium text-gray-900 mb-6">
            "SkrobakiOS transformed how we manage our construction projects. The AI insights help us avoid delays, and the dashboard gives us complete visibility into every aspect of our business."
          </blockquote>
          <div className="flex items-center justify-center space-x-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">Sarah Chen</div>
              <div className="text-gray-600">Project Director, BuildCorp</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-6 md:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to transform your business operations?
          </h3>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of professionals from freelancers to enterprise teams already using SkrobakiOS to scale their business and deliver projects efficiently.
          </p>
          
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 mb-8">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <Badge variant="secondary" className="mb-2">For Individuals</Badge>
                <p className="text-sm text-gray-600">Start free, upgrade as you grow</p>
              </div>
              <div>
                <Badge variant="secondary" className="mb-2">For Teams</Badge>
                <p className="text-sm text-gray-600">Collaborate & manage together</p>
              </div>
              <div>
                <Badge variant="secondary" className="mb-2">For Enterprise</Badge>
                <p className="text-sm text-gray-600">Advanced features & support</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button size="lg" onClick={() => onNavigate('auth')} className="bg-purple-700 text-white hover:bg-purple-800 px-8 py-4 text-lg rounded-full">
              <UserCheck className="mr-2 w-5 h-5" />
              Create Your Account
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => onNavigate('auth')} className="border-purple-700 text-purple-700 hover:bg-purple-50 px-8 py-4 text-lg rounded-full">
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
          </div>
          
          <p className="text-sm text-gray-500">
            Free to start • Scales with your business • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 px-6 md:px-8 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold">SkrobakiOS</span>
              </div>
              <p className="text-gray-400 text-sm">
                The complete platform for construction and engineering project management.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Project Management</li>
                <li>Business Operations</li>
                <li>AI Assistant</li>
                <li>Mobile Apps</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Solutions</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Construction</li>
                <li>Engineering</li>
                <li>Architecture</li>
                <li>Enterprise</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>About</li>
                <li>Careers</li>
                <li>Contact</li>
                <li>Support</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2024 SkrobakiOS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>;
};