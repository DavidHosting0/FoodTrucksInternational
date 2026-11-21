import { getCategories } from "@/lib/data/finance";
import { CategoriesManager } from "@/components/categories/categories-manager";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Kategorien</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Standard-Kategorien behalten, eigene ergänzen oder umbenennen.
        </p>
      </div>
      <CategoriesManager categories={categories} />
    </div>
  );
}
