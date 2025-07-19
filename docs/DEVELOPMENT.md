# Development Workflow

This document outlines the development workflow, best practices, and conventions for the Kevin Geng portfolio project.

## 🔄 Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development integration branch
- `feature/*` - Feature development branches
- `hotfix/*` - Critical bug fixes

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, missing semi colons, etc)
- `refactor` - Code changes that neither fix a bug nor add a feature
- `perf` - Performance improvements
- `test` - Adding missing tests
- `chore` - Maintenance tasks

**Examples:**
```bash
feat(components): add hero section with animation
fix(navigation): resolve mobile menu closing issue
docs: update README with deployment instructions
```

### Pull Request Process

1. Create feature branch from `develop`
2. Make changes with clear, atomic commits
3. Run linting, type checking, and tests
4. Create PR with descriptive title and body
5. Request code review
6. Address feedback and update
7. Merge after approval

### Code Quality Checks

Before committing, ensure:
```bash
npm run lint          # ESLint checks
npm run type-check    # TypeScript checks
npm run format:check  # Prettier formatting
npm run build        # Production build test
```

## 🛠 Development Setup

### Environment Variables

Create `.env.local` for local development:
```bash
# Analytics (optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id

# Contact form (if implemented)
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_TEMPLATE_ID=your_emailjs_template_id
EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

### VS Code Configuration

Recommended extensions:
- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- ESLint

### Local Development

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Open in browser
open http://localhost:3000
```

## 📋 Code Review Checklist

### General
- [ ] Code follows established patterns and conventions
- [ ] No console.logs or debugging code left behind
- [ ] Proper error handling implemented
- [ ] Performance implications considered

### React/TypeScript
- [ ] Components are properly typed
- [ ] Props interfaces are defined
- [ ] Custom hooks follow naming convention (use*)
- [ ] No any types used without justification
- [ ] Accessibility attributes included where needed

### Styling
- [ ] Responsive design implemented
- [ ] Tailwind classes used consistently
- [ ] Dark mode considerations (if applicable)
- [ ] No magic numbers in styles

### Performance
- [ ] Images optimized and use Next.js Image component
- [ ] Code splitting implemented where beneficial
- [ ] Unnecessary re-renders avoided
- [ ] Bundle size impact considered

## 🚀 Deployment

### Vercel Deployment

The project is configured for automatic deployment on Vercel:

1. Push to `main` branch triggers production deployment
2. Feature branches create preview deployments
3. Environment variables configured in Vercel dashboard

### Manual Deployment

```bash
# Build for production
npm run build

# Test production build locally
npm run start

# Deploy (if using Vercel CLI)
vercel --prod
```

## 🐛 Troubleshooting

### Common Issues

**TypeScript errors after dependency updates:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Build failures:**
```bash
npm run type-check  # Check for TypeScript errors
npm run lint        # Check for linting errors
```

**Performance issues:**
- Use React DevTools Profiler
- Check bundle size with `npm run build`
- Optimize images and assets