import { useState, useEffect } from "react";
import type { Snapshot } from "@/lib/wayback";
import { formatDate, classifyEra } from "@/lib/wayback";
import { ExternalLink, Maximize2 } from "lucide-react";

interface Props {
  snapshot: Snapshot;
  domain: string;
}

export function SnapshotViewer({ snapshot, domain }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [glitch, setGlitch] = useState(true);

  useEffect(() => {
    setLoaded(false);
    setGlitch(true);
    const t = setTimeout(() => setGlitch(false), 700);
    return () => clearTimeout(t);
  }, [snapshot.timestamp]);

  const era = classifyEra(snapshot.year);

  return (
    <div className="relative rounded-3xl overflow-hidden border border-border bg-card/40 aspect-[16/10] group">
      {/* Loading scan line */}
      {!loaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 portal-blur">
          <div className="text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent mb-3">
              Reconstructing temporal artifact…
            </div>
            <div className="w-48 h-px bg-border overflow-hidden mx-auto">
              <div
                className="h-full w-full bg-accent"
                style={{ animation: "scan 1.5s ease-in-out infinite" }}
              />
            </div>
          </div>
        </div>
      )}

      <iframe
        key={snapshot.timestamp}
        src={snapshot.archiveUrl}
        title={`${domain} on ${formatDate(snapshot.date)}`}
        onLoad={() => setLoaded(true)}
        className={`w-full h-full bg-white transition-all duration-700 ${
          glitch ? "blur-xl scale-110 opacity-0" : "blur-0 scale-100 opacity-100"
        }`}
        sandbox="allow-scripts allow-same-origin"
        loading="lazy"
      />

      {/* Top bar overlay */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start pointer-events-none">
        <div className="px-3 py-1.5 rounded-full border border-border portal-blur bg-background/60 flex items-center gap-2">
          <div className="size-1.5 rounded-full bg-accent animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-wider">
            {formatDate(snapshot.date)}
          </span>
        </div>
        <a
          href={snapshot.archiveUrl}
          target="_blank"
          rel="noreferrer"
          className="pointer-events-auto p-2 rounded-lg border border-border portal-blur bg-background/60 hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label="Open in Wayback Machine"
        >
          <ExternalLink className="size-3.5" />
        </a>
      </div>

      {/* Bottom metadata */}
      <div className="absolute bottom-6 left-6 z-20 p-5 rounded-2xl border border-border portal-blur bg-background/60 max-w-sm">
        <div className="font-mono text-[10px] text-accent mb-1 uppercase tracking-wider">
          {domain}
        </div>
        <div className="text-2xl font-display font-bold leading-tight">
          {snapshot.year}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/15 text-accent font-bold border border-accent/20">
            {era}
          </span>
        </div>
      </div>

      {/* Bottom-right hint */}
      <div className="absolute bottom-4 right-4 z-20 px-2.5 py-1 rounded-md bg-background/60 portal-blur border border-border text-[10px] font-mono text-muted-foreground flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Maximize2 className="size-3" /> Live snapshot
      </div>
    </div>
  );
}
