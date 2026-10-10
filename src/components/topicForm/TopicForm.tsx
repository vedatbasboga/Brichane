import { PAIRS, SEATS, SUITS, type Seat } from '../../engine'
import type { TopicDraft } from '../../data/topicDraft'
import { tr } from '../../i18n/tr'
import { Field as LabeledField, Select } from '../ui/Field'
import { Suit } from '../ui/Suit'
import { ChipGroup, Field } from './FormControls'
import { PairEditor } from './PairEditor'
import { SeatEditor } from './SeatEditor'

interface TopicFormProps {
  draft: TopicDraft
  onChange: (draft: TopicDraft) => void
}

export function TopicForm({ draft, onChange }: TopicFormProps) {
  const set = (patch: Partial<TopicDraft>) => onChange({ ...draft, ...patch })

  return (
    <div className="flex flex-col gap-4">
      <section className="bh-panel grid gap-4 md:grid-cols-2">
        <h3 className="bh-heading md:col-span-2">{tr.editor.general}</h3>
        <LabeledField label={tr.editor.dealer} hint={tr.editor.dealerHelp}>
          <Select
            value={draft.dealer}
            onChange={(event) => set({ dealer: event.target.value as Seat })}
          >
            {SEATS.map((seat) => (
              <option key={seat} value={seat}>
                {tr.seatNames[seat]}
              </option>
            ))}
          </Select>
        </LabeledField>
        <fieldset className="bh-field">
          <legend className="bh-field-label mb-1.5">{tr.editor.placement}</legend>
          {(['balanced', 'fixed'] as const).map((placement) => (
            <label
              key={placement}
              className="flex min-h-8 cursor-pointer items-center gap-2 text-sm"
            >
              <input
                type="radio"
                name="placement"
                checked={draft.placement === placement}
                onChange={() => set({ placement })}
                className="size-4 accent-[var(--felt)]"
              />
              {placement === 'balanced' ? tr.editor.placementBalanced : tr.editor.placementFixed}
            </label>
          ))}
          <p className="bh-field-hint">{tr.editor.placementHelp}</p>
        </fieldset>
        <div className="md:col-span-2">
          <Field label={tr.editor.topicSuit} help={tr.editor.topicSuitHelp}>
            <ChipGroup
              label={tr.editor.topicSuit}
              options={SUITS}
              selected={draft.topicSuits}
              render={(suit) => <Suit suit={suit} size={16} />}
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
