import { STRAINS, STRAIN_SYMBOLS, type DdResult, type Seat, type Strain } from '../engine'
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

/** Löve tablosu (♣ ♦ ♥ ♠ NT × K G D B) ve par; 7+ löve (kontrat çıkar) koyu yazılır. */
export function DdTable({ result, size = 'sm' }: DdTableProps) {
  const large = size === 'lg'
  if (!result) {
    return (
      <p className={`text-slate-400 ${large ? 'text-sm' : 'text-xs'}`} aria-live="polite">
        {tr.dd.computing}
      </p>
    )
  }
  return (
    <div className={large ? 'text-sm' : 'text-[11px] leading-tight'}>
      <table className="w-full table-fixed text-center tabular-nums" aria-label={tr.dd.title}>
        <thead>
          <tr>
            <th className="w-6" />
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
              <th className="text-left font-medium text-slate-500" title={tr.seatNames[seat]}>
                {tr.seats[seat]}
              </th>
              {STRAINS.map((strain) => {
                const tricks = result.tricks[seat][strain]
                return (
                  <td
                    key={strain}
                    className={tricks >= 7 ? 'font-semibold text-slate-900' : 'text-slate-400'}
                  >
                    {tricks}
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
