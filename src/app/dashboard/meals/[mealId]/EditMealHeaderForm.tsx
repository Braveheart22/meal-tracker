"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { PencilIcon, CheckIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateMealMetaAction } from "./actions";
import type { MealWithFoodItems } from "@/data/meals";
import { format } from "date-fns";

interface EditMealHeaderFormProps {
  meal: Pick<MealWithFoodItems, "id" | "name" | "loggedAt">;
}

function toLocalDatetimeValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

export function EditMealHeaderForm({ meal }: EditMealHeaderFormProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(meal.name ?? "");
  const [loggedAt, setLoggedAt] = useState(toLocalDatetimeValue(meal.loggedAt));
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await updateMealMetaAction({ mealId: meal.id, name, loggedAt });
      if (result.ok) {
        toast.success("Meal updated");
        setEditing(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8 text-lg font-semibold"
          required
        />
        <Input
          type="datetime-local"
          value={loggedAt}
          onChange={(e) => setLoggedAt(e.target.value)}
          className="h-8 text-sm"
        />
        <Button variant="ghost" size="icon" disabled={isPending} onClick={handleSave}>
          <CheckIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setEditing(false)}>
          <XIcon className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight truncate">{meal.name ?? "Meal"}</h1>
        <p className="text-sm text-muted-foreground">{format(meal.loggedAt, "PPP p")}</p>
      </div>
      <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setEditing(true)}>
        <PencilIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
