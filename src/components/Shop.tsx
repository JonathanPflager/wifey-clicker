import { ITEMS } from "../game/items";
import ItemCard from "./ItemCard";
import BuyQuantitySelector from "./BuyQuantitySelector";

export default function Shop() {
  return (
    <div>
      <BuyQuantitySelector />
      <div className="shop">
        {ITEMS.map((config) => (
          <ItemCard key={config.id} config={config} />
        ))}
      </div>
    </div>
  );
}
