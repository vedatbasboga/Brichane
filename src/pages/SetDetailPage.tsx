import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { DealDialog } from '../components/DealDialog'
import { DealGrid } from '../components/DealGrid'
import { PbnButton } from '../components/PbnButton'
import { PdfButton } from '../components/PdfButton'
import { ShareButton } from '../components/ShareButton'
import {
  MAX_BOARD_NOTE_LENGTH,
  MAX_NOTES_LENGTH,
  MAX_TITLE_LENGTH,
  ddFromSaved,
  ddToSaved,
  fromSavedDeal,
  type SavedSet,
} from '../data/savedSet'
import {
  copySet,
  getSet,
  loadBoardNotes,
  saveBoardNote,
  saveSetDd,
  updateSet,
} from '../firebase/sets'
import { useDdAnalysis } from '../hooks/useDdAnalysis'
import { tr } from '../i18n/tr'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'missing' }
  | { status: 'ready'; set: SavedSet; boardNotes: Record<number, string> }

const dateFormat = new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })

const errorMessage = (err: unknown) => (err instanceof Error ? err.message : String(err))

export default function SetDetailPage() {
  const { id = '' } = useParams()
  const [state, setState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    Promise.all([getSet(id), loadBoardNotes(id)])
      .then(([set, boardNotes]) => {
        if (cancelled) return
        setState(set ? { status: 'ready', set, boardNotes } : { status: 'missing' })
      })
      .catch((err) => !cancelled && setState({ status: 'error', message: errorMessage(err) }))
    return () => {
      cancelled = true
    }
  }, [id])

  if (state.status === 'loading') return <p className="text-slate-500">{tr.sets.loading}</p>
  if (state.status === 'missing') return <p className="text-slate-700">{tr.sets.notFound}</p>
  if (state.status === 'error') {
    return <p className="text-red-700">{`${tr.sets.loadError} ${state.message}`}</p>
  }
  return <SetDetail key={state.set.id} initialSet={state.set} initialNotes={state.boardNotes} />
}

interface SetDetailProps {
  initialSet: SavedSet
  initialNotes: Record<number, string>
}

function SetDetail({ initialSet, initialNotes }: SetDetailProps) {
  const navigate = useNavigate()
  const [set, setSet] = useState(initialSet)
  const [boardNotes, setBoardNotes] = useState(initialNotes)
  const [title, setTitle] = useState(initialSet.title)
  const [notes, setNotes] = useState(initialSet.notes)
  const [focusOnly, setFocusOnly] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)

  const deals = useMemo(() => set.deals.map(fromSavedDeal), [set.deals])
  // Kayıtlı çift kukla sonuçları varsa doğrudan kullanılır; yoksa hesaplanıp sete bir kez yazılır.
  const knownDd = useMemo(() => ddFromSaved(set), [set])
  const ddJobs = useMemo(
    () => set.deals.map((d) => ({ pbn: d.pbn, dealer: d.dealer, vul: d.vul })),
    [set.deals],
  )
  const dd = useDdAnalysis(ddJobs, knownDd)
  const ddWritten = useRef(Boolean(set.dd))
  useEffect(() => {
    if (ddWritten.current || dd.done !== dd.total) return
    const saved = ddToSaved(dd.results, set.count)
    if (!saved?.dd || !saved.par) return
    ddWritten.current = true
    const { dd: hex, par } = saved
    saveSetDd(set.id, { dd: hex, par })
      .then(() => setSet((current) => ({ ...current, dd: hex, par })))
      .catch(() => {
        // Yazılamazsa sonuçlar ekranda kalır; sayfa yeniden açılınca tekrar denenir.
      })
  }, [dd.done, dd.total, dd.results, set.id, set.count])
  // Kayıtlı setler herkese okunabilir; set sayfasının adresi paylaşım bağlantısıdır.
  const setUrl = `${window.location.origin}/sets/${set.id}`
  const dirty = title.trim() !== set.title || notes !== set.notes

  async function run(action: () => Promise<void>, okText?: string) {
    setBusy(true)
    setMessage(null)
    try {
      await action()
      if (okText) setMessage({ kind: 'ok', text: okText })
    } catch (err) {
      setMessage({ kind: 'error', text: `${tr.sets.actionError} ${errorMessage(err)}` })
    } finally {
      setBusy(false)
    }
  }

  const saveChanges = () =>
    run(async () => {
      const next = { ...set, title: title.trim() || set.title, notes }
      await updateSet(next)
      setSet(next)
      setTitle(next.title)
    }, tr.sets.savedChanges)

  const toggleArchived = () =>
    run(async () => {
      const next = { ...set, archived: !set.archived }
      await updateSet(next)
      setSet(next)
    })

  const duplicate = () =>
    run(async () => {
      const newId = await copySet(set, boardNotes, set.title + tr.sets.copySuffix)
      navigate(`/sets/${newId}`)
    })

  return (
    <div className="flex flex-col gap-6">
      <Link to="/sets" className="text-sm font-medium text-slate-600 hover:underline">
        ← {tr.sets.back}
      </Link>

      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">{tr.sets.setTitle}</span>
          <input
            value={title}
            maxLength={MAX_TITLE_LENGTH}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-lg font-semibold text-slate-900"
          />
        </label>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 self-end text-sm">
          <dt className="text-slate-500">{tr.sets.topic}</dt>
          <dd className="text-slate-900">{set.topicName}</dd>
          {set.createdAt && (
            <>
              <dt className="text-slate-500">{tr.sets.created}</dt>
              <dd className="text-slate-900">{dateFormat.format(set.createdAt)}</dd>
            </>
          )}
        </dl>
        <label className="flex flex-col gap-1.5 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">{tr.sets.notes}</span>
          <textarea
            value={notes}
            maxLength={MAX_NOTES_LENGTH}
            rows={3}
            onChange={(event) => setNotes(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          />
        </label>
        <div className="flex flex-wrap items-center gap-3 md:col-span-2">
          <button
            type="button"
            disabled={!dirty || busy}
            onClick={saveChanges}
            className="rounded-md bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {busy ? tr.sets.saving : tr.sets.saveChanges}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={duplicate}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {tr.sets.copy}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={toggleArchived}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {set.archived ? tr.sets.unarchive : tr.sets.archive}
          </button>
          {set.archived && (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
              {tr.sets.archived}
            </span>
          )}
          {message && (
            <span
              className={`text-sm ${message.kind === 'ok' ? 'text-emerald-700' : 'text-red-700'}`}
            >
              {message.text}
            </span>
          )}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="flex flex-wrap items-baseline gap-x-3 text-sm">
          <span className="font-semibold text-slate-900">{tr.sets.boards(set.count)}</span>
          {dd.error ? (
            <span className="text-red-700">
              {tr.dd.error} {dd.error}
            </span>
          ) : (
            dd.done < dd.total && (
              <span className="text-slate-500">{tr.dd.progress(dd.done, dd.total)}</span>
            )
          )}
        </span>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={focusOnly}
              onChange={(event) => setFocusOnly(event.target.checked)}
              className="size-4 accent-emerald-700"
            />
            {tr.generate.focusOnly}
          </label>
          <ShareButton url={setUrl} title={set.title} />
          <PdfButton
            getOptions={() => ({
              title: set.title,
              topicName: set.topicName,
              shareUrl: setUrl,
              deals,
              dd: dd.results,
              focusOnly,
              notes: set.notes,
              date: set.createdAt,
            })}
          />
          <PbnButton
            getOptions={() => ({
              event: set.title,
              date: set.createdAt ?? new Date(),
              deals,
              dd: dd.results,
              notes: set.notes,
              boardNotes,
              sourceUrl: setUrl,
            })}
          />
        </div>
      </div>

      <DealGrid
        deals={deals}
        focusOnly={focusOnly}
        onOpen={setSelected}
        dd={dd.results}
        badge={(deal) =>
          boardNotes[deal.board] ? (
            <span className="rounded bg-sky-100 px-1.5 py-0.5 text-xs text-sky-800">
              {tr.sets.hasNote}
            </span>
          ) : null
        }
      />

      <DealDialog
        deals={deals}
        index={selected}
        focusOnly={focusOnly}
        onClose={() => setSelected(null)}
        onNavigate={setSelected}
        dd={dd.results}
        renderExtra={(deal) => (
          <BoardNoteEditor
            key={deal.board}
            initial={boardNotes[deal.board] ?? ''}
            onSave={async (text) => {
              await saveBoardNote(set.id, deal.board, text)
              setBoardNotes((current) => ({ ...current, [deal.board]: text }))
            }}
          />
        )}
      />
    </div>
  )
}

interface BoardNoteEditorProps {
  initial: string
  onSave: (text: string) => Promise<void>
}

function BoardNoteEditor({ initial, onSave }: BoardNoteEditorProps) {
  const [text, setText] = useState(initial)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  async function handleSave() {
    setStatus('saving')
    try {
      await onSave(text)
      setStatus('saved')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="board-note" className="text-sm font-medium text-slate-700">
        {tr.sets.boardNote}
      </label>
      <textarea
        id="board-note"
        value={text}
        maxLength={MAX_BOARD_NOTE_LENGTH}
        rows={3}
        placeholder={tr.sets.boardNotePlaceholder}
        onChange={(event) => {
          setText(event.target.value)
          setStatus('idle')
        }}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={text === initial || status === 'saving'}
          onClick={handleSave}
          className="rounded-md bg-emerald-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {status === 'saving' ? tr.sets.saving : tr.sets.saveBoardNote}
        </button>
        {status === 'saved' && (
          <span className="text-sm text-emerald-700">{tr.sets.boardNoteSaved}</span>
        )}
        {status === 'error' && <span className="text-sm text-red-700">{tr.sets.actionError}</span>}
      </div>
    </div>
  )
}
