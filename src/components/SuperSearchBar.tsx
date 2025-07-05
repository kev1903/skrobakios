import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, Users, Calendar, Building } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProjects } from '@/hooks/useProjects';
import { useTaskContext } from '@/components/tasks/TaskContext';

interface SearchResult {
  id: string;
  title: string;
  type: 'project' | 'task' | 'file' | 'team';
  description?: string;
  metadata?: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SuperSearchBarProps {
  onNavigate?: (page: string, data?: any) => void;
  onSelectProject?: (projectId: string) => void;
}

export const SuperSearchBar = ({ onNavigate, onSelectProject }: SuperSearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { getProjects } = useProjects();
  const { tasks } = useTaskContext();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search function
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults: SearchResult[] = [];
      const lowerQuery = searchQuery.toLowerCase();

      // Search projects
      try {
        const projects = await getProjects();
        const projectResults = projects
          .filter(project => 
            project.name.toLowerCase().includes(lowerQuery) ||
            project.description?.toLowerCase().includes(lowerQuery) ||
            project.project_id.toLowerCase().includes(lowerQuery)
          )
          .slice(0, 5)
          .map(project => ({
            id: project.id,
            title: project.name,
            type: 'project' as const,
            description: project.description || 'No description',
            metadata: `ID: ${project.project_id} • ${project.status}`,
            icon: Building
          }));
        
        searchResults.push(...projectResults);
      } catch (error) {
        console.error('Error searching projects:', error);
      }

      // Search tasks
      const taskResults = tasks
        .filter(task => 
          task.taskName.toLowerCase().includes(lowerQuery) ||
          task.description?.toLowerCase().includes(lowerQuery) ||
          task.assignedTo.name.toLowerCase().includes(lowerQuery)
        )
        .slice(0, 5)
        .map(task => ({
          id: task.id,
          title: task.taskName,
          type: 'task' as const,
          description: task.description || 'No description',
          metadata: `${task.status} • ${task.assignedTo.name}`,
          icon: Calendar
        }));

      searchResults.push(...taskResults);

      // Add some example results for files and team (since we don't have real data yet)
      if (lowerQuery.includes('file') || lowerQuery.includes('document')) {
        searchResults.push({
          id: 'file-1',
          title: 'Project Documentation',
          type: 'file',
          description: 'Contains project specifications and requirements',
          metadata: 'PDF • 2.4 MB',
          icon: FileText
        });
      }

      if (lowerQuery.includes('team') || lowerQuery.includes('member')) {
        searchResults.push({
          id: 'team-1',
          title: 'Team Members',
          type: 'team',
          description: 'View and manage project team members',
          metadata: 'Team Management',
          icon: Users
        });
      }

      setResults(searchResults.slice(0, 8)); // Limit to 8 results
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, tasks]);

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'project' && onSelectProject && onNavigate) {
      onSelectProject(result.id);
      onNavigate('project-detail');
    } else if (result.type === 'task' && onNavigate) {
      // Find the project for this task and navigate to tasks page
      const task = tasks.find(t => t.id === result.id);
      if (task && onSelectProject) {
        onSelectProject(task.project_id);
        onNavigate('project-tasks');
      }
    } else if (result.type === 'team' && onNavigate) {
      onNavigate('admin');
    }
    
    setIsOpen(false);
    setQuery('');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project': return 'bg-blue-100 text-blue-800';
      case 'task': return 'bg-green-100 text-green-800';
      case 'file': return 'bg-purple-100 text-purple-800';
      case 'team': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-4 h-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search projects, tasks, files... (Ctrl+K)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10 py-2 text-sm border-white/20 focus:border-white/40 focus:ring-white/30 bg-white/10 backdrop-blur-sm shadow-sm text-white placeholder-white/60 hover:bg-white/15 transition-all duration-200"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto text-white hover:text-white hover:bg-white/10"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (query || results.length > 0) && (
        <Card className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl z-50 max-h-96 overflow-hidden rounded-xl">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full mr-2"></div>
                Searching...
              </div>
            ) : results.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="w-full p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-left transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <result.icon className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {result.title}
                          </h3>
                          <Badge variant="outline" className={`text-xs ${getTypeColor(result.type)}`}>
                            {result.type}
                          </Badge>
                        </div>
                        {result.description && (
                          <p className="text-sm text-gray-600 truncate mb-1">
                            {result.description}
                          </p>
                        )}
                        {result.metadata && (
                          <p className="text-xs text-gray-500 truncate">
                            {result.metadata}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : query ? (
              <div className="p-4 text-center text-gray-500">
                No results found for "{query}"
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <div className="text-sm">
                  <p className="mb-2">Search across your projects, tasks, and files</p>
                  <p className="text-xs text-gray-400">
                    Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 rounded">Ctrl+K</kbd> to quickly access search
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};