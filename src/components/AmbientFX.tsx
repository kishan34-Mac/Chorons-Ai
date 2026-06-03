export function AmbientFX() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      <div
        className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[140px] opacity-50"
        style={{ background: "oklch(0.78 0.18 200 / 0.25)", animation: "pulse-glow 10s ease-in-out infinite" }}
      />
      <div
        className="absolute bottom-[-10%] right-[-5%] w-[55%] h-[55%] rounded-full blur-[140px] opacity-40"
        style={{ background: "oklch(0.55 0.2 280 / 0.3)", animation: "pulse-glow 14s ease-in-out infinite 1.5s" }}
      />
      {/* grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.98 0.005 240 / 0.5) 1px, transparent 1px), linear-gradient(90deg, oklch(0.98 0.005 240 / 0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />
      {/* noise */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
