import { ValidationError } from "./validator.middleware";
import { logger } from "../utils/logger";

export function handleError(err: unknown): Response {
  logger.error("API error encountered:", {
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });

  if (err instanceof ValidationError) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Validation failed",
        details: err.errors,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const message = err instanceof Error ? err.message : "Internal Server Error";

  if (message === "Unauthorized") {
    return new Response(JSON.stringify({ success: false, error: "Unauthorized access" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (message === "Forbidden") {
    return new Response(JSON.stringify({ success: false, error: "Access forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (message.includes("Rate limit exceeded")) {
    return new Response(
      JSON.stringify({ success: false, error: "Too many requests. Please try again later." }),
      { status: 429, headers: { "Content-Type": "application/json" } },
    );
  }

  return new Response(
    JSON.stringify({
      success: false,
      error: "An unexpected error occurred on the server.",
      message: config.NODE_ENV === "development" ? message : "Internal Server Error",
    }),
    { status: 500, headers: { "Content-Type": "application/json" } },
  );
}

// Quick import configuration reference helper inside this module since it uses config.NODE_ENV
import { config } from "../config";
