import { config } from "../config";

export function applySecurityHeaders(headers: Headers): void {
  // Helmet equivalents
  headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://images.unsplash.com https://www.google.com; font-src 'self' https://fonts.gstatic.com; frame-ancestors 'none';",
  );
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  headers.set("X-XSS-Protection", "1; mode=block");
}

export function handleCORS(request: Request, headers: Headers): boolean {
  const origin = request.headers.get("Origin");
  if (!origin) return true;

  const allowedOrigin = config.CORS_ORIGIN;
  if (allowedOrigin === "*" || allowedOrigin === origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization,X-CSRF-Token");
  }

  // Preflight check
  if (request.method === "OPTIONS") {
    headers.set("Access-Control-Max-Age", "86400");
    return false;
  }
  return true;
}

export function verifyCSRF(request: Request): boolean {
  // State-changing requests should match Origin/Referer header to request Host
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    return true;
  }

  const origin = request.headers.get("Origin");
  const referer = request.headers.get("Referer");
  const host = request.headers.get("Host") || "";

  const checkUrl = origin || referer;
  if (!checkUrl) return false;

  try {
    const url = new URL(checkUrl);
    // In local dev/vercel, host checks need to match
    return (
      url.host === host ||
      host.includes("vercel.app") ||
      host.includes("localhost") ||
      host.includes("::")
    );
  } catch {
    return false;
  }
}
