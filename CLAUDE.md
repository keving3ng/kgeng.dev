# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Essential Commands:**
- `npm run dev` - Start development server (usually runs on port 3000, may use 3001 if 3000 is occupied)
- `npm run build` - Build for production (always run before deployment)
- `npm run lint` - Run ESLint checks
- `npm run type-check` - Run TypeScript compiler checks
- `npm run lint && npm run type-check && npm run build` - Full validation pipeline

**Code Quality:**
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Architecture Overview

### Portfolio Website Structure
This is a personal portfolio website for Kevin Geng, a Full-stack Software Engineer. The site showcases professional experience, skills, projects, and education through both a comprehensive single-page experience and individual dedicated pages.

### Key Architectural Decisions

**Dual Navigation Pattern:**
- **Homepage (`/`)**: All sections in one scrollable page with smooth navigation
- **Individual Pages**: `/about`, `/experience`, `/skills`, `/projects`, `/education` for focused viewing
- **Smart Header**: Automatically switches between smooth scrolling (on homepage) and page navigation (on individual pages)

**Data-Driven Content:**
- `src/data/personal.ts` - Personal information, skills, certifications, social links
- `src/data/experience.ts` - Work history, education, volunteer experience
- `src/data/projects.ts` - Project showcase with categorization and status tracking

**Component Organization:**
- `src/components/sections/` - Major page sections (Hero, About, Experience, Skills, Projects, Education)
- `src/components/layout/` - Header and Footer with intelligent navigation
- `src/components/ui/` - shadcn/ui design system components
- Each section component is self-contained and can be used on both homepage and individual pages

### Technology Stack
- **Next.js 14+ with App Router** - File-based routing, SSG optimization
- **TypeScript** - Strict typing throughout
- **Tailwind CSS + shadcn/ui** - Utility-first styling with design system
- **Framer Motion** - Page and component animations
- **Lucide React** - Consistent icon system

### Content Management
The site content is managed through TypeScript data files rather than a CMS:
- Personal info (bio, contact, skills) in `src/data/personal.ts`
- Professional experience and education in `src/data/experience.ts`
- Project showcase in `src/data/projects.ts`

When updating content, modify these data files and the components will automatically reflect changes across all pages.

### Styling Conventions
- **File Naming**: Components use `PascalCase` (e.g., `HeroSection.tsx`)
- **TypeScript**: Interfaces for object shapes, type aliases for unions
- **Tailwind**: Mobile-first responsive design with dark mode support
- **Animations**: Consistent motion variants using Framer Motion

### Build Considerations
- Clean `.next` directory if encountering webpack module errors
- Both `npm run lint` and `npm run type-check` must pass before building
- Individual pages are statically generated for optimal performance
- All images should use Next.js `Image` component for optimization

### Personal Information Updates
When updating Kevin's professional information:
1. Update `src/data/personal.ts` for bio, skills, contact info
2. Update `src/data/experience.ts` for work history changes
3. Update `src/data/projects.ts` for new projects or status changes
4. Social media links are centralized in data files and used across Header, Footer, and Hero sections