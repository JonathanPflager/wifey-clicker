import { useGameStore } from "../store/gameStore";
import { formatNumber } from "../game/economy";

export default function CurrencyDisplay() {
  const happiness = useGameStore((s) => s.game.happiness);
  const roses = useGameStore((s) => s.game.roses);

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
    </div>
  );
}
