import type { ReactNode } from 'react'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: ReactNode
  hint?: ReactNode
}

/** Açma-kapama anahtarı; etiketin tamamı tıklanabilir. */
export function Switch({ checked, onChange, label, hint }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="bh-switch"
    >
      <span className="bh-switch-text">
        <span className="bh-switch-label">{label}</span>
        {hint && <span className="bh-switch-hint">{hint}</span>}
      </span>
      <span className="bh-switch-track" aria-hidden="true">
        <span className="bh-switch-thumb" />
      </span>
    </button>
  )
}
