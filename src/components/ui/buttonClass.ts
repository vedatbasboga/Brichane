import { cx } from './cx'

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger'

/** Düğme sınıfları; bağlantıyı düğme gibi göstermek için de kullanılır. */
export function buttonClass(variant: ButtonVariant = 'secondary', size: 'md' | 'sm' = 'md') {
  return cx('bh-btn', `bh-btn-${variant}`, size === 'sm' && 'bh-btn-sm')
}
