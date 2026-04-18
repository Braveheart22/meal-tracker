import { notFound } from "next/navigation";
import Link from "next/link";
import { getMealById } from "@/data/meals";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { EditMealHeaderForm } from "./EditMealHeaderForm";
import { NutritionTotals } from "./NutritionTotals";
import { FoodItemList } from "./FoodItemList";
import { AddFoodItemForm } from "./AddFoodItemForm";

interface MealDetailPageProps {
  params: Promise<{ mealId: string }>;
}

export default async function MealDetailPage({ params }: MealDetailPageProps) {
  const { mealId } = await params;
  const meal = await getMealById(mealId);

  if (!meal) notFound();

  const dateStr = meal.loggedAt.toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-lg space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0" asChild>
            <Link href={`/dashboard?date=${dateStr}`}>
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
          </Button>
          <EditMealHeaderForm meal={meal} />
        </div>
        <NutritionTotals foodItems={meal.foodItems} />
        <div className="space-y-3">
          <h2 className="text-sm font-medium">Food items</h2>
          <FoodItemList mealId={meal.id} foodItems={meal.foodItems} />
        </div>
        <AddFoodItemForm mealId={meal.id} />
      </div>
    </div>
  );
}
