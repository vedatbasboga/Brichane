import { useCallback, useState } from 'react'
import { DEFAULT_CARDING, type Carding, type DiscardMethod, type SignalMethod } from '../engine'

const STORAGE_KEY = 'brichane.carding'

const SIGNALS: readonly SignalMethod[] = ['standard', 'udca']
const DISCARDS: readonly DiscardMethod[] = ['roman', 'lavinthal']

function readCarding(): Carding {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<Carding>
    return {
      signals: SIGNALS.find((s) => s === stored?.signals) ?? DEFAULT_CARDING.signals,
      discards: DISCARDS.find((d) => d === stored?.discards) ?? DEFAULT_CARDING.discards,
    }
  } catch {
    return DEFAULT_CARDING
  }
}

/** Oynat'ta savunmanın apel anlaşması; seçim bu tarayıcıda hatırlanır. */
export function useCarding(): [Carding, (carding: Carding) => void] {
  const [carding, setState] = useState<Carding>(readCarding)
  const setCarding = useCallback((next: Carding) => {
    setState(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Depolama kapalıysa seçim yalnızca bu oturumda geçerli olur.
    }
  }, [])
  return [carding, setCarding]
}
