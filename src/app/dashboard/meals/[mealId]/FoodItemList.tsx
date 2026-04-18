"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deleteFoodItemAction } from "./actions";
import type { MealWithFoodItems } from "@/data/meals";

interface FoodItemListProps {
  mealId: string;
  foodItems: MealWithFoodItems["foodItems"];
}

export function FoodItemList({ mealId, foodItems }: FoodItemListProps) {
  const [optimisticItems, removeOptimistic] = useOptimistic(
    foodItems,
    (state, deletedId: string) => state.filter((fi) => fi.id !== deletedId)
  );
  const [isPending, startTransition] = useTransition();

  function handleDelete(foodItemId: string) {
    startTransition(async () => {
      removeOptimistic(foodItemId);
      const result = await deleteFoodItemAction({ mealId, foodItemId });
      if (!result.ok) {
        toast.error(result.error);
      }
    });
  }

  if (optimisticItems.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No food items logged yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {optimisticItems.map((item) => (
        <Card key={item.id}>
          <CardContent className="pt-4 flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <p className="font-medium truncate">{item.name}</p>
              <p className="text-sm text-muted-foreground">
                {item.quantity} {item.unit}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.calories != null ? `${item.calories} kcal` : "—"} ·{" "}
                {item.protein != null ? `${item.protein}g protein` : "—"} ·{" "}
                {item.carbs != null ? `${item.carbs}g carbs` : "—"} ·{" "}
                {item.fat != null ? `${item.fat}g fat` : "—"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-destructive"
              disabled={isPending}
              onClick={() => handleDelete(item.id)}
            >
              <Trash2Icon className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
