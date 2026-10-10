import { useState, type FormEvent } from 'react'
import { MAX_NOTES_LENGTH, MAX_TITLE_LENGTH } from '../data/savedSet'
import { tr } from '../i18n/tr'
import { Button } from './ui/Button'
import { Field, Input, TextArea } from './ui/Field'
import { Modal } from './ui/Modal'
import { Notice } from './ui/Notice'

interface SaveSetDialogProps {
  defaultTitle: string
  onSave: (title: string, notes: string) => Promise<void>
  onCancel: () => void
}

const FORM_ID = 'save-set-form'

/** Set adı ve genel not sorar; açıkken render edilir. */
export function SaveSetDialog({ defaultTitle, onSave, onCancel }: SaveSetDialogProps) {
  const [title, setTitle] = useState(defaultTitle)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [titleError, setTitleError] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) {
      setTitleError(true)
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
    <Modal
      title={tr.save.title}
      showClose={false}
      onClose={() => !saving && onCancel()}
      footer={
        <>
          <Button variant="quiet" onClick={onCancel} disabled={saving}>
            {tr.save.cancel}
          </Button>
          <Button
            variant="primary"
            type="submit"
            form={FORM_ID}
            busy={saving}
            busyLabel={tr.save.saving}
          >
            {tr.save.submit}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label={tr.save.setTitle} error={titleError ? tr.save.titleRequired : undefined}>
          <Input
            value={title}
            maxLength={MAX_TITLE_LENGTH}
            onChange={(event) => {
              setTitle(event.target.value)
              setTitleError(false)
            }}
          />
        </Field>
        <Field label={tr.save.notes}>
          <TextArea
            value={notes}
            maxLength={MAX_NOTES_LENGTH}
            rows={3}
            placeholder={tr.save.notesPlaceholder}
            onChange={(event) => setNotes(event.target.value)}
          />
        </Field>
        {error && <Notice tone="danger">{error}</Notice>}
      </form>
    </Modal>
  )
}
