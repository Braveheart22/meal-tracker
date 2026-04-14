# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
