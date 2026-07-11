import { NextResponse } from "next/server";
import { sendMail } from "@/lib/notify";
import { rateLimit, clientKey } from "@/lib/rate-limit";

/**
 * Waitlist capture. Emails the signup to the operator via SMTP.
 * Set SMTP_HOST/USER/PASS + WAITLIST_TO to activate; until then it accepts the
 * signup but logs it so nothing is silently dropped in production.
 */
export async function POST(req: Request) {
  if (!rateLimit(clientKey(req, "waitlist"), 5, 60_000)) {
    return NextResponse.json({ error: "Too many requests — please wait." }, { status: 429 });
  }

  const { email } = (await req.json()) as { email?: string };
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 200) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }

  const to = process.env.WAITLIST_TO;
  if (!to || !process.env.SMTP_HOST) {
    console.warn(`[waitlist] signup (delivery not configured): ${email}`);
    return NextResponse.json({ ok: true });
  }

  try {
    await sendMail({
      to,
      subject: `OverShare Check waitlist: ${email}`,
      text: `New tenant-wide waitlist signup: ${email}`,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[waitlist] send failed:", e);
    // Don't lose the lead in the user's eyes; operator can check logs.
    return NextResponse.json({ ok: true });
  }
}
