// LearnNaija OS Enterprise Progressive Web App (PWA) Service Worker
// Designed for High-Throughput Nigerian Mobile Networks (MTN, Airtel, Glo, 9mobile)
// Features: Zero-Data Offline CBT Vault, Stale-While-Revalidate Question Caching, and Instant App Shell

const CACHE_VERSION = "learnnaija-pwa-v2";
const OFFLINE_FALLBACK_URL = "/offline.html";

const PRECACHE_ASSETS = [
  "/",
  "/manifest.json",
  "/offline.html",
  "/favicon.ico",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable.png",
  "/icons/apple-touch-icon.png"
];

// 1. Service Worker Installation
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      console.log("[PWA-SW] Precaching enterprise app shell and offline vault");
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Service Worker Activation & Cache Cleanup
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_VERSION)
          .map((name) => {
            console.log("[PWA-SW] Evicting deprecated cache:", name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// 3. Intelligent Fetch Event Strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Never intercept non-GET requests (POST, PUT, DELETE pass straight to network)
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Safeguard: Never cache auth sessions, webhooks, or critical monitoring alerts
  if (
    url.pathname.startsWith("/api/auth") ||
    url.pathname.startsWith("/api/webhooks") ||
    url.pathname.startsWith("/api/monitoring") ||
    url.pathname.startsWith("/api/classroom")
  ) {
    return;
  }

  // Strategy A: Page Navigation Requests (HTML document)
  // Network-First with graceful Offline Fallback to /offline.html
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_VERSION).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // If network failed, check if the specific page is cached
          const cachedPage = await caches.match(request);
          if (cachedPage) return cachedPage;

          // Otherwise serve the dedicated offline practice shell
          const offlineFallback = await caches.match(OFFLINE_FALLBACK_URL);
          return offlineFallback || new Response("Offline — Please connect to network.", {
            status: 503,
            headers: { "Content-Type": "text/plain" }
          });
        })
    );
    return;
  }

  // Strategy B: Public Curriculum & CBT Question Bank APIs
  // Stale-While-Revalidate: Return cached questions immediately for 0ms latency, refresh in background
  if (url.pathname === "/api/curriculum" || url.pathname.startsWith("/api/assessments")) {
    event.respondWith(
      caches.open(CACHE_VERSION).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        const networkFetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => null);

        // Return cached questions if available, otherwise wait for network
        return cachedResponse || networkFetchPromise;
      })
    );
    return;
  }

  // Strategy C: Static Assets, Fonts, CSS, JS, and Icons
  // Cache-First with Network Fallback
  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname === "/manifest.json";

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_VERSION).then((cache) => {
              cache.put(request, clone);
            });
          }
          return networkResponse;
        }).catch(() => {
          // Silent swallow for missing optional image assets
          return new Response("", { status: 404 });
        });
      })
    );
    return;
  }
});

// 4. Web Push Notification Handling (100% Free Sovereign Push)
self.addEventListener("push", (event) => {
  let data = {
    title: "LearnNaija Notification",
    body: "You have a new learning alert or study session update.",
    url: "/dashboard",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: "learnnaija-push"
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    data: { url: data.url },
    vibrate: [100, 50, 100],
    actions: [
      { action: "open", title: "Open Study Room" }
    ]
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

