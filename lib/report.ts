import type { Finding, Severity, ScanResult } from "./scan";

export const SEVERITY_META: Record<
  Severity,
  { label: string; weight: number; dot: string; chip: string; bar: string }
> = {
  critical: {
    label: "Critical",
    weight: 40,
    dot: "bg-red-500",
    chip: "bg-red-50 text-red-700 ring-red-600/20",
    bar: "bg-red-500",
  },
  high: {
    label: "High",
    weight: 15,
    dot: "bg-orange-500",
    chip: "bg-orange-50 text-orange-700 ring-orange-600/20",
    bar: "bg-orange-500",
  },
  medium: {
    label: "Medium",
    weight: 5,
    dot: "bg-amber-400",
    chip: "bg-amber-50 text-amber-700 ring-amber-600/20",
    bar: "bg-amber-400",
  },
  low: {
    label: "Low",
    weight: 1,
    dot: "bg-slate-400",
    chip: "bg-slate-100 text-slate-600 ring-slate-500/20",
    bar: "bg-slate-400",
  },
};

export const FINDING_META: Record<
  Finding["type"],
  { title: string; why: string; fix: string }
> = {
  "anonymous-link": {
    title: "Anonymous “Anyone” link",
    why: "Anyone on the internet with the URL can open this — no sign-in, no audit trail. Copilot and search engines can surface it.",
    fix: "Remove the Anyone link (Manage access → delete the link). If external sharing is needed, use a specific-people link that requires sign-in.",
  },
  "org-wide-link": {
    title: "Organization-wide link",
    why: "Every user in the tenant can reach this, and Copilot treats it as fair game when answering prompts — a common source of accidental exposure.",
    fix: "Replace the org-wide link with a specific-people link scoped to who actually needs the file.",
  },
  "everyone-grant": {
    title: "“Everyone” / all-users grant",
    why: "A built-in claim (Everyone / Everyone except external users) grants the whole company access, bypassing intended group membership.",
    fix: "Remove the Everyone grant and replace it with a security group containing only the intended members.",
  },
  "external-guest": {
    title: "External guest access",
    why: "A guest account outside your organization has standing access. Guests often linger long after a project ends.",
    fix: "Review whether the guest still needs access; revoke if not. Set an access-review or expiration policy for guests.",
  },
  "broken-inheritance": {
    title: "Broken permission inheritance",
    why: "This item has unique permissions that diverge from its parent, making access hard to reason about and audit.",
    fix: "Where possible, restore inheritance (Manage access → Advanced → Delete unique permissions) so access is governed by the library.",
  },
  "direct-grant": {
    title: "Direct user grant",
    why: "Access was granted person-by-person instead of through a group. It’s hygiene debt — it drifts out of date and is easy to overlook when someone leaves.",
    fix: "Move direct grants into security groups so access is managed centrally and offboarding is reliable.",
  },
};

export interface ReportSummary {
  counts: Record<Severity, number>;
  score: number; // 0 (worst) – 100 (clean)
  grade: "A" | "B" | "C" | "D" | "F";
  headline: string;
}

const SEVERITIES: Severity[] = ["critical", "high", "medium", "low"];

export function summarize(result: ScanResult): ReportSummary {
  const counts: Record<Severity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };
  for (const f of result.findings) counts[f.severity]++;

  const penalty = SEVERITIES.reduce(
    (sum, s) => sum + counts[s] * SEVERITY_META[s].weight,
    0,
  );
  const score = Math.max(0, 100 - penalty);

  const grade: ReportSummary["grade"] =
    counts.critical > 0 || score < 40
      ? "F"
      : score < 60
        ? "D"
        : score < 75
          ? "C"
          : score < 90
            ? "B"
            : "A";

  const total = result.findings.length;
  const headline =
    total === 0
      ? "No oversharing found in the scanned items."
      : `${total} exposure${total === 1 ? "" : "s"} found` +
        (counts.critical
          ? ` — ${counts.critical} critical need immediate attention.`
          : counts.high
            ? ` — ${counts.high} high-risk item${counts.high === 1 ? "" : "s"} to review.`
            : ".");

  return { counts, score, grade, headline };
}

export const GRADE_COLOR: Record<ReportSummary["grade"], string> = {
  A: "text-emerald-600 ring-emerald-600/30 bg-emerald-50",
  B: "text-lime-600 ring-lime-600/30 bg-lime-50",
  C: "text-amber-600 ring-amber-600/30 bg-amber-50",
  D: "text-orange-600 ring-orange-600/30 bg-orange-50",
  F: "text-red-600 ring-red-600/30 bg-red-50",
};

export function toCSV(result: ScanResult): string {
  const rows = [
    ["Severity", "Type", "Detail", "Path"],
    ...result.findings.map((f) => [f.severity, f.type, f.detail, f.path]),
  ];
  return rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}
