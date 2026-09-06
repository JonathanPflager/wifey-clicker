import { useGameStore } from "../store/gameStore";
import { bonusRemainingMs, BONUS_MULTIPLIER } from "../game/economy";

/**
 * Thin fixed bar at the bottom of the screen. Each tap adds bonus time; while
 * it's running every activity pays BONUS_MULTIPLIER x and the remaining time
 * counts down on the button itself.
 */
export default function BonusBar() {
  const bonusUntil = useGameStore((s) => s.game.bonusUntil);
  const now = useGameStore((s) => s.now);
  const tapBonus = useGameStore((s) => s.tapBonus);

  const remainingMs = bonusRemainingMs(bonusUntil, now);
  const active = remainingMs > 0;

  return (
    <button
      className={`bonus-bar ${active ? "bonus-bar-active" : ""}`}
      onClick={tapBonus}
    >
      {active ? (
        <>
          <span className="bonus-bar-label">
            💖 {BONUS_MULTIPLIER}× Happiness — keep tapping!
          </span>
          <span className="bonus-bar-timer">
            {(remainingMs / 1000).toFixed(1)}s
          </span>
        </>
      ) : (
        <span className="bonus-bar-label">
          💖 Tap for {BONUS_MULTIPLIER}× Happiness 💖
        </span>
      )}
    </button>
  );
}
