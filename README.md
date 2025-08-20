# FreeTools 🛠️

A comprehensive collection of free, web-based developer and productivity tools built with Next.js 15, React 19, and modern UI components.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or newer
- npm, yarn, or pnpm

### Installation & Setup

1. **Fork the repository**

   ```bash
   # Click the "Fork" button on GitHub at: https://github.com/dovigz/freetools
   # Then clone your fork:
   git clone https://github.com/YOUR_USERNAME/freetools.git
   cd freetools
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3001](http://localhost:3001)

### Available Scripts

- `npm run dev` - Start development server on port 3001
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🛠️ Available Tools

### Text & Content Tools

- **📝 Text Compare** - Compare two texts and find differences
- **🔢 Text Counter** - Count characters, words, lines and paragraphs
- **📋 JSON Formatter** - Format, validate and minify JSON data

### Security & Encoding Tools

- **🔐 Password Generator** - Generate secure passwords with custom options
- **🔤 Base64 Encoder** - Encode and decode Base64 strings
- **🔐 Hash Generator** - Generate MD5, SHA1, SHA256 and other hashes

### Media & Design Tools

- **🎨 Color Picker** - Pick colors and get hex, RGB, and HSL values
- **🖼️ Image Resizer** - Resize images while maintaining quality and aspect ratio
- **📱 QR Generator** - Generate QR codes for URLs, text, and more

### Web Tools

- **🔗 URL Shortener** - Shorten long URLs and track analytics

## 🏗️ Tech Stack

### Frontend Framework

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe JavaScript

### UI & Styling

- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library
- **Radix UI** - Accessible, unstyled UI primitives
- **Lucide React** - Beautiful & consistent icons
- **next-themes** - Theme switching support

### Key Libraries

- **class-variance-authority** - Component variants
- **clsx** & **tailwind-merge** - Conditional styling
- **cmdk** - Command palette component
- **sonner** - Toast notifications
- **react-hook-form** - Form handling
- **date-fns** - Date manipulation

## 📁 Project Structure

```
freetools/
├── app/                    # Next.js 15 App Router
│   ├── (tools)/           # Tool pages
│   │   ├── base64-encoder/
│   │   ├── color-picker/
│   │   ├── hash-generator/
│   │   ├── image-resizer/
│   │   ├── json-formatter/
│   │   ├── password-generator/
│   │   ├── qr-generator/
│   │   ├── text-compare/
│   │   ├── text-counter/
│   │   └── url-shortener/
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── app-sidebar.tsx   # Main navigation
│   ├── main-header.tsx   # Header component
│   └── google-analytics.tsx
├── hooks/                # Custom React hooks
├── lib/                  # Utilities & config
│   ├── categories.ts     # Tool definitions
│   └── utils.ts          # Helper functions
├── public/               # Static assets
└── styles/               # Additional styles
```

## 🎨 Component Architecture

### UI Components (shadcn/ui)

The project uses shadcn/ui components built on Radix UI primitives:

- **Layout**: `sidebar`, `sheet`, `separator`
- **Forms**: `button`, `input`, `textarea`, `select`, `checkbox`, `radio-group`
- **Feedback**: `toast`, `alert`, `progress`, `skeleton`
- **Overlays**: `dialog`, `popover`, `tooltip`, `hover-card`
- **Navigation**: `tabs`, `accordion`, `command`
- **Data Display**: `card`, `table`, `badge`, `avatar`

### Styling System

- **Design Tokens**: CSS custom properties for colors, spacing, and typography
- **Dark Mode**: Built-in dark/light theme switching
- **Responsive**: Mobile-first responsive design
- **Animations**: Tailwind CSS animations and transitions

### Color Palette

Each tool features a unique gradient design:

- QR Generator: Purple-blue gradient
- Text Compare: Orange-red gradient
- Password Generator: Green-mint gradient
- Base64 Encoder: Gray gradient
- Color Picker: Red-orange gradient
- Hash Generator: Blue gradient
- Image Resizer: Teal gradient
- JSON Formatter: Blue gradient
- Text Counter: Purple gradient
- URL Shortener: Pink gradient

## 🔧 Development Guidelines

### Code Style

- TypeScript strict mode enabled
- ESLint configuration for Next.js
- Prettier for code formatting
- Functional components with hooks
- CSS-in-JS with Tailwind utilities

### Component Patterns

- Use shadcn/ui components as base
- Implement proper TypeScript interfaces
- Follow React 19 best practices
- Use custom hooks for logic extraction
- Implement proper loading and error states

### File Naming

- Components: PascalCase (`MainHeader.tsx`)
- Pages: lowercase (`page.tsx`)
- Utilities: camelCase (`utils.ts`)
- Hooks: camelCase with `use` prefix (`useMobile.tsx`)

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on each push

### Other Platforms

The project can be deployed on any platform supporting Node.js:

- Netlify
- Railway
- AWS Amplify
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-tool`
3. Commit your changes: `git commit -m 'Add new tool'`
4. Push to the branch: `git push origin feature/new-tool`
5. Open a Pull Request

### Adding New Tools

1. Create a new page in `app/[tool-name]/page.tsx`
2. Add tool metadata to `lib/categories.ts`
3. Implement the tool interface using existing components
4. Add proper TypeScript types
5. Test functionality and responsive design

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the excellent component library
- [Radix UI](https://www.radix-ui.com/) for accessible primitives
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Lucide](https://lucide.dev/) for beautiful icons

---

**Repository:** [https://github.com/dovigz/freetools](https://github.com/dovigz/freetools)

Built with ❤️ by the developer community
