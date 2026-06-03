import { useState, type FormEvent } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

interface Props {
  onSubmit: (url: string) => void;
  loading: boolean;
}

const EXAMPLES = [
  { label: "apple.com", year: "1997" },
  { label: "google.com", year: "1998" },
  { label: "facebook.com", year: "2004" },
  { label: "airbnb.com", year: "2008" },
  { label: "amazon.com", year: "1999" },
];

export function HeroPortal({ onSubmit, loading }: Props) {
  const [value, setValue] = useState("");

  const handle = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSubmit(value);
  };

  return (
    <section className="relative pt-36 pb-12 px-6 max-w-6xl mx-auto text-center">
      <div
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/40 portal-blur mb-8"
        style={{ animation: "slide-up-reveal 0.6s var(--ease-portal) both" }}
      >
        <span className="relative flex size-2">
          <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-75" />
          <span className="relative rounded-full size-2 bg-accent" />
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">
          Indexing 928 Billion Snapshots
        </span>
      </div>

      <h1
        className="font-display font-extrabold tracking-tighter text-5xl md:text-7xl lg:text-[6.5rem] leading-[0.95] text-balance mb-6"
        style={{ animation: "slide-up-reveal 0.8s var(--ease-portal) 0.05s both" }}
      >
        Travel through{" "}
        <span className="text-gradient-accent italic font-light">digital time.</span>
      </h1>

      <p
        className="text-muted-foreground max-w-xl mx-auto text-base md:text-lg text-pretty mb-12"
        style={{ animation: "slide-up-reveal 1s var(--ease-portal) 0.1s both" }}
      >
        Paste any website URL and witness its evolution across decades — cinematic snapshots,
        AI-decoded design eras, and a holographic timeline of the open web.
      </p>

      <form
        onSubmit={handle}
        className="relative max-w-2xl mx-auto"
        style={{ animation: "slide-up-reveal 1.1s var(--ease-portal) 0.15s both" }}
      >
        <div className="absolute inset-0 bg-accent/20 blur-3xl -z-10 opacity-40 rounded-full" />
        <div className="group relative flex items-center p-2 rounded-2xl bg-card/60 border border-border portal-blur focus-within:border-accent/60 focus-within:glow-accent transition-all duration-500">
          <div className="pl-5 pr-3 font-mono text-muted-foreground/60 text-sm select-none">https://</div>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="apple.com"
            disabled={loading}
            className="flex-1 bg-transparent border-none outline-none py-3.5 text-lg font-light placeholder:text-foreground/20 text-foreground min-w-0"
          />
          <button
            type="submit"
            disabled={loading || !value.trim()}
            className="px-5 md:px-7 py-3.5 bg-accent text-accent-foreground font-semibold rounded-xl hover:brightness-110 active:scale-[0.97] transition-all whitespace-nowrap flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Traveling
              </>
            ) : (
              <>
                Launch Portal <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </div>

        <div className="mt-7 flex flex-wrap justify-center items-center gap-x-5 gap-y-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">Jump to:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              type="button"
              onClick={() => {
                setValue(ex.label);
                onSubmit(ex.label);
              }}
              className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground hover:text-accent transition-colors"
            >
              {ex.label} <span className="opacity-40">'{ex.year.slice(2)}</span>
            </button>
          ))}
        </div>
      </form>
    </section>
  );
}
