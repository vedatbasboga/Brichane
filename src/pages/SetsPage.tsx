import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import type { SavedSet } from '../data/savedSet'
import { copySet, listSets, loadBoardNotes, updateSet } from '../firebase/sets'
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

  if (state.status === 'loading') return <p className="text-slate-500">{tr.sets.loading}</p>
  if (state.status === 'error') {
    return <p className="text-red-700">{`${tr.sets.loadError} ${state.message}`}</p>
  }

  const visible = state.sets.filter((set) => showArchived || !set.archived)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-slate-900">{tr.sets.title}</h2>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(event) => setShowArchived(event.target.checked)}
            className="size-4 accent-emerald-700"
          />
          {tr.sets.showArchived}
        </label>
      </div>

      {actionError && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {tr.sets.actionError} {actionError}
        </p>
      )}

      {visible.length === 0 ? (
        <p className="text-slate-500">{tr.sets.empty}</p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
          {visible.map((set) => (
            <li
              key={set.id}
              className={`flex flex-wrap items-center justify-between gap-3 p-3 ${set.archived ? 'opacity-60' : ''}`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/sets/${set.id}`}
                    className="font-medium text-slate-900 hover:text-emerald-800 hover:underline"
                  >
                    {set.title}
                  </Link>
                  {set.archived && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
                      {tr.sets.archived}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500">
                  {set.topicName} · {tr.sets.boards(set.count)}
                  {set.createdAt && ` · ${dateFormat.format(set.createdAt)}`}
                </p>
                {set.notes && <p className="line-clamp-2 text-sm text-slate-600">{set.notes}</p>}
              </div>
              <div className="flex flex-wrap gap-1">
                <Link
                  to={`/sets/${set.id}`}
                  className="rounded-md px-2.5 py-1 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  {tr.sets.open}
                </Link>
                <button
                  type="button"
                  disabled={busyId === set.id}
                  onClick={() => duplicate(set)}
                  className="rounded-md px-2.5 py-1 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                >
                  {tr.sets.copy}
                </button>
                <button
                  type="button"
                  disabled={busyId === set.id}
                  onClick={() => toggleArchived(set)}
                  className="rounded-md px-2.5 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  {set.archived ? tr.sets.unarchive : tr.sets.archive}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
