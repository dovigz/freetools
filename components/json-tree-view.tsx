"use client";

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight, 
  Copy,
} from 'lucide-react';
import { JSONNode, createJSONTree, getNodeDisplayValue, searchJSON, SearchResult, getSearchHighlight } from '@/lib/json-formatter';
import { generateJSONSchema, formatSchemaForDisplay } from '@/lib/json-schema';
import { cn } from '@/lib/utils';

interface JSONHeroViewProps {
  data: any;
  selectedPath: string[];
  onPathChange: (path: string[]) => void;
  searchQuery?: string;
  className?: string;
}

interface JSONColumnProps {
  title: string;
  type: 'object' | 'array' | 'root';
  nodes: JSONNode[];
  selectedPath: string[];
  columnIndex: number;
  onSelect: (path: string[]) => void;
  searchQuery?: string;
  searchResults?: SearchResult[];
}

function getFieldCount(node: JSONNode): string {
  if (node.type === 'array') {
    return `${node.value.length} items`;
  } else if (node.type === 'object') {
    return `${Object.keys(node.value).length} fields`;
  }
  return '';
}

function HighlightedText({ text, query }: { text: string; query?: string }) {
  if (!query) return <span>{text}</span>;
  
  const parts = getSearchHighlight(text, query);
  
  return (
    <span>
      {parts.map((part, index) => (
        <span
          key={index}
          className={part.isHighlighted ? 'bg-yellow-300 text-black px-0.5 rounded' : ''}
        >
          {part.text}
        </span>
      ))}
    </span>
  );
}

