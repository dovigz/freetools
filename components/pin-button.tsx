"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface PinButtonProps {
  toolId: string;
  isPinned: boolean;
  isVisible: boolean;
  onTogglePin: (toolId: string) => void;
  className?: string;
}

export function PinButton({
  toolId,
  isPinned,
  isVisible,
  onTogglePin,
  className,
}: PinButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onTogglePin(toolId);
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={handleClick}
      title={isPinned ? `Unpin ${toolId}` : `Pin ${toolId}`}
      className={cn(
        "absolute right-2 top-1/2 -translate-y-1/2 z-10",
        "flex items-center justify-center",
        "w-5 h-5 rounded-sm",
        "bg-gray-100 hover:bg-gray-200",
        "border border-gray-300",
        "transition-all duration-150",
        "text-xs",
        "group-hover:opacity-100",
        isPinned
          ? "opacity-100 bg-blue-100 border-blue-300 hover:bg-blue-200"
          : "opacity-0",
        className
      )}
    >
      {isPinned ? (
        <span className="text-blue-600">📌</span>
      ) : (
        <span className="text-gray-600">📌</span>
      )}
    </button>
  );
}

// Smaller version for collapsed sidebar
export function PinButtonCompact({
  toolId,
  isPinned,
  isVisible,
  onTogglePin,
  className,
}: PinButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onTogglePin(toolId);
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={handleClick}
      title={isPinned ? `Unpin ${toolId}` : `Pin ${toolId}`}
      className={cn(
        "absolute -right-1 -top-1 z-10",
        "flex items-center justify-center",
        "w-3 h-3 rounded-full",
        "bg-white border border-gray-300 shadow-sm",
        "transition-all duration-150",
        "text-[10px]",
        isPinned ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        className
      )}
    >
      <span className={isPinned ? "text-blue-600" : "text-gray-600"}>📌</span>
    </button>
  );
}
