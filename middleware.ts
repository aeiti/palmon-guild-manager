// Route gating for VOID guild manager — ACTIVE.
//
// Redirects unauthenticated requests to /signin for every route except the auth
// API, Next internals, robots.txt, and the sign-in page itself. Requires auth to
// be configured (AUTH_SECRET + Discord + Neon in .env).
//
// Consequence for link sharing: because every logged-out request (Discord's
// unfurl crawler included) lands on /signin, that page's Open Graph tags are the
// unfurl everyone sees. Its OG image lives under /signin/* so it stays ungated.

import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAuthed = Boolean(req.auth);
  const isPublic = req.nextUrl.pathname.startsWith("/signin");
  if (!isAuthed && !isPublic) {
    return NextResponse.redirect(new URL("/signin", req.nextUrl.origin));
  }
});

export const config = {
  // `robots.txt` is excluded so crawlers can read the Disallow rules instead of
  // being redirected to /signin. The /signin OG image (/signin/opengraph-image)
  // is already covered by the `signin` exclusion.
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|signin).*)",
  ],
};
