# SharePoint Permissions Auditor — Scope & Design
_Working codename: `sharepoint-auditor` (brand/domain TBD — see Task #5). Started 2026-07-10._

## One-liner
**"Find oversharing before Copilot does."** A self-serve web tool that scans a SharePoint site (free tier) or entire M365 tenant (paid) and produces a permissions risk report: anonymous links, org-wide sharing, external guests, broken inheritance, direct grants.

## Why this, why now
- Copilot rollouts surface a decade of permission debt instantly — budgeted, urgent demand.
- Incumbents (AvePoint, ShareGate, Purview) are enterprise-priced and sales-led; the $100–500/mo self-serve SMB/MSP tier is open.
- Full rationale: `../idea-research/legacy-market-opportunities-report.md` (idea #19; expansion suite #21/#27/#28).

## Business model
| Tier | Price | What |
|---|---|---|
| Free | $0 | Single-site scan, on-screen + PDF report, no data stored. **This is the lead magnet.** |
| Pro | ~$200–350/mo | Tenant-wide scans, scheduled re-scans, drift alerts, audit-evidence exports |
| MSP | ~$500–1,000/mo | Multi-tenant dashboard, white-label client reports |

$20k MRR ≈ 25 MSPs × $800 or 60 tenants × $350. Channel: r/sharepoint, r/msp, MSPGeek, SEO.

## Architecture (MVP)
- **Next.js 16 (App Router, TS)** — this repo, created with create-next-app.
- **Auth.js v5** (`next-auth@beta`) with the `microsoft-entra-id` provider, multi-tenant (`/common/v2.0` issuer). Delegated flow — the signed-in admin's own permissions bound what we can read. Access token lives in the encrypted JWT session cookie; **no server-side storage of tokens or scan data in the free MVP** (a selling point: "we store nothing").
- **Graph access:** plain `fetch` against `graph.microsoft.com/v1.0` (no SDK — keep deps light). Wrapper in `lib/graph.ts` handles 429/503 `Retry-After` backoff and paging.
- **Scan engine:** `lib/scan.ts`. Stateless per-request in MVP with an item cap (default 2,000 items) to stay inside serverless timeouts. Phase 2 moves scans to a worker (BullMQ + Postgres) for tenant-wide.
- **Deploy:** Azure Container Apps or App Service (fits the story; Docker anyway so portable).

## Graph permissions & consent
- **MVP (delegated):** `User.Read`, `Sites.Read.All`, `offline_access`. Read-only. Some tenants' consent policies will require admin consent even for delegated scopes — fine: our buyer IS the admin.
- **Phase 2 (application):** `Sites.Read.All` application permission + admin-consent flow (`/adminconsent` endpoint) for tenant-wide scheduled scans. This is the paid-tier gate and it's natural: tenant-wide scanning *should* require admin consent.
- **Verify at build time:** exact consent behavior of delegated `Sites.Read.All` varies by tenant policy; test in the dev tenant (Task #2).

## What the scanner detects (finding types, MVP order)
1. **Anonymous ("Anyone") links** — `permission.link.scope === "anonymous"` — CRITICAL
2. **Org-wide sharing links** — `link.scope === "organization"` on sensitive-looking paths — HIGH
3. **"Everyone" / "Everyone except external users" grants** — `spo-grid-all-users` / everyone claims — HIGH
4. **External guests with access** — `#EXT#` UPNs / `grantedToIdentitiesV2` external — HIGH
5. **Broken inheritance** — items with unique permissions (count + where) — MEDIUM
6. **Direct user grants** (person-by-person instead of groups) — LOW/hygiene

Scan strategy: walk drive items breadth-first; use the `shared` facet on items to decide which items are worth a `/permissions` call (avoids N permission calls for untouched items). Batch permission fetches with `$batch` (20/request) in Phase 2.

## Milestones
- **M0 (done):** scaffold, auth skeleton, graph client, scan skeleton, this doc.
- **M1 (~this week):** Kevin does Tasks #1–2 (app registration, test tenant). End-to-end: sign in → pick site → findings on screen against the messy test site.
- **M2 (+1 week):** report polish + PDF export + landing page + domain. The PDF is the shareable artifact — it's the viral loop ("show your boss").
- **M3 (+2 weeks):** ship free tool publicly, post to r/sharepoint + r/msp (Task #6). Collect tenant-wide waitlist emails.
- **M4 (validation-gated):** admin-consent app-permission flow, background tenant-wide scans, scheduled re-scans + drift alerts, Stripe. Only after 3+ "I'd pay" conversations.

## Getting started (after Task #1)
```bash
cp .env.example .env.local   # fill in app registration values
npm run dev                   # http://localhost:3000
```

## Non-goals (MVP)
- No remediation actions (read-only builds trust; write scopes scare admins away from a new vendor).
- No Purview/sensitivity-label integration, no Teams/OneDrive surfaces yet (SharePoint sites only).
- No data persistence beyond the session.

## Competitive honesty
Moat is speed + channel + keywords, not technology. Microsoft (Purview/SAM) and AvePoint could squeeze this; both are slow toward SMB self-serve. Ship fast, own "copilot oversharing" search intent, expand into the suite (config drift, CA analyzer, secret expiry) that shares this buyer.
