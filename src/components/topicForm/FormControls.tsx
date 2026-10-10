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
      className="w-16 rounded-md border border-slate-300 px-2 py-1.5 text-center text-slate-900"
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
      <span className="min-w-28 text-sm text-slate-700">{label}</span>
      <NumberField
        label={`${name} ${tr.editor.min}`}
        value={value[0]}
        min={bounds[0]}
        max={bounds[1]}
        onChange={(n) => onChange([n, value[1]])}
      />
      <span className={invalid ? 'text-red-600' : 'text-slate-400'}>–</span>
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
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
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
            className={`rounded-full border px-3 py-1 text-sm transition ${
              active
                ? 'border-emerald-700 bg-emerald-100 font-semibold text-emerald-900 ring-1 ring-emerald-700'
                : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-500'
            }`}
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

/** Başlık + içerik + yardım metni. */
export function Field({ label, help, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {help && <p className="text-xs text-slate-500">{help}</p>}
    </div>
  )
}
