// =====================================================================
//  ROSE SHOP — permanent upgrades bought with roses, surviving prestige.
//  Mirrors the pattern of items.ts: config array + lookup map.
// =====================================================================
export interface RoseItemConfig {
  /** Stable id used as the key in save data. Never change once released. */
  id: string;
  /** Display name shown on the card. */
  name: string;
  /** Emoji icon shown on the card. */
  icon: string;
  /** Short effect description, shown per-level (e.g. "+0.5% activity speed"). */
  description: string;
  /** +1 for a buff (bonus grows), -1 for a debuff (e.g. cost reduction). */
  sign: 1 | -1;
}

export const ROSE_ITEMS: RoseItemConfig[] = [
  {
    id: "kindle",
    name: "Golden Kindle",
    icon: "🔥",
    description: "+0.5% activity speed",
    sign: 1,
  },
  {
    id: "jewelry",
    name: "Diamond Jewelry",
    icon: "💎",
    description: "+0.5% more roses",
    sign: 1,
  },
  {
    id: "penguin",
    name: "Pet Penguin",
    icon: "🐧",
    description: "-0.5% item cost",
    sign: -1,
  },
];

/** Look up a rose-shop item config by id. */
export const ROSE_ITEM_BY_ID: Record<string, RoseItemConfig> = Object.fromEntries(
  ROSE_ITEMS.map((item) => [item.id, item])
);
