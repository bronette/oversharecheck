import Link from "next/link";
import { SignInCta } from "@/components/sign-in-cta";
import { ReportPreview } from "@/components/report-preview";
import { WaitlistForm } from "@/components/waitlist-form";

const CTA_CLASS =
  "grad-accent inline-block rounded-lg px-6 py-3 font-medium text-white shadow-lg shadow-blue-500/25 transition hover:brightness-110";

const FINDINGS = [
  ["Critical", "text-red-400", "bg-red-500", "Anonymous “Anyone” links", "Files anyone with the URL can open — no sign-in, no audit trail."],
  ["High", "text-orange-400", "bg-orange-500", "Org-wide sharing", "Links every employee — and Copilot — can open."],
  ["High", "text-orange-400", "bg-orange-500", "External guests", "Outside accounts with standing access that linger after projects end."],
  ["Low", "text-slate-400", "bg-slate-400", "Direct grants & drift", "Person-by-person access that rots and slips through offboarding."],
];

const STEPS = [
  ["Sign in with Microsoft", "Read-only, delegated access. We never write, and never store your data."],
  ["Paste a site URL", "We crawl the document libraries and check every shared item’s permissions."],
  ["Get a shareable report", "A graded exposure report you can hand to your boss or auditor — as a PDF."],
];

const PRICING = [
  { name: "Free", price: "$0", tagline: "See the problem", features: ["Single-site scan", "Graded report", "PDF & CSV export", "Nothing stored"], highlight: false },
  { name: "Pro", price: "$299", unit: "/mo", tagline: "Cover the tenant", features: ["Tenant-wide scans", "Scheduled re-scans", "Drift alerts", "Audit-ready exports"], highlight: true },
  { name: "MSP", price: "$799", unit: "/mo", tagline: "Every client", features: ["Multi-tenant dashboard", "White-label reports", "Client-ready PDFs", "Priority support"], highlight: false },
];

const FAQ = [
  ["Is it safe? What can it do to my tenant?", "It’s strictly read-only. OverShare Check requests delegated Sites.Read.All — it can read permissions, and nothing else. It cannot change, move, or delete anything."],
  ["What do you store?", "Nothing. The scan runs against Microsoft Graph and the report is rendered in your browser. We don’t persist your files, permissions, or results on our servers."],
  ["Do I need to install anything?", "No agent, no app package, no PowerShell. You sign in with your Microsoft account and paste a site URL."],
  ["Why does this matter for Copilot?", "Copilot surfaces every file a user is allowed to open. Oversharing that sat harmless for years becomes one prompt away from exposure. Scanning first lets you fix it before rollout."],
];

const cardBase = "rounded-xl border border-white/10 bg-white/[0.03] p-5";

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="mx-auto grid max-w-5xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <span className="inline-block rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
            Copilot is rolling out. Your permissions aren’t ready.
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Find SharePoint oversharing{" "}
            <span className="grad-text">before Copilot does</span>
          </h1>
          <p className="mt-5 text-lg text-slate-300">
            Copilot surfaces every file its user can open — including the ones
            nobody remembers sharing. Scan a site for anonymous links, org-wide
            sharing, and stale guest access, and get a graded report in minutes.
          </p>
          <div className="mt-8">
            <SignInCta className={CTA_CLASS} />
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Read-only · nothing stored · no credit card
          </p>
        </div>
        <div className="relative">
          <div className="absolute -inset-6 rounded-3xl bg-blue-500/10 blur-3xl" />
          <div className="relative">
            <ReportPreview />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-white/10 bg-white/[0.02] py-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-2 px-6 text-sm font-medium text-slate-400">
          <span>🔒 Read-only access</span>
          <span>🗄️ Nothing stored</span>
          <span>⚡ No install or agent</span>
          <span>📄 PDF · CSV · Teams</span>
        </div>
      </section>

      {/* What it finds */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold text-white">
          What a scan surfaces
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FINDINGS.map(([tag, tagColor, dot, title, body]) => (
            <div key={title} className={cardBase}>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${dot}`} />
                <span className={`text-xs font-semibold uppercase ${tagColor}`}>{tag}</span>
              </div>
              <h3 className="mt-3 font-semibold text-white">{title}</h3>
              <p className="mt-1 text-sm text-slate-400">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-white/10 bg-white/[0.02] py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-2xl font-bold text-white">
            Three steps to a clean report
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {STEPS.map(([title, body], i) => (
              <div key={title}>
                <div className="grad-accent flex h-9 w-9 items-center justify-center rounded-full font-bold text-white shadow-lg shadow-blue-500/20">
                  {i + 1}
                </div>
                <h3 className="mt-4 font-semibold text-white">{title}</h3>
                <p className="mt-1 text-sm text-slate-400">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold text-white">Simple pricing</h2>
        <p className="mt-2 text-center text-slate-400">
          Start free. Upgrade when you need the whole tenant covered.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {PRICING.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-xl border p-6 ${
                tier.highlight
                  ? "border-blue-400/40 bg-blue-500/[0.07] ring-1 ring-blue-400/30"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <p className="text-sm font-semibold text-slate-400">{tier.tagline}</p>
              <h3 className="mt-1 text-lg font-bold text-white">{tier.name}</h3>
              <p className="mt-2">
                <span className="text-3xl font-black text-white">{tier.price}</span>
                {tier.unit && <span className="text-slate-500">{tier.unit}</span>}
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-slate-300">
                {tier.features.map((f) => (
                  <li key={f}>
                    <span className="grad-text">✓</span> {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                {tier.name === "Free" ? (
                  <SignInCta
                    label="Scan free →"
                    className="grad-accent block rounded-lg px-4 py-2 text-center text-sm font-medium text-white hover:brightness-110"
                  />
                ) : (
                  <a
                    href="#waitlist"
                    className="block rounded-lg border border-white/15 px-4 py-2 text-center text-sm font-medium text-slate-200 hover:bg-white/5"
                  >
                    Join waitlist
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/10 bg-white/[0.02] py-16">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center text-2xl font-bold text-white">
            Questions IT asks first
          </h2>
          <div className="mt-8 space-y-6">
            {FAQ.map(([q, a]) => (
              <div key={q} className={cardBase}>
                <h3 className="font-semibold text-white">{q}</h3>
                <p className="mt-1 text-slate-400">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist / CTA */}
      <section id="waitlist" className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-white">
          Want tenant-wide and scheduled scans?
        </h2>
        <p className="mt-2 text-slate-400">
          Pro and MSP tiers are opening soon. Join the waitlist and we’ll let you
          know — or scan your first site free right now.
        </p>
        <div className="mx-auto mt-6 max-w-md">
          <WaitlistForm />
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Prefer to just try it?{" "}
          <Link href="/scan" className="grad-text font-medium">
            Scan a site →
          </Link>
        </p>
      </section>
    </main>
  );
}
