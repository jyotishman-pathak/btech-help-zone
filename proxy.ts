import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { getIP } from "./lib/ip";
import { checkLimit } from "./lib/ratelimit";


const { auth } = NextAuth(authConfig);

// ── 429 response ──────────────────────────────────────────────────────────────

function tooManyRequests(retryAfter: number, message?: string): NextResponse {
  return new NextResponse(
    JSON.stringify({
      error: "rate_limit_exceeded",
      message: message ?? "Too many requests. Please wait and try again.",
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
        "X-RateLimit-Reset": String(Date.now() + retryAfter * 1000),
      },
    }
  );
}

// ── Route classification ───────────────────────────────────────────────────────

function classifyRoute(req: NextRequest): "login" | "register" | "auth" | "api" | "page" | null {
  const path = req.nextUrl.pathname;
  const method = req.method;

  if (method !== "GET" && method !== "POST") return null;

  // Credentials login - most attack prone
  if (
    method === "POST" &&
    (path === "/api/auth/callback/credentials" ||
      path === "/api/auth/signin")
  ) return "login";

  // Registration
  if (method === "POST" && path === "/api/register") return "register";

  // Any other auth route (OAuth, session checks, etc.)
  if (path.startsWith("/api/auth")) return "auth";

  // All other API routes
  if (path.startsWith("/api")) return "api";

  return "page";
}

// ── Messages per limiter type ─────────────────────────────────────────────────

const MESSAGES = {
  login: "Too many login attempts. Your IP has been temporarily blocked.",
  register: "Too many accounts created from this IP. Try again in 1 hour.",
  auth: "Too many auth requests. Slow down.",
  api: "Too many API requests.",
};

// ── Main middleware ───────────────────────────────────────────────────────────

const authMiddleware = auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;
  const role = (session?.user as any)?.role;

  const isAuthPage = ["/login", "/register"].some((p) => nextUrl.pathname.startsWith(p));
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isDashboard = ["/student", "/my-batches", "/cee"].some((p) => nextUrl.pathname.startsWith(p));

  // Redirect logged-in users away from auth pages
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/student", req.url));
  }

  // Admin routes — must be logged in + admin role
  if (isAdminRoute) {
    if (!isLoggedIn)
      return NextResponse.redirect(new URL(`/login?callbackUrl=${nextUrl.pathname}`, req.url));
    if (!["ADMIN", "SUPER_ADMIN"].includes(role ?? ""))
      return NextResponse.redirect(new URL("/student", req.url));
  }

  // Protected student routes
  if (isDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${nextUrl.pathname}`, req.url));
  }

  return NextResponse.next();
});

export default async function middleware(req: NextRequest) {
  const routeType = classifyRoute(req);
  const ip = getIP(req);

  // Apply rate limiting to sensitive route types
  if (routeType === "login" || routeType === "register" || routeType === "auth" || routeType === "api") {
    try {
      const result = await checkLimit(routeType, ip);

      if (!result.allowed) {
        console.warn(
          `[RATE LIMIT] Blocked ${routeType} from ${ip} | retryAfter=${result.retryAfter}s`
        );
        return tooManyRequests(result.retryAfter, MESSAGES[routeType]);
      }
    } catch (err) {
      // If rate limiter fails (Redis down etc.), log but don't block
      console.error("[RATE LIMIT] Limiter error — allowing request:", err);
    }
  }

  // Run auth middleware for all page routes
  return (authMiddleware as any)(req);
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public assets (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};