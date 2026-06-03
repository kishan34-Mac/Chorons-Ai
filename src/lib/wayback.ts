// Wayback Machine helpers — uses the public Internet Archive CDX API (no key).
export interface Snapshot {
  timestamp: string; // YYYYMMDDhhmmss
  original: string;
  status: string;
  year: number;
  date: Date;
  archiveUrl: string;
  screenshotUrl: string;
}

export function normalizeUrl(input: string): string {
  let u = input.trim().toLowerCase();
  u = u.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "");
  return u;
}

export function parseTimestamp(ts: string): Date {
  const y = +ts.slice(0, 4);
  const mo = +ts.slice(4, 6) - 1;
  const d = +ts.slice(6, 8) || 1;
  const h = +ts.slice(8, 10) || 0;
  const mi = +ts.slice(10, 12) || 0;
  return new Date(Date.UTC(y, mo, d, h, mi));
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

/** Pick one snapshot per year, spread across history. */
export async function fetchYearlySnapshots(url: string): Promise<Snapshot[]> {
  const target = normalizeUrl(url);
  const api = `/api/public/wayback?url=${encodeURIComponent(target)}`;
  const res = await fetch(api);
  if (!res.ok) throw new Error(`Wayback request failed: ${res.status}`);
  const rows: string[][] = await res.json();
  if (!rows.length) return [];
  const [, ...data] = rows; // first row is header

  const seenYears = new Set<number>();
  const out: Snapshot[] = [];
  for (const [timestamp, original, status] of data) {
    const date = parseTimestamp(timestamp);
    const year = date.getUTCFullYear();
    if (seenYears.has(year)) continue;
    seenYears.add(year);
    out.push({
      timestamp,
      original,
      status,
      year,
      date,
      archiveUrl: `https://web.archive.org/web/${timestamp}/${original}`,
      // if_ removes Wayback's toolbar, im_ would force image form
      screenshotUrl: `https://web.archive.org/web/${timestamp}if_/${original}`,
    });
  }
  return out.sort((a, b) => a.year - b.year);
}

export type DesignEra =
  | "Web 1.0"
  | "Skeuomorphic Era"
  | "Flat Design Era"
  | "Modern SaaS Era"
  | "AI Native Era";

export function classifyEra(year: number): DesignEra {
  if (year < 2003) return "Web 1.0";
  if (year < 2013) return "Skeuomorphic Era";
  if (year < 2018) return "Flat Design Era";
  if (year < 2023) return "Modern SaaS Era";
  return "AI Native Era";
}

export function eraBlurb(era: DesignEra): string {
  switch (era) {
    case "Web 1.0":
      return "Table layouts, animated GIFs, hit counters, and beige textures. The frontier of consumer hypertext.";
    case "Skeuomorphic Era":
      return "Glossy buttons, leather textures, drop shadows. Interfaces mimicked physical objects to teach users new metaphors.";
    case "Flat Design Era":
      return "Bold color blocks, geometric shapes, and sans-serif type. iOS 7 and Material Design rewrote the rules.";
    case "Modern SaaS Era":
      return "Generous whitespace, gradient hero sections, soft shadows, and rounded corners. Linear, Stripe, Vercel set the standard.";
    case "AI Native Era":
      return "Glassmorphism, ambient gradients, conversational surfaces. UI dissolves into prompts and intent.";
  }
}

export function detectShifts(era: string): string[] {
  switch (era) {
    case "Web 1.0":
      return ["Table-based HTML layouts", "Serif system fonts dominate", "Hit counters & guestbooks", "Sub-800px viewports"];
    case "Skeuomorphic Era":
      return ["Gradient & bevel-heavy chrome", "Fixed 960px grids", "JavaScript libraries (jQuery) emerge", "Icon textures mimic real objects"];
    case "Flat Design Era":
      return ["Color blocks replace textures", "Responsive breakpoints standardized", "Sans-serif typography systems", "Iconography becomes geometric"];
    case "Modern SaaS Era":
      return ["Generous whitespace & rounded corners", "Subtle gradients return", "Component-driven design systems", "Dark mode becomes default"];
    case "AI Native Era":
      return ["Glassmorphism & ambient depth", "Conversational prompt surfaces", "Motion as primary affordance", "Adaptive typography systems"];
    default:
      return [];
  }
}

