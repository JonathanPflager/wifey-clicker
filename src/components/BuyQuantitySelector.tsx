import { useGameStore, type BuyQuantity } from "../store/gameStore";

const OPTIONS: { label: string; value: BuyQuantity }[] = [
  { label: "1", value: 1 },
  { label: "10", value: 10 },
  { label: "25", value: 25 },
  { label: "Max", value: "max" },
];

export default function BuyQuantitySelector() {
  const buyQuantity = useGameStore((s) => s.buyQuantity);
  const setBuyQuantity = useGameStore((s) => s.setBuyQuantity);

  return (
    <div className="qty-selector">
      <span className="qty-selector-label">Buy</span>
      <div className="qty-selector-options">
        {OPTIONS.map((opt) => (
          <button
            key={opt.label}
            className={`qty-btn ${buyQuantity === opt.value ? "qty-btn-active" : ""}`}
            onClick={() => setBuyQuantity(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
