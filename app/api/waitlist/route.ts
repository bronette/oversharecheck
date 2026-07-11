import { NextResponse } from "next/server";

/**
 * Waitlist capture. Emails the signup to the operator via Resend.
 * Set RESEND_API_KEY and WAITLIST_TO to activate; until then it accepts the
 * signup but logs a warning so nothing is silently dropped in production.
 */
export async function POST(req: Request) {
  const { email } = (await req.json()) as { email?: string };
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.WAITLIST_TO ?? "kevin.brunette@gmail.com";
  const from = process.env.RESEND_FROM ?? "OverShare Check <reports@oversharecheck.com>";

  if (!key) {
    console.warn(`[waitlist] signup (no RESEND_API_KEY set): ${email}`);
    return NextResponse.json({ ok: true });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to,
        subject: `OverShare Check waitlist: ${email}`,
        text: `New tenant-wide waitlist signup: ${email}`,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[waitlist] send failed:", e);
    // Don't lose the lead in the user's eyes; operator can check logs.
    return NextResponse.json({ ok: true });
  }
}
