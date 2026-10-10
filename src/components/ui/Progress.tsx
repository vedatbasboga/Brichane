interface ProgressProps {
  value: number
  max: number
  label?: string
}

export function Progress({ value, max, label }: ProgressProps) {
  const percent = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0
  return (
    <div className="bh-progress">
      <div
        className="bh-progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
      >
        <div className="bh-progress-bar" style={{ width: `${percent}%` }} />
      </div>
      {label && <p className="bh-progress-label">{label}</p>}
    </div>
  )
}
