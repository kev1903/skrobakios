import React from 'react';
import { Building2, Users, Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
interface PublicNavbarProps {
  currentPage?: 'directory' | 'profile' | 'company';
}

export const PublicNavbar = ({ currentPage }: PublicNavbarProps) => {
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">BuildNet</span>
            <Badge variant="secondary" className="text-xs">
              Directory
            </Badge>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/"
              className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary ${
                currentPage === undefined ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            
            <Link 
              to="/directory"
              className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary ${
                currentPage === 'directory' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Browse Directory</span>
            </Link>
            
            <Link 
              to="/directory"
              className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <Users className="h-4 w-4" />
              <span>Professionals</span>
            </Link>
            
            <Link 
              to="/directory"
              className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <Building2 className="h-4 w-4" />
              <span>Companies</span>
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" asChild>
              <Link to="/?page=auth">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/?page=auth">Join Directory</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};