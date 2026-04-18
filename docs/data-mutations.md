# Data Mutations

## Server Actions only

All data mutations must be performed via **Next.js Server Actions**. Do not create API route handlers (e.g. `app/api/...`) for the purpose of mutating data.

## Co-location

Server Actions must live in files named `actions.ts` co-located with the route or feature they serve (e.g. `src/app/dashboard/actions.ts`). Do not define Server Actions inside page or component files.

Every `actions.ts` file must begin with the `"use server"` directive.

## Database mutations

All database writes (insert, update, delete) must be performed via helper functions located in the `/data` directory (e.g. `src/data/meals.ts`).

These helper functions must use **Drizzle ORM**. Raw SQL is not permitted.

Server Actions call `/data` helpers — they do not interact with the database directly.

## Data access rules

Every mutation helper must verify the authenticated user and scope the operation to their own data. A user must never be able to mutate another user's records.

## Parameter types

All Server Action parameters must have **explicit TypeScript types**. The `FormData` type is not permitted — actions must accept typed objects instead.

## Validation with Zod

Every Server Action must validate its arguments with **Zod** before passing them to a `/data` helper. Define schemas in the same `actions.ts` file.

## Example pattern

```ts
// src/data/meals.ts
import { db } from "@/db";
import { meals } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function addMeal(data: { date: string; description: string; calories: number }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  await db.insert(meals).values({ ...data, userId });
}

export async function deleteMeal(id: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  await db.delete(meals).where(and(eq(meals.id, id), eq(meals.userId, userId)));
}
```

```ts
// src/app/dashboard/actions.ts
"use server";

import { z } from "zod";
import { addMeal, deleteMeal } from "@/data/meals";
import { revalidatePath } from "next/cache";

const addMealSchema = z.object({
  date: z.string(),
  description: z.string().min(1),
  calories: z.number().int().positive(),
});

const deleteMealSchema = z.object({
  id: z.number().int().positive(),
});

export async function addMealAction(data: { date: string; description: string; calories: number }) {
  const parsed = addMealSchema.parse(data);
  await addMeal(parsed);
  revalidatePath("/dashboard");
}

export async function deleteMealAction(id: number) {
  const { id: parsedId } = deleteMealSchema.parse({ id });
  await deleteMeal(parsedId);
  revalidatePath("/dashboard");
}
```

Then call the action from a Client Component:

```tsx
// src/app/dashboard/SomeMealForm.tsx
"use client";

import { addMealAction } from "./actions";

export function AddMealForm() {
  async function handleSubmit() {
    await addMealAction({ date: "2026-04-17", description: "Oatmeal", calories: 300 });
  }

  return <Button onClick={handleSubmit}>Add Meal</Button>;
}
```

## Summary of rules

| Rule | Requirement |
|------|-------------|
| Mutation mechanism | Server Actions only |
| API route handlers for mutations | Not allowed |
| Server Action file name | `actions.ts`, co-located with the feature |
| `"use server"` directive | Required at top of every `actions.ts` |
| Parameter types | Explicit TypeScript types — no `FormData` |
| Argument validation | Zod, defined in the same `actions.ts` file |
| Database interaction | Drizzle ORM via `/data` helpers only |
| Raw SQL | Not allowed |
| Direct DB calls in Server Actions | Not allowed — always go through `/data` helpers |
| Data scoping | Always verify auth and filter by authenticated user ID |
