import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MealWithFoodItems } from "@/data/meals";

interface NutritionTotalsProps {
  foodItems: MealWithFoodItems["foodItems"];
}

export function NutritionTotals({ foodItems }: NutritionTotalsProps) {
  const allNull = (key: "calories" | "protein" | "carbs" | "fat") =>
    foodItems.every((fi) => fi[key] == null);

  const sum = (key: "calories" | "protein" | "carbs" | "fat") =>
    foodItems.reduce((acc, fi) => acc + (fi[key] ?? 0), 0);

  const format = (key: "calories" | "protein" | "carbs" | "fat", unit: string) =>
    allNull(key) ? "—" : `${Math.round(sum(key))} ${unit}`;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Nutrition totals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 text-center">
          {[
            { label: "Calories", value: format("calories", "kcal") },
            { label: "Protein", value: format("protein", "g") },
            { label: "Carbs", value: format("carbs", "g") },
            { label: "Fat", value: format("fat", "g") },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xl font-semibold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
