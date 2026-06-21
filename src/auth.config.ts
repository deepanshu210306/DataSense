import type { NextAuthConfig } from "next-auth";

/** Edge-safe Auth.js config — used by middleware. Credentials provider lives in auth.ts. */
export const authConfig = {
  providers: [],
  pages: {
    signIn: "/",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
