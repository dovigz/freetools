"use client";

import { Button } from '@/components/ui/button';
import { ChevronRight, Home, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  key: string;
  label: string;
  type: 'object' | 'array' | 'root';
  path: string[];
}

interface JSONBreadcrumbProps {
  path: string[];
  data: any;
  onNavigate: (path: string[]) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  className?: string;
}

export function JSONBreadcrumb({ path, data, onNavigate, searchQuery, onSearchChange, className }: JSONBreadcrumbProps) {
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // Add root
  breadcrumbs.push({
    key: 'root',
    label: 'root',
    type: 'root',
    path: []
  });

  // Build breadcrumb items from path
  let currentData = data;
  let currentPath: string[] = [];
  
  for (const segment of path) {
    currentPath = [...currentPath, segment];
    
    if (currentData && typeof currentData === 'object') {
      const value = currentData[segment];
      const type = Array.isArray(value) ? 'array' : (value && typeof value === 'object') ? 'object' : 'root';
      
      breadcrumbs.push({
        key: segment,
        label: segment,
        type,
        path: [...currentPath]
      });
      
      currentData = value;
    }
  }

  const handleNavigate = (targetPath: string[]) => {
    onNavigate(targetPath);
  };

  return (
    <div className={cn("flex items-center justify-between p-3", className)}>
      <div className="flex items-center gap-1 flex-wrap flex-1">
        {breadcrumbs.map((crumb, index) => (
          <div key={`${crumb.key}-${index}`} className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-3 text-sm font-medium transition-colors hover:bg-slate-700",
                index === breadcrumbs.length - 1 
                  ? "text-white bg-slate-700" 
                  : "text-slate-300 hover:text-white"
              )}
              onClick={() => handleNavigate(crumb.path)}
            >
              <div className="flex items-center gap-2">
                {crumb.type === 'root' && <Home className="w-4 h-4" />}
                <span>{crumb.label}</span>
                {crumb.type === 'object' && <span>📄</span>}
                {crumb.type === 'array' && <span>📊</span>}
              </div>
            </Button>
            
            {index < breadcrumbs.length - 1 && (
              <ChevronRight className="w-4 h-4 text-slate-500" />
            )}
          </div>
        ))}
        
        {/* Current item info */}
        {path.length > 0 && currentData !== undefined && (
          <div className="ml-4 flex items-center gap-2 text-sm">
            {Array.isArray(currentData) && (
              <span className="bg-orange-900/30 px-2 py-1 rounded text-orange-300 text-xs">
                {currentData.length} items
              </span>
            )}
            {currentData && typeof currentData === 'object' && !Array.isArray(currentData) && (
              <span className="bg-pink-900/30 px-2 py-1 rounded text-pink-300 text-xs">
                {Object.keys(currentData).length} fields
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Search box */}
      {onSearchChange && (
        <div className="relative flex-shrink-0 ml-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-12 py-2 bg-slate-700 text-white text-sm rounded-md border border-slate-600 focus:border-slate-500 focus:outline-none w-64"
          />
          <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs bg-slate-600 px-2 py-1 rounded">
            K
          </kbd>
        </div>
      )}
    </div>
  );
}