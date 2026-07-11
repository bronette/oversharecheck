# Launch posts — OverShare Check

Ground rules for these communities (read before posting):
- **Be a peer, not a marketer.** These subs nuke anything that smells like an ad. Lead with the problem and "I built a free thing," not features.
- **Free, read-only, nothing-stored** are your trust anchors — say them plainly and early.
- **Attach the report screenshot** (the graded B/D report). It does more than any paragraph.
- **Reply to every comment**, especially skeptical ones. Engagement = reach, and the feedback IS the validation.
- **Post from a real account with history**, not a day-old throwaway (mods check). Use your normal Reddit account.
- **Don't post the same text to both subs the same day** — space them a few days apart and vary the wording, or you'll get flagged for spam.

---

## r/msp — primary target (MSPs = your highest-value buyer)

**Title:**
I got tired of PowerShell for "who can see this SharePoint file", so I built a free read-only scanner — would love your feedback before I add multi-tenant

**Body:**

Every Copilot rollout lately turns into the same fire drill: a client enables it, and suddenly it's surfacing files that were shared "org-wide just to be safe" five years ago. Answering "who actually has access to this?" in SharePoint means PowerShell/Graph scripts nobody wants to maintain, or a governance suite priced for enterprises.

So I built **OverShare Check** — you sign in with Microsoft (delegated, **read-only**, `Sites.Read.All`), point it at a site, and it gives you a graded report of the oversharing: anonymous "Anyone" links, org-wide links, external guests, broken inheritance, and person-by-person grants. Each finding has a plain-English fix. Export to PDF/CSV or push to a Teams channel.

It's **read-only and stores nothing** — the report lives in your browser. First scan is free.

Link: https://oversharecheck.com

I'm building toward multi-tenant (scan all your clients from one dashboard) and scheduled re-scans with drift alerts, but before I do — **is this actually useful to you, and what would you need it to do to be worth paying for?** Brutal feedback welcome. Happy to answer anything about how it works under the hood.

*(screenshot of the graded report)*

---

## r/sharepoint — secondary (admins, not buyers, but great feedback + SEO)

**Title:**
Built a free read-only tool to get a SharePoint "who has access" exposure report — looking for feedback

**Body:**

Getting a clear picture of external sharing / oversharing on a SharePoint site is way harder than it should be — the admin center shows settings, not exposure, and the honest answer usually involves PnP PowerShell.

I made a small tool that scans a site (Microsoft sign-in, **read-only**, nothing stored) and produces a graded report: anonymous links, org-wide links, external guests, broken inheritance, direct grants — each with a suggested fix. PDF/CSV export.

https://oversharecheck.com

Would genuinely value feedback from people who manage this daily — especially: what am I missing in how oversharing actually shows up in your tenants? I know list-level uniqueness beyond the drive `shared` facet is a gap I want to close next.

*(screenshot of the graded report)*

---

## Follow-up / comment-reply cheat sheet

- **"How is this different from Purview / ShareGate / AvePoint?"** → Those are enterprise-priced and sales-led. This is self-serve, free to try, and aimed at the SMB/MSP tier that can't justify a governance platform. Read-only, no implementation.
- **"Is it safe? What are you doing with our data?"** → Delegated read-only `Sites.Read.All`. It can't write anything. Reports render in your browser; nothing is stored server-side. (You can revoke it in Entra any time.)
- **"Does it need admin consent?"** → Depends on your tenant's consent policy. It requests delegated read of sites; some tenants require admin approval even for that. No app-only/tenant-wide access in the free scan.
- **"Can it scan a whole tenant / OneDrive / all sites?"** → That's the paid tier I'm building — join the waitlist. Free scan is per-site by design.
- **"What about false positives?"** → It filters inherited permissions and only reports what's unique to an item, and skips default SharePoint groups. If you see a miss or a false hit, tell me the shape of it — that's exactly the feedback I want.

---

## Where else to post (space these out over 2–3 weeks)

- **r/Office365**, **r/entra**, **r/sysadmin** (r/sysadmin is strict — read rules, maybe "Thickheaded Thursday")
- **MSPGeek** Slack/forum, **r/microsoft365**
- **LinkedIn** — post the screenshot + a short "why I built this" to your own network (you're a Sales Engineer; this is your crowd)
- **Peer-review sites later**: a Capterra/G2 listing once you have a couple of users
