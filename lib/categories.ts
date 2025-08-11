export interface Tool {
  id: string;
  name: string;
  path: string;
  emoji: string;
  description: string;
  gradient: string;
}

export const tools: Tool[] = [
  {
    id: "home",
    name: "Home",
    path: "/",
    emoji: "🏠",
    description: "Return to the homepage",
    gradient: "linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)",
  },
  {
    id: "qr-generator",
    name: "QR Generator",
    path: "/qr-generator",
    emoji: "📱",
    description: "Generate QR codes instantly for URLs, text, and more",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    id: "text-compare",
    name: "Text Compare",
    path: "/text-compare",
    emoji: "📝",
    description: "Compare two texts and find differences",
    gradient: "linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)",
  },
  {
    id: "password-generator",
    name: "Password Generator",
    path: "/password-generator",
    emoji: "🔐",
    description: "Generate secure passwords with custom options",
    gradient: "linear-gradient(135deg, #00b894 0%, #55efc4 100%)",
  },
  {
    id: "base64-encoder",
    name: "Base64 Encoder",
    path: "/base64-encoder",
    emoji: "🔤",
    description: "Encode and decode Base64 strings easily",
    gradient: "linear-gradient(135deg, #dfe6e9 0%, #b2bec3 100%)",
  },
  {
    id: "color-picker",
    name: "Color Picker",
    path: "/color-picker",
    emoji: "🎨",
    description: "Pick colors and get hex, RGB, and HSL values",
    gradient: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
  },
  {
    id: "hash-generator",
    name: "Hash Generator",
    path: "/hash-generator",
    emoji: "🔐",
    description: "Generate MD5, SHA1, SHA256 and other hashes",
    gradient: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)",
  },
  {
    id: "image-resizer",
    name: "Image Resizer",
    path: "/image-resizer",
    emoji: "🖼️",
    description: "Resize images while maintaining quality and aspect ratio",
    gradient: "linear-gradient(135deg, #00b894 0%, #00cec9 100%)",
  },
  {
    id: "json-formatter",
    name: "JSON Formatter",
    path: "/json-formatter",
    emoji: "📋",
    description: "Format, validate and minify JSON data",
    gradient: "linear-gradient(135deg, #0984e3 0%, #74b9ff 100%)",
  },
  {
    id: "text-counter",
    name: "Text Counter",
    path: "/text-counter",
    emoji: "🔢",
    description: "Count characters, words, lines and paragraphs in text",
    gradient: "linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)",
  },
  {
    id: "url-shortener",
    name: "URL Shortener",
    path: "/url-shortener",
    emoji: "🔗",
    description: "Shorten long URLs and track click analytics",
    gradient: "linear-gradient(135deg, #fd79a8 0%, #e84393 100%)",
  },
  {
    id: "emoji-copy",
    name: "Emoji Copy",
    path: "/emoji-copy",
    emoji: "😀",
    description: "Copy emojis easily with search and recent history",
    gradient: "linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)",
  },
];
