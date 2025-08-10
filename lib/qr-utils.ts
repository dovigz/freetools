import { saveAs } from "file-saver";
import QRCodeStyling, { type Options as QRCodeOptions } from "qr-code-styling";

// QR Code export utilities
export const downloadQRCode = async (
  qrInstance: QRCodeStyling | null,
  filename: string,
  format: "png" | "jpg" | "svg" = "png"
) => {
  if (!qrInstance) return;

  try {
    if (format === "svg") {
      const svgString = await qrInstance.getRawData("svg");
      if (svgString) {
        const blob = new Blob([svgString], { type: "image/svg+xml" });
        saveAs(blob, `${filename}.svg`);
      }
    } else {
      const blob = await qrInstance.getRawData(format);
      if (blob) {
        saveAs(blob, `${filename}.${format}`);
      }
    }
  } catch (error) {
    console.error("Error downloading QR code:", error);
    throw new Error(`Failed to download QR code as ${format.toUpperCase()}`);
  }
};

// Copy QR code to clipboard
export const copyQRToClipboard = async (qrInstance: QRCodeStyling | null) => {
  if (!qrInstance) return false;

  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const blob = await qrInstance.getRawData("png");
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("Error copying to clipboard:", error);
    return false;
  }
};

// QR Code presets
export interface QRPreset {
  id: string;
  name: string;
  description: string;
  options: Partial<QRCodeOptions>;
  preview?: string;
}

export interface EmojiPreset {
  id: string;
  emoji: string;
  name: string;
  description: string;
  config: {
    dotsColor: string;
    cornersSquareColor: string;
    cornersDotColor: string;
    backgroundColor: string;
    frameColor: string;
    textColor: string;
    dotsType: string;
    cornersSquareType: string;
    cornersDotType: string;
    logo?: string;
  };
}

