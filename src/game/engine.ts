import type { GameState } from "./types";
import { ITEMS, ITEM_BY_ID } from "./items";
import { ROSE_ITEMS } from "./roseItems";
import {
  cyclePayout,
  happinessMultiplier,
  boostedCycleSeconds,
  roseGainForRun,
} from "./economy";

export const SAVE_VERSION = 2;

/** All rose-shop items at level 0 — the default/reset state. */
export function defaultRoseItems(): Record<string, number> {
  const levels: Record<string, number> = {};
  for (const item of ROSE_ITEMS) {
    levels[item.id] = 0;
  }
  return levels;
}

/**
 * A brand-new run: 5 happiness, nothing owned, run earnings reset.
 * `roses` carries the permanent rose bank across a prestige (0 for a full reset).
 * `roseItems` carries rose-shop levels across a prestige (defaults to all-zero,
 * i.e. a full reset).
 */
export function createNewGame(
  now: number = Date.now(),
  roses: number = 0,
  roseItems: Record<string, number> = defaultRoseItems()
): GameState {
  const items: GameState["items"] = {};
  for (const item of ITEMS) {
    items[item.id] = { owned: 0, cycleStart: 0 };
  }
  return {
    version: SAVE_VERSION,
    happiness: 5,
    items,
    roses,
    runHappiness: 0,
    roseItems,
    savedAt: now,
  };
}

/**
 * Advance the whole game to time `now`, completing any finished cycles and
 * awarding happiness. This ONE function powers both the live tick loop and
 * offline catch-up (offline just has a much larger elapsed time).
 *
 * Returns a NEW state plus how much happiness was earned during this advance
 * (used to show the "while you were away" message on load).
 *
 * Note: mutates a shallow copy for speed but returns fresh top-level objects so
 * React/Zustand see a new reference.
 */
export function advanceGame(
  state: GameState,
  now: number = Date.now()
): { state: GameState; earned: number } {
  let earned = 0;
  const items: GameState["items"] = {};

  for (const [id, itemState] of Object.entries(state.items)) {
    const config = ITEM_BY_ID[id];
    // Not owned (or no config / not running) — carry state through untouched.
    if (!config || itemState.owned < 1 || itemState.cycleStart <= 0) {
      items[id] = itemState;
      continue;
    }

    const cycleMs =
      boostedCycleSeconds(config, itemState.owned, state.roseItems) * 1000;
    const elapsed = now - itemState.cycleStart;

    if (elapsed < cycleMs) {
      // Current cycle still in progress — nothing to award yet.
      items[id] = itemState;
      continue;
    }

    const completed = Math.floor(elapsed / cycleMs);
    earned += completed * cyclePayout(config, itemState.owned);
    // Advance the cycle start forward by the whole cycles consumed, so the
    // leftover remainder becomes the progress of the next cycle.
    items[id] = {
      owned: itemState.owned,
      cycleStart: itemState.cycleStart + completed * cycleMs,
    };
  }

  // Roses boost all earnings (+1% per rose), live and offline alike.
  const boosted = earned * happinessMultiplier(state.roses);
  return {
    state: {
      ...state,
      happiness: state.happiness + boosted,
      runHappiness: state.runHappiness + boosted,
      items,
    },
    earned: boosted,
  };
}

/**
 * Perform a prestige: bank the roses this run is worth, then start a fresh run
 * with items/happiness reset but roses carried over (and grown).
 */
export function applyPrestige(
  state: GameState,
  now: number = Date.now()
): GameState {
  const gained = roseGainForRun(state.runHappiness, state.roseItems);
  return createNewGame(now, state.roses + gained, state.roseItems);
}

/**
 * Fraction (0..1) of the current cycle that has elapsed, for the progress bar.
 * Returns 0 for items not owned / not running.
 */
export function cycleProgress(
  state: GameState,
  id: string,
  now: number = Date.now()
): number {
  const config = ITEM_BY_ID[id];
  const itemState = state.items[id];
  if (!config || !itemState || itemState.owned < 1 || itemState.cycleStart <= 0) {
    return 0;
  }
  const cycleMs = boostedCycleSeconds(config, itemState.owned, state.roseItems) * 1000;
  const elapsed = now - itemState.cycleStart;
  return Math.max(0, Math.min(1, elapsed / cycleMs));
}
