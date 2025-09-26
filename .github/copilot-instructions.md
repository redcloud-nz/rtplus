# RT+ Copilot Instructions

RT+ is a Next.js 15 web application for managing response teams, built with authentication, multi-tenancy, and D4H integration.

## Architecture Overview

**Route Structure**: Uses Next.js App Router with route groups:
- `(public)/` - Marketing pages, auth flows
- `(authenticated)/` - Main app requiring auth + onboarding
- Custom middleware handles auth, onboarding status, and system admin access

**Key Integration**: D4H API client (`src/lib/d4h-api/`) provides external team management sync with custom React Query hooks and OpenAPI-generated types.

**Data Flow**: 
- tRPC routers (`src/trpc/routers/`) provide type-safe API endpoints
- Prisma with PostgreSQL for persistence
- Clerk for authentication with custom claims (org_slug, onboarding_status)
- Server/client boundary clearly marked with 'use server'/'use client'

## Essential Patterns

**Component Layout**:
```tsx
<AppPage>
    <AppPageBreadcrumbs breadcrumbs={[...]} />
    <AppPageContent variant="centered">
        {/* content */}
    </AppPageContent>
</AppPage>
```

**Navigation**: Centralized in `src/paths.ts` - all routes defined as typed objects with href, label, icon properties.

**Schemas**: Zod schemas in `src/lib/schemas/` with branded types (e.g., `TeamId`) and validation utilities in `src/lib/validation.ts`.

**ID Generation**: Use `nanoId8()` from `src/lib/id.ts` for all entity IDs.

## Development Workflow

**Database**: `npm run prisma migrate dev -- --name "description"` for schema changes
**Testing**: Vitest with jsdom setup, run `npm test` or `npm run test:watch`
**Development**: `npm run dev` with environment loaded from `.env.local`

**Component Organization**:
- `src/components/ui/` - shadcn/ui components
- `src/components/app-page.tsx` - App layout wrapper
- `src/components/nav/` - Sidebar navigation components
- `src/components/cards/` - Feature-specific card components

## Critical Conventions

- **File naming**: kebab-case for files/dirs, PascalCase for components
- **Path imports**: Use `@/` alias, always absolute paths for tools
- **Team context**: Many features are team-scoped via URL params `[team_slug]`
- **Permissions**: System admin routes under `/system`, team-specific under `/teams/[team_slug]`
- **Error handling**: Use `boundary.tsx` components for error boundaries