import { useEffect, useRef, useState } from 'react'
import { emptyDraft, validateDraft, type TopicDraft } from '../data/topicDraft'
import { tr } from '../i18n/tr'
import { TopicForm } from './topicForm/TopicForm'

interface CustomTopicDialogProps {
  initial: TopicDraft
  onApply: (draft: TopicDraft) => void
  onCancel: () => void
}

/** Anlık özel dağılım; açıkken render edilir, kaydedilmez. */
export function CustomTopicDialog({ initial, onApply, onCancel }: CustomTopicDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [draft, setDraft] = useState(initial)
  const [showErrors, setShowErrors] = useState(false)
  const errors = validateDraft(draft)

  useEffect(() => {
    dialogRef.current?.showModal()
    // showModal ilk düğmeye odaklanıp onu vurgular; odağı içeriğe al.
    contentRef.current?.focus()
  }, [])

  function handleApply() {
    if (errors.length) {
      setShowErrors(true)
      return
    }
    onApply(draft)
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
      aria-labelledby="custom-topic-title"
      className="m-auto h-[calc(100dvh-1rem)] max-h-none w-[min(64rem,calc(100vw-1rem))] max-w-none overflow-hidden rounded-xl bg-slate-50 p-0 shadow-xl backdrop:bg-slate-900/60"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div>
            <h2 id="custom-topic-title" className="text-lg font-semibold text-slate-900">
              {tr.generate.customTitle}
            </h2>
            <p className="text-sm text-slate-500">{tr.generate.customHelp}</p>
          </div>
          <button
            type="button"
            onClick={() =>
              setDraft({ ...emptyDraft(draft.id), name: draft.name, category: draft.category })
            }
            className="shrink-0 rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            {tr.generate.customReset}
          </button>
        </header>

        <div
          ref={contentRef}
          tabIndex={-1}
          className="flex-1 overflow-y-auto px-4 py-4 outline-none sm:px-6"
        >
          <TopicForm draft={draft} onChange={setDraft} />
          {showErrors && errors.length > 0 && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <p className="font-semibold">{tr.generate.customFixErrors}</p>
              <ul className="mt-1 list-disc pl-5">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            {tr.generate.customCancel}
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-md bg-emerald-700 px-5 py-2 font-semibold text-white hover:bg-emerald-800"
          >
            {tr.generate.customApply}
          </button>
        </footer>
      </div>
    </dialog>
  )
}
