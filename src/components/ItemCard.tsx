import type { ItemConfig } from "../game/types";
import { useGameStore } from "../store/gameStore";
import {
  cyclePayout,
  formatNumber,
  speedTier,
  happinessMultiplier,
  discountedCost,
  boostedCycleSeconds,
  boostedHappinessPerSecond,
  HALVE_EVERY,
} from "../game/economy";
import { cycleProgress } from "../game/engine";
import ProgressBar from "./ProgressBar";

interface ItemCardProps {
  config: ItemConfig;
}

/** Show a cycle length trimmed to at most 2 decimals (4 -> "4", 3.5 -> "3.5"). */
function formatSeconds(s: number): string {
  if (Number.isInteger(s)) return s.toString();
  return s.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

export default function ItemCard({ config }: ItemCardProps) {
  // Subscribe to the pieces this card needs; `now` forces per-tick re-render.
  const itemState = useGameStore((s) => s.game.items[config.id]);
  const happiness = useGameStore((s) => s.game.happiness);
  const now = useGameStore((s) => s.now);
  const game = useGameStore((s) => s.game);
  const buy = useGameStore((s) => s.buy);

  const owned = itemState.owned;
  // Pet Penguin (rose shop) discounts main-game item costs.
  const cost = discountedCost(config, owned, game.roseItems);
  const canAfford = happiness >= cost;
  const isLocked = owned === 0;

  const progress = cycleProgress(game, config.id, now);
  // Rose bonus (+1% per rose held) boosts the displayed payout so cards match earnings.
  const mult = happinessMultiplier(game.roses);
  const payout = cyclePayout(config, owned) * mult;

  // Speed milestones (every HALVE_EVERY copies) plus the Golden Kindle rose-shop boost.
  const tier = speedTier(owned);
  const eff = boostedCycleSeconds(config, owned, game.roseItems);
  const isGlitter = owned > 0 && eff < 1; // sub-second cycle -> show h/s
  const nextMilestone = (tier + 1) * HALVE_EVERY;

  return (
    <div className={`card ${isLocked ? "card-locked" : ""}`}>
      <div className="card-icon">{config.icon}</div>

      <div className="card-body">
        <div className="card-title-row">
          <span className="card-name">{config.name}</span>
          <span className="card-meta">
            {tier > 0 && (
              <span className="speed-badge">⚡{Math.pow(2, tier)}× faster</span>
            )}
            {owned > 0 && (
              <span className="card-owned">×{owned}</span>
            )}
          </span>
        </div>

        {isLocked ? (
          <div className="card-sub">
            Earns {formatNumber(config.baseReward)} 💗 every {config.cycleSeconds}s
          </div>
        ) : (
          <>
            <ProgressBar
              progress={progress}
              glitter={isGlitter}
              label={
                isGlitter
                  ? `${formatNumber(
                      boostedHappinessPerSecond(config, owned, game.roseItems) * mult
                    )} 💗/s`
                  : `+${formatNumber(payout)} 💗 / ${formatSeconds(eff)}s`
              }
            />
            <div className="card-hint">
              Next speed-up at ×{nextMilestone}
            </div>
          </>
        )}
      </div>

      <button
        className="buy-btn"
        onClick={() => buy(config.id)}
        disabled={!canAfford}
      >
        <span className="buy-label">{owned === 0 ? "Buy" : "Buy 1"}</span>
        <span className="buy-cost">{formatNumber(cost)} 💗</span>
      </button>
    </div>
  );
}
