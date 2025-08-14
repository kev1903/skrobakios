import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onSelectProject?: (projectId: string) => void;
  currentPage?: string;
}

export const HomePage = ({ onNavigate, onSelectProject, currentPage = "" }: HomePageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.15)_1px,transparent_0)] bg-[length:24px_24px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="flex-1 p-6 space-y-6">
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold text-foreground mb-4 font-playfair">Welcome to SkrobakiOS</h1>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Your comprehensive business management platform for projects, finance, and team collaboration.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 max-w-6xl mx-auto">
              <Card className="glass-card border-glass-border hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-playfair">Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Manage your projects, timelines, and deliverables</p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => onNavigate('projects')}
                  >
                    View Projects <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-card border-glass-border hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-playfair">Finance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Track income, expenses, and financial analytics</p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => onNavigate('finance')}
                  >
                    Open Finance <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-card border-glass-border hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-playfair">Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Organize and track your team's tasks</p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => onNavigate('tasks')}
                  >
                    View Tasks <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};