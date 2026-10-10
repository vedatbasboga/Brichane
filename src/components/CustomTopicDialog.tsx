import { useState } from 'react'
import { emptyDraft, validateDraft, type TopicDraft } from '../data/topicDraft'
import { tr } from '../i18n/tr'
import { TopicForm } from './topicForm/TopicForm'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'
import { Notice } from './ui/Notice'

interface CustomTopicDialogProps {
  initial: TopicDraft
  onApply: (draft: TopicDraft) => void
  onCancel: () => void
}

/** Anlık özel dağılım; açıkken render edilir, kaydedilmez. */
export function CustomTopicDialog({ initial, onApply, onCancel }: CustomTopicDialogProps) {
  const [draft, setDraft] = useState(initial)
  const [showErrors, setShowErrors] = useState(false)
  const errors = validateDraft(draft)

  function handleApply() {
    if (errors.length) {
      setShowErrors(true)
      return
    }
    onApply(draft)
  }

  return (
    <Modal
      title={tr.generate.customTitle}
      description={tr.generate.customHelp}
      size="xl"
      stickyFooter
      showClose={false}
      onClose={onCancel}
      footer={
        <>
          <Button
            variant="quiet"
            size="sm"
            className="mr-auto"
            onClick={() =>
              setDraft({ ...emptyDraft(draft.id), name: draft.name, category: draft.category })
            }
          >
            {tr.generate.customReset}
          </Button>
          <Button variant="quiet" onClick={onCancel}>
            {tr.generate.customCancel}
          </Button>
          <Button variant="primary" onClick={handleApply}>
            {tr.generate.customApply}
          </Button>
        </>
      }
    >
      <TopicForm draft={draft} onChange={setDraft} />
      {showErrors && errors.length > 0 && (
        <Notice tone="danger" title={tr.generate.customFixErrors}>
          <ul className="list-disc pl-5">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </Notice>
      )}
    </Modal>
  )
}
