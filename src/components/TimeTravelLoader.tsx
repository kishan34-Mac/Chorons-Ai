import { Loader2 } from "lucide-react";

export function TimeTravelLoader({ domain }: { domain: string }) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20 text-center">
      <div className="inline-flex flex-col items-center gap-6">
        <div className="relative">
          <div className="size-24 rounded-full border border-border portal-blur bg-card/40 flex items-center justify-center">
            <Loader2 className="size-8 text-accent animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-full bg-accent/30 blur-2xl animate-pulse" />
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent mb-2">
            Locating temporal anchors
          </div>
          <div className="font-display font-bold text-2xl">{domain}</div>
          <div className="text-sm text-muted-foreground mt-2">
            Querying 928 billion archived snapshots…
          </div>
        </div>
      </div>
    </div>
  );
}
