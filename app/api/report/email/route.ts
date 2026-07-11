import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendReportEmail } from "@/lib/notify";
import type { ScanResult } from "@/lib/scan";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { to, result } = (await req.json()) as { to?: string; result?: ScanResult };
  if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }
  if (!result?.findings) {
    return NextResponse.json({ error: "Run a scan first" }, { status: 400 });
  }

  try {
    await sendReportEmail(to, result);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Send failed" },
      { status: 500 },
    );
  }
}
