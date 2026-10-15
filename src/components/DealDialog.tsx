import { useState, type KeyboardEvent, type ReactNode } from 'react'
import type { DealView } from '../data/savedSet'
import {
  PLAY_LENGTH,
  SEATS,
  cellContract,
  controls,
  defaultContract,
  hcp,
  losingTrickCount,
  shapePattern,
  topicPlay,
  type Card,
  type DdResult,
  type PlayContract,
  type Recipe,
} from '../engine'
import { tr } from '../i18n/tr'
import { DdTable } from './DdTable'
import { DealCard } from './DealCard'
import { contractLabel, dealCaption } from './format'
import { PlayView } from './PlayView'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'
import { SuitText } from './ui/SuitText'

interface DealDialogProps {
  deals: DealView[]
  index: number | null
  focusOnly: boolean
  onClose: () => void
  onNavigate: (index: number) => void
  /** Tablonun altına eklenecek içerik (örn. board notu). */
  renderExtra?: (deal: DealView) => ReactNode
  /** Çift kukla sonuçları (board sırasıyla); "sadece konu eli" açıkken gösterilmez. */
  dd?: (DdResult | undefined)[]
  /** Setin tarifi; konu kontratı varsa Oynat par yerine onunla başlar. */
  recipe?: Recipe
}

/** Seçili board'un tam ekran görünümü (sunumda yansıtılır); ← → ile boardlar arasında (oyun modunda kartlar arasında) gezilir. */
export function DealDialog(props: DealDialogProps) {
  if (props.index === null || !props.deals[props.index]) return null
  return <DealDialogContent {...props} index={props.index} />
}

interface PlayMode {
  board: number
  contract: PlayContract
  /** Zorunlu ilk çıkış (konu kontratı). */
  lead?: Card
  step: number
}

function DealDialogContent({
  deals,
  index,
  focusOnly,
  onClose,
  onNavigate,
  renderExtra,
  dd,
  recipe,
}: DealDialogProps & { index: number }) {
  const [play, setPlay] = useState<PlayMode | null>(null)
  const deal = deals[index]
  const ddResult = dd?.[index]
  const hasPrev = index > 0
  const hasNext = index < deals.length - 1
  // Oyun modu yalnızca başlatıldığı board'da geçerli; board değişince analize dönülür.
  const activePlay = play && play.board === deal.board && !focusOnly ? play : null
  const topic = recipe ? topicPlay(recipe, deal) : null
  const suggested = topic?.contract ?? (ddResult ? defaultContract(ddResult) : null)

  const startPlay = (contract: PlayContract, lead?: Card) =>
    setPlay({ board: deal.board, contract, lead, step: 0 })
  const setStep = (step: number) =>
    setPlay((current) =>
      current ? { ...current, step: Math.max(0, Math.min(PLAY_LENGTH, step)) } : current,
    )

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    // Yazı alanında oklar imleci taşır.
    const target = event.target as HTMLElement
    if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') return
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    const delta = event.key === 'ArrowLeft' ? -1 : 1
    if (activePlay) {
      setStep(activePlay.step + delta)
    } else if ((delta < 0 && hasPrev) || (delta > 0 && hasNext)) {
      onNavigate(index + delta)
    }
  }

  const visibleSeats = SEATS.filter((seat) => !focusOnly || deal.focusSeats.includes(seat))

  return (
    <Modal
      title={dealCaption(deal)}
      size="full"
      onClose={onClose}
      onKeyDown={handleKeyDown}
      footer={
        <div className="flex w-full justify-between gap-2">
          <Button disabled={!hasPrev} onClick={() => onNavigate(index - 1)}>
            ← {tr.dealView.prev}
          </Button>
          <Button disabled={!hasNext} onClick={() => onNavigate(index + 1)}>
            {tr.dealView.next} →
          </Button>
        </div>
      }
    >
      <div className="bh-deal-main">
        {activePlay ? (
          <PlayView
            deal={deal}
            contract={activePlay.contract}
            lead={activePlay.lead}
            step={activePlay.step}
            onStep={setStep}
            onExit={() => setPlay(null)}
          />
        ) : (
          <>
            {suggested && !focusOnly && (
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" onClick={() => startPlay(suggested, topic?.lead)}>
                  <SuitText
                    text={
                      topic
                        ? tr.play.topicButton(contractLabel(suggested))
                        : tr.play.button(contractLabel(suggested))
                    }
                  />
                </Button>
                <span className="text-ink-muted text-[13px]">{tr.play.selectHint}</span>
              </div>
            )}

            <DealCard deal={deal} focusOnly={focusOnly} size="lg" />
          </>
        )}
      </div>

      <div className="bh-deal-tables">
        <section>
          <h3 className="bh-heading">{tr.dealView.stats}</h3>
          <table className="bh-dd-table bh-stats">
            <thead>
              <tr>
                <th scope="col">{tr.dealView.hand}</th>
                <th scope="col">{tr.hcp}</th>
                <th scope="col">{tr.dealView.shape}</th>
                <th scope="col">{tr.dealView.ltc}</th>
                <th scope="col">{tr.dealView.controls}</th>
              </tr>
            </thead>
            <tbody>
              {visibleSeats.map((seat) => (
                <tr key={seat}>
                  <th scope="row">{tr.seatNames[seat]}</th>
                  <td>{hcp(deal.hands[seat])}</td>
                  <td>{shapePattern(deal.hands[seat])}</td>
                  <td>{losingTrickCount(deal.hands[seat])}</td>
                  <td>{controls(deal.hands[seat])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {dd && !focusOnly && (
          <section>
            <h3 className="bh-heading">{tr.dd.title}</h3>
            <DdTable
              result={ddResult}
              size="lg"
              selected={activePlay?.contract}
              onSelect={
                ddResult
                  ? (seat, strain) =>
                      startPlay(cellContract(seat, strain, ddResult.tricks[seat][strain]))
                  : undefined
              }
            />
            <p className="text-ink-muted text-[13px] leading-[18px]">{tr.dd.help}</p>
          </section>
        )}
      </div>

      {renderExtra?.(deal)}
    </Modal>
  )
}
