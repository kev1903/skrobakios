import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Calendar,
  User,
  Building2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
  gradient: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  onClick,
  gradient 
}) => {
  return (
    <Card className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className={`w-12 h-12 rounded-lg ${gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={onClick}
          variant="ghost" 
          className="w-full justify-start text-primary hover:bg-primary/10"
        >
          Open Dashboard →
        </Button>
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const dashboards = [
    {
      title: "Personal Dashboard",
      description: "Track your personal activities, wellness, and goals",
      icon: User,
      onClick: () => navigate('/personal'),
      gradient: "bg-gradient-to-br from-blue-500 to-purple-600"
    },
    {
      title: "Business Dashboard",
      description: "Monitor business metrics, projects, and team performance",
      icon: Building2,
      onClick: () => navigate('/business'),
      gradient: "bg-gradient-to-br from-green-500 to-emerald-600"
    },
    {
      title: "Projects Overview",
      description: "Manage and track all your active projects",
      icon: Briefcase,
      onClick: () => navigate('/projects'),
      gradient: "bg-gradient-to-br from-orange-500 to-red-600"
    },
    {
      title: "Sales Analytics",
      description: "View sales pipeline, opportunities, and revenue metrics",
      icon: TrendingUp,
      onClick: () => navigate('/sales'),
      gradient: "bg-gradient-to-br from-cyan-500 to-blue-600"
    },
    {
      title: "Schedule & Tasks",
      description: "Manage your calendar, tasks, and upcoming events",
      icon: Calendar,
      onClick: () => navigate('/tasks'),
      gradient: "bg-gradient-to-br from-purple-500 to-pink-600"
    },
    {
      title: "Analytics Hub",
      description: "Comprehensive analytics and reporting center",
      icon: BarChart3,
      onClick: () => navigate('/analytics'),
      gradient: "bg-gradient-to-br from-indigo-500 to-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/5">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
            Dashboard Hub
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose a dashboard to view detailed insights and manage different aspects of your work and life
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {dashboards.map((dashboard, index) => (
            <DashboardCard
              key={index}
              title={dashboard.title}
              description={dashboard.description}
              icon={dashboard.icon}
              onClick={dashboard.onClick}
              gradient={dashboard.gradient}
            />
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <Card className="text-center p-4 backdrop-blur-sm border-border/50">
            <div className="text-2xl font-bold text-primary">6</div>
            <div className="text-sm text-muted-foreground">Active Dashboards</div>
          </Card>
          <Card className="text-center p-4 backdrop-blur-sm border-border/50">
            <div className="text-2xl font-bold text-primary">24/7</div>
            <div className="text-sm text-muted-foreground">Real-time Updates</div>
          </Card>
          <Card className="text-center p-4 backdrop-blur-sm border-border/50">
            <div className="text-2xl font-bold text-primary">100%</div>
            <div className="text-sm text-muted-foreground">Customizable</div>
          </Card>
          <Card className="text-center p-4 backdrop-blur-sm border-border/50">
            <div className="text-2xl font-bold text-primary">∞</div>
            <div className="text-sm text-muted-foreground">Possibilities</div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;