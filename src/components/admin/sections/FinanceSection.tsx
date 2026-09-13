'use client'


import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

import {
  ap,
  cx,
  AdminBadge,
  AdminTable,
  AdminMiniStat,
  AdminMiniStats,
  AdminPagination,
  AdminFilterBar,
  AdminSearchInput,
  AdminSectionHeader,
  AdminIconButton,
  type AdminColumn,
  type BadgeTone,
} from '@/components/admin/ui'
import { ViewActionIcon, RefundActionIcon, DeleteActionIcon } from './AdminActionIcons'


const FR_PREFIX = 'AdminFinanceReportsPanel-module__W4CfIW__'
const FX_PREFIX = 'AdminFinanceExportPreviewOverlay-module__luBOna__'
const fr = (...names: (string | false | null | undefined)[]) =>
  names.filter(Boolean).map((n) => `${FR_PREFIX}${n as string}`).join(' ')
const fx = (...names: (string | false | null | undefined)[]) =>
  names.filter(Boolean).map((n) => `${FX_PREFIX}${n as string}`).join(' ')


type FinanceType = 'sale' | 'refund' | 'payout'

interface FinanceTx {
  id: string
  type: FinanceType
  title: string
  user: string
  gross: number
  fee: number
  net: number
  status: string
  createdAt: string
}

interface FinanceTotals {
  gross: number
  fee: number
  net: number
  refunds: number
  payouts: number
  count: number
}

interface FinanceResponse {
  period: string
  totals: FinanceTotals
  items: FinanceTx[]
  total: number
  page: number
  pageSize: number
}

const PAGE_SIZE = 20
const PREVIEW_LIMIT = 100


const pad2 = (n: number) => String(n).padStart(2, '0')

function fmtMoney(n: number): string {
  return Math.round(n).toLocaleString('ru-RU')
}


function fmtDateDmyCommaHm(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}, ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

