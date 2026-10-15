import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://learnnaija.ng";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/curriculum",
          "/assessments",
          "/challenges",
          "/tutors",
          "/tutor",
          "/pricing",
          "/progress",
          "/promotion"
        ],
        disallow: [
          "/api/",
          "/guardian/",
          "/teacher/",
          "/share/card/"
        ]
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/guardian/",
          "/teacher/"
        ]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  };
}
