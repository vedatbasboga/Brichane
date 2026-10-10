import { HOUSE_PATH, SPADE_PATH } from './paths'

const SCALE = 1.22

/** Logo işareti: ev (hane) içinde pik (briç). Tema renklerini izler. */
export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg className="bh-mark" viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <path className="bh-mark-house" d={HOUSE_PATH} />
      <path
        className="bh-mark-spade"
        d={SPADE_PATH}
        transform={`translate(${32 - 12 * SCALE} ${41.5 - 12.5 * SCALE}) scale(${SCALE})`}
      />
    </svg>
  )
}
