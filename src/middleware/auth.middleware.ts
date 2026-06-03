import { authService, JWTPayload } from "../services/auth.service";

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim().split("="));
  const cookie = cookies.find(([k]) => k === name);
  return cookie ? decodeURIComponent(cookie[1]) : null;
}

export async function authenticate(request: Request): Promise<JWTPayload | null> {
  // Try Authorization header first
  let token: string | null = null;
  const authHeader = request.headers.get("Authorization");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else {
    // Try token cookie
    token = getCookie(request, "session_token");
  }

  if (!token) return null;
  return authService.verifyToken(token);
}

export async function requireAuth(request: Request): Promise<JWTPayload> {
  const user = await authenticate(request);
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireRole(request: Request, allowedRoles: string[]): Promise<JWTPayload> {
  const user = await requireAuth(request);
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden");
  }
  return user;
}
