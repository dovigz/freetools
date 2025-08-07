"use client";

import { tools, type Tool } from "@/lib/categories";
import {
  getOrderedTools,
  getPinnedTools,
  getRecentTools,
  getToolStatistics,
  loadToolSettings,
  reorderPinnedTools,
  resetToolSettings,
  toggleToolPin,
  trackToolUsage,
  type ToolSettings,
} from "@/lib/tool-storage";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export interface UseToolManagementReturn {
  // Data
  orderedTools: Tool[];
  recentTools: Tool[];
  pinnedTools: Tool[];
  settings: ToolSettings | null;
  statistics: ReturnType<typeof getToolStatistics>;

  // Actions
  pinTool: (toolId: string) => void;
  unpinTool: (toolId: string) => void;
  togglePin: (toolId: string) => void;
  reorderPinned: (toolIds: string[]) => void;
  trackUsage: (toolId: string) => void;
  resetSettings: () => void;
  refreshData: () => void;

  // State
  isLoading: boolean;
  isToolPinned: (toolId: string) => boolean;
  getToolUsage: (toolId: string) => number;
  getLastUsed: (toolId: string) => number;
}

export function useToolManagement(): UseToolManagementReturn {
  const pathname = usePathname();
  const [orderedTools, setOrderedTools] = useState<Tool[]>(tools);
  const [recentTools, setRecentTools] = useState<Tool[]>([]);
  const [pinnedTools, setPinnedTools] = useState<Tool[]>([]);
  const [settings, setSettings] = useState<ToolSettings | null>(null);
  const [statistics, setStatistics] = useState(getToolStatistics());
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  const refreshData = useCallback(() => {
    const loadedSettings = loadToolSettings();
    const ordered = getOrderedTools();
    const recent = getRecentTools(6);
    const pinned = getPinnedTools();
    const stats = getToolStatistics();

    setSettings(loadedSettings);
    setOrderedTools(ordered);
    setRecentTools(recent);
    setPinnedTools(pinned);
    setStatistics(stats);
    setIsLoading(false);
  }, []);

  // Initialize on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Track usage when pathname changes
  useEffect(() => {
    if (!pathname || isLoading) return;

    const currentTool = tools.find((tool) => tool.path === pathname);
    if (currentTool && currentTool.id !== "home") {
      trackToolUsage(currentTool.id);
      // Refresh data after tracking to update recent tools
      setTimeout(refreshData, 100);
    }
  }, [pathname, isLoading, refreshData]);

  // Pin a tool
  const pinTool = useCallback(
    (toolId: string) => {
      const newPinnedState = toggleToolPin(toolId);
      if (newPinnedState) {
        refreshData();
      }
    },
    [refreshData]
  );

  // Unpin a tool
  const unpinTool = useCallback(
    (toolId: string) => {
      const currentlyPinned = settings?.toolUsage[toolId]?.isPinned;
      if (currentlyPinned) {
        toggleToolPin(toolId);
        refreshData();
      }
    },
    [settings, refreshData]
  );

  // Toggle pin state
  const togglePin = useCallback(
    (toolId: string) => {
      toggleToolPin(toolId);
      refreshData();
    },
    [refreshData]
  );

  // Reorder pinned tools
  const reorderPinned = useCallback(
    (toolIds: string[]) => {
      reorderPinnedTools(toolIds);
      refreshData();
    },
    [refreshData]
  );

  // Track usage manually
  const trackUsage = useCallback(
    (toolId: string) => {
      trackToolUsage(toolId);
      refreshData();
    },
    [refreshData]
  );

  // Reset settings
  const resetSettings = useCallback(() => {
    resetToolSettings();
    refreshData();
  }, [refreshData]);

  // Check if tool is pinned
  const isToolPinned = useCallback(
    (toolId: string): boolean => {
      return settings?.toolUsage[toolId]?.isPinned ?? false;
    },
    [settings]
  );

  // Get tool usage count
  const getToolUsage = useCallback(
    (toolId: string): number => {
      return settings?.toolUsage[toolId]?.useCount ?? 0;
    },
    [settings]
  );

  // Get last used timestamp
  const getLastUsed = useCallback(
    (toolId: string): number => {
      return settings?.toolUsage[toolId]?.lastUsed ?? 0;
    },
    [settings]
  );

  return {
    // Data
    orderedTools,
    recentTools,
    pinnedTools,
    settings,
    statistics,

    // Actions
    pinTool,
    unpinTool,
    togglePin,
    reorderPinned,
    trackUsage,
    resetSettings,
    refreshData,

    // State
    isLoading,
    isToolPinned,
    getToolUsage,
    getLastUsed,
  };
}

// Hook for just checking if a tool is pinned (lighter weight)
export function useToolPin(toolId: string) {
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    const settings = loadToolSettings();
    setIsPinned(settings.toolUsage[toolId]?.isPinned ?? false);
  }, [toolId]);

  const toggle = useCallback(() => {
    const newState = toggleToolPin(toolId);
    setIsPinned(newState);

    // Dispatch custom event to notify other components
    window.dispatchEvent(
      new CustomEvent("tool-pinned", {
        detail: { toolId, isPinned: newState },
      })
    );
  }, [toolId]);

  return { isPinned, toggle };
}

// Hook for just recent tools (for homepage)
export function useRecentTools(limit: number = 6) {
  const [recentTools, setRecentTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const recent = getRecentTools(limit);
    setRecentTools(recent);
    setIsLoading(false);
  }, [limit]);

  // Listen for tool usage updates
  useEffect(() => {
    const handleToolUsage = () => {
      const recent = getRecentTools(limit);
      setRecentTools(recent);
    };

    // Listen for pathname changes and custom events
    window.addEventListener("tool-used", handleToolUsage);
    return () => window.removeEventListener("tool-used", handleToolUsage);
  }, [limit]);

  return { recentTools, isLoading };
}
