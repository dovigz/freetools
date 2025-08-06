"use client";

import { useState, useEffect } from 'react';
import { JSONTreeView } from '@/components/json-tree-view';
import { JSONBreadcrumb } from '@/components/json-breadcrumb';
import { JSONImportDialog } from '@/components/json-import-dialog';
import { Button } from '@/components/ui/button';
import { Upload, Search } from 'lucide-react';

const SAMPLE_JSON = {
  "name": "John Doe",
  "age": 30,
  "city": "New York",
  "hobbies": ["reading", "swimming", "coding"],
  "address": {
    "street": "123 Main St",
    "zipcode": "10001"
  },
  "isEmployed": true,
  "spouse": null
};

export default function JSONFormatter() {
  const [parsedData, setParsedData] = useState<any>(SAMPLE_JSON);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-parse sample data on mount
  useEffect(() => {
    setParsedData(SAMPLE_JSON);
  }, []);

  const handleImportJSON = (data: any) => {
    setParsedData(data);
    setSelectedPath([]); // Reset path when importing new data
    setSearchQuery(''); // Clear search when importing new data
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 overflow-hidden">
      {/* Top toolbar */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 bg-slate-800 border-b border-slate-600">
        <div className="flex items-center gap-4 min-w-0">
          <h1 className="text-xl font-bold text-white flex-shrink-0">JSON Hero</h1>
          
          <div className="relative max-w-md flex-shrink-0">
            <JSONImportDialog 
              onImport={handleImportJSON}
              trigger={
                <input
                  type="text"
                  placeholder="Paste JSON here..."
                  className="w-64 px-4 py-2 bg-slate-700 text-white text-sm rounded-md border border-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  onClick={(e) => {
                    e.target.click();
                  }}
                  readOnly
                />
              }
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <JSONImportDialog onImport={handleImportJSON} />
          <div className="w-8 h-8 bg-slate-700 rounded-md flex items-center justify-center">
            <span className="text-white text-sm">📦</span>
          </div>
        </div>
      </div>

      {/* Breadcrumb navigation */}
      <div className="flex-shrink-0">
        <JSONBreadcrumb
          path={selectedPath}
          data={parsedData}
          onNavigate={setSelectedPath}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          className="bg-slate-800 border-b border-slate-600"
        />
      </div>

      {/* Main JSON Hero view */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <JSONTreeView 
          data={parsedData}
          selectedPath={selectedPath}
          onPathChange={setSelectedPath}
          searchQuery={searchQuery}
          className="h-full w-full"
        />
      </div>
    </div>
  );
}