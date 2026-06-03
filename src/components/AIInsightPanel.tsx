import { useState, useEffect } from "react";
import type { Snapshot } from "@/lib/wayback";
import { classifyEra, eraBlurb, detectShifts } from "@/lib/wayback";
import { Sparkles, TrendingUp, Layers, Split, Loader2 } from "lucide-react";

interface Props {
  snapshot: Snapshot;
  total: number;
  index: number;
  domain: string;
  onCompare: () => void;
}

export function AIInsightPanel({ snapshot, total, index, domain, onCompare }: Props) {
  const [insight, setInsight] = useState<{
    era: string;
    blurb: string;
    shifts: string[];
    isSynthetic: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchInsight = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/public/insight?domain=${encodeURIComponent(domain)}&year=${snapshot.year}`,
        );
        if (!res.ok) throw new Error("Failed to fetch insight");
        const data = await res.json();
        if (active) {
          setInsight(data);
        }
      } catch (err) {
        console.error("Failed to load dynamic AI insight:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchInsight();
    return () => {
      active = false;
    };
  }, [snapshot.year, domain]);

  const fallbackEra = classifyEra(snapshot.year);
  const fallbackBlurb = eraBlurb(fallbackEra);
  const fallbackShifts = detectShifts(fallbackEra);

  const era = insight?.era || fallbackEra;
  const blurb = insight?.blurb || fallbackBlurb;
  const shifts = insight?.shifts || fallbackShifts;
  const isSynthetic = insight ? insight.isSynthetic : true;

  const modernity = Math.min(100, Math.round(((snapshot.year - 1996) / (2025 - 1996)) * 100));
  const nostalgia = 100 - modernity;
  const ageDelta = total > 0 ? Math.round((index / Math.max(total - 1, 1)) * 100) : 0;

  return (
    <div className="space-y-5">
      <div className="p-6 rounded-3xl border border-border bg-card/40 portal-blur relative overflow-hidden">
        {/* Loading overlay indicator */}
        {loading && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 text-[10px] font-mono text-accent animate-pulse">
            <Loader2 className="size-3 animate-spin" /> Decoding...
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-accent/15 border border-accent/20 flex items-center justify-center">
              <Sparkles className="size-3.5 text-accent" />
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
              Era Classification
            </div>
          </div>

          {!loading && (
            <span
              className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border transition-all ${
                isSynthetic
                  ? "bg-muted/15 text-muted-foreground border-muted/20"
                  : "bg-accent/15 text-accent border-accent/20 font-bold glow-accent"
              }`}
            >
              {isSynthetic ? "System Standard" : "AI Decoded"}
            </span>
          )}
        </div>

        <div className="font-display font-extrabold text-2xl tracking-tight mb-2">{era}</div>
        <p className="text-xs leading-relaxed text-muted-foreground mb-5">{blurb}</p>

        <div className="space-y-3">
          <Metric label="Design Modernity" value={modernity} suffix="%" />
          <Metric label="Nostalgia Factor" value={nostalgia} suffix="%" tint="violet" />
          <Metric label="Timeline Position" value={ageDelta} suffix="%" tint="accent" />
        </div>
      </div>

      <div className="p-6 rounded-3xl border border-border bg-card/40 portal-blur">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="size-3.5 text-accent" />
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
            Detected Shifts
          </div>
        </div>
        <ul className="space-y-2.5">
          {shifts.map((s) => (
            <li key={s} className="flex items-start gap-2.5 text-xs text-foreground/80">
              <span className="mt-1.5 size-1 rounded-full bg-accent shrink-0" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onCompare}
        className="w-full p-5 rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/15 via-card/40 to-transparent text-left group hover:border-accent/50 transition-all"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Split className="size-3.5 text-accent" />
            <span className="text-sm font-semibold">Compare Eras</span>
          </div>
          <Layers className="size-4 text-muted-foreground group-hover:text-accent transition-colors" />
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Split-view this snapshot against the latest version to see what changed.
        </p>
      </button>
    </div>
  );
}

function Metric({
  label,
  value,
  suffix = "",
  tint = "accent",
}: {
  label: string;
  value: number;
  suffix?: string;
  tint?: "accent" | "violet";
}) {
  const color = tint === "violet" ? "oklch(0.65 0.2 280)" : "var(--color-accent)";
  return (
    <div className="p-3 rounded-xl bg-background/40 border border-border">
      <div className="flex justify-between items-center mb-2">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm font-bold font-mono">
          {value}
          {suffix}
        </div>
      </div>
      <div className="h-1 w-full bg-foreground/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: color, boxShadow: `0 0 12px ${color}` }}
        />
      </div>
    </div>
  );
}
