# Windsurf AI Rules for FreeTools

## Project Overview
FreeTools is a Next.js 15 application with React 19, providing free developer and productivity tools. The project uses modern web technologies with a focus on accessibility and user experience.

## Technical Stack
- **Framework**: Next.js 15 (App Router)
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **UI Library**: Radix UI primitives
- **Icons**: Lucide React
- **Themes**: next-themes for dark/light mode

## Development Rules

### Code Standards
- Use TypeScript for all files with strict mode enabled
- Prefer functional components with React hooks
- Follow Next.js 15 App Router conventions
- Implement proper error boundaries and loading states
- Use semantic HTML for accessibility

### Component Architecture
- Base components: Use shadcn/ui as foundation
- Custom components: Build on top of Radix UI primitives
- File naming: PascalCase for components, camelCase for utilities
- Import pattern: External libs → Internal utils → UI components → Local components

### Styling Guidelines
- Use Tailwind CSS utilities exclusively
- Support both dark and light themes
- Mobile-first responsive design approach
- Use `cn()` utility for conditional classes
- Leverage CSS custom properties from globals.css

### File Structure
```
app/                    # Next.js App Router pages
├── [tool-name]/       # Individual tool pages
├── api/               # API routes
└── layout.tsx         # Root layout

components/
├── ui/                # shadcn/ui components
└── [custom]/          # Custom components

lib/
├── categories.ts      # Tool definitions
└── utils.ts           # Utility functions

hooks/                 # Custom React hooks
```

### Tool Development Pattern
1. Add tool metadata to `lib/categories.ts`
2. Create page at `app/[tool-name]/page.tsx`
3. Use consistent layout structure
4. Implement responsive design
5. Add proper TypeScript interfaces
6. Include loading/error states

### Performance Requirements
- Optimize bundle size
- Implement lazy loading for heavy components
- Use React.memo() for expensive renders
- Optimize images with Next.js Image component
- Minimize re-renders with proper dependency arrays

### Accessibility Standards
- Use semantic HTML elements
- Include proper ARIA labels and roles
- Ensure keyboard navigation functionality
- Maintain sufficient color contrast
- Test with screen readers

### TypeScript Guidelines
- Define interfaces for all component props
- Use proper return types for functions
- Avoid `any` types
- Implement error handling with proper types
- Use type guards for runtime checks

### Testing Approach
- Unit tests for utility functions
- Component testing for user interactions
- Responsive design testing
- Cross-browser compatibility
- Theme switching verification

## Specific Patterns

### Page Component Structure
```typescript
export default function ToolPage() {
  // Hooks at the top
  const [state, setState] = useState()
  
  // Event handlers
  const handleAction = () => {}
  
  // Render
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* Tool content */}
      </div>
    </div>
  )
}
```

### Error Handling
- Use error boundaries for component errors
- Implement try-catch for async operations
- Show user-friendly error messages
- Log errors for debugging
- Provide fallback UI states

### State Management
- Local state: React hooks (useState, useReducer)
- Shared state: React Context when needed
- Form state: react-hook-form for complex forms
- URL state: Next.js router for navigation state

## Development Workflow

### Before Committing
1. Run `npm run lint` and fix all issues
2. Verify TypeScript compilation
3. Test responsive behavior
4. Check both light and dark themes
5. Ensure accessibility compliance

### Adding Dependencies
- Only add if not already in package.json
- Check bundle size impact
- Verify compatibility with existing stack
- Prefer well-maintained packages
- Update package.json and install

### Code Reviews
- Check for TypeScript errors
- Verify responsive design
- Test accessibility features
- Review performance implications
- Ensure consistent code style

## Quality Assurance

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement approach
- Graceful degradation for older browsers

### Performance Metrics
- Core Web Vitals compliance
- Fast loading times
- Smooth animations and transitions
- Efficient bundle sizes
- Optimized images and assets

### Security Considerations
- Input validation and sanitization
- XSS prevention
- CSRF protection
- Secure environment variable handling
- Regular dependency updates

## Project-Specific Notes

### Tool Categories & Gradients
Each tool has a unique gradient defined in `lib/categories.ts`. When creating new tools, choose distinctive color combinations that maintain visual hierarchy and accessibility.

### Component Library Usage
- Prefer shadcn/ui components over custom implementations
- Extend existing components rather than creating new ones
- Maintain consistency with established design patterns
- Use Radix UI primitives for complex interactions

### Development Server
- Runs on port 3001: `npm run dev`
- Hot reload enabled
- TypeScript checking in development
- Tailwind CSS compilation
- ESLint integration

This document serves as the primary reference for AI assistants working on the FreeTools project.