import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://edunaija.org';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/backend/',
          '/admin/',
          '/_next/',
          '/stress-lab',
        ],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'Google-Extended', 'OAI-SearchBot'],
        allow: [
          '/',
          '/syllabus',
          '/admissions',
          '/curriculum',
          '/schools',
          '/indigenous-voices',
          '/career',
          '/news',
          '/case-study',
        ],
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
