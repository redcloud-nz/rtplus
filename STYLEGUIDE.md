# RTPlus Project Styleguide

## Table of Contents
- [File Organization](#file-organization)
- [Naming Conventions](#naming-conventions)
- [TypeScript & React Patterns](#typescript--react-patterns)
- [Component Structure](#component-structure)
- [Import Organization](#import-organization)
- [UI & Styling](#ui--styling)
- [Metadata & SEO](#metadata--seo)

## File Organization

### Directory Structure
```
src/
├── app/                        # Next.js App Router pages
│   ├── app/                    # Main application routes
│   │   ├── system/             # System-related pages
│   │   ├── team/[team_slug]/   # Team specific pages
│   │   └── ...
├── components/                 # Reusable components
│   ├── app-page/               # App-specific layout components
│   ├── ui/                     # General UI components
│   └── ...
├── paths/                      # Route path definitions
└── ...
```

### File Naming
- Use `kebab-case` for directories and files
- React components: `PascalCase` (exported as default)
- Pages: descriptive names ending with `Page` (e.g., `TeamsPage`)
- Special files: `loading.tsx`, `error.tsx`, `page.tsx`

## Naming Conventions

### Components
```tsx
// ✅ Good
export default function TeamsPage() { }
export function LoadingSpinner() { }

// ❌ Avoid
export default function teamsPage() { }
export function loadingspinner() { }
```

### Variables & Functions
```tsx
// ✅ Good
const userPreferences = {}
const handleUserClick = () => {}

// ❌ Avoid
const UserPreferences = {}
const HandleUserClick = () => {}
```

## TypeScript & React Patterns

### Component Definition
```tsx
// ✅ Preferred pattern
export default async function ComponentName() {
    return <div>Content</div>
}

// For non-page components
export function ComponentName() {
    return <div>Content</div>
}
```

### Async Components
- Use `async` functions for server components that need data fetching
- Keep client-side components synchronous unless necessary

### Props Interface
```tsx
interface ComponentProps {
    title: string
    isVisible?: boolean
    children?: React.ReactNode
}

export function Component({ title, isVisible = true, children }: ComponentProps) {
    return <div>{title}</div>
}
```

## Component Structure

### Layout Components Pattern
```tsx
<AppPage>
    <AppPageBreadcrumbs breadcrumbs={[...]} />
    <AppPageContent variant="centered">
        {/* Main content */}
    </AppPageContent>
</AppPage>
```

### Loading States
```tsx
<AppPageContent variant="centered">
    <div className="w-full h-full flex flex-col items-center justify-center">
        <LoadingSpinner className="w-32 h-32"/>
        <div className="p-4">Loading message</div>
    </div>
</AppPageContent>
```

## Import Organization

### 

### Import Order
1. External libraries (React, Next.js, etc.)
2. Internal components (absolute imports with @/)
3. Relative imports
4. Type imports (when needed)

```tsx
// ✅ Good organization
import { Metadata } from 'next'
import React from 'react'

import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

import { AppPage, AppPageBreadcrumbs, AppPageContent } from '@/components/app-page'
import { LoadingSpinner } from '@/components/ui/loading'
import * as Paths from '@/paths'
```

### Path Aliases
- Use `@/` for absolute imports from src directory
- Import entire modules as namespaces when appropriate (`* as Paths`)

### React Imports
Import individual items rather than entire name space.

```ts
// ✅ Good
import { ComponentProps } from 'react'

// ❌ Avoid
import React from 'react'
import * as React from 'react'
```

## UI & Styling

### CSS Classes
- Use Tailwind CSS utility classes
- Follow responsive design patterns
- Use semantic class combinations

```tsx
// ✅ Good
<div className="w-full h-full flex flex-col items-center justify-center">
    <LoadingSpinner className="w-32 h-32"/>
    <div className="p-4">Content</div>
</div>
```

### Component Variants
- Use `variant` props for component variations
- Keep variants descriptive (`"centered"`, `"wide"`, etc.)
- Use `tailwind-variants` library.

## Metadata & SEO

### Page Metadata
```tsx
// ✅ Required for all pages
export const metadata: Metadata = { 
    title: "Page Title"
}
```

### File Headers
```tsx
/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /relative/path/from/app
 */
```

## Best Practices

### Do's
- ✅ Use TypeScript strict mode
- ✅ Export default for page components
- ✅ Use semantic HTML elements
- ✅ Follow Next.js App Router conventions
- ✅ Use absolute imports with path aliases
- ✅ Include proper metadata for pages
- ✅ Use async components for server-side data fetching

### Don'ts
- ❌ Avoid inline styles
- ❌ Don't use `any` type in TypeScript
- ❌ Avoid deep nesting of components
- ❌ Don't forget accessibility attributes
- ❌ Avoid mixing client and server component patterns incorrectly

## Code Review Checklist

- [ ] File follows naming conventions
- [ ] Imports are organized correctly
- [ ] Component uses proper TypeScript types
- [ ] UI follows established patterns
- [ ] Metadata is included for pages
- [ ] Copyright header is present
- [ ] Accessibility considerations addressed
- [ ] Performance optimizations applied where relevant
