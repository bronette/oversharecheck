import { graphFetch, graphGetAll, graphBatchGet } from "./graph";

export type Severity = "critical" | "high" | "medium" | "low";

export interface Finding {
  severity: Severity;
  type:
    | "anonymous-link"
    | "org-wide-link"
    | "everyone-grant"
    | "external-guest"
    | "broken-inheritance"
    | "direct-grant";
  path: string;
  detail: string;
}

export interface ScanResult {
  siteName: string;
  siteUrl: string;
  itemsScanned: number;
  itemsWithSharing: number; // items carrying unique (non-inherited) sharing
  truncated: boolean;
  findings: Finding[];
}

interface DriveItem {
  id: string;
  name: string;
  webUrl?: string;
  folder?: { childCount: number };
  shared?: object; // presence = item has been shared
}

interface Identity {
  displayName?: string;
  email?: string;
  loginName?: string;
}
interface Permission {
  id: string;
  roles?: string[];
  inheritedFrom?: { id: string }; // present ⇒ permission comes from the parent
  link?: { scope?: "anonymous" | "organization" | "users"; type?: string };
  grantedToV2?: { user?: Identity; siteUser?: Identity; group?: Identity; siteGroup?: Identity };
  grantedToIdentitiesV2?: Array<{ user?: Identity; siteUser?: Identity }>;
}

/**
 * Resolve a SharePoint URL → Graph site. Handles:
 *   https://tenant.sharepoint.com                     (root site)
 *   https://tenant.sharepoint.com/sites/finance       (team site)
 *   https://tenant.sharepoint.com/sites/finance/Shared%20Documents/... (deep link)
 */
export async function resolveSite(accessToken: string, siteUrl: string) {
  // Tolerate URLs pasted from prose/emails: strip trailing punctuation & spaces.
  const cleaned = siteUrl.trim().replace(/[)\]}>.,;\s]+$/, "");
  const u = new URL(cleaned);
  const segs = u.pathname.split("/").filter(Boolean);
  let sitePath = "";
  if (segs.length >= 2 && (segs[0] === "sites" || segs[0] === "teams")) {
    sitePath = `:/${segs[0]}/${decodeURIComponent(segs[1])}`;
  }
  return graphFetch<{ id: string; displayName: string; webUrl: string }>(
    accessToken,
    `/sites/${u.hostname}${sitePath}`,
  );
}

const EVERYONE_MARKERS = [
  "everyone except external",
  "spo-grid-all-users",
  "everyone",
];
// System principals that are normal site plumbing, not oversharing.
const SYSTEM_MARKERS = ["system account", "sharepoint\\system", "app@sharepoint"];
const EXT_MARKERS = ["#ext#", "urn:spo:guest"];

function isEveryone(id: Identity): boolean {
  const s = `${id.displayName ?? ""} ${id.loginName ?? ""}`.toLowerCase();
  return EVERYONE_MARKERS.some((m) => s.includes(m));
}
function isExternal(id: Identity): boolean {
  const s = `${id.email ?? ""} ${id.loginName ?? ""}`.toLowerCase();
  return EXT_MARKERS.some((m) => s.includes(m));
}
function isSystem(id: Identity): boolean {
  const s = `${id.displayName ?? ""} ${id.loginName ?? ""}`.toLowerCase();
  return SYSTEM_MARKERS.some((m) => s.includes(m));
}

