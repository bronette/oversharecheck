import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendReportEmail } from "@/lib/notify";
import type { ScanResult } from "@/lib/scan";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  if (!rateLimit(clientKey(req, "email"), 10, 60_000)) {
    return NextResponse.json({ error: "Too many emails — please wait." }, { status: 429 });
  }

  const { result } = (await req.json()) as { result?: ScanResult };
  if (!result?.findings) {
    return NextResponse.json({ error: "Run a scan first" }, { status: 400 });
  }

  try {
    // Anti-abuse: only ever send to the signed-in user's own address. This
    // prevents the endpoint from being used to send branded mail to arbitrary
    // recipients (phishing) from our domain.
    await sendReportEmail(email, result);
    return NextResponse.json({ ok: true, sentTo: email });
  } catch (e) {
    console.error("[report/email] failed:", e);
    return NextResponse.json({ error: "Could not send the report email." }, { status: 500 });
  }
}
