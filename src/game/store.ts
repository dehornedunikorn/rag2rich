import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  BALES, BaleDef, InventoryItem, ITEM_TEMPLATES, ItemTemplate, Listing,
  StorageTier, STORAGE_TIERS, UPGRADES, UpgradeKey,
} from "./types";

const uid = () => Math.random().toString(36).slice(2, 10);

interface ActiveBale {
  def: BaleDef;
  remainingWeight: number;
  currentItem: { template: ItemTemplate; clicksLeft: number; totalClicks: number } | null;
}

interface GameState {
  coins: number;
  reputation: number;     // starts 1.0, lower = better odds
  totalSales: number;
  storageTier: StorageTier;
  inventory: InventoryItem[];
  listings: Listing[];
  upgradeLevels: Record<UpgradeKey, number>;
  activeBale: ActiveBale | null;

  // actions
  buyBale: (id: string) => boolean;
  clickBale: () => InventoryItem | null;
  closeBale: () => void;
  setItemCondition: (id: string, condition: number) => void;
  setItemPhoto: (id: string, quality: number) => void;
  markWashed: (id: string) => void;
  markPhotographed: (id: string) => void;
  listItem: (id: string, price: number) => void;
  unlistItem: (listingId: string) => void;
  tickMarket: () => void;
  upgradeStorage: (tier: StorageTier) => boolean;
  upgrade: (key: UpgradeKey) => boolean;
  reset: () => void;
}

const capacity = (tier: StorageTier) => STORAGE_TIERS[tier].capacity;

