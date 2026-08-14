interface ProgressBarProps {
  /** Fill fraction, 0..1. */
  progress: number;
  /** Optional label centered over the bar. */
  label?: string;
  /**
   * When true, the bar renders full and shimmering — used for items whose cycle
   * is faster than ~1s, where a filling timer would just flicker.
   */
  glitter?: boolean;
}

export default function ProgressBar({ progress, label, glitter }: ProgressBarProps) {
  // In glitter mode the bar is always full; otherwise it fills with progress.
  const pct = glitter ? 100 : Math.round(Math.max(0, Math.min(1, progress)) * 100);
  return (
    <div className={`progress ${glitter ? "progress-glitter" : ""}`}>
      <div className="progress-fill" style={{ width: `${pct}%` }} />
      {label && <span className="progress-label">{label}</span>}
    </div>
  );
}
