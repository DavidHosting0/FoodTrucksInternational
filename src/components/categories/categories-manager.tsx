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
    <div className="space-y-6">
      <form
        action={createAction}
        className="grid gap-3 rounded-xl border border-border/60 bg-card/40 p-4 sm:grid-cols-[1fr_auto_auto]"
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
          <Input id="name" name="name" required placeholder="Name" className="h-11" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="color">Farbe</Label>
          <Input id="color" name="color" type="color" defaultValue="#94a3b8" className="h-11 w-full min-w-16 p-1" />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={createPending} className="h-11 w-full">
            Hinzufügen
          </Button>
        </div>
      </form>

      <ul className="space-y-3">
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
    <li className="rounded-xl border border-border/60 p-4">
      <form action={action} className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
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
            className="h-11"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`color-${category.id}`}>Farbe</Label>
          <Input
            id={`color-${category.id}`}
            name="color"
            type="color"
            defaultValue={category.color ?? "#94a3b8"}
            className="h-11 w-full min-w-16 p-1"
          />
        </div>
        <Button type="submit" variant="secondary" disabled={pending} className="h-11">
          Speichern
        </Button>
        {!category.is_default ? (
          <Button
            type="button"
            variant="ghost"
            className="h-11 text-destructive"
            onClick={() => deleteCategoryAction(category.id)}
          >
            Löschen
          </Button>
        ) : (
          <p className="pb-2 text-xs text-muted-foreground">Standard</p>
        )}
      </form>
    </li>
  );
}
