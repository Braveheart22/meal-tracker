"use server";

import { z } from "zod";
import { updateMealWithItems } from "@/data/meals";
import { revalidatePath } from "next/cache";

const LOOSE_UUID = /^[0-9a-f-]{36}$/i;
const LOCAL_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;

const foodItemSchema = z.object({
  id: z.string().regex(LOOSE_UUID).nullable(),
  name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  calories: z.number().nonnegative().nullable(),
  protein: z.number().nonnegative().nullable(),
  carbs: z.number().nonnegative().nullable(),
  fat: z.number().nonnegative().nullable(),
});

const updateMealSchema = z.object({
  mealId: z.string().regex(LOOSE_UUID),
  name: z.string().min(1),
  loggedAt: z.string().regex(LOCAL_DATETIME),
  foodItems: z.array(foodItemSchema).min(1, "Add at least one food item"),
  deletedFoodItemIds: z.array(z.string().regex(LOOSE_UUID)),
});

export type UpdateMealInput = z.infer<typeof updateMealSchema>;

export type UpdateMealResult =
  | { ok: true; redirectTo: string }
  | { ok: false; error: string };

export async function updateMealAction(data: UpdateMealInput): Promise<UpdateMealResult> {
  try {
    const parsed = updateMealSchema.parse(data);

    const itemUpdates = parsed.foodItems
      .filter((item) => item.id !== null)
      .map((item) => ({ id: item.id!, data: { name: item.name, quantity: item.quantity, unit: item.unit, calories: item.calories, protein: item.protein, carbs: item.carbs, fat: item.fat } }));

    const itemInserts = parsed.foodItems
      .filter((item) => item.id === null)
      .map((item) => ({ name: item.name, quantity: item.quantity, unit: item.unit, calories: item.calories, protein: item.protein, carbs: item.carbs, fat: item.fat }));

    await updateMealWithItems(
      parsed.mealId,
      { name: parsed.name, loggedAt: new Date(parsed.loggedAt + "Z") },
      itemUpdates,
      itemInserts,
      parsed.deletedFoodItemIds
    );

    revalidatePath("/dashboard");
    const dateStr = parsed.loggedAt.split("T")[0];
    return { ok: true, redirectTo: `/dashboard?date=${dateStr}` };
  } catch (err) {
    console.error("[updateMealAction]", err);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
