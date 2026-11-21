"use server";

import { revalidatePath } from "next/cache";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/data/finance";
import { isDemoMode } from "@/lib/demo/mode";

export type ActionState = {
  error?: string;
  success?: string;
};

function demoBlocked(): ActionState | null {
  if (isDemoMode()) {
    return { error: "Im Demo-Modus nicht verfügbar – bitte Postgres nutzen." };
  }
  return null;
}

export async function createCategoryAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const blocked = demoBlocked();
  if (blocked) return blocked;

  const name = String(formData.get("name") ?? "").trim();
  const color = String(formData.get("color") ?? "#94a3b8");
  const icon = String(formData.get("icon") ?? "").trim() || null;

  if (!name) return { error: "Name erforderlich" };

  try {
    await createCategory({ name, color, icon });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Speichern fehlgeschlagen",
    };
  }

  revalidatePath("/categories");
  revalidatePath("/transactions");
  return { success: "Kategorie erstellt" };
}

export async function updateCategoryAction(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const blocked = demoBlocked();
  if (blocked) return blocked;

  const name = String(formData.get("name") ?? "").trim();
  const color = String(formData.get("color") ?? "#94a3b8");
  const icon = String(formData.get("icon") ?? "").trim() || null;

  if (!name) return { error: "Name erforderlich" };

  try {
    await updateCategory(id, { name, color, icon });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Speichern fehlgeschlagen",
    };
  }

  revalidatePath("/categories");
  return { success: "Kategorie aktualisiert" };
}

export async function deleteCategoryAction(id: string): Promise<ActionState> {
  const blocked = demoBlocked();
  if (blocked) return blocked;

  try {
    await deleteCategory(id);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Löschen fehlgeschlagen",
    };
  }

  revalidatePath("/categories");
  return { success: "Kategorie gelöscht" };
}
