/** A CSS mock of the exposure report — social proof on marketing pages. */
export function ReportPreview() {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">
            OverShare Check · Exposure Report
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">Finance</h3>
          <p className="text-xs text-slate-500">
            3 exposures — 1 critical needs attention.
          </p>
        </div>
        <div className="flex h-14 w-14 flex-col items-center justify-center rounded-lg bg-orange-50 ring-2 ring-orange-600/30">
          <span className="text-2xl font-black leading-none text-orange-600">
            D
          </span>
          <span className="text-[9px] text-orange-600/70">58/100</span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2 text-center">
        {[
          ["Critical", "1", "bg-red-500"],
          ["High", "1", "bg-orange-500"],
          ["Medium", "0", "bg-amber-400"],
          ["Low", "1", "bg-slate-400"],
        ].map(([label, n, dot]) => (
          <div key={label} className="rounded-md border border-slate-200 p-2">
            <div className="flex items-center justify-center gap-1">
              <span className={`h-2 w-2 rounded-full ${dot}`} />
              <span className="text-[9px] text-slate-500">{label}</span>
            </div>
            <div className="text-lg font-bold text-slate-900">{n}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 space-y-2">
        <div className="rounded-md border border-slate-200 p-2">
          <span className="rounded bg-red-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-red-700 ring-1 ring-red-600/20">
            Critical
          </span>
          <span className="ml-1 text-xs font-semibold text-slate-900">
            Anonymous “Anyone” link
          </span>
        </div>
        <div className="rounded-md border border-slate-200 p-2">
          <span className="rounded bg-orange-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-orange-700 ring-1 ring-orange-600/20">
            High
          </span>
          <span className="ml-1 text-xs font-semibold text-slate-900">
            Organization-wide link
          </span>
        </div>
      </div>
    </div>
  );
}
