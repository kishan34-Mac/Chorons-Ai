import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Snapshot } from "@/lib/wayback";
import { formatDate } from "@/lib/wayback";

interface Props {
  left: Snapshot;
  right: Snapshot;
  domain: string;
  onClose: () => void;
}

export function CompareSlider({ left, right, domain, onClose }: Props) {
  const [pos, setPos] = useState(50);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-background/90 portal-blur p-4 md:p-10 flex flex-col animate-in fade-in">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent mb-1">
            Comparing — {domain}
          </div>
          <div className="text-lg font-display font-bold">
            {left.year} <span className="text-muted-foreground/40 mx-2">⇆</span> {right.year}
          </div>
        </div>
        <button
          onClick={onClose}
          className="size-10 rounded-full border border-border hover:bg-foreground/10 flex items-center justify-center"
          aria-label="Close compare"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="relative flex-1 rounded-3xl overflow-hidden border border-border bg-card/40 select-none">
        {/* Right (newer) full */}
        <iframe
          src={right.archiveUrl}
          title={`${domain} ${right.year}`}
          className="absolute inset-0 w-full h-full bg-white"
          sandbox="allow-scripts allow-same-origin"
        />
        {/* Left (older) clipped */}
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <iframe
            src={left.archiveUrl}
            title={`${domain} ${left.year}`}
            className="absolute inset-0 w-full h-full bg-white"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-background/70 portal-blur border border-border text-xs font-mono">
          {formatDate(left.date)}
        </div>
        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-background/70 portal-blur border border-border text-xs font-mono">
          {formatDate(right.date)}
        </div>

        {/* Divider */}
        <div
          className="absolute inset-y-0 w-px bg-accent shadow-[0_0_20px_var(--color-accent)] pointer-events-none"
          style={{ left: `${pos}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-xs shadow-[0_0_28px_var(--color-accent)]">
            ⇆
          </div>
        </div>

        {/* Range input full overlay */}
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(+e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
          aria-label="Compare slider"
        />
      </div>
    </div>
  );
}
