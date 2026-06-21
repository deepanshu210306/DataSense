import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { findUserByEmail, verifyPassword } from "@/lib/auth/users";
import { mongoClientPromise } from "@/lib/mongodb";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(mongoClientPromise),
  session: {
    strategy: "jwt",
  },
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string" ? credentials.email : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) return null;

        const user = await findUserByEmail(email);
        if (!user?.password) return null;

        const valid = await verifyPassword(password, user.password);
        if (!valid) return null;

        return {
          id: user._id,
          email: user.email,
          name: user.name ?? user.email,
          image: user.image ?? null,
        };
      },
    }),
  ],
});
