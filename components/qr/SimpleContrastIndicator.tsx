"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

interface SimpleContrastIndicatorProps {
  foregroundColor: string;
  backgroundColor: string;
  className?: string;
  onSwapColors?: () => void;
}

export function SimpleContrastIndicator({
  foregroundColor,
  backgroundColor,
  className = "",
  onSwapColors,
}: SimpleContrastIndicatorProps) {
  // Handle transparent background by using white as default
  const bgColor =
    backgroundColor === "transparent" ? "#ffffff" : backgroundColor;
  const contrastRatio = calculateContrastRatio(foregroundColor, bgColor);
  const contrastLevel = getContrastLevel(
    contrastRatio,
    foregroundColor,
    backgroundColor
  );
  const suggestions = suggestBetterColors(foregroundColor, backgroundColor);

  const getIcon = () => {
    if (contrastLevel.isInverted) return <XCircle className="w-4 h-4" />;
    if (contrastLevel.level === "aaa")
      return <CheckCircle className="w-4 h-4" />;
    if (contrastLevel.level === "aa")
      return <CheckCircle className="w-4 h-4" />;
    if (contrastLevel.level === "fail")
      return <AlertTriangle className="w-4 h-4" />;
    return <Info className="w-4 h-4" />;
  };

  const getTextColor = () => {
    if (contrastLevel.isInverted) return "text-red-600 dark:text-red-400";
    if (contrastLevel.level === "aaa")
      return "text-green-600 dark:text-green-400";
    if (contrastLevel.level === "aa")
      return "text-green-600 dark:text-green-400";
    if (contrastLevel.level === "fail")
      return "text-orange-600 dark:text-orange-400";
    return "text-blue-600 dark:text-blue-400";
  };

  const getIndicatorColor = () => {
    if (contrastLevel.isInverted) return "bg-red-500";
    if (contrastLevel.level === "aaa") return "bg-green-500";
    if (contrastLevel.level === "aa") return "bg-green-500";
    if (contrastLevel.level === "fail") return "bg-orange-500";
    return "bg-blue-500";
  };

  // Calculate position on the scale (0-100%)
  const getProgressPosition = () => {
    const maxRatio = 10;
    return Math.min((contrastRatio / maxRatio) * 100, 100);
  };

  return (
    <div className={`space-y-3 ${className}`}>
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
                QR scanners expect dark dots on light backgrounds. This will
                likely fail to scan.
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

      {/* Compact Contrast Bar */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={getTextColor()}>{getIcon()}</div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Contrast: {contrastRatio.toFixed(2)}:1
            </span>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                <Info className="w-3 h-3 mr-1" />
                Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className={getTextColor()}>{getIcon()}</div>
                  Contrast Analysis
                </DialogTitle>
                <DialogDescription>
                  Understanding your QR code&apos;s contrast and readability
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Detailed Progress Bar with markers */}
                <div className="relative">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${getIndicatorColor()}`}
                      style={{ width: `${getProgressPosition()}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>1:1</span>
                    <span className="text-yellow-600">3:1</span>
                    <span className="text-green-600">4.5:1</span>
                    <span className="text-green-700">7:1</span>
                    <span>10:1+</span>
                  </div>
                </div>

                {/* Status Message */}
                <div className={`text-sm ${getTextColor()}`}>
                  <p className="font-medium mb-1">
                    {contrastLevel.description}
                  </p>
                  {contrastLevel.meetsMinimum ? (
                    <p>
                      ✅ Your QR code meets minimum contrast requirements and
                      should scan well.
                    </p>
                  ) : (
                    <p>
                      ⚠️ Your QR code may be difficult to scan due to low
                      contrast.
                    </p>
                  )}
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
                <div className="text-xs text-gray-500 space-y-1 border-t pt-3">
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
                  <p>• Enhanced contrast (AAA): 7:1</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Simple Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getIndicatorColor()}`}
            style={{ width: `${getProgressPosition()}%` }}
          />
        </div>
      </div>
    </div>
  );
}
