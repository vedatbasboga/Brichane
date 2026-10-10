import { SUITS, type Pair } from '../../engine'
import { LENGTH_BOUNDS, PAIR_HCP_BOUNDS, type PairDraft } from '../../data/topicDraft'
import { tr } from '../../i18n/tr'
import { SuitSymbol } from '../SuitSymbol'
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
        <span className="font-semibold text-slate-900">{title}</span>
        <span className="text-sm text-slate-500">— {tr.editor.pairEnabled}</span>
      </label>

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
              render={(suit) => <SuitSymbol suit={suit} className="text-base" />}
              onChange={(fitSuits) => set({ fitSuits })}
            />
          </Field>
        </>
      )}
    </section>
  )
}
