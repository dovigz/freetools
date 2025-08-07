"use client";

import { useToolManagement } from "@/hooks/use-tool-management";
import { tools } from "@/lib/categories";
import Link from "next/link";

function ToolCard({
  tool,
  showUsageCount = false,
  usageCount = 0,
}: {
  tool: any;
  showUsageCount?: boolean;
  usageCount?: number;
}) {
  return (
    <Link
      href={tool.path}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 border hover:border-blue-300 group relative"
    >
      <div className="text-4xl mb-4">{tool.emoji}</div>
      <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
        {tool.name}
      </h3>
      <p className="text-gray-600 mb-4">{tool.description}</p>

      {showUsageCount && usageCount > 0 && (
        <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
          Used {usageCount} time{usageCount !== 1 ? "s" : ""}
        </div>
      )}
    </Link>
  );
}

function ToolSection({
  title,
  tools: sectionTools,
  showUsageCount = false,
  getUsageCount,
}: {
  title: string;
  tools: any[];
  showUsageCount?: boolean;
  getUsageCount?: (toolId: string) => number;
}) {
  if (sectionTools.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sectionTools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            showUsageCount={showUsageCount}
            usageCount={getUsageCount ? getUsageCount(tool.id) : 0}
          />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const {
    orderedTools,
    recentTools,
    pinnedTools,
    getToolUsage,
    statistics,
    isLoading,
  } = useToolManagement();

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Free Online Tools</h1>
          <p className="text-xl text-gray-600">
            Essential tools for developers and everyone
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 border">
              <div className="w-16 h-16 bg-gray-200 rounded mb-4 animate-pulse" />
              <div className="w-32 h-6 bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Filter out Home tool from all sections
  const nonHomeTools = tools.filter((t) => t.id !== "home");
  const nonHomePinned = pinnedTools.filter((t) => t.id !== "home");
  const nonHomeRecent = recentTools.filter((t) => t.id !== "home");

  // Get remaining tools (not recent and not pinned)
  const recentIds = new Set(nonHomeRecent.map((t) => t.id));
  const pinnedIds = new Set(nonHomePinned.map((t) => t.id));
  const remainingTools = nonHomeTools.filter(
    (t) => !recentIds.has(t.id) && !pinnedIds.has(t.id)
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Free Online Tools</h1>
        <p className="text-xl text-gray-600 mb-6">
          Essential tools for developers and everyone
        </p>

        {statistics.totalUsage > 0 && (
          <div className="inline-flex items-center gap-4 bg-blue-50 text-blue-800 px-4 py-2 rounded-lg text-sm">
            <span>📊 Total usage: {statistics.totalUsage}</span>
            {statistics.pinnedCount > 0 && (
              <span>📌 Pinned tools: {statistics.pinnedCount}</span>
            )}
          </div>
        )}
      </div>

      {/* Recent Tools Section */}
      <ToolSection
        title="🕒 Recently Used"
        tools={nonHomeRecent}
        showUsageCount={true}
        getUsageCount={getToolUsage}
      />

      {/* Pinned Tools Section */}
      <ToolSection
        title="📌 Pinned Tools"
        tools={nonHomePinned}
        showUsageCount={true}
        getUsageCount={getToolUsage}
      />

      {/* All Tools Section */}
      <ToolSection
        title={
          nonHomeRecent.length > 0 || nonHomePinned.length > 0
            ? "🛠️ All Tools"
            : "🛠️ Available Tools"
        }
        tools={
          nonHomeRecent.length > 0 || nonHomePinned.length > 0
            ? remainingTools
            : nonHomeTools
        }
      />
    </div>
  );
}
