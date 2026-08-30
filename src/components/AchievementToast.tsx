import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { ACHIEVEMENTS } from "../game/achievements";

const VISIBLE_MS = 4000;

/**
 * Shows the oldest pending achievement, auto-dismissing after a few seconds.
 * Rendering one at a time keeps a burst (e.g. a big Buy Max) from stacking up
 * over the screen — they queue and appear in turn.
 */
export default function AchievementToast() {
  const pending = useGameStore((s) => s.pendingAchievements);
  const dismissAchievement = useGameStore((s) => s.dismissAchievement);

  const currentId = pending[0];

  useEffect(() => {
    if (!currentId) return;
    const timer = setTimeout(() => dismissAchievement(currentId), VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [currentId, dismissAchievement]);

  if (!currentId) return null;
  const config = ACHIEVEMENTS.find((a) => a.id === currentId);
  if (!config) return null;

  return (
    <div className="toast" onClick={() => dismissAchievement(currentId)}>
      <span className="toast-icon">{config.icon}</span>
      <span className="toast-text">
        <span className="toast-title">Achievement unlocked!</span>
        <span className="toast-name">{config.name}</span>
        <span className="toast-desc">{config.description}</span>
      </span>
    </div>
  );
}