export const emojiPresets: EmojiPreset[] = [
  // Fire & Heat
  {
    id: "fire",
    emoji: "🔥",
    name: "Fire",
    description: "Hot orange and red theme",
    config: {
      dotsColor: "#ff4500",
      cornersSquareColor: "#ff6347",
      cornersDotColor: "#ff0000",
      backgroundColor: "#ffe4e1",
      frameColor: "#8b0000",
      textColor: "#ffffff",
      dotsType: "rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "🔥",
    },
  },
  {
    id: "sun",
    emoji: "☀️",
    name: "Sun",
    description: "Bright sunny yellow",
    config: {
      dotsColor: "#ffb700",
      cornersSquareColor: "#ff8c00",
      cornersDotColor: "#ffa500",
      backgroundColor: "#fffacd",
      frameColor: "#ff6600",
      textColor: "#000000",
      dotsType: "rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "☀️",
    },
  },
  {
    id: "volcano",
    emoji: "🌋",
    name: "Volcano",
    description: "Molten lava theme with contrast-safe colors",
    config: {
      dotsColor: "#8b0000",
      cornersSquareColor: "#9c1d1d",
      cornersDotColor: "#660000",
      backgroundColor: "#ffb366",
      frameColor: "#932800",
      textColor: "#000000",
      dotsType: "square",
      cornersSquareType: "square",
      cornersDotType: "square",
      logo: "🌋",
    },
  },

  {
    id: "chili",
    emoji: "🌶️",
    name: "Chili",
    description: "Spicy red hot",
    config: {
      dotsColor: "#ff0000",
      cornersSquareColor: "#dc143c",
      cornersDotColor: "#8b0000",
      backgroundColor: "#fff0f0",
      frameColor: "#b22222",
      textColor: "#ffffff",
      dotsType: "dots",
      cornersSquareType: "dot",
      cornersDotType: "dot",
      logo: "🌶️",
    },
  },
  {
    id: "hot",
    emoji: "🥵",
    name: "Hot",
    description: "Extreme heat theme",
    config: {
      dotsColor: "#ff2500",
      cornersSquareColor: "#ff6347",
      cornersDotColor: "#ff4500",
      backgroundColor: "#ffe4b5",
      frameColor: "#8b4513",
      textColor: "#ffffff",
      dotsType: "classy",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "🥵",
    },
  },

  // Water & Ocean
  {
    id: "ocean",
    emoji: "🌊",
    name: "Ocean",
    description: "Cool blue wave theme",
    config: {
      dotsColor: "#1e90ff",
      cornersSquareColor: "#00bfff",
      cornersDotColor: "#4682b4",
      backgroundColor: "#e0f6ff",
      frameColor: "#003d6b",
      textColor: "#ffffff",
      dotsType: "rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "🌊",
    },
  },
  {
    id: "water",
    emoji: "💧",
    name: "Water",
    description: "Pure water droplet",
    config: {
      dotsColor: "#00ced1",
      cornersSquareColor: "#40e0d0",
      cornersDotColor: "#20b2aa",
      backgroundColor: "#f0ffff",
      frameColor: "#008b8b",
      textColor: "#ffffff",
      dotsType: "dots",
      cornersSquareType: "dot",
      cornersDotType: "dot",
      logo: "💧",
    },
  },
  {
    id: "fish",
    emoji: "🐟",
    name: "Fish",
    description: "Ocean aquatic theme",
    config: {
      dotsColor: "#4169e1",
      cornersSquareColor: "#6495ed",
      cornersDotColor: "#00bfff",
      backgroundColor: "#e6f3ff",
      frameColor: "#1e90ff",
      textColor: "#ffffff",
      dotsType: "extra-rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "🐟",
    },
  },
  {
    id: "whale",
    emoji: "🐋",
    name: "Whale",
    description: "Deep ocean blue",
    config: {
      dotsColor: "#191970",
      cornersSquareColor: "#4682b4",
      cornersDotColor: "#6495ed",
      backgroundColor: "#f0f8ff",
      frameColor: "#000080",
      textColor: "#ffffff",
      dotsType: "square",
      cornersSquareType: "square",
      cornersDotType: "square",
      logo: "🐋",
    },
  },
  {
    id: "dolphin",
    emoji: "🐬",
    name: "Dolphin",
    description: "Playful ocean theme",
    config: {
      dotsColor: "#4682b4",
      cornersSquareColor: "#87ceeb",
      cornersDotColor: "#5f9ea0",
      backgroundColor: "#e0f6ff",
      frameColor: "#2f4f4f",
      textColor: "#ffffff",
      dotsType: "classy-rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "🐬",
    },
  },

  // Nature & Plants
  {
    id: "nature",
    emoji: "🌿",
    name: "Nature",
    description: "Fresh green natural theme",
    config: {
      dotsColor: "#228b22",
      cornersSquareColor: "#32cd32",
      cornersDotColor: "#006400",
      backgroundColor: "#f0fff0",
      frameColor: "#2d5016",
      textColor: "#ffffff",
      dotsType: "rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "🌿",
    },
  },
  {
    id: "tree",
    emoji: "🌳",
    name: "Tree",
    description: "Forest green theme",
    config: {
      dotsColor: "#2e8b57",
      cornersSquareColor: "#3cb371",
      cornersDotColor: "#228b22",
      backgroundColor: "#f5fffa",
      frameColor: "#006400",
      textColor: "#ffffff",
      dotsType: "dots",
      cornersSquareType: "dot",
      cornersDotType: "dot",
      logo: "🌳",
    },
  },
  {
    id: "leaf",
    emoji: "🍃",
    name: "Leaf",
    description: "Light green breeze",
    config: {
      dotsColor: "#90ee90",
      cornersSquareColor: "#98fb98",
      cornersDotColor: "#32cd32",
      backgroundColor: "#f0fff0",
      frameColor: "#228b22",
      textColor: "#ffffff",
      dotsType: "extra-rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "🍃",
    },
  },
  {
    id: "cactus",
    emoji: "🌵",
    name: "Cactus",
    description: "Desert green theme",
    config: {
      dotsColor: "#6b8e23",
      cornersSquareColor: "#9acd32",
      cornersDotColor: "#556b2f",
      backgroundColor: "#f5f5dc",
      frameColor: "#8fbc8f",
      textColor: "#000000",
      dotsType: "square",
      cornersSquareType: "square",
      cornersDotType: "square",
      logo: "🌵",
    },
  },
  {
    id: "shamrock",
    emoji: "🍀",
    name: "Shamrock",
    description: "Lucky green theme",
    config: {
      dotsColor: "#32cd32",
      cornersSquareColor: "#90ee90",
      cornersDotColor: "#228b22",
      backgroundColor: "#f0fff0",
      frameColor: "#006400",
      textColor: "#ffffff",
      dotsType: "classy",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "🍀",
    },
  },

  // Sky & Space
  {
    id: "space",
    emoji: "🚀",
    name: "Space",
    description: "Cosmic purple and blue",
    config: {
      dotsColor: "#4b0082",
      cornersSquareColor: "#6a5acd",
      cornersDotColor: "#9370db",
      backgroundColor: "#191970",
      frameColor: "#000000",
      textColor: "#ffffff",
      dotsType: "dots",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "🚀",
    },
  },
  {
    id: "star",
    emoji: "⭐",
    name: "Star",
    description: "Golden starlight",
    config: {
      dotsColor: "#ffd700",
      cornersSquareColor: "#ffff00",
      cornersDotColor: "#ffa500",
      backgroundColor: "#191970",
      frameColor: "#4b0082",
      textColor: "#ffd700",
      dotsType: "rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "⭐",
    },
  },
  {
    id: "moon",
    emoji: "🌙",
    name: "Moon",
    description: "Moonlight silver theme",
    config: {
      dotsColor: "#c0c0c0",
      cornersSquareColor: "#d3d3d3",
      cornersDotColor: "#a9a9a9",
      backgroundColor: "#191970",
      frameColor: "#2f2f2f",
      textColor: "#ffffff",
      dotsType: "extra-rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "🌙",
    },
  },
  {
    id: "planet",
    emoji: "🪐",
    name: "Planet",
    description: "Saturn ring theme",
    config: {
      dotsColor: "#daa520",
      cornersSquareColor: "#b8860b",
      cornersDotColor: "#cd853f",
      backgroundColor: "#000000",
      frameColor: "#ffd700",
      textColor: "#000000",
      dotsType: "classy-rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "🪐",
    },
  },
  {
    id: "alien",
    emoji: "👽",
    name: "Alien",
    description: "UFO green theme",
    config: {
      dotsColor: "#00ff00",
      cornersSquareColor: "#32cd32",
      cornersDotColor: "#90ee90",
      backgroundColor: "#000000",
      frameColor: "#008000",
      textColor: "#00ff00",
      dotsType: "dots",
      cornersSquareType: "dot",
      cornersDotType: "dot",
      logo: "👽",
    },
  },

  // Weather
  {
    id: "sunset",
    emoji: "🌅",
    name: "Sunset",
    description: "Warm sunset colors",
    config: {
      dotsColor: "#ff8c00",
      cornersSquareColor: "#ffa500",
      cornersDotColor: "#ff7f50",
      backgroundColor: "#fff8dc",
      frameColor: "#b8860b",
      textColor: "#000000",
      dotsType: "classy",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "🌅",
    },
  },
  {
    id: "rainbow",
    emoji: "🌈",
    name: "Rainbow",
    description: "Colorful arc theme",
    config: {
      dotsColor: "#ff69b4",
      cornersSquareColor: "#00bfff",
      cornersDotColor: "#32cd32",
      backgroundColor: "#f0f8ff",
      frameColor: "#9370db",
      textColor: "#ffffff",
      dotsType: "rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "🌈",
    },
  },
  {
    id: "cloud",
    emoji: "☁️",
    name: "Cloud",
    description: "Soft cloud white",
    config: {
      dotsColor: "#d3d3d3",
      cornersSquareColor: "#f5f5f5",
      cornersDotColor: "#c0c0c0",
      backgroundColor: "#87ceeb",
      frameColor: "#ffffff",
      textColor: "#000000",
      dotsType: "extra-rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "☁️",
    },
  },
  {
    id: "lightning",
    emoji: "⚡",
    name: "Lightning",
    description: "Electric storm theme",
    config: {
      dotsColor: "#ffff00",
      cornersSquareColor: "#ffd700",
      cornersDotColor: "#ffb347",
      backgroundColor: "#000000",
      frameColor: "#ffff00",
      textColor: "#000000",
      dotsType: "classy-rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "⚡",
    },
  },
  {
    id: "tornado",
    emoji: "🌪️",
    name: "Tornado",
    description: "Swirling storm theme",
    config: {
      dotsColor: "#696969",
      cornersSquareColor: "#778899",
      cornersDotColor: "#2f4f4f",
      backgroundColor: "#f0f8ff",
      frameColor: "#483d8b",
      textColor: "#ffffff",
      dotsType: "dots",
      cornersSquareType: "dot",
      cornersDotType: "dot",
      logo: "🌪️",
    },
  },

  // Cold & Ice
  {
    id: "ice",
    emoji: "❄️",
    name: "Ice",
    description: "Cool ice and snow theme",
    config: {
      dotsColor: "#add8e6",
      cornersSquareColor: "#87ceeb",
      cornersDotColor: "#4682b4",
      backgroundColor: "#f0f8ff",
      frameColor: "#2f4f4f",
      textColor: "#ffffff",
      dotsType: "extra-rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "❄️",
    },
  },
  {
    id: "snowman",
    emoji: "⛄",
    name: "Snowman",
    description: "Winter snow theme",
    config: {
      dotsColor: "#ffffff",
      cornersSquareColor: "#f0f8ff",
      cornersDotColor: "#e0e0e0",
      backgroundColor: "#b0e0e6",
      frameColor: "#4682b4",
      textColor: "#000000",
      dotsType: "dots",
      cornersSquareType: "dot",
      cornersDotType: "dot",
      logo: "⛄",
    },
  },
  {
    id: "penguin",
    emoji: "🐧",
    name: "Penguin",
    description: "Antarctic black white",
    config: {
      dotsColor: "#000000",
      cornersSquareColor: "#2f2f2f",
      cornersDotColor: "#696969",
      backgroundColor: "#f0f8ff",
      frameColor: "#000000",
      textColor: "#ffffff",
      dotsType: "square",
      cornersSquareType: "square",
      cornersDotType: "square",
      logo: "🐧",
    },
  },

  // Love & Hearts
  {
    id: "love",
    emoji: "💖",
    name: "Love",
    description: "Pink and romantic theme",
    config: {
      dotsColor: "#ff1493",
      cornersSquareColor: "#ff69b4",
      cornersDotColor: "#dc143c",
      backgroundColor: "#fff0f5",
      frameColor: "#8b008b",
      textColor: "#ffffff",
      dotsType: "rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "💖",
    },
  },
  {
    id: "heart",
    emoji: "❤️",
    name: "Heart",
    description: "Classic red heart",
    config: {
      dotsColor: "#dc143c",
      cornersSquareColor: "#ff0000",
      cornersDotColor: "#b22222",
      backgroundColor: "#fff0f0",
      frameColor: "#8b0000",
      textColor: "#ffffff",
      dotsType: "rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "❤️",
    },
  },
  {
    id: "rose",
    emoji: "🌹",
    name: "Rose",
    description: "Romantic rose theme",
    config: {
      dotsColor: "#dc143c",
      cornersSquareColor: "#ff1493",
      cornersDotColor: "#b22222",
      backgroundColor: "#ffeef0",
      frameColor: "#8b008b",
      textColor: "#ffffff",
      dotsType: "classy",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "🌹",
    },
  },
  {
    id: "kiss",
    emoji: "💋",
    name: "Kiss",
    description: "Lipstick kiss theme",
    config: {
      dotsColor: "#ff1493",
      cornersSquareColor: "#dc143c",
      cornersDotColor: "#b22222",
      backgroundColor: "#fff0f5",
      frameColor: "#8b008b",
      textColor: "#ffffff",
      dotsType: "dots",
      cornersSquareType: "dot",
      cornersDotType: "dot",
      logo: "💋",
    },
  },
  {
    id: "wedding",
    emoji: "💒",
    name: "Wedding",
    description: "Wedding ceremony theme",
    config: {
      dotsColor: "#ffffff",
      cornersSquareColor: "#f0f0f0",
      cornersDotColor: "#d3d3d3",
      backgroundColor: "#ffe4e1",
      frameColor: "#ff69b4",
      textColor: "#8b008b",
      dotsType: "extra-rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "💒",
    },
  },

  // Money & Wealth
  {
    id: "money",
    emoji: "💰",
    name: "Money",
    description: "Gold and wealth theme",
    config: {
      dotsColor: "#ffd700",
      cornersSquareColor: "#daa520",
      cornersDotColor: "#b8860b",
      backgroundColor: "#fffaf0",
      frameColor: "#8b7d3a",
      textColor: "#000000",
      dotsType: "square",
      cornersSquareType: "square",
      cornersDotType: "square",
      logo: "💰",
    },
  },
  {
    id: "gold",
    emoji: "🏆",
    name: "Gold",
    description: "Trophy gold theme",
    config: {
      dotsColor: "#ffd700",
      cornersSquareColor: "#ffff00",
      cornersDotColor: "#daa520",
      backgroundColor: "#fffacd",
      frameColor: "#b8860b",
      textColor: "#8b4513",
      dotsType: "classy-rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "🏆",
    },
  },
  {
    id: "diamond",
    emoji: "💎",
    name: "Diamond",
    description: "Precious gem theme",
    config: {
      dotsColor: "#00ffff",
      cornersSquareColor: "#40e0d0",
      cornersDotColor: "#20b2aa",
      backgroundColor: "#f0ffff",
      frameColor: "#008b8b",
      textColor: "#ffffff",
      dotsType: "dots",
      cornersSquareType: "dot",
      cornersDotType: "dot",
      logo: "💎",
    },
  },
  {
    id: "coin",
    emoji: "🪙",
    name: "Coin",
    description: "Golden coin theme",
    config: {
      dotsColor: "#cd853f",
      cornersSquareColor: "#daa520",
      cornersDotColor: "#b8860b",
      backgroundColor: "#f5deb3",
      frameColor: "#8b4513",
      textColor: "#ffffff",
      dotsType: "square",
      cornersSquareType: "square",
      cornersDotType: "square",
      logo: "🪙",
    },
  },

  // Food & Drinks
  {
    id: "apple",
    emoji: "🍎",
    name: "Apple",
    description: "Fresh red apple",
    config: {
      dotsColor: "#dc143c",
      cornersSquareColor: "#ff0000",
      cornersDotColor: "#b22222",
      backgroundColor: "#fff0f0",
      frameColor: "#8b0000",
      textColor: "#ffffff",
      dotsType: "rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "🍎",
    },
  },
  {
    id: "banana",
    emoji: "🍌",
    name: "Banana",
    description: "Yellow banana theme",
    config: {
      dotsColor: "#ffff00",
      cornersSquareColor: "#ffd700",
      cornersDotColor: "#daa520",
      backgroundColor: "#fffacd",
      frameColor: "#ffa500",
      textColor: "#8b4513",
      dotsType: "classy",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "🍌",
    },
  },
  {
    id: "orange",
    emoji: "🍊",
    name: "Orange",
    description: "Citrus orange theme",
    config: {
      dotsColor: "#ff8c00",
      cornersSquareColor: "#ffa500",
      cornersDotColor: "#ff7f50",
      backgroundColor: "#ffefd5",
      frameColor: "#ff6600",
      textColor: "#000000",
      dotsType: "dots",
      cornersSquareType: "dot",
      cornersDotType: "dot",
      logo: "🍊",
    },
  },
  {
    id: "grape",
    emoji: "🍇",
    name: "Grape",
    description: "Purple grape theme",
    config: {
      dotsColor: "#8b008b",
      cornersSquareColor: "#9370db",
      cornersDotColor: "#663399",
      backgroundColor: "#f0f0ff",
      frameColor: "#4b0082",
      textColor: "#ffffff",
      dotsType: "extra-rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "🍇",
    },
  },
  {
    id: "coffee",
    emoji: "☕",
    name: "Coffee",
    description: "Rich coffee brown",
    config: {
      dotsColor: "#8b4513",
      cornersSquareColor: "#a0522d",
      cornersDotColor: "#654321",
      backgroundColor: "#f5deb3",
      frameColor: "#8b4513",
      textColor: "#ffffff",
      dotsType: "classy-rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "☕",
    },
  },

  // Animals
  {
    id: "cat",
    emoji: "🐱",
    name: "Cat",
    description: "Cute cat theme",
    config: {
      dotsColor: "#ff69b4",
      cornersSquareColor: "#ffb6c1",
      cornersDotColor: "#ff1493",
      backgroundColor: "#fff0f5",
      frameColor: "#dc143c",
      textColor: "#ffffff",
      dotsType: "rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "🐱",
    },
  },
  {
    id: "dog",
    emoji: "🐶",
    name: "Dog",
    description: "Loyal dog theme",
    config: {
      dotsColor: "#8b4513",
      cornersSquareColor: "#a0522d",
      cornersDotColor: "#654321",
      backgroundColor: "#f5deb3",
      frameColor: "#8b4513",
      textColor: "#ffffff",
      dotsType: "dots",
      cornersSquareType: "dot",
      cornersDotType: "dot",
      logo: "🐶",
    },
  },
  {
    id: "lion",
    emoji: "🦁",
    name: "Lion",
    description: "King of jungle theme",
    config: {
      dotsColor: "#daa520",
      cornersSquareColor: "#ffd700",
      cornersDotColor: "#b8860b",
      backgroundColor: "#fffacd",
      frameColor: "#ff8c00",
      textColor: "#8b4513",
      dotsType: "square",
      cornersSquareType: "square",
      cornersDotType: "square",
      logo: "🦁",
    },
  },
  {
    id: "panda",
    emoji: "🐼",
    name: "Panda",
    description: "Black white panda",
    config: {
      dotsColor: "#000000",
      cornersSquareColor: "#2f2f2f",
      cornersDotColor: "#696969",
      backgroundColor: "#ffffff",
      frameColor: "#000000",
      textColor: "#ffffff",
      dotsType: "extra-rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "🐼",
    },
  },
  {
    id: "unicorn",
    emoji: "🦄",
    name: "Unicorn",
    description: "Magical unicorn theme",
    config: {
      dotsColor: "#ff69b4",
      cornersSquareColor: "#9370db",
      cornersDotColor: "#00bfff",
      backgroundColor: "#fff0f5",
      frameColor: "#ff1493",
      textColor: "#ffffff",
      dotsType: "classy",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "🦄",
    },
  },

  // Technology
  {
    id: "robot",
    emoji: "🤖",
    name: "Robot",
    description: "Futuristic robot theme",
    config: {
      dotsColor: "#c0c0c0",
      cornersSquareColor: "#d3d3d3",
      cornersDotColor: "#a9a9a9",
      backgroundColor: "#000000",
      frameColor: "#008000",
      textColor: "#00ff00",
      dotsType: "square",
      cornersSquareType: "square",
      cornersDotType: "square",
      logo: "🤖",
    },
  },
  {
    id: "computer",
    emoji: "💻",
    name: "Computer",
    description: "Digital tech theme",
    config: {
      dotsColor: "#4169e1",
      cornersSquareColor: "#6495ed",
      cornersDotColor: "#00bfff",
      backgroundColor: "#f0f8ff",
      frameColor: "#1e90ff",
      textColor: "#ffffff",
      dotsType: "classy-rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "💻",
    },
  },
  {
    id: "phone",
    emoji: "📱",
    name: "Phone",
    description: "Mobile device theme",
    config: {
      dotsColor: "#2f2f2f",
      cornersSquareColor: "#696969",
      cornersDotColor: "#000000",
      backgroundColor: "#f5f5f5",
      frameColor: "#4682b4",
      textColor: "#ffffff",
      dotsType: "extra-rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "📱",
    },
  },

  // Transportation
  {
    id: "car",
    emoji: "🚗",
    name: "Car",
    description: "Automobile theme",
    config: {
      dotsColor: "#dc143c",
      cornersSquareColor: "#ff0000",
      cornersDotColor: "#b22222",
      backgroundColor: "#f0f0f0",
      frameColor: "#2f2f2f",
      textColor: "#ffffff",
      dotsType: "classy-rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "🚗",
    },
  },
  {
    id: "plane",
    emoji: "✈️",
    name: "Plane",
    description: "Aviation theme",
    config: {
      dotsColor: "#4682b4",
      cornersSquareColor: "#87ceeb",
      cornersDotColor: "#5f9ea0",
      backgroundColor: "#e0f6ff",
      frameColor: "#2f4f4f",
      textColor: "#ffffff",
      dotsType: "dots",
      cornersSquareType: "dot",
      cornersDotType: "dot",
      logo: "✈️",
    },
  },
  {
    id: "train",
    emoji: "🚂",
    name: "Train",
    description: "Railway locomotive theme",
    config: {
      dotsColor: "#8b4513",
      cornersSquareColor: "#a0522d",
      cornersDotColor: "#654321",
      backgroundColor: "#f5deb3",
      frameColor: "#2f2f2f",
      textColor: "#ffffff",
      dotsType: "square",
      cornersSquareType: "square",
      cornersDotType: "square",
      logo: "🚂",
    },
  },

  // Sports
  {
    id: "soccer",
    emoji: "⚽",
    name: "Soccer",
    description: "Football theme",
    config: {
      dotsColor: "#000000",
      cornersSquareColor: "#2f2f2f",
      cornersDotColor: "#696969",
      backgroundColor: "#ffffff",
      frameColor: "#008000",
      textColor: "#ffffff",
      dotsType: "dots",
      cornersSquareType: "dot",
      cornersDotType: "dot",
      logo: "⚽",
    },
  },
  {
    id: "basketball",
    emoji: "🏀",
    name: "Basketball",
    description: "Basketball theme",
    config: {
      dotsColor: "#ff8c00",
      cornersSquareColor: "#ffa500",
      cornersDotColor: "#ff7f50",
      backgroundColor: "#2f2f2f",
      frameColor: "#ff6600",
      textColor: "#000000",
      dotsType: "dots",
      cornersSquareType: "dot",
      cornersDotType: "dot",
      logo: "🏀",
    },
  },
  {
    id: "tennis",
    emoji: "🎾",
    name: "Tennis",
    description: "Tennis ball theme",
    config: {
      dotsColor: "#adff2f",
      cornersSquareColor: "#9acd32",
      cornersDotColor: "#32cd32",
      backgroundColor: "#f0fff0",
      frameColor: "#228b22",
      textColor: "#ffffff",
      dotsType: "extra-rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "🎾",
    },
  },

  // Music & Art
  {
    id: "music",
    emoji: "🎵",
    name: "Music",
    description: "Musical note theme",
    config: {
      dotsColor: "#9370db",
      cornersSquareColor: "#8b008b",
      cornersDotColor: "#4b0082",
      backgroundColor: "#f0f0ff",
      frameColor: "#663399",
      textColor: "#ffffff",
      dotsType: "classy",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "🎵",
    },
  },
  {
    id: "art",
    emoji: "🎨",
    name: "Art",
    description: "Artist palette theme",
    config: {
      dotsColor: "#ff69b4",
      cornersSquareColor: "#00bfff",
      cornersDotColor: "#32cd32",
      backgroundColor: "#ffffff",
      frameColor: "#ff1493",
      textColor: "#ffffff",
      dotsType: "classy-rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "🎨",
    },
  },
  {
    id: "guitar",
    emoji: "🎸",
    name: "Guitar",
    description: "Rock guitar theme",
    config: {
      dotsColor: "#8b4513",
      cornersSquareColor: "#a0522d",
      cornersDotColor: "#654321",
      backgroundColor: "#000000",
      frameColor: "#ffd700",
      textColor: "#000000",
      dotsType: "square",
      cornersSquareType: "square",
      cornersDotType: "square",
      logo: "🎸",
    },
  },

  // Celebration
  {
    id: "party",
    emoji: "🎉",
    name: "Party",
    description: "Colorful celebration theme",
    config: {
      dotsColor: "#ff6b6b",
      cornersSquareColor: "#4ecdc4",
      cornersDotColor: "#45b7d1",
      backgroundColor: "#fff",
      frameColor: "#ff6b6b",
      textColor: "#ffffff",
      dotsType: "dots",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "🎉",
    },
  },
  {
    id: "birthday",
    emoji: "🎂",
    name: "Birthday",
    description: "Birthday cake theme",
    config: {
      dotsColor: "#ff69b4",
      cornersSquareColor: "#ffb6c1",
      cornersDotColor: "#ff1493",
      backgroundColor: "#fff0f5",
      frameColor: "#dc143c",
      textColor: "#ffffff",
      dotsType: "rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "🎂",
    },
  },
  {
    id: "balloon",
    emoji: "🎈",
    name: "Balloon",
    description: "Party balloon theme",
    config: {
      dotsColor: "#ff0000",
      cornersSquareColor: "#ff6347",
      cornersDotColor: "#dc143c",
      backgroundColor: "#fff0f0",
      frameColor: "#8b0000",
      textColor: "#ffffff",
      dotsType: "extra-rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "🎈",
    },
  },
  {
    id: "fireworks",
    emoji: "🎆",
    name: "Fireworks",
    description: "Firework celebration",
    config: {
      dotsColor: "#ffd700",
      cornersSquareColor: "#ff69b4",
      cornersDotColor: "#00bfff",
      backgroundColor: "#000000",
      frameColor: "#ff1493",
      textColor: "#ffd700",
      dotsType: "classy",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "🎆",
    },
  },

  // Miscellaneous
  {
    id: "magic",
    emoji: "✨",
    name: "Magic",
    description: "Magical sparkles",
    config: {
      dotsColor: "#ffd700",
      cornersSquareColor: "#ffff00",
      cornersDotColor: "#daa520",
      backgroundColor: "#191970",
      frameColor: "#4b0082",
      textColor: "#ffd700",
      dotsType: "rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "✨",
    },
  },
  {
    id: "crown",
    emoji: "👑",
    name: "Crown",
    description: "Royal crown theme",
    config: {
      dotsColor: "#ffd700",
      cornersSquareColor: "#ffff00",
      cornersDotColor: "#daa520",
      backgroundColor: "#4b0082",
      frameColor: "#8b008b",
      textColor: "#ffd700",
      dotsType: "classy-rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "👑",
    },
  },
  {
    id: "gift",
    emoji: "🎁",
    name: "Gift",
    description: "Present gift theme",
    config: {
      dotsColor: "#dc143c",
      cornersSquareColor: "#ff0000",
      cornersDotColor: "#b22222",
      backgroundColor: "#fff0f0",
      frameColor: "#ffd700",
      textColor: "#dc143c",
      dotsType: "square",
      cornersSquareType: "square",
      cornersDotType: "square",
      logo: "🎁",
    },
  },
  {
    id: "key",
    emoji: "🗝️",
    name: "Key",
    description: "Golden key theme",
    config: {
      dotsColor: "#daa520",
      cornersSquareColor: "#ffd700",
      cornersDotColor: "#b8860b",
      backgroundColor: "#fffacd",
      frameColor: "#8b4513",
      textColor: "#ffffff",
      dotsType: "classy",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "🗝️",
    },
  },
  {
    id: "gem",
    emoji: "💍",
    name: "Ring",
    description: "Diamond ring theme",
    config: {
      dotsColor: "#ff69b4",
      cornersSquareColor: "#ffb6c1",
      cornersDotColor: "#ff1493",
      backgroundColor: "#fff0f5",
      frameColor: "#40e0d0",
      textColor: "#8b008b",
      dotsType: "dots",
      cornersSquareType: "dot",
      cornersDotType: "dot",
      logo: "💍",
    },
  },

  // Final extras to reach 100
  {
    id: "mask",
    emoji: "🎭",
    name: "Mask",
    description: "Theater mask theme",
    config: {
      dotsColor: "#8b008b",
      cornersSquareColor: "#9370db",
      cornersDotColor: "#4b0082",
      backgroundColor: "#f0f0ff",
      frameColor: "#663399",
      textColor: "#ffffff",
      dotsType: "classy-rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "🎭",
    },
  },
  {
    id: "anchor",
    emoji: "⚓",
    name: "Anchor",
    description: "Naval anchor theme",
    config: {
      dotsColor: "#2f4f4f",
      cornersSquareColor: "#696969",
      cornersDotColor: "#000000",
      backgroundColor: "#f0f8ff",
      frameColor: "#1e90ff",
      textColor: "#ffffff",
      dotsType: "square",
      cornersSquareType: "square",
      cornersDotType: "square",
      logo: "⚓",
    },
  },
  {
    id: "compass",
    emoji: "🧭",
    name: "Compass",
    description: "Navigation compass",
    config: {
      dotsColor: "#dc143c",
      cornersSquareColor: "#ff0000",
      cornersDotColor: "#b22222",
      backgroundColor: "#f5deb3",
      frameColor: "#8b4513",
      textColor: "#ffffff",
      dotsType: "dots",
      cornersSquareType: "dot",
      cornersDotType: "dot",
      logo: "🧭",
    },
  },
  {
    id: "hourglass",
    emoji: "⌛",
    name: "Hourglass",
    description: "Time hourglass theme",
    config: {
      dotsColor: "#daa520",
      cornersSquareColor: "#ffd700",
      cornersDotColor: "#b8860b",
      backgroundColor: "#fffacd",
      frameColor: "#8b4513",
      textColor: "#ffffff",
      dotsType: "extra-rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "⌛",
    },
  },
  {
    id: "crystal",
    emoji: "🔮",
    name: "Crystal",
    description: "Crystal ball theme",
    config: {
      dotsColor: "#9370db",
      cornersSquareColor: "#8b008b",
      cornersDotColor: "#4b0082",
      backgroundColor: "#000000",
      frameColor: "#40e0d0",
      textColor: "#9370db",
      dotsType: "extra-rounded",
      cornersSquareType: "extra-rounded",
      cornersDotType: "dot",
      logo: "🔮",
    },
  },
];

