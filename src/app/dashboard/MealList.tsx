"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon, Utensils } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { MealWithCalories } from "@/data/meals";

interface MealListProps {
  meals: MealWithCalories[];
  selectedDate: string; // ISO date string "yyyy-MM-dd"
}

export function MealList({ meals, selectedDate }: MealListProps) {
  const router = useRouter();
  const [date, setDate] = useState<Date>(new Date(selectedDate + "T00:00:00Z"));

  function handleDateSelect(d: Date | undefined) {
    if (!d) return;
    setDate(d);
    router.push(`/dashboard?date=${format(d, "yyyy-MM-dd")}`);
  }

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-[240px] justify-start text-left font-normal")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(date, "PPP")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Utensils className="h-4 w-4" />
            Meals for {format(date, "MMMM d, yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {meals.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-muted-foreground">
              No meals logged for this day.
            </p>
          ) : (
            <ul>
              {meals.map((meal, index) => (
                <li key={meal.id}>
                  {index > 0 && <Separator />}
                  <div className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="font-medium">{meal.name ?? "Untitled meal"}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(meal.loggedAt), "h:mm a")}
                      </p>
                    </div>
                    {meal.totalCalories > 0 && (
                      <span className="text-sm text-muted-foreground">
                        {Math.round(meal.totalCalories)} kcal
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
