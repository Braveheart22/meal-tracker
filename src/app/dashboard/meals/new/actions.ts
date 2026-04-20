"use server";

import { z } from "zod";
import { createMealWithItems } from "@/data/meals";
import { revalidatePath } from "next/cache";

const foodItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  calories: z.number().nonnegative().nullable(),
  protein: z.number().nonnegative().nullable(),
  carbs: z.number().nonnegative().nullable(),
  fat: z.number().nonnegative().nullable(),
});

const createMealSchema = z.object({
  name: z.string().min(1),
  loggedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/).refine(
    (s) => !isNaN(new Date(s + "Z").getTime()),
    { message: "Invalid date/time value" }
  ),
  foodItems: z.array(foodItemSchema).min(1, "Add at least one food item"),
});

export type CreateMealInput = z.infer<typeof createMealSchema>;

export type CreateMealResult =
  | { ok: true; redirectTo: string }
  | { ok: false; error: string };

export async function createMealAction(data: CreateMealInput): Promise<CreateMealResult> {
  try {
    const parsed = createMealSchema.parse(data);

    await createMealWithItems(
      { name: parsed.name, loggedAt: new Date(parsed.loggedAt + "Z") },
      parsed.foodItems
    );

    revalidatePath("/dashboard");
    return { ok: true, redirectTo: `/dashboard?date=${parsed.loggedAt.split("T")[0]}` };
  } catch (err) {
    console.error("[createMealAction]", err);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
