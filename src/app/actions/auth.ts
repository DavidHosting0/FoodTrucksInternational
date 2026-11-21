"use server";

import { hash, compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut as nextAuthSignOut, auth } from "@/auth";
import { getDb } from "@/lib/db";
import { DEFAULT_CATEGORIES } from "@/lib/db/seed-categories";
import { categories, profiles, users } from "@/lib/db/schema";
import { isDemoMode } from "@/lib/demo/mode";
import {
  loginSchema,
  signupSchema,
} from "@/lib/validations/auth";
import { z } from "zod";

export type AuthState = {
  error?: string;
  success?: string;
};

export async function login(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe" };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "E-Mail oder Passwort ungültig" };
    }
    throw error;
  }

  redirect("/dashboard");
}

export async function signup(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (isDemoMode()) {
    redirect("/dashboard");
  }

  const parsed = signupSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe" };
  }

  const email = parsed.data.email.toLowerCase();
  const db = getDb();

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    return { error: "Diese E-Mail ist bereits registriert" };
  }

  const passwordHash = await hash(parsed.data.password, 12);

  const [user] = await db
    .insert(users)
    .values({ email, passwordHash })
    .returning();

  await db.insert(profiles).values({
    id: user.id,
    displayName: parsed.data.displayName,
  });

  await db.insert(categories).values(
    DEFAULT_CATEGORIES.map((cat) => ({
      userId: user.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      isDefault: true,
    }))
  );

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error:
          "Konto erstellt, aber Login fehlgeschlagen. Bitte erneut anmelden.",
      };
    }
    throw error;
  }

  redirect("/dashboard");
}

export async function signOut() {
  await nextAuthSignOut({ redirect: false });
  redirect("/login");
}

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6, "Mindestens 6 Zeichen"),
});

export async function changePassword(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (isDemoMode()) {
    return { error: "Im Demo-Modus nicht verfügbar" };
  }

  const parsed = passwordChangeSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe" };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Nicht angemeldet" };
  }

  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) return { error: "Benutzer nicht gefunden" };

  const valid = await compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return { error: "Aktuelles Passwort ist falsch" };

  const passwordHash = await hash(parsed.data.newPassword, 12);
  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, user.id));

  return { success: "Passwort aktualisiert" };
}
