import type { GameState } from "./types";
import { ITEMS } from "./items";
import { ROSE_ITEMS } from "./roseItems";
import { speedTier, boostedCycleSeconds } from "./economy";
import { totalHappinessPerSecond } from "./engine";

// =====================================================================
//  ACHIEVEMENTS — all thresholds are tunable right here.
//
//  Earned status is DERIVED from game state, never stored. Because the
//  underlying stats are persisted, earned status is durable automatically
//  and can never desync from reality.
// =====================================================================
export interface AchievementConfig {
  /** Stable id used in seenAchievements. Never change once released. */
  id: string;
  name: string;
  icon: string;
  description: string;
  /** True when this achievement is earned, given the whole game state. */
  isEarned: (state: GameState) => boolean;
}

/** Highest count owned of any single item. */
function mostOwned(state: GameState): number {
  let most = 0;
  for (const item of ITEMS) {
    most = Math.max(most, state.items[item.id]?.owned ?? 0);
  }
  return most;
}

/** Sum of all rose-shop levels. */
function totalRoseLevels(state: GameState): number {
  let total = 0;
  for (const item of ROSE_ITEMS) {
    total += state.roseItems[item.id] ?? 0;
  }
  return total;
}

export const ACHIEVEMENTS: AchievementConfig[] = [
  // ---- Items owned ----
  {
    id: "first-buy",
    name: "First Sip",
    icon: "☕",
    description: "Buy your very first activity",
    isEarned: (s) => s.stats.totalPurchases >= 1,
  },
  {
    id: "own-25",
    name: "Getting Serious",
    icon: "📈",
    description: "Own 25 of a single activity",
    isEarned: (s) => mostOwned(s) >= 25,
  },
  {
    id: "own-100",
    name: "Devoted Regular",
    icon: "🏅",
    description: "Own 100 of a single activity",
    isEarned: (s) => mostOwned(s) >= 100,
  },
  {
    id: "collector",
    name: "A Bit of Everything",
    icon: "🧺",
    description: "Own at least one of every activity",
    isEarned: (s) => ITEMS.every((i) => (s.items[i.id]?.owned ?? 0) >= 1),
  },

  // ---- Purchases ----
  {
    id: "purchases-500",
    name: "Big Spender",
    icon: "💸",
    description: "Make 500 purchases",
    isEarned: (s) => s.stats.totalPurchases >= 500,
  },
  {
    id: "purchases-2500",
    name: "Shopaholic",
    icon: "🛍️",
    description: "Make 2,500 purchases",
    isEarned: (s) => s.stats.totalPurchases >= 2500,
  },

  // ---- Happiness earned ----
  {
    id: "happy-1k",
    name: "Little Joys",
    icon: "💗",
    description: "Earn 1,000 happiness all-time",
    isEarned: (s) => s.stats.lifetimeHappiness >= 1_000,
  },
  {
    id: "happy-1m",
    name: "Very Happy Indeed",
    icon: "💖",
    description: "Earn 1 million happiness all-time",
    isEarned: (s) => s.stats.lifetimeHappiness >= 1_000_000,
  },
  {
    id: "happy-1b",
    name: "Overjoyed",
    icon: "💝",
    description: "Earn 1 billion happiness all-time",
    isEarned: (s) => s.stats.lifetimeHappiness >= 1_000_000_000,
  },
  {
    id: "happy-1t",
    name: "Astronomically Happy",
    icon: "🌟",
    description: "Earn 1 trillion happiness all-time",
    isEarned: (s) => s.stats.lifetimeHappiness >= 1_000_000_000_000,
  },

  // ---- Rate ----
  {
    id: "hps-1k",
    name: "Rolling Along",
    icon: "⚡",
    description: "Reach 1,000 happiness per second",
    isEarned: (s) => totalHappinessPerSecond(s) >= 1_000,
  },
  {
    id: "hps-1m",
    name: "Unstoppable",
    icon: "🚀",
    description: "Reach 1 million happiness per second",
    isEarned: (s) => totalHappinessPerSecond(s) >= 1_000_000,
  },

  // ---- Speed milestones ----
  {
    id: "speed-2x",
    name: "Speed Demon",
    icon: "💨",
    description: "Get any activity to ⚡2× speed",
    isEarned: (s) => ITEMS.some((i) => speedTier(s.items[i.id]?.owned ?? 0) >= 1),
  },
  {
    id: "sub-second",
    name: "Blink and You'll Miss It",
    icon: "✨",
    description: "Drive any activity under a 1 second cycle",
    isEarned: (s) =>
      ITEMS.some((i) => {
        const owned = s.items[i.id]?.owned ?? 0;
        return owned >= 1 && boostedCycleSeconds(i, owned, s.roseItems) < 1;
      }),
  },

  // ---- Prestige & roses ----
  {
    id: "prestige-1",
    name: "Fresh Start",
    icon: "🌹",
    description: "Prestige for the first time",
    isEarned: (s) => s.stats.prestigeCount >= 1,
  },
  {
    id: "prestige-10",
    name: "Serial Restarter",
    icon: "🔄",
    description: "Prestige 10 times",
    isEarned: (s) => s.stats.prestigeCount >= 10,
  },
  {
    id: "roses-100",
    name: "Rose Garden",
    icon: "🌷",
    description: "Earn 100 roses all-time",
    isEarned: (s) => s.stats.lifetimeRoses >= 100,
  },
  {
    id: "roses-1000",
    name: "Green Thumb",
    icon: "🌺",
    description: "Earn 1,000 roses all-time",
    isEarned: (s) => s.stats.lifetimeRoses >= 1_000,
  },
  {
    id: "shop-all",
    name: "Well Equipped",
    icon: "🎁",
    description: "Unlock all three rose shop upgrades",
    isEarned: (s) => ROSE_ITEMS.every((i) => (s.roseItems[i.id] ?? 0) >= 1),
  },
  {
    id: "shop-10",
    name: "Fully Invested",
    icon: "💎",
    description: "Reach 10 total rose shop levels",
    isEarned: (s) => totalRoseLevels(s) >= 10,
  },

  // ---- Time ----
  {
    id: "time-1h",
    name: "An Hour Well Spent",
    icon: "⏰",
    description: "Play for 1 hour",
    isEarned: (s) => s.stats.activePlayMs >= 60 * 60 * 1000,
  },
  {
    id: "time-10h",
    name: "Truly Dedicated",
    icon: "🕰️",
    description: "Play for 10 hours",
    isEarned: (s) => s.stats.activePlayMs >= 10 * 60 * 60 * 1000,
  },
];

/** Ids of every achievement currently earned, derived fresh from state. */
export function earnedAchievementIds(state: GameState): string[] {
  return ACHIEVEMENTS.filter((a) => a.isEarned(state)).map((a) => a.id);
}
