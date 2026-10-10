import { isVulnerable, type Seat, type Vulnerability } from '../engine'
import { tr } from '../i18n/tr'
import { cx } from './ui/cx'

interface CompassBoxProps {
  board: number
  dealer: Seat
  vul: Vulnerability
  size?: 'sm' | 'lg'
}

const EDGE_CLASS: Record<Seat, string> = {
  N: 'bh-bbox-n',
  E: 'bh-bbox-e',
  S: 'bh-bbox-s',
  W: 'bh-bbox-w',
}

/** Board kutusu: ortada numara; zonlu tarafın kenarları işaretli, dağıtıcının harfi altı çizili. */
export function CompassBox({ board, dealer, vul, size = 'sm' }: CompassBoxProps) {
  return (
    <div
      className={cx('bh-bbox', size === 'lg' && 'bh-bbox-lg')}
      role="img"
      aria-label={`${tr.board.board} ${board}, ${tr.board.dealer} ${tr.seatNames[dealer]}, ${tr.vulnerability[vul]}`}
    >
      {(['N', 'E', 'S', 'W'] as const).map((seat) => (
        <span
          key={seat}
          className={cx(
            'bh-bbox-edge',
            EDGE_CLASS[seat],
            isVulnerable(vul, seat) && 'is-vul',
            seat === dealer && 'is-dealer',
          )}
        >
          {tr.seats[seat]}
        </span>
      ))}
      <span className="bh-bbox-num">{board}</span>
    </div>
  )
}
