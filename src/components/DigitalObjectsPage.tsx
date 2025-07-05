import { Box, MapPin, Calendar, DollarSign, FileText, CheckCircle, Cog } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DigitalObjectsPageProps {
  onNavigate: (page: string) => void;
}

export const DigitalObjectsPage = ({ onNavigate }: DigitalObjectsPageProps) => {
  const digitalObjectFeatures = [
    {
      icon: MapPin,
      title: "Location & Type",
      description: "Precise positioning and classification of every building element",
      color: "bg-blue-500/10 text-blue-400 border-blue-500/30"
    },
    {
      icon: Calendar,
      title: "Tasks & Schedule",
      description: "All construction and maintenance tasks linked to each object",
      color: "bg-green-500/10 text-green-400 border-green-500/30"
    },
    {
      icon: DollarSign,
      title: "Cost & Budget",
      description: "Real-time cost tracking and budget management per object",
      color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
    },
    {
      icon: FileText,
      title: "Documents",
      description: "All related drawings, specs, and documentation in one place",
      color: "bg-purple-500/10 text-purple-400 border-purple-500/30"
    },
    {
      icon: CheckCircle,
      title: "Quality Status",
      description: "Quality control checks and compliance tracking",
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
    },
    {
      icon: Cog,
      title: "Asset Management",
      description: "Future maintenance and lifecycle management capabilities",
      color: "bg-orange-500/10 text-orange-400 border-orange-500/30"
    }
  ];

  const objectTypes = [
    { name: "Slabs", count: 12, status: "In Progress" },
    { name: "Walls", count: 28, status: "Design Phase" },
    { name: "Rooms", count: 16, status: "Planning" },
    { name: "Tasks", count: 45, status: "Active" },
    { name: "Equipment", count: 8, status: "Procurement" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Box className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Digital Objects</h1>
              <p className="text-slate-400">Smart data representations of your project components</p>
            </div>
          </div>
        </div>

        {/* Main Description */}
        <Card className="mb-8 bg-white/5 border-white/10 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Intelligent Project Management Through Digital Objects
              </h2>
              <p className="text-lg text-slate-300 max-w-4xl mx-auto leading-relaxed">
                Digital Objects are smart data representations of real-world components in your project — 
                like slabs, walls, rooms, tasks, or equipment. Each object stores everything related to that item, 
                creating a unified intelligent system for your entire project.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {digitalObjectFeatures.map((feature, index) => (
            <Card key={index} className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${feature.color}`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Current Objects Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Box className="w-5 h-5" />
                Current Digital Objects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {objectTypes.map((type, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{type.count}</span>
                      </div>
                      <div>
                        <div className="text-white font-medium">{type.name}</div>
                        <div className="text-slate-400 text-sm">{type.count} objects</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-slate-300 border-slate-600">
                      {type.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">AI-Powered Intelligence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                  <h4 className="text-white font-semibold mb-2">Automated Tracking</h4>
                  <p className="text-slate-300 text-sm">
                    AI monitors progress, costs, and quality across all digital objects in real-time.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                  <h4 className="text-white font-semibold mb-2">Smart Connections</h4>
                  <p className="text-slate-300 text-sm">
                    Every object knows its relationships - from design to construction to maintenance.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20">
                  <h4 className="text-white font-semibold mb-2">Predictive Insights</h4>
                  <p className="text-slate-300 text-sm">
                    Machine learning identifies potential issues before they become problems.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom CTA */}
        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Transform Your Project with Digital Intelligence
            </h3>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              By turning every building element into a Digital Object, we create one intelligent system 
              where time, cost, quality, and maintenance are all connected and automated with AI.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => onNavigate('bim')}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
              >
                View 3D Environment
              </button>
              <button 
                onClick={() => onNavigate('project-settings')}
                className="px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                Configure Objects
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};