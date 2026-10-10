import { useEffect, useRef, useState, type FormEvent } from 'react'
import { MAX_NOTES_LENGTH, MAX_TITLE_LENGTH } from '../data/savedSet'
import { tr } from '../i18n/tr'

interface SaveSetDialogProps {
  defaultTitle: string
  onSave: (title: string, notes: string) => Promise<void>
  onCancel: () => void
}

/** Set adı ve genel not sorar; açıkken render edilir. */
export function SaveSetDialog({ defaultTitle, onSave, onCancel }: SaveSetDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [title, setTitle] = useState(defaultTitle)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) {
      setError(tr.save.titleRequired)
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave(title, notes)
    } catch (err) {
      setError(`${tr.save.error} ${err instanceof Error ? err.message : String(err)}`)
      setSaving(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault()
        if (!saving) onCancel()
      }}
      aria-labelledby="save-set-title"
      className="m-auto w-[min(32rem,calc(100vw-1rem))] rounded-xl bg-white p-0 shadow-xl backdrop:bg-slate-900/60"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 sm:p-6">
        <h2 id="save-set-title" className="text-lg font-semibold text-slate-900">
          {tr.save.title}
        </h2>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">{tr.save.setTitle}</span>
          <input
            value={title}
            maxLength={MAX_TITLE_LENGTH}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-slate-700">{tr.save.notes}</span>
          <textarea
            value={notes}
            maxLength={MAX_NOTES_LENGTH}
            rows={3}
            placeholder={tr.save.notesPlaceholder}
            onChange={(event) => setNotes(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          />
        </label>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            {tr.save.cancel}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-emerald-700 px-5 py-2 font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {saving ? tr.save.saving : tr.save.submit}
          </button>
        </div>
      </form>
    </dialog>
  )
}
