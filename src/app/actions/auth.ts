"use server";

import { hash, compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut as nextAuthSignOut, auth } from "@/auth";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { isDemoMode } from "@/lib/demo/mode";
import { loginSchema } from "@/lib/validations/auth";
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
  _formData: FormData
): Promise<AuthState> {
  return {
    error: "Registrierung ist deaktiviert. Bitte den Standard-Account nutzen.",
  };
}

export async function signOut() {
  await nextAuthSignOut({ redirect: false });
  redirect("/login");
}

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(1, "Passwort erforderlich"),
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
