import { pgTable, uuid, text, real, timestamp, index } from "drizzle-orm/pg-core";

export const meals = pgTable(
  "meals",
  {
    id:        uuid("id").primaryKey().defaultRandom(),
    userId:    text("user_id").notNull(),
    name:      text("name"),
    loggedAt:  timestamp("logged_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("meals_user_id_idx").on(t.userId),
    index("meals_logged_at_idx").on(t.loggedAt),
  ]
);

export const foodItems = pgTable(
  "food_items",
  {
    id:        uuid("id").primaryKey().defaultRandom(),
    mealId:    uuid("meal_id").notNull().references(() => meals.id, { onDelete: "cascade" }),
    name:      text("name").notNull(),
    quantity:  real("quantity").notNull(),
    unit:      text("unit").notNull(),
    calories:  real("calories"),
    protein:   real("protein"),
    carbs:     real("carbs"),
    fat:       real("fat"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("food_items_meal_id_idx").on(t.mealId)]
);

export const mealFoodItems = pgTable(
  "meal_food_items",
  {
    id:         uuid("id").primaryKey().defaultRandom(),
    mealId:     uuid("meal_id").notNull().references(() => meals.id, { onDelete: "cascade" }),
    foodItemId: uuid("food_item_id").notNull().references(() => foodItems.id, { onDelete: "cascade" }),
    quantity:   real("quantity").notNull(),
  },
  (t) => [
    index("meal_food_items_meal_id_idx").on(t.mealId),
    index("meal_food_items_food_item_id_idx").on(t.foodItemId),
  ]
);

export type MealFoodItem    = typeof mealFoodItems.$inferSelect;
export type NewMealFoodItem = typeof mealFoodItems.$inferInsert;

export type Meal        = typeof meals.$inferSelect;
export type NewMeal     = typeof meals.$inferInsert;
export type FoodItem    = typeof foodItems.$inferSelect;
export type NewFoodItem = typeof foodItems.$inferInsert;
