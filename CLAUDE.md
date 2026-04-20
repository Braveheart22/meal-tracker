# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT: Docs-first rule

Before generating any code, **always read the relevant file(s) in the `/docs` directory first**. The `/docs` directory contains coding standards and conventions that all generated code must follow. Do not write code for a given domain until the applicable doc has been consulted.

## IMPORTANT: Data fetching rules

See `docs/data-fetching.md` for full details. Key rules:

- All data fetching must be done via **Server Components only**
- **No API route handlers** may be created to fetch data
- All database queries must go through **Drizzle ORM helper functions** in the `/data` directory
- **No raw SQL**
- Every query must be scoped to the **authenticated user's ID** — users must never access another user's data

## IMPORTANT: Authentication rules

See `docs/auth.md` for full details. Key rules:

- Authentication is handled exclusively by **Clerk** — no custom auth
- Use `auth()` from `@clerk/nextjs/server` in Server Components and `/data` helpers
- Use `useAuth()` / `useUser()` from `@clerk/nextjs` in Client Components
- Route protection must be handled via **Clerk middleware** in `middleware.ts`
- Auth UI must use Clerk's `<SignIn>` / `<SignUp>` components — no custom auth forms
- Store Clerk's `userId` string on all user-owned database tables

## IMPORTANT: Data mutation rules

See `docs/data-mutations.md` for full details. Key rules:

- All mutations must be performed via **Server Actions only** — no API route handlers
- Server Actions must live in co-located **`actions.ts`** files with `"use server"` at the top
- All database writes must go through **Drizzle ORM helper functions** in the `/data` directory — Server Actions must not call the database directly
- **No raw SQL**
- Every mutation must be scoped to the **authenticated user's ID**
- All Server Action parameters must have **explicit TypeScript types** — `FormData` is not permitted
- All Server Action arguments must be **validated with Zod** before being passed to `/data` helpers

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
```

No test framework is configured yet.

## Architecture

This is a **Next.js 16 App Router** project with **React 19**, **TypeScript**, and **Tailwind CSS v4**.

- `src/app/` — App Router pages and layouts
  - `layout.tsx` — Root layout with Geist fonts and metadata
  - `page.tsx` — Home page
  - `globals.css` — Tailwind import and CSS theme variables (`--background`, `--foreground`, `--font-sans`, `--font-mono`)
- `public/` — Static assets

**Path alias:** `@/*` resolves to `./src/*`

**Tailwind v4** is configured via PostCSS (`postcss.config.mjs`), not a `tailwind.config.js`. Theme customization uses `@theme inline` in `globals.css`.
