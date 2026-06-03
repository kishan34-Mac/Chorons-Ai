import { z } from "zod";

const configSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z.string().default("mongodb://localhost:27017/chronosai"),
  JWT_SECRET: z.string().default("dev-secret-key-for-chronos-ai-change-in-prod"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  OPENAI_API_KEY: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  PORT: z.coerce.number().default(8080),
  CORS_ORIGIN: z.string().default("*"),
});

// Parse and validate process.env
const parsed = configSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Configuration validation error:", parsed.error.format());
  throw new Error("Invalid application configuration");
}

export const config = parsed.data;
