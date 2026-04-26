import { useEffect, useRef, useState } from "react";
import baleImg from "@/assets/bale.png";
import { useGame, selectCapacity, selectOccupied } from "@/game/store";
import { BALES } from "@/game/types";
import { Coins, X } from "lucide-react";
import { StatBar } from "@/components/game/StatBar";
import { RarityBadge } from "@/components/game/RarityBadge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const DashboardScreen = ({ onOpenInventory }: { onOpenInventory: () => void }) => {
  const coins = useGame((s) => s.coins);
  const activeBale = useGame((s) => s.activeBale);
  const inventoryCount = useGame((s) => s.inventory.length);
  const occupied = useGame(selectOccupied);
  const cap = useGame(selectCapacity);
  const isFull = occupied >= cap;
  const buyBale = useGame((s) => s.buyBale);
  const clickBale = useGame((s) => s.clickBale);
  const closeBale = useGame((s) => s.closeBale);

  const [pops, setPops] = useState<{ id: number; x: number; y: number; text: string }[]>([]);
  const [shake, setShake] = useState(false);
  const popId = useRef(0);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!activeBale) return;
    if (isFull) {
      toast.error("Storage full! Sell or upgrade to unpack more.");
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const before = activeBale.currentItem;
    const item = clickBale();
    setShake(true);
    setTimeout(() => setShake(false), 300);
    if (item) {
      toast.success(`${item.emoji} Found a ${item.name}!`, { description: `${item.weight}kg · ${item.rarity}` });
      popId.current++;
      setPops((p) => [...p, { id: popId.current, x, y, text: `+${item.emoji}` }]);
    } else if (before) {
      popId.current++;
      setPops((p) => [...p, { id: popId.current, x, y, text: "✨" }]);
    }
  };

  useEffect(() => {
    if (pops.length === 0) return;
    const t = setTimeout(() => setPops((p) => p.slice(1)), 900);
    return () => clearTimeout(t);
  }, [pops]);

  const cur = activeBale?.currentItem;
  const baleProgress = activeBale ? ((activeBale.def.weight - activeBale.remainingWeight) / activeBale.def.weight) * 100 : 0;
  const itemProgress = cur ? ((cur.totalClicks - cur.clicksLeft) / cur.totalClicks) * 100 : 0;

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      {!activeBale && (
        <>
          <div>
            <h1 className="text-2xl font-display font-bold neon-text">Buy a Bale</h1>
            <p className="text-sm text-muted-foreground">Pick a mystery bundle and start unboxing.</p>
          </div>
          <div className="space-y-3">
            {BALES.map((b) => {
              const afford = coins >= b.cost;
              return (
                <button
                  key={b.id}
                  onClick={() => {
                    if (!buyBale(b.id)) toast.error(afford ? "Already opening a bale" : "Not enough coins");
                  }}
                  disabled={!afford}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl bg-gradient-surface border border-border tap-scale shadow-card",
                    "flex items-center gap-3 transition-all",
                    afford ? "hover:border-primary/60 hover:shadow-neon" : "opacity-50"
                  )}
                >
                  <div className="h-16 w-16 rounded-xl bg-gradient-bale grid place-items-center text-3xl shrink-0 border border-border">
                    🎁
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold">{b.name}</h3>
                      {b.rarityBoost > 0.3 && <RarityBadge rarity="epic" />}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{b.description}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{b.weight}kg</p>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/15 text-primary font-bold tabular-nums">
                    <Coins className="h-3.5 w-3.5" /> {b.cost}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {activeBale && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-display font-bold">{activeBale.def.name}</h1>
              <p className="text-xs text-muted-foreground tabular-nums">
                {activeBale.remainingWeight.toFixed(2)} / {activeBale.def.weight}kg left
              </p>
            </div>
            <button
              onClick={closeBale}
              className="h-9 w-9 grid place-items-center rounded-full bg-secondary border border-border tap-scale"
              aria-label="Close bale"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <StatBar value={baleProgress} color="accent" label="Bale progress" />

          <div className="relative mx-auto select-none" style={{ touchAction: "manipulation" }}>
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-bale blur-2xl opacity-70" />
            <button
              onClick={handleClick}
              className={cn(
                "relative aspect-square w-full max-w-sm mx-auto block rounded-[2rem] overflow-hidden",
                "border border-primary/30 bg-card/50 backdrop-blur-sm tap-scale",
                "animate-pulse-glow",
                shake && "animate-shake"
              )}
              aria-label="Tap the bale"
            >
              <div className="absolute inset-0 bg-gradient-bale" />
              <img
                src={baleImg}
                alt="Mystery clothing bale"
                width={768}
                height={768}
                className={cn("relative h-full w-full object-contain p-6 animate-float", shake && "animate-shake")}
              />
              {cur && (
                <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-background/80 backdrop-blur-md border border-border p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cur.template.emoji}</span>
                      <div>
                        <p className="text-xs font-semibold leading-tight">Something {cur.template.weight >= 1 ? "heavy" : "light"}…</p>
                        <p className="text-[10px] text-muted-foreground">{cur.clicksLeft} taps to reveal</p>
                      </div>
                    </div>
                    <RarityBadge rarity={cur.template.rarity} />
                  </div>
                  <StatBar value={itemProgress} color="primary" />
                </div>
              )}
              {pops.map((p) => (
                <span
                  key={p.id}
                  style={{ left: p.x, top: p.y }}
                  className="absolute pointer-events-none text-2xl font-bold animate-coin-pop"
                >
                  {p.text}
                </span>
              ))}
            </button>
          </div>

          <div className="flex items-center justify-between rounded-xl glass p-3">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Storage</p>
              <p className="font-display font-bold tabular-nums">{inventoryCount} / {cap}</p>
            </div>
            <button onClick={onOpenInventory} className="px-4 py-2 rounded-lg bg-secondary border border-border text-sm font-semibold tap-scale">
              View Closet
            </button>
          </div>
        </>
      )}
    </div>
  );
};
