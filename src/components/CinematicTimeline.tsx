import type { Snapshot } from "@/lib/wayback";
import { useRef, useEffect } from "react";

interface Props {
  snapshots: Snapshot[];
  selectedIndex: number;
  onSelect: (i: number) => void;
  playing: boolean;
  onTogglePlay: () => void;
}

export function CinematicTimeline({ snapshots, selectedIndex, onSelect }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current?.querySelector<HTMLElement>(`[data-idx="${selectedIndex}"]`);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [selectedIndex]);

  if (!snapshots.length) return null;

  const first = snapshots[0].year;
  const last = snapshots[snapshots.length - 1].year;

  return (
    <div className="relative p-6 md:p-8 rounded-3xl border border-border bg-card/40 portal-blur">
      <div className="flex justify-between items-end mb-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
            Temporal Sequence
          </div>
          <div className="text-2xl font-display font-bold tracking-tight">
            {first} <span className="text-muted-foreground/40">—</span> {last}
          </div>
        </div>
        <div className="text-xs font-mono text-muted-foreground">
          {snapshots.length} snapshots
        </div>
      </div>

      {/* glowing rail */}
      <div className="relative">
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div
          ref={scrollerRef}
          className="relative overflow-x-auto pb-4 -mx-2 px-2 scrollbar-thin scroll-smooth"
          style={{ scrollbarWidth: "thin" }}
        >
          <div className="flex items-center gap-6 min-w-full justify-between py-4">
            {snapshots.map((s, i) => {
              const active = i === selectedIndex;
              return (
                <button
                  key={s.timestamp}
                  data-idx={i}
                  onClick={() => onSelect(i)}
                  className="group flex flex-col items-center gap-3 shrink-0 px-2"
                >
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 group-hover:text-accent transition-colors">
                    {s.date.toLocaleDateString("en-US", { month: "short" })}
                  </div>
                  <div className="relative">
                    {active && (
                      <div className="absolute inset-0 rounded-full bg-accent blur-md scale-150 opacity-70" />
                    )}
                    <div
                      className={`relative rounded-full transition-all duration-300 ${
                        active
                          ? "size-5 bg-accent ring-4 ring-accent/20 shadow-[0_0_24px_var(--color-accent)]"
                          : "size-2.5 bg-foreground/25 group-hover:bg-foreground group-hover:scale-150"
                      }`}
                    />
                  </div>
                  <div
                    className={`font-display font-bold tracking-tight transition-all ${
                      active ? "text-accent text-lg" : "text-muted-foreground text-sm group-hover:text-foreground"
                    }`}
                  >
                    {s.year}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-2 text-[10px] font-mono text-muted-foreground/40 uppercase tracking-wider">
        <span>START_OF_WEB</span>
        <span className="text-accent/60 font-bold">YOU_ARE_HERE</span>
        <span>PRESENT_DAY</span>
      </div>
    </div>
  );
}
