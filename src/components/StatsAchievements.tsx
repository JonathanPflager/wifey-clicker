import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import { formatNumber, formatDuration } from "../game/economy";
import { ACHIEVEMENTS, earnedAchievementIds } from "../game/achievements";
import { totalHappinessPerSecond } from "../game/engine";

export default function StatsAchievements() {
  const game = useGameStore((s) => s.game);
  const [open, setOpen] = useState(false);

  const stats = game.stats;
  const earned = earnedAchievementIds(game);
  const earnedSet = new Set(earned);

  const rows: { label: string; value: string }[] = [
    { label: "Happiness all-time", value: formatNumber(stats.lifetimeHappiness) },
    { label: "This run", value: formatNumber(game.runHappiness) },
    { label: "Best run", value: formatNumber(stats.bestRunHappiness) },
    { label: "Current rate", value: `${formatNumber(totalHappinessPerSecond(game))}/s` },
    { label: "Best rate", value: `${formatNumber(stats.bestHps)}/s` },
    { label: "Roses all-time", value: `${formatNumber(stats.lifetimeRoses)} 🌹` },
    { label: "Prestiges", value: formatNumber(stats.prestigeCount) },
    { label: "Purchases", value: formatNumber(stats.totalPurchases) },
    { label: "Time played", value: formatDuration(stats.activePlayMs) },
    {
      label: "Playing since",
      value: new Date(stats.startedAt).toLocaleDateString(),
    },
  ];

  return (
    <section className="stats-section">
      <button
        className="stats-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="stats-toggle-title">📊 Stats &amp; Achievements</span>
        <span className="stats-toggle-meta">
          {earned.length}/{ACHIEVEMENTS.length} earned
          <span className="stats-chevron">{open ? "▾" : "▸"}</span>
        </span>
      </button>

      {open && (
        <div className="stats-body">
          <div className="stats-grid">
            {rows.map((row) => (
              <div key={row.label} className="stat">
                <span className="stat-value">{row.value}</span>
                <span className="stat-label">{row.label}</span>
              </div>
            ))}
          </div>

          <h3 className="achievements-title">Achievements</h3>
          <div className="achievements-grid">
            {ACHIEVEMENTS.map((a) => {
              const isEarned = earnedSet.has(a.id);
              return (
                <div
                  key={a.id}
                  className={`achievement ${isEarned ? "achievement-earned" : ""}`}
                  title={a.description}
                >
                  <span className="achievement-icon">{isEarned ? a.icon : "🔒"}</span>
                  <span className="achievement-text">
                    <span className="achievement-name">{a.name}</span>
                    <span className="achievement-desc">{a.description}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
