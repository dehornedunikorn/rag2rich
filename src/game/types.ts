export type ItemKind =
  | "tshirt" | "shirt" | "jeans" | "dress" | "jacket" | "coat" | "hoodie" | "sneakers" | "bag" | "scarf";

export interface ItemTemplate {
  kind: ItemKind;
  name: string;
  emoji: string;
  weight: number;       // kg
  baseValue: number;    // coins, ideal sell price at 100% condition
  rarity: "common" | "uncommon" | "rare" | "epic";
  clicksToReveal: number;
}

export const ITEM_TEMPLATES: ItemTemplate[] = [
  { kind: "tshirt",   name: "T-Shirt",     emoji: "👕", weight: 0.3, baseValue: 18,  rarity: "common",   clicksToReveal: 2 },
  { kind: "shirt",    name: "Button Shirt",emoji: "🥻", weight: 0.5, baseValue: 28,  rarity: "common",   clicksToReveal: 3 },
  { kind: "scarf",    name: "Scarf",       emoji: "🧣", weight: 0.2, baseValue: 14,  rarity: "common",   clicksToReveal: 2 },
  { kind: "hoodie",   name: "Hoodie",      emoji: "🧥", weight: 0.8, baseValue: 45,  rarity: "uncommon", clicksToReveal: 4 },
  { kind: "jeans",    name: "Jeans",       emoji: "👖", weight: 0.7, baseValue: 40,  rarity: "uncommon", clicksToReveal: 4 },
  { kind: "dress",    name: "Dress",       emoji: "👗", weight: 0.6, baseValue: 55,  rarity: "uncommon", clicksToReveal: 4 },
  { kind: "bag",      name: "Handbag",     emoji: "👜", weight: 0.5, baseValue: 90,  rarity: "rare",     clicksToReveal: 4 },
  { kind: "sneakers", name: "Sneakers",    emoji: "👟", weight: 0.9, baseValue: 120, rarity: "rare",     clicksToReveal: 5 },
  { kind: "jacket",   name: "Jacket",      emoji: "🧥", weight: 1.2, baseValue: 140, rarity: "rare",     clicksToReveal: 5 },
  { kind: "coat",     name: "Wool Coat",   emoji: "🧥", weight: 1.6, baseValue: 220, rarity: "epic",     clicksToReveal: 6 },
];

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "designer";

export interface InventoryItem {
  id: string;
  kind: ItemKind;
  variant?: number;          // 0..4 — which of 5 photos to use
  designerId?: string;       // present if this is a Designer-tier item
  name: string;
  emoji: string;
  weight: number;
  baseValue: number;
  rarity: Rarity;
  condition: number;     // 0-100
  photoQuality: number;  // 0-100
  washed: boolean;
  ironed: boolean;
  photographed: boolean;
}

export interface Listing {
  id: string;
  item: InventoryItem;
  price: number;
  listedAt: number;
  ticks: number;
}

export type StorageTier = "closet" | "room" | "garage" | "container";

export const STORAGE_TIERS: Record<StorageTier, { name: string; capacity: number; cost: number; emoji: string }> = {
  closet:    { name: "Closet",    capacity: 15,  cost: 0,     emoji: "🚪" },
  room:      { name: "Room",      capacity: 30,  cost: 5000,  emoji: "🛏️" },
  garage:    { name: "Garage",    capacity: 100, cost: 12000, emoji: "🚗" },
  container: { name: "Container", capacity: 200, cost: 25000, emoji: "📦" },
};

export type UpgradeKey = "washer" | "iron" | "lights";
export interface UpgradeDef {
  key: UpgradeKey;
  name: string;
  emoji: string;
  description: string;
  levels: { cost: number; bonus: number; label: string }[];
}

export const UPGRADES: UpgradeDef[] = [
  {
    key: "washer", name: "Washing Machine", emoji: "🌀",
    description: "Widens the wash mini-game green zone.",
    levels: [
      { cost: 0,    bonus: 0,    label: "Hand wash" },
      { cost: 250,  bonus: 0.04, label: "Basic Washer" },
      { cost: 1200, bonus: 0.08, label: "Pro Washer" },
      { cost: 4000, bonus: 0.14, label: "Industrial" },
    ],
  },
  {
    key: "iron", name: "Steam Iron", emoji: "♨️",
    description: "Bonus condition added after each wash.",
    levels: [
      { cost: 0,    bonus: 0,  label: "No iron" },
      { cost: 350,  bonus: 5,  label: "Basic Iron" },
      { cost: 1500, bonus: 12, label: "Steam Iron" },
      { cost: 5000, bonus: 22, label: "Studio Press" },
    ],
  },
  {
    key: "lights", name: "Studio Lights", emoji: "💡",
    description: "Boosts max photo quality.",
    levels: [
      { cost: 0,    bonus: 60, label: "Phone flash" },
      { cost: 400,  bonus: 75, label: "Ring Light" },
      { cost: 1800, bonus: 90, label: "Softbox" },
      { cost: 6000, bonus: 100, label: "Pro Studio" },
    ],
  },
];

export interface BaleDef {
  id: string;
  name: string;
  cost: number;
  weight: number;
  rarityBoost: number; // chance modifier toward rarer items
  description: string;
}

export const BALES: BaleDef[] = [
  { id: "mixed",   name: "Mixed Bale",     cost: 120,  weight: 15, rarityBoost: 0,    description: "Standard 15kg mystery bale." },
  { id: "vintage", name: "Vintage Bale",   cost: 480,  weight: 15, rarityBoost: 0.25, description: "Higher chance of rare finds." },
  { id: "premium", name: "Premium Bale",   cost: 1500, weight: 15, rarityBoost: 0.5,  description: "Stuffed with epic gear." },
];

// Marketplace economy
export const MARKET_LISTING_FEE = 5;            // coins per upload
export const WEBSHOP_COST = 5000;               // unlock cost
export const WEBSHOP_REQUIRED_REP_PCT = 30;     // % reputation needed to unlock
export const WEBSHOP_SALE_SPEED_BONUS = 1.15;   // 15% faster
