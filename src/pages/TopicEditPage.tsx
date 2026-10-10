import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { DealCard } from '../components/DealCard'
import { dealCaption } from '../components/format'
import { TopicForm } from '../components/topicForm/TopicForm'
import {
  draftToRecipe,
  emptyDraft,
  recipeToDraft,
  validateDraft,
  type TopicDraft,
} from '../data/topicDraft'
import { useDealGenerator } from '../hooks/useDealGenerator'
import { useTopics } from '../hooks/topicsContext'
import { tr } from '../i18n/tr'

const TRY_COUNT = 4

/** /topics/new, /topics/new?from=<id> (kopya) ve /topics/<id> (düzenle). */
export function TopicEditPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { topics, loading } = useTopics()

  if (loading) return <p className="text-slate-500">{tr.topics.loading}</p>

  const fromId = searchParams.get('from')
  let initial: TopicDraft
  if (id) {
    const topic = topics.find((t) => t.id === id)
    if (!topic) return <p className="text-slate-700">{tr.topics.notFound}</p>
    initial = recipeToDraft(topic.recipe)
  } else {
    const source = fromId ? topics.find((t) => t.id === fromId) : undefined
    const newId = crypto.randomUUID()
    initial = source
      ? recipeToDraft({
          ...source.recipe,
          id: newId,
          name: source.recipe.name + tr.topics.copySuffix,
        })
      : emptyDraft(newId)
  }

  const categories = [...new Set(topics.map((t) => t.recipe.category))]
  return (
    <TopicEditor
      key={id ?? fromId ?? 'new'}
      initial={initial}
      isNew={!id}
      categories={categories}
    />
  )
}

interface TopicEditorProps {
  initial: TopicDraft
  isNew: boolean
  categories: string[]
}

function TopicEditor({ initial, isNew, categories }: TopicEditorProps) {
  const navigate = useNavigate()
  const { saveRecipe } = useTopics()
  const [draft, setDraft] = useState(initial)
  const [showErrors, setShowErrors] = useState(false)
  const [saving, setSaving] = useState(false)
  const { state: tryState, generate } = useDealGenerator()

  const errors = validateDraft(draft)

  async function handleSave() {
    if (errors.length) {
      setShowErrors(true)
      return
    }
    setSaving(true)
    try {
      await saveRecipe(draftToRecipe(draft))
      navigate('/topics')
    } finally {
      setSaving(false)
    }
  }

  function handleTry() {
    if (errors.length) {
      setShowErrors(true)
      return
    }
    generate({ recipe: draftToRecipe(draft), count: TRY_COUNT })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-slate-900">
          {isNew ? tr.editor.newTitle : tr.editor.editTitle}
        </h2>
        <Link to="/topics" className="text-sm font-medium text-slate-600 hover:underline">
          ← {tr.topics.title}
        </Link>
      </div>

      <TopicForm draft={draft} categories={categories} onChange={setDraft} />

      {showErrors && errors.length > 0 && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <p className="font-semibold">{tr.editor.fixErrors}</p>
          <ul className="mt-1 list-disc pl-5">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-emerald-700 px-5 py-2 font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {saving ? tr.editor.saving : tr.editor.save}
        </button>
        <button
          type="button"
          onClick={handleTry}
          disabled={tryState.status === 'running'}
          className="rounded-md border border-emerald-700 px-5 py-2 font-semibold text-emerald-800 hover:bg-emerald-50 disabled:opacity-50"
        >
          {tr.editor.try}
        </button>
        <Link to="/topics" className="px-2 py-2 text-sm font-medium text-slate-600 hover:underline">
          {tr.editor.cancel}
        </Link>
        <span className="text-xs text-slate-500">{tr.editor.tryHelp}</span>
      </div>

      {tryState.status === 'running' && (
        <p className="text-sm text-slate-600">
          {tr.generate.running}{' '}
          {tryState.progress && tr.generate.attempts(tryState.progress.attempts)}
        </p>
      )}
      {tryState.status === 'error' && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {tr.generate.error} {tryState.message}
        </p>
      )}
      {tryState.status === 'done' && (
        <section className="flex flex-col gap-3">
          <div
            className={`rounded-md p-3 text-sm ${
              tryState.result.status === 'exhausted'
                ? 'border border-amber-300 bg-amber-50 text-amber-900'
                : 'bg-emerald-50 text-emerald-900'
            }`}
          >
            {tryState.result.status === 'exhausted' && (
              <p className="font-semibold">{tr.generate.exhausted}</p>
            )}
            <p>
              {tr.generate.observed(tryState.result.observedProbability, tryState.result.attempts)}
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {tryState.result.deals.map((deal) => (
              <li
                key={deal.board}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
              >
                <h3 className="text-xs font-medium text-slate-500">{dealCaption(deal)}</h3>
                <DealCard deal={deal} focusOnly={false} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
