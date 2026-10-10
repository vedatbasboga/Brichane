import type { ReactNode } from 'react'

export type NoticeTone = 'info' | 'success' | 'warning' | 'danger'

// Her tonun ikonu farklı; ton yalnızca renkle anlatılmaz.
const ICON: Record<NoticeTone, string> = {
  info: 'M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM8 7v4.5M8 4.6v.1',
  success: 'M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM5 8.2l2 2 4-4.4',
  warning: 'M8 1.8L15 14H1zM8 6.5v3.6M8 12v.1',
  danger: 'M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM5.7 5.7l4.6 4.6M10.3 5.7l-4.6 4.6',
}

interface NoticeProps {
  tone?: NoticeTone
  title?: ReactNode
  children?: ReactNode
  action?: ReactNode
}

export function Notice({ tone = 'info', title, children, action }: NoticeProps) {
  return (
    <div
      className={`bh-notice bh-notice-${tone}`}
      role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'}
    >
      <svg className="bh-notice-icon" viewBox="0 0 16 16" width={16} height={16} aria-hidden="true">
        <path
          d={ICON[tone]}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="bh-notice-body">
        {title && <p className="bh-notice-title">{title}</p>}
        {children && <div className="bh-notice-text">{children}</div>}
        {action && <div className="bh-notice-action">{action}</div>}
      </div>
    </div>
  )
}
