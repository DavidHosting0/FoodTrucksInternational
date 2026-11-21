import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isAuthRoute =
        pathname.startsWith("/login") || pathname.startsWith("/signup");
      const isLoggedIn = Boolean(auth?.user);

      if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
        if (isAuthRoute) return Response.redirect(new URL("/dashboard", request.url));
        return true;
      }

      if (!isLoggedIn && !isAuthRoute) {
        return Response.redirect(new URL("/login", request.url));
      }

      if (isLoggedIn && isAuthRoute) {
        return Response.redirect(new URL("/dashboard", request.url));
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.email = (token.email as string) ?? "";
        session.user.name = token.name as string | null | undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
