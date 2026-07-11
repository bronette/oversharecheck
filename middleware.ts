import { auth } from "@/auth";
import { NextResponse } from "next/server";

/** Redirect unauthenticated visitors away from the app pages to sign-in. */
export default auth((req) => {
  if (!req.auth) {
    const url = new URL("/", req.nextUrl.origin);
    return NextResponse.redirect(url);
  }
});

export const config = {
  // Guard the scan app; leave marketing pages and API routes (own auth) alone.
  matcher: ["/scan"],
};