const pickTemplate = (boost: number): ItemTemplate => {
  // Weight rarity → smaller weight to common when boost low
  const weights = ITEM_TEMPLATES.map((t) => {
    const base = t.rarity === "common" ? 50 : t.rarity === "uncommon" ? 28 : t.rarity === "rare" ? 14 : 5;
    const rarityShift = t.rarity === "common" ? -boost * 30 : t.rarity === "epic" ? boost * 25 : boost * 8;
    return Math.max(1, base + rarityShift);
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return ITEM_TEMPLATES[i];
  }
  return ITEM_TEMPLATES[0];
};

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      coins: 350,
      reputation: 1.0,
      totalSales: 0,
      storageTier: "closet",
      inventory: [],
      listings: [],
      upgradeLevels: { washer: 0, iron: 0, lights: 0 },
      activeBale: null,

      buyBale: (id) => {
        const def = BALES.find((b) => b.id === id);
        const s = get();
        if (!def || s.coins < def.cost || s.activeBale) return false;
        set({
          coins: s.coins - def.cost,
          activeBale: { def, remainingWeight: def.weight, currentItem: null },
        });
        return true;
      },

      clickBale: () => {
        const s = get();
        if (!s.activeBale) return null;
        const ab = s.activeBale;

        // capacity check
        if (s.inventory.length >= capacity(s.storageTier)) return null;

        let cur = ab.currentItem;
        if (!cur) {
          if (ab.remainingWeight <= 0.05) return null;
          // pick item that fits in remaining weight (or close)
          let template = pickTemplate(ab.def.rarityBoost);
          // if too heavy, try lighter ones
          let attempts = 0;
          while (template.weight > ab.remainingWeight + 0.4 && attempts < 6) {
            template = pickTemplate(ab.def.rarityBoost);
            attempts++;
          }
          if (template.weight > ab.remainingWeight + 0.4) {
            template = ITEM_TEMPLATES[0];
          }
          cur = { template, clicksLeft: template.clicksToReveal, totalClicks: template.clicksToReveal };
        }

        cur = { ...cur, clicksLeft: cur.clicksLeft - 1 };

        if (cur.clicksLeft > 0) {
          set({ activeBale: { ...ab, currentItem: cur } });
          return null;
        }

        // reveal
        const t = cur.template;
        const item: InventoryItem = {
          id: uid(),
          kind: t.kind,
          name: t.name,
          emoji: t.emoji,
          weight: t.weight,
          baseValue: t.baseValue,
          rarity: t.rarity,
          condition: 25 + Math.random() * 25,
          photoQuality: 0,
          washed: false,
          photographed: false,
        };
        const newRemaining = Math.max(0, ab.remainingWeight - t.weight);
        set({
          inventory: [...s.inventory, item],
          activeBale: newRemaining <= 0.05
            ? null
            : { ...ab, remainingWeight: newRemaining, currentItem: null },
        });
        return item;
      },

      closeBale: () => set({ activeBale: null }),

      setItemCondition: (id, condition) =>
        set((s) => ({
          inventory: s.inventory.map((i) => (i.id === id ? { ...i, condition: Math.max(0, Math.min(100, condition)) } : i)),
        })),

      setItemPhoto: (id, quality) =>
        set((s) => ({
          inventory: s.inventory.map((i) => (i.id === id ? { ...i, photoQuality: Math.max(0, Math.min(100, quality)) } : i)),
        })),

      markWashed: (id) =>
        set((s) => ({ inventory: s.inventory.map((i) => (i.id === id ? { ...i, washed: true } : i)) })),

      markPhotographed: (id) =>
        set((s) => ({ inventory: s.inventory.map((i) => (i.id === id ? { ...i, photographed: true } : i)) })),

      listItem: (id, price) => {
        const s = get();
        const item = s.inventory.find((i) => i.id === id);
        if (!item) return;
        const listing: Listing = { id: uid(), item, price, listedAt: Date.now(), ticks: 0 };
        set({
          inventory: s.inventory.filter((i) => i.id !== id),
          listings: [...s.listings, listing],
        });
      },

      unlistItem: (listingId) => {
        const s = get();
        const l = s.listings.find((x) => x.id === listingId);
        if (!l) return;
        if (s.inventory.length >= capacity(s.storageTier)) return;
        set({
          listings: s.listings.filter((x) => x.id !== listingId),
          inventory: [...s.inventory, l.item],
        });
      },

      tickMarket: () => {
        const s = get();
        if (s.listings.length === 0) return;
        const speedBoost = 1 + s.totalSales * 0.001;
        const sold: Listing[] = [];
        const remaining: Listing[] = [];
        for (const l of s.listings) {
          const ticks = l.ticks + 1;
          // base probability per tick
          const priceRatio = l.item.baseValue / Math.max(1, l.price); // <1 = overpriced
          const condFactor = l.item.condition / 100;
          const photoFactor = 0.5 + (l.item.photoQuality / 100) * 0.5;
          const repFactor = 1 / s.reputation;
          let p = priceRatio * condFactor * photoFactor * repFactor * 0.05 * speedBoost;
          p = Math.max(0.005, Math.min(0.6, p));
          if (Math.random() < p) {
            sold.push(l);
          } else {
            remaining.push({ ...l, ticks });
          }
        }
        if (sold.length === 0) return;
        const earned = sold.reduce((sum, l) => sum + l.price, 0);
        const newSales = s.totalSales + sold.length;
        // Every 100 sales reduce reputation factor (lower is better) by 0.1%
        const repBoosts = Math.floor(newSales / 100) - Math.floor(s.totalSales / 100);
        const newRep = Math.max(0.5, s.reputation - repBoosts * 0.001);
        set({
          coins: s.coins + earned,
          listings: remaining,
          totalSales: newSales,
          reputation: newRep,
        });
      },

      upgradeStorage: (tier) => {
        const s = get();
        const target = STORAGE_TIERS[tier];
        if (s.coins < target.cost) return false;
        // can only upgrade up
        const order: StorageTier[] = ["closet", "room", "garage", "container"];
        if (order.indexOf(tier) <= order.indexOf(s.storageTier)) return false;
        set({ coins: s.coins - target.cost, storageTier: tier });
        return true;
      },

      upgrade: (key) => {
        const s = get();
        const def = UPGRADES.find((u) => u.key === key)!;
        const next = s.upgradeLevels[key] + 1;
        if (next >= def.levels.length) return false;
        const cost = def.levels[next].cost;
        if (s.coins < cost) return false;
        set({
          coins: s.coins - cost,
          upgradeLevels: { ...s.upgradeLevels, [key]: next },
        });
        return true;
      },

      reset: () =>
        set({
          coins: 350, reputation: 1.0, totalSales: 0, storageTier: "closet",
          inventory: [], listings: [], upgradeLevels: { washer: 0, iron: 0, lights: 0 },
          activeBale: null,
        }),
    }),
    { name: "rag-to-rich-v1" }
  )
);

export const selectCapacity = (s: GameState) => STORAGE_TIERS[s.storageTier].capacity;
