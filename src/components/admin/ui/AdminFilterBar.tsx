import type { ReactNode } from 'react'
import { ap, cx } from './ap'

export interface AdminFilterBarProps {
  children: ReactNode
  className?: string
}

export function AdminFilterBar({ children, className }: AdminFilterBarProps) {
  return <div className={cx(ap('sectionFilterRow'), className)}>{children}</div>
}

export interface AdminSectionHeaderProps {
  title: ReactNode
  children?: ReactNode
  className?: string
}

export function AdminSectionHeader({ title, children, className }: AdminSectionHeaderProps) {
  return (
    <div className={cx(ap('sectionHeader'), className)}>
      <h2 className={ap('sectionTitle')}>{title}</h2>
      {children != null ? <div className={ap('sectionHeaderEnd')}>{children}</div> : null}
    </div>
  )
}

export interface AdminSearchInputProps {
  value: string
  onChange?: (value: string) => void
  onClear?: () => void
  placeholder?: string
  pending?: boolean
  ariaLabel?: string
  className?: string
}

export function AdminSearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'Поиск',
  pending,
  ariaLabel,
  className,
}: AdminSearchInputProps) {
  const empty = value.length === 0
  return (
    <div className={cx(ap('userSearchWrap', pending && 'userSearchWrapPending'), className)}>
      <svg className={ap('userSearchIcon')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="search"
        className={ap('userSearchInput', pending && 'userSearchInputPending')}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
      />
      <button
        type="button"
        className={ap('userSearchClearBtn', empty && 'userSearchClearBtnInactive')}
        onClick={onClear}
        aria-label="Очистить"
        tabIndex={empty ? -1 : 0}
      >
        <svg className={ap('userSearchClearIcon', empty && 'userSearchClearIconHidden')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
