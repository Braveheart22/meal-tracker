# Data Fetching

## Server Components only

All data fetching must be done exclusively via **React Server Components**. Do not create API route handlers (e.g. `app/api/...`) for the purpose of fetching data within this app.

## Database queries

All database queries must be performed via helper functions located in the `/data` directory (e.g. `src/data/meals.ts`).

These helper functions must use **Drizzle ORM** to query the database. Raw SQL is not permitted.

## Data access rules

A logged-in user may only access their own data. Every query helper must scope results to the authenticated user's ID. Under no circumstances should a query return data belonging to another user.

### Example pattern

```ts
// src/data/meals.ts
import { db } from "@/db";
import { meals } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth"; // however auth is exposed in this project

export async function getMealsForDate(date: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthenticated");

  return db
    .select()
    .from(meals)
    .where(and(eq(meals.userId, session.user.id), eq(meals.date, date)));
}
```

Then call the helper directly from a Server Component:

```tsx
// src/app/dashboard/page.tsx
import { getMealsForDate } from "@/data/meals";

export default async function DashboardPage() {
  const meals = await getMealsForDate("2026-04-16");
  return <MealList meals={meals} />;
}
```

## Summary of rules

| Rule | Requirement |
|------|-------------|
| Data fetching location | Server Components only |
| Route handlers for data | Not allowed |
| Query method | Drizzle ORM via `/data` helpers |
| Raw SQL | Not allowed |
| Data scoping | Always filter by authenticated user ID |
