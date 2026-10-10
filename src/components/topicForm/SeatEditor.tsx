import { SUITS, type Seat } from '../../engine'
import {
  CONTROLS_BOUNDS,
  LENGTH_BOUNDS,
  LTC_BOUNDS,
  SEAT_HCP_BOUNDS,
  SHAPE_CLASSES,
  emptyExcludeDraft,
  type SeatDraft,
} from '../../data/topicDraft'
import { tr } from '../../i18n/tr'
import { Button } from '../ui/Button'
import { Checkbox } from '../ui/Checkbox'
import { Suit } from '../ui/Suit'
import { ChipGroup, Field, RangeField } from './FormControls'

interface SeatEditorProps {
  seat: Seat
  isDealer: boolean
  topicSuitEnabled: boolean
  draft: SeatDraft
  onChange: (draft: SeatDraft) => void
}

export function SeatEditor({ seat, isDealer, topicSuitEnabled, draft, onChange }: SeatEditorProps) {
  const set = (patch: Partial<SeatDraft>) => onChange({ ...draft, ...patch })
  const seatName = tr.seatNames[seat]

  return (
    <section
      className={`flex flex-col gap-4 rounded-[var(--radius-lg)] border p-4 ${
        draft.enabled ? 'border-line-strong bg-surface' : 'border-line bg-transparent'
      }`}
    >
      <Checkbox
        checked={draft.enabled}
        onChange={(event) => set({ enabled: event.target.checked })}
        label={
          <span className="flex flex-wrap items-baseline gap-x-2">
            <span className="bh-heading">{seatName}</span>
            {isDealer && <span className="text-felt text-xs font-semibold">{tr.board.dealer}</span>}
            <span className="text-ink-muted text-[13px]">{tr.editor.seatEnabled}</span>
          </span>
        }
      />

      {draft.enabled && (
        <>
          <RangeField
            label={tr.editor.hcp}
            name={`${seatName} ${tr.editor.hcp}`}
            value={draft.hcp}
            bounds={SEAT_HCP_BOUNDS}
            onChange={(hcp) => set({ hcp })}
          />

          <Field label={tr.editor.shape} help={tr.editor.shapeHelp}>
            <ChipGroup
              label={`${seatName} ${tr.editor.shape}`}
              options={SHAPE_CLASSES}
              selected={draft.shapes}
              render={(cls) => tr.shapes[cls]}
              onChange={(shapes) => set({ shapes })}
            />
          </Field>

          <Field label={tr.editor.suitLengths}>
            <div className="flex flex-col gap-2">
              {SUITS.map((suit) => (
                <RangeField
                  key={suit}
                  label={
                    <>
                      <Suit suit={suit} size={14} />
                      {tr.suitNames[suit]}
                    </>
                  }
                  name={`${seatName} ${tr.suitNames[suit]}`}
                  value={draft.suits[suit]}
                  bounds={LENGTH_BOUNDS}
                  onChange={(range) => set({ suits: { ...draft.suits, [suit]: range } })}
                />
              ))}
            </div>
          </Field>

          <Field label={tr.editor.anySuit}>
            <ChipGroup
              label={`${seatName} ${tr.editor.anySuit}`}
              options={SUITS}
              selected={draft.anySuits}
              render={(suit) => <Suit suit={suit} size={16} />}
              onChange={(anySuits) => set({ anySuits })}
            />
            {draft.anySuits.length > 0 && (
              <RangeField
                label={tr.editor.anySuitLength}
                name={`${seatName} ${tr.editor.anySuitLength}`}
                value={draft.anyLength}
                bounds={LENGTH_BOUNDS}
                onChange={(anyLength) => set({ anyLength })}
              />
            )}
          </Field>

          {topicSuitEnabled && (
            <div className="flex flex-col gap-2">
              <RangeField
                label={tr.editor.topicSuitLength}
                name={`${seatName} ${tr.editor.topicSuitLength}`}
                value={draft.topicSuit}
                bounds={LENGTH_BOUNDS}
                onChange={(topicSuit) => set({ topicSuit })}
              />
              <Checkbox
                checked={draft.topicSuitLongest}
                onChange={(event) => set({ topicSuitLongest: event.target.checked })}
                label={tr.editor.topicSuitLongest}
              />
            </div>
          )}

          <details className="border-line rounded-[var(--radius-md)] border p-3">
            <summary className="text-ink cursor-pointer text-sm font-semibold">
              {tr.editor.advanced}
            </summary>
            <div className="mt-3 flex flex-col gap-3">
              <RangeField
                label={tr.editor.controls}
                name={`${seatName} ${tr.editor.controls}`}
                value={draft.controls}
                bounds={CONTROLS_BOUNDS}
                onChange={(controls) => set({ controls })}
              />
              <RangeField
                label={tr.editor.ltc}
                name={`${seatName} ${tr.editor.ltc}`}
                value={draft.ltc}
                bounds={LTC_BOUNDS}
                onChange={(ltc) => set({ ltc })}
              />

              <Field label={tr.editor.exclude} help={tr.editor.excludeHelp}>
                {draft.exclude.map((ex, i) => (
                  <div
                    key={i}
                    className="border-line-strong flex flex-col gap-2 rounded-[var(--radius-md)] border border-dashed p-3"
                  >
                    <RangeField
                      label={tr.editor.hcp}
                      name={`${seatName} ${tr.editor.exclude} ${i + 1} ${tr.editor.hcp}`}
                      value={ex.hcp}
                      bounds={SEAT_HCP_BOUNDS}
                      onChange={(hcp) =>
                        set({ exclude: draft.exclude.map((e, j) => (j === i ? { ...e, hcp } : e)) })
                      }
                    />
                    <ChipGroup
                      label={`${seatName} ${tr.editor.exclude} ${i + 1} ${tr.editor.shape}`}
                      options={SHAPE_CLASSES}
                      selected={ex.shapes}
                      render={(cls) => tr.shapes[cls]}
                      onChange={(shapes) =>
                        set({
                          exclude: draft.exclude.map((e, j) => (j === i ? { ...e, shapes } : e)),
                        })
                      }
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      className="self-start"
                      onClick={() => set({ exclude: draft.exclude.filter((_, j) => j !== i) })}
                    >
                      {tr.editor.remove}
                    </Button>
                  </div>
                ))}
                <Button
                  size="sm"
                  className="self-start"
                  onClick={() => set({ exclude: [...draft.exclude, emptyExcludeDraft()] })}
                >
                  + {tr.editor.addExclude}
                </Button>
              </Field>
            </div>
          </details>
        </>
      )}
    </section>
  )
}