function classify(
  perms: Permission[],
  item: { path: string; isFolder: boolean },
): Finding[] {
  const out: Finding[] = [];
  let hasUnique = false;

  for (const p of perms) {
    if (p.inheritedFrom) continue; // only report permissions unique to this item
    hasUnique = true;
    const role = p.roles?.join(", ") || "read";

    // Sharing links
    if (p.link) {
      if (p.link.scope === "anonymous") {
        out.push({
          severity: "critical",
          type: "anonymous-link",
          path: item.path,
          detail: `"Anyone" link (${p.link.type ?? "view"}) — opens without sign-in`,
        });
        continue;
      }
      if (p.link.scope === "organization") {
        out.push({
          severity: "high",
          type: "org-wide-link",
          path: item.path,
          detail: `Org-wide link (${p.link.type ?? "view"}) — every tenant user, and Copilot, can reach this`,
        });
        continue;
      }
      // "users" scope: flag only if an external recipient is on the link
      const ext = (p.grantedToIdentitiesV2 ?? [])
        .map((g) => g.user ?? g.siteUser ?? {})
        .find((id) => isExternal(id));
      if (ext) {
        out.push({
          severity: "high",
          type: "external-guest",
          path: item.path,
          detail: `Link shared with external ${ext.email ?? ext.displayName ?? "guest"}`,
        });
      }
      continue;
    }

    // Direct role assignments
    const person = p.grantedToV2?.user ?? p.grantedToV2?.siteUser;
    const group = p.grantedToV2?.group ?? p.grantedToV2?.siteGroup;

    if (group) {
      if (isEveryone(group)) {
        out.push({
          severity: "high",
          type: "everyone-grant",
          path: item.path,
          detail: `Granted to "${group.displayName ?? "Everyone"}" (${role})`,
        });
      }
      // default SP groups / custom groups: normal membership — skip
      continue;
    }
    if (person) {
      if (isSystem(person)) continue;
      if (isEveryone(person)) {
        out.push({
          severity: "high",
          type: "everyone-grant",
          path: item.path,
          detail: `Granted to "${person.displayName ?? "Everyone"}" (${role})`,
        });
      } else if (isExternal(person)) {
        out.push({
          severity: "high",
          type: "external-guest",
          path: item.path,
          detail: `External guest ${person.email ?? person.displayName} (${role})`,
        });
      } else {
        out.push({
          severity: "low",
          type: "direct-grant",
          path: item.path,
          detail: `Direct grant to ${person.displayName ?? person.email} (${role})`,
        });
      }
    }
  }

  // A folder with unique permissions = broken inheritance (report once).
  if (hasUnique && item.isFolder) {
    out.push({
      severity: "medium",
      type: "broken-inheritance",
      path: item.path,
      detail: "Folder has unique permissions that diverge from its parent",
    });
  }
  return out;
}

/**
 * BFS the site's document libraries collecting items with a `shared` facet,
 * batch-fetch their permissions, and classify only the non-inherited ones.
 *
 * Known limitation: relies on Graph's `shared` facet as the cheap pre-filter;
 * items overshared purely at the list level without the facet aren't caught.
 * True list-level scanning needs the SharePoint REST API (roadmap).
 */
export async function scanSite(
  accessToken: string,
  siteUrl: string,
  maxItems = Number(process.env.SCAN_MAX_ITEMS ?? 2000),
): Promise<ScanResult> {
  const site = await resolveSite(accessToken, siteUrl);
  const drives = await graphGetAll<{ id: string }>(
    accessToken,
    `/sites/${site.id}/drives`,
  );

  let itemsScanned = 0;
  let truncated = false;
  // Collect candidates first, then batch permission lookups.
  const candidates: Array<{ driveId: string; id: string; path: string; isFolder: boolean }> = [];

  const queue: Array<{ driveId: string; itemId: string }> = drives.map((d) => ({
    driveId: d.id,
    itemId: "root",
  }));

  while (queue.length > 0) {
    if (itemsScanned >= maxItems) {
      truncated = true;
      break;
    }
    const { driveId, itemId } = queue.shift()!;
    let children: DriveItem[];
    try {
      children = await graphGetAll<DriveItem>(
        accessToken,
        `/drives/${driveId}/items/${itemId}/children?$select=id,name,webUrl,folder,shared&$top=200`,
      );
    } catch {
      continue; // skip libraries we can't read rather than failing the whole scan
    }
    for (const child of children) {
      itemsScanned++;
      if (child.folder) queue.push({ driveId, itemId: child.id });
      if (child.shared) {
        candidates.push({
          driveId,
          id: child.id,
          path: child.webUrl ?? child.name,
          isFolder: !!child.folder,
        });
      }
      if (itemsScanned >= maxItems) break;
    }
  }

  // Batch-fetch permissions for all candidates (20 per Graph $batch call).
  const byId = new Map(candidates.map((c, i) => [String(i), c]));
  const permMap = await graphBatchGet<Permission>(
    accessToken,
    candidates.map((c, i) => ({
      id: String(i),
      url: `/drives/${c.driveId}/items/${c.id}/permissions`,
    })),
  );

  const findings: Finding[] = [];
  let itemsWithSharing = 0;
  for (const [id, perms] of permMap) {
    const item = byId.get(id)!;
    const itemFindings = classify(perms, item);
    if (itemFindings.length) itemsWithSharing++;
    findings.push(...itemFindings);
  }

  const order: Severity[] = ["critical", "high", "medium", "low"];
  findings.sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));

  return {
    siteName: site.displayName,
    siteUrl: site.webUrl,
    itemsScanned,
    itemsWithSharing,
    truncated,
    findings,
  };
}
