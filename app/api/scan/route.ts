import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { scanSite } from "@/lib/scan";

export const maxDuration = 300;

export async function POST(req: Request) {
  const session = await auth();
  const s = session as { accessToken?: string; error?: string } | null;
  if (s?.error) {
    return NextResponse.json(
      { error: "Your session expired — sign out and back in.", reauth: true },
      { status: 401 },
    );
  }
  const accessToken = s?.accessToken;
  if (!accessToken) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { siteUrl } = await req.json();
  if (typeof siteUrl !== "string" || !siteUrl.includes(".sharepoint.com")) {
    return NextResponse.json(
      { error: "Provide a SharePoint site URL, e.g. https://contoso.sharepoint.com/sites/finance" },
      { status: 400 },
    );
  }

  try {
    const result = await scanSite(accessToken, siteUrl);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Scan failed" },
      { status: 500 },
    );
  }
}
