import { notFound } from "next/navigation";
import { getMealById } from "@/data/meals";
import { EditMealForm } from "./EditMealForm";

interface EditMealPageProps {
  params: Promise<{ mealId: string }>;
}

export default async function EditMealPage({ params }: EditMealPageProps) {
  const { mealId } = await params;
  const meal = await getMealById(mealId);

  if (!meal) notFound();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit meal</h1>
          <p className="text-sm text-muted-foreground">Update your meal details.</p>
        </div>
        <EditMealForm meal={meal} />
      </div>
    </div>
  );
}
