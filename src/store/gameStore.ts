import { create } from "zustand";
import type { GameState } from "../game/types";
import { ITEM_BY_ID } from "../game/items";
import { discountedCost, roseGainForRun, roseItemCost } from "../game/economy";
import { advanceGame, applyPrestige, createNewGame } from "../game/engine";
import { loadGame, saveGame, clearSave } from "../game/save";

interface GameStore {
  game: GameState;
  /** Happiness earned while the tab was closed, shown once on load. */
  offlineEarned: number;
  /** Bumps every tick so components relying on live time re-render. */
  now: number;

  /** Advance cycles/payouts to the current time (called by the loop). */
  tick: () => void;
  /** Buy one copy of an item if affordable; starts its cycle on first buy. */
  buy: (id: string) => void;
  /** Dismiss the "while you were away" banner. */
  clearOfflineEarned: () => void;
  /** Reset items + happiness in exchange for roses (kept & grown). No-op if <1 rose. */
  prestige: () => void;
  /** Unlock or upgrade a rose-shop item if affordable. */
  buyRoseItem: (id: string) => void;
  /** Wipe progress and start over. */
  reset: () => void;
}

const initial = loadGame();

export const useGameStore = create<GameStore>((set, get) => ({
  game: initial.state,
  offlineEarned: initial.offlineEarned,
  now: Date.now(),

  tick: () => {
    const now = Date.now();
    const { state } = advanceGame(get().game, now);
    set({ game: state, now });
  },

  buy: (id: string) => {
    const config = ITEM_BY_ID[id];
    if (!config) return;
    const game = get().game;
    const itemState = game.items[id];
    const cost = discountedCost(config, itemState.owned, game.roseItems);
    if (game.happiness < cost) return; // can't afford

    const now = Date.now();
    // First copy starts the auto-running cycle; later copies keep the timer.
    const cycleStart =
      itemState.owned === 0 ? now : itemState.cycleStart || now;

    set({
      game: {
        ...game,
        happiness: game.happiness - cost,
        items: {
          ...game.items,
          [id]: { owned: itemState.owned + 1, cycleStart },
        },
      },
    });
  },

  clearOfflineEarned: () => set({ offlineEarned: 0 }),

  prestige: () => {
    const game = get().game;
    // Only prestige when it's actually worth at least one rose.
    if (roseGainForRun(game.runHappiness, game.roseItems) < 1) return;
    const now = Date.now();
    const next = applyPrestige(game, now);
    set({ game: next, offlineEarned: 0, now });
    saveGame(next, now); // persist immediately so a refresh can't undo it
  },

  buyRoseItem: (id: string) => {
    const game = get().game;
    const cost = roseItemCost(id, game.roseItems);
    if (game.roses < cost) return; // can't afford

    const now = Date.now();
    const next: GameState = {
      ...game,
      roses: game.roses - cost,
      roseItems: {
        ...game.roseItems,
        [id]: (game.roseItems[id] ?? 0) + 1,
      },
    };
    set({ game: next });
    saveGame(next, now); // persist immediately, same as prestige
  },

  reset: () => {
    clearSave();
    set({ game: createNewGame(), offlineEarned: 0, now: Date.now() });
  },
}));

// ---- Live game loop: advance ~10x/second for smooth progress bars. ----
const TICK_MS = 100;
setInterval(() => useGameStore.getState().tick(), TICK_MS);

// ---- Autosave every few seconds and on tab close. ----
const AUTOSAVE_MS = 3000;
setInterval(() => saveGame(useGameStore.getState().game), AUTOSAVE_MS);
window.addEventListener("beforeunload", () => {
  saveGame(useGameStore.getState().game);
});
