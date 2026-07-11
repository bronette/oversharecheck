"use client";

import { useState } from "react";
import type { ScanResult, Severity } from "@/lib/scan";
import {
  SEVERITY_META,
  FINDING_META,
  GRADE_COLOR,
  summarize,
  toCSV,
} from "@/lib/report";

const SEVERITIES: Severity[] = ["critical", "high", "medium", "low"];

export default function ScanPage() {
  const [siteUrl, setSiteUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  async function runScan() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Scan failed");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  function downloadCSV() {
    if (!result) return;
    const blob = new Blob([toCSV(result)], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `oversharecheck-${result.siteName}.csv`;
    a.click();
  }

  const summary = result ? summarize(result) : null;

  return <ScanUI {...{ siteUrl, setSiteUrl, busy, error, result, summary, runScan, downloadCSV }} />;
}

function SharePanel({ result }: { result: ScanResult }) {
  const [webhook, setWebhook] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [sending, setSending] = useState<"email" | "teams" | null>(null);

  async function send(kind: "email" | "teams") {
    setSending(kind);
    setStatus(null);
    try {
      const res = await fetch(`/api/report/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          kind === "email" ? { result } : { webhookUrl: webhook, result },
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setStatus(
        kind === "email"
          ? `Report emailed to ${data.sentTo ?? "your account"}.`
          : "Posted to Teams.",
      );
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed");
    } finally {
      setSending(null);
    }
  }

  return (
    <div className="no-print mt-6 rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">Share this report</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <button
          onClick={() => send("email")}
          disabled={sending === "email"}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {sending === "email" ? "Sending…" : "Email the report to me"}
        </button>
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="Teams Workflows webhook URL"
            value={webhook}
            onChange={(e) => setWebhook(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500"
          />
          <button
            onClick={() => send("teams")}
            disabled={!webhook || sending === "teams"}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {sending === "teams" ? "…" : "Teams"}
          </button>
        </div>
      </div>
      {status && <p className="mt-2 text-sm text-slate-600">{status}</p>}
    </div>
  );
}

interface ScanUIProps {
  siteUrl: string;
  setSiteUrl: (v: string) => void;
  busy: boolean;
  error: string | null;
  result: ScanResult | null;
  summary: ReturnType<typeof summarize> | null;
  runScan: () => void;
  downloadCSV: () => void;
}

function ScanUI({
  siteUrl,
  setSiteUrl,
  busy,
  error,
  result,
  summary,
  runScan,
  downloadCSV,
}: ScanUIProps) {

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      {/* Scan form */}
      <div className="no-print">
        <h1 className="text-2xl font-bold text-white">Scan a SharePoint site</h1>
        <p className="mt-1 text-sm text-slate-400">
          Read-only · delegated permissions · nothing is stored — the report
          lives only in your browser.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <input
            className="flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white placeholder:text-slate-500 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
            placeholder="https://contoso.sharepoint.com/sites/finance"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && siteUrl && !busy && runScan()}
          />
          <button
            onClick={runScan}
            disabled={busy || !siteUrl}
            className="grad-accent rounded-lg px-5 py-2 font-medium text-white shadow-lg shadow-blue-500/25 transition hover:brightness-110 disabled:opacity-50"
          >
            {busy ? "Scanning…" : "Scan"}
          </button>
        </div>
        {busy && (
          <p className="mt-3 animate-pulse text-sm text-slate-400">
            Crawling document libraries and checking permissions…
          </p>
        )}
        {error && (
          <div className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}
      </div>

      {/* Report — a light "document" on the dark app, prints clean */}
      {result && summary && (
        <section
          className="report-doc mt-10 rounded-2xl bg-white p-6 text-slate-900 shadow-2xl shadow-black/40 sm:p-8"
          id="report"
        >
          {/* Report header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                OverShare Check · Exposure Report
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {result.siteName}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{summary.headline}</p>
              <p className="mt-1 text-xs text-slate-400">
                {result.itemsScanned.toLocaleString()} items scanned
                {result.truncated && " (truncated at scan cap)"}
              </p>
            </div>
            <div
              className={`flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl ring-2 ${GRADE_COLOR[summary.grade]}`}
            >
              <span className="text-3xl font-black leading-none">
                {summary.grade}
              </span>
              <span className="mt-0.5 text-[10px] font-medium opacity-70">
                {summary.score}/100
              </span>
            </div>
          </div>

          {/* Severity scorecard */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SEVERITIES.map((s) => (
              <div
                key={s}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${SEVERITY_META[s].dot}`}
                  />
                  <span className="text-xs font-medium text-slate-500">
                    {SEVERITY_META[s].label}
                  </span>
                </div>
                <div className="mt-1 text-2xl font-bold text-slate-900">
                  {summary.counts[s]}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="no-print mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => window.print()}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Download PDF
            </button>
            <button
              onClick={downloadCSV}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Export CSV
            </button>
          </div>

          {/* Share */}
          <SharePanel result={result} />

          {/* Findings */}
          <div className="mt-8 space-y-3">
            {result.findings.length === 0 && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center text-emerald-700">
                No oversharing found in the scanned items. 🎉
              </div>
            )}
            {result.findings.map((f, i) => {
              const meta = FINDING_META[f.type];
              return (
                <div
                  key={i}
                  className="break-inside-avoid rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold uppercase ring-1 ring-inset ${SEVERITY_META[f.severity].chip}`}
                    >
                      {SEVERITY_META[f.severity].label}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {meta.title}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{f.detail}</p>
                  <p className="mt-1 text-sm text-slate-500">{meta.why}</p>
                  <div className="mt-2 rounded-md bg-slate-50 p-2 text-sm text-slate-700">
                    <span className="font-medium text-slate-900">Fix:</span>{" "}
                    {meta.fix}
                  </div>
                  <a
                    href={f.path}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block truncate text-xs text-blue-600 hover:underline"
                  >
                    {f.path}
                  </a>
                </div>
              );
            })}
          </div>

          <p className="mt-8 border-t border-slate-200 pt-4 text-center text-xs text-slate-400">
            Generated by OverShare Check · oversharecheck.com
          </p>
        </section>
      )}
    </main>
  );
}
