import type { DealView } from '../data/savedSet'
import type { Seat } from '../engine'
import { CompassBox } from './CompassBox'
import { HandView } from './HandView'

interface DealCardProps {
  deal: DealView
  focusOnly: boolean
  size?: 'sm' | 'lg'
}

const HAND_POSITION: Record<Seat, string> = {
  N: 'col-start-2 row-start-1',
  W: 'col-start-1 row-start-2',
  E: 'col-start-3 row-start-2',
  S: 'col-start-2 row-start-3',
}

/** Klasik pusula düzeni: K üstte, G altta, B/D yanlarda. */
export function DealCard({ deal, focusOnly, size = 'sm' }: DealCardProps) {
  return (
    <div
      className={`grid grid-cols-3 items-center ${size === 'lg' ? 'gap-x-4 gap-y-3' : 'gap-x-2 gap-y-2'}`}
    >
      {(['N', 'W', 'E', 'S'] as const).map((seat) => (
        <div key={seat} className={`${HAND_POSITION[seat]} min-w-0`}>
          <HandView
            hand={deal.hands[seat]}
            seat={seat}
            hidden={focusOnly && !deal.focusSeats.includes(seat)}
            size={size}
          />
        </div>
      ))}
      <div className="col-start-2 row-start-2 flex justify-center">
        <CompassBox board={deal.board} dealer={deal.dealer} vul={deal.vul} size={size} />
      </div>
    </div>
  )
}
