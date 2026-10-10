import { SUITS, type Pair } from '../../engine'
import { LENGTH_BOUNDS, PAIR_HCP_BOUNDS, type PairDraft } from '../../data/topicDraft'
import { tr } from '../../i18n/tr'
import { Checkbox } from '../ui/Checkbox'
import { Suit } from '../ui/Suit'
import { ChipGroup, Field, RangeField } from './FormControls'

interface PairEditorProps {
  pair: Pair
  draft: PairDraft
  onChange: (draft: PairDraft) => void
}

export function PairEditor({ pair, draft, onChange }: PairEditorProps) {
  const set = (patch: Partial<PairDraft>) => onChange({ ...draft, ...patch })
  const title = tr.editor.pairSection(tr.pairs[pair])

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
            <span className="bh-heading">{title}</span>
            <span className="text-ink-muted text-[13px]">{tr.editor.pairEnabled}</span>
          </span>
        }
      />

      {draft.enabled && (
        <>
          <RangeField
            label={tr.editor.pairHcp}
            name={`${title} ${tr.editor.pairHcp}`}
            value={draft.hcp}
            bounds={PAIR_HCP_BOUNDS}
            onChange={(hcp) => set({ hcp })}
          />
          <RangeField
            label={tr.editor.fit}
            name={`${title} ${tr.editor.fit}`}
            value={draft.fitLength}
            bounds={LENGTH_BOUNDS}
            onChange={(fitLength) => set({ fitLength })}
          />
          <Field label={tr.editor.fitSuits}>
            <ChipGroup
              label={`${title} ${tr.editor.fitSuits}`}
              options={SUITS}
              selected={draft.fitSuits}
              render={(suit) => <Suit suit={suit} size={16} />}
              onChange={(fitSuits) => set({ fitSuits })}
            />
          </Field>
        </>
      )}
    </section>
  )
}
