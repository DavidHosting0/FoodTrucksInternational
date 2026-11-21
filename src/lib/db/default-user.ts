import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { DEFAULT_CATEGORIES } from "@/lib/db/seed-categories";
import { categories, profiles, users } from "@/lib/db/schema";

export const DEFAULT_ACCOUNT = {
  email: "finanzen@fig.global",
  password: "FIG",
  displayName: "FIG Finanzen",
} as const;

let ensurePromise: Promise<void> | null = null;

/** Creates the fixed FIG account (+ default categories) if it does not exist yet. */
export function ensureDefaultUser() {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      const db = getDb();
      const email = DEFAULT_ACCOUNT.email.toLowerCase();

      const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existing) return;

      const passwordHash = await hash(DEFAULT_ACCOUNT.password, 12);
      const [user] = await db
        .insert(users)
        .values({ email, passwordHash })
        .returning();

      await db.insert(profiles).values({
        id: user.id,
        displayName: DEFAULT_ACCOUNT.displayName,
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
    })().catch((error) => {
      ensurePromise = null;
      throw error;
    });
  }

  return ensurePromise;
}
