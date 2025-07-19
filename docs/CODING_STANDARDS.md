# Coding Standards & Conventions

This document defines the coding standards and conventions for the Kevin Geng portfolio project.

## 📁 File & Folder Naming

### Directories
- Use `kebab-case` for directories: `about-me`, `project-showcase`
- Group related files in logical directories

### Files
- **Components**: `PascalCase` - `HeroSection.tsx`, `NavigationBar.tsx`
- **Pages**: `kebab-case` - `about.tsx`, `contact-me.tsx`
- **Utilities**: `camelCase` - `formatDate.ts`, `apiHelpers.ts`
- **Types**: `PascalCase` with `.types.ts` suffix - `Project.types.ts`
- **Hooks**: `camelCase` with `use` prefix - `useScrollProgress.ts`

## 🎯 TypeScript Standards

### Type Definitions

```typescript
// Use interfaces for object shapes
interface ProjectProps {
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
}

// Use type aliases for unions and primitives
type ThemeMode = 'light' | 'dark' | 'system';
type ProjectStatus = 'draft' | 'published' | 'archived';

// Prefer Record for key-value mappings
type TechnologyColors = Record<string, string>;
```

### Component Props

```typescript
// Always define props interface
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

// Use React.FC sparingly, prefer direct function declaration
const Button = ({ children, variant = 'primary', ...props }: ButtonProps) => {
  return <button {...props}>{children}</button>;
};
```

### Strict Type Rules

- No `any` types without explicit justification
- Always type function parameters and return values
- Use strict null checks (`strictNullChecks: true`)
- Prefer `unknown` over `any` for truly unknown types

## ⚛️ React Conventions

### Component Structure

```typescript
// 1. Imports (external first, then internal)
import React from 'react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/Button';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import type { ProjectProps } from '@/types/Project.types';

// 2. Interface/type definitions
interface ProjectCardProps {
  project: ProjectProps;
  className?: string;
}

// 3. Component implementation
const ProjectCard = ({ project, className }: ProjectCardProps) => {
  // 4. Hooks (in order: state, context, custom hooks)
  const [isHovered, setIsHovered] = useState(false);
  const scrollProgress = useScrollProgress();

  // 5. Event handlers
  const handleClick = () => {
    // Implementation
  };

  // 6. Render
  return (
    <div className={className}>
      {/* Component JSX */}
    </div>
  );
};

// 7. Default export
export default ProjectCard;
```

### Custom Hooks

```typescript
// Prefix with 'use' and return object with named properties
const useScrollProgress = () => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Implementation
  }, []);

  return { progress };
};

// For complex state, return object with actions
const useProjectFilter = () => {
  const [filters, setFilters] = useState<ProjectFilters>({});
  
  const updateFilter = (key: string, value: string) => {
    // Implementation
  };

  const clearFilters = () => {
    // Implementation
  };

  return {
    filters,
    updateFilter,
    clearFilters,
  };
};
```

## 🎨 Styling Conventions

### Tailwind CSS

```typescript
// Use consistent spacing scale
const spacing = {
  xs: 'p-2',     // 8px
  sm: 'p-4',     // 16px
  md: 'p-6',     // 24px
  lg: 'p-8',     // 32px
  xl: 'p-12',    // 48px
};

// Group classes logically
<div className={cn(
  // Layout
  'flex items-center justify-between',
  // Spacing
  'px-6 py-4',
  // Appearance
  'bg-white dark:bg-gray-900',
  'border border-gray-200 dark:border-gray-700',
  'rounded-lg shadow-sm',
  // Interactive
  'hover:shadow-md transition-shadow',
  // Conditional
  className
)} />
```

### CSS Custom Properties

```css
/* Use CSS variables for dynamic values */
:root {
  --header-height: 4rem;
  --content-max-width: 1200px;
  --border-radius: 0.5rem;
}

/* Prefix custom properties with project namespace */
:root {
  --kg-primary: #3b82f6;
  --kg-secondary: #6366f1;
  --kg-accent: #f59e0b;
}
```

## 📂 Import Organization

```typescript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries (alphabetical)
import { motion } from 'framer-motion';
import Link from 'next/link';

// 3. Internal utilities and hooks
import { cn } from '@/lib/utils';
import { useScrollProgress } from '@/hooks/useScrollProgress';

// 4. Components (UI first, then feature components)
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProjectCard } from '@/components/sections/ProjectCard';

// 5. Types
import type { ProjectProps } from '@/types/Project.types';
```

## 🔧 Utility Functions

### Function Naming

```typescript
// Use descriptive, action-oriented names
const formatProjectDate = (date: Date): string => {};
const validateEmailAddress = (email: string): boolean => {};
const calculateReadingTime = (content: string): number => {};

// Prefix predicates with 'is', 'has', 'can', 'should'
const isValidEmail = (email: string): boolean => {};
const hasRequiredFields = (project: ProjectProps): boolean => {};
const canUserEdit = (userId: string): boolean => {};
```

### Pure Functions

```typescript
// Prefer pure functions - no side effects
const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Avoid mutations, return new objects/arrays
const addProjectToList = (projects: Project[], newProject: Project): Project[] => {
  return [...projects, newProject];
};
```

## 📝 Comments & Documentation

### JSDoc for Complex Functions

```typescript
/**
 * Calculates the reading time for given content
 * @param content - The text content to analyze
 * @param wordsPerMinute - Average reading speed (default: 200)
 * @returns Estimated reading time in minutes
 */
const calculateReadingTime = (content: string, wordsPerMinute = 200): number => {
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};
```

### Component Documentation

```typescript
/**
 * ProjectCard displays a project with its details and interactive elements
 * 
 * @example
 * <ProjectCard 
 *   project={projectData} 
 *   onSelect={() => navigate(`/projects/${project.id}`)}
 * />
 */
const ProjectCard = ({ project, onSelect }: ProjectCardProps) => {
  // Implementation
};
```

## 🚫 Code Smells to Avoid

- Deep nesting (max 3 levels)
- Functions longer than 50 lines
- Components with more than 10 props
- Magic numbers without constants
- Inline styles (use Tailwind or CSS modules)
- Direct DOM manipulation (use refs sparingly)
- Mutating props or state directly