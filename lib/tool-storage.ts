"use client";

import { tools } from "@/lib/categories";

export interface ToolUsage {
  id: string;
  lastUsed: number; // timestamp
  useCount: number; // frequency tracking
  isPinned: boolean;
  pinnedOrder?: number; // order within pinned section
}

export interface ToolSettings {
  toolUsage: Record<string, ToolUsage>;
  pinnedTools: string[]; // ordered list of pinned tool IDs
  version: number; // for data migration
  lastUpdated: number;
}

const STORAGE_KEY = "freetools_settings";
const STORAGE_VERSION = 1;

// Safe localStorage operations
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // Handle storage quota exceeded or other errors silently
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore errors
    }
  },
};

// Initialize default tool settings
function createDefaultSettings(): ToolSettings {
  const defaultUsage: Record<string, ToolUsage> = {};

  tools.forEach((tool) => {
    defaultUsage[tool.id] = {
      id: tool.id,
      lastUsed: 0,
      useCount: 0,
      isPinned: false,
    };
  });

  return {
    toolUsage: defaultUsage,
    pinnedTools: [],
    version: STORAGE_VERSION,
    lastUpdated: Date.now(),
  };
}

// Load settings from localStorage
export function loadToolSettings(): ToolSettings {
  const stored = safeLocalStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return createDefaultSettings();
  }

  try {
    const settings: ToolSettings = JSON.parse(stored);

    // Validate version and migrate if needed
    if (settings.version !== STORAGE_VERSION) {
      return migrateSettings(settings);
    }

    // Ensure all current tools exist in storage
    const updatedSettings = { ...settings };
    let needsUpdate = false;

    tools.forEach((tool) => {
      if (!updatedSettings.toolUsage[tool.id]) {
        updatedSettings.toolUsage[tool.id] = {
          id: tool.id,
          lastUsed: 0,
          useCount: 0,
          isPinned: false,
        };
        needsUpdate = true;
      }
    });

    // Remove tools that no longer exist
    Object.keys(updatedSettings.toolUsage).forEach((toolId) => {
      if (!tools.find((t) => t.id === toolId)) {
        delete updatedSettings.toolUsage[toolId];
        updatedSettings.pinnedTools = updatedSettings.pinnedTools.filter(
          (id) => id !== toolId
        );
        needsUpdate = true;
      }
    });

    if (needsUpdate) {
      updatedSettings.lastUpdated = Date.now();
      saveToolSettings(updatedSettings);
    }

    return updatedSettings;
  } catch {
    // If parsing fails, return defaults
    return createDefaultSettings();
  }
}

// Save settings to localStorage
export function saveToolSettings(settings: ToolSettings): void {
  const toSave = { ...settings, lastUpdated: Date.now() };
  safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}

// Migrate settings between versions
function migrateSettings(oldSettings: any): ToolSettings {
  // For now, just return defaults if version mismatch
  // In future versions, add specific migration logic here
  return createDefaultSettings();
}

// Track tool usage
export function trackToolUsage(toolId: string): void {
  const settings = loadToolSettings();

  if (settings.toolUsage[toolId]) {
    settings.toolUsage[toolId].lastUsed = Date.now();
    settings.toolUsage[toolId].useCount += 1;

    saveToolSettings(settings);
  }
}

// Pin/unpin a tool
export function toggleToolPin(toolId: string): boolean {
  const settings = loadToolSettings();

  if (!settings.toolUsage[toolId]) return false;

  const isPinned = settings.toolUsage[toolId].isPinned;

  if (isPinned) {
    // Unpin tool
    settings.toolUsage[toolId].isPinned = false;
    settings.toolUsage[toolId].pinnedOrder = undefined;
    settings.pinnedTools = settings.pinnedTools.filter((id) => id !== toolId);
  } else {
    // Pin tool
    settings.toolUsage[toolId].isPinned = true;
    settings.toolUsage[toolId].pinnedOrder = settings.pinnedTools.length;
    settings.pinnedTools.push(toolId);
  }

  saveToolSettings(settings);
  return !isPinned; // Return new pinned state
}

