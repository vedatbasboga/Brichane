import { PAIRS, SEATS, SUITS, type Seat } from '../../engine'
import type { TopicDraft } from '../../data/topicDraft'
import { tr } from '../../i18n/tr'
import { SuitSymbol } from '../SuitSymbol'
import { ChipGroup, Field } from './FormControls'
import { PairEditor } from './PairEditor'
import { SeatEditor } from './SeatEditor'

interface TopicFormProps {
  draft: TopicDraft
  onChange: (draft: TopicDraft) => void
}

const selectClass = 'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900'

export function TopicForm({ draft, onChange }: TopicFormProps) {
  const set = (patch: Partial<TopicDraft>) => onChange({ ...draft, ...patch })

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2">
        <h2 className="text-lg font-semibold text-slate-900 md:col-span-2">{tr.editor.general}</h2>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">{tr.editor.dealer}</span>
          <select
            value={draft.dealer}
            onChange={(event) => set({ dealer: event.target.value as Seat })}
            className={selectClass}
          >
            {SEATS.map((seat) => (
              <option key={seat} value={seat}>
                {tr.seatNames[seat]}
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-500">{tr.editor.dealerHelp}</span>
        </label>
        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-sm font-medium text-slate-700">
            {tr.editor.placement}
          </legend>
          {(['balanced', 'fixed'] as const).map((placement) => (
            <label key={placement} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="placement"
                checked={draft.placement === placement}
                onChange={() => set({ placement })}
                className="accent-emerald-700"
              />
              {placement === 'balanced' ? tr.editor.placementBalanced : tr.editor.placementFixed}
            </label>
          ))}
          <span className="text-xs text-slate-500">{tr.editor.placementHelp}</span>
        </fieldset>
        <div className="md:col-span-2">
          <Field label={tr.editor.topicSuit} help={tr.editor.topicSuitHelp}>
            <ChipGroup
              label={tr.editor.topicSuit}
              options={SUITS}
              selected={draft.topicSuits}
              render={(suit) => <SuitSymbol suit={suit} className="text-base" />}
              onChange={(topicSuits) => set({ topicSuits })}
            />
          </Field>
        </div>
      </section>

      <div className="grid items-start gap-4 md:grid-cols-2">
        {SEATS.map((seat) => (
          <SeatEditor
            key={seat}
            seat={seat}
            isDealer={draft.dealer === seat}
            topicSuitEnabled={draft.topicSuits.length > 0}
            draft={draft.seats[seat]}
            onChange={(seatDraft) => set({ seats: { ...draft.seats, [seat]: seatDraft } })}
          />
        ))}
      </div>

      <div className="grid items-start gap-4 md:grid-cols-2">
        {PAIRS.map((pair) => (
          <PairEditor
            key={pair}
            pair={pair}
            draft={draft.pairs[pair]}
            onChange={(pairDraft) => set({ pairs: { ...draft.pairs, [pair]: pairDraft } })}
          />
        ))}
      </div>
    </div>
  )
}
