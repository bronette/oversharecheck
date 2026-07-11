# OverShare Check

Find SharePoint oversharing before Copilot does. Sign in with Microsoft
(delegated, **read-only**), scan a site, and get a graded exposure report:
anonymous links, org-wide sharing, external guests, broken inheritance, and
direct grants — each with a fix. Export PDF/CSV, email it to yourself, or push
to Teams. Nothing is stored server-side.

Live: **https://oversharecheck.com**

## Stack
- Next.js 16 (App Router, TypeScript)
- Auth.js v5 — Microsoft Entra ID, multi-tenant, delegated `Sites.Read.All`
- Microsoft Graph (`fetch` wrapper with 429 backoff + `$batch`)
- Tailwind v4 · SMTP email via nodemailer · deployed on Vercel

## Local setup
```bash
cp .env.example .env.local     # fill in values (see below)
npm install
npm run dev                    # http://localhost:3000
```

Required env: `AUTH_SECRET` (`npx auth secret`), the three
`AUTH_MICROSOFT_ENTRA_ID_*` values from your Entra app registration. Email
(`SMTP_*`, `MAIL_FROM`, `WAITLIST_TO`) is optional — those features degrade
gracefully when unset.

Entra app: multi-tenant, Web redirect URI
`http://localhost:3000/api/auth/callback/microsoft-entra-id`, delegated Graph
permission `Sites.Read.All`.

## Layout
- `lib/scan.ts` — Graph crawl + permission classification (only reports
  non-inherited sharing)
- `lib/graph.ts` — Graph client (retry, pagination, `$batch`)
- `lib/report.ts` — grading + remediation copy
- `lib/security.ts` — URL/webhook validation (SSRF guard)
- `lib/notify.ts` — SMTP email + Teams Adaptive Card
- `app/scan` — scanner UI + report · `app/[slug]` — SEO pages · `app/api/*` — routes

See `SCOPE.md` for design and roadmap.

## Tests
```bash
npm test        # vitest — pure logic: classify, summarize, validators
```

## Security posture
Delegated read-only Graph access. The access token stays in the encrypted JWT
(never on the session/browser). Report email only sends to the signed-in user.
Teams webhooks are allowlisted to Microsoft hosts. Endpoints are rate-limited.
