import type { ItemConfig } from "./types";
import { ROSE_ITEMS } from "./roseItems";

/**
 * Cost of the NEXT copy of an item, given how many are already owned.
 * cost(owned) = round(baseCost * costGrowth^owned)
 */
export function nextCost(config: ItemConfig, owned: number): number {
  return Math.round(config.baseCost * Math.pow(config.costGrowth, owned));
}

/**
 * Happiness paid out by one completed cycle of this item at its current count.
 * Scales linearly with copies owned.
 */
export function cyclePayout(config: ItemConfig, owned: number): number {
  return config.baseReward * owned;
}

/** Every this many copies owned, an item's cycle time halves (25 -> 1/2, 50 -> 1/4...). */
export const HALVE_EVERY = 25;

/** Number of speed halvings unlocked so far, from copies owned. */
export function speedTier(owned: number): number {
  return Math.floor(owned / HALVE_EVERY);
}

/**
 * Effective cycle length (seconds) after applying speed milestones.
 * effective = cycleSeconds / 2^speedTier(owned)
 */
export function effectiveCycleSeconds(config: ItemConfig, owned: number): number {
  return config.cycleSeconds / Math.pow(2, speedTier(owned));
}

/**
 * Happiness per second at the current count and speed — used for the glittering
 * "h/s" display once an item's effective cycle drops below one second.
 */
export function happinessPerSecond(config: ItemConfig, owned: number): number {
  const eff = effectiveCycleSeconds(config, owned);
  if (eff <= 0) return 0;
  return cyclePayout(config, owned) / eff;
}

// ---- Prestige (white roses 🌹) ----

/**
 * Divisor tuning the rose payout curve. Calibrated by scripts/calibrate.mjs so
 * that roughly one hour of play (~900K happiness) yields ~10 roses:
 *   floor(sqrt(runHappiness / ROSE_K)) with ROSE_K = 9000 -> 10 at ~900K.
 * Re-run the sim and update this if the economy is rebalanced.
 */
export const ROSE_K = 9000;

/** Global happiness multiplier from roses: +1% gain per rose. */
export function happinessMultiplier(roses: number): number {
  return 1 + 0.01 * roses;
}

/**
 * Roses a prestige would grant, given happiness earned this run.
 * Square-root scaling: doubling roses needs ~4x the run happiness.
 */
export function rosesForRun(runHappiness: number): number {
  return Math.floor(Math.sqrt(Math.max(0, runHappiness) / ROSE_K));
}

// ---- Rose shop (permanent upgrades bought with roses) ----

/** Flat bonus granted per level of any rose-shop item (+0.5%). */
export const ROSE_ITEM_BONUS = 0.005;
/** Cost to unlock the FIRST-ever rose-shop item; each further NEW item costs more. */
export const ROSE_UNLOCK_BASE = 100;
/** Unlock cost multiplier per already-unlocked item (100 -> 150 -> 225...). */
export const ROSE_UNLOCK_GROWTH = 1.5;
/** Cost of an already-unlocked item's first further upgrade. */
export const ROSE_UPGRADE_BASE = 10;
/** Upgrade cost multiplier per level beyond unlock. */
export const ROSE_UPGRADE_GROWTH = 1.25;

/** Level per rose-shop item id (0 = locked/not yet unlocked). */
export type RoseItemLevels = Record<string, number>;

/**
 * Cost (in roses) to buy the NEXT level of rose-shop item `id`.
 * Unlocking (level 0 -> 1) uses a cost shared across all 3 items, based on how
 * many are already unlocked. Upgrading (level >= 1) uses a separate, cheaper,
 * per-item cost track.
 */
export function roseItemCost(id: string, levels: RoseItemLevels): number {
  const level = levels[id] ?? 0;
  if (level === 0) {
    const unlockedCount = ROSE_ITEMS.filter((i) => (levels[i.id] ?? 0) >= 1).length;
    return Math.round(ROSE_UNLOCK_BASE * Math.pow(ROSE_UNLOCK_GROWTH, unlockedCount));
  }
  return Math.round(ROSE_UPGRADE_BASE * Math.pow(ROSE_UPGRADE_GROWTH, level - 1));
}

function roseItemBonus(levels: RoseItemLevels, id: string): number {
  return (levels[id] ?? 0) * ROSE_ITEM_BONUS;
}

/** Golden Kindle: multiplies activity speed (shrinks cycle time). */
export function speedMultiplier(levels: RoseItemLevels): number {
  return 1 + roseItemBonus(levels, "kindle");
}

/** Diamond Jewelry: multiplies roses earned per prestige. */
export function roseGainMultiplier(levels: RoseItemLevels): number {
  return 1 + roseItemBonus(levels, "jewelry");
}

/** Pet Penguin: multiplies (reduces) main-game item costs. */
export function costMultiplier(levels: RoseItemLevels): number {
  return Math.max(0, 1 - roseItemBonus(levels, "penguin"));
}

/** Main-game item cost after the Pet Penguin discount. */
export function discountedCost(
  config: ItemConfig,
  owned: number,
  levels: RoseItemLevels
): number {
  return Math.max(1, Math.round(nextCost(config, owned) * costMultiplier(levels)));
}

/** Main-game item cycle length after the Golden Kindle speed boost. */
export function boostedCycleSeconds(
  config: ItemConfig,
  owned: number,
  levels: RoseItemLevels
): number {
  return effectiveCycleSeconds(config, owned) / speedMultiplier(levels);
}

/** Happiness/second at the current count, speed milestones, and Kindle boost. */
export function boostedHappinessPerSecond(
  config: ItemConfig,
  owned: number,
  levels: RoseItemLevels
): number {
  const seconds = boostedCycleSeconds(config, owned, levels);
  if (seconds <= 0) return 0;
  return cyclePayout(config, owned) / seconds;
}

/** Roses a prestige would grant, including the Diamond Jewelry bonus. */
export function roseGainForRun(runHappiness: number, levels: RoseItemLevels): number {
  return Math.floor(
    Math.sqrt(Math.max(0, runHappiness) / ROSE_K) * roseGainMultiplier(levels)
  );
}

/**
 * Formats a number for display. Values are floored to whole numbers first (the
 * rose multiplier makes happiness fractional internally, but we never show
 * decimals). Small numbers get thousands separators (1,234); larger ones use
 * compact suffixes (1.2K, 3.4M, 5.6B...).
 */
export function formatNumber(n: number): string {
  const whole = Math.floor(n);
  if (whole < 1000) return whole.toString();
  if (whole < 1_000_000) return whole.toLocaleString("en-US");
  const units = ["M", "B", "T", "Qa", "Qi", "Sx", "Sp"];
  let unitIndex = 0; // whole is already >= 1,000,000, i.e. at least "M"
  let value = whole / 1_000_000;
  while (value >= 1000 && unitIndex < units.length - 1) {
    value /= 1000;
    unitIndex++;
  }
  return `${value.toFixed(2)}${units[unitIndex]}`;
}
