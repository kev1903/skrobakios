import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, BookOpen, Plus, Upload, FolderTree } from 'lucide-react';

interface EstimationLibraryPageProps {
  onNavigate?: (page: string) => void;
}

export const EstimationLibraryPage = ({ onNavigate }: EstimationLibraryPageProps) => {
  const [search, setSearch] = useState('');

  // Basic SEO
  useEffect(() => {
    document.title = 'Estimating Library';
    const existing = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const meta = existing || document.createElement('meta');
    meta.name = 'description';
    meta.content = 'Estimating library for cost items, assemblies, and templates';
    if (!existing) document.head.appendChild(meta);
  }, []);

  const handleBack = () => onNavigate?.('sales');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.15)_1px,transparent_0)] bg-[length:24px_24px] pointer-events-none" />

      <div className="relative z-10 p-6 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="flex items-center space-x-2 hover:bg-white/20 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sales</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-poppins">Estimating Library</h1>
              <p className="text-muted-foreground font-inter">Manage cost items, assemblies, and templates</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="glass-light border-white/20">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4" />
              <span>New Item</span>
            </Button>
          </div>
        </header>

        {/* Search */}
        <section className="flex items-center justify-between">
          <div className="relative max-w-sm">
            <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search library items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 glass-light border-white/20 backdrop-blur-sm"
            />
          </div>
        </section>

        {/* Library Table */}
        <main>
          <Card className="glass-light border-white/20 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderTree className="w-5 h-5" />
                Library Items
              </CardTitle>
              <CardDescription>Organize reusable items for faster estimating</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-foreground font-semibold">Name</TableHead>
                    <TableHead className="text-foreground font-semibold">Type</TableHead>
                    <TableHead className="text-foreground font-semibold">Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">No items yet</p>
                          <p className="text-sm">Create or import items to build your estimating library</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

