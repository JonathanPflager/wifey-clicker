import { ITEMS } from "../game/items";
import ItemCard from "./ItemCard";

export default function Shop() {
  return (
    <div className="shop">
      {ITEMS.map((config) => (
        <ItemCard key={config.id} config={config} />
      ))}
    </div>
  );
}
