import {
  STRAINS,
  STRAIN_SYMBOLS,
  contractLevel,
  parCells,
  type DdResult,
  type Seat,
  type Strain,
} from '../engine'
import { tr } from '../i18n/tr'
import { formatPar } from './ddFormat'

const ROWS: readonly Seat[] = ['N', 'S', 'E', 'W']
const STRAIN_COLOR: Record<Strain, string> = {
  C: 'text-slate-900',
  D: 'text-red-600',
  H: 'text-red-600',
  S: 'text-slate-900',
  N: 'text-slate-900',
}

interface DdTableProps {
  result?: DdResult
  size?: 'sm' | 'lg'
}

/**
 * Her deklarenin her kozda yapabileceği en yüksek kontrat seviyesi (– : çıkmaz);
 * par kontratın hücresi sarı. Altında par satırı.
 */
export function DdTable({ result, size = 'sm' }: DdTableProps) {
  const large = size === 'lg'
  if (!result) {
    return (
      <p className={`text-slate-400 ${large ? 'text-sm' : 'text-xs'}`} aria-live="polite">
        {tr.dd.computing}
      </p>
    )
  }
  const par = parCells(result.par)
  const cell = large ? 'h-7 text-sm' : 'h-5 text-[11px]'

  return (
    <div className={large ? 'text-sm' : 'text-[11px] leading-tight'}>
      <table
        className={`w-full table-fixed border-separate text-center tabular-nums ${large ? 'border-spacing-1' : 'border-spacing-0.5'}`}
        aria-label={tr.dd.title}
      >
        <thead>
          <tr>
            <th className={large ? 'w-8' : 'w-5'} />
            {STRAINS.map((strain) => (
              <th key={strain} className={`font-semibold ${STRAIN_COLOR[strain]}`}>
                {STRAIN_SYMBOLS[strain]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((seat) => (
            <tr key={seat}>
              <th className="text-left font-semibold text-slate-600" title={tr.seatNames[seat]}>
                {tr.seats[seat]}
              </th>
              {STRAINS.map((strain) => {
                const level = contractLevel(result.tricks[seat][strain])
                const isPar = par.has(`${seat}${strain}`)
                return (
                  <td
                    key={strain}
                    className={`${cell} rounded border font-semibold ${
                      isPar
                        ? 'border-yellow-500 bg-yellow-300 text-slate-900'
                        : 'border-amber-200 bg-amber-50 text-slate-800'
                    }`}
                  >
                    {level ?? '–'}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-1 text-slate-700">
        <span className="font-semibold">{tr.dd.par}:</span> {formatPar(result.par)}
      </p>
    </div>
  )
}
