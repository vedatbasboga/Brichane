import { useState, type FormEvent } from 'react'
import { CustomTopicDialog } from '../components/CustomTopicDialog'
import { DealCard } from '../components/DealCard'
import { DealDialog } from '../components/DealDialog'
import { dealCaption } from '../components/format'
import { TopicSelect } from '../components/TopicSelect'
import { CUSTOM_TOPIC_ID, DEFAULT_TOPICS } from '../data/topics'
import { draftToRecipe, recipeToDraft, type TopicDraft } from '../data/topicDraft'
import type { Recipe } from '../engine'
import { useDealGenerator } from '../hooks/useDealGenerator'
import { tr } from '../i18n/tr'

const MAX_DEALS = 128
const DEFAULT_COUNT = 16

export function GeneratePage() {
  const topics = DEFAULT_TOPICS
  const [topicId, setTopicId] = useState(topics[0].id)
  /** Son seçilen hazır konu; özel dağılım bunun ayarlarıyla başlar. */
  const [presetId, setPresetId] = useState(topics[0].id)
  const [customDraft, setCustomDraft] = useState<TopicDraft | null>(null)
  const [customOpen, setCustomOpen] = useState(false)
  const [countText, setCountText] = useState(String(DEFAULT_COUNT))
  const [seed, setSeed] = useState('')
  const [focusOnly, setFocusOnly] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const { state, generate, cancel } = useDealGenerator()

  const preset = topics.find((t) => t.id === presetId) ?? topics[0]
  const isCustom = topicId === CUSTOM_TOPIC_ID && customDraft !== null
  const recipe: Recipe = isCustom ? draftToRecipe(customDraft) : preset
  const count = Number(countText)
  const countValid = Number.isInteger(count) && count >= 1 && count <= MAX_DEALS
  const running = state.status === 'running'
  const result = state.status === 'done' ? state.result : null

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!countValid) return
    setSelected(null)
    generate({ recipe, count, seed })
  }

  function handleTopicChange(id: string) {
    if (id === CUSTOM_TOPIC_ID) {
      setCustomOpen(true)
      return
    }
    setTopicId(id)
    setPresetId(id)
  }

  function customInitial(): TopicDraft {
    return (
      customDraft ??
      recipeToDraft({
        ...preset,
        id: CUSTOM_TOPIC_ID,
        name: tr.generate.customTitle,
        category: tr.generate.customGroup,
        description: undefined,
      })
    )
  }

  async function copySeed(value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Pano izni yoksa sessizce geç; tohum ekranda zaten görünüyor.
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-start"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="topic" className="text-sm font-medium text-slate-700">
            {tr.generate.topic}
          </label>
          <TopicSelect
            id="topic"
            topics={topics}
            value={isCustom ? CUSTOM_TOPIC_ID : preset.id}
            onChange={handleTopicChange}
          />
          {isCustom ? (
            <p className="text-xs text-slate-500">
              {tr.generate.customSummary}{' '}
              <button
                type="button"
                onClick={() => setCustomOpen(true)}
                className="font-medium whitespace-nowrap text-emerald-700 hover:underline"
              >
                {tr.generate.customEdit}
              </button>
            </p>
          ) : (
            preset.description && <p className="text-xs text-slate-500">{preset.description}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="count" className="text-sm font-medium text-slate-700">
            {tr.generate.count}
          </label>
          <input
            id="count"
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_DEALS}
            value={countText}
            onChange={(event) => setCountText(event.target.value)}
            aria-invalid={!countValid}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 aria-invalid:border-red-500"
          />
          {!countValid && (
            <p className="text-xs text-red-600">{tr.generate.countInvalid(MAX_DEALS)}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="seed" className="text-sm font-medium text-slate-700">
            {tr.generate.seed}
          </label>
          <input
            id="seed"
            type="text"
            value={seed}
            onChange={(event) => setSeed(event.target.value)}
            placeholder={tr.generate.seedPlaceholder}
            autoComplete="off"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          />
          <p className="text-xs text-slate-500">{tr.generate.seedHelp}</p>
        </div>

        <div className="flex flex-col gap-1 sm:pt-6">
          {running ? (
            <button
              type="button"
              onClick={cancel}
              className="rounded-md border border-slate-300 px-5 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              {tr.generate.cancel}
            </button>
          ) : (
            <button
              type="submit"
              disabled={!countValid}
              className="rounded-md bg-emerald-700 px-5 py-2 font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              {tr.generate.submit}
            </button>
          )}
        </div>
      </form>

      {customOpen && (
        <CustomTopicDialog
          initial={customInitial()}
          onApply={(draft) => {
            setCustomDraft(draft)
            setTopicId(CUSTOM_TOPIC_ID)
            setCustomOpen(false)
          }}
          onCancel={() => setCustomOpen(false)}
        />
      )}

      {state.status === 'running' && (
        <div className="flex flex-col gap-1">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={count}
            aria-valuenow={state.progress?.found ?? 0}
            className="h-2 overflow-hidden rounded-full bg-slate-200"
          >
            <div
              className="h-full bg-emerald-600 transition-[width]"
              style={{ width: `${((state.progress?.found ?? 0) / count) * 100}%` }}
            />
          </div>
          <p className="text-sm text-slate-600">
            {tr.generate.running}{' '}
            {state.progress &&
              `${tr.generate.progress(state.progress.found, state.progress.count)} · ${tr.generate.attempts(state.progress.attempts)}`}
          </p>
        </div>
      )}

      {state.status === 'error' && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {tr.generate.error} {state.message}
        </p>
      )}

      {state.status === 'idle' && <p className="text-center text-slate-500">{tr.generate.empty}</p>}

      {result && (
        <section className="flex flex-col gap-4">
          {result.status === 'exhausted' && (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-semibold">{tr.generate.exhausted}</p>
              {result.deals.length > 0 && (
                <p>{tr.generate.exhaustedPartial(result.deals.length, count)}</p>
              )}
              <p>{tr.generate.observed(result.observedProbability, result.attempts)}</p>
            </div>
          )}

          {result.deals.length > 0 && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">
                    {tr.generate.summary(result.deals.length)}
                  </span>
                  <span>·</span>
                  <span>
                    {tr.generate.seed}:{' '}
                    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-900">
                      {result.seed}
                    </code>
                  </span>
                  <button
                    type="button"
                    onClick={() => copySeed(result.seed)}
                    className="rounded px-2 py-0.5 text-emerald-700 hover:bg-emerald-50"
                  >
                    {copied ? tr.generate.copied : tr.generate.copySeed}
                  </button>
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={focusOnly}
                    onChange={(event) => setFocusOnly(event.target.checked)}
                    className="size-4 accent-emerald-700"
                  />
                  {tr.generate.focusOnly}
                </label>
              </div>

              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {result.deals.map((deal, index) => (
                  <li key={deal.board}>
                    <article
                      onClick={() => setSelected(index)}
                      className="flex h-full cursor-pointer flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-emerald-400 hover:shadow"
                    >
                      <header className="flex items-center justify-between gap-2">
                        <h3 className="text-xs font-medium text-slate-500">{dealCaption(deal)}</h3>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            setSelected(index)
                          }}
                          className="rounded px-2 py-0.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                        >
                          {tr.board.open}
                        </button>
                      </header>
                      <DealCard deal={deal} focusOnly={focusOnly} />
                    </article>
                  </li>
                ))}
              </ul>

              <DealDialog
                deals={result.deals}
                index={selected}
                focusOnly={focusOnly}
                onClose={() => setSelected(null)}
                onNavigate={setSelected}
              />
            </>
          )}
        </section>
      )}
    </div>
  )
}
