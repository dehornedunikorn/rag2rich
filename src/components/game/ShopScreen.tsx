import { useGame } from "@/game/store";
import { STORAGE_TIERS, StorageTier, UPGRADES } from "@/game/types";
import { Coins, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TIER_ORDER: StorageTier[] = ["closet", "room", "garage", "container"];

export const ShopScreen = () => {
  const coins = useGame((s) => s.coins);
  const storageTier = useGame((s) => s.storageTier);
  const upgradeStorage = useGame((s) => s.upgradeStorage);
  const upgradeLevels = useGame((s) => s.upgradeLevels);
  const upgrade = useGame((s) => s.upgrade);
  const reset = useGame((s) => s.reset);

  return (
    <div className="px-4 py-4 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold neon-text">Shop</h1>
        <p className="text-sm text-muted-foreground">Reinvest in your empire.</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Storage</h2>
        <div className="space-y-2.5">
          {TIER_ORDER.map((t, idx) => {
            const tier = STORAGE_TIERS[t];
            const currentIdx = TIER_ORDER.indexOf(storageTier);
            const owned = idx <= currentIdx;
            const isNext = idx === currentIdx + 1;
            const afford = coins >= tier.cost;
            return (
              <div
                key={t}
                className={cn(
                  "rounded-2xl p-4 border flex items-center gap-3",
                  owned ? "bg-success/10 border-success/30" : "bg-gradient-surface border-border"
                )}
              >
                <div className="h-12 w-12 rounded-xl bg-secondary border border-border grid place-items-center text-2xl">
                  {tier.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-display font-bold">{tier.name}</p>
                    {owned && <span className="text-[10px] text-success font-bold">OWNED</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">Capacity: {tier.capacity} items</p>
                </div>
                {!owned && (
                  <button
                    disabled={!isNext || !afford}
                    onClick={() => {
                      if (upgradeStorage(t)) toast.success(`Upgraded to ${tier.name}!`);
                      else toast.error(!isNext ? "Upgrade previous tier first" : "Not enough coins");
                    }}
                    className={cn(
                      "px-3 h-10 rounded-xl font-bold text-sm tap-scale flex items-center gap-1",
                      isNext && afford ? "bg-gradient-primary text-primary-foreground shadow-neon" : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {!isNext && <Lock className="h-3.5 w-3.5" />}
                    <Coins className="h-3.5 w-3.5" /> {tier.cost}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Equipment</h2>
        <div className="space-y-2.5">
          {UPGRADES.map((u) => {
            const lvl = upgradeLevels[u.key];
            const next = u.levels[lvl + 1];
            const current = u.levels[lvl];
            return (
              <div key={u.key} className="rounded-2xl p-4 bg-gradient-surface border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-xl bg-secondary border border-border grid place-items-center text-2xl">
                    {u.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Lv {lvl}</p>
                    <p className="text-xs font-semibold">{current.label}</p>
                  </div>
                </div>
                {next ? (
                  <button
                    disabled={coins < next.cost}
                    onClick={() => {
                      if (upgrade(u.key)) toast.success(`${u.name} → ${next.label}`);
                      else toast.error("Not enough coins");
                    }}
                    className={cn(
                      "w-full py-2.5 rounded-xl font-bold text-sm tap-scale flex items-center justify-center gap-2",
                      coins >= next.cost ? "bg-gradient-primary text-primary-foreground shadow-neon" : "bg-secondary text-muted-foreground"
                    )}
                  >
                    Upgrade to {next.label} <Coins className="h-3.5 w-3.5" /> {next.cost}
                  </button>
                ) : (
                  <div className="w-full py-2.5 rounded-xl bg-success/15 text-success text-center text-sm font-bold">
                    MAXED ✦
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <button
        onClick={() => { if (confirm("Reset all progress?")) { reset(); toast("Game reset"); } }}
        className="w-full py-2 text-xs text-muted-foreground underline"
      >
        Reset progress
      </button>
    </div>
  );
};
