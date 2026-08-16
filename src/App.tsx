import { useGameStore } from "./store/gameStore";
import { formatNumber } from "./game/economy";
import CurrencyDisplay from "./components/CurrencyDisplay";
import Shop from "./components/Shop";
import PrestigePanel from "./components/PrestigePanel";
import RoseShop from "./components/RoseShop";

export default function App() {
  const offlineEarned = useGameStore((s) => s.offlineEarned);
  const clearOfflineEarned = useGameStore((s) => s.clearOfflineEarned);
  const reset = useGameStore((s) => s.reset);

  const onReset = () => {
    if (
      window.confirm(
        "Start over? This erases all progress and can't be undone."
      )
    ) {
      reset();
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Wifey Clicker 💖</h1>
      </header>

      <div className="currency-bar">
        <CurrencyDisplay />
      </div>

      {offlineEarned > 0 && (
        <div className="welcome-back" onClick={clearOfflineEarned}>
          <span>
            💌 While you were away you earned{" "}
            <strong>{formatNumber(offlineEarned)} 💗</strong> happiness!
          </span>
          <button className="dismiss-btn" onClick={clearOfflineEarned}>
            Yay! ✕
          </button>
        </div>
      )}

      <main>
        <Shop />
      </main>

      <PrestigePanel />
      <RoseShop />

      <footer className="app-footer">
        <button className="reset-btn" onClick={onReset}>
          Reset game
        </button>
        <span className="footer-note">Made with 💖 for the best wifey</span>
      </footer>
    </div>
  );
}
