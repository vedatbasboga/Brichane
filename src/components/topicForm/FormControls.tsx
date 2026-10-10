import { useState, type ReactNode } from 'react'
import type { Bounds } from '../../data/topicDraft'
import { tr } from '../../i18n/tr'

interface NumberFieldProps {
  value: number
  min: number
  max: number
  label: string
  onChange: (value: number) => void
}

/** Yazarken geçici metni tutar; geçerli bir sayı olunca hemen bildirir. */
export function NumberField({ value, min, max, label, onChange }: NumberFieldProps) {
  const [text, setText] = useState<string | null>(null)
  return (
    <input
      type="number"
      inputMode="numeric"
      min={min}
      max={max}
      aria-label={label}
      value={text ?? String(value)}
      onFocus={() => setText(String(value))}
      onBlur={() => setText(null)}
      onChange={(event) => {
        const raw = event.target.value
        setText(raw)
        const n = Number(raw)
        if (raw !== '' && Number.isInteger(n) && n >= min && n <= max) onChange(n)
      }}
      className="bh-input bh-input-num"
    />
  )
}

interface RangeFieldProps {
  label: ReactNode
  /** Erişilebilirlik için düz metin etiket. */
  name: string
  value: Bounds
  bounds: Bounds
  onChange: (value: Bounds) => void
}

export function RangeField({ label, name, value, bounds, onChange }: RangeFieldProps) {
  const invalid = value[0] > value[1]
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-ink inline-flex min-w-28 items-center gap-1 text-sm">{label}</span>
      <NumberField
        label={`${name} ${tr.editor.min}`}
        value={value[0]}
        min={bounds[0]}
        max={bounds[1]}
        onChange={(n) => onChange([n, value[1]])}
      />
      <span className={invalid ? 'text-danger-ink' : 'text-ink-muted'}>–</span>
      <NumberField
        label={`${name} ${tr.editor.max}`}
        value={value[1]}
        min={bounds[0]}
        max={bounds[1]}
        onChange={(n) => onChange([value[0], n])}
      />
    </div>
  )
}

interface ChipGroupProps<T extends string> {
  label: string
  options: readonly T[]
  selected: readonly T[]
  render: (option: T) => ReactNode
  onChange: (selected: T[]) => void
}

/** Çoklu seçim düğmeleri; seçim sırası `options` sırasıyla döner. */
export function ChipGroup<T extends string>({
  label,
  options,
  selected,
  render,
  onChange,
}: ChipGroupProps<T>) {
  return (
    <div role="group" aria-label={label} className="bh-chips">
      {options.map((option) => {
        const active = selected.includes(option)
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            onClick={() =>
              onChange(
                active
                  ? selected.filter((s) => s !== option)
                  : options.filter((o) => o === option || selected.includes(o)),
              )
            }
            className="bh-chip"
          >
            {render(option)}
          </button>
        )
      })}
    </div>
  )
}

interface FieldProps {
  label: string
  help?: string
  children: ReactNode
}

/** Birden fazla kontrol içeren form grubu: başlık + içerik + ipucu. */
export function Field({ label, help, children }: FieldProps) {
  return (
    <div className="bh-field">
      <span className="bh-field-label">{label}</span>
      {children}
      {help && <p className="bh-field-hint">{help}</p>}
    </div>
  )
}
