import { z } from "zod";

export const searchSchema = z.object({
  url: z.string().url("A valid URL is required"),
});

export const compareSchema = z.object({
  domain: z.string().min(1, "Domain is required"),
  yearA: z.coerce.number().int().min(1990).max(new Date().getFullYear()),
  yearB: z.coerce.number().int().min(1990).max(new Date().getFullYear()),
});

export const favoriteSchema = z.object({
  domain: z.string().min(1, "Domain is required"),
});

export const reportSchema = z.object({
  domain: z.string().min(1, "Domain is required"),
  reportType: z.enum(["pdf", "html", "json"]).default("pdf"),
});

export const magicLinkSchema = z.object({
  email: z.string().email("A valid email address is required"),
});

export const verifyMagicSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});
