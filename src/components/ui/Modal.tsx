import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { tr } from '../../i18n/tr'
import { Button } from './Button'
import { cx } from './cx'

interface ModalProps {
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  onClose: () => void
  size?: 'md' | 'lg' | 'xl'
  /** Uzun formlarda alt bar kayarken görünür kalır. */
  stickyFooter?: boolean
  /** Başlıkta "Kapat" düğmesi (alt barda Vazgeç varsa gerekmez). */
  showClose?: boolean
  onKeyDown?: (event: KeyboardEvent<HTMLDialogElement>) => void
}

/**
 * Pencere: tarayıcının <dialog> öğesi (Esc, odak tuzağı), görünüm tasarım sisteminden.
 * Açıkken render edilir; kapanınca `onClose`.
 */
export function Modal({
  title,
  description,
  children,
  footer,
  onClose,
  size = 'md',
  stickyFooter = false,
  showClose = true,
  onKeyDown,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
    // showModal ilk düğmeyi odaklayıp vurgular; odağı içeriğe al.
    panelRef.current?.focus()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className={cx('bh-dialog', size !== 'md' && `bh-dialog-${size}`)}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => event.target === dialogRef.current && onClose()}
      onKeyDown={onKeyDown}
      aria-label={typeof title === 'string' ? title : undefined}
    >
      <div ref={panelRef} tabIndex={-1} className="bh-dialog-panel outline-none">
        <div className="bh-dialog-head">
          <h2 className="bh-dialog-title">{title}</h2>
          {showClose && (
            <Button variant="quiet" size="sm" onClick={onClose}>
              {tr.dealView.close}
            </Button>
          )}
        </div>
        {description && <p className="bh-dialog-desc">{description}</p>}
        <div className="bh-dialog-body">{children}</div>
        {footer && (
          <div className={cx('bh-dialog-foot', stickyFooter && 'is-sticky')}>{footer}</div>
        )}
      </div>
    </dialog>
  )
}
