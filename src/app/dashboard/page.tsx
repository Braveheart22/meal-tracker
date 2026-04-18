import { getMealsForDate } from "@/data/meals";
import { MealList } from "./MealList";

interface DashboardPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { date: dateParam } = await searchParams;
  const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
  const dateStr = dateParam && ISO_DATE.test(dateParam)
    ? dateParam
    : new Date().toISOString().split("T")[0];
  const date = new Date(dateStr + "T00:00:00Z");

  const meals = await getMealsForDate(date);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Meal Tracker</h1>
          <p className="text-sm text-muted-foreground">View your meals for any day.</p>
        </div>
        <MealList meals={meals} selectedDate={dateStr} />
      </div>
    </div>
  );
}
