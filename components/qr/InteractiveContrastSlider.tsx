"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  adjustColorForContrast,
  getMaxAchievableContrast,
} from "@/lib/color-adjustment";
import { calculateContrastRatio, getContrastLevel } from "@/lib/contrast-utils";
import { AlertTriangle, CheckCircle, RefreshCcw, XCircle } from "lucide-react";

interface InteractiveContrastSliderProps {
  foregroundColor: string;
  backgroundColor: string;
  onColorChange: (newForeground: string, newBackground: string) => void;
  onSwapColors?: () => void;
  className?: string;
}

export function InteractiveContrastSlider({
  foregroundColor,
  backgroundColor,
  onColorChange,
  onSwapColors,
  className = "",
}: InteractiveContrastSliderProps) {
  const bgColor = backgroundColor;
  const currentRatio = calculateContrastRatio(foregroundColor, bgColor);
  const contrastLevel = getContrastLevel(
    currentRatio,
    foregroundColor,
    backgroundColor
  );
  // Get the maximum achievable contrast for both adjustment modes
  const maxForegroundAchievable = getMaxAchievableContrast(
    foregroundColor,
    bgColor,
    true
  );
  const maxBackgroundAchievable = getMaxAchievableContrast(
    foregroundColor,
    bgColor,
    false
  );
  const maxAchievable = Math.max(
    maxForegroundAchievable,
    maxBackgroundAchievable
  );

  const getIcon = () => {
    if (contrastLevel.isInverted) return <XCircle className="w-4 h-4" />;
    if (contrastLevel.level === "aaa")
      return <CheckCircle className="w-4 h-4" />;
    if (contrastLevel.level === "aa")
      return <CheckCircle className="w-4 h-4" />;
    if (contrastLevel.level === "fail" || contrastLevel.level === "aa-large")
      return <AlertTriangle className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const getStatusColor = () => {
    if (contrastLevel.isInverted) return "text-red-600 dark:text-red-400";
    if (contrastLevel.level === "aaa")
      return "text-green-600 dark:text-green-400";
    if (contrastLevel.level === "aa")
      return "text-green-600 dark:text-green-400";
    if (contrastLevel.level === "fail" || contrastLevel.level === "aa-large")
      return "text-orange-600 dark:text-orange-400";
    return "text-blue-600 dark:text-blue-400";
  };

  const getProgressColor = () => {
    if (contrastLevel.isInverted) return "bg-red-500";
    if (contrastLevel.level === "aaa") return "bg-green-500";
    if (contrastLevel.level === "aa") return "bg-green-500";
    if (contrastLevel.level === "fail" || contrastLevel.level === "aa-large")
      return "bg-orange-500";
    return "bg-blue-500";
  };

  const getProgressPosition = () => {
    const maxRatio = 10;
    return Math.min((currentRatio / maxRatio) * 100, 100);
  };

  const handleQuickRatio = (ratio: number) => {
    try {
      // Try both foreground and background adjustment to find the best result
      const adjustedForeground = adjustColorForContrast(
        foregroundColor,
        bgColor,
        ratio,
        true
      );
      const adjustedBackground = adjustColorForContrast(
        foregroundColor,
        bgColor,
        ratio,
        false
      );

      // Calculate which adjustment gets closer to the target ratio
      const fgRatio = calculateContrastRatio(adjustedForeground, bgColor);
      const bgRatio = calculateContrastRatio(
        foregroundColor,
        adjustedBackground
      );

      const fgDiff = Math.abs(fgRatio - ratio);
      const bgDiff = Math.abs(bgRatio - ratio);

      // Use whichever adjustment gets closer to the target
      if (fgDiff <= bgDiff) {
        onColorChange(adjustedForeground, backgroundColor);
      } else {
        onColorChange(foregroundColor, adjustedBackground);
      }
    } catch (error) {
      console.warn("Failed to adjust color:", error);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Live Error Display for Inverted Colors */}
      {contrastLevel.isInverted && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                ❌ Inverted Colors Detected!
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                QR scanners expect dark dots on light backgrounds.
              </p>
              {onSwapColors && (
                <Button
                  onClick={onSwapColors}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Fix Colors
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contrast Status and Controls */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={getStatusColor()}>{getIcon()}</div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Contrast: {currentRatio.toFixed(2)}:1
            </span>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor()}`}
          >
            {contrastLevel.level.toUpperCase()}
          </span>
        </div>

        {/* Progress Bar with markers */}
        <div className="relative">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${getProgressPosition()}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>1:1</span>
            <span className="text-yellow-600">3:1</span>
            <span className="text-green-600">4.5:1</span>
            <span className="text-green-700">7:1</span>
            <span>10:1+</span>
          </div>
        </div>

        {/* Quick Contrast Fixes */}
        <div className="space-y-3 ">
          <div className="text-center">
            <Label className="text-sm font-medium">Quick Contrast Fixes</Label>
          </div>

          {/* Quick Ratio Buttons */}
          <div className="grid grid-cols-4 gap-1">
            {[3, 4.5, 7, Math.min(maxAchievable, 10)].map((ratio) => (
              <Button
                key={ratio}
                variant={
                  Math.abs(currentRatio - ratio) < 0.2 ? "default" : "outline"
                }
                size="sm"
                onClick={() => handleQuickRatio(ratio)}
                disabled={ratio > maxAchievable}
                className="text-xs py-1 h-7"
              >
                {ratio === 3 && "3:1"}
                {ratio === 4.5 && "AA"}
                {ratio === 7 && "AAA"}
                {ratio === Math.min(maxAchievable, 10) &&
                  ratio !== 3 &&
                  ratio !== 4.5 &&
                  ratio !== 7 &&
                  "MAX"}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
