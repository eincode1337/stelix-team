import type { CSSProperties, ReactNode } from 'react'
import { ap, cx } from './ap'

export type ColumnAlign = 'start' | 'center' | 'end' | 'actions'

export type AdminTableVariant =
  | 'Users'
  | 'Orders'
  | 'Purchases'
  | 'SellerStatsPurchases'
  | 'Resources'
  | 'Sellers'
  | 'Withdrawals'
  | 'Apps'
  | 'Blacklist'
  | 'DeliveryLogs'
  | 'DeliveryLogsResourceScope'
  | 'Refunds'
  | 'Reviews'
  | 'Deposits'
  | 'Kassa'
  | 'Tx'
  | (string & {})

export type SortDirection = 'asc' | 'desc' | null

export interface AdminColumn<Row> {
  key: string
  header?: ReactNode
  align?: ColumnAlign
  cell: (row: Row, rowIndex: number) => ReactNode
  sortable?: boolean
  sortDirection?: SortDirection
  onSort?: (key: string) => void
  cellClassName?: string | ((row: Row, rowIndex: number) => string | undefined)
  headerClassName?: string
}

export interface AdminTableProps<Row> {
  columns: AdminColumn<Row>[]
  rows: Row[]
  rowKey: (row: Row, rowIndex: number) => string | number
  variant?: AdminTableVariant
  gridTemplateColumns?: string
  loading?: boolean
  emptyText?: ReactNode
  emptyIcon?: ReactNode
  onRowClick?: (row: Row, rowIndex: number) => void
  rowClassName?: (row: Row, rowIndex: number) => string | undefined
  className?: string
  ariaLabel?: string
}

const CELL_ALIGN: Record<ColumnAlign, string> = {
  start: 'tableCellAlignStart',
  center: 'tableCellAlignCenter',
  end: 'tableCellAlignEnd',
  actions: 'tableCellActions tableCellActionCol',
}

const HEAD_ALIGN: Record<ColumnAlign, string> = {
  start: 'tableSortHeaderIdentity',
  center: 'tableSortHeaderCenter',
  end: 'tableSortHeaderEnd',
  actions: 'tableSortHeaderEnd',
}

