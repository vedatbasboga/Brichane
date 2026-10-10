import { STRAINS, contractLevel, parCells, type DdResult, type Seat } from '../engine'
import { tr } from '../i18n/tr'
import { formatPar } from './ddFormat'
import { Suit } from './ui/Suit'
import { SuitText } from './ui/SuitText'
import { cx } from './ui/cx'

const ROWS: readonly Seat[] = ['N', 'S', 'E', 'W']

interface DdTableProps {
  result?: DdResult
  size?: 'sm' | 'lg'
}

/**
 * Çift kukla tablosu: K G D B × ♣ ♦ ♥ ♠ NT; hücrede yapılabilecek en yüksek kontrat seviyesi
 * ya da "–". Par kontratın hücresi sarı; altında par satırı.
 */
export function DdTable({ result, size = 'sm' }: DdTableProps) {
  if (!result) {
    return (
      <p className="bh-dd-wait" aria-live="polite">
        {tr.dd.computing}
      </p>
    )
  }
  const par = parCells(result.par)
  return (
    <div className={cx('bh-dd', size === 'lg' && 'bh-dd-lg')}>
      <table className="bh-dd-table" aria-label={tr.dd.title}>
        <thead>
          <tr>
            <th scope="col" className="bh-dd-corner">
              <span className="bh-visually-hidden">{tr.dealView.hand}</span>
            </th>
            {STRAINS.map((strain) => (
              <th key={strain} scope="col">
                {strain === 'N' ? 'NT' : <Suit suit={strain} size={size === 'lg' ? 14 : 12} />}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((seat) => (
            <tr key={seat}>
              <th scope="row" title={tr.seatNames[seat]}>
                {tr.seats[seat]}
              </th>
              {STRAINS.map((strain) => {
                const level = contractLevel(result.tricks[seat][strain])
                const isPar = par.has(`${seat}${strain}`)
                return (
                  <td
                    key={strain}
                    className={isPar ? 'is-par' : level === null ? 'is-none' : undefined}
                  >
                    {level ?? '–'}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="bh-dd-par">
        {tr.dd.par}: <SuitText text={formatPar(result.par)} />
      </p>
    </div>
  )
}
