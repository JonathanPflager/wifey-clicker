import type { GameState, GameStats } from "./types";
import { ITEMS } from "./items";
import { ROSE_ITEMS } from "./roseItems";
import {
  advanceGame,
  createNewGame,
  defaultStats,
  totalHappinessPerSecond,
  SAVE_VERSION,
} from "./engine";

const SAVE_KEY = "wifey-clicker-save-v1";

/**
 * Load the saved game (or a fresh one), then run offline catch-up so any cycles
 * that "completed" while the tab was closed pay out immediately.
 *
 * Returns the ready-to-play state plus how much happiness was earned while away
 * (0 for a brand-new game) so the UI can show a welcome-back note.
 */
export function loadGame(now: number = Date.now()): {
  state: GameState;
  offlineEarned: number;
} {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    return { state: createNewGame(now), offlineEarned: 0 };
  }

  let parsed: GameState;
  try {
    parsed = JSON.parse(raw) as GameState;
  } catch {
    // Corrupt save — start fresh rather than crash.
    return { state: createNewGame(now), offlineEarned: 0 };
  }

  const sanitized = sanitize(parsed, now);
  // Offline catch-up: advance from the saved moment to now.
  const { state, earned } = advanceGame(sanitized, now);
  // Seed bestHps on load so a migrated save isn't stuck at 0 until the next
  // purchase (bestHps is otherwise only updated on buy/prestige actions).
  const hps = totalHappinessPerSecond(state);
  return {
    state:
      hps > state.stats.bestHps
        ? { ...state, stats: { ...state.stats, bestHps: hps } }
        : state,
    offlineEarned: earned,
  };
}

/** Persist the game, stamping savedAt so the next load can compute offline time. */
export function saveGame(state: GameState, now: number = Date.now()): void {
  const toSave: GameState = { ...state, savedAt: now };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
  } catch {
    // Storage full / blocked (e.g. private mode) — ignore; game still runs.
  }
}

/** Wipe the save (used by a "reset game" button). */
export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

/**
 * Fill in any missing/invalid fields so a save from an older build (or a
 * newly-added item) still loads cleanly.
 */
function sanitize(parsed: Partial<GameState>, now: number): GameState {
  const fresh = createNewGame(now);
  const items = { ...fresh.items };
  if (parsed.items) {
    for (const item of ITEMS) {
      const saved = parsed.items[item.id];
      if (saved && typeof saved.owned === "number") {
        items[item.id] = {
          owned: Math.max(0, Math.floor(saved.owned)),
          cycleStart:
            typeof saved.cycleStart === "number" ? saved.cycleStart : 0,
        };
      }
    }
  }
  const roseItems = { ...fresh.roseItems };
  if (parsed.roseItems) {
    for (const item of ROSE_ITEMS) {
      const level = parsed.roseItems[item.id];
      if (typeof level === "number" && level >= 0) {
        roseItems[item.id] = Math.floor(level);
      }
    }
  }
  const runHappiness =
    typeof parsed.runHappiness === "number" && parsed.runHappiness >= 0
      ? parsed.runHappiness
      : 0;
  const savedAt = typeof parsed.savedAt === "number" ? parsed.savedAt : now;

  return {
    version: SAVE_VERSION,
    happiness:
      typeof parsed.happiness === "number" && parsed.happiness >= 0
        ? parsed.happiness
        : fresh.happiness,
    items,
    // New in v2 — default to 0 so older v1 saves load cleanly.
    roses:
      typeof parsed.roses === "number" && parsed.roses >= 0 ? parsed.roses : 0,
    runHappiness,
    roseItems,
    // New in v3 — see sanitizeStats for the pre-v3 migration.
    stats: sanitizeStats(parsed.stats, runHappiness, savedAt, now),
    seenAchievements: Array.isArray(parsed.seenAchievements)
      ? parsed.seenAchievements.filter((id): id is string => typeof id === "string")
      : [],
    savedAt,
  };
}

/** Read one non-negative number from a partial save, else fall back. */
function num(value: unknown, fallback: number): number {
  return typeof value === "number" && isFinite(value) && value >= 0
    ? value
    : fallback;
}

/**
 * Sanitize the lifetime stats block.
 *
 * Migration: a pre-v3 save has no `stats` at all. Rather than zeroing it (which
 * would greet an hours-deep player as brand new), seed the lifetime totals from
 * the run already in progress and date the save from its last write.
 */
function sanitizeStats(
  parsed: Partial<GameStats> | undefined,
  runHappiness: number,
  savedAt: number,
  now: number
): GameStats {
  const fresh = defaultStats(now);
  if (!parsed || typeof parsed !== "object") {
    return {
      ...fresh,
      lifetimeHappiness: runHappiness,
      bestRunHappiness: runHappiness,
      startedAt: savedAt,
    };
  }
  return {
    lifetimeHappiness: num(parsed.lifetimeHappiness, 0),
    bestRunHappiness: num(parsed.bestRunHappiness, 0),
    lifetimeRoses: num(parsed.lifetimeRoses, 0),
    prestigeCount: Math.floor(num(parsed.prestigeCount, 0)),
    totalPurchases: Math.floor(num(parsed.totalPurchases, 0)),
    bestHps: num(parsed.bestHps, 0),
    activePlayMs: num(parsed.activePlayMs, 0),
    startedAt: num(parsed.startedAt, savedAt),
  };
}
