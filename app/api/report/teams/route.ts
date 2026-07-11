import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { postReportToTeams } from "@/lib/notify";
import type { ScanResult } from "@/lib/scan";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { webhookUrl, result } = (await req.json()) as {
    webhookUrl?: string;
    result?: ScanResult;
  };
  if (!webhookUrl) {
    return NextResponse.json({ error: "Paste your Teams webhook URL" }, { status: 400 });
  }
  if (!result?.findings) {
    return NextResponse.json({ error: "Run a scan first" }, { status: 400 });
  }

  try {
    await postReportToTeams(webhookUrl, result);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Post failed" },
      { status: 500 },
    );
  }
}
