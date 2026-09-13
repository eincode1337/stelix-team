import type { CSSProperties, ReactNode } from 'react'
import { ap, cx } from './ap'
import { roleColor, roleLabel, type RoleKey, type RoleLang } from './roles'

export type BadgeTone = 'default' | 'success' | 'danger' | 'warning' | 'info' | 'muted' | 'frozen'

const TONE_CLASS: Record<BadgeTone, string> = {
  default: '',
  success: 'badgeSuccess',
  danger: 'badgeDanger',
  warning: 'badgeWarning',
  info: 'badgeInfo',
  muted: 'badgeMuted',
  frozen: 'badgeFrozen',
}

export interface AdminBadgeProps {
  tone?: BadgeTone
  children: ReactNode
  className?: string
  title?: string
  style?: CSSProperties
}

export function AdminBadge({ tone = 'default', children, className, title, style }: AdminBadgeProps) {
  return (
    <span className={cx(ap('badge', TONE_CLASS[tone] || null), className)} title={title} style={style}>
      {children}
    </span>
  )
}

export interface AdminRoleBadgeProps {
  role: RoleKey | string
  lang?: RoleLang
  label?: ReactNode
  className?: string
  style?: CSSProperties
}

export function AdminRoleBadge({ role, lang = 'ru', label, className, style }: AdminRoleBadgeProps) {
  const color = roleColor(role)
  const chrome: CSSProperties = {
    color,
    background: `color-mix(in srgb, ${color} 14%, var(--bg-default))`,
    ...style,
  }
  return (
    <span className={cx(ap('roleBadge'), className)} style={chrome}>
      {label ?? roleLabel(role, lang)}
    </span>
  )
}

export interface AdminBadgeStackProps {
  children: ReactNode
  className?: string
}

export function AdminBadgeStack({ children, className }: AdminBadgeStackProps) {
  return <span className={cx(ap('badgeStack'), className)}>{children}</span>
}
