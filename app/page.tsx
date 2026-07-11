import Link from "next/link";
import { auth, signIn } from "@/auth";

const FINDINGS = [
  {
    tag: "Critical",
    color: "bg-red-500",
    title: "Anonymous “Anyone” links",
    body: "Files reachable by anyone with the URL — no sign-in, no audit trail.",
  },
  {
    tag: "High",
    color: "bg-orange-500",
    title: "Org-wide sharing",
    body: "Links every employee — and Copilot — can open, often on files nobody meant to share widely.",
  },
  {
    tag: "High",
    color: "bg-orange-500",
    title: "External guests",
    body: "Outside accounts with standing access that linger long after a project ends.",
  },
  {
    tag: "Low",
    color: "bg-slate-400",
    title: "Direct grants & drift",
    body: "Person-by-person access that rots out of date and slips through offboarding.",
  },
];

const STEPS = [
  ["Sign in with Microsoft", "Read-only, delegated access. We never write, and never store your data."],
  ["Paste a site URL", "We crawl the document libraries and check every shared item’s permissions."],
  ["Get a shareable report", "A graded exposure report you can hand to your boss or your auditor — as a PDF."],
];

export default async function Home() {
  const session = await auth();

  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          Copilot is rolling out. Your permissions aren’t ready.
        </span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Find SharePoint oversharing before Copilot does
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600">
          Copilot surfaces every file its user is allowed to open — including the
          ones nobody remembers sharing. Scan a site for anonymous links,
          org-wide sharing, and stale guest access, and get a graded report in
          minutes.
        </p>
        <div className="mt-8 flex justify-center">
          {session ? (
            <Link
              href="/scan"
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
            >
              Scan a site →
            </Link>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("microsoft-entra-id", { redirectTo: "/scan" });
              }}
            >
              <button className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700">
                Scan your first site free →
              </button>
            </form>
          )}
        </div>
        <p className="mt-3 text-sm text-slate-400">
          Read-only · nothing stored · no credit card
        </p>
      </section>

      {/* What it finds */}
      <section className="border-y border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900">
            What a scan surfaces
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FINDINGS.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-slate-200 p-5"
              >
                <span
                  className={`inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase text-white ${f.color}`}
                >
                  {f.tag}
                </span>
                <h3 className="mt-3 font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold text-slate-900">
          Three steps to a clean report
        </h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {STEPS.map(([title, body], i) => (
            <div key={title}>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                {i + 1}
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-200 bg-white py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-900">
          See what Copilot can see
        </h2>
        <p className="mx-auto mt-2 max-w-md text-slate-600">
          Your first site scan is free. No install, no agent, no data leaves your
          tenant.
        </p>
        <div className="mt-6 flex justify-center">
          {session ? (
            <Link
              href="/scan"
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
            >
              Scan a site →
            </Link>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("microsoft-entra-id", { redirectTo: "/scan" });
              }}
            >
              <button className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700">
                Scan your first site free →
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
