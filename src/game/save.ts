import type { GameState } from "./types";
import { ITEMS } from "./items";
import { ROSE_ITEMS } from "./roseItems";
import { advanceGame, createNewGame, SAVE_VERSION } from "./engine";

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
  return { state, offlineEarned: earned };
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
    runHappiness:
      typeof parsed.runHappiness === "number" && parsed.runHappiness >= 0
        ? parsed.runHappiness
        : 0,
    roseItems,
    savedAt: typeof parsed.savedAt === "number" ? parsed.savedAt : now,
  };
}
