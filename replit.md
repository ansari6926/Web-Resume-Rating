# ResumeRate - Resume Review & Strength Evaluation Platform

## Overview

ResumeRate is a full-stack web application for structured resume review and strength evaluation. Students upload resumes and receive scored feedback from recruiters, with automatic strength level calculation (Strong/Average/Weak) and version tracking. The platform has two user roles — students who upload and track resumes, and recruiters who review and score them.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, bundled via Vite
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: TanStack React Query for server state, no global client state library
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives with Tailwind CSS
- **Forms**: React Hook Form with Zod resolvers for validation
- **Styling**: Tailwind CSS with CSS variables for theming, custom fonts (Outfit for display, Plus Jakarta Sans for body)
- **Animations**: Framer Motion (used in CircularStrength component)
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript, executed via tsx
- **Authentication**: Passport.js with local strategy (username/password), express-session with PostgreSQL session store (connect-pg-simple)
- **Password hashing**: Node crypto scrypt with random salt
- **API pattern**: RESTful JSON API under `/api/` prefix, route definitions shared between client and server via `shared/routes.ts`

### Data Layer
- **Database**: PostgreSQL (required, connection via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with drizzle-zod for schema-to-validation integration
- **Schema location**: `shared/schema.ts` — shared between client and server
- **Migrations**: Managed via `drizzle-kit push` (no migration files committed, schema pushed directly)

### Database Schema
Three main tables:
1. **users** — id, username (unique), password (hashed), name, role (student/recruiter)
2. **resumes** — id, studentId, studentName, title, filePath, version (auto-incremented per student), createdAt
3. **reviews** — id, resumeId, recruiterId, score (0-100), comments (JSON string with structured feedback), strengthLevel (Weak/Average/Strong), createdAt

Relations: resumes belong to users (student), reviews belong to resumes and users (recruiter).

### Shared Code (`shared/` directory)
- `schema.ts` — Drizzle table definitions, relations, Zod insert schemas, and TypeScript types
- `routes.ts` — API contract definitions with paths, methods, Zod input/output schemas. Used by both client hooks and server routes for type safety.

### Build System
- **Development**: Vite dev server with HMR proxied through Express
- **Production build**: Client built with Vite, server bundled with esbuild into `dist/index.cjs`
- **Build script**: `script/build.ts` handles both client and server builds, with an allowlist of dependencies to bundle (reducing cold start syscalls)

### Key Design Decisions
1. **Shared route contracts**: API routes are defined once in `shared/routes.ts` with Zod schemas, ensuring type safety across client and server without code generation.
2. **Session-based auth over JWT**: Uses server-side sessions stored in PostgreSQL for simplicity and security. Session secret defaults to a hardcoded value but should use `SESSION_SECRET` env var in production.
3. **Simulated file upload**: Resume file upload is currently simulated with text input (filePath field) rather than actual file upload with multer/FormData. The infrastructure for real file upload would need to be added.
4. **Role-based access**: Backend filters data by user role — students see only their resumes, recruiters see all resumes. Frontend redirects users to appropriate dashboards.
5. **Version tracking**: Each resume upload for a student auto-increments the version number by querying the latest version.

## External Dependencies

### Required Services
- **PostgreSQL Database**: Required. Connection string via `DATABASE_URL` environment variable. Used for application data and session storage.

### Key npm Packages
- **drizzle-orm** + **drizzle-kit**: ORM and migration tooling for PostgreSQL
- **express** (v5): HTTP server framework
- **passport** + **passport-local**: Authentication
- **connect-pg-simple**: PostgreSQL session store
- **@tanstack/react-query**: Server state management
- **wouter**: Client-side routing
- **zod** + **drizzle-zod**: Schema validation shared across stack
- **framer-motion**: UI animations
- **react-hook-form** + **@hookform/resolvers**: Form handling
- **shadcn/ui ecosystem**: Radix UI primitives, class-variance-authority, clsx, tailwind-merge, lucide-react icons

### Environment Variables
- `DATABASE_URL` (required) — PostgreSQL connection string
- `SESSION_SECRET` (recommended) — Secret for signing session cookies, defaults to `r3pl1t_s3cr3t`
- `NODE_ENV` — Set to `production` for production builds, `development` for dev server