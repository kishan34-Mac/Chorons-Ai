import { SkipBack, SkipForward, Play, Pause } from "lucide-react";

interface Props {
  playing: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  label?: string;
}

export function PlaybackControls({ playing, onTogglePlay, onPrev, onNext, label }: Props) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-3 px-3 py-2 rounded-full border border-border portal-blur bg-background/70 shadow-2xl">
        <button
          onClick={onPrev}
          className="size-9 rounded-full hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
          aria-label="Previous year"
        >
          <SkipBack className="size-4" />
        </button>

        <button
          onClick={onTogglePlay}
          className="size-11 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-[0_0_24px_var(--color-accent)]"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4 translate-x-0.5" />}
        </button>

        <button
          onClick={onNext}
          className="size-9 rounded-full hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
          aria-label="Next year"
        >
          <SkipForward className="size-4" />
        </button>

        <div className="h-5 w-px bg-border" />
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] pr-3 text-muted-foreground">
          {playing ? <span className="text-accent">PLAYING</span> : "PLAYBACK"}
          {label ? <span className="ml-2 text-foreground">{label}</span> : null}
        </div>
      </div>
    </div>
  );
}
