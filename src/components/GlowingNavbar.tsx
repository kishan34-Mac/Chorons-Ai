import { Link } from "@tanstack/react-router";

export function GlowingNavbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 px-6 md:px-10 py-5 flex justify-between items-center border-b border-border portal-blur bg-background/40">
      <Link to="/" className="flex items-center gap-2.5 group">
        <div className="relative size-3 rounded-full bg-accent shadow-[0_0_14px_var(--color-accent)]">
          <div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-40" />
        </div>
        <span className="font-display font-extrabold text-base tracking-tight uppercase">
          Chronos<span className="text-accent">.</span>AI
        </span>
      </Link>

      <div className="hidden md:flex gap-8 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        <a href="#explorer" className="hover:text-accent transition-colors">
          Exploration
        </a>
        <a href="#timeline" className="hover:text-accent transition-colors">
          Timeline
        </a>
        <a href="#analysis" className="hover:text-accent transition-colors">
          Analysis
        </a>
      </div>

      <div className="px-3 py-1.5 rounded-full border border-border text-[10px] font-mono text-muted-foreground">
        v1.0_BETA
      </div>
    </nav>
  );
}
