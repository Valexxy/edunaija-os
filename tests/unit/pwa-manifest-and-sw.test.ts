import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

describe("Enterprise Progressive Web App (PWA) Verification Suite", () => {
  const publicDir = path.resolve(process.cwd(), "public");

  it("1. Web App Manifest meets strict Google Chromium & W3C PWA Installability Standards", () => {
    const manifestPath = path.join(publicDir, "manifest.json");
    expect(fs.existsSync(manifestPath)).toBe(true);

    const raw = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(raw);

    // Core Identity & Shell requirements
    expect(manifest.name).toContain("LearnNaija");
    expect(manifest.short_name).toBe("LearnNaija");
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBeDefined();
    expect(manifest.theme_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(manifest.background_color).toMatch(/^#[0-9A-Fa-f]{6}$/);

    // Icons: Must have 192x192, 512x512, and maskable
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(3);

    const icon192 = manifest.icons.find((i: any) => i.sizes === "192x192");
    expect(icon192).toBeDefined();
    expect(icon192.type).toBe("image/png");

    const icon512 = manifest.icons.find((i: any) => i.sizes === "512x512" && (!i.purpose || i.purpose === "any"));
    expect(icon512).toBeDefined();

    const iconMaskable = manifest.icons.find((i: any) => i.purpose === "maskable");
    expect(iconMaskable).toBeDefined();

    // Verify all icon files exist on disk
    for (const icon of manifest.icons) {
      const relPath = icon.src.startsWith("/") ? icon.src.slice(1) : icon.src;
      const fullPath = path.join(publicDir, relPath);
      expect(fs.existsSync(fullPath)).toBe(true);
      expect(fs.statSync(fullPath).size).toBeGreaterThan(100);
    }

    // App shortcuts for quick native launcher actions
    expect(Array.isArray(manifest.shortcuts)).toBe(true);
    expect(manifest.shortcuts.length).toBeGreaterThanOrEqual(3);
    const cbtShortcut = manifest.shortcuts.find((s: any) => s.url === "/assessments");
    expect(cbtShortcut).toBeDefined();
  });

  it("2. Enterprise Service Worker (sw.js) contains offline caching strategies and privacy protection", () => {
    const swPath = path.join(publicDir, "sw.js");
    expect(fs.existsSync(swPath)).toBe(true);

    const swContent = fs.readFileSync(swPath, "utf-8");

    // Precaching verification
    expect(swContent).toContain("PRECACHE_ASSETS");
    expect(swContent).toContain("/offline.html");
    expect(swContent).toContain("/manifest.json");

    // Life cycle events
    expect(swContent).toContain("self.addEventListener(\"install\"");
    expect(swContent).toContain("self.addEventListener(\"activate\"");
    expect(swContent).toContain("self.addEventListener(\"fetch\"");

    // Caching strategies
    expect(swContent).toContain("navigate");
    expect(swContent).toContain("OFFLINE_FALLBACK_URL");
    expect(swContent).toContain("Stale-While-Revalidate");

    // Security & Privacy Shield
    expect(swContent).toContain("/api/auth");
    expect(swContent).toContain("/api/monitoring");
  });

  it("3. Offline Fallback Page (offline.html) is present and branded with zero-data offline messaging", () => {
    const offlineHtmlPath = path.join(publicDir, "offline.html");
    expect(fs.existsSync(offlineHtmlPath)).toBe(true);

    const html = fs.readFileSync(offlineHtmlPath, "utf-8");
    expect(html).toContain("You are Currently Offline");
    expect(html).toContain("Zero Data Offline Vault");
    expect(html).toContain("Continue Cached CBT Practice");
    expect(html).toContain("/assessments");
    expect(html).toContain("window.addEventListener(\"online\"");
  });

  it("4. Apple Safari PWA touch icons and tags exist for iOS device home-screen installation", () => {
    const appleIconPath = path.join(publicDir, "icons", "apple-touch-icon.png");
    expect(fs.existsSync(appleIconPath)).toBe(true);
    expect(fs.statSync(appleIconPath).size).toBeGreaterThan(500);

    const faviconPath = path.join(publicDir, "favicon.ico");
    expect(fs.existsSync(faviconPath)).toBe(true);
  });
});
