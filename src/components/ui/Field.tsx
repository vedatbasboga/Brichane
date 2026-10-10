import {
  cloneElement,
  isValidElement,
  useId,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { cx } from './cx'

interface FieldProps {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  className?: string
  /** Tek kontrol: Input, Select ya da TextArea. */
  children: ReactElement<{ id?: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }>
}

/** Etiketli form alanı; etiket her zaman kontrolün üstünde, altında ipucu ya da hata. */
export function Field({ label, hint, error, className = '', children }: FieldProps) {
  const generatedId = useId()
  const id = (isValidElement(children) && children.props.id) || generatedId
  const describedBy = hint || error ? `${id}-d` : undefined
  const control = isValidElement(children)
    ? cloneElement(children, {
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
      })
    : children
  return (
    <div className={cx('bh-field', Boolean(error) && 'has-error', className)}>
      {label && (
        <label className="bh-field-label" htmlFor={id}>
          {label}
        </label>
      )}
      {control}
      {error ? (
        <p className="bh-field-error" id={describedBy}>
          {error}
        </p>
      ) : (
        hint && (
          <p className="bh-field-hint" id={describedBy}>
            {hint}
          </p>
        )
      )}
    </div>
  )
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`bh-input ${className}`} {...props} />
}

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`bh-input bh-select ${className}`} {...props} />
}

export function TextArea({
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`bh-input ${className}`} {...props} />
}
