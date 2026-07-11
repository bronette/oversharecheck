#!/usr/bin/env node
/**
 * Seeds a SharePoint site with deliberately-messy sharing so the scanner has
 * something to find. Run ONCE against a throwaway test site.
 *
 *   node scripts/seed-fixture.mjs https://<tenant>.sharepoint.com/sites/<site> [externalEmail]
 *
 * Auth: APP-ONLY (client credentials) — no browser, no sign-in. Requires the
 * Entra app to have the APPLICATION Graph permission `Sites.ReadWrite.All`
 * with admin consent granted. This is TEMPORARY for seeding — the product
 * itself only ever needs delegated Sites.Read.All.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const env = Object.fromEntries(
  readFileSync(join(__dirname, "..", ".env.local"), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).split("#")[0].trim()];
    }),
);
const CLIENT_ID = env.AUTH_MICROSOFT_ENTRA_ID_ID;
const CLIENT_SECRET = env.AUTH_MICROSOFT_ENTRA_ID_SECRET;
const TENANT = "b6212c43-5ec0-4198-b490-4013a5dfbeeb"; // permylastwebhook.com

const siteUrl = process.argv[2];
const externalEmail = process.argv[3] || "test.guest.external@gmail.com";
if (!siteUrl) {
  console.error("Usage: node scripts/seed-fixture.mjs <siteUrl> [externalEmail]");
  process.exit(1);
}

// --- app-only token (client credentials) -----------------------------------
async function getToken() {
  const res = await fetch(
    `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: "https://graph.microsoft.com/.default",
      }),
    },
  );
  const j = await res.json();
  if (!j.access_token) throw new Error(`${j.error}: ${j.error_description}`);
  return j.access_token;
}

// --- tiny Graph helper -----------------------------------------------------
let TOKEN;
async function g(method, path, body) {
  const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}
async function put(path, text) {
  const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "text/plain" },
    body: text,
  });
  if (!res.ok) throw new Error(`PUT ${path} → ${res.status}: ${await res.text()}`);
  return res.json();
}

// --- seed ------------------------------------------------------------------
(async () => {
  TOKEN = await getToken();
  console.log("Got app-only token.");

  const u = new URL(siteUrl);
  const site = await g("GET", `/sites/${u.hostname}:${u.pathname.replace(/\/$/, "")}`);
  console.log(`Site: ${site.displayName}`);
  const sid = site.id;

  const files = {};
  for (let i = 1; i <= 8; i++) {
    const name = `document-${i}.txt`;
    files[name] = await put(
      `/sites/${sid}/drive/root:/${name}:/content`,
      `Test document ${i} — seeded fixture for OverShare Check.`,
    );
  }
  await g("POST", `/sites/${sid}/drive/root/children`, {
    name: "Shared Folder",
    folder: {},
    "@microsoft.graph.conflictBehavior": "replace",
  });
  const folder = await g("GET", `/sites/${sid}/drive/root:/Shared Folder`);
  console.log(`Uploaded ${Object.keys(files).length} files + 1 folder.`);

  // 1. CRITICAL — anonymous "Anyone" link
  try {
    await g("POST", `/sites/${sid}/drive/items/${files["document-1.txt"].id}/createLink`, {
      type: "view",
      scope: "anonymous",
    });
    console.log("✓ [critical] anonymous link on document-1.txt");
  } catch (e) {
    console.log("✗ anonymous link skipped (tenant 'Anyone' sharing likely disabled —");
    console.log("   SharePoint admin → Policies → Sharing → 'Anyone', then re-run).");
    console.log("   " + String(e.message).slice(0, 160));
  }

  // 2. HIGH — org-wide link
  try {
    await g("POST", `/sites/${sid}/drive/items/${files["document-2.txt"].id}/createLink`, {
      type: "view",
      scope: "organization",
    });
    console.log("✓ [high] org-wide link on document-2.txt");
  } catch (e) {
    console.log("✗ org-wide link skipped: " + String(e.message).slice(0, 120));
  }

  // 3. HIGH — external guest on the folder
  try {
    await g("POST", `/sites/${sid}/drive/items/${folder.id}/invite`, {
      recipients: [{ email: externalEmail }],
      requireSignIn: true,
      sendInvitation: false,
      roles: ["read"],
    });
    console.log(`✓ [high] external guest ${externalEmail} on Shared Folder`);
  } catch (e) {
    console.log("✗ external guest skipped (external sharing likely restricted): " + String(e.message).slice(0, 120));
  }

  // 4. LOW — direct grant to a specific user on a file
  try {
    await g("POST", `/sites/${sid}/drive/items/${files["document-3.txt"].id}/invite`, {
      recipients: [{ email: "admin@permylastwebhook.com" }],
      requireSignIn: true,
      sendInvitation: false,
      roles: ["read"],
    });
    console.log("✓ [low] direct grant to admin@permylastwebhook.com on document-3.txt");
  } catch (e) {
    console.log("✗ direct grant skipped: " + String(e.message).slice(0, 120));
  }

  console.log("\nDone. Now scan the site at http://localhost:3000/scan\n");
})().catch((e) => {
  console.error("\nSeeding failed:", e.message);
  process.exit(1);
});
