export interface SeoPage {
  slug: string;
  title: string; // <title> / H1
  metaTitle: string;
  metaDescription: string;
  intro: string;
  sections: { h: string; p: string }[];
}

export const SEO_PAGES: Record<string, SeoPage> = {
  "sharepoint-permissions-report": {
    slug: "sharepoint-permissions-report",
    title: "SharePoint permissions report",
    metaTitle: "SharePoint Permissions Report — Free Site Scan | OverShare Check",
    metaDescription:
      "Generate a SharePoint permissions report in minutes. See anonymous links, org-wide sharing, external guests, and broken inheritance — read-only, nothing stored.",
    intro:
      "Getting a clear SharePoint permissions report used to mean PowerShell scripts, exported spreadsheets, or an expensive governance suite. OverShare Check scans a site and hands you a graded, shareable report — no install, no agent, read-only.",
    sections: [
      {
        h: "Why native tools make this hard",
        p: "The SharePoint admin center shows you settings, not exposure. Answering “who can actually open this file?” means chasing sharing links, nested groups, and broken inheritance by hand — or writing Graph/PnP PowerShell that few teams maintain. Most orgs simply don’t know.",
      },
      {
        h: "What the report includes",
        p: "Every item with unique (non-inherited) sharing, classified by risk: anonymous “Anyone” links (critical), organization-wide links and external guests (high), broken inheritance (medium), and direct person-by-person grants (low). Each finding comes with a plain-English fix.",
      },
      {
        h: "Export and share it",
        p: "Download the report as a PDF for your boss or auditor, export CSV to work the list, or send it straight to a Teams channel. The report lives only in your browser — we store nothing.",
      },
    ],
  },
  "copilot-oversharing": {
    slug: "copilot-oversharing",
    title: "Find Copilot oversharing before rollout",
    metaTitle: "Copilot Oversharing — Find It Before You Roll Out | OverShare Check",
    metaDescription:
      "Microsoft 365 Copilot surfaces every file a user can access. Scan for oversharing — anonymous links, org-wide sharing, stale guests — before Copilot exposes it.",
    intro:
      "Copilot doesn’t create new access — it makes existing access impossible to ignore. The moment you turn it on, a decade of forgotten sharing links and “Everyone” grants become instantly discoverable in a chat prompt. Scan first.",
    sections: [
      {
        h: "Why Copilot turns permission debt into an incident",
        p: "Copilot answers using everything the prompting user is allowed to see. A file shared org-wide “just to be safe” three years ago is now one question away from anyone in the company. The exposure was always there; Copilot removes the friction that hid it.",
      },
      {
        h: "What to check before you enable Copilot",
        p: "Organization-wide sharing links, anonymous “Anyone” links, “Everyone / Everyone except external users” grants, and external guests with lingering access. These are the patterns that produce the “Copilot showed me something I shouldn’t have seen” stories.",
      },
      {
        h: "Scan a site in minutes",
        p: "Sign in with Microsoft (read-only), point OverShare Check at a site, and get a graded exposure report. Fix the criticals, then roll out Copilot with confidence.",
      },
    ],
  },
  "who-has-access-to-sharepoint": {
    slug: "who-has-access-to-sharepoint",
    title: "Who has access to a SharePoint site?",
    metaTitle: "Who Has Access to a SharePoint Site or File? | OverShare Check",
    metaDescription:
      "Find out who can access a SharePoint site or document — including anonymous links, org-wide sharing, and external guests. Free read-only scan, nothing stored.",
    intro:
      "“Who has access to this?” is a simple question with a painful answer in SharePoint. Access flows from site groups, sharing links, direct grants, and broken inheritance all at once. OverShare Check untangles it into one clear report.",
    sections: [
      {
        h: "The four ways access sneaks in",
        p: "Sharing links (anonymous, organization-wide, or specific-people), direct grants to individuals, all-user “Everyone” claims, and folders that stopped inheriting from their library. Any one of them can quietly widen access far beyond what the site owner intended.",
      },
      {
        h: "See it all in one place",
        p: "The scan walks the document libraries, checks each shared item’s real permissions, filters out normal inherited access, and shows only what’s genuinely overshared — ranked by how risky it is.",
      },
      {
        h: "Read-only and private",
        p: "Sign in with delegated Microsoft permissions. OverShare Check never writes to your tenant and never stores your data — the report exists only in your browser session.",
      },
    ],
  },
};

export const SEO_SLUGS = Object.keys(SEO_PAGES);
