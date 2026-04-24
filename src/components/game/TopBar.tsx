import { Coins, Star } from "lucide-react";
import { useGame, selectReputationPct } from "@/game/store";
import { AuthButton } from "./AuthButton";

export const TopBar = () => {
  const coins = useGame((s) => s.coins);
  const sales = useGame((s) => s.totalSales);
  const repPct = useGame(selectReputationPct).toFixed(0);

  return (
    <header className="sticky top-0 z-30 px-4 pt-4 pb-3 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-neon shrink-0">
            <span className="font-display font-bold text-primary-foreground text-sm">R²</span>
          </div>
          <div className="leading-tight min-w-0">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Rag to Rich</p>
            <p className="text-sm font-display font-semibold neon-text truncate">Thrift Tycoon</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <AuthButton />
          <div className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-secondary border border-border">
            <Star className="h-3 w-3 text-accent" />
            <span className="text-[11px] font-semibold tabular-nums">{repPct}%</span>
            <span className="text-[10px] text-muted-foreground">·{sales}</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-primary text-primary-foreground shadow-neon">
            <Coins className="h-3.5 w-3.5" />
            <span className="text-xs font-bold tabular-nums">{Math.floor(coins).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
