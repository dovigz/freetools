"use client";

import { Button } from "@/components/ui/button";
import {
  calculateContrastRatio,
  getContrastLevel,
  suggestBetterColors,
} from "@/lib/contrast-utils";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCcw,
  XCircle,
} from "lucide-react";

interface ContrastIndicatorProps {
  foregroundColor: string;
  backgroundColor: string;
  className?: string;
  onSwapColors?: () => void;
}

export function ContrastIndicator({
  foregroundColor,
  backgroundColor,
  className = "",
  onSwapColors,
}: ContrastIndicatorProps) {
  // Handle transparent background by using white as default
  const bgColor =
    backgroundColor === "transparent" ? "#ffffff" : backgroundColor;
  const contrastRatio = calculateContrastRatio(foregroundColor, bgColor);
  const contrastLevel = getContrastLevel(
    contrastRatio,
    foregroundColor,
    backgroundColor
  );
  const suggestions = suggestBetterColors(foregroundColor, bgColor);

  const getIndicatorColor = () => {
    switch (contrastLevel.level) {
      case "aaa":
        return "bg-green-500";
      case "aa":
        return "bg-green-400";
      case "aa-large":
        return "bg-yellow-500";
      case "inverted":
        return "bg-orange-500";
      case "fail":
        return "bg-red-500";
    }
  };

  const getTextColor = () => {
    switch (contrastLevel.level) {
      case "aaa":
      case "aa":
        return "text-green-700 dark:text-green-400";
      case "aa-large":
        return "text-yellow-700 dark:text-yellow-400";
      case "inverted":
        return "text-orange-700 dark:text-orange-400";
      case "fail":
        return "text-red-700 dark:text-red-400";
    }
  };

  const getIcon = () => {
    switch (contrastLevel.level) {
      case "aaa":
      case "aa":
        return <CheckCircle className="w-4 h-4" />;
      case "aa-large":
        return <AlertTriangle className="w-4 h-4" />;
      case "inverted":
        return <XCircle className="w-4 h-4" />;
      case "fail":
        return <XCircle className="w-4 h-4" />;
    }
  };

  // Calculate position on the scale (0-100%)
  const getProgressPosition = () => {
    // Scale from 1 to 10 for better visualization
    const maxRatio = 10;
    return Math.min((contrastRatio / maxRatio) * 100, 100);
  };

  return (
    <details
      className={`bg-gray-50 dark:bg-gray-800 rounded-lg border ${className}`}
    >
      <summary className="p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
        <div className="flex items-center gap-3">
          <div className={getTextColor()}>{getIcon()}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Contrast: {contrastRatio.toFixed(2)}:1
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium bg-opacity-20 ${getTextColor()}`}
              >
                {contrastLevel.level.toUpperCase()}
              </span>
            </div>

            {/* Compact Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${getIndicatorColor()}`}
                style={{ width: `${getProgressPosition()}%` }}
              />
            </div>
          </div>
        </div>
      </summary>

      <div className="px-3 pb-3 pt-1 space-y-3">
        {/* Detailed Progress Bar with markers */}
        <div className="relative">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getIndicatorColor()}`}
              style={{ width: `${getProgressPosition()}%` }}
            />
          </div>

          {/* Scale markers */}
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>1:1</span>
            <span className="text-yellow-600">3:1</span>
            <span className="text-green-600">4.5:1</span>
            <span className="text-green-700">7:1</span>
            <span>10:1+</span>
          </div>
        </div>

        {/* Status Message */}
        <div className={`text-sm ${getTextColor()}`}>
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">{contrastLevel.description}</p>
              {contrastLevel.isInverted ? (
                <div>
                  <p className="mb-3">
                    ❌ Your QR code has inverted colors! QR scanners expect dark
                    dots on a light background. This pattern will likely be read
                    incorrectly or fail to scan entirely.
                  </p>
                  {onSwapColors && (
                    <Button
                      onClick={onSwapColors}
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <RefreshCcw className="w-4 h-4 mr-2" />
                      Swap Colors
                    </Button>
                  )}
                </div>
              ) : contrastLevel.meetsMinimum ? (
                <p>
                  ✅ Your QR code meets WCAG 2.1 minimum contrast requirements
                  and should scan well.
                </p>
              ) : (
                <p>
                  ⚠️ Your QR code may be difficult to scan due to low contrast.
                  Consider improving the contrast for better accessibility and
                  readability.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Suggestions */}
        {suggestions.suggestions.length > 0 && (
          <div className="text-sm">
            <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">
              {suggestions.message}
            </p>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              {suggestions.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-1">
                  <span className="text-blue-500">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Technical Details */}
        <div className="text-xs text-gray-500 space-y-1 border-t pt-2">
          <p>
            <strong>Technical Details:</strong>
          </p>
          <p>• Foreground (QR dots): {foregroundColor}</p>
          <p>
            • Background:{" "}
            {backgroundColor === "transparent"
              ? "transparent (treated as white)"
              : backgroundColor}
          </p>
          <p>• Minimum ratio for normal text: 4.5:1</p>
          <p>• Minimum ratio for large text: 3:1</p>
          <p>• Enhanced contrast (AAA): 7:1</p>
        </div>
      </div>
    </details>
  );
}
