import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  BALES, BaleDef, InventoryItem, ITEM_TEMPLATES, ItemTemplate, Listing,
  StorageTier, STORAGE_TIERS, UPGRADES, UpgradeKey,
  MARKET_LISTING_FEE, WEBSHOP_COST, WEBSHOP_REQUIRED_REP_PCT, WEBSHOP_SALE_SPEED_BONUS,
} from "./types";
import { DESIGNER_ITEMS, DESIGNER_BY_ID } from "./designer";
import { variantCount } from "./itemImages";

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

  // Designer collection: ids the player has ever discovered
  discoveredDesigners: string[];

  // Marketplace freebies (granted by random "Marketplace Gift")
  freeUploads: number;

  // Webshop
  webshopUnlocked: boolean;

  // actions
  buyBale: (id: string) => boolean;
  clickBale: () => InventoryItem | null;
  closeBale: () => void;
  setItemCondition: (id: string, condition: number) => void;
  setItemPhoto: (id: string, quality: number) => void;
  markWashed: (id: string) => void;
  markIroned: (id: string) => void;
  markPhotographed: (id: string) => void;
  listItem: (id: string, price: number) => { ok: boolean; reason?: string };
  unlistItem: (listingId: string) => void;
  tickMarket: () => void;
  upgradeStorage: (tier: StorageTier) => boolean;
  upgrade: (key: UpgradeKey) => boolean;
  reset: () => void;

  // new
  grantFreeUploads: (n: number) => void;
  unlockWebshop: () => boolean;
  awardDesigner: (designerId?: string) => InventoryItem | null;
  repairAllInventory: () => number;
  sellTopListings: (count: number) => { sold: number; earned: number };
  hydrate: (partial: Partial<GameState>) => void;
}

const capacity = (tier: StorageTier) => STORAGE_TIERS[tier].capacity;

