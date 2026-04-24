import { useState } from "react";
import { useGame } from "@/game/store";
import { DESIGNER_ITEMS } from "@/game/designer";
import { Lock, Sparkles, X, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

export const StudioGallery = ({ onClose }: { onClose: () => void }) => {
  const discovered = useGame((s) => s.discoveredDesigners);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? DESIGNER_ITEMS.find((d) => d.id === selectedId) : null;

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold neon-text">Studio Gallery</h1>
          <p className="text-sm text-muted-foreground">
            {discovered.length} / {DESIGNER_ITEMS.length} designer pieces discovered
          </p>
        </div>
        <button onClick={onClose} className="h-9 w-9 grid place-items-center rounded-full bg-secondary border border-border tap-scale">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {DESIGNER_ITEMS.map((d) => {
          const isOwned = discovered.includes(d.id);
          return (
            <button
              key={d.id}
              onClick={() => isOwned && setSelectedId(d.id)}
              className={cn(
                "relative aspect-square rounded-2xl border overflow-hidden tap-scale text-left",
                isOwned
                  ? "border-gold/60 bg-gradient-to-br from-gold/15 to-card hover:border-gold"
                  : "border-border bg-secondary/40 cursor-not-allowed"
              )}
            >
              {isOwned ? (
                d.image ? (
                  <img
                    src={d.image}
                    alt={d.name}
                    width={512}
                    height={512}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-5xl">
                    {d.emoji}
                  </div>
                )
              ) : (
                <div className="absolute inset-0 grid place-items-center opacity-60">
                  <Lock className="h-7 w-7 text-muted-foreground" />
                </div>
              )}
              {isOwned && (
                <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-gold grid place-items-center">
                  <Sparkles className="h-3 w-3 text-gold-foreground" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md grid place-items-center p-6 animate-fade-in"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-gold/40 bg-card p-5 space-y-3 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-square rounded-2xl overflow-hidden border border-gold/30 bg-gradient-to-br from-gold/15 to-card grid place-items-center">
              {selected.image ? (
                <img
                  src={selected.image}
                  alt={selected.name}
                  width={1024}
                  height={1024}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-7xl">{selected.emoji}</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg">{selected.name}</h2>
              <span className="flex items-center gap-1 text-gold text-sm font-bold tabular-nums">
                <Coins className="h-3.5 w-3.5" /> {selected.baseValue}
              </span>
            </div>
            <p className="text-sm text-muted-foreground italic">"{selected.description}"</p>
            <button
              onClick={() => setSelectedId(null)}
              className="w-full py-2 rounded-xl bg-secondary border border-border text-sm font-semibold tap-scale"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
