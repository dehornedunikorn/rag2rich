import { useGame, selectCapacity } from "@/game/store";
import { InventoryItem } from "@/game/types";
import { ITEM_IMAGES } from "@/game/itemImages";
import { RarityBadge } from "./RarityBadge";
import { StatBar } from "./StatBar";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export const InventoryScreen = ({ onSelectItem }: { onSelectItem: (item: InventoryItem) => void }) => {
  const inventory = useGame((s) => s.inventory);
  const cap = useGame(selectCapacity);

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold neon-text">Your Closet</h1>
          <p className="text-sm text-muted-foreground tabular-nums">{inventory.length} / {cap} items</p>
        </div>
      </div>

      <StatBar value={(inventory.length / cap) * 100} color={inventory.length >= cap ? "warning" : "primary"} />

      {inventory.length === 0 ? (
        <div className="text-center py-16 px-6 rounded-2xl border border-dashed border-border bg-card/40">
          <p className="text-4xl mb-2">🧺</p>
          <p className="font-display font-semibold">Your closet is empty</p>
          <p className="text-sm text-muted-foreground">Buy a bale and start unboxing.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {inventory.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectItem(item)}
              className={cn(
                "relative aspect-square rounded-2xl bg-gradient-surface border border-border p-2 tap-scale text-left",
                "hover:border-primary/50 transition-colors flex flex-col"
              )}
            >
              <div className="flex items-center justify-between">
                <RarityBadge rarity={item.rarity} />
                {item.washed && item.ironed && item.photographed && (
                  <span className="text-[10px] text-success" title="Ready"><Sparkles className="h-3 w-3" /></span>
                )}
              </div>
              <div className="flex-1 grid place-items-center overflow-hidden my-1">
                <img
                  src={ITEM_IMAGES[item.kind]}
                  alt={item.name}
                  width={512}
                  height={512}
                  loading="lazy"
                  className="h-full w-full object-contain rounded-lg"
                />
              </div>
              <div>
                <p className="text-[11px] font-semibold leading-tight truncate">{item.name}</p>
                <StatBar value={item.condition} color={item.condition > 70 ? "success" : "warning"} className="mt-1" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
