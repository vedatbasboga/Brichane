import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import { CustomTopicDialog } from '../components/CustomTopicDialog'
import { DealDialog } from '../components/DealDialog'
import { DealGrid } from '../components/DealGrid'
import { PbnButton } from '../components/PbnButton'
import { PdfButton } from '../components/PdfButton'
import { SaveSetDialog } from '../components/SaveSetDialog'
import { ShareButton } from '../components/ShareButton'
import { TopicSelect } from '../components/TopicSelect'
import { buildNewSet, defaultSetTitle } from '../data/savedSet'
import { parseShareParams, toShareParams, type ShareWarning } from '../data/shareLink'
import { draftToRecipe, recipeToDraft, type TopicDraft } from '../data/topicDraft'
import { CUSTOM_TOPIC_ID, DEFAULT_TOPICS, MAX_DEALS } from '../data/topics'
import { dealToPbn, type Recipe } from '../engine'
import { useDdAnalysis } from '../hooks/useDdAnalysis'
import { useDealGenerator } from '../hooks/useDealGenerator'
import { tr } from '../i18n/tr'

const DEFAULT_COUNT = 16

interface GeneratedWith {
  recipe: Recipe
  topicId: string
  count: number
}

export function GeneratePage() {
  const topics = DEFAULT_TOPICS
  const [searchParams, setSearchParams] = useSearchParams()
  // Paylaşılan bağlantıyla gelindiyse form o setle başlar ve set kendiliğinden üretilir.
  const [shared] = useState(() => parseShareParams(searchParams, topics))
  const sharedTarget = shared.status === 'ok' ? shared.target : null
  const sharedIsCustom = sharedTarget?.topicId === CUSTOM_TOPIC_ID

  const [topicId, setTopicId] = useState(sharedTarget?.topicId ?? topics[0].id)
  /** Son seçilen hazır konu; özel dağılım bunun ayarlarıyla başlar. */
  const [presetId, setPresetId] = useState(
    sharedTarget && !sharedIsCustom ? sharedTarget.topicId : topics[0].id,
  )
  const [customDraft, setCustomDraft] = useState<TopicDraft | null>(
    sharedTarget && sharedIsCustom ? recipeToDraft(sharedTarget.recipe) : null,
  )
  const [customOpen, setCustomOpen] = useState(false)
  const [countText, setCountText] = useState(String(sharedTarget?.count ?? DEFAULT_COUNT))
  const [focusOnly, setFocusOnly] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  /** Son üretimin tarifi; kayıt ve paylaşım bununla yapılır (sonradan konu değişse bile). */
  const [generatedWith, setGeneratedWith] = useState<GeneratedWith | null>(
    sharedTarget
      ? { recipe: sharedTarget.recipe, topicId: sharedTarget.topicId, count: sharedTarget.count }
      : null,
  )
  const [linkNotice, setLinkNotice] = useState<ShareWarning | 'invalid' | null>(
    shared.status === 'invalid' ? 'invalid' : shared.status === 'ok' ? shared.warning : null,
  )
  const [saveOpen, setSaveOpen] = useState(false)
  const [savedSetId, setSavedSetId] = useState<string | null>(null)
  const { state, generate, cancel } = useDealGenerator()

  const preset = topics.find((t) => t.id === presetId) ?? topics[0]
  const isCustom = topicId === CUSTOM_TOPIC_ID && customDraft !== null
  const recipe: Recipe = isCustom ? draftToRecipe(customDraft) : preset
  const count = Number(countText)
  const countValid = Number.isInteger(count) && count >= 1 && count <= MAX_DEALS
  const running = state.status === 'running'
  const result = state.status === 'done' ? state.result : null
  const shareParams =
    result && generatedWith ? toShareParams({ ...generatedWith, seed: result.seed }) : null
  const shareUrl = shareParams ? `${window.location.origin}/?${shareParams}` : null

  const ddJobs = useMemo(
    () =>
      result?.deals.length
        ? result.deals.map((d) => ({ pbn: dealToPbn(d.hands), dealer: d.dealer, vul: d.vul }))
        : null,
    [result],
  )
  const dd = useDdAnalysis(ddJobs)
  const ddComplete = dd.total > 0 && dd.done === dd.total

  useEffect(() => {
    if (sharedTarget) {
      const { recipe: sharedRecipe, count: sharedCount, seed } = sharedTarget
      generate({ recipe: sharedRecipe, count: sharedCount, seed })
    }
  }, [sharedTarget, generate])

  // Adres çubuğu her zaman son setin bağlantısını gösterir; yenileyince aynı eller gelir.
  const shareQuery = shareParams?.toString()
  useEffect(() => {
    if (shareQuery) setSearchParams(new URLSearchParams(shareQuery), { replace: true })
  }, [shareQuery, setSearchParams])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!countValid) return
    setSelected(null)
    setSavedSetId(null)
    setLinkNotice(null)
    setGeneratedWith({ recipe, topicId: isCustom ? CUSTOM_TOPIC_ID : preset.id, count })
    generate({ recipe, count })
  }

  async function handleSave(title: string, notes: string) {
    if (!result || !generatedWith) return
    // Firebase yalnızca kaydederken yüklenir; ana sayfa hafif kalır.
    const { createSet } = await import('../firebase/sets')
    const { recipe: savedRecipe, topicId: savedTopicId } = generatedWith
    const id = await createSet(
      buildNewSet({
        title,
        notes,
        topicId: savedTopicId,
        recipe: savedRecipe,
        result,
        dd: ddComplete ? dd.results : undefined,
      }),
    )
    setSavedSetId(id)
    setSaveOpen(false)
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

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[3fr_1fr_auto] sm:items-start"
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

      {linkNotice && (
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {tr.share[linkNotice]}
        </p>
      )}

      {state.status === 'running' && (
        <div className="flex flex-col gap-1">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={state.progress?.count ?? count}
            aria-valuenow={state.progress?.found ?? 0}
            className="h-2 overflow-hidden rounded-full bg-slate-200"
          >
            <div
              className="h-full bg-emerald-600 transition-[width]"
              style={{
                width: `${state.progress ? (state.progress.found / state.progress.count) * 100 : 0}%`,
              }}
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

      {state.status === 'idle' && !sharedTarget && (
        <p className="text-center text-slate-500">{tr.generate.empty}</p>
      )}

      {result && generatedWith && (
        <section className="flex flex-col gap-4">
          {result.status === 'exhausted' && (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-semibold">{tr.generate.exhausted}</p>
              {result.deals.length > 0 && (
                <p>{tr.generate.exhaustedPartial(result.deals.length, generatedWith.count)}</p>
              )}
              <p>{tr.generate.observed(result.observedProbability, result.attempts)}</p>
            </div>
          )}

          {result.deals.length > 0 && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="flex flex-wrap items-baseline gap-x-3 text-sm">
                  <span className="font-semibold text-slate-900">
                    {generatedWith.recipe.name} · {tr.generate.summary(result.deals.length)}
                  </span>
                  {dd.error ? (
                    <span className="text-red-700">
                      {tr.dd.error} {dd.error}
                    </span>
                  ) : (
                    !ddComplete && (
                      <span className="text-slate-500">{tr.dd.progress(dd.done, dd.total)}</span>
                    )
                  )}
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={focusOnly}
                      onChange={(event) => setFocusOnly(event.target.checked)}
                      className="size-4 accent-emerald-700"
                    />
                    {tr.generate.focusOnly}
                  </label>
                  {shareUrl && <ShareButton url={shareUrl} title={generatedWith.recipe.name} />}
                  <PdfButton
                    getOptions={() => ({
                      title: generatedWith.recipe.name,
                      topicName: generatedWith.recipe.name,
                      deals: result.deals,
                      dd: dd.results,
                      focusOnly,
                      shareUrl: shareUrl ?? undefined,
                    })}
                  />
                  <PbnButton
                    getOptions={() => ({
                      event: generatedWith.recipe.name,
                      date: new Date(),
                      deals: result.deals,
                      dd: dd.results,
                      sourceUrl: shareUrl ?? undefined,
                    })}
                  />
                  {savedSetId ? (
                    <span className="text-sm text-emerald-800">
                      {tr.save.saved}{' '}
                      <Link
                        to={`/sets/${savedSetId}`}
                        className="font-semibold underline hover:text-emerald-950"
                      >
                        {tr.save.open}
                      </Link>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSaveOpen(true)}
                      className="rounded-md bg-emerald-700 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-800"
                    >
                      {tr.save.button}
                    </button>
                  )}
                </div>
              </div>

              <DealGrid
                deals={result.deals}
                focusOnly={focusOnly}
                onOpen={setSelected}
                dd={dd.results}
              />

              {saveOpen && (
                <SaveSetDialog
                  defaultTitle={defaultSetTitle(generatedWith.recipe.name, new Date())}
                  onSave={handleSave}
                  onCancel={() => setSaveOpen(false)}
                />
              )}

              <DealDialog
                deals={result.deals}
                index={selected}
                focusOnly={focusOnly}
                onClose={() => setSelected(null)}
                onNavigate={setSelected}
                dd={dd.results}
              />
            </>
          )}
        </section>
      )}
    </div>
  )
}
