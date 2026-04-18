"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createMealAction, type CreateMealInput } from "./actions";
import { PlusIcon, Trash2Icon } from "lucide-react";

type FoodItemDraft = {
  name: string;
  quantity: string;
  unit: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
};

const emptyFoodItem = (): FoodItemDraft => ({
  name: "",
  quantity: "",
  unit: "g",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
});

function parseOptionalNumber(val: string): number | null {
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

interface NewMealFormProps {
  defaultDate: string;
}

export function NewMealForm({ defaultDate }: NewMealFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [mealName, setMealName] = useState("");
  const [loggedAt, setLoggedAt] = useState(defaultDate);
  const [foodItems, setFoodItems] = useState<FoodItemDraft[]>([emptyFoodItem()]);

  function updateFoodItem(index: number, field: keyof FoodItemDraft, value: string) {
    setFoodItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function addFoodItem() {
    setFoodItems((prev) => [...prev, emptyFoodItem()]);
  }

  function removeFoodItem(index: number) {
    setFoodItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const quantities = foodItems.map((item) => parseFloat(item.quantity));
    if (quantities.some(isNaN)) {
      toast.error("All food items must have a valid quantity.");
      return;
    }

    const data: CreateMealInput = {
      name: mealName,
      loggedAt: loggedAt + "T12:00:00",
      foodItems: foodItems.map((item, i) => ({
        name: item.name,
        quantity: quantities[i],
        unit: item.unit,
        calories: parseOptionalNumber(item.calories),
        protein: parseOptionalNumber(item.protein),
        carbs: parseOptionalNumber(item.carbs),
        fat: parseOptionalNumber(item.fat),
      })),
    };

    startTransition(async () => {
      const result = await createMealAction(data);
      if (result.ok) {
        toast.success("Meal logged successfully");
        router.push(result.redirectTo);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Meal details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="meal-name">Meal name</Label>
            <Input
              id="meal-name"
              placeholder="e.g. Breakfast"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="logged-at">Date</Label>
            <Input
              id="logged-at"
              type="date"
              value={loggedAt}
              onChange={(e) => setLoggedAt(e.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-sm font-medium">Food items</h2>

        {foodItems.map((item, index) => (
          <Card key={index}>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Item {index + 1}</span>
                {foodItems.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFoodItem(index)}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label>Name</Label>
                  <Input
                    placeholder="e.g. Oats"
                    value={item.name}
                    onChange={(e) => updateFoodItem(index, "name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="100"
                    value={item.quantity}
                    onChange={(e) => updateFoodItem(index, "quantity", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Unit</Label>
                  <Input
                    placeholder="g"
                    value={item.unit}
                    onChange={(e) => updateFoodItem(index, "unit", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Calories (kcal)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Optional"
                    value={item.calories}
                    onChange={(e) => updateFoodItem(index, "calories", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Protein (g)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Optional"
                    value={item.protein}
                    onChange={(e) => updateFoodItem(index, "protein", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Carbs (g)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Optional"
                    value={item.carbs}
                    onChange={(e) => updateFoodItem(index, "carbs", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Fat (g)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Optional"
                    value={item.fat}
                    onChange={(e) => updateFoodItem(index, "fat", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button type="button" variant="outline" className="w-full" onClick={addFoodItem}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add food item
        </Button>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? "Saving…" : "Save meal"}
        </Button>
      </div>
    </form>
  );
}
