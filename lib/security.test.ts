import { describe, it, expect } from "vitest";
import { isValidSharePointUrl, isValidTeamsWebhook, isPrivateHost } from "./security";

describe("isValidSharePointUrl", () => {
  it("accepts real SharePoint hosts", () => {
    expect(isValidSharePointUrl("https://contoso.sharepoint.com/sites/finance")).toBe(true);
    expect(isValidSharePointUrl("https://contoso.sharepoint.com")).toBe(true);
  });
  it("rejects the lookalike-domain trick", () => {
    expect(isValidSharePointUrl("https://evil.sharepoint.com.attacker.com/x")).toBe(false);
    expect(isValidSharePointUrl("https://sharepoint.com.attacker.com")).toBe(false);
  });
  it("rejects non-https and userinfo tricks", () => {
    expect(isValidSharePointUrl("http://contoso.sharepoint.com")).toBe(false);
    expect(isValidSharePointUrl("https://user:pass@contoso.sharepoint.com")).toBe(false);
    expect(isValidSharePointUrl("not a url")).toBe(false);
  });
});

describe("isValidTeamsWebhook", () => {
  it("accepts Power Automate / connector hosts", () => {
    expect(isValidTeamsWebhook("https://prod-1.westus.logic.azure.com/workflows/abc/triggers/x")).toBe(true);
    expect(isValidTeamsWebhook("https://contoso.webhook.office.com/webhookb2/guid")).toBe(true);
  });
  it("rejects arbitrary and private hosts (SSRF guard)", () => {
    expect(isValidTeamsWebhook("https://attacker.com/collect")).toBe(false);
    expect(isValidTeamsWebhook("https://169.254.169.254/latest/meta-data")).toBe(false);
    expect(isValidTeamsWebhook("http://localhost:8080/x")).toBe(false);
  });
});

describe("isPrivateHost", () => {
  it("flags loopback, private, link-local", () => {
    for (const h of ["localhost", "127.0.0.1", "10.0.0.5", "172.16.0.1", "192.168.1.1", "169.254.169.254", "::1"]) {
      expect(isPrivateHost(h)).toBe(true);
    }
  });
  it("allows public hosts", () => {
    expect(isPrivateHost("contoso.webhook.office.com")).toBe(false);
    expect(isPrivateHost("8.8.8.8")).toBe(false);
  });
});
