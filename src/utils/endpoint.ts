import { handleError } from "../middleware/error.middleware";
import { applySecurityHeaders, handleCORS, verifyCSRF } from "../middleware/security.middleware";
import { isRateLimited, getClientIp } from "../middleware/limiter.middleware";

export function wrapEndpoint(
  handler: (request: Request, params?: Record<string, string>) => Promise<Response>,
  options: {
    rateLimit?: { windowMs: number; max: number };
    skipCSRF?: boolean;
  } = {},
) {
  return async ({
    request,
    params,
  }: {
    request: Request;
    params?: Record<string, string>;
  }): Promise<Response> => {
    const headers = new Headers();

    // 1. Handle CORS and Options preflight check
    const isCorsValid = handleCORS(request, headers);
    if (!isCorsValid) {
      return new Response(null, { status: 204, headers });
    }

    // 2. Set general security headers
    applySecurityHeaders(headers);

    try {
      // 3. Verify CSRF
      if (!options.skipCSRF && !verifyCSRF(request)) {
        return new Response(JSON.stringify({ error: "CSRF verification failed" }), {
          status: 403,
          headers: { ...Object.fromEntries(headers), "Content-Type": "application/json" },
        });
      }

      // 4. Rate Limiting
      const ip = getClientIp(request);
      const limitConfig = options.rateLimit || { windowMs: 60 * 1000, max: 60 }; // Default 60 req/min
      const limited = await isRateLimited(ip, limitConfig);
      if (limited) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again later." }),
          {
            status: 429,
            headers: { ...Object.fromEntries(headers), "Content-Type": "application/json" },
          },
        );
      }

      // 5. Execute core handler
      const response = await handler(request, params);

      // Merge headers
      response.headers.forEach((value, key) => {
        headers.set(key, value);
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (err) {
      const errorResponse = handleError(err);
      errorResponse.headers.forEach((value, key) => {
        headers.set(key, value);
      });
      return new Response(errorResponse.body, {
        status: errorResponse.status,
        headers,
      });
    }
  };
}
