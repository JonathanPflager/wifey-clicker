import { ROSE_ITEMS } from "../game/roseItems";
import { useGameStore } from "../store/gameStore";
import { formatNumber, roseItemCost, ROSE_ITEM_BONUS } from "../game/economy";

export default function RoseShop() {
  const roses = useGameStore((s) => s.game.roses);
  const roseItems = useGameStore((s) => s.game.roseItems);
  const buyRoseItem = useGameStore((s) => s.buyRoseItem);

  return (
    <section className="rose-shop">
      <h2 className="rose-shop-title">🌹 Rose Shop</h2>
      <p className="rose-shop-sub">
        Permanent upgrades bought with roses. They survive future prestiges —
        only Reset clears them.
      </p>

      <div className="rose-shop-grid">
        {ROSE_ITEMS.map((config) => {
          const level = roseItems[config.id] ?? 0;
          const locked = level === 0;
          const cost = roseItemCost(config.id, roseItems);
          const canAfford = roses >= cost;
          const signedBonus = level * ROSE_ITEM_BONUS * 100 * config.sign;
          const totalBonus = `${signedBonus >= 0 ? "+" : ""}${signedBonus.toFixed(1)}`;

          return (
            <div key={config.id} className={`rose-item ${locked ? "rose-item-locked" : ""}`}>
              <div className="rose-item-icon">{config.icon}</div>
              <div className="rose-item-body">
                <div className="rose-item-title-row">
                  <span className="rose-item-name">{config.name}</span>
                  <span className="rose-item-level">
                    {locked ? "Locked" : `Lv ${level}`}
                  </span>
                </div>
                <div className="rose-item-desc">
                  {config.description}
                  {!locked && <> — currently {totalBonus}%</>}
                </div>
              </div>
              <button
                className="rose-item-btn"
                onClick={() => buyRoseItem(config.id)}
                disabled={!canAfford}
              >
                <span className="buy-label">
                  {locked ? "Unlock" : `Upgrade to Lv ${level + 1}`}
                </span>
                <span className="buy-cost">{formatNumber(cost)} 🌹</span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