function fmtDmy(d: Date): string {
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`
}


function LightningIcon({ className }: { className?: string }) {


  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
    </svg>
  )
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM14 2v6h6M9 13h6M9 17h4" />
    </svg>
  )
}


const TYPE_RU: Record<FinanceType, string> = {
  sale: 'Продажа',
  refund: 'Возврат',
  payout: 'Выплата',
}
const TYPE_TONE: Record<FinanceType, BadgeTone> = {
  sale: 'info',
  refund: 'danger',
  payout: 'muted',
}


const STATUS_RU: Record<string, string> = {
  PAID: 'Оплачено',
  PENDING: 'Ожидание',
  REFUNDED: 'Возврат',
  DISPUTED: 'Спор',
}
const STATUS_TONE: Record<string, BadgeTone> = {
  PAID: 'success',
  PENDING: 'warning',
  REFUNDED: 'danger',
  DISPUTED: 'info',
}
const STATUS_OPTIONS = ['PAID', 'PENDING', 'REFUNDED', 'DISPUTED'] as const

function statusLabel(s: string): string {
  return STATUS_RU[s] ?? s
}
function statusTone(s: string): BadgeTone {
  return STATUS_TONE[s] ?? 'muted'
}


function signedAmount(t: FinanceTx): number {
  return t.type === 'sale' ? t.gross : -t.gross
}


type Period = 'day' | 'week' | 'month' | 'all'
const PERIODS: { key: Period; label: string }[] = [
  { key: 'day', label: 'День' },
  { key: 'week', label: 'Неделя' },
  { key: 'month', label: 'Месяц' },
  { key: 'all', label: 'Всё время' },
]
const PERIOD_DAYS: Record<Exclude<Period, 'all'>, number> = { day: 1, week: 7, month: 30 }

function rangeLabel(period: Period): string {
  if (period === 'all') return 'За всё время'
  const end = new Date()
  const start = new Date(end.getTime() - PERIOD_DAYS[period] * 86_400_000)
  return `${fmtDmy(start)} — ${fmtDmy(end)}`
}


type ReportId = 'payables' | 'withdrawals' | 'purchases' | 'orders' | 'earnings'

interface ReportCol {
  header: string
  get: (t: FinanceTx) => string

  sum?: (t: FinanceTx) => number
}

interface ReportDef {
  id: ReportId
  ru: string
  important?: boolean

  filter: (t: FinanceTx) => boolean
  columns: ReportCol[]
}

const REPORTS: ReportDef[] = [
  {
    id: 'payables',
    ru: 'Начисления и комиссия',
    important: true,
    filter: () => true,
    columns: [
      { header: 'Дата', get: (t) => fmtDateDmyCommaHm(t.createdAt) },
      { header: 'Пользователь', get: (t) => t.user },
      { header: 'Тип', get: (t) => TYPE_RU[t.type] },
      { header: 'Начисление', get: (t) => fmtMoney(t.gross), sum: (t) => t.gross },
      { header: 'Комиссия', get: (t) => fmtMoney(t.fee), sum: (t) => t.fee },
      { header: 'Итого', get: (t) => fmtMoney(t.net), sum: (t) => t.net },
    ],
  },
  {
    id: 'withdrawals',
    ru: 'Выплаты',
    filter: (t) => t.type === 'payout',
    columns: [
      { header: 'Дата', get: (t) => fmtDateDmyCommaHm(t.createdAt) },
      { header: 'Пользователь', get: (t) => t.user },
      { header: 'Сумма', get: (t) => fmtMoney(t.gross), sum: (t) => t.gross },
    ],
  },
  {
    id: 'purchases',
    ru: 'Продажи',
    filter: (t) => t.type === 'sale',
    columns: [
      { header: 'Дата', get: (t) => fmtDateDmyCommaHm(t.createdAt) },
      { header: 'Покупатель', get: (t) => t.user },
      { header: 'Ресурс', get: (t) => t.title },
      { header: 'Цена', get: (t) => fmtMoney(t.gross), sum: (t) => t.gross },
      { header: 'Комиссия', get: (t) => fmtMoney(t.fee), sum: (t) => t.fee },
      { header: 'Итого', get: (t) => fmtMoney(t.net), sum: (t) => t.net },
    ],
  },
  {
    id: 'orders',
    ru: 'Заказы',

    filter: () => false,
    columns: [
      { header: 'Дата', get: (t) => fmtDateDmyCommaHm(t.createdAt) },
      { header: 'Заказ', get: (t) => t.title },
      { header: 'Сумма', get: (t) => fmtMoney(t.gross), sum: (t) => t.gross },
    ],
  },
  {
    id: 'earnings',
    ru: 'Журнал начислений',
    filter: () => true,
    columns: [
      { header: 'Дата', get: (t) => fmtDateDmyCommaHm(t.createdAt) },
      { header: 'Пользователь', get: (t) => t.user },
      { header: 'Операция', get: (t) => TYPE_RU[t.type] },
      { header: 'Сумма', get: (t) => fmtMoney(t.net), sum: (t) => t.net },
    ],
  },
]


function TxUserCell({ tx }: { tx: FinanceTx }) {


  return (
    <div className={ap('tableCellUserIdentity')}>
      <span className={ap('tableCellUserName')}>{tx.user}</span>
      <span className={ap('tableCellUserEmail')}>{tx.id}</span>
    </div>
  )
}

function TxDescriptionCell({ tx }: { tx: FinanceTx }) {
  return (
    <div className={ap('tableTxDescriptionCell')}>
      <div className={ap('tableTxDescriptionStack')}>
        <div className={ap('tableTxDescriptionTitle')}>{tx.title}</div>
        <div className={ap('tableTxDescriptionMeta')}>
          {TYPE_RU[tx.type]} · {statusLabel(tx.status)}
        </div>
      </div>
    </div>
  )
}

function TxAmountChip({ tx }: { tx: FinanceTx }) {
  const amount = signedAmount(tx)
  const variant =
    tx.type === 'payout'
      ? 'adminTxDeltaChipFrozen'
      : amount >= 0
        ? 'adminTxDeltaChipPositive'
        : 'adminTxDeltaChipNegative'
  const sign = amount > 0 ? '+' : amount < 0 ? '−' : ''
  return (
    <span className={ap('adminTxDeltaChip', variant)}>
      <LightningIcon className={ap('adminTxDeltaChipLightning')} />
      {sign}
      {fmtMoney(Math.abs(amount))}
    </span>
  )
}

function BalanceBlock({
  value,
  kind,
  tone,
}: {
  value: number
  kind: string
  tone?: 'positive' | 'negative' | 'frozenAmount'
}) {
  return (
    <div className={ap('tableCellTxBalanceBlock')}>
      <span className={ap('tableCellBalanceValue', tone)}>
        <LightningIcon className={ap('tableCellBalanceIcon')} />
        {fmtMoney(value)}
      </span>
      <span className={ap('tableCellBalanceKind')}>{kind}</span>
    </div>
  )
}


function triggerDownload(name: string, content: string, mime: string) {
  const blob = new Blob(['﻿' + content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function escCsv(s: string): string {
  return /["\n\r,;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
function escHtml(s: string): string {
  return s.replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'))
}

function downloadReport(report: ReportDef, rows: FinanceTx[], format: 'csv' | 'xlsx') {
  const cols = report.columns
  if (format === 'csv') {
    const head = cols.map((c) => escCsv(c.header)).join(',')
    const body = rows.map((r) => cols.map((c) => escCsv(c.get(r))).join(',')).join('\r\n')
    triggerDownload(`${report.id}.csv`, `${head}\r\n${body}`, 'text/csv;charset=utf-8')
    return
  }

  const thead = `<tr>${cols.map((c) => `<th>${escHtml(c.header)}</th>`).join('')}</tr>`
  const tbody = rows
    .map((r) => `<tr>${cols.map((c) => `<td>${escHtml(c.get(r))}</td>`).join('')}</tr>`)
    .join('')
  const html = `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body><table>${thead}${tbody}</table></body></html>`
  triggerDownload(`${report.id}.xls`, html, 'application/vnd.ms-excel')
}


function ExportPreviewOverlay({
  report,
  period,
  onClose,
}: {
  report: ReportDef
  period: Period
  onClose: () => void
}) {
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [rows, setRows] = useState<FinanceTx[]>([])
  const [total, setTotal] = useState(0)
  const [busy, setBusy] = useState<'csv' | 'xlsx' | null>(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setFailed(false)
    const qs = new URLSearchParams({ period, page: '1', pageSize: String(PREVIEW_LIMIT) })
    fetch(`/api/admin/finance?${qs.toString()}`, { credentials: 'same-origin' })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<FinanceResponse>
      })
      .then((data) => {
        if (!alive) return
        setRows(data.items.filter(report.filter))
        setTotal(data.total)
        setLoading(false)
      })
      .catch(() => {
        if (!alive) return
        setFailed(true)
        setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [report, period])


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const cols = report.columns
  const shown = rows.length
  const truncated = !loading && !failed && shown > 0 && total > shown

  const runDownload = async (format: 'csv' | 'xlsx') => {
    if (rows.length === 0) return
    setBusy(format)

    await new Promise((res) => setTimeout(res, 120))
    downloadReport(report, rows, format)
    setBusy(null)
  }

  return (
    <div
      className={fx('overlay')}
      role="dialog"
      aria-modal="true"
      aria-label="Предпросмотр выгрузки"
    >
      <div className={fx('topChrome')}>
        <div
          className={fx('headerBar')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}
        >
          <h2 className={ap('sectionTitle')} style={{ margin: 0 }}>
            {report.ru}
          </h2>
          <button type="button" className={ap('tableAction')} onClick={onClose}>
            Закрыть
          </button>
        </div>
        {truncated ? (
          <p className={fx('truncated')}>

            В предпросмотре первые {shown} строк (лимит {PREVIEW_LIMIT}). Полный файл — XLSX или CSV.
          </p>
        ) : null}
      </div>

      <div className={fx('body')}>
        {loading ? (
          <div className={fx('loading')}>
            <div className={fx('loadingSpinner')}>
              <div className={fx('loadingSpinnerCircle')} />
            </div>
            <p className={fx('loadingText')}>Загрузка таблицы...</p>
          </div>
        ) : failed ? (
          <div className={fx('centeredMessage')}>
            <p className={cx(fx('message'), fx('messageError'))}>
              Не удалось загрузить предпросмотр
            </p>
          </div>
        ) : shown === 0 ? (
          <div className={fx('centeredMessage')}>
            <p className={fx('message')}>
              За выбранный период строк нет.
            </p>
          </div>
        ) : (
          <div className={fx('tableWrap')}>
            <table className={fx('table')}>
              <thead>
                <tr>
                  <th className={cx(fx('tableHeadCell'), fx('tableHeadCellCorner'))}>#</th>
                  {cols.map((c) => (
                    <th key={c.header} className={fx('tableHeadCell')}>
                      {c.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.id}>
                    <td className={fx('tableRowNumCell')}>{i + 1}</td>
                    {cols.map((c) => (
                      <td key={c.header}>{c.get(row)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className={cx(fx('tableFootCell'), fx('tableFootCellCorner'))}>Σ</td>
                  {cols.map((c) => (
                    <td key={c.header} className={fx('tableFootCell')}>
                      {c.sum ? fmtMoney(rows.reduce((s, r) => s + c.sum!(r), 0)) : ''}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>


      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.6rem', marginTop: '1rem', flexShrink: 0 }}>
        <button
          type="button"
          className={ap('adminPaymentUrlCopy')}
          onClick={() => runDownload('xlsx')}
          disabled={busy !== null || shown === 0}
        >
          {busy === 'xlsx' ? 'XLSX...' : 'Скачать XLSX'}
        </button>
        <button
          type="button"
          className={ap('adminPaymentUrlCopy')}
          onClick={() => runDownload('csv')}
          disabled={busy !== null || shown === 0}
        >
          {busy === 'csv' ? 'CSV...' : 'Скачать CSV'}
        </button>
      </div>
    </div>
  )
}


const EXPORT_BTN_CHROME: CSSProperties = {
  padding: '.8rem .95rem',
  border: '1px solid var(--border-muted)',
  borderRadius: 'var(--radius)',
}

function ReportsPanel({
  period,
  loading,
  onOpen,
  onCyclePeriod,
}: {
  period: Period
  loading: boolean
  onOpen: (report: ReportDef) => void

  onCyclePeriod: () => void
}) {
  return (
    <div className={fr('reportsZone')} style={{ marginBottom: '2rem' }}>
      <div className={ap('sectionHeader')}>
        <h2 className={ap('sectionTitle')} style={{ margin: 0, fontSize: '1.25rem' }}>
          Отчёты и аналитика
        </h2>
        <div className={fr('headerDatesActions')}>
          <div className={cx(fr('headerRangeWrap'), loading && fr('headerRangeWrapPending'))}>
            <button
              type="button"
              className={cx(ap('tableAction'), fr('headerRangeTrigger'))}
              title="Период отчётов"
              aria-label="Сменить период отчётов"
              onClick={onCyclePeriod}
            >
              «{rangeLabel(period)}»
            </button>
          </div>
        </div>
      </div>

      <p style={{ color: 'var(--fg-muted)', fontSize: '.84rem', lineHeight: 1.45, margin: '0 0 1rem' }}>

        Выберите отчёт, просмотрите таблицу и скачайте XLSX или CSV для учёта и сверки с выплатами.
      </p>

      <div className={fr('exportSection')}>
        <div className={fr('exportGrid')} style={{ display: 'flex', flexWrap: 'wrap', gap: '.6rem' }}>
          {REPORTS.map((report) => (
            <button
              key={report.id}
              type="button"
              className={fr('exportBtn')}
              style={EXPORT_BTN_CHROME}
              onClick={() => onOpen(report)}
            >
              <FileIcon className={fr('exportBtnFileIcon')} />
              <span className={fr('exportBtnBody')}>
                <span className={fr('exportBtnLabel')}>{report.ru}</span>
                {report.important ? (
                  <span className={fr('exportBtnTags')}>
                    <AdminBadge tone="warning">ВАЖНО</AdminBadge>
                  </span>
                ) : null}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}


function PeriodBar({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <div className={ap('adminFinancePeriodBar')} style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem' }}>
      {PERIODS.map((p) => {
        const active = p.key === value
        return (
          <button
            key={p.key}
            type="button"
            className={ap('tableAction')}
            aria-pressed={active}
            onClick={() => onChange(p.key)}
            style={
              active
                ? { background: 'var(--accent-subtle-bg)', color: 'var(--accent-fg)', fontWeight: 600 }
                : { color: 'var(--fg-muted)' }
            }
          >
            {p.label}
          </button>
        )
      })}
    </div>
  )
}


const PAYMENT_URLS: string[] = [
  'https://pay.stelix.team/checkout/robokassa',
  'https://pay.stelix.team/checkout/yoomoney',
  'https://pay.stelix.team/webhooks/payout/heleket',
]

function PaymentUrlBlock() {
  const [copied, setCopied] = useState<string | null>(null)
  const copy = useCallback((url: string) => {
    try {
      navigator.clipboard?.writeText(url)
      setCopied(url)
      window.setTimeout(() => setCopied((c) => (c === url ? null : c)), 1500)
    } catch {

    }
  }, [])
  return (
    <div className={ap('adminPaymentUrlBlock')}>
      {PAYMENT_URLS.map((url) => (
        <div key={url} className={ap('adminPaymentUrlRow')}>
          <span className={ap('adminPaymentUrlRowText')}>{url}</span>
          <button type="button" className={ap('adminPaymentUrlCopy')} onClick={() => copy(url)}>
            {copied === url ? 'Скопировано' : 'Копировать'}
          </button>
        </div>
      ))}
    </div>
  )
}


function moneyValue(n: number): ReactNode {
  return (
    <span className={ap('adminWithdrawalsStripAmountBadge')}>
      <LightningIcon className={ap('tableCellBalanceIcon')} />
      {fmtMoney(n)}
    </span>
  )
}

function KpiStrip({ totals }: { totals: FinanceTotals }) {
  return (
    <AdminMiniStats withdrawals>

      <AdminMiniStat label="Оборот" value={moneyValue(totals.gross)} />
      <AdminMiniStat label="Комиссия" value={moneyValue(totals.fee)} />
      <AdminMiniStat label="К зачислению" value={moneyValue(totals.net)} />
      <AdminMiniStat label="Возвраты" value={moneyValue(totals.refunds)} />
      <AdminMiniStat label="Выплаты" value={moneyValue(totals.payouts)} />
      <AdminMiniStat label="Продажи" value={fmtMoney(totals.count)} />
    </AdminMiniStats>
  )
}

function KpiStripSkeleton() {

  return (
    <div className={ap('adminMiniStats', 'adminTransactionsStripSkeleton')}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={ap('adminMiniStat')}>
          <span className={ap('adminTransactionsStripSkeletonBlock')} style={{ width: '60%', height: '.8rem' }} />
          <span className={ap('adminTransactionsStripSkeletonBlock')} style={{ width: '80%', height: '1.2rem', marginTop: '.4rem' }} />
        </div>
      ))}
    </div>
  )
}


function canRefundTx(tx: FinanceTx): boolean {
  return tx.type === 'sale' && String(tx.status).toUpperCase() !== 'REFUNDED'
}


function FinanceTxDrawer({
  tx,
  busy,
  onClose,
  onRefund,
  onDelete,
}: {
  tx: FinanceTx
  busy: boolean
  onClose: () => void
  onRefund: (id: string) => void
  onDelete: (id: string) => void
}) {
  const refundable = canRefundTx(tx)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const Row = ({ label, children }: { label: string; children: ReactNode }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem', paddingBlock: '.6rem' }}>
      <span className={ap('formLabel')} style={{ fontSize: '.72rem', color: 'var(--fg-muted)', paddingLeft: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: '.9rem', color: 'var(--fg-default)', fontWeight: 500 }}>{children}</span>
    </div>
  )

  return (
    <>
      <div className={ap('editBackdrop')} onClick={onClose} aria-hidden="true" />
      <aside className={ap('editDrawer', 'editDrawerSlideIn')} role="dialog" aria-modal="true" aria-label="Транзакция">
        <div className={ap('editDrawerHeader')}>
          <div className={ap('editDrawerHeaderLeft')}>
            <h3 className={ap('editDrawerTitle')}>Транзакция</h3>
          </div>
          <span className={ap('editDrawerDivider')} aria-hidden="true" />
          <span className={cx(ap('badge', 'badgeMuted'), ap('editDrawerTitleIdBadge'))} title={tx.id}>
            {tx.id}
          </span>
          <button type="button" className={ap('editDrawerClose')} onClick={onClose} aria-label="Закрыть">
            <svg
              className={ap('editDrawerCloseIcon')}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={ap('editDrawerBody')}>
          <div className={ap('editDrawerInnerColumn')}>
            <Row label="Ресурс">{tx.title}</Row>
            <Row label="Пользователь">{tx.user}</Row>
            <Row label="Тип">
              <AdminBadge tone={TYPE_TONE[tx.type]}>{TYPE_RU[tx.type]}</AdminBadge>
            </Row>
            <Row label="Сумма">{fmtMoney(tx.gross)}</Row>
            <Row label="Комиссия">{fmtMoney(tx.fee)}</Row>
            <Row label="К зачислению">{fmtMoney(tx.net)}</Row>
            <Row label="Дата">{fmtDateDmyCommaHm(tx.createdAt)}</Row>
            <Row label="Статус">
              <AdminBadge tone={statusTone(tx.status)}>{statusLabel(tx.status)}</AdminBadge>
            </Row>

            <hr className={ap('editDrawerDivider')} style={{ flex: 'none', width: '100%', margin: '.75rem 0' }} />

            <div className={ap('formActions')} style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={ap('tableActionDanger')}
                onClick={() => onRefund(tx.id)}
                disabled={busy || !refundable}
                style={{
                  textAlign: 'center',
                  border: '1px solid var(--border-muted)',
                  minHeight: '2.5rem',
                  opacity: busy || !refundable ? 0.5 : 1,
                  cursor: busy || !refundable ? 'not-allowed' : 'pointer',
                }}
              >
                {busy ? 'Возврат…' : 'Оформить возврат'}
              </button>
              <button
                type="button"
                className={ap('tableActionDanger')}
                onClick={() => onDelete(tx.id)}
                disabled={busy}
                style={{
                  textAlign: 'center',
                  border: '1px solid var(--border-muted)',
                  minHeight: '2.5rem',
                  opacity: busy ? 0.5 : 1,
                  cursor: busy ? 'not-allowed' : 'pointer',
                }}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}


interface AdminUserLite {
  id: number
  name: string
  email: string
  handle: string
  balance: number
  payable: number
  role: string
  status: string
}
interface UsersListResponse {
  items: AdminUserLite[]
  total: number
  page: number
  pageSize: number
}

type CorrectionMode = 'adjust' | 'balance'

const CORRECTION_MODES: { key: CorrectionMode; label: string }[] = [
  { key: 'adjust', label: 'Изменить на' },
  { key: 'balance', label: 'Установить' },
]

function userLabel(u: AdminUserLite): string {
  return u.email || u.handle || `#${u.id}`
}

