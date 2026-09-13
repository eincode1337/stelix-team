import type { ReactNode } from 'react'
import { ap, cx } from './ap'

export interface AdminTabItem {
  key: string
  label: ReactNode
  icon?: ReactNode
  href?: string
  chip?: ReactNode
  chipAlert?: boolean
  disabled?: boolean
}

export interface AdminTabsProps {
  items: AdminTabItem[]
  activeKey?: string
  onChange?: (key: string) => void
  variant?: 'rail' | 'list'
  className?: string
  ariaLabel?: string
}

export function AdminTabs({ items, activeKey, onChange, variant = 'rail', className, ariaLabel }: AdminTabsProps) {
  const isRail = variant === 'rail'

  return (
    <nav className={cx(ap('nav'), className)} role="tablist" aria-label={ariaLabel} aria-orientation="vertical">
      {items.map((item) => {
        const active = item.key === activeKey
        const itemClass = ap('navItem', isRail && 'navRailTile', active && 'navItemActive')

        const inner = isRail ? (
          <>
            {item.icon != null ? <span className={ap('navRailIconSlot')}>{item.icon}</span> : null}
            {item.label != null ? <span className={ap('navItemLabel')}>{item.label}</span> : null}
            {item.chip != null ? (
              <span className={ap('navRailChips')}>
                <span className={ap('navRailChip', item.chipAlert && 'navRailChipAlert')}>{item.chip}</span>
              </span>
            ) : null}
          </>
        ) : (
          <>
            {item.icon != null ? <span className={ap('navRailIconSlot')}>{item.icon}</span> : null}
            <span className={ap('navItemLabel')}>{item.label}</span>
            {item.chip != null ? (
              <span className={ap('navRailChip', item.chipAlert && 'navRailChipAlert')}>{item.chip}</span>
            ) : null}
          </>
        )

        const commonProps = {
          className: itemClass,
          role: 'tab' as const,
          'aria-selected': active,
          title: typeof item.label === 'string' ? item.label : undefined,
          style: isRail ? undefined : { width: '100%' },
        }

        if (item.href && !item.disabled) {
          return (
            <a key={item.key} href={item.href} {...commonProps}>
              {inner}
            </a>
          )
        }
        return (
          <button
            key={item.key}
            type="button"
            {...commonProps}
            disabled={item.disabled}
            onClick={onChange && !item.disabled ? () => onChange(item.key) : undefined}
          >
            {inner}
          </button>
        )
      })}
    </nav>
  )
}
