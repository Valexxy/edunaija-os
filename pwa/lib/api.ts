// Universal API Client for EduNaija OS (Offline & Online Resilient)

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // If running in browser, always use relative /api/backend proxy rewrite
    // This eliminates mixed-content HTTPS->HTTP blocks on public tunnels and mobile devices!
    return '/api/backend';
  }
  // Server-side Next.js
  return process.env.BACKEND_INTERNAL_URL || '/api/backend';
}

export async function apiFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  const base = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  
  // If endpoint is already absolute http, check if we need to proxy it
  let url = cleanEndpoint;
  if (cleanEndpoint.startsWith('/api/backend') || cleanEndpoint.startsWith('/api/backend')) {
    url = cleanEndpoint.replace(/^http:\/\/(127\.0\.0\.1|localhost):8000/, base);
  } else if (!cleanEndpoint.startsWith('http')) {
    url = `${base}${cleanEndpoint}`;
  }

  try {
    const res = await fetch(url, options);
    return res;
  } catch (err) {
    // If /api/backend fails or in local dev fallback
    if (typeof window !== 'undefined' && window.location.protocol === 'http:') {
      const fallbackUrl = `/api/backend${cleanEndpoint}`;
      return fetch(fallbackUrl, options);
    }
    throw err;
  }
}