const pickTemplate = (boost: number): ItemTemplate => {
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

const reputationPct = (rep: number) => (1 - (rep - 0.5) / 0.5) * 100;

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
      discoveredDesigners: [],
      freeUploads: 0,
      webshopUnlocked: false,

      buyBale: (id) => {
        const def = BALES.find((b) => b.id === id);
        const s = get();
        if (!def || s.coins < def.cost || s.activeBale) return false;
        // Block if total occupied (inventory + listings) is already at cap.
        if (s.inventory.length + s.listings.length >= capacity(s.storageTier)) return false;
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

        // Hard cap: occupied = inventory + listings must be < capacity.
        if (s.inventory.length + s.listings.length >= capacity(s.storageTier)) return null;

        let cur = ab.currentItem;
        if (!cur) {
          if (ab.remainingWeight <= 0.05) return null;
          let template = pickTemplate(ab.def.rarityBoost);
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

        const t = cur.template;
        const variant = Math.floor(Math.random() * variantCount(t.kind));
        const item: InventoryItem = {
          id: uid(),
          kind: t.kind,
          variant,
          name: t.name,
          emoji: t.emoji,
          weight: t.weight,
          baseValue: t.baseValue,
          rarity: t.rarity,
          condition: 25 + Math.random() * 25,
          photoQuality: 0,
          washed: false,
          ironed: false,
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

      markIroned: (id) =>
        set((s) => ({ inventory: s.inventory.map((i) => (i.id === id ? { ...i, ironed: true } : i)) })),

      markPhotographed: (id) =>
        set((s) => ({ inventory: s.inventory.map((i) => (i.id === id ? { ...i, photographed: true } : i)) })),

      listItem: (id, price) => {
        const s = get();
        const item = s.inventory.find((i) => i.id === id);
        if (!item) return { ok: false, reason: "Item not found" };
        const useFree = s.freeUploads > 0;
        const fee = useFree ? 0 : MARKET_LISTING_FEE;
        if (s.coins < fee) return { ok: false, reason: `Need ${fee} coins for upload fee` };

        const listing: Listing = { id: uid(), item, price, listedAt: Date.now(), ticks: 0 };
        set({
          coins: s.coins - fee,
          freeUploads: useFree ? s.freeUploads - 1 : s.freeUploads,
          // NOTE: items listed remain consumed from `inventory` but they still occupy
          // marketplace slots — total occupied = inventory + listings (see selectOccupied)
          inventory: s.inventory.filter((i) => i.id !== id),
          listings: [...s.listings, listing],
        });
        return { ok: true };
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
        const speedBoost = (1 + s.totalSales * 0.001) * (s.webshopUnlocked ? WEBSHOP_SALE_SPEED_BONUS : 1);
        const sold: Listing[] = [];
        const remaining: Listing[] = [];
        for (const l of s.listings) {
          const ticks = l.ticks + 1;
          const priceRatio = l.item.baseValue / Math.max(1, l.price);
          const condFactor = l.item.condition / 100;
          const photoFactor = 0.5 + (l.item.photoQuality / 100) * 0.5;
          const repFactor = 1 / s.reputation;
          let p = priceRatio * condFactor * photoFactor * repFactor * 0.05 * speedBoost;
          p = Math.max(0.005, Math.min(0.6, p));
          if (Math.random() < p) sold.push(l);
          else remaining.push({ ...l, ticks });
        }
        if (sold.length === 0) {
          set({ listings: remaining });
          return;
        }
        const earned = sold.reduce((sum, l) => sum + l.price, 0);
        const newSales = s.totalSales + sold.length;
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

      grantFreeUploads: (n) => set((s) => ({ freeUploads: s.freeUploads + n })),

      unlockWebshop: () => {
        const s = get();
        if (s.webshopUnlocked) return false;
        if (reputationPct(s.reputation) < WEBSHOP_REQUIRED_REP_PCT) return false;
        if (s.coins < WEBSHOP_COST) return false;
        set({ coins: s.coins - WEBSHOP_COST, webshopUnlocked: true });
        return true;
      },

      awardDesigner: (designerId) => {
        const s = get();
        if (s.inventory.length >= capacity(s.storageTier)) return null;
        const def = designerId
          ? DESIGNER_BY_ID[designerId]
          : DESIGNER_ITEMS[Math.floor(Math.random() * DESIGNER_ITEMS.length)];
        if (!def) return null;
        const item: InventoryItem = {
          id: uid(),
          kind: "jacket", // fallback kind for any sprite needs
          designerId: def.id,
          name: def.name,
          emoji: def.emoji,
          weight: def.weight,
          baseValue: def.baseValue,
          rarity: "designer",
          condition: 70 + Math.random() * 25,
          photoQuality: 0,
          washed: false,
          ironed: false,
          photographed: false,
        };
        const discovered = s.discoveredDesigners.includes(def.id)
          ? s.discoveredDesigners
          : [...s.discoveredDesigners, def.id];
        set({ inventory: [...s.inventory, item], discoveredDesigners: discovered });
        return item;
      },

      repairAllInventory: () => {
        const s = get();
        let count = 0;
        const next = s.inventory.map((i) => {
          if (i.condition < 100) count++;
          return { ...i, condition: 100, washed: true, ironed: true };
        });
        set({ inventory: next });
        return count;
      },

      sellTopListings: (count) => {
        const s = get();
        if (s.listings.length === 0) return { sold: 0, earned: 0 };
        // Sell up to `count` of the most expensive listings
        const sorted = [...s.listings].sort((a, b) => b.price - a.price);
        const toSell = sorted.slice(0, count);
        const ids = new Set(toSell.map((l) => l.id));
        const earned = toSell.reduce((sum, l) => sum + l.price, 0);
        set({
          listings: s.listings.filter((l) => !ids.has(l.id)),
          coins: s.coins + earned,
          totalSales: s.totalSales + toSell.length,
        });
        return { sold: toSell.length, earned };
      },

      hydrate: (partial) => set((s) => ({ ...s, ...partial })),

      reset: () =>
        set({
          coins: 350, reputation: 1.0, totalSales: 0, storageTier: "closet",
          inventory: [], listings: [], upgradeLevels: { washer: 0, iron: 0, lights: 0 },
          activeBale: null, discoveredDesigners: [], freeUploads: 0, webshopUnlocked: false,
        }),
    }),
    { name: "rag-to-rich-v2" }
  )
);

export const selectCapacity = (s: GameState) => STORAGE_TIERS[s.storageTier].capacity;
export const selectOccupied = (s: GameState) => s.inventory.length + s.listings.length;
export const selectReputationPct = (s: GameState) => reputationPct(s.reputation);
