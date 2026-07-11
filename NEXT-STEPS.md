# OverShare Check — where we left off

_Shelved 2026-07-11. Everything below is the state of the world so we can restart cleanly._

## TL;DR
A working, deployed, security-hardened SharePoint oversharing scanner. Live at
**https://oversharecheck.com** (and oversharecheck.vercel.app). The build is
done; what's left is go-to-market plus two loose ends (email activation, a
launch decision).

## Live / done
- **Repo:** `~/code-projects/oversharecheck` → github.com/bronette/oversharecheck (public). Everything committed & pushed; working tree clean.
- **Hosting:** Vercel (team `bronette`), auto-deploys on push to `main`. Custom domain `oversharecheck.com` wired via cPanel DNS (apex A → 216.198.79.1, www CNAME → Vercel). HTTPS live.
- **Auth:** Entra app "OverShare Check", multi-tenant, client ID `ef952db9-315f-4a40-9bd6-f93cb6ecbb8b`, tenant `b6212c43-5ec0-4198-b490-4013a5dfbeeb`. Redirect URIs registered for localhost, vercel.app, www.oversharecheck.com. Permissions = **6 delegated read-only scopes** (email, openid, profile, offline_access, User.Read, Sites.Read.All). Verified working in prod.
- **Product:** scan engine (inherited-perms filtered, verified on real tenant), graded report (A–F) + fix guidance, PDF/CSV export, email + Teams delivery, dark UI + shield logo, landing + 3 SEO pages + pricing + waitlist.
- **Security:** hardened per Cursor audit (token off session via getToken, email-to-self only, Teams SSRF allowlist, hostname validation, error sanitization, rate limiting, /scan middleware guard). vitest suite (10 tests) + GitHub Actions CI. nodemailer on v9.

## Open threads (resume here)

### 1. Email — waiting on Private Email activation
- Mail is on **Namecheap Private Email** (NOT cPanel). SMTP host `mail.privateemail.com:465`, user `reports@oversharecheck.com`.
- DNS records added 2026-07-11 (MX → mx1/mx2.privateemail.com, SPF → `include:spf.privateemail.com`; jellyfish MX removed). **Activation takes up to ~4h.**
- Password is in `.env.local` and Vercel env vars already.
- **NEXT:** after activation, run the SMTP test (see below). If it authenticates → email + waitlist delivery are live, nothing more to do. If still 535 after ~4h, confirm the mailbox exists in the Private Email dashboard (Namecheap account → Private Email).
- Test command (from repo root, password in `.env.local`):
  ```
  node -e 'import("nodemailer").then(async(m)=>{const t=m.default.createTransport({host:"mail.privateemail.com",port:465,secure:true,auth:{user:"reports@oversharecheck.com",pass:process.env.P}});await t.verify();console.log("OK");})' P="<password>"
  ```

### 2. Launch decision (task #6) — the main thing left
- Posts drafted in `LAUNCH-POSTS.md` (r/msp primary, r/sharepoint secondary, comment cheat-sheet).
- **Blocking decision:** how to handle the **"unverified app" consent screen**. Options discussed:
  - (a) Launch now + add a transparency line to the post about the unverified consent screen. Fastest validation.
  - (b) Do **Microsoft Publisher Verification** first (verified Partner account → blue badge). Days of setup, higher conversion.
  - (c) Soft-test cross-tenant sign-in with 1–2 external admins first (external-org sign-in is currently unverified — only tested from own tenant).
- **NEXT:** pick one, tweak the post, publish. Success metric: 10 conversations + 3 "I'd pay" → build the paid tenant-wide tier. If <3, fall back to idea #38 (COI tracking) in `../idea-research/legacy-market-opportunities-report.md`.

### 3. Verify the anonymous-link (critical) finding — untested
- The critical/external-guest detections are coded but never seen fire (tenant sharing policy blocks seeding them).
- **NEXT (optional, before launch ideally):** SharePoint admin → Policies → Sharing → "Anyone" + allow external; temporarily re-add app-only `Sites.ReadWrite.All` + admin consent; re-run `scripts/seed-fixture.mjs`; re-scan; then REMOVE the write perm again.

### 4. Housekeeping (low priority)
- Delete `~/Desktop/oversharecheck-env.txt` (plaintext secrets copy).
- Rotate the cPanel default password if not done.
- Turn on Vercel spend cap/pause.
- Consider a durable rate limiter (Upstash/Vercel KV) before real traffic — current one is in-memory/per-instance.

## Resume dev locally
```
cd ~/code-projects/oversharecheck
npm install
npm run dev        # http://localhost:3000  (needs .env.local)
npm test           # vitest
```
Design/roadmap: `SCOPE.md`. Origin research: `../idea-research/legacy-market-opportunities-report.md` (this is idea #19).
