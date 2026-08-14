import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import { formatNumber, roseGainForRun } from "../game/economy";

export default function PrestigePanel() {
  const runHappiness = useGameStore((s) => s.game.runHappiness);
  const roses = useGameStore((s) => s.game.roses);
  const roseItems = useGameStore((s) => s.game.roseItems);
  const prestige = useGameStore((s) => s.prestige);

  const [confirming, setConfirming] = useState(false);

  // Includes the Diamond Jewelry (rose shop) bonus so the preview matches reality.
  const gain = roseGainForRun(runHappiness, roseItems);
  const canPrestige = gain >= 1;
  const totalAfter = roses + gain;

  const onConfirm = () => {
    prestige();
    setConfirming(false);
  };

  return (
    <section className="prestige">
      <div className="prestige-info">
        <span className="prestige-title">🌹 Prestige</span>
        <span className="prestige-sub">
          {canPrestige ? (
            <>
              Reset for <strong>{formatNumber(gain)} 🌹</strong> — each rose adds
              +1% happiness gain forever.
            </>
          ) : (
            <>Keep earning to unlock your first rose. ~10 🌹 makes a great first prestige!</>
          )}
        </span>
      </div>
      <button
        className="prestige-btn"
        onClick={() => setConfirming(true)}
        disabled={!canPrestige}
      >
        Prestige
        <span className="prestige-gain">+{formatNumber(gain)} 🌹</span>
      </button>

      {confirming && (
        <div
          className="modal-overlay"
          onClick={() => setConfirming(false)}
          role="presentation"
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="prestige-modal-title"
          >
            <h2 id="prestige-modal-title" className="modal-title">
              🌹 Prestige?
            </h2>
            <p className="modal-body">
              You'll <strong>lose all items and happiness</strong>, and gain{" "}
              <strong>{formatNumber(gain)} 🌹</strong> roses.
            </p>
            <div className="modal-stats">
              <div className="modal-stat">
                <span className="modal-stat-value">
                  {formatNumber(totalAfter)} 🌹
                </span>
                <span className="modal-stat-label">Roses after</span>
              </div>
              <div className="modal-stat">
                <span className="modal-stat-value">+{totalAfter}%</span>
                <span className="modal-stat-label">Happiness gain</span>
              </div>
            </div>
            <p className="modal-note">
              Roses are permanent and make every future run faster. 💖
            </p>
            <div className="modal-actions">
              <button
                className="modal-btn modal-btn-cancel"
                onClick={() => setConfirming(false)}
              >
                Not yet
              </button>
              <button className="modal-btn modal-btn-confirm" onClick={onConfirm}>
                Prestige for {formatNumber(gain)} 🌹
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
