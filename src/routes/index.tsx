import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AmbientFX } from "@/components/AmbientFX";
import { GlowingNavbar } from "@/components/GlowingNavbar";
import { HeroPortal } from "@/components/HeroPortal";
import { CinematicTimeline } from "@/components/CinematicTimeline";
import { SnapshotViewer } from "@/components/SnapshotViewer";
import { AIInsightPanel } from "@/components/AIInsightPanel";
import { PlaybackControls } from "@/components/PlaybackControls";
import { CompareSlider } from "@/components/CompareSlider";
import { TimeTravelLoader } from "@/components/TimeTravelLoader";
import { fetchYearlySnapshots, normalizeUrl, type Snapshot } from "@/lib/wayback";
import { AlertCircle } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [domain, setDomain] = useState<string>("");
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [comparing, setComparing] = useState(false);

  const mutation = useMutation({
    mutationFn: async (url: string) => {
      const d = normalizeUrl(url);
      const snaps = await fetchYearlySnapshots(d);
      return { d, snaps };
    },
    onSuccess: ({ d, snaps }) => {
      setDomain(d);
      setSnapshots(snaps);
      setSelected(Math.max(0, snaps.length - 1));
      setPlaying(false);
      setTimeout(() => {
        document.getElementById("explorer")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
  });

  // Auto-play through years
  useEffect(() => {
    if (!playing || !snapshots.length) return;
    const t = setInterval(() => {
      setSelected((i) => {
        if (i >= snapshots.length - 1) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, 2200);
    return () => clearInterval(t);
  }, [playing, snapshots.length]);

  const current = snapshots[selected];
  const latest = snapshots[snapshots.length - 1];

  const hasResults = snapshots.length > 0;

  return (
    <div className="min-h-screen relative">
      <AmbientFX />
      <GlowingNavbar />

      <HeroPortal onSubmit={(u) => mutation.mutate(u)} loading={mutation.isPending} />

      {mutation.isPending && <TimeTravelLoader domain={normalizeUrl(mutation.variables ?? "")} />}

      {mutation.isError && (
        <div className="max-w-2xl mx-auto px-6 mb-10">
          <div className="p-5 rounded-2xl border border-destructive/40 bg-destructive/10 flex items-start gap-3">
            <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold mb-1">Temporal anchor lost</div>
              <div className="text-muted-foreground">
                Couldn't fetch snapshots for that URL. Try a different one (e.g. apple.com, google.com).
              </div>
            </div>
          </div>
        </div>
      )}

      {!mutation.isPending && hasResults && current && (
        <>
          <section id="explorer" className="px-4 md:px-8 pb-32 max-w-7xl mx-auto">
            <div
              className="mb-6 flex items-baseline justify-between"
              style={{ animation: "slide-up-reveal 0.6s var(--ease-portal) both" }}
            >
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent mb-1">
                  Active Subject
                </div>
                <div className="text-3xl md:text-5xl font-display font-extrabold tracking-tighter">
                  {domain}
                </div>
              </div>
              <div className="hidden md:block text-right">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                  Span
                </div>
                <div className="text-xl font-display font-bold">
                  {snapshots[0].year}–{latest.year}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-9 space-y-6">
                <SnapshotViewer snapshot={current} domain={domain} />
                <div id="timeline">
                  <CinematicTimeline
                    snapshots={snapshots}
                    selectedIndex={selected}
                    onSelect={setSelected}
                    playing={playing}
                    onTogglePlay={() => setPlaying((p) => !p)}
                  />
                </div>
              </div>

              <aside id="analysis" className="col-span-12 lg:col-span-3">
                <AIInsightPanel
                  snapshot={current}
                  total={snapshots.length}
                  index={selected}
                  domain={domain}
                  onCompare={() => setComparing(true)}
                />
              </aside>
            </div>
          </section>

          <PlaybackControls
            playing={playing}
            onTogglePlay={() => setPlaying((p) => !p)}
            onPrev={() => setSelected((i) => Math.max(0, i - 1))}
            onNext={() => setSelected((i) => Math.min(snapshots.length - 1, i + 1))}
            label={String(current.year)}
          />

          {comparing && latest && (
            <CompareSlider
              left={current}
              right={latest}
              domain={domain}
              onClose={() => setComparing(false)}
            />
          )}
        </>
      )}

      {!hasResults && !mutation.isPending && !mutation.isError && (
        <>
          <RecentPortals onSelect={(u) => mutation.mutate(u)} />
          <ErasGallery />
        </>
      )}
    </div>
  );
}

interface RecentPortalItem {
  domain: string;
  timestamp: string;
  snapshotsCount: number;
}

function RecentPortals({ onSelect }: { onSelect: (domain: string) => void }) {
  const [recent, setRecent] = useState<RecentPortalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/recent")
      .then((res) => res.json())
      .then((data) => {
        setRecent(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch recent portals:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 mb-16 text-center">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (recent.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-6 mb-20 animate-fade-in">
      <div className="mb-8 text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent mb-2">
          Holographic Archive
        </div>
        <h2 className="font-display font-extrabold text-2xl md:text-4xl tracking-tighter">
          Recently Traveled Portals
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {recent.map((item, i) => (
          <button
            key={`${item.domain}-${i}`}
            onClick={() => onSelect(item.domain)}
            className="group relative p-5 rounded-2xl border border-border bg-card/40 portal-blur text-left hover:border-accent/40 hover:shadow-[0_0_20px_rgba(20,110,250,0.15)] transition-all duration-300 active:scale-[0.98]"
            style={{ animation: `slide-up-reveal 0.6s var(--ease-portal) ${i * 0.05}s both` }}
          >
            <div className="font-display font-bold text-sm tracking-tight text-foreground group-hover:text-accent transition-colors truncate">
              {item.domain}
            </div>
            <div className="text-[10px] font-mono text-muted-foreground mt-2 flex items-center justify-between">
              <span>{item.snapshotsCount} snapshots</span>
              <span className="opacity-0 group-hover:opacity-100 text-accent transition-opacity">Launch →</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function ErasGallery() {
  const eras = useMemo(
    () => [
      { name: "Web 1.0", years: "1996–2002", color: "oklch(0.75 0.15 60)" },
      { name: "Skeuomorphic", years: "2003–2012", color: "oklch(0.65 0.18 30)" },
      { name: "Flat Design", years: "2013–2017", color: "oklch(0.7 0.2 340)" },
      { name: "Modern SaaS", years: "2018–2022", color: "oklch(0.78 0.18 200)" },
      { name: "AI Native", years: "2023–Now", color: "oklch(0.65 0.22 280)" },
    ],
    [],
  );

  return (
    <section className="max-w-6xl mx-auto px-6 pb-32">
      <div className="mb-10 text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent mb-2">
          Five Eras of the Web
        </div>
        <h2 className="font-display font-extrabold text-3xl md:text-5xl tracking-tighter">
          Every URL has a story.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {eras.map((era, i) => (
          <div
            key={era.name}
            className="group relative p-6 rounded-2xl border border-border bg-card/40 portal-blur overflow-hidden hover:border-accent/40 transition-all"
            style={{ animation: `slide-up-reveal 0.6s var(--ease-portal) ${i * 0.08}s both` }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: `radial-gradient(circle at 50% 0%, ${era.color}30, transparent 70%)` }}
            />
            <div className="relative">
              <div
                className="size-8 rounded-lg mb-4 border border-border"
                style={{ background: era.color, boxShadow: `0 0 24px ${era.color}` }}
              />
              <div className="font-display font-bold text-lg tracking-tight">{era.name}</div>
              <div className="text-[11px] font-mono text-muted-foreground mt-1">{era.years}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
