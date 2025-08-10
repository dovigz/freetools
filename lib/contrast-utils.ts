/**
 * Contrast utility functions for WCAG compliance
 * Based on WCAG 2.1 contrast ratio calculations
 */

/**
 * Converts hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculates relative luminance of a color
 * Formula from WCAG 2.1 guidelines
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculates contrast ratio between two colors
 * Returns a value between 1 and 21
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 1;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Checks if foreground is darker than background (correct QR pattern)
 */
export function isCorrectQRPattern(
  foregroundColor: string,
  backgroundColor: string
): boolean {
  const fgRgb = hexToRgb(foregroundColor);
  const bgRgb = hexToRgb(
    backgroundColor === "transparent" ? "#ffffff" : backgroundColor
  );

  if (!fgRgb || !bgRgb) return true; // Default to true if can't parse

  const fgLuminance = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

  // QR codes need dark foreground (dots) on light background
  return fgLuminance < bgLuminance;
}

/**
 * Gets contrast level based on WCAG 2.1 guidelines and QR pattern correctness
 */
export function getContrastLevel(
  ratio: number,
  foregroundColor: string,
  backgroundColor: string
): {
  level: "fail" | "inverted" | "aa-large" | "aa" | "aaa";
  description: string;
  meetsMinimum: boolean;
  isInverted: boolean;
} {
  const isInverted = !isCorrectQRPattern(foregroundColor, backgroundColor);

  if (isInverted) {
    return {
      level: "inverted",
      description: "Inverted Pattern - Wrong QR orientation",
      meetsMinimum: false,
      isInverted: true,
    };
  }

  if (ratio >= 7) {
    return {
      level: "aaa",
      description: "Excellent - Perfect for scanning",
      meetsMinimum: true,
      isInverted: false,
    };
  } else if (ratio >= 4.5) {
    return {
      level: "aa",
      description: "Good - Reliable scanning",
      meetsMinimum: true,
      isInverted: false,
    };
  } else if (ratio >= 3) {
    return {
      level: "aa-large",
      description: "Fair - May have scanning issues",
      meetsMinimum: false,
      isInverted: false,
    };
  } else {
    return {
      level: "fail",
      description: "Poor - Difficult to scan",
      meetsMinimum: false,
      isInverted: false,
    };
  }
}

/**
 * Suggests better colors for improved contrast and correct QR pattern
 */
export function suggestBetterColors(
  foreground: string,
  background: string
): {
  suggestions: string[];
  message: string;
} {
  const currentRatio = calculateContrastRatio(foreground, background);
  const isInverted = !isCorrectQRPattern(foreground, background);

  if (isInverted) {
    return {
      suggestions: [
        "Swap colors: Use current background as dots and current dots as background",
        "Use black (#000000) dots on white (#ffffff) background",
        "Try dark blue (#000080) dots on light blue (#e3f2fd) background",
        "Use dark green (#1b5e20) dots on light green (#e8f5e8) background",
      ],
      message:
        "🔄 QR Pattern Inverted! QR codes need DARK dots on LIGHT background:",
    };
  }

  if (currentRatio >= 4.5) {
    return {
      suggestions: [],
      message: "Current contrast is good!",
    };
  }

  const suggestions = [];
  let message = "Try these combinations for better contrast:";

  // Always suggest classic high contrast combinations
  if (
    background === "transparent" ||
    background === "#ffffff" ||
    background.toLowerCase() === "#fff"
  ) {
    suggestions.push("Use black (#000000) dots on white background");
    suggestions.push("Try dark blue (#000080) dots");
    suggestions.push("Try dark green (#008000) dots");
  } else {
    suggestions.push("Use black (#000000) dots on white (#ffffff) background");
    suggestions.push(
      "Try dark navy (#001f3f) dots on light gray (#f5f5f5) background"
    );
    suggestions.push(
      "Use dark brown (#3e2723) dots on cream (#fff8e1) background"
    );
  }

  if (currentRatio < 3) {
    message = "Poor contrast detected! " + message;
  }

  return { suggestions, message };
}
