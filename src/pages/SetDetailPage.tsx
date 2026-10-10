import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { DealDialog } from '../components/DealDialog'
import { DealGrid } from '../components/DealGrid'
import { PbnButton } from '../components/PbnButton'
import { PdfButton } from '../components/PdfButton'
import { ShareButton } from '../components/ShareButton'
import { Button } from '../components/ui/Button'
import { Checkbox } from '../components/ui/Checkbox'
import { Field, Input, TextArea } from '../components/ui/Field'
import { Notice } from '../components/ui/Notice'
import { Tag } from '../components/ui/Tag'
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

  if (state.status === 'loading') return <p className="bh-muted">{tr.sets.loading}</p>
  if (state.status === 'missing') return <Notice>{tr.sets.notFound}</Notice>
  if (state.status === 'error') {
    return <Notice tone="danger">{`${tr.sets.loadError} ${state.message}`}</Notice>
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
      <Link to="/sets" className="bh-link self-start text-sm">
        ← {tr.sets.back}
      </Link>

      <section className="bh-panel flex flex-col gap-4">
        <Field label={tr.sets.setTitle}>
          <Input
            value={title}
            maxLength={MAX_TITLE_LENGTH}
            onChange={(event) => setTitle(event.target.value)}
            className="bh-title-input"
          />
        </Field>
        <p className="text-ink-muted m-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
          <span>
            {tr.sets.topic}: <span className="text-ink">{set.topicName}</span>
          </span>
          {set.createdAt && (
            <span>
              · {tr.sets.created}:{' '}
              <span className="text-ink tabular-nums">{dateFormat.format(set.createdAt)}</span>
            </span>
          )}
          {set.archived && <Tag tone="archived">{tr.sets.archived}</Tag>}
        </p>
        <Field label={tr.sets.notes}>
          <TextArea
            value={notes}
            maxLength={MAX_NOTES_LENGTH}
            rows={3}
            onChange={(event) => setNotes(event.target.value)}
          />
        </Field>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            disabled={!dirty}
            busy={busy}
            busyLabel={tr.sets.saving}
            onClick={saveChanges}
          >
            {tr.sets.saveChanges}
          </Button>
          <Button variant="quiet" disabled={busy} onClick={duplicate}>
            {tr.sets.copy}
          </Button>
          <Button variant="quiet" disabled={busy} onClick={toggleArchived}>
            {set.archived ? tr.sets.unarchive : tr.sets.archive}
          </Button>
          {message?.kind === 'ok' && (
            <span className="text-felt text-sm font-semibold">{message.text}</span>
          )}
        </div>
        {message?.kind === 'error' && <Notice tone="danger">{message.text}</Notice>}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 flex flex-wrap items-baseline gap-x-3">
          <span className="font-semibold">{tr.sets.boards(set.count)}</span>
          {dd.error ? (
            <span className="text-danger-ink text-[13px]">
              {tr.dd.error} {dd.error}
            </span>
          ) : (
            dd.done < dd.total && (
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
        badge={(deal) => (boardNotes[deal.board] ? <Tag tone="note">{tr.sets.hasNote}</Tag> : null)}
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
    <section className="flex flex-col gap-2">
      <Field label={tr.sets.boardNote}>
        <TextArea
          value={text}
          maxLength={MAX_BOARD_NOTE_LENGTH}
          rows={3}
          placeholder={tr.sets.boardNotePlaceholder}
          onChange={(event) => {
            setText(event.target.value)
            setStatus('idle')
          }}
        />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="primary"
          size="sm"
          disabled={text === initial}
          busy={status === 'saving'}
          busyLabel={tr.sets.saving}
          onClick={handleSave}
        >
          {tr.sets.saveBoardNote}
        </Button>
        {status === 'saved' && (
          <span className="text-felt text-sm font-semibold">{tr.sets.boardNoteSaved}</span>
        )}
        {status === 'error' && (
          <span className="text-danger-ink text-sm">{tr.sets.actionError}</span>
        )}
      </div>
    </section>
  )
}
