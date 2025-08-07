"use client";

import { JSONBreadcrumb } from "@/components/json-breadcrumb";
import { JSONEmptyState } from "@/components/json-empty-state";
import { JSONImportDialog } from "@/components/json-import-dialog";
import { JSONTreeView } from "@/components/json-tree-view";
import { useState } from "react";

export default function JSONFormatter() {
  const [parsedData, setParsedData] = useState<any>(null);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleImportJSON = (data: any) => {
    setParsedData(data);
    setSelectedPath([]); // Reset path when importing new data
    setSearchQuery(""); // Clear search when importing new data
  };

  // Helper function to get JSON preview for header
  const getJSONPreview = () => {
    if (!parsedData) return "";

    try {
      // Get the first few key-value pairs for a meaningful preview
      if (
        typeof parsedData === "object" &&
        parsedData !== null &&
        !Array.isArray(parsedData)
      ) {
        const keys = Object.keys(parsedData);
        if (keys.length === 0) return "{}";

        const firstKey = keys[0];
        const firstValue = parsedData[firstKey];
        const valuePreview =
          typeof firstValue === "string"
            ? `"${firstValue.length > 10 ? firstValue.substring(0, 10) + "..." : firstValue}"`
            : JSON.stringify(firstValue);

        const preview = `{"${firstKey}": ${valuePreview}${keys.length > 1 ? ", ..." : ""}}`;

        // Ensure it fits in the input field
        if (preview.length <= 45) return preview;
        return `{"${firstKey}": ${typeof firstValue}${keys.length > 1 ? ", ..." : ""}}`;
      } else if (Array.isArray(parsedData)) {
        const length = parsedData.length;
        if (length === 0) return "[]";
        return `[${length} item${length > 1 ? "s" : ""}]`;
      } else {
        const preview = JSON.stringify(parsedData);
        return preview.length <= 45
          ? preview
          : preview.substring(0, 42) + "...";
      }
    } catch (e) {
      return "Invalid JSON";
    }
  };

  // Show empty state if no data
  if (!parsedData) {
    return (
      <div className="h-full flex flex-col bg-slate-900 overflow-hidden rounded-lg min-h-0">
        <JSONEmptyState onImport={handleImportJSON} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-900 overflow-hidden rounded-lg min-h-0">
      {/* Top toolbar */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 bg-slate-800 border-b border-slate-600 rounded-t-lg">
        <div className="flex items-center gap-4 min-w-0">
          <h1 className="text-xl font-bold text-white flex-shrink-0">
            JSON Formatter
          </h1>

          <div className="relative max-w-md flex-shrink-0">
            <JSONImportDialog
              onImport={handleImportJSON}
              currentData={parsedData}
              trigger={
                <input
                  type="text"
                  value={getJSONPreview()}
                  placeholder="Click to edit JSON..."
                  className="w-64 px-4 py-2 bg-slate-700 text-white text-sm rounded-md border border-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer hover:bg-slate-600 transition-colors font-mono"
                  title={`Click to edit current JSON data${parsedData ? ": " + JSON.stringify(parsedData).substring(0, 100) + "..." : ""}`}
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
          <JSONImportDialog onImport={handleImportJSON} defaultTab="file" />
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
