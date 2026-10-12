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
import { Button } from '../components/ui/Button'
import { Checkbox } from '../components/ui/Checkbox'
import { Field, Input } from '../components/ui/Field'
import { Notice } from '../components/ui/Notice'
import { Progress } from '../components/ui/Progress'
import { SuitText } from '../components/ui/SuitText'
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
  /** Üret'ten sonra form gizlenir, yalnızca sonuçlar görünür (paylaşılan bağlantıyla da). */
  const [showResults, setShowResults] = useState(sharedTarget !== null)
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
    // Forma dönülünce (Geri) adres çubuğu temiz kalır.
    if (shareQuery && showResults) {
      setSearchParams(new URLSearchParams(shareQuery), { replace: true })
    }
  }, [shareQuery, showResults, setSearchParams])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!countValid) return
    setSelected(null)
    setSavedSetId(null)
    setLinkNotice(null)
    setGeneratedWith({ recipe, topicId: isCustom ? CUSTOM_TOPIC_ID : preset.id, count })
    generate({ recipe, count })
    setShowResults(true)
    window.scrollTo({ top: 0 })
  }

  /** Forma dön; seçimler korunur, adres çubuğundaki set bağlantısı temizlenir. */
  function handleBack() {
    if (running) cancel()
    setShowResults(false)
    setSelected(null)
    setLinkNotice(null)
    setSearchParams(new URLSearchParams(), { replace: true })
    window.scrollTo({ top: 0 })
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

  const progressLabel =
    state.status === 'running' && state.progress
      ? `${tr.generate.running} ${tr.generate.progress(state.progress.found, state.progress.count)} · ${tr.generate.attempts(state.progress.attempts)}`
      : tr.generate.running

  return (
    <div className="flex flex-col gap-6">
      {!showResults && (
        <>
          <h1 className="bh-display">{tr.generate.title}</h1>

          <form
            onSubmit={handleSubmit}
            className="bh-panel grid gap-4 sm:grid-cols-[minmax(0,3fr)_minmax(0,1fr)_auto] sm:items-start"
          >
            <div className="bh-field">
              <label htmlFor="topic" className="bh-field-label">
                {tr.generate.topic}
              </label>
              <TopicSelect
                id="topic"
                topics={topics}
                value={isCustom ? CUSTOM_TOPIC_ID : preset.id}
                onChange={handleTopicChange}
              />
              {isCustom ? (
                <p className="bh-field-hint">
                  {tr.generate.customSummary}{' '}
                  <button
                    type="button"
                    onClick={() => setCustomOpen(true)}
                    className="bh-link whitespace-nowrap"
                  >
                    {tr.generate.customEdit}
                  </button>
                </p>
              ) : (
                preset.description && (
                  <p className="bh-field-hint">
                    <SuitText text={preset.description} />
                  </p>
                )
              )}
            </div>

            <Field
              label={tr.generate.count}
              error={countValid ? undefined : tr.generate.countInvalid(MAX_DEALS)}
            >
              <Input
                id="count"
                type="number"
                inputMode="numeric"
                min={1}
                max={MAX_DEALS}
                value={countText}
                onChange={(event) => setCountText(event.target.value)}
              />
            </Field>

            <div className="sm:pt-[22px]">
              {running ? (
                <Button onClick={cancel} className="w-full sm:w-auto">
                  {tr.generate.cancel}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  type="submit"
                  disabled={!countValid}
                  className="w-full sm:w-auto"
                >
                  {tr.generate.submit}
                </Button>
              )}
            </div>
          </form>

          {state.status === 'idle' && <Notice>{tr.generate.empty}</Notice>}
        </>
      )}

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

      {showResults && (
        <>
          <Button variant="quiet" size="sm" className="-ml-3 self-start" onClick={handleBack}>
            ← {tr.generate.back}
          </Button>

          {linkNotice && (
            <Notice tone={linkNotice === 'invalid' ? 'warning' : 'info'}>
              {tr.share[linkNotice]}
            </Notice>
          )}

          {state.status === 'running' && (
            <Progress
              value={state.progress?.found ?? 0}
              max={state.progress?.count ?? count}
              label={progressLabel}
            />
          )}

          {state.status === 'error' && (
            <Notice tone="danger">
              {tr.generate.error} {state.message}
            </Notice>
          )}

          {result && generatedWith && (
            <section className="flex flex-col gap-4">
              {result.status === 'exhausted' && (
                <Notice tone="warning" title={tr.generate.exhausted}>
                  {result.deals.length > 0 && (
                    <p>{tr.generate.exhaustedPartial(result.deals.length, generatedWith.count)}</p>
                  )}
                  <p>{tr.generate.observed(result.observedProbability, result.attempts)}</p>
                </Notice>
              )}

              {result.deals.length > 0 && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="m-0 flex flex-wrap items-baseline gap-x-3">
                      <span className="font-semibold">
                        {generatedWith.recipe.name} · {tr.generate.summary(result.deals.length)}
                      </span>
                      {dd.error ? (
                        <span className="text-danger-ink text-[13px]">
                          {tr.dd.error} {dd.error}
                        </span>
                      ) : (
                        !ddComplete && (
                          <span className="text-ink-muted text-[13px] tabular-nums">
                            {tr.dd.progress(dd.done, dd.total)}
                          </span>
                        )
                      )}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Checkbox
                        checked={focusOnly}
                        onChange={(event) => setFocusOnly(event.target.checked)}
                        label={tr.generate.focusOnly}
                        className="mr-2"
                      />
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
                      {!savedSetId && (
                        <Button onClick={() => setSaveOpen(true)}>{tr.save.button}</Button>
                      )}
                    </div>
                  </div>

                  {savedSetId && (
                    <Notice
                      tone="success"
                      title={tr.save.saved}
                      action={
                        <Link to={`/sets/${savedSetId}`} className="bh-link">
                          {tr.save.open}
                        </Link>
                      }
                    />
                  )}

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
        </>
      )}
    </div>
  )
}