function JSONColumn({ title, type, nodes, selectedPath, columnIndex, onSelect, searchQuery, searchResults }: JSONColumnProps) {
  const copyPath = async (path: string[]) => {
    try {
      await navigator.clipboard.writeText(path.join('.'));
    } catch (e) {
      // Handle error  
    }
  };

  const getItemIcon = (nodeType: JSONNode['type']) => {
    switch (nodeType) {
      case 'string': return '📝';
      case 'number': return '🔢';
      case 'boolean': return '✅';
      case 'null': return '⚪';
      case 'array': return '📊';
      case 'object': return '📄';
      default: return '❓';
    }
  };

  return (
    <div className="w-80 bg-slate-800 border-r border-slate-600 flex flex-col">
      {/* Column Header */}
      <div className="p-3 border-b border-slate-600 bg-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">{type === 'array' ? '📊' : type === 'object' ? '📄' : '🏠'}</span>
          <h3 className="font-semibold text-white text-sm">{title}</h3>
          <span className="text-slate-400 text-xs">
            {type === 'object' ? 'object' : type === 'array' ? 'array' : 'root'}
          </span>
        </div>
      </div>

      {/* Column Content */}
      <div className="flex-1">
        <div className="p-0">
          {nodes.map((node, index) => {
            const isSelected = selectedPath[columnIndex] === node.key;
            const hasChildren = node.children && node.children.length > 0;
            const fieldCount = getFieldCount(node);
            
            // Find search result for this node
            const searchResult = searchResults?.find(result => result.node.id === node.id);
            const matchType = searchResult?.matchType;

            return (
              <div
                key={node.id}
                className={cn(
                  "flex items-center p-3 cursor-pointer hover:bg-slate-700/50 group transition-colors border-b border-slate-700/30 last:border-b-0",
                  isSelected && "bg-slate-600/70 hover:bg-slate-600/70",
                  matchType === 'exact' && !isSelected && "bg-yellow-900/30 ring-1 ring-yellow-500/50",
                  matchType === 'nested' && !isSelected && "bg-yellow-900/10 ring-1 ring-yellow-500/20",
                  !hasChildren && "cursor-default hover:bg-transparent"
                )}
                onClick={() => hasChildren && onSelect([...selectedPath.slice(0, columnIndex), node.key])}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-lg flex-shrink-0">{getItemIcon(node.type)}</span>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white text-sm truncate">
                        <HighlightedText text={node.key} query={searchQuery} />
                      </span>
                      {fieldCount && (
                        <span className="text-xs text-slate-400 whitespace-nowrap">
                          {fieldCount}
                        </span>
                      )}
                      {hasChildren && (
                        <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-1">
                      <HighlightedText text={getNodeDisplayValue(node)} query={searchQuery} />
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 w-6 h-6 p-0 transition-opacity hover:bg-slate-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyPath([...selectedPath.slice(0, columnIndex), node.key]);
                    }}
                    title="Copy path"
                  >
                    <Copy className="w-3 h-3 text-slate-400" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function JSONTreeView({ data, selectedPath, onPathChange, searchQuery, className }: JSONHeroViewProps) {
  const [activeTab, setActiveTab] = useState<'json' | 'schema'>('json');
  
  const rootNodes = useMemo(() => {
    if (!data) return [];
    return createJSONTree(data);
  }, [data]);

  // Generate search results
  const searchResults = useMemo(() => {
    if (!searchQuery || !rootNodes.length) return [];
    return searchJSON(rootNodes, searchQuery);
  }, [rootNodes, searchQuery]);

  const columns = useMemo(() => {
    const cols: Array<{
      title: string;
      type: 'object' | 'array' | 'root';
      nodes: JSONNode[];
    }> = [];
    
    // Root column
    cols.push({
      title: 'root',
      type: 'root',
      nodes: rootNodes
    });
    
    // Build subsequent columns based on selected path
    let currentNodes = rootNodes;
    let currentPath: string[] = [];
    
    for (let i = 0; i < selectedPath.length; i++) {
      const pathSegment = selectedPath[i];
      const selectedNode = currentNodes.find(node => 
        node.path.length === currentPath.length + 1 && 
        node.path[currentPath.length] === pathSegment
      );
      
      if (selectedNode && selectedNode.children) {
        currentPath = [...currentPath, pathSegment];
        cols.push({
          title: pathSegment,
          type: selectedNode.type as 'object' | 'array',
          nodes: selectedNode.children
        });
        currentNodes = selectedNode.children;
      } else {
        break;
      }
    }
    
    return cols;
  }, [rootNodes, selectedPath]);

  // Get the current selected value for the JSON display
  const getCurrentValue = () => {
    if (selectedPath.length === 0) return data;
    
    let current = data;
    for (const segment of selectedPath) {
      if (current && typeof current === 'object' && segment in current) {
        current = current[segment];
      } else {
        return null;
      }
    }
    return current;
  };

  const currentValue = getCurrentValue();
  
  // Generate schema for the current value
  const currentSchema = useMemo(() => {
    if (currentValue === null) return null;
    try {
      return generateJSONSchema(currentValue);
    } catch (e) {
      return null;
    }
  }, [currentValue]);

  if (!data) {
    return (
      <div className={cn("h-full flex items-center justify-center bg-slate-800", className)}>
        <p className="text-slate-400">No JSON data to display</p>
      </div>
    );
  }

  return (
    <div className={cn("h-full flex bg-slate-800", className)}>
      <div className="flex h-full">
        {/* Navigation columns */}
        {columns.map((column, index) => (
          <JSONColumn
            key={`${column.title}-${index}`}
            title={column.title}
            type={column.type}
            nodes={column.nodes}
            selectedPath={selectedPath}
            columnIndex={index}
            onSelect={onPathChange}
            searchQuery={searchQuery}
            searchResults={searchResults}
          />
        ))}
        
        {/* JSON Display Column */}
        {currentValue !== null && (
          <div className="w-96 bg-slate-900 border-r border-slate-600 flex flex-col">
            <div className="p-3 border-b border-slate-600">
              <div className="flex items-center gap-2">
                <span className="text-lg">📄</span>
                <h3 className="font-semibold text-white text-sm">
                  {selectedPath.length > 0 ? selectedPath[selectedPath.length - 1] : 'root'}
                </h3>
                <span className="text-slate-400 text-xs">
                  {Array.isArray(currentValue) ? 'array' : typeof currentValue}
                </span>
              </div>
              <div className="flex gap-2 mt-2">
                <button 
                  className={cn(
                    "px-3 py-1 text-xs rounded transition-colors",
                    activeTab === 'json' 
                      ? "bg-slate-700 text-white border-b-2 border-blue-400" 
                      : "text-slate-400 hover:text-white hover:bg-slate-700"
                  )}
                  onClick={() => setActiveTab('json')}
                >
                  JSON
                </button>
                <button 
                  className={cn(
                    "px-3 py-1 text-xs rounded transition-colors",
                    activeTab === 'schema' 
                      ? "bg-slate-700 text-white border-b-2 border-blue-400" 
                      : "text-slate-400 hover:text-white hover:bg-slate-700"
                  )}
                  onClick={() => setActiveTab('schema')}
                  disabled={!currentSchema}
                >
                  Schema
                </button>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="p-3">
                {activeTab === 'json' ? (
                  <pre className="text-sm text-slate-200 whitespace-pre-wrap font-mono leading-relaxed">
                    {JSON.stringify(currentValue, null, 2)}
                  </pre>
                ) : (
                  <pre className="text-sm text-slate-200 whitespace-pre-wrap font-mono leading-relaxed">
                    {currentSchema ? formatSchemaForDisplay(currentSchema) : 'No schema available'}
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}