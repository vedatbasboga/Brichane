import { useEffect, useState } from 'react'
import type { DealView } from '../data/savedSet'
import {
  PLAY_LENGTH,
  contractResult,
  dealToPbn,
  openingLeader,
  playStateAt,
  type Card,
  type Carding,
  type DiscardMethod,
  type PlayContract,
  type PlayLine,
  type Seat,
  type SignalMethod,
} from '../engine'
import { useCarding } from '../hooks/useCarding'
import { useDdPlay } from '../hooks/useDdPlay'
import { tr } from '../i18n/tr'
import { CardLabel } from './CardLabel'
import { contractLabel } from './format'
import { HandView } from './HandView'
import { signalText } from './signalText'
import { Button } from './ui/Button'
import { Field, Select } from './ui/Field'
import { Notice } from './ui/Notice'
import { SuitText } from './ui/SuitText'
import { Tag } from './ui/Tag'

const AUTO_DELAY_MS = 900

const AREA: Record<Seat, string> = {
  N: 'bh-board-K',
  W: 'bh-board-B',
  E: 'bh-board-D',
  S: 'bh-board-G',
}

interface PlayViewProps {
  deal: DealView
  contract: PlayContract
  /** Zorunlu ilk çıkış (konu kontratı). */
  lead?: Card
  /** Oynanmış kart sayısı (0–52). */
  step: number
  onStep: (step: number) => void
  onExit: () => void
}

/** Bir kontratın çift kukla oynanışı: masa, ortadaki löve, adım kontrolleri ve açıklama. */
export function PlayView({ deal, contract, lead, step, onStep, onExit }: PlayViewProps) {
  const [carding, setCarding] = useCarding()
  const play = useDdPlay(dealToPbn(deal.hands), contract, carding, lead)
  const leader = openingLeader(contract.declarer)

  return (
    <section className="flex flex-col gap-4" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="m-0 font-semibold">
          <SuitText
            text={tr.play.contract(
              contractLabel(contract),
              tr.seatNames[contract.declarer],
              tr.seatNames[leader],
            )}
          />
        </p>
        <Button variant="quiet" size="sm" onClick={onExit}>
          {tr.play.exit}
        </Button>
      </div>

      <CardingSelect carding={carding} onChange={setCarding} />

      {play.status === 'loading' && <p className="bh-dd-wait">{tr.play.computing}</p>}
      {play.status === 'error' && (
        <Notice tone="danger">
          {tr.play.error} {play.message}
        </Notice>
      )}
      {play.status === 'done' && (
        <PlayBoard deal={deal} contract={contract} line={play.line} step={step} onStep={onStep} />
      )}
    </section>
  )
}

interface PlayBoardProps {
  deal: DealView
  contract: PlayContract
  line: PlayLine
  step: number
  onStep: (step: number) => void
}

