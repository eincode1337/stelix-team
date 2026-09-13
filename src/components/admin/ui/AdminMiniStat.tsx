import type { CSSProperties, ReactNode } from 'react'
import { ap, cx } from './ap'

export type TrendTone = 'positive' | 'negative' | 'muted'
export type TrendDirection = 'up' | 'down' | 'flat'

export interface AdminTrend {
  value: ReactNode
  direction?: TrendDirection
  tone?: TrendTone
}

const TREND_COLOR: Record<TrendTone, string> = {
  positive: 'var(--success-fg)',
  negative: 'var(--danger-fg)',
  muted: 'var(--fg-muted)',
}

function resolveTone(t: AdminTrend): TrendTone {
  if (t.tone) return t.tone
  if (t.direction === 'up') return 'positive'
  if (t.direction === 'down') return 'negative'
  return 'muted'
}

function resolveDirection(t: AdminTrend): TrendDirection {
  if (t.direction) return t.direction
  if (t.tone === 'positive') return 'up'
  if (t.tone === 'negative') return 'down'
  return 'flat'
}

function TrendBadge({ trend }: { trend: AdminTrend }) {
  const tone = resolveTone(trend)
  const direction = resolveDirection(trend)
  const style: CSSProperties = { color: TREND_COLOR[tone] }
  const d =
    direction === 'up'
      ? 'M7 17 17 7M9 7h8v8'
      : direction === 'down'
        ? 'M7 7 17 17M17 9v8H9'
        : 'M5 12h14'
  return (
    <span className={ap('adminStripTrendBadge')} style={style}>
      <svg className={ap('adminStripTrendIcon')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={d} />
      </svg>
      {trend.value}
    </span>
  )
}

export interface AdminMiniStatProps {
  label: ReactNode
  value: ReactNode
  trend?: AdminTrend
  className?: string
  style?: CSSProperties
}

export function AdminMiniStat({ label, value, trend, className, style }: AdminMiniStatProps) {
  return (
    <div className={cx(ap('adminMiniStat'), className)} style={style}>
      <span className={ap('adminMiniStatLabel')}>{label}</span>
      {trend ? (
        <span className={ap('adminMiniStatValue', 'adminMiniStatValueWithTrend')}>
          <span>{value}</span>
          <TrendBadge trend={trend} />
        </span>
      ) : (
        <span className={ap('adminMiniStatValue')}>{value}</span>
      )}
    </div>
  )
}

export interface AdminMiniStatsProps {
  children: ReactNode
  dashed?: boolean
  roleInline?: boolean
  withdrawals?: boolean
  className?: string
}

export function AdminMiniStats({ children, dashed, roleInline, withdrawals, className }: AdminMiniStatsProps) {
  return (
    <div
      className={cx(
        ap(
          'adminMiniStats',
          dashed && 'adminMiniStatsDashed',
          roleInline && 'adminMiniStatsRoleInline',
          withdrawals && 'adminMiniStatsWithdrawals',
        ),
        className,
      )}
    >
      {children}
    </div>
  )
}
