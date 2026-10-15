import { describe, it, expect } from "vitest";
import {
  getEducationalOrganizationSchema,
  getWebSiteSchema,
  getNationalCourseSchemas,
  getNationalFAQSchema,
  getBreadcrumbListSchema
} from "@/lib/seo/structured-data";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

describe("Google SGE and Technical SEO Structured Data Suite (Path A)", () => {
  it("generates compliant EducationalOrganization schema with sovereign Nigerian credentials", () => {
    const org = getEducationalOrganizationSchema();
    expect(org["@type"]).toBe("EducationalOrganization");
    expect(org.name).toContain("LearnNaija");
    expect(org.foundingLocation.name).toBe("Nigeria");
    expect(org.knowsLanguage).toContain("pcm");
    expect(org.hasCredential["@type"]).toBe("EducationalOccupationalCredential");
    expect(org.hasCredential.name).toBe("National Scholastic Merit Certificate");
  });

  it("generates WebSite schema with search action targeting curriculum", () => {
    const site = getWebSiteSchema();
    expect(site["@type"]).toBe("WebSite");
    expect(site.potentialAction["@type"]).toBe("SearchAction");
    expect(site.potentialAction.target.urlTemplate).toContain("/curriculum?q=");
  });

  it("generates NERDC-aligned course schemas with statutory codes", () => {
    const courses = getNationalCourseSchemas();
    expect(courses.length).toBeGreaterThanOrEqual(3);
    for (const c of courses) {
      expect(c["@type"]).toBe("Course");
      expect(c.courseCode).toMatch(/^NERDC-/);
      expect(c.isAccessibleForFree).toBe(true);
      expect(c.provider["@type"]).toBe("EducationalOrganization");
    }
  });

  it("generates FAQPage schema addressing statutory examinations and offline PWA", () => {
    const faq = getNationalFAQSchema();
    expect(faq["@type"]).toBe("FAQPage");
    expect(faq.mainEntity.length).toBeGreaterThanOrEqual(3);

    const questions = faq.mainEntity.map((q) => q.name);
    expect(questions.some((q) => q.includes("JAMB"))).toBe(true);
    expect(questions.some((q) => q.includes("tutors"))).toBe(true);
    expect(questions.some((q) => q.includes("offline"))).toBe(true);
  });

  it("generates BreadcrumbList schema with 1-indexed positions", () => {
    const crumbs = getBreadcrumbListSchema([
      { name: "Home", url: "/" },
      { name: "CBT Assessments", url: "/assessments" },
      { name: "JAMB Mock", url: "/assessments/asm-jamb-full-mock" }
    ]);

    expect(crumbs["@type"]).toBe("BreadcrumbList");
    expect(crumbs.itemListElement).toHaveLength(3);
    expect(crumbs.itemListElement[0].position).toBe(1);
    expect(crumbs.itemListElement[2].position).toBe(3);
  });

  it("dynamically builds sitemap containing all essential learning routes", () => {
    const map = sitemap();
    expect(map.length).toBeGreaterThanOrEqual(10);

    const urls = map.map((m) => m.url);
    expect(urls.some((u) => u.endsWith("/assessments"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/challenges"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/curriculum"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/tutors"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/pricing"))).toBe(true);

    for (const entry of map) {
      expect(entry.priority).toBeGreaterThan(0);
      expect(entry.changeFrequency).toBeTruthy();
    }
  });

  it("dynamically configures robots.txt disallowing private portal routes while indexing learning hubs", () => {
    const rob = robots();
    expect(rob.sitemap).toContain("/sitemap.xml");
    expect(rob.rules).toBeDefined();

    const wildcardRule = (rob.rules as Array<{ userAgent: string | string[]; allow?: string | string[]; disallow?: string | string[] }>).find(
      (r) => r.userAgent === "*"
    );
    expect(wildcardRule).toBeDefined();
    expect(wildcardRule?.disallow).toContain("/api/");
    expect(wildcardRule?.disallow).toContain("/guardian/");
    expect(wildcardRule?.disallow).toContain("/teacher/");
  });
});
