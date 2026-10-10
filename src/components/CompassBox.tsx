import { isVulnerable, type Seat, type Vulnerability } from '../engine'
import { tr } from '../i18n/tr'

interface CompassBoxProps {
  board: number
  dealer: Seat
  vul: Vulnerability
  size?: 'sm' | 'lg'
}

const EDGE_POSITION: Record<Seat, string> = {
  N: 'col-span-3 row-start-1',
  W: 'col-start-1 row-start-2',
  E: 'col-start-3 row-start-2',
  S: 'col-span-3 row-start-3',
}

/** Board numarası; zon olan kenarlar kırmızı, dağıtıcı altı çizili. */
export function CompassBox({ board, dealer, vul, size = 'sm' }: CompassBoxProps) {
  const large = size === 'lg'
  return (
    <div
      className={`grid shrink-0 overflow-hidden rounded-md border border-slate-300 font-semibold ${
        large
          ? 'size-28 grid-cols-[1.75rem_1fr_1.75rem] grid-rows-[1.75rem_1fr_1.75rem] text-sm'
          : 'size-20 grid-cols-[1.25rem_1fr_1.25rem] grid-rows-[1.25rem_1fr_1.25rem] text-xs'
      }`}
      aria-label={`${tr.board.board} ${board}, ${tr.board.dealer} ${tr.seatNames[dealer]}, ${tr.vulnerability[vul]}`}
    >
      {(['N', 'W', 'E', 'S'] as const).map((seat) => (
        <span
          key={seat}
          className={`flex items-center justify-center ${EDGE_POSITION[seat]} ${
            isVulnerable(vul, seat) ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-500'
          } ${seat === dealer ? 'underline decoration-2 underline-offset-2' : ''}`}
          aria-hidden
        >
          {tr.seats[seat]}
        </span>
      ))}
      <span
        className={`col-start-2 row-start-2 flex items-center justify-center bg-white text-slate-900 ${large ? 'text-3xl' : 'text-xl'}`}
        aria-hidden
      >
        {board}
      </span>
    </div>
  )
}
