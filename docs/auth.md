# Authentication

## Provider: Clerk

This app uses **Clerk** for all authentication. Do not implement custom auth, sessions, JWTs, or any other auth mechanism.

## Getting the current user

Always use Clerk's `auth()` helper (server-side) or `useAuth()` / `useUser()` hooks (client-side) to access the current user.

### In Server Components and data helpers

```ts
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
if (!userId) throw new Error("Unauthenticated");
```

Use this pattern in every `/data` helper to scope queries to the authenticated user. See `docs/data-fetching.md` for the full data access rules.

### In Client Components

```tsx
"use client";
import { useAuth, useUser } from "@clerk/nextjs";

const { userId, isLoaded, isSignedIn } = useAuth();
const { user } = useUser();
```

Only reach for client-side Clerk hooks when the component must be a Client Component for another reason. Prefer Server Components and `auth()`.

## Middleware

Route protection must be handled via Clerk middleware in `middleware.ts` at the project root. Use `clerkMiddleware` with `createRouteMatcher` to define public vs. protected routes.

```ts
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
```

## Sign-in and sign-up pages

Use Clerk's hosted or embedded `<SignIn>` and `<SignUp>` components. Do not build custom auth forms.

```tsx
// src/app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return <SignIn />;
}
```

## User identity in the database

Store Clerk's `userId` (a string like `user_2abc...`) as the `userId` column in all database tables that belong to a user. Do not store passwords or create a separate users table for auth purposes.

## Summary of rules

| Rule | Requirement |
|------|-------------|
| Auth provider | Clerk only |
| Server-side user ID | `auth()` from `@clerk/nextjs/server` |
| Client-side user info | `useAuth()` / `useUser()` from `@clerk/nextjs` |
| Route protection | Clerk middleware in `middleware.ts` |
| Auth UI | Clerk `<SignIn>` / `<SignUp>` components |
| User ID storage | Clerk `userId` string on all user-owned tables |
| Custom auth | Not allowed |
