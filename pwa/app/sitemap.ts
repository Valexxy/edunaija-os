import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://edunaija.org';
  const now = new Date();

  const routes = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/syllabus', priority: 0.95, changeFrequency: 'daily' as const },
    { path: '/quiz', priority: 0.95, changeFrequency: 'daily' as const },
    { path: '/virtual-teaching', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/admissions', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/schools', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/institutions', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/curriculum', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/qa', priority: 0.8, changeFrequency: 'daily' as const },
    { path: '/autopsy', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/student', priority: 0.8, changeFrequency: 'daily' as const },
    { path: '/parent', priority: 0.8, changeFrequency: 'daily' as const },
    { path: '/parent-autopilot', priority: 0.75, changeFrequency: 'weekly' as const },
    { path: '/exam-proctor', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/competition', priority: 0.85, changeFrequency: 'daily' as const },
    { path: '/showdown', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/leaderboard', priority: 0.75, changeFrequency: 'daily' as const },
    { path: '/certificates', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/zero-data', priority: 0.85, changeFrequency: 'monthly' as const },
    { path: '/indigenous-voices', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/languages', priority: 0.75, changeFrequency: 'monthly' as const },
    { path: '/oral-english', priority: 0.75, changeFrequency: 'monthly' as const },
    { path: '/reader', priority: 0.75, changeFrequency: 'weekly' as const },
    { path: '/theory', priority: 0.75, changeFrequency: 'weekly' as const },
    { path: '/career', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/news', priority: 0.8, changeFrequency: 'daily' as const },
    { path: '/states', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/case-study', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/diaspora', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/sponsors', priority: 0.7, changeFrequency: 'monthly' as const },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
