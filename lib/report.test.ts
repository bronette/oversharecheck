import { describe, it, expect } from "vitest";
import { summarize } from "./report";
import type { ScanResult, Finding } from "./scan";

function make(findings: Finding[]): ScanResult {
  return {
    siteName: "Test",
    siteUrl: "https://x.sharepoint.com/sites/test",
    itemsScanned: 100,
    itemsWithSharing: findings.length,
    truncated: false,
    findings,
  };
}
const f = (severity: Finding["severity"], type: Finding["type"]): Finding => ({
  severity,
  type,
  path: "https://x/y",
  detail: "d",
});

describe("summarize", () => {
  it("grades a clean site A", () => {
    const s = summarize(make([]));
    expect(s.grade).toBe("A");
    expect(s.score).toBe(100);
    expect(s.counts.critical).toBe(0);
  });
  it("forces F when any critical exists", () => {
    const s = summarize(make([f("critical", "anonymous-link")]));
    expect(s.grade).toBe("F");
  });
  it("counts by severity and lowers the score", () => {
    const s = summarize(make([f("high", "org-wide-link"), f("low", "direct-grant")]));
    expect(s.counts.high).toBe(1);
    expect(s.counts.low).toBe(1);
    expect(s.score).toBeLessThan(100);
    expect(s.headline).toContain("2 exposures");
  });
});
