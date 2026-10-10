import type { InputHTMLAttributes, ReactNode } from 'react'
import { cx } from './cx'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode
}

/** Onay kutusu; tıklama alanı etiketin tamamı. */
export function Checkbox({ label, className = '', disabled, ...rest }: CheckboxProps) {
  return (
    <label className={cx('bh-check', disabled && 'is-disabled', className)}>
      <input type="checkbox" className="bh-check-input" disabled={disabled} {...rest} />
      <span className="bh-check-box" aria-hidden="true">
        <svg viewBox="0 0 16 16" width={12} height={12}>
          <path
            d="M3.5 8.5l3 3 6-7"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span>{label}</span>
    </label>
  )
}
