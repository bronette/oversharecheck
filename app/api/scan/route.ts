import { NextResponse } from "next/server";
import { getGraphToken } from "@/lib/auth-token";
import { scanSite } from "@/lib/scan";
import { isValidSharePointUrl } from "@/lib/security";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const maxDuration = 300;

export async function POST(req: Request) {
  const token = await getGraphToken(req);
  if (token?.error) {
    return NextResponse.json(
      { error: "Your session expired — sign out and back in.", reauth: true },
      { status: 401 },
    );
  }
  if (!token?.accessToken) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // Expensive endpoint: cap scans per client.
  if (!rateLimit(clientKey(req, "scan"), 10, 60_000)) {
    return NextResponse.json(
      { error: "Too many scans — please wait a minute." },
      { status: 429 },
    );
  }

  const { siteUrl } = await req.json();
  if (typeof siteUrl !== "string" || !isValidSharePointUrl(siteUrl)) {
    return NextResponse.json(
      { error: "Enter a valid SharePoint URL, e.g. https://contoso.sharepoint.com/sites/finance" },
      { status: 400 },
    );
  }

  try {
    const result = await scanSite(token.accessToken, siteUrl);
    return NextResponse.json(result);
  } catch (err) {
    // Log the real error server-side; return a generic message so Graph
    // response bodies (tenant IDs, paths) don't leak to the client.
    console.error("[scan] failed:", err);
    const denied = err instanceof Error && /\b(401|403)\b/.test(err.message);
    return NextResponse.json(
      {
        error: denied
          ? "Access denied by SharePoint — you may not have permission to read that site."
          : "Scan failed. Check the site URL and try again.",
      },
      { status: denied ? 403 : 500 },
    );
  }
}
