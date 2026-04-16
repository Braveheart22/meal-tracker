"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Utensils } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const MOCK_MEALS = [
  { id: 1, name: "Oatmeal with berries", time: "8:00 AM", calories: 320 },
  { id: 2, name: "Grilled chicken salad", time: "12:30 PM", calories: 480 },
  { id: 3, name: "Greek yogurt", time: "3:00 PM", calories: 150 },
  { id: 4, name: "Salmon with roasted vegetables", time: "7:00 PM", calories: 620 },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Meal Tracker</h1>
          <p className="text-sm text-muted-foreground">View your meals for any day.</p>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
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
            {MOCK_MEALS.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                No meals logged for this day.
              </p>
            ) : (
              <ul>
                {MOCK_MEALS.map((meal, index) => (
                  <li key={meal.id}>
                    {index > 0 && <Separator />}
                    <div className="flex items-center justify-between px-6 py-4">
                      <div>
                        <p className="font-medium">{meal.name}</p>
                        <p className="text-sm text-muted-foreground">{meal.time}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {meal.calories} kcal
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
