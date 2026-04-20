"use server";

import { z } from "zod";
import { updateMealWithItems, addFoodItemToMeal, deleteFoodItemFromMeal, updateMealMeta } from "@/data/meals";
import { revalidatePath } from "next/cache";

const LOOSE_UUID = /^[0-9a-f-]{36}$/i;
const LOCAL_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
const validLocalDatetime = (s: string) => !isNaN(new Date(s + "Z").getTime());
const localDatetimeField = z
  .string()
  .regex(LOCAL_DATETIME)
  .refine(validLocalDatetime, { message: "Invalid date/time value" });

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
  loggedAt: localDatetimeField,
  foodItems: z.array(foodItemSchema).min(1, "Add at least one food item"),
  deletedFoodItemIds: z.array(z.string().regex(LOOSE_UUID)),
});

export type UpdateMealInput = z.infer<typeof updateMealSchema>;

export type UpdateMealResult =
  | { ok: true; redirectTo: string }
  | { ok: false; error: string };

const addFoodItemSchema = z.object({
  mealId: z.string().regex(LOOSE_UUID),
  name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  calories: z.number().nonnegative().nullable(),
  protein: z.number().nonnegative().nullable(),
  carbs: z.number().nonnegative().nullable(),
  fat: z.number().nonnegative().nullable(),
});

export type AddFoodItemInput = z.infer<typeof addFoodItemSchema>;
export type AddFoodItemResult = { ok: true } | { ok: false; error: string };

export async function addFoodItemAction(data: AddFoodItemInput): Promise<AddFoodItemResult> {
  try {
    const parsed = addFoodItemSchema.parse(data);
    await addFoodItemToMeal(parsed.mealId, {
      name: parsed.name,
      quantity: parsed.quantity,
      unit: parsed.unit,
      calories: parsed.calories,
      protein: parsed.protein,
      carbs: parsed.carbs,
      fat: parsed.fat,
    });
    revalidatePath(`/dashboard/meals/${parsed.mealId}`);
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    console.error("[addFoodItemAction]", err);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

const deleteFoodItemSchema = z.object({
  mealId: z.string().regex(LOOSE_UUID),
  foodItemId: z.string().regex(LOOSE_UUID),
});

export type DeleteFoodItemInput = z.infer<typeof deleteFoodItemSchema>;
export type DeleteFoodItemResult = { ok: true } | { ok: false; error: string };

export async function deleteFoodItemAction(data: DeleteFoodItemInput): Promise<DeleteFoodItemResult> {
  try {
    const parsed = deleteFoodItemSchema.parse(data);
    await deleteFoodItemFromMeal(parsed.mealId, parsed.foodItemId);
    revalidatePath(`/dashboard/meals/${parsed.mealId}`);
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    console.error("[deleteFoodItemAction]", err);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

const updateMealMetaSchema = z.object({
  mealId: z.string().regex(LOOSE_UUID),
  name: z.string().min(1),
  loggedAt: localDatetimeField,
});

export type UpdateMealMetaInput = z.infer<typeof updateMealMetaSchema>;
export type UpdateMealMetaResult = { ok: true } | { ok: false; error: string };

export async function updateMealMetaAction(data: UpdateMealMetaInput): Promise<UpdateMealMetaResult> {
  try {
    const parsed = updateMealMetaSchema.parse(data);
    await updateMealMeta(parsed.mealId, { name: parsed.name, loggedAt: new Date(parsed.loggedAt + "Z") });
    revalidatePath(`/dashboard/meals/${parsed.mealId}`);
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    console.error("[updateMealMetaAction]", err);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

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
