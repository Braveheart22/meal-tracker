import { NewMealForm } from "./NewMealForm";

interface NewMealPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function NewMealPage({ searchParams }: NewMealPageProps) {
  const { date } = await searchParams;
  const defaultDate = date ?? new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New meal</h1>
          <p className="text-sm text-muted-foreground">Log what you ate.</p>
        </div>
        <NewMealForm defaultDate={defaultDate} />
      </div>
    </div>
  );
}
