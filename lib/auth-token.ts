import { getToken } from "next-auth/jwt";

/**
 * Read the Graph access token from the encrypted session JWT, server-side only.
 * The token is never exposed on the session object (see auth.ts).
 */
export async function getGraphToken(
  req: Request,
): Promise<{ accessToken?: string; error?: string } | null> {
  const secure = process.env.NODE_ENV === "production";
  const cookieName = secure
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";
  const token = await getToken({
    // getToken reads the session cookie off the request headers.
    req: req as unknown as Parameters<typeof getToken>[0]["req"],
    secret: process.env.AUTH_SECRET,
    secureCookie: secure,
    cookieName,
    salt: cookieName,
  });
  return (token as { accessToken?: string; error?: string } | null) ?? null;
}
