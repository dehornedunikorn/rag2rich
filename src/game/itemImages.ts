import { ItemKind } from "./types";

// 5 variants per category, lazy-loaded via Vite's eager glob.
const variantModules = import.meta.glob<{ default: string }>(
  "../assets/items/*.jpg",
  { eager: true }
);

const byKind: Record<ItemKind, string[]> = {
  tshirt: [], shirt: [], jeans: [], dress: [], jacket: [],
  coat: [], hoodie: [], sneakers: [], bag: [], scarf: [],
};

for (const path in variantModules) {
  // path like "../assets/items/tshirt.jpg" or "../assets/items/tshirt_2.jpg"
  const fname = path.split("/").pop()!.replace(".jpg", "");
  const [kind] = fname.split("_") as [ItemKind];
  if (kind in byKind) {
    byKind[kind].push(variantModules[path].default);
  }
}

// Sort so the base ("tshirt.jpg") comes first, then numbered variants.
for (const k of Object.keys(byKind) as ItemKind[]) {
  byKind[k].sort();
}

export const ITEM_VARIANTS = byKind;

/** Back-compat: returns variant 0 if no specific variant. */
export const ITEM_IMAGES: Record<ItemKind, string> = Object.fromEntries(
  (Object.keys(byKind) as ItemKind[]).map((k) => [k, byKind[k][0]])
) as Record<ItemKind, string>;

export const getItemImage = (kind: ItemKind, variant?: number): string => {
  const list = byKind[kind];
  if (!list || list.length === 0) return "";
  const idx = ((variant ?? 0) % list.length + list.length) % list.length;
  return list[idx];
};

export const variantCount = (kind: ItemKind): number => byKind[kind].length || 1;
