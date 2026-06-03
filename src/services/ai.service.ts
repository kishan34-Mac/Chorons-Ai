import { config } from "../config";
import { classifyEra, eraBlurb, detectShifts } from "../lib/wayback";

export interface AISummaryResult {
  era: string;
  aiSummary: string;
  designEvolution: string;
  redesignPeriods: string[];
  modernizationScore: number;
  nostalgiaScore: number;
}

export interface AIComparisonResult {
  comparisonResult: Record<string, unknown>;
  aiSummary: string;
}

export class AIService {
  private getApiKey(): string | undefined {
    return config.OPENAI_API_KEY;
  }

  async analyzeWebsite(domain: string, year: number): Promise<AISummaryResult> {
    const apiKey = this.getApiKey();
    const defaultEra = classifyEra(year);
    const defaultBlurb = eraBlurb(defaultEra);
    const defaultShifts = detectShifts(defaultEra);

    if (!apiKey) {
      console.warn("OpenAI API key missing. Generating synthetic analysis.");
      return {
        era: defaultEra,
        aiSummary: `Synthetic summary for ${domain} in ${year} during the ${defaultEra}. ${defaultBlurb}`,
        designEvolution: `The evolution of ${domain} reflects standard trends of the ${defaultEra}, moving towards visual alignment and early modern web design principles.`,
        redesignPeriods: [`Early ${defaultEra}`, `Mid ${defaultEra}`],
        modernizationScore: Math.min(100, Math.max(10, Math.floor((year - 1996) * 3.3))),
        nostalgiaScore: Math.min(100, Math.max(0, 100 - Math.floor((year - 1996) * 3.3))),
      };
    }

    try {
      const prompt = `Analyze the web design history of the website "${domain}" in the year ${year}.
Provide the response as a JSON object matching exactly this structure:
{
  "era": "short name of the design era",
  "aiSummary": "detailed summary of the design and UX of this website in ${year}",
  "designEvolution": "how this design fits into the evolution timeline of the web",
  "redesignPeriods": ["list of significant redesign phases or updates"],
  "modernizationScore": 85 (score from 0 to 100 on how modern it was for its time),
  "nostalgiaScore": 75 (score from 0 to 100 on nostalgia factor today)
}
Return raw JSON only, no markdown headers, formatting, or wrapping.`;

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
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI error: ${response.status}`);
      }

      const completion = await response.json();
      const content = completion.choices?.[0]?.message?.content?.trim();

      if (!content) {
        throw new Error("Empty OpenAI response");
      }

      const parsed = JSON.parse(content.replace(/^```json\s*/i, "").replace(/```$/, ""));
      return {
        era: parsed.era || defaultEra,
        aiSummary: parsed.aiSummary || `Summary for ${domain} in ${year}`,
        designEvolution: parsed.designEvolution || `Evolution details for ${domain}`,
        redesignPeriods: parsed.redesignPeriods || [],
        modernizationScore: Number(parsed.modernizationScore || 50),
        nostalgiaScore: Number(parsed.nostalgiaScore || 50),
      };
    } catch (err) {
      console.error("Failed to generate OpenAI analysis, falling back:", err);
      return {
        era: defaultEra,
        aiSummary: `Fallback summary for ${domain} in ${year}. ${defaultBlurb}`,
        designEvolution: `Fallback evolution details. Shifts noted: ${defaultShifts.join(", ")}`,
        redesignPeriods: [`Redesign ${year}`],
        modernizationScore: 50,
        nostalgiaScore: 50,
      };
    }
  }

  async compareWebsites(domain: string, yearA: number, yearB: number): Promise<AIComparisonResult> {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      console.warn("OpenAI API key missing. Generating synthetic comparison.");
      return {
        comparisonResult: {
          visualChanges: "Significant changes in layout and colors",
          technologyShifts: "Moved from static tables to dynamic CSS layouts",
          uxOptimizations: "Improved accessibility and responsive elements",
        },
        aiSummary: `Comparison of ${domain} between ${yearA} and ${yearB}. The site underwent significant visual modernization and restructuring.`,
      };
    }

    try {
      const prompt = `Compare the web design of "${domain}" in ${yearA} vs ${yearB}.
Provide the response as a JSON object matching exactly this structure:
{
  "comparisonResult": {
    "visualChanges": "description of layout/color changes",
    "technologyShifts": "description of technological changes",
    "uxOptimizations": "description of UX improvements"
  },
  "aiSummary": "1-2 paragraph overall summary comparing both eras for this domain"
}
Return raw JSON only, no markdown formatting.`;

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
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI error: ${response.status}`);
      }

      const completion = await response.json();
      const content = completion.choices?.[0]?.message?.content?.trim();

      if (!content) {
        throw new Error("Empty OpenAI response");
      }

      const parsed = JSON.parse(content.replace(/^```json\s*/i, "").replace(/```$/, ""));
      return {
        comparisonResult: parsed.comparisonResult || {},
        aiSummary: parsed.aiSummary || `Comparison summary of ${domain} from ${yearA} to ${yearB}`,
      };
    } catch (err) {
      console.error("Failed to generate comparison from OpenAI, using fallback:", err);
      return {
        comparisonResult: {
          visualChanges: "Layout modernized over time.",
          technologyShifts: "Frameworks and web standards updated.",
          uxOptimizations: "Navigation and layout responsiveness improved.",
        },
        aiSummary: `Comparison between ${yearA} and ${yearB} showing typical web transition patterns.`,
      };
    }
  }
}

export const aiService = new AIService();
