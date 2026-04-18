import { db } from "@/db";
import { meals, foodItems, mealFoodItems } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export type MealWithCalories = {
  id: string;
  name: string | null;
  loggedAt: Date;
  totalCalories: number;
};

export async function getMealsForDate(date: Date): Promise<MealWithCalories[]> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  // Bounds are computed in UTC to match how loggedAt is stored
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);

  const rows = await db
    .select({
      id: meals.id,
      name: meals.name,
      loggedAt: meals.loggedAt,
      calories: foodItems.calories,
    })
    .from(meals)
    .leftJoin(mealFoodItems, eq(mealFoodItems.mealId, meals.id))
    .leftJoin(foodItems, eq(foodItems.id, mealFoodItems.foodItemId))
    .where(
      and(
        eq(meals.userId, userId),
        gte(meals.loggedAt, start),
        lte(meals.loggedAt, end)
      )
    );

  const mealMap = new Map<string, MealWithCalories>();
  for (const row of rows) {
    if (!mealMap.has(row.id)) {
      mealMap.set(row.id, {
        id: row.id,
        name: row.name,
        loggedAt: row.loggedAt,
        totalCalories: 0,
      });
    }
    if (row.calories != null) {
      mealMap.get(row.id)!.totalCalories += row.calories;
    }
  }

  return Array.from(mealMap.values()).sort(
    (a, b) => a.loggedAt.getTime() - b.loggedAt.getTime()
  );
}

export async function addMeal(data: { name: string; loggedAt: Date }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const [meal] = await db
    .insert(meals)
    .values({ ...data, userId })
    .returning({ id: meals.id });

  return meal;
}

export type MealWithFoodItems = {
  id: string;
  name: string | null;
  loggedAt: Date;
  foodItems: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
  }[];
};

export async function getMealById(mealId: string): Promise<MealWithFoodItems | null> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const [meal] = await db
    .select()
    .from(meals)
    .where(and(eq(meals.id, mealId), eq(meals.userId, userId)));

  if (!meal) return null;

  const items = await db
    .select()
    .from(foodItems)
    .where(eq(foodItems.mealId, mealId));

  return {
    id: meal.id,
    name: meal.name,
    loggedAt: meal.loggedAt,
    foodItems: items.map((fi) => ({
      id: fi.id,
      name: fi.name,
      quantity: fi.quantity,
      unit: fi.unit,
      calories: fi.calories ?? null,
      protein: fi.protein ?? null,
      carbs: fi.carbs ?? null,
      fat: fi.fat ?? null,
    })),
  };
}

type FoodItemData = {
  name: string;
  quantity: number;
  unit: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
};

export async function updateMealWithItems(
  mealId: string,
  mealData: { name: string; loggedAt: Date },
  itemUpdates: { id: string; data: FoodItemData }[],
  itemInserts: FoodItemData[],
  deletedFoodItemIds: string[]
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  await db.transaction(async (tx) => {
    const [meal] = await tx
      .select({ id: meals.id })
      .from(meals)
      .where(and(eq(meals.id, mealId), eq(meals.userId, userId)));
    if (!meal) throw new Error("Meal not found");

    await tx
      .update(meals)
      .set(mealData)
      .where(eq(meals.id, mealId));

    for (const id of deletedFoodItemIds) {
      await tx.delete(foodItems).where(and(eq(foodItems.id, id), eq(foodItems.mealId, mealId)));
    }

    for (const { id, data } of itemUpdates) {
      await tx
        .update(foodItems)
        .set(data)
        .where(and(eq(foodItems.id, id), eq(foodItems.mealId, mealId)));
      await tx
        .update(mealFoodItems)
        .set({ quantity: data.quantity })
        .where(and(eq(mealFoodItems.foodItemId, id), eq(mealFoodItems.mealId, mealId)));
    }

    for (const item of itemInserts) {
      const [foodItem] = await tx
        .insert(foodItems)
        .values({ ...item, mealId })
        .returning({ id: foodItems.id });
      await tx.insert(mealFoodItems).values({ mealId, foodItemId: foodItem.id, quantity: item.quantity });
    }
  });
}

export async function addFoodItemToMeal(
  mealId: string,
  item: FoodItemData
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const [meal] = await db.select().from(meals).where(and(eq(meals.id, mealId), eq(meals.userId, userId)));
  if (!meal) throw new Error("Meal not found");

  return db.transaction(async (tx) => {
    const [foodItem] = await tx.insert(foodItems).values({ ...item, mealId }).returning({ id: foodItems.id });
    await tx.insert(mealFoodItems).values({ mealId, foodItemId: foodItem.id, quantity: item.quantity });
    return foodItem;
  });
}
