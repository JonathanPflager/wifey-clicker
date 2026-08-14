import type { ItemConfig } from "./types";

// =====================================================================
//  GAME BALANCE — tweak these numbers to your heart's content.
//  Items appear in the shop in this array order.
//
//  cost of copy N (0-indexed) = round(baseCost * costGrowth^N)
//  payout per cycle           = baseReward * (copies owned)
//  cycle length               = cycleSeconds, HALVED every 25 copies owned
//                               (see effectiveCycleSeconds in economy.ts)
//
//  She starts with 5 happiness, so "Get a Coffee" is affordable at once.
//  Tuned ~3-4x slower than launch to leave room for the coming prestige system.
// =====================================================================
export const ITEMS: ItemConfig[] = [
  {
    id: "coffee",
    name: "Get a Coffee",
    icon: "☕",
    baseCost: 5,
    costGrowth: 1.09,
    baseReward: 1,
    cycleSeconds: 4,
  },
  {
    id: "nap",
    name: "Take A Nap",
    icon: "😴",
    baseCost: 75,
    costGrowth: 1.1,
    baseReward: 4,
    cycleSeconds: 8,
  },
  {
    id: "target",
    name: "Target Trip",
    icon: "🎯",
    baseCost: 900,
    costGrowth: 1.1,
    baseReward: 18,
    cycleSeconds: 14,
  },
  {
    id: "sims",
    name: "Play Sims",
    icon: "🎮",
    baseCost: 11000,
    costGrowth: 1.11,
    baseReward: 80,
    cycleSeconds: 22,
  },
  {
    id: "book",
    name: "Read a Book",
    icon: "📖",
    baseCost: 130000,
    costGrowth: 1.11,
    baseReward: 350,
    cycleSeconds: 32,
  },
  {
    id: "barnesnoble",
    name: "Barnes & Noble Time",
    icon: "📚",
    baseCost: 1600000,
    costGrowth: 1.12,
    baseReward: 1600,
    cycleSeconds: 48,
  },
  {
    id: "dinner",
    name: "Special Dinner",
    icon: "🍽️",
    baseCost: 20000000,
    costGrowth: 1.12,
    baseReward: 7500,
    cycleSeconds: 70,
  },
  {
    id: "datenight",
    name: "Date Night",
    icon: "🌆",
    baseCost: 250000000,
    costGrowth: 1.13,
    baseReward: 38000,
    cycleSeconds: 100,
  },
  {
    id: "yesday",
    name: "Wifey Say Yes Day",
    icon: "💖",
    baseCost: 3200000000,
    costGrowth: 1.13,
    baseReward: 200000,
    cycleSeconds: 140,
  },
];

/** Look up an item config by id (used when applying payouts). */
export const ITEM_BY_ID: Record<string, ItemConfig> = Object.fromEntries(
  ITEMS.map((item) => [item.id, item])
);
