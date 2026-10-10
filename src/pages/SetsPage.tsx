import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import type { SavedSet } from '../data/savedSet'
import { Button } from '../components/ui/Button'
import { buttonClass } from '../components/ui/buttonClass'
import { Checkbox } from '../components/ui/Checkbox'
import { cx } from '../components/ui/cx'
import { Notice } from '../components/ui/Notice'
import { Tag } from '../components/ui/Tag'
import { copySet, deleteSet, listSets, loadBoardNotes, updateSet } from '../firebase/sets'
import { tr } from '../i18n/tr'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; sets: SavedSet[] }

const dateFormat = new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })

const errorMessage = (err: unknown) => (err instanceof Error ? err.message : String(err))

export default function SetsPage() {
  const navigate = useNavigate()
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [showArchived, setShowArchived] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listSets()
      .then((sets) => !cancelled && setState({ status: 'ready', sets }))
      .catch((err) => !cancelled && setState({ status: 'error', message: errorMessage(err) }))
    return () => {
      cancelled = true
    }
  }, [])

  async function toggleArchived(set: SavedSet) {
    setBusyId(set.id)
    setActionError(null)
    try {
      await updateSet({ ...set, archived: !set.archived })
      setState((current) =>
        current.status === 'ready'
          ? {
              ...current,
              sets: current.sets.map((s) =>
                s.id === set.id ? { ...s, archived: !s.archived } : s,
              ),
            }
          : current,
      )
    } catch (err) {
      setActionError(errorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  async function remove(set: SavedSet) {
    if (!window.confirm(tr.sets.confirmDelete(set.title))) return
    setBusyId(set.id)
    setActionError(null)
    try {
      await deleteSet(set.id)
      setState((current) =>
        current.status === 'ready'
          ? { ...current, sets: current.sets.filter((s) => s.id !== set.id) }
          : current,
      )
    } catch (err) {
      setActionError(errorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  async function duplicate(set: SavedSet) {
    setBusyId(set.id)
    setActionError(null)
    try {
      const notes = await loadBoardNotes(set.id)
      const id = await copySet(set, notes, set.title + tr.sets.copySuffix)
      navigate(`/sets/${id}`)
    } catch (err) {
      setActionError(errorMessage(err))
      setBusyId(null)
    }
  }

  if (state.status === 'loading') return <p className="bh-muted">{tr.sets.loading}</p>
  if (state.status === 'error') {
    return <Notice tone="danger">{`${tr.sets.loadError} ${state.message}`}</Notice>
  }

  const visible = state.sets.filter((set) => showArchived || !set.archived)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="bh-display">{tr.sets.title}</h1>
        <Checkbox
          checked={showArchived}
          onChange={(event) => setShowArchived(event.target.checked)}
          label={tr.sets.showArchived}
        />
      </div>

      {actionError && (
        <Notice tone="danger">
          {tr.sets.actionError} {actionError}
        </Notice>
      )}

      {visible.length === 0 ? (
        <Notice>{tr.sets.empty}</Notice>
      ) : (
        <ul className="bh-setlist">
          {visible.map((set) => (
            <li key={set.id} className={cx('bh-setitem', set.archived && 'is-archived')}>
              <div className="bh-setitem-main">
                <div className="bh-setitem-titlerow">
                  <Link to={`/sets/${set.id}`} className="bh-setitem-title">
                    {set.title}
                  </Link>
                  {set.archived && <Tag tone="archived">{tr.sets.archived}</Tag>}
                </div>
                <p className="bh-setitem-meta">
                  {set.topicName} · {tr.sets.boards(set.count)}
                  {set.createdAt && ` · ${dateFormat.format(set.createdAt)}`}
                </p>
                {set.notes && <p className="bh-setitem-note">{set.notes}</p>}
              </div>
              <div className="bh-setitem-actions">
                <Link to={`/sets/${set.id}`} className={buttonClass('secondary', 'sm')}>
                  {tr.sets.open}
                </Link>
                <Button
                  size="sm"
                  variant="quiet"
                  disabled={busyId === set.id}
                  onClick={() => duplicate(set)}
                >
                  {tr.sets.copy}
                </Button>
                <Button
                  size="sm"
                  variant="quiet"
                  disabled={busyId === set.id}
                  onClick={() => toggleArchived(set)}
                >
                  {set.archived ? tr.sets.unarchive : tr.sets.archive}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={busyId === set.id}
                  onClick={() => remove(set)}
                >
                  {tr.sets.delete}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
