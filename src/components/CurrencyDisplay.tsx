import { useGameStore } from "../store/gameStore";
import { formatNumber, bonusMultiplier } from "../game/economy";
import { totalHappinessPerSecond } from "../game/engine";

export default function CurrencyDisplay() {
  const happiness = useGameStore((s) => s.game.happiness);
  const roses = useGameStore((s) => s.game.roses);
  const bonusUntil = useGameStore((s) => s.game.bonusUntil);
  const now = useGameStore((s) => s.now);
  // The tap bonus doubles real earnings, so it must double the shown rate too.
  const hps =
    useGameStore((s) => totalHappinessPerSecond(s.game)) *
    bonusMultiplier(bonusUntil, now);

  return (
    <div className="currencies">
      <div className="currency">
        <span className="currency-amount">{formatNumber(happiness)}</span>
        <span className="currency-label">Happiness 💗</span>
      </div>
      <div className="currency currency-roses">
        <span className="currency-amount">{formatNumber(roses)} 🌹</span>
        <span className="currency-label">+{roses}% gain</span>
      </div>
      <div
        className={`currency currency-hps ${
          bonusMultiplier(bonusUntil, now) > 1 ? "currency-boosted" : ""
        }`}
      >
        <span className="currency-amount">{formatNumber(hps)}/s</span>
        <span className="currency-label">
          {bonusMultiplier(bonusUntil, now) > 1 ? "Per Second 🔥2×" : "Per Second ⚡"}
        </span>
      </div>
    </div>
  );
}
