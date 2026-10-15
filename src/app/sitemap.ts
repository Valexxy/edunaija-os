import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://learnnaija.ng";
  const now = new Date();

  const publicRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0
    },
    {
      url: `${baseUrl}/assessments`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9
    },
    {
      url: `${baseUrl}/assessments/asm-jamb-full-mock`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: `${baseUrl}/assessments/asm-diagnostic-01`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8
    },
    {
      url: `${baseUrl}/challenges`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9
    },
    {
      url: `${baseUrl}/curriculum`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: `${baseUrl}/tutors`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8
    },
    {
      url: `${baseUrl}/tutor`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7
    },
    {
      url: `${baseUrl}/progress`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7
    },
    {
      url: `${baseUrl}/promotion`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6
    },
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6
    }
  ];

  return publicRoutes;
}
