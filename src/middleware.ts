import { NextResponse, type NextRequest } from "next/server";

/**
 * Fast-path local JWT extractor from Supabase auth cookies (0.01ms latency).
 * Decodes the access token payload directly from memory without making slow remote network requests.
 */
function extractUserFromCookies(request: NextRequest): { id: string; role?: string } | null {
  try {
    const all = request.cookies.getAll();
    const authCookies = all.filter(
      (c) => c.name.startsWith("sb-") && c.name.includes("-auth-token")
    );
    if (authCookies.length === 0) return null;

    // Handle single or chunked cookies (.0, .1)
    authCookies.sort((a, b) => a.name.localeCompare(b.name));
    const combinedVal = authCookies.map((c) => c.value).join("");
    if (!combinedVal) return null;

    let jsonStr = combinedVal;
    if (combinedVal.startsWith("base64-")) {
      jsonStr = Buffer.from(combinedVal.slice(7), "base64").toString("utf-8");
    }

    let data: unknown;
    try {
      data = JSON.parse(jsonStr);
    } catch {
      return null;
    }

    let token: string | undefined;
    if (Array.isArray(data) && typeof data[0] === "string") {
      token = data[0];
    } else if (data && typeof data === "object" && "access_token" in data && typeof (data as { access_token: unknown }).access_token === "string") {
      token = (data as { access_token: string }).access_token;
    } else if (typeof data === "string") {
      token = data;
    }

    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length < 2) return null;

    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
    const nowSec = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < nowSec) {
      return null; // Expired token
    }

    return {
      id: payload.sub,
      role: payload.user_metadata?.role || payload.role || "student"
    };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const pathname = request.nextUrl.pathname;

  // 1. Immediately pass through API routes, static assets, and Next internals (0ms latency)
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return response;
  }

  // 2. Classify routes
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/progress") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/guardian") ||
    pathname.startsWith("/teacher") ||
    pathname.startsWith("/promotion") ||
    pathname.startsWith("/study-group");

  // If neither protected nor auth route, allow immediate pass-through
  if (!isProtectedRoute && !isAuthRoute) {
    return response;
  }

  // 3. Fast Demo Persona Check:
  const demoUserId = request.cookies.get("learnnaija_demo_user_id")?.value;
  if (demoUserId) {
    if (isAuthRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return response;
  }

  // 4. Fast Local Cookie Check (0.01ms):
  const cookieUser = extractUserFromCookies(request);

  if (cookieUser) {
    // Authenticated user trying to access login/signup: redirect to dashboard
    if (isAuthRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // Authenticated user on protected route: allow immediate pass-through
    return response;
  }

  // 5. If unauthenticated visitor attempts to access protected routes, redirect to login
  if (isProtectedRoute) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
};
