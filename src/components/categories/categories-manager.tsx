"use client";

import { useActionState } from "react";
import type { Category } from "@/types/database";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
  type ActionState,
} from "@/app/actions/categories";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: ActionState = {};

export function CategoriesManager({ categories }: { categories: Category[] }) {
  const [createState, createAction, createPending] = useActionState(
    createCategoryAction,
    initial
  );

  return (
    <div className="space-y-5">
      <form
        action={createAction}
        className="grid gap-3 rounded-3xl bg-card p-4 sm:grid-cols-[1fr_auto_auto]"
      >
        {createState.error ? (
          <Alert variant="destructive" className="sm:col-span-3">
            <AlertDescription>{createState.error}</AlertDescription>
          </Alert>
        ) : null}
        {createState.success ? (
          <p className="text-sm text-primary sm:col-span-3">{createState.success}</p>
        ) : null}
        <div className="space-y-1.5">
          <Label htmlFor="name">Neue Kategorie</Label>
          <Input id="name" name="name" required placeholder="Name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="color">Farbe</Label>
          <Input
            id="color"
            name="color"
            type="color"
            defaultValue="#22c55e"
            className="h-12 w-full min-w-16 p-1"
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={createPending} className="w-full">
            Hinzufügen
          </Button>
        </div>
      </form>

      <ul className="space-y-2">
        {categories.map((cat) => (
          <CategoryRow key={cat.id} category={cat} />
        ))}
      </ul>
    </div>
  );
}

function CategoryRow({ category }: { category: Category }) {
  const boundUpdate = updateCategoryAction.bind(null, category.id);
  const [state, action, pending] = useActionState(boundUpdate, initial);

  return (
    <li className="rounded-3xl bg-card p-4">
      <form
        action={action}
        className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end"
      >
        {state.error ? (
          <Alert variant="destructive" className="sm:col-span-4">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}
        <div className="space-y-1.5">
          <Label htmlFor={`name-${category.id}`}>Name</Label>
          <Input
            id={`name-${category.id}`}
            name="name"
            defaultValue={category.name}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`color-${category.id}`}>Farbe</Label>
          <Input
            id={`color-${category.id}`}
            name="color"
            type="color"
            defaultValue={category.color ?? "#94a3b8"}
            className="h-12 w-full min-w-16 p-1"
          />
        </div>
        <Button type="submit" variant="secondary" disabled={pending}>
          Speichern
        </Button>
        {!category.is_default ? (
          <Button
            type="button"
            variant="ghost"
            className="text-destructive"
            onClick={() => deleteCategoryAction(category.id)}
          >
            Löschen
          </Button>
        ) : (
          <p className="pb-3 text-xs text-muted-foreground">Standard</p>
        )}
      </form>
    </li>
  );
}
