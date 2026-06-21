import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = Boolean(req.auth);
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/chat") && !isLoggedIn) {
    const signInUrl = new URL("/", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(signInUrl);
  }

  return undefined;
});

export const config = {
  matcher: ["/chat/:path*"],
};
