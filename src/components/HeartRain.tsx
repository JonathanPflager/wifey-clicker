import { useMemo } from "react";

const HEART_COUNT = 18;

/**
 * Semi-transparent hearts falling during the tap bonus. Purely decorative, so
 * it ignores pointer events entirely. The randomized layout is memoized so the
 * hearts keep falling smoothly instead of being reshuffled on every tick.
 */
export default function HeartRain() {
  const hearts = useMemo(
    () =>
      Array.from({ length: HEART_COUNT }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2.5,
        duration: 3 + Math.random() * 3,
        size: 14 + Math.random() * 26,
        opacity: 0.15 + Math.random() * 0.3,
        drift: Math.round((Math.random() - 0.5) * 80),
      })),
    []
  );

  return (
    <div className="heart-rain" aria-hidden="true">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="heart"
          style={
            {
              left: `${h.left}%`,
              fontSize: `${h.size}px`,
              opacity: h.opacity,
              animationDelay: `${h.delay}s`,
              animationDuration: `${h.duration}s`,
              "--drift": `${h.drift}px`,
            } as React.CSSProperties
          }
        >
          💖
        </span>
      ))}
    </div>
  );
}
