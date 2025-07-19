# Project Architecture

This document outlines the architectural decisions, patterns, and structure for the Kevin Geng portfolio website.

## 🏗️ Overall Architecture

### Tech Stack Rationale

**Next.js 14+ (App Router)**
- Server-side rendering for SEO optimization
- Built-in performance optimizations
- File-based routing system
- API routes for contact forms/interactions

**TypeScript**
- Type safety and better developer experience
- Improved code maintainability
- Better IDE support and refactoring

**Tailwind CSS**
- Utility-first approach for rapid development
- Consistent design system
- Excellent performance with purging
- Dark mode support built-in

**shadcn/ui**
- High-quality, accessible components
- Customizable and composable
- TypeScript-first design
- Copy-paste friendly

## 📁 Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── globals.css         # Global styles and Tailwind imports
│   ├── layout.tsx          # Root layout component
│   ├── page.tsx            # Homepage
│   ├── about/              # About page
│   ├── projects/           # Projects section
│   │   ├── page.tsx        # Projects listing
│   │   └── [slug]/         # Individual project pages
│   ├── contact/            # Contact page
│   └── api/                # API routes
│       └── contact/        # Contact form endpoint
├── components/             # Reusable components
│   ├── ui/                # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── layout/            # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   ├── sections/          # Page section components
│   │   ├── HeroSection.tsx
│   │   ├── AboutSection.tsx
│   │   ├── ProjectsSection.tsx
│   │   └── ContactSection.tsx
│   └── common/            # Common utility components
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       └── SEO.tsx
├── lib/                   # Utility functions and configs
│   ├── utils.ts          # General utilities (cn, etc.)
│   ├── constants.ts      # App constants
│   ├── validations.ts    # Form validation schemas
│   └── animations.ts     # Framer Motion variants
├── hooks/                # Custom React hooks
│   ├── useScrollProgress.ts
│   ├── useIntersectionObserver.ts
│   └── useLocalStorage.ts
├── types/                # TypeScript type definitions
│   ├── Project.types.ts
│   ├── Contact.types.ts
│   └── index.ts
├── data/                 # Static data and content
│   ├── projects.ts
│   ├── skills.ts
│   └── experience.ts
└── styles/               # Additional styling
    └── globals.css       # Global styles
```

## 🎯 Design Patterns

### Component Architecture

**Composition over Inheritance**
```typescript
// Preferred: Composition
const ProjectCard = ({ project, actions, className }: ProjectCardProps) => (
  <Card className={className}>
    <ProjectContent project={project} />
    <ProjectActions>{actions}</ProjectActions>
  </Card>
);

// Usage
<ProjectCard 
  project={project}
  actions={<Button>View Details</Button>}
/>
```

**Container/Presentational Pattern**
```typescript
// Container: Logic and state management
const ProjectsContainer = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<string>('');
  
  const filteredProjects = useMemo(() => 
    projects.filter(p => p.technology.includes(filter)), [projects, filter]
  );

  return (
    <ProjectsView 
      projects={filteredProjects}
      filter={filter}
      onFilterChange={setFilter}
    />
  );
};

// Presentational: Pure UI rendering
const ProjectsView = ({ projects, filter, onFilterChange }: ProjectsViewProps) => (
  <div>
    <ProjectFilter value={filter} onChange={onFilterChange} />
    <ProjectGrid projects={projects} />
  </div>
);
```

### State Management

**Local State (useState)**
- Component-specific UI state
- Form inputs
- Toggle states

**URL State (searchParams)**
- Filters and sorting
- Pagination
- Shareable state

**Context (when needed)**
- Theme preferences
- User preferences
- Global UI state

```typescript
// Theme context example
const ThemeContext = createContext<{
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}>({
  theme: 'system',
  setTheme: () => {},
});
```

## 📱 Responsive Design Strategy

### Breakpoint System
```typescript
// Tailwind breakpoints
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large
};
```

### Mobile-First Approach
```typescript
// Build mobile first, enhance for larger screens
<div className={cn(
  // Mobile (default)
  'flex flex-col space-y-4 p-4',
  // Tablet and up
  'md:flex-row md:space-y-0 md:space-x-6 md:p-6',
  // Desktop and up
  'lg:p-8 lg:space-x-8'
)} />
```

## 🚀 Performance Considerations

### Code Splitting
```typescript
// Lazy load heavy components
const ProjectViewer = lazy(() => import('@/components/ProjectViewer'));

// Use dynamic imports for large dependencies
const Chart = dynamic(() => import('react-chartjs-2'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
```

### Image Optimization
```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/projects/project-1.jpg"
  alt="Project screenshot"
  width={600}
  height={400}
  className="rounded-lg"
  priority={isAboveFold}
/>
```

### Bundle Optimization
- Tree-shaking for unused code
- Dynamic imports for route-based splitting
- Optimize third-party dependencies

## 🔐 Security Considerations

### API Routes
```typescript
// Rate limiting for contact form
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const limiter = rateLimit({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 500,
  });

  await limiter.check(request);
  
  // Process contact form
}
```

### Input Validation
```typescript
// Use Zod for schema validation
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  message: z.string().min(10).max(1000),
});
```

## 📊 SEO Strategy

### Meta Tags
```typescript
// Dynamic meta tags per page
export const generateMetadata = ({ params }: { params: { slug: string } }): Metadata => {
  const project = getProjectBySlug(params.slug);
  
  return {
    title: `${project.title} | Kevin Geng`,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: [project.image],
    },
  };
};
```

### Structured Data
```typescript
// JSON-LD for better search visibility
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Kevin Geng',
  jobTitle: 'Software Engineer',
  url: 'https://kgeng.dev',
  sameAs: [
    'https://linkedin.com/in/kevingeng',
    'https://github.com/kevingeng'
  ]
};
```

## 🧪 Testing Strategy

### Component Testing
```typescript
// React Testing Library for component tests
import { render, screen } from '@testing-library/react';
import { ProjectCard } from './ProjectCard';

test('renders project information', () => {
  const mockProject = {
    title: 'Test Project',
    description: 'A test project'
  };
  
  render(<ProjectCard project={mockProject} />);
  
  expect(screen.getByText('Test Project')).toBeInTheDocument();
});
```

### Integration Testing
- API route testing with Vitest
- End-to-end testing with Playwright (for critical paths)

## 🚀 Deployment Strategy

### Vercel Configuration
```typescript
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "app/api/contact/route.ts": {
      "maxDuration": 10
    }
  }
}
```

### Environment Management
- Development: Local environment
- Preview: Feature branch deployments
- Production: Main branch deployment

## 📈 Monitoring & Analytics

### Performance Monitoring
- Core Web Vitals tracking
- Error boundaries for graceful failures
- Performance monitoring with Vercel Analytics

### User Analytics
- Privacy-first analytics
- Goal tracking for contact form submissions
- Page performance metrics