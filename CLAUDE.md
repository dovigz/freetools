# Claude AI Context for FreeTools

This document provides essential context for AI assistants working on the FreeTools project.

## Project Overview

FreeTools is a modern web application built with Next.js 15 and React 19, providing a collection of free developer and productivity tools. The project uses the App Router architecture and implements a clean, accessible UI with shadcn/ui components.

## Architecture & Stack

### Core Technologies
- **Next.js 15** with App Router
- **React 19** with latest features
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Radix UI** primitives

### Development Setup
- Development server runs on port **3001**: `npm run dev`
- Uses `npm` as package manager (package-lock.json present)
- Build command: `npm run build`
- Lint command: `npm run lint`

## Project Structure

```
app/                    # Next.js App Router pages
├── (tools)/           # Tool pages grouped
├── api/og/            # Open Graph image generation
├── globals.css        # Global styles with CSS variables
├── layout.tsx         # Root layout with sidebar
└── page.tsx           # Homepage

components/
├── ui/                # shadcn/ui components (50+ components)
├── app-sidebar.tsx    # Main navigation sidebar
├── main-header.tsx    # Header component
└── google-analytics.tsx

lib/
├── categories.ts      # Tool definitions and metadata
└── utils.ts           # Utility functions (cn helper)

hooks/
└── use-mobile.tsx     # Mobile detection hook
```

## Available Tools (10 total)

Each tool is defined in `lib/categories.ts` with:
- Unique ID, name, path, emoji
- Description and gradient colors
- Individual pages in `app/[tool-name]/page.tsx`

Tools include:
1. QR Generator 📱
2. Text Compare 📝  
3. Password Generator 🔐
4. Base64 Encoder 🔤
5. Color Picker 🎨
6. Hash Generator 🔐
7. Image Resizer 🖼️
8. JSON Formatter 📋
9. Text Counter 🔢
10. URL Shortener 🔗

## Code Patterns & Conventions

### Component Structure
- Use TypeScript interfaces for props
- Implement proper loading/error states
- Follow shadcn/ui component patterns
- Use `cn()` utility for conditional classes

### Styling
- Tailwind CSS with custom CSS variables
- Dark/light theme support via `next-themes`
- Responsive design (mobile-first)
- Component-specific gradients defined in categories

### File Naming
- Pages: `page.tsx` (App Router)
- Components: PascalCase
- Utilities: camelCase
- Hooks: `use-` prefix

## Key Dependencies

### UI Components
- All Radix UI primitives (`@radix-ui/react-*`)
- `lucide-react` for icons
- `cmdk` for command palette
- `sonner` for toasts

### Utilities
- `class-variance-authority` for variants
- `clsx` + `tailwind-merge` for styling
- `date-fns` for dates
- `react-hook-form` for forms

## Development Guidelines

### When Adding New Tools
1. Add entry to `lib/categories.ts`
2. Create `app/[tool-name]/page.tsx`
3. Use existing UI components
4. Follow responsive design patterns
5. Implement proper TypeScript types

### When Modifying Components
- Preserve existing shadcn/ui patterns
- Maintain accessibility features
- Keep dark mode compatibility
- Use proper TypeScript interfaces

### Testing & Quality
- Run `npm run lint` before commits
- Test on both desktop and mobile
- Verify dark/light theme compatibility
- Ensure accessibility standards

## Common Tasks

### Add New Tool
```typescript
// 1. Add to lib/categories.ts
{
  id: "new-tool",
  name: "New Tool",
  path: "/new-tool", 
  emoji: "🔧",
  description: "Tool description",
  gradient: "linear-gradient(135deg, #color1 0%, #color2 100%)"
}

// 2. Create app/new-tool/page.tsx with proper TypeScript
```

### Modify Styling
- Edit `app/globals.css` for global styles
- Use Tailwind utilities in components
- Extend `tailwind.config.ts` for custom values
- Maintain CSS variable system for themes

### Update Dependencies
- Check `package.json` for latest versions
- Test compatibility with existing code
- Update TypeScript types if needed

## Notes for AI Assistants

- Always check `lib/categories.ts` for tool definitions
- Use existing shadcn/ui components when possible
- Maintain consistent gradient styling per tool
- Follow TypeScript patterns throughout codebase
- Test responsive behavior on mobile
- Preserve accessibility features from Radix UI
- Use `cn()` utility for conditional styling
- Keep components functional with hooks
- Follow Next.js 15 App Router patterns