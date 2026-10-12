import { useCallback, useState } from 'react'

export type Theme = 'light' | 'dark'

/** index.html'deki başlangıç betiği de bu anahtarı okur (ilk boyamada doğru tema). */
const STORAGE_KEY = 'brichane.theme'
/** Tarayıcı çubuğu rengi: temanın üst bar zemini (surface). */
const THEME_COLOR: Record<Theme, string> = { light: '#fffdf8', dark: '#1c201c' }

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement
  if (theme === 'dark') root.dataset.theme = 'dark'
  else delete root.dataset.theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme])
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Tarayıcı depolaması kapalıysa tema yalnızca bu oturumda geçerli olur.
  }
}

/** Kâğıt (açık, varsayılan) / Gece (koyu) tema; seçim bu tarayıcıda hatırlanır. */
export function useTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>(currentTheme)
  const setTheme = useCallback((next: Theme) => {
    applyTheme(next)
    setThemeState(next)
  }, [])
  return [theme, setTheme]
}
