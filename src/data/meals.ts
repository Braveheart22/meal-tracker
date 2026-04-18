import { db } from "@/db";
import { meals, foodItems, mealFoodItems } from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";
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
        lt(meals.loggedAt, end)
      )
    );

  // Group by meal and sum calories
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

export async function addFoodItemToMeal(
  mealId: string,
  item: { name: string; quantity: number; unit: string; calories: number | null; protein: number | null; carbs: number | null; fat: number | null }
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