function BalanceCorrectionDrawer({
  onClose,
  onApplied,
}: {
  onClose: () => void

  onApplied: () => void
}) {
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<AdminUserLite[]>([])
  const [searching, setSearching] = useState(false)

  const [selected, setSelected] = useState<AdminUserLite | null>(null)
  const [mode, setMode] = useState<CorrectionMode>('adjust')
  const [balanceInput, setBalanceInput] = useState('')
  const [payableInput, setPayableInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null)


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])


  useEffect(() => {
    const id = window.setTimeout(() => setQuery(search.trim()), 300)
    return () => window.clearTimeout(id)
  }, [search])


  const reqRef = useRef(0)
  useEffect(() => {
    if (selected) return
    const req = ++reqRef.current
    const controller = new AbortController()
    setSearching(true)
    const qs = new URLSearchParams({ page: '1', pageSize: '8' })
    if (query) qs.set('q', query)
    fetch(`/api/admin/users?${qs.toString()}`, { credentials: 'same-origin', signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<UsersListResponse>
      })
      .then((data) => {
        if (req !== reqRef.current) return
        setUsers(Array.isArray(data.items) ? data.items : [])
        setSearching(false)
      })
      .catch(() => {
        if (controller.signal.aborted || req !== reqRef.current) return
        setUsers([])
        setSearching(false)
      })
    return () => controller.abort()
  }, [query, selected])

  const pick = useCallback(
    (u: AdminUserLite) => {
      setSelected(u)
      setResult(null)
      if (mode === 'balance') {
        setBalanceInput(String(u.balance))
        setPayableInput(String(u.payable))
      } else {
        setBalanceInput('')
        setPayableInput('')
      }
    },
    [mode],
  )

  const changeMode = useCallback(
    (m: CorrectionMode) => {
      setMode(m)
      setResult(null)
      if (m === 'balance' && selected) {
        setBalanceInput(String(selected.balance))
        setPayableInput(String(selected.payable))
      } else {
        setBalanceInput('')
        setPayableInput('')
      }
    },
    [selected],
  )

  const changeUser = useCallback(() => {
    setSelected(null)
    setResult(null)
    setBalanceInput('')
    setPayableInput('')
  }, [])


  const buildPayload = useCallback((): {
    action: CorrectionMode
    balance?: number
    payable?: number
  } | null => {
    const payload: { action: CorrectionMode; balance?: number; payable?: number } = { action: mode }
    const b = balanceInput.trim()
    const p = payableInput.trim()
    if (b !== '') {
      const n = Number(b)
      if (!Number.isFinite(n)) return null
      payload.balance = n
    }
    if (p !== '') {
      const n = Number(p)
      if (!Number.isFinite(n)) return null
      payload.payable = n
    }
    if (payload.balance === undefined && payload.payable === undefined) return null
    return payload
  }, [mode, balanceInput, payableInput])

  const submit = useCallback(async () => {
    if (!selected || submitting) return
    const payload = buildPayload()
    if (!payload) {
      setResult({ ok: false, msg: 'Введите сумму по балансу и/или выплатам.' })
      return
    }
    setSubmitting(true)
    setResult(null)
    try {
      const res = await fetch(`/api/admin/users/${selected.id}`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const body = (await res.json()) as { ok?: boolean; item?: AdminUserLite }
      if (!body.ok || !body.item) throw new Error('bad_envelope')
      const item = body.item
      setSelected((prev) => (prev ? { ...prev, balance: item.balance, payable: item.payable } : prev))
      if (mode === 'adjust') {
        setBalanceInput('')
        setPayableInput('')
      } else {
        setBalanceInput(String(item.balance))
        setPayableInput(String(item.payable))
      }
      setResult({
        ok: true,
        msg: `Готово. Баланс: ${fmtMoney(item.balance)} · К выплате: ${fmtMoney(item.payable)}`,
      })
      onApplied()
    } catch {
      setResult({ ok: false, msg: 'Не удалось применить корректировку.' })
    } finally {
      setSubmitting(false)
    }
  }, [selected, submitting, buildPayload, mode, onApplied])

  const modeHint =
    mode === 'adjust'
      ? 'Сумма прибавится к текущему значению (можно отрицательную).'
      : 'Значение будет установлено напрямую.'

  return (
    <>
      <div className={ap('editBackdrop')} onClick={onClose} aria-hidden="true" />
      <aside
        className={ap('editDrawer', 'editDrawerSlideIn')}
        role="dialog"
        aria-modal="true"
        aria-label="Корректировка баланса"
      >
        <div className={ap('editDrawerHeader')}>
          <div className={ap('editDrawerHeaderLeft')}>
            <h3 className={ap('editDrawerTitle')}>Корректировка баланса</h3>
          </div>
          {selected ? (
            <>
              <span className={ap('editDrawerDivider')} aria-hidden="true" />
              <span className={cx(ap('badge', 'badgeMuted'), ap('editDrawerTitleIdBadge'))} title={String(selected.id)}>
                #{selected.id}
              </span>
            </>
          ) : null}
          <button type="button" className={ap('editDrawerClose')} onClick={onClose} aria-label="Закрыть">
            <svg
              className={ap('editDrawerCloseIcon')}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={ap('editDrawerBody')}>
          <div className={ap('formBody')}>
            <div className={ap('editDrawerInnerColumn')}>
              {!selected ? (
                <>

                  <div className={ap('formGroup')}>
                    <label className={ap('formLabel')}>Пользователь</label>
                    <AdminSearchInput
                      value={search}
                      onChange={setSearch}
                      onClear={() => setSearch('')}
                      pending={searching}
                      placeholder="Имя, email или ID"
                    />
                  </div>
                  <div className={ap('adminPaymentUrlBlock')}>
                    {users.length === 0 ? (
                      <div className={ap('adminPaymentUrlRow')}>
                        <span className={ap('adminPaymentUrlRowText')} style={{ color: 'var(--fg-muted)' }}>
                          {searching ? 'Поиск…' : 'Пользователи не найдены'}
                        </span>
                      </div>
                    ) : (
                      users.map((u) => (
                        <div key={u.id} className={ap('adminPaymentUrlRow')}>
                          <span className={ap('adminPaymentUrlRowText')}>
                            {u.name} · {userLabel(u)} · Б {fmtMoney(u.balance)} / В {fmtMoney(u.payable)}
                          </span>
                          <button
                            type="button"
                            className={ap('adminPaymentUrlCopy')}
                            onClick={() => pick(u)}
                          >
                            Выбрать
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <>

                  <div className={ap('formInfo')}>
                    <span className={ap('formInfoLabel')}>Пользователь</span>
                    <span className={ap('formInfoValue')}>{selected.name} · {userLabel(selected)}</span>
                  </div>
                  <div className={ap('formInfo')}>
                    <span className={ap('formInfoLabel')}>Текущий баланс</span>
                    <span className={ap('formInfoValue')}>{fmtMoney(selected.balance)}</span>
                  </div>
                  <div className={ap('formInfo')}>
                    <span className={ap('formInfoLabel')}>К выплате</span>
                    <span className={ap('formInfoValue')}>{fmtMoney(selected.payable)}</span>
                  </div>

                  <div className={ap('editDrawerDivider')} />


                  <div className={ap('formGroup')}>
                    <label className={ap('formLabel')}>Тип корректировки</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem' }}>
                      {CORRECTION_MODES.map((m) => {
                        const active = m.key === mode
                        return (
                          <button
                            key={m.key}
                            type="button"
                            className={ap('tableAction')}
                            aria-pressed={active}
                            onClick={() => changeMode(m.key)}
                            style={
                              active
                                ? { background: 'var(--accent-subtle-bg)', color: 'var(--accent-fg)', fontWeight: 600 }
                                : { color: 'var(--fg-muted)' }
                            }
                          >
                            {m.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className={ap('formGroup')}>
                    <label className={ap('formLabel')} htmlFor="corr-balance">
                      Баланс
                    </label>
                    <input
                      id="corr-balance"
                      type="number"
                      inputMode="numeric"
                      className={ap('formInput')}
                      value={balanceInput}
                      onChange={(e) => setBalanceInput(e.target.value)}
                      placeholder={mode === 'adjust' ? '0' : String(selected.balance)}
                      disabled={submitting}
                    />
                  </div>

                  <div className={ap('formGroup')}>
                    <label className={ap('formLabel')} htmlFor="corr-payable">
                      Выплаты
                    </label>
                    <input
                      id="corr-payable"
                      type="number"
                      inputMode="numeric"
                      className={ap('formInput')}
                      value={payableInput}
                      onChange={(e) => setPayableInput(e.target.value)}
                      placeholder={mode === 'adjust' ? '0' : String(selected.payable)}
                      disabled={submitting}
                    />
                  </div>

                  <p className={ap('formHint')}>{modeHint}</p>

                  {result ? (
                    result.ok ? (
                      <div className={ap('formInfo')}>
                        <span className={ap('formInfoLabel')}>Результат</span>
                        <span className={ap('formInfoValue')}>
                          <AdminBadge tone="success">{result.msg}</AdminBadge>
                        </span>
                      </div>
                    ) : (
                      <p className={ap('formError')}>{result.msg}</p>
                    )
                  ) : null}
                </>
              )}
            </div>

            {selected ? (
              <div className={ap('editUserAccountActions')}>
                <button
                  type="button"
                  className={ap('formBtnPrimary')}
                  onClick={() => void submit()}
                  disabled={submitting}
                >
                  {submitting ? 'Применение…' : 'Применить'}
                </button>
                <button
                  type="button"
                  className={ap('formBtnSecondary')}
                  onClick={changeUser}
                  disabled={submitting}
                >
                  Выбрать другого
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  )
}


export function FinanceSection() {
  const [period, setPeriod] = useState<Period>('all')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')

  const [data, setData] = useState<FinanceResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)


  const [reloadKey, setReloadKey] = useState(0)
  const refetch = useCallback(() => setReloadKey((k) => k + 1), [])

  const [actionBusy, setActionBusy] = useState<string | null>(null)
  const [drawerId, setDrawerId] = useState<string | null>(null)

  const [openReport, setOpenReport] = useState<ReportDef | null>(null)

  const [correctionOpen, setCorrectionOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])


  const cyclePeriod = useCallback(() => {
    setPeriod((p) => {
      const idx = PERIODS.findIndex((x) => x.key === p)
      return PERIODS[(idx + 1) % PERIODS.length].key
    })
  }, [])


  useEffect(() => {
    const id = window.setTimeout(() => setQuery(search.trim()), 300)
    return () => window.clearTimeout(id)
  }, [search])


  useEffect(() => {
    setPage(1)
  }, [period, query, status])


  const reqRef = useRef(0)
  useEffect(() => {
    const req = ++reqRef.current
    const controller = new AbortController()
    setLoading(true)
    setError(false)
    const qs = new URLSearchParams({ period, page: String(page), pageSize: String(PAGE_SIZE) })
    if (query) qs.set('q', query)
    if (status) qs.set('status', status)
    fetch(`/api/admin/finance?${qs.toString()}`, { credentials: 'same-origin', signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<FinanceResponse>
      })
      .then((json) => {
        if (req !== reqRef.current) return
        setData(json)
        setLoading(false)
      })
      .catch(() => {
        if (controller.signal.aborted || req !== reqRef.current) return
        setError(true)
        setLoading(false)
      })
    return () => controller.abort()
  }, [period, page, query, status, reloadKey])


  const refund = useCallback(
    (id: string) => {
      if (actionBusy) return
      setActionBusy(id)
      setDrawerId(null)

      setData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((t) =>
                t.id === id ? { ...t, type: 'refund' as FinanceType, status: 'REFUNDED' } : t,
              ),
            }
          : prev,
      )
      fetch(`/api/admin/purchases/${encodeURIComponent(id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ action: 'refund' }),
      })
        .catch(() => {

        })
        .finally(() => {
          setActionBusy(null)
          refetch()
        })
    },
    [actionBusy, refetch],
  )

  const remove = useCallback(
    (id: string) => {
      if (actionBusy) return
      if (typeof window !== 'undefined' && !window.confirm('Удалить транзакцию?')) return
      setActionBusy(id)
      setDrawerId(null)

      setData((prev) =>
        prev
          ? { ...prev, items: prev.items.filter((t) => t.id !== id), total: Math.max(0, prev.total - 1) }
          : prev,
      )
      fetch(`/api/admin/purchases/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      })
        .catch(() => {

        })
        .finally(() => {
          setActionBusy(null)
          refetch()
        })
    },
    [actionBusy, refetch],
  )

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const columns = useMemo<AdminColumn<FinanceTx>[]>(
    () => [

      {
        key: 'user',
        header: 'Пользователь',
        cellClassName: ap('tableCellTxUser'),
        cell: (t) => <TxUserCell tx={t} />,
      },
      {
        key: 'details',
        header: 'Операция',
        cellClassName: ap('tableCellTxDetails'),
        cell: (t) => <TxDescriptionCell tx={t} />,
      },
      {
        key: 'type',
        header: 'Тип',
        cell: (t) => <AdminBadge tone={TYPE_TONE[t.type]}>{TYPE_RU[t.type]}</AdminBadge>,
      },
      {
        key: 'amount',
        header: 'Сумма',
        align: 'end',
        cellClassName: ap('tableCellTxAmount'),
        cell: (t) => <TxAmountChip tx={t} />,
      },
      {
        key: 'fee',
        header: 'Комиссия',
        cellClassName: ap('tableCellTxBalance'),
        cell: (t) => <BalanceBlock value={t.fee} kind="комиссия" tone="frozenAmount" />,
      },
      {
        key: 'net',
        header: 'К зачислению',
        cellClassName: ap('tableCellTxBalance'),
        cell: (t) => <BalanceBlock value={t.net} kind="к зачислению" tone="positive" />,
      },
      {
        key: 'date',
        header: 'Дата',
        align: 'end',
        cellClassName: ap('tableCellTxDate'),
        cell: (t) => fmtDateDmyCommaHm(t.createdAt),
      },
      {
        key: 'status',
        header: 'Статус',
        cell: (t) => <AdminBadge tone={statusTone(t.status)}>{statusLabel(t.status)}</AdminBadge>,
      },
      {
        key: 'actions',
        header: '',
        align: 'actions',

        cell: (t) => {
          const busy = actionBusy === t.id
          const refundable = canRefundTx(t)
          return (
            <>
              <AdminIconButton label="Открыть" tone="neutral" disabled={busy} onClick={() => setDrawerId(t.id)}>
                <ViewActionIcon />
              </AdminIconButton>
              <AdminIconButton
                label="Оформить возврат"
                tone="warning"
                disabled={busy || !refundable}
                onClick={() => refund(t.id)}
              >
                <RefundActionIcon />
              </AdminIconButton>
              <AdminIconButton label="Удалить" tone="danger" disabled={busy} onClick={() => remove(t.id)}>
                <DeleteActionIcon />
              </AdminIconButton>
            </>
          )
        },
      },
    ],
    [actionBusy, refund, remove],
  )

  const drawerTx = drawerId ? items.find((t) => t.id === drawerId) ?? null : null

  return (
    <section className={ap('adminFinanceSection')}>
      <AdminSectionHeader title="Финансы">

        <button
          type="button"
          className={ap('adminPaymentUrlCopy')}
          onClick={() => setCorrectionOpen(true)}
        >
          Корректировка баланса
        </button>
      </AdminSectionHeader>

      <PeriodBar value={period} onChange={setPeriod} />

      {loading && !data ? <KpiStripSkeleton /> : data ? <KpiStrip totals={data.totals} /> : null}

      <ReportsPanel period={period} loading={loading} onOpen={setOpenReport} onCyclePeriod={cyclePeriod} />

      <AdminFilterBar>
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
          pending={loading}
          placeholder="Поиск"
        />
        <select
          className={ap('formInput')}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Статус"
        >
          <option value="">Все статусы</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
      </AdminFilterBar>

      <AdminTable
        variant="Tx"
        columns={columns}
        rows={items}
        rowKey={(t) => t.id}
        loading={loading}
        ariaLabel="Транзакции"
        emptyText={
          error ? 'Не удалось загрузить транзакции' : 'Транзакций не найдено'
        }
      />

      {total > 0 ? (
        <AdminPagination
          page={page}
          pageCount={pageCount}
          onPageChange={setPage}
          total={total}
          pageSize={PAGE_SIZE}
        />
      ) : null}

      <PaymentUrlBlock />

      {drawerTx ? (
        <FinanceTxDrawer
          tx={drawerTx}
          busy={actionBusy === drawerTx.id}
          onClose={() => setDrawerId(null)}
          onRefund={refund}
          onDelete={remove}
        />
      ) : null}

      {correctionOpen ? (
        <BalanceCorrectionDrawer onClose={() => setCorrectionOpen(false)} onApplied={refetch} />
      ) : null}

      {mounted && openReport
        ? createPortal(
            <ExportPreviewOverlay
              report={openReport}
              period={period}
              onClose={() => setOpenReport(null)}
            />,
            document.body,
          )
        : null}
    </section>
  )
}

export default FinanceSection
