// Route gating for VOID guild manager — DORMANT.
//
// Rename this file to `middleware.ts` (repo root) once auth is configured
// (AUTH_SECRET + Discord + Neon in .env). Until then it stays inactive so the
// mock-data app is fully browsable without a login.
//
// It redirects unauthenticated requests to /signin for every route except the
// auth API, Next internals, and the sign-in page itself.

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
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|signin).*)"],
};
