import { useEffect, useState } from "react";
import { useGame } from "@/game/store";
import { InventoryItem } from "@/game/types";
import { RarityBadge } from "./RarityBadge";
import { StatBar } from "./StatBar";
import { Coins, Tag, Undo2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const MarketScreen = ({
  pendingList,
  onClearPendingList,
}: {
  pendingList: InventoryItem | null;
  onClearPendingList: () => void;
}) => {
  const listings = useGame((s) => s.listings);
  const inventory = useGame((s) => s.inventory);
  const listItem = useGame((s) => s.listItem);
  const unlistItem = useGame((s) => s.unlistItem);
  const tickMarket = useGame((s) => s.tickMarket);
  const totalSales = useGame((s) => s.totalSales);

  // tick the market every 2.5s
  useEffect(() => {
    const t = setInterval(() => tickMarket(), 2500);
    return () => clearInterval(t);
  }, [tickMarket]);

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold neon-text">Marketplace</h1>
          <p className="text-sm text-muted-foreground">{listings.length} active · {totalSales} total sales</p>
        </div>
      </div>

      {pendingList && (
        <ListItemDialog item={pendingList} onClose={onClearPendingList} onConfirm={(price) => {
          listItem(pendingList.id, price);
          onClearPendingList();
          toast.success("Listed!", { description: `${pendingList.name} for ${price}c` });
        }} />
      )}

      {listings.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-border bg-card/40">
          <p className="text-4xl mb-2">🏷️</p>
          <p className="font-display font-semibold">No listings</p>
          <p className="text-sm text-muted-foreground">List items from the Studio.</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {listings.map((l) => {
            const ratio = l.item.baseValue / l.price;
            const fair = ratio > 0.85 ? "Fair" : ratio > 0.55 ? "Pricey" : "Overpriced";
            const fairColor = ratio > 0.85 ? "text-success" : ratio > 0.55 ? "text-warning" : "text-destructive";
            return (
              <li key={l.id} className="rounded-2xl bg-gradient-surface border border-border p-3 flex items-center gap-3 animate-scale-in">
                <div className="h-14 w-14 rounded-xl bg-gradient-bale grid place-items-center text-3xl border border-border shrink-0">
                  {l.item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{l.item.name}</p>
                    <RarityBadge rarity={l.item.rarity} />
                  </div>
                  <div className="flex gap-3 text-[11px] text-muted-foreground">
                    <span className={fairColor}>{fair}</span>
                    <span>cond {Math.round(l.item.condition)}%</span>
                    <span>photo {Math.round(l.item.photoQuality)}%</span>
                  </div>
                  <StatBar value={Math.min(100, (l.ticks / 30) * 100)} color="primary" className="mt-1" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="flex items-center gap-1 text-primary font-bold tabular-nums">
                    <Coins className="h-3.5 w-3.5" /> {l.price}
                  </span>
                  <button
                    onClick={() => {
                      if (inventory.length >= 999) return;
                      unlistItem(l.id);
                    }}
                    className="text-[11px] text-muted-foreground tap-scale flex items-center gap-1"
                  >
                    <Undo2 className="h-3 w-3" /> Pull
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const ListItemDialog = ({
  item,
  onClose,
  onConfirm,
}: {
  item: InventoryItem;
  onClose: () => void;
  onConfirm: (price: number) => void;
}) => {
  const suggested = Math.round(item.baseValue * (item.condition / 100) * (0.7 + (item.photoQuality / 100) * 0.6));
  const [price, setPrice] = useState(Math.max(5, suggested));
  const ratio = item.baseValue / price;
  const fair = ratio > 0.85 ? "Fair price" : ratio > 0.55 ? "Pricey" : "Overpriced — slow sale";

  return (
    <div className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm grid place-items-end sm:place-items-center animate-fade-in" onClick={onClose}>
      <div
        className="w-full sm:max-w-md bg-card border-t sm:border border-border rounded-t-3xl sm:rounded-3xl p-5 space-y-4 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-xl bg-gradient-bale grid place-items-center text-3xl border border-border">{item.emoji}</div>
            <div>
              <h3 className="font-display font-bold">List {item.name}</h3>
              <p className="text-xs text-muted-foreground">Base value: {item.baseValue}c</p>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-full bg-secondary border border-border tap-scale">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Price</span>
            <span className={cn(
              "font-semibold",
              ratio > 0.85 ? "text-success" : ratio > 0.55 ? "text-warning" : "text-destructive"
            )}>{fair}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPrice((p) => Math.max(1, p - 5))} className="h-10 w-10 rounded-xl bg-secondary border border-border tap-scale font-bold">−</button>
            <div className="flex-1 flex items-center gap-1.5 px-3 h-10 rounded-xl bg-secondary border border-border">
              <Coins className="h-4 w-4 text-primary" />
              <input
                type="number" value={price}
                onChange={(e) => setPrice(Math.max(1, Math.floor(Number(e.target.value) || 0)))}
                className="flex-1 bg-transparent outline-none font-bold tabular-nums text-right"
              />
            </div>
            <button onClick={() => setPrice((p) => p + 5)} className="h-10 w-10 rounded-xl bg-secondary border border-border tap-scale font-bold">+</button>
          </div>
          <input
            type="range" min={1} max={item.baseValue * 3} value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full accent-[hsl(var(--primary))]"
          />
        </div>

        <button
          onClick={() => onConfirm(price)}
          className="w-full py-3 rounded-xl bg-gradient-primary text-primary-foreground font-bold tap-scale shadow-neon flex items-center justify-center gap-2"
        >
          <Tag className="h-4 w-4" /> Confirm Listing
        </button>
      </div>
    </div>
  );
};