function SortGlyph({ direction }: { direction: SortDirection }) {
  const transform = direction === 'asc' ? 'rotate(180deg)' : undefined
  const style: CSSProperties = { transform, opacity: direction ? 1 : 0.4 }
  return (
    <span className={ap('tableSortGlyph')} aria-hidden="true">
      <svg className={ap('tableSortGlyphSvg')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="m6 9 6 6 6-6" />
      </svg>
    </span>
  )
}

function HeaderCell<Row>({ col }: { col: AdminColumn<Row> }) {
  const align: ColumnAlign = col.align ?? 'start'
  const inner = (
    <span className={ap('tableSortHeaderInner')}>
      <span className={ap('tableSortHeaderLabel')}>{col.header}</span>
      {col.sortable ? <SortGlyph direction={col.sortDirection ?? null} /> : null}
    </span>
  )
  return (
    <div className={cx(ap('tableCell', CELL_ALIGN[align]), col.headerClassName)} role="columnheader">
      {col.sortable ? (
        <button
          type="button"
          className={ap('tableSortHeader', HEAD_ALIGN[align])}
          onClick={col.onSort ? () => col.onSort!(col.key) : undefined}
          aria-sort={col.sortDirection === 'asc' ? 'ascending' : col.sortDirection === 'desc' ? 'descending' : 'none'}
        >
          {inner}
        </button>
      ) : (
        <span className={ap('tableSortHeader', HEAD_ALIGN[align])}>{inner}</span>
      )}
    </div>
  )
}

export function AdminTable<Row>({
  columns,
  rows,
  rowKey,
  variant,
  gridTemplateColumns,
  loading,
  emptyText,
  emptyIcon,
  onRowClick,
  rowClassName,
  className,
  ariaLabel,
}: AdminTableProps<Row>) {
  const gridStyle: CSSProperties | undefined = gridTemplateColumns ? { gridTemplateColumns } : undefined
  const headerVariant = variant ? `tableHeader${variant}` : ''
  const rowVariant = variant ? `tableRow${variant}` : ''

  return (
    <div className={cx(ap('tableWrap'), className)} role="table" aria-label={ariaLabel}>
      <div className={ap('tableRow', 'tableHeader', headerVariant || null)} role="row" style={gridStyle}>
        {columns.map((col) => (
          <HeaderCell key={col.key} col={col} />
        ))}
      </div>

      {loading ? (
        <div className={ap('sectionSpinnerHost')}>
          <span className={ap('sectionSpinner')} role="status" aria-label="Загрузка" />
        </div>
      ) : rows.length === 0 ? (
        <AdminEmptyState text={emptyText} icon={emptyIcon} />
      ) : (
        rows.map((row, rowIndex) => {
          const extraRow = rowClassName?.(row, rowIndex)
          return (
            <div
              key={rowKey(row, rowIndex)}
              className={cx(ap('tableRow', rowVariant || null), extraRow)}
              role="row"
              style={gridStyle}
              onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
            >
              {columns.map((col) => {
                const align: ColumnAlign = col.align ?? 'start'
                const extra = typeof col.cellClassName === 'function' ? col.cellClassName(row, rowIndex) : col.cellClassName
                return (
                  <div key={col.key} className={cx(ap('tableCell', CELL_ALIGN[align]), extra)} role="cell">
                    {col.cell(row, rowIndex)}
                  </div>
                )
              })}
            </div>
          )
        })
      )}
    </div>
  )
}

export interface AdminEmptyStateProps {
  text?: ReactNode
  icon?: ReactNode
  className?: string
}

export function AdminEmptyState({ text, icon, className }: AdminEmptyStateProps) {
  return (
    <div className={cx(ap('emptyState'), className)}>
      {icon ?? (
        <svg className={ap('emptyStateIcon')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 7h18M3 7l2 13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2l2-13M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        </svg>
      )}
      <p className={ap('emptyStateText')}>{text ?? 'Ничего не найдено'}</p>
    </div>
  )
}

export interface AdminLoadingProps {
  className?: string
  size?: 'section' | 'page'
}

export function AdminLoading({ className, size = 'section' }: AdminLoadingProps) {
  if (size === 'page') {
    return (
      <div className={cx(ap('adminDataLoadingWrap'), className)}>
        <span className={ap('adminPageLoadingSpinner')} role="status" aria-label="Загрузка" />
      </div>
    )
  }
  return (
    <div className={cx(ap('sectionSpinnerHost'), className)}>
      <span className={ap('sectionSpinner')} role="status" aria-label="Загрузка" />
    </div>
  )
}

export type IconButtonTone = 'default' | 'danger' | 'accent' | 'success' | 'warning' | 'neutral'

const ICON_BTN_TONE: Record<IconButtonTone, string> = {
  default: '',
  danger: 'tableIconButtonDanger',
  accent: 'tableIconButtonAccent',
  success: 'tableIconButtonSuccess',
  warning: 'tableIconButtonWarning',
  neutral: 'tableIconButtonNeutral',
}

export interface AdminIconButtonProps {
  label: string
  children?: ReactNode
  iconPath?: string
  tone?: IconButtonTone
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export function AdminIconButton({ label, children, iconPath, tone = 'default', onClick, disabled, className }: AdminIconButtonProps) {
  return (
    <span className={ap('tableIconButtonHost')}>
      <button
        type="button"
        className={cx(ap('tableIconButton', ICON_BTN_TONE[tone] || null), className)}
        aria-label={label}
        title={label}
        onClick={onClick}
        disabled={disabled}
      >
        {children ?? (
          <svg className={ap('tableIconButtonIcon')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={iconPath} />
          </svg>
        )}
      </button>
    </span>
  )
}

export const ADMIN_ICONS = {
  edit: 'M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z',
  delete: 'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6',
  view: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  check: 'M20 6 9 17l-5-5',
  close: 'M18 6 6 18M6 6l12 12',
  download: 'M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
  impersonate: 'M17 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19 8v6M22 11h-6',
} as const

export const ADMIN_GRID_TEMPLATES: Record<string, string> = {
  users:
    'var(--admin-users-col-id) var(--admin-users-col-identity) var(--admin-users-col-balance) var(--admin-users-col-payable) var(--admin-users-col-purchases) var(--admin-users-col-orders) var(--admin-users-col-role) var(--admin-users-col-date-created) var(--admin-users-col-date-modified) var(--admin-users-col-status) var(--admin-users-col-actions)',
  resources:
    'var(--admin-res-col-title) var(--admin-res-col-price) var(--admin-res-col-author) var(--admin-res-col-sales) var(--admin-res-col-date-created) var(--admin-res-col-date-modified) var(--admin-res-col-status) var(--admin-res-col-actions)',
  orders:
    'var(--admin-ord-col-title) var(--admin-ord-col-budget) var(--admin-ord-col-customer) var(--admin-ord-col-executor) var(--admin-ord-col-published) var(--admin-ord-col-modified) var(--admin-ord-col-status) var(--admin-ord-col-actions)',
  applications:
    'var(--admin-app-col-identity) var(--admin-app-col-role) var(--admin-app-col-created) var(--admin-app-col-updated) var(--admin-app-col-status) var(--admin-app-col-actions)',
  sellers:
    'var(--admin-seller-col-identity) var(--admin-seller-col-role) var(--admin-seller-col-count) var(--admin-seller-col-count) var(--admin-seller-col-payable) var(--admin-seller-col-amount) var(--admin-seller-col-amount) var(--admin-seller-col-status)',
  withdrawals:
    'var(--admin-wd-col-num) var(--admin-wd-col-identity) var(--admin-wd-col-amount) var(--admin-wd-col-method) var(--admin-wd-col-created) var(--admin-wd-col-updated) var(--admin-wd-col-status) var(--admin-wd-col-actions)',
  blacklist:
    'var(--admin-bl-col-id) var(--admin-bl-col-identity) var(--admin-bl-col-site) var(--admin-bl-col-social) var(--admin-bl-col-role) var(--admin-bl-col-date-created) var(--admin-bl-col-date-modified) var(--admin-bl-col-actions)',
  deliveryLogs:
    'var(--admin-delivery-col-user) var(--admin-delivery-col-resource) var(--admin-delivery-col-type) var(--admin-delivery-col-details) var(--admin-delivery-col-date) var(--admin-delivery-col-actions)',
  deliveryLogsResourceScope:
    'var(--admin-delivery-col-user) var(--admin-delivery-col-type) var(--admin-delivery-col-details) var(--admin-delivery-col-date) var(--admin-delivery-col-actions)',
  purchases:
    'var(--admin-pur-col-title) var(--admin-pur-col-price) var(--admin-pur-col-fee) var(--admin-pur-col-buyer) var(--admin-pur-col-date) var(--admin-pur-col-status) var(--admin-pur-col-actions)',
  sellerStatsPurchases:
    'var(--admin-pur-stat-col-buyer) var(--admin-pur-stat-col-price) var(--admin-pur-stat-col-fee) var(--admin-pur-stat-col-date) var(--admin-pur-stat-col-status) var(--admin-pur-stat-col-actions)',
}
