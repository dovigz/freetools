"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Zap } from "lucide-react";
import { ModelSelector } from "./ModelSelector";

interface DualModelSelectorProps {
  // Primary model
  currentProvider: string;
  currentModel: string;
  onModelChange: (provider: string, model: string) => void;
  
  // Secondary model
  secondProvider?: string;
  secondModel?: string;
  onSecondModelChange?: (provider: string, model: string) => void;
  
  // Dual mode state
  isDualMode: boolean;
  onToggleDualMode: (enabled: boolean, secondProvider?: string, secondModel?: string) => void;
  
  // Callbacks
  onOpenSettings?: () => void;
}

export function DualModelSelector({
  currentProvider,
  currentModel,
  onModelChange,
  secondProvider,
  secondModel,
  onSecondModelChange,
  isDualMode,
  onToggleDualMode,
  onOpenSettings,
}: DualModelSelectorProps) {
  const [showSecondSelector, setShowSecondSelector] = useState(false);

  const handleEnableDualMode = () => {
    setShowSecondSelector(true);
  };

  const handleDisableDualMode = () => {
    setShowSecondSelector(false);
    onToggleDualMode(false);
  };

  const handleSecondModelSelect = (provider: string, model: string) => {
    onSecondModelChange?.(provider, model);
    onToggleDualMode(true, provider, model);
    setShowSecondSelector(false);
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Primary Model Selector */}
      <ModelSelector
        currentProvider={currentProvider}
        currentModel={currentModel}
        onModelChange={onModelChange}
        onOpenSettings={onOpenSettings}
      />

      {isDualMode && secondProvider && secondModel ? (
        // Dual Mode Active - Show both selectors
        <>
          <div className="flex items-center space-x-1">
            <Badge variant="secondary" className="text-xs px-2 py-1 bg-purple-100 text-purple-700">
              <Zap className="w-3 h-3 mr-1" />
              VS
            </Badge>
          </div>
          
          <div className="flex items-center space-x-1">
            <ModelSelector
              currentProvider={secondProvider}
              currentModel={secondModel}
              onModelChange={(provider, model) => {
                onSecondModelChange?.(provider, model);
                onToggleDualMode(true, provider, model);
              }}
              onOpenSettings={onOpenSettings}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDisableDualMode}
              className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
              title="Disable dual mode"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </>
      ) : showSecondSelector ? (
        // Selecting Second Model
        <>
          <div className="flex items-center space-x-1">
            <Badge variant="outline" className="text-xs px-2 py-1">
              <Zap className="w-3 h-3 mr-1" />
              VS
            </Badge>
          </div>
          
          <div className="flex items-center space-x-1">
            <ModelSelector
              currentProvider="openai" // Default to first provider
              currentModel="gpt-4o-mini"
              onModelChange={handleSecondModelSelect}
              onOpenSettings={onOpenSettings}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSecondSelector(false)}
              className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
              title="Cancel dual mode"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </>
      ) : (
        // Add Second Model Button
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEnableDualMode}
          className="h-8 px-2 text-gray-500 hover:text-gray-700 border border-dashed border-gray-300 hover:border-gray-400"
          title="Add second model for comparison"
        >
          <Plus className="w-3 h-3 mr-1" />
          <span className="text-xs">Compare</span>
        </Button>
      )}
    </div>
  );
}