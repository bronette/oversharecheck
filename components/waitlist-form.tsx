"use client";

import { useState } from "react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setState("done");
      setMsg("You’re on the list — we’ll email you when tenant-wide scans open.");
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (state === "done") {
    return <p className="text-sm font-medium text-emerald-400">{msg}</p>;
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
      <input
        type="email"
        required
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-blue-400"
      />
      <button
        type="submit"
        disabled={state === "sending"}
        className="grad-accent rounded-lg px-5 py-2.5 font-medium text-white hover:brightness-110 disabled:opacity-50"
      >
        {state === "sending" ? "…" : "Join the waitlist"}
      </button>
      {state === "error" && (
        <p className="text-sm text-red-400 sm:hidden">{msg}</p>
      )}
    </form>
  );
}
