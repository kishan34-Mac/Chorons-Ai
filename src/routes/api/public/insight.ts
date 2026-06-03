import { createFileRoute } from "@tanstack/react-router";
import { classifyEra, eraBlurb, detectShifts, type DesignEra } from "@/lib/wayback";

interface InsightResponse {
  era: string;
  blurb: string;
  shifts: string[];
  isSynthetic: boolean;
}

export const Route = createFileRoute("/api/public/insight")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const domain = url.searchParams.get("domain") || "unknown";
        const yearStr = url.searchParams.get("year");
        const year = yearStr ? parseInt(yearStr, 10) : new Date().getFullYear();

        const defaultEra = classifyEra(year);
        const defaultBlurb = eraBlurb(defaultEra);
        const defaultShifts = detectShifts(defaultEra);

        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
          console.warn("OpenAI API key missing. Returning local fallback insights.");
          return new Response(
            JSON.stringify({
              era: defaultEra,
              blurb: defaultBlurb,
              shifts: defaultShifts,
              isSynthetic: true,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

          const prompt = `Analyze the web design history of the website "${domain}" in the year ${year}.
You must respond with a raw JSON object containing exactly these fields:
- "era": a short era name (e.g. "Web 1.0", "Skeuomorphic Era", "Flat Design Era", "Modern SaaS Era", "AI Native Era" or similar)
- "blurb": a 1-2 sentence description of what the design of this specific website looked like and how it felt in ${year}.
- "shifts": an array of exactly 4 concise bullet points describing specific visual layouts, typography, UX patterns, or technologies used on "${domain}" in ${year}.

Do not include markdown code block formatting (like \`\`\`json). Return raw JSON only.`;

          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [{ role: "user", content: prompt }],
              temperature: 0.5,
              max_tokens: 300,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorText = await response.text();
            console.warn(
              `OpenAI API returned error ${response.status}: ${errorText}. Using local fallback insights.`,
            );
            throw new Error(`OpenAI error: ${response.status}`);
          }

          const completion = await response.json();
          const content = completion.choices?.[0]?.message?.content?.trim();

          if (!content) {
            throw new Error("Empty response from OpenAI");
          }

          // Clean up potential markdown formatting
          const cleanJson = content
            .replace(/^```json\s*/i, "")
            .replace(/```$/, "")
            .trim();
          const parsed = JSON.parse(cleanJson);

          if (
            parsed.era &&
            parsed.blurb &&
            Array.isArray(parsed.shifts) &&
            parsed.shifts.length === 4
          ) {
            return new Response(
              JSON.stringify({
                era: String(parsed.era),
                blurb: String(parsed.blurb),
                shifts: parsed.shifts.map(String),
                isSynthetic: false,
              }),
              {
                status: 200,
                headers: {
                  "Content-Type": "application/json",
                  "Cache-Control": "public, max-age=1800", // cache insights for 30 minutes
                },
              },
            );
          } else {
            console.warn("Parsed OpenAI response lacked expected structure:", parsed);
            throw new Error("Invalid response structure");
          }
        } catch (e) {
          console.error(
            `Insight generation failed: ${e instanceof Error ? e.message : String(e)}. Using local fallback.`,
          );
          return new Response(
            JSON.stringify({
              era: defaultEra,
              blurb: defaultBlurb,
              shifts: defaultShifts,
              isSynthetic: true,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
