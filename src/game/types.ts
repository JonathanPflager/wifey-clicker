// ---- Static configuration for one purchasable item (data-driven) ----
// Everything about game balance lives in items.ts as ItemConfig objects.
export interface ItemConfig {
  /** Stable id used as the key in save data. Never change once released. */
  id: string;
  /** Display name shown on the card. */
  name: string;
  /** Emoji/icon shown on the card. */
  icon: string;
  /** Cost of the FIRST copy, in happiness. */
  baseCost: number;
  /** Each additional copy costs previous * costGrowth (e.g. 1.09 = +9%). */
  costGrowth: number;
  /** Happiness paid out per cycle by a SINGLE copy. Total = baseReward * owned. */
  baseReward: number;
  /** How long one cycle takes, in seconds. */
  cycleSeconds: number;
}

// ---- Per-item runtime state that changes as you play (goes into the save) ----
export interface ItemState {
  /** How many copies the player owns. */
  owned: number;
  /**
   * Epoch ms when the current cycle started. 0 = not currently running.
   * Once owned >= 1 the item auto-runs, so this is set on purchase and
   * refreshed each time a cycle completes.
   */
  cycleStart: number;
}

// ---- Lifetime record of play (goes into the save) ----
// Survives prestige like `roses`/`roseItems`; only a full Reset clears it.
export interface GameStats {
  /** Happiness earned across ALL runs, ever. */
  lifetimeHappiness: number;
  /** Highest happiness earned within a single run. */
  bestRunHappiness: number;
  /**
   * Total roses ever EARNED. Tracked separately from `roses` because the rose
   * shop spends that balance — it is not a record of what was earned.
   */
  lifetimeRoses: number;
  /** Number of completed prestiges. */
  prestigeCount: number;
  /** Item copies purchased, all-time. */
  totalPurchases: number;
  /** Best happiness/sec ever reached. */
  bestHps: number;
  /** Tab-open play time in ms (offline time is deliberately excluded). */
  activePlayMs: number;
  /** Epoch ms when this save was first created. */
  startedAt: number;
}

// ---- The whole saved game ----
export interface GameState {
  /** Save format version, so we can migrate old saves later. */
  version: number;
  /** Current spendable happiness (the in-game currency). */
  happiness: number;
  /** Runtime state per item, keyed by ItemConfig.id. */
  items: Record<string, ItemState>;
  /**
   * Permanent roses earned via prestige. Each rose grants +1% happiness gain.
   * Survives prestige (accumulates); only a full Reset clears them.
   */
  roses: number;
  /**
   * Total happiness earned during the CURRENT run (since the last prestige or
   * reset). Basis for the rose payout; resets to 0 on prestige.
   */
  runHappiness: number;
  /**
   * Rose-shop levels, keyed by RoseItemConfig.id (0 = not yet unlocked).
   * Permanent upgrades bought with roses. Survives prestige; only a full
   * Reset clears them (same lifecycle as `roses`).
   */
  roseItems: Record<string, number>;
  /** Lifetime play record. Survives prestige; only a full Reset clears it. */
  stats: GameStats;
  /**
   * Achievement ids already announced via toast. Earned status itself is
   * DERIVED from state (see achievements.ts) and never stored — this list
   * exists only so each achievement is announced exactly once.
   */
  seenAchievements: string[];
  /**
   * Epoch ms when the tap bonus expires. Each tap adds BONUS_TAP_MS; while
   * `now < bonusUntil` every payout is multiplied by BONUS_MULTIPLIER.
   */
  bonusUntil: number;
  /** Epoch ms of the last save — used to compute offline earnings on load. */
  savedAt: number;
}
