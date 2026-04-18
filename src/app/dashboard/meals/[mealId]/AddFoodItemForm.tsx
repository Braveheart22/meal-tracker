"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addFoodItemAction } from "./actions";

interface AddFoodItemFormProps {
  mealId: string;
}

const emptyForm = { name: "", quantity: "", unit: "g", calories: "", protein: "", carbs: "", fat: "" };

export function AddFoodItemForm({ mealId }: AddFoodItemFormProps) {
  const [fields, setFields] = useState(emptyForm);
  const [isPending, startTransition] = useTransition();

  function set(key: keyof typeof emptyForm, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const quantity = parseFloat(fields.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error("Quantity must be a positive number.");
      return;
    }

    const parseOptional = (v: string) => { const n = parseFloat(v); return isNaN(n) ? null : n; };

    startTransition(async () => {
      const result = await addFoodItemAction({
        mealId,
        name: fields.name,
        quantity,
        unit: fields.unit,
        calories: parseOptional(fields.calories),
        protein: parseOptional(fields.protein),
        carbs: parseOptional(fields.carbs),
        fat: parseOptional(fields.fat),
      });
      if (result.ok) {
        toast.success("Food item added");
        setFields(emptyForm);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Log food item</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="fi-name">Name</Label>
              <Input
                id="fi-name"
                placeholder="e.g. Oats"
                value={fields.name}
                onChange={(e) => set("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fi-quantity">Quantity</Label>
              <Input
                id="fi-quantity"
                type="number"
                min="0"
                step="any"
                placeholder="100"
                value={fields.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fi-unit">Unit</Label>
              <Input
                id="fi-unit"
                placeholder="g"
                value={fields.unit}
                onChange={(e) => set("unit", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fi-calories">Calories (kcal)</Label>
              <Input
                id="fi-calories"
                type="number"
                min="0"
                step="any"
                placeholder="Optional"
                value={fields.calories}
                onChange={(e) => set("calories", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fi-protein">Protein (g)</Label>
              <Input
                id="fi-protein"
                type="number"
                min="0"
                step="any"
                placeholder="Optional"
                value={fields.protein}
                onChange={(e) => set("protein", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fi-carbs">Carbs (g)</Label>
              <Input
                id="fi-carbs"
                type="number"
                min="0"
                step="any"
                placeholder="Optional"
                value={fields.carbs}
                onChange={(e) => set("carbs", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fi-fat">Fat (g)</Label>
              <Input
                id="fi-fat"
                type="number"
                min="0"
                step="any"
                placeholder="Optional"
                value={fields.fat}
                onChange={(e) => set("fat", e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Adding…" : "Add item"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
