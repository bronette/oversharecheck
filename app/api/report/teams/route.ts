import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { postReportToTeams } from "@/lib/notify";
import type { ScanResult } from "@/lib/scan";
import { isValidTeamsWebhook } from "@/lib/security";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  if (!rateLimit(clientKey(req, "teams"), 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests — please wait." }, { status: 429 });
  }

  const { webhookUrl, result } = (await req.json()) as {
    webhookUrl?: string;
    result?: ScanResult;
  };
  // SSRF guard: only allow known Teams/Power Automate webhook hosts.
  if (typeof webhookUrl !== "string" || !isValidTeamsWebhook(webhookUrl)) {
    return NextResponse.json(
      { error: "That doesn't look like a Teams Workflows webhook URL." },
      { status: 400 },
    );
  }
  if (!result?.findings) {
    return NextResponse.json({ error: "Run a scan first" }, { status: 400 });
  }

  try {
    await postReportToTeams(webhookUrl, result);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[report/teams] failed:", e);
    return NextResponse.json({ error: "Could not post to Teams." }, { status: 500 });
  }
}