// Reorder pinned tools
export function reorderPinnedTools(toolIds: string[]): void {
  const settings = loadToolSettings();

  // Update pinnedTools array
  settings.pinnedTools = toolIds.filter(
    (id) => settings.toolUsage[id]?.isPinned
  );

  // Update pinnedOrder for each tool
  settings.pinnedTools.forEach((toolId, index) => {
    if (settings.toolUsage[toolId]) {
      settings.toolUsage[toolId].pinnedOrder = index;
    }
  });

  saveToolSettings(settings);
}

// Calculate usage score for sorting
export function calculateUsageScore(usage: ToolUsage): number {
  if (usage.useCount === 0) return 0;

  const now = Date.now();
  const daysSinceLastUsed = (now - usage.lastUsed) / (1000 * 60 * 60 * 24);

  // Score based on frequency and recency
  // Recent usage gets higher score, frequency multiplies it
  const recencyScore = Math.max(0, 30 - daysSinceLastUsed) / 30; // 30 day window
  const frequencyScore = Math.min(usage.useCount / 10, 1); // Cap at 10 uses

  return recencyScore * frequencyScore;
}

// Get ordered tools (Home -> Pinned -> Recent -> Default)
export function getOrderedTools() {
  const settings = loadToolSettings();
  const toolsMap = new Map(tools.map((t) => [t.id, t]));

  const homeTools = tools.filter((t) => t.id === "home");
  const pinnedTools = settings.pinnedTools
    .map((id) => toolsMap.get(id))
    .filter(Boolean) as typeof tools;

  const unpinnedTools = tools
    .filter((t) => t.id !== "home" && !settings.toolUsage[t.id]?.isPinned)
    .map((tool) => ({
      tool,
      usage: settings.toolUsage[tool.id] || {
        id: tool.id,
        lastUsed: 0,
        useCount: 0,
        isPinned: false,
      },
    }))
    .sort((a, b) => {
      const scoreA = calculateUsageScore(a.usage);
      const scoreB = calculateUsageScore(b.usage);

      if (scoreA !== scoreB) {
        return scoreB - scoreA; // Higher score first
      }

      // If scores are equal, maintain original order
      return tools.indexOf(a.tool) - tools.indexOf(b.tool);
    })
    .map((item) => item.tool);

  return [...homeTools, ...pinnedTools, ...unpinnedTools];
}

// Get recent tools (for homepage)
export function getRecentTools(limit: number = 6): typeof tools {
  const settings = loadToolSettings();

  return tools
    .filter((t) => t.id !== "home" && settings.toolUsage[t.id]?.useCount > 0)
    .map((tool) => ({
      tool,
      usage: settings.toolUsage[tool.id],
    }))
    .sort((a, b) => b.usage.lastUsed - a.usage.lastUsed)
    .slice(0, limit)
    .map((item) => item.tool);
}

// Get pinned tools
export function getPinnedTools(): typeof tools {
  const settings = loadToolSettings();
  const toolsMap = new Map(tools.map((t) => [t.id, t]));

  return settings.pinnedTools
    .map((id) => toolsMap.get(id))
    .filter(Boolean) as typeof tools;
}

// Reset to defaults
export function resetToolSettings(): void {
  safeLocalStorage.removeItem(STORAGE_KEY);
}

// Get tool statistics
export function getToolStatistics() {
  const settings = loadToolSettings();

  const totalUsage = Object.values(settings.toolUsage).reduce(
    (sum, usage) => sum + usage.useCount,
    0
  );

  const mostUsedTools = tools
    .filter((t) => t.id !== "home")
    .map((tool) => ({
      tool,
      usage: settings.toolUsage[tool.id] || {
        id: tool.id,
        lastUsed: 0,
        useCount: 0,
        isPinned: false,
      },
    }))
    .sort((a, b) => b.usage.useCount - a.usage.useCount)
    .slice(0, 5);

  return {
    totalUsage,
    pinnedCount: settings.pinnedTools.length,
    mostUsedTools,
    lastUpdated: settings.lastUpdated,
  };
}
