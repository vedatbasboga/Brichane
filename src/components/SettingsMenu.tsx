import { useEffect, useId, useRef, useState } from 'react'
import { useTheme } from '../hooks/useTheme'
import { tr } from '../i18n/tr'
import { Switch } from './ui/Switch'

/** Üst barın sağındaki Ayarlar düğmesi ve açılır paneli (şimdilik tema). */
export function SettingsMenu() {
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useTheme()
  const rootRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="bh-icon-btn"
        aria-label={tr.settings.button}
        title={tr.settings.button}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
      >
        <svg viewBox="0 0 16 16" width={18} height={18} aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
            <path d="M2 4.5h12M2 11.5h12" />
            <circle cx={10.5} cy={4.5} r={1.9} fill="var(--surface)" />
            <circle cx={5.5} cy={11.5} r={1.9} fill="var(--surface)" />
          </g>
        </svg>
      </button>
      {open && (
        <div id={panelId} role="dialog" aria-label={tr.settings.title} className="bh-popover">
          <p className="bh-popover-title">{tr.settings.title}</p>
          <Switch
            checked={theme === 'dark'}
            onChange={(dark) => setTheme(dark ? 'dark' : 'light')}
            label={tr.settings.darkTheme}
            hint={tr.settings.darkThemeHint}
          />
        </div>
      )}
    </div>
  )
}
