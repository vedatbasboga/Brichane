import type { ReactNode } from 'react'
import { cx } from './cx'

interface TagProps {
  tone?: 'neutral' | 'note' | 'archived' | 'vuln'
  children: ReactNode
}

export function Tag({ tone = 'neutral', children }: TagProps) {
  return <span className={cx('bh-tag', `bh-tag-${tone}`)}>{children}</span>
}
