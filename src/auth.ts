import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { authConfig } from "@/auth.config";
import { getDb } from "@/lib/db";
import { ensureDefaultUser } from "@/lib/db/default-user";
import { profiles, users } from "@/lib/db/schema";
import { isDemoMode, DEMO_USER_ID } from "@/lib/demo/mode";
import { loginSchema } from "@/lib/validations/auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials) {
        if (isDemoMode()) {
          return {
            id: DEMO_USER_ID,
            email: "demo@local.dev",
            name: "Demo-Nutzer",
          };
        }

        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        await ensureDefaultUser();

        const db = getDb();
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, parsed.data.email.toLowerCase()))
          .limit(1);

        if (!user) return null;

        const valid = await compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        const [profile] = await db
          .select()
          .from(profiles)
          .where(eq(profiles.id, user.id))
          .limit(1);

        return {
          id: user.id,
          email: user.email,
          name: profile?.displayName ?? user.email.split("@")[0],
        };
      },
    }),
  ],
});
