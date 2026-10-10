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
import { SuitSymbol } from '../SuitSymbol'
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
      className={`flex flex-col gap-4 rounded-xl border p-4 ${
        draft.enabled ? 'border-emerald-300 bg-white' : 'border-slate-200 bg-slate-50'
      }`}
    >
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={draft.enabled}
          onChange={(event) => set({ enabled: event.target.checked })}
          className="size-4 accent-emerald-700"
        />
        <span className="font-semibold text-slate-900">
          {seatName}
          {isDealer && (
            <span className="ml-2 text-xs font-medium text-emerald-700">({tr.board.dealer})</span>
          )}
        </span>
        <span className="text-sm text-slate-500">— {tr.editor.seatEnabled}</span>
      </label>

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
                      <SuitSymbol suit={suit} className="mr-1" />
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
              render={(suit) => <SuitSymbol suit={suit} className="text-base" />}
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
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={draft.topicSuitLongest}
                  onChange={(event) => set({ topicSuitLongest: event.target.checked })}
                  className="size-4 accent-emerald-700"
                />
                {tr.editor.topicSuitLongest}
              </label>
            </div>
          )}

          <details className="group rounded-lg border border-slate-200 p-3">
            <summary className="cursor-pointer text-sm font-medium text-slate-700">
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
                    className="flex flex-col gap-2 rounded-md border border-dashed border-slate-300 p-2"
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
                    <button
                      type="button"
                      onClick={() => set({ exclude: draft.exclude.filter((_, j) => j !== i) })}
                      className="self-start text-sm text-red-700 hover:underline"
                    >
                      {tr.editor.remove}
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => set({ exclude: [...draft.exclude, emptyExcludeDraft()] })}
                  className="self-start rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
                >
                  + {tr.editor.addExclude}
                </button>
              </Field>
            </div>
          </details>
        </>
      )}
    </section>
  )
}
