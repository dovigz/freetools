/**
 * Color adjustment utilities for achieving target contrast ratios
 */

import { calculateContrastRatio, hexToRgb } from "./contrast-utils";

export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

/**
 * Convert hex color to RGB
 */
export function hexToRgbValues(hex: string): RGB | null {
  const result = hexToRgb(hex);
  return result ? { r: result.r, g: result.g, b: result.b } : null;
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Convert hex to HSL
 */
export function hexToHsl(hex: string): HSL | null {
  const rgb = hexToRgbValues(hex);
  if (!rgb) return null;
  return rgbToHsl(rgb.r, rgb.g, rgb.b);
}

/**
 * Convert HSL to hex
 */
export function hslToHex(h: number, s: number, l: number): string {
  const rgb = hslToRgb(h, s, l);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

/**
 * Adjust color to achieve target contrast ratio
 * This algorithm works by adjusting the lightness of the foreground color
 * while preserving hue and saturation as much as possible
 */
export function adjustColorForContrast(
  foregroundColor: string,
  backgroundColor: string,
  targetContrastRatio: number,
  adjustForeground: boolean = true
): string {
  const bgColor =
    backgroundColor === "transparent" ? "#ffffff" : backgroundColor;

  if (adjustForeground) {
    return adjustForegroundColor(foregroundColor, bgColor, targetContrastRatio);
  } else {
    return adjustBackgroundColor(foregroundColor, bgColor, targetContrastRatio);
  }
}

/**
 * Adjust foreground color to meet target contrast ratio
 */
function adjustForegroundColor(
  foregroundColor: string,
  backgroundColor: string,
  targetContrastRatio: number
): string {
  const fgHsl = hexToHsl(foregroundColor);
  if (!fgHsl) return foregroundColor;

  // Binary search for the right lightness value
  let minL = 0;
  let maxL = 100;
  let bestL = fgHsl.l;
  let bestContrast = calculateContrastRatio(foregroundColor, backgroundColor);
  let iterations = 0;
  const maxIterations = 50;

  while (
    iterations < maxIterations &&
    Math.abs(bestContrast - targetContrastRatio) > 0.1
  ) {
    const testL = Math.round((minL + maxL) / 2);
    const testColor = hslToHex(fgHsl.h, fgHsl.s, testL);
    const testContrast = calculateContrastRatio(testColor, backgroundColor);

    if (
      Math.abs(testContrast - targetContrastRatio) <
      Math.abs(bestContrast - targetContrastRatio)
    ) {
      bestContrast = testContrast;
      bestL = testL;
    }

    if (testContrast < targetContrastRatio) {
      // Need more contrast - go darker or lighter depending on background
      const bgHsl = hexToHsl(backgroundColor);
      if (bgHsl && bgHsl.l > 50) {
        // Light background, make foreground darker
        maxL = testL - 1;
      } else {
        // Dark background, make foreground lighter
        minL = testL + 1;
      }
    } else {
      // Too much contrast - go lighter or darker depending on background
      const bgHsl = hexToHsl(backgroundColor);
      if (bgHsl && bgHsl.l > 50) {
        // Light background, make foreground lighter
        minL = testL + 1;
      } else {
        // Dark background, make foreground darker
        maxL = testL - 1;
      }
    }

    iterations++;
  }

  return hslToHex(fgHsl.h, fgHsl.s, bestL);
}

/**
 * Adjust background color to meet target contrast ratio
 */
function adjustBackgroundColor(
  foregroundColor: string,
  backgroundColor: string,
  targetContrastRatio: number
): string {
  const bgHsl = hexToHsl(backgroundColor);
  if (!bgHsl) return backgroundColor;

  // Binary search for the right lightness value
  let minL = 0;
  let maxL = 100;
  let bestL = bgHsl.l;
  let bestContrast = calculateContrastRatio(foregroundColor, backgroundColor);
  let iterations = 0;
  const maxIterations = 50;

  while (
    iterations < maxIterations &&
    Math.abs(bestContrast - targetContrastRatio) > 0.1
  ) {
    const testL = Math.round((minL + maxL) / 2);
    const testColor = hslToHex(bgHsl.h, bgHsl.s, testL);
    const testContrast = calculateContrastRatio(foregroundColor, testColor);

    if (
      Math.abs(testContrast - targetContrastRatio) <
      Math.abs(bestContrast - targetContrastRatio)
    ) {
      bestContrast = testContrast;
      bestL = testL;
    }

    if (testContrast < targetContrastRatio) {
      // Need more contrast
      const fgHsl = hexToHsl(foregroundColor);
      if (fgHsl && fgHsl.l > 50) {
        // Light foreground, make background darker
        maxL = testL - 1;
      } else {
        // Dark foreground, make background lighter
        minL = testL + 1;
      }
    } else {
      // Too much contrast
      const fgHsl = hexToHsl(foregroundColor);
      if (fgHsl && fgHsl.l > 50) {
        // Light foreground, make background lighter
        minL = testL + 1;
      } else {
        // Dark foreground, make background darker
        maxL = testL - 1;
      }
    }

    iterations++;
  }

  return hslToHex(bgHsl.h, bgHsl.s, bestL);
}

/**
 * Generate a series of colors that achieve different contrast ratios
 * This is useful for slider implementations
 */
export function generateContrastGradient(
  foregroundColor: string,
  backgroundColor: string,
  minRatio: number = 1,
  maxRatio: number = 10,
  steps: number = 100,
  adjustForeground: boolean = true
): Array<{ ratio: number; color: string }> {
  const gradient: Array<{ ratio: number; color: string }> = [];

  for (let i = 0; i <= steps; i++) {
    const ratio = minRatio + (maxRatio - minRatio) * (i / steps);
    const adjustedColor = adjustColorForContrast(
      foregroundColor,
      backgroundColor,
      ratio,
      adjustForeground
    );

    gradient.push({
      ratio: Math.round(ratio * 100) / 100,
      color: adjustedColor,
    });
  }

  return gradient;
}

/**
 * Find the closest achievable contrast ratio
 * Some color combinations can't achieve very high contrast ratios
 */
export function getMaxAchievableContrast(
  foregroundColor: string,
  backgroundColor: string,
  adjustForeground: boolean = true
): number {
  const bgColor =
    backgroundColor === "transparent" ? "#ffffff" : backgroundColor;

  if (adjustForeground) {
    const fgHsl = hexToHsl(foregroundColor);
    if (!fgHsl) return calculateContrastRatio(foregroundColor, bgColor);

    // Try pure black and pure white
    const blackContrast = calculateContrastRatio("#000000", bgColor);
    const whiteContrast = calculateContrastRatio("#ffffff", bgColor);

    return Math.max(blackContrast, whiteContrast);
  } else {
    const fgColor = foregroundColor;

    // Try pure black and pure white backgrounds
    const blackBgContrast = calculateContrastRatio(fgColor, "#000000");
    const whiteBgContrast = calculateContrastRatio(fgColor, "#ffffff");

    return Math.max(blackBgContrast, whiteBgContrast);
  }
}