// Data type detection and formatting
export const detectDataType = (
  data: string
): "url" | "email" | "phone" | "wifi" | "text" => {
  if (data.startsWith("http://") || data.startsWith("https://")) return "url";
  if (data.includes("@") && data.includes(".")) return "email";
  if (data.match(/^[\+]?[\d\s\-\(\)]+$/)) return "phone";
  if (data.startsWith("WIFI:")) return "wifi";
  return "text";
};

// WiFi QR code generator
export const generateWiFiQR = (
  ssid: string,
  password: string,
  security: "WPA" | "WEP" | "nopass" = "WPA"
) => {
  return `WIFI:T:${security};S:${ssid};P:${password};;`;
};

// vCard QR code generator
export const generateVCardQR = (contact: {
  firstName?: string;
  lastName?: string;
  title?: string;
  organization?: string;
  street?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  emailPersonal?: string;
  emailBusiness?: string;
  phonePersonal?: string;
  phoneMobile?: string;
  phoneBusiness?: string;
  website?: string;
}) => {
  const lines = ["BEGIN:VCARD", "VERSION:3.0"];

  const fullName =
    `${contact.firstName || ""} ${contact.lastName || ""}`.trim();
  if (fullName) {
    lines.push(`FN:${fullName}`);
    lines.push(`N:${contact.lastName || ""};${contact.firstName || ""};;;`);
  }

  if (contact.title) lines.push(`TITLE:${contact.title}`);
  if (contact.organization) lines.push(`ORG:${contact.organization}`);

  // Address
  if (contact.street || contact.city || contact.zipCode || contact.country) {
    const addressParts = [
      "", // PO Box (empty)
      "", // Extended address (empty)
      contact.street || "",
      contact.city || "",
      "", // State/Province (empty)
      contact.zipCode || "",
      contact.country || "",
    ];
    lines.push(`ADR:${addressParts.join(";")}`);
  }

  // Phone numbers with types
  if (contact.phonePersonal)
    lines.push(`TEL;TYPE=HOME:${contact.phonePersonal}`);
  if (contact.phoneMobile) lines.push(`TEL;TYPE=CELL:${contact.phoneMobile}`);
  if (contact.phoneBusiness)
    lines.push(`TEL;TYPE=WORK:${contact.phoneBusiness}`);

  // Email addresses with types
  if (contact.emailPersonal)
    lines.push(`EMAIL;TYPE=HOME:${contact.emailPersonal}`);
  if (contact.emailBusiness)
    lines.push(`EMAIL;TYPE=WORK:${contact.emailBusiness}`);

  if (contact.website) lines.push(`URL:${contact.website}`);

  lines.push("END:VCARD");
  return lines.join("\r\n");
};

