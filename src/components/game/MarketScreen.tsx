import { useEffect, useState } from "react";
import { useGame, selectCapacity, selectOccupied } from "@/game/store";
import { InventoryItem, MARKET_LISTING_FEE } from "@/game/types";
import { getItemImage } from "@/game/itemImages";
import { DESIGNER_BY_ID } from "@/game/designer";
import { RarityBadge } from "./RarityBadge";
import { StatBar } from "./StatBar";
import { Coins, Tag, Undo2, X, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const itemImage = (item: InventoryItem): string | null => {
  if (item.designerId) return DESIGNER_BY_ID[item.designerId]?.image ?? null;
  return getItemImage(item.kind, item.variant);
};

export const MarketScreen = ({
  pendingList,
  onClearPendingList,
}: {
  pendingList: InventoryItem | null;
  onClearPendingList: () => void;
}) => {
  const listings = useGame((s) => s.listings);
  const cap = useGame(selectCapacity);
  const occupied = useGame(selectOccupied);
  const listItem = useGame((s) => s.listItem);
  const unlistItem = useGame((s) => s.unlistItem);
  const tickMarket = useGame((s) => s.tickMarket);
  const totalSales = useGame((s) => s.totalSales);
  const freeUploads = useGame((s) => s.freeUploads);
  const grantFree = useGame((s) => s.grantFreeUploads);
  const webshopUnlocked = useGame((s) => s.webshopUnlocked);

  const [giftOpen, setGiftOpen] = useState(false);

  // Market tick
  useEffect(() => {
    const t = setInterval(() => tickMarket(), 2500);
    return () => clearInterval(t);
  }, [tickMarket]);

  // Random Marketplace Gift (~once every ~3 minutes)
  useEffect(() => {
    const t = setInterval(() => {
      if (Math.random() < 0.05) setGiftOpen(true); // 5% per 10s = ~once per 3-4 min
    }, 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-2xl font-display font-bold neon-text">Marketplace</h1>
          <p className="text-sm text-muted-foreground">
            {listings.length} active · {totalSales} sales · slots {occupied}/{cap}
          </p>
        </div>
        {webshopUnlocked && (
          <span className="px-2 py-1 rounded-full bg-gold/15 border border-gold/40 text-gold text-[10px] font-bold uppercase tracking-widest shrink-0">
            Webshop
          </span>
        )}
      </div>

      <div className="rounded-xl bg-secondary border border-border px-3 py-2 text-xs flex items-center justify-between">
        <span className="text-muted-foreground">Listing fee</span>
        <span className="font-bold tabular-nums">
          {webshopUnlocked
            ? "Free (Webshop)"
            : freeUploads > 0
              ? `Free × ${freeUploads}`
              : `${MARKET_LISTING_FEE}c`}
        </span>
      </div>

      {pendingList && (
        <ListItemDialog item={pendingList} onClose={onClearPendingList} onConfirm={(price) => {
          const res = listItem(pendingList.id, price);
          if (!res.ok) {
            toast.error(res.reason ?? "Could not list");
            return;
          }
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
            const img = itemImage(l.item);
            return (
              <li key={l.id} className={cn(
                "rounded-2xl bg-gradient-surface border p-3 flex items-center gap-3 animate-scale-in",
                l.item.rarity === "designer" ? "border-gold/50" : "border-border"
              )}>
                <div className={cn(
                  "h-14 w-14 rounded-xl overflow-hidden border shrink-0 bg-card",
                  l.item.rarity === "designer" ? "border-gold/60" : "border-border"
                )}>
                  {img ? (
                    <img src={img} alt={l.item.name} width={512} height={512} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-2xl">{l.item.emoji}</div>
                  )}
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
                    onClick={() => unlistItem(l.id)}
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

      {/* Marketplace Gift popup */}
      {giftOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md grid place-items-center p-6 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-primary/40 bg-card p-5 space-y-3 text-center animate-scale-in">
            <div className="mx-auto h-14 w-14 rounded-full bg-gradient-primary grid place-items-center shadow-neon">
              <Gift className="h-7 w-7 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-display font-bold neon-text">Marketplace Gift!</h2>
            <p className="text-sm text-muted-foreground">A surprise from your buyers — 5 free uploads.</p>
            <button
              onClick={() => { grantFree(5); setGiftOpen(false); toast.success("+5 free uploads"); }}
              className="w-full py-3 rounded-xl bg-gradient-primary text-primary-foreground font-bold tap-scale shadow-neon"
            >
              Claim
            </button>
          </div>
        </div>
      )}

      <AdModal
        open={registerAdOpen}
        title="Golden Register"
        duration={5}
        rewardLabel="Instantly sell up to 5 listings"
        onComplete={async () => {
          await playRewardedAd("golden_register");
          const { sold, earned } = sellTop(5);
          setRegisterAdOpen(false);
          setRegisterAvailableAt(Date.now() + 5 * 60 * 1000); // 5-min cooldown
          if (sold > 0) toast.success(`Register cha-ching!`, { description: `${sold} sold · +${earned}c` });
          else toast("Nothing to sell");
        }}
        onSkip={() => setRegisterAdOpen(false)}
      />
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
  const img = itemImage(item);

  return (
    <div className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm grid place-items-end sm:place-items-center animate-fade-in" onClick={onClose}>
      <div
        className="w-full sm:max-w-md bg-card border-t sm:border border-border rounded-t-3xl sm:rounded-3xl p-5 space-y-4 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-xl overflow-hidden border border-border bg-card">
              {img ? (
                <img src={img} alt={item.name} width={512} height={512} loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full grid place-items-center text-2xl">{item.emoji}</div>
              )}
            </div>
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
