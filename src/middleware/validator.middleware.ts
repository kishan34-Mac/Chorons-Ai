import { z, Schema } from "zod";

export class ValidationError extends Error {
  constructor(public errors: z.ZodIssue[]) {
    super("Request validation failed");
    this.name = "ValidationError";
  }
}

export async function validateBody<T>(request: Request, schema: Schema<T>): Promise<T> {
  try {
    const body = await request.clone().json();
    return schema.parse(body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new ValidationError(err.errors);
    }
    throw new Error("Invalid request JSON body");
  }
}

export function validateQuery<T>(request: Request, schema: Schema<T>): T {
  try {
    const url = new URL(request.url);
    const queryObj: Record<string, string> = {};
    url.searchParams.forEach((val, key) => {
      queryObj[key] = val;
    });
    return schema.parse(queryObj);
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new ValidationError(err.errors);
    }
    throw new Error("Invalid request query parameters");
  }
}