// Generate random colors for QR code
export const generateRandomColor = (): string => {
  const colors = [
    "#667eea",
    "#764ba2",
    "#ff6b6b",
    "#4ecdc4",
    "#45b7d1",
    "#96ceb4",
    "#feca57",
    "#ff9ff3",
    "#54a0ff",
    "#5f27cd",
    "#00d2d3",
    "#ff9f43",
    "#ee5a24",
    "#009432",
    "#0652DD",
    "#9980FA",
    "#833471",
    "#EA2027",
    "#006BA6",
    "#0652DD",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Generate random shape options
export const generateRandomShapes = () => {
  const dotTypes = [
    "dots",
    "rounded",
    "classy",
    "classy-rounded",
    "square",
    "extra-rounded",
  ];
  const cornerSquareTypes = ["dot", "square", "extra-rounded"];
  const cornerDotTypes = ["dot", "square"];

  return {
    dotsType: dotTypes[Math.floor(Math.random() * dotTypes.length)],
    cornersSquareType:
      cornerSquareTypes[Math.floor(Math.random() * cornerSquareTypes.length)],
    cornersDotType:
      cornerDotTypes[Math.floor(Math.random() * cornerDotTypes.length)],
  };
};

// Frame presets
export interface FramePreset {
  id: string;
  name: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderWidth: string;
  borderRadius: string;
  padding: string;
}

export const framePresets: FramePreset[] = [
  {
    id: "dark-frame",
    name: "Dark Frame",
    backgroundColor: "#000000",
    textColor: "#ffffff",
    borderColor: "#000000",
    borderWidth: "8px",
    borderRadius: "12px",
    padding: "20px",
  },
  {
    id: "light-frame",
    name: "Light Frame",
    backgroundColor: "#ffffff",
    textColor: "#000000",
    borderColor: "#e2e8f0",
    borderWidth: "4px",
    borderRadius: "8px",
    padding: "16px",
  },
  {
    id: "gradient-frame",
    name: "Gradient Frame",
    backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    textColor: "#ffffff",
    borderColor: "#667eea",
    borderWidth: "6px",
    borderRadius: "16px",
    padding: "24px",
  },
  {
    id: "minimal-frame",
    name: "Minimal Frame",
    backgroundColor: "#f8fafc",
    textColor: "#64748b",
    borderColor: "#cbd5e1",
    borderWidth: "2px",
    borderRadius: "4px",
    padding: "12px",
  },
];
