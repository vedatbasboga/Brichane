import type { DealView } from '../data/savedSet'
import type { Seat } from '../engine'
import { CompassBox } from './CompassBox'
import { HandView } from './HandView'

interface DealCardProps {
  deal: DealView
  focusOnly: boolean
  size?: 'sm' | 'lg'
}

// Izgara alanları tasarımdaki koltuk harfleriyle adlandırılmış (K üst, B sol, D sağ, G alt).
const AREA: Record<Seat, string> = {
  N: 'bh-board-K',
  W: 'bh-board-B',
  E: 'bh-board-D',
  S: 'bh-board-G',
}

/** Pusula düzeni: K üstte, G altta, B/D yanlarda, ortada board kutusu. */
export function DealCard({ deal, focusOnly, size = 'sm' }: DealCardProps) {
  return (
    <div className="bh-board-compass">
      {(['N', 'W', 'E', 'S'] as const).map((seat) => (
        <div key={seat} className={AREA[seat]}>
          <HandView
            hand={deal.hands[seat]}
            seat={seat}
            hidden={focusOnly && !deal.focusSeats.includes(seat)}
            size={size}
          />
        </div>
      ))}
      <div className="bh-board-C">
        <CompassBox board={deal.board} dealer={deal.dealer} vul={deal.vul} size={size} />
      </div>
    </div>
  )
}