function PlayBoard({ deal, contract, line, step, onStep }: PlayBoardProps) {
  const [auto, setAuto] = useState(false)
  const state = playStateAt(deal.hands, line, step)
  const last = step > 0 ? line.steps[step - 1] : null
  const finished = step >= PLAY_LENGTH
  // Tamamlanan löve ortada duruyorsa o löve, değilse oynanmakta olan löve.
  const currentTrick = Math.min(state.winner ? state.completed : state.completed + 1, 13)

  useEffect(() => {
    if (!auto) return
    const timer = setTimeout(() => {
      if (step >= PLAY_LENGTH) setAuto(false)
      else onStep(step + 1)
    }, AUTO_DELAY_MS)
    return () => clearTimeout(timer)
  }, [auto, step, onStep])

  const result = contractResult(contract, line.declarerTricks)
  const outcome =
    result === 0 ? tr.play.made : result > 0 ? tr.play.over(result) : tr.play.down(-result)

  return (
    <>
      <div className="text-ink-muted flex flex-wrap items-baseline gap-x-3 text-[13px] tabular-nums">
        <span className="text-ink font-semibold">{tr.play.trick(currentTrick)}</span>
        <span>{tr.play.score(state.tricks.NS, state.tricks.EW)}</span>
      </div>

      <div className="bh-board-compass">
        {(['N', 'W', 'E', 'S'] as const).map((seat) => (
          <div key={seat} className={AREA[seat]}>
            <HandView
              hand={state.hands[seat]}
              seat={seat}
              size="lg"
              showHp={false}
              active={state.toPlay === seat}
            />
          </div>
        ))}
        <div className="bh-board-C">
          <div className="bh-trick" aria-label={tr.play.trick(currentTrick)}>
            {state.trick.map(({ seat, card }) => (
              <span key={seat} className={`bh-trick-${seat}`}>
                <CardLabel card={card} boxed winner={state.winner === seat} />
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bh-play-controls">
        <Button size="sm" onClick={() => onStep(0)} disabled={step === 0}>
          ⏮ {tr.play.first}
        </Button>
        <Button size="sm" onClick={() => onStep(step - 1)} disabled={step === 0}>
          ◀ {tr.play.prev}
        </Button>
        <Button size="sm" variant="primary" onClick={() => onStep(step + 1)} disabled={finished}>
          {tr.play.next} ▶
        </Button>
        <Button size="sm" onClick={() => setAuto(!auto)} disabled={finished}>
          {auto ? tr.play.pause : tr.play.auto}
        </Button>
      </div>

      <div className="min-h-[44px] text-sm">
        {!last && (
          <p className="m-0">{tr.play.start(tr.seatNames[openingLeader(contract.declarer)])}</p>
        )}
        {last && (
          <div className="flex flex-col gap-1">
            <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>{tr.play.played(tr.seatNames[last.seat])}</span>
              <span className="font-semibold">
                <CardLabel card={last.card} />
              </span>
              {last.critical && <Tag tone="note">{tr.play.critical}</Tag>}
              {state.winner && (
                <span className="text-ink-muted">
                  {tr.play.trickWon(tr.seatNames[state.winner])}
                </span>
              )}
            </p>
            <p className="text-ink-muted m-0 text-[13px]">
              {last.topicLead ? (
                <>
                  {last.topicLead.loss === 0
                    ? tr.play.topicLeadBest
                    : tr.play.topicLeadLoss(last.topicLead.loss)}
                  {last.topicLead.loss > 0 &&
                    last.alternatives.map((card, i) => (
                      <span key={card} className="text-ink">
                        {i > 0 ? ', ' : ' '}
                        <CardLabel card={card} />
                      </span>
                    ))}
                </>
              ) : last.forced ? (
                tr.play.forced
              ) : last.critical ? (
                tr.play.criticalHelp
              ) : (
                <>
                  {tr.play.alternatives}{' '}
                  {last.alternatives.map((card, i) => (
                    <span key={card} className="text-ink">
                      {i > 0 && ', '}
                      <CardLabel card={card} />
                    </span>
                  ))}
                </>
              )}
            </p>
            {last.signal && (
              <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
                <Tag tone="note">{tr.signals.tag}</Tag>
                <SuitText text={signalText(last.signal)} />
              </p>
            )}
          </div>
        )}
        {finished && (
          <p className="m-0 mt-2 font-semibold">
            <SuitText
              text={tr.play.result(tr.seatNames[contract.declarer], line.declarerTricks, outcome)}
            />
          </p>
        )}
      </div>
    </>
  )
}

interface CardingSelectProps {
  carding: Carding
  onChange: (carding: Carding) => void
}

/** Savunmanın apel anlaşması: tutum/sayı (standart, UDCA) ve defos (Roman, Lavinthal). */
function CardingSelect({ carding, onChange }: CardingSelectProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <Field label={tr.carding.signals}>
        <Select
          value={carding.signals}
          onChange={(event) =>
            onChange({ ...carding, signals: event.target.value as SignalMethod })
          }
        >
          <option value="standard">{tr.carding.standard}</option>
          <option value="udca">{tr.carding.udca}</option>
        </Select>
      </Field>
      <Field label={tr.carding.discards}>
        <Select
          value={carding.discards}
          onChange={(event) =>
            onChange({ ...carding, discards: event.target.value as DiscardMethod })
          }
        >
          <option value="roman">{tr.carding.roman}</option>
          <option value="lavinthal">{tr.carding.lavinthal}</option>
        </Select>
      </Field>
      <p className="text-ink-muted m-0 basis-full text-[13px]">{tr.carding.help}</p>
    </div>
  )
}
