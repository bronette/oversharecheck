/**
 * Input-validation security controls, kept pure so they're unit-testable.
 */

/** A real SharePoint site URL: https, no userinfo, hostname under sharepoint.com. */
export function isValidSharePointUrl(raw: string): boolean {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return false;
  }
  if (u.protocol !== "https:") return false;
  if (u.username || u.password) return false; // block user:pass@host tricks
  const host = u.hostname.toLowerCase();
  return host === "sharepoint.com" || host.endsWith(".sharepoint.com");
}

/** Loopback / private / link-local hosts — never a legit webhook target (SSRF guard). */
export function isPrivateHost(host: string): boolean {
  const h = host.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost") || h === "::1") return true;
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    if (a === 0 || a === 10 || a === 127) return true; // this-net, private, loopback
    if (a === 172 && b >= 16 && b <= 31) return true; // private
    if (a === 192 && b === 168) return true; // private
    if (a === 169 && b === 254) return true; // link-local
  }
  if (h.startsWith("fe80") || h.startsWith("fc") || h.startsWith("fd")) return true; // IPv6 ll/ula
  return false;
}

/** Strict allowlist for Teams Workflows / legacy-connector webhook hosts. */
const TEAMS_HOST_SUFFIXES = [
  ".logic.azure.com", // Power Automate Workflows
  ".powerplatform.com",
  ".azure-apihub.net",
  ".webhook.office.com", // legacy O365 connector
];

export function isValidTeamsWebhook(raw: string): boolean {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return false;
  }
  if (u.protocol !== "https:") return false;
  if (u.username || u.password) return false;
  const host = u.hostname.toLowerCase();
  if (isPrivateHost(host)) return false;
  return TEAMS_HOST_SUFFIXES.some((s) => host.endsWith(s));
}
