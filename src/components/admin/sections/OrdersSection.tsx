'use client'


import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  ap,
  AdminBadge,
  type BadgeTone,
  AdminPagination,
  AdminSectionHeader,
  AdminSearchInput,
  AdminFilterBar,
  AdminIconButton,
  ADMIN_ICONS,
  AdminEmptyState,
  AdminLoading,
} from '@/components/admin/ui'
import { EditActionIcon, RefundActionIcon, BlockActionIcon } from './AdminActionIcons'


interface AdminOrderRow {
  id: string
  title: string
  budget: number
  customer: string
  customerId: number
  executor: string | null
  executorId: number | null
  status: string
  createdAt: string
  updatedAt: string
}

interface OrdersResponse {
  items: AdminOrderRow[]
  total: number
  page: number
  pageSize: number
}


interface StatusMeta {
  label: string
  tone: BadgeTone
}

const STATUS_META: Record<string, StatusMeta> = {
  OPEN: { label: 'Открыт', tone: 'info' },
  IN_PROGRESS: { label: 'Выполняется', tone: 'warning' },
  DISPUTED: { label: 'Спор', tone: 'warning' },
  COMPLETED: { label: 'Завершен', tone: 'success' },
  CANCELLED: { label: 'Отменен', tone: 'danger' },
  REFUNDED: { label: 'Возврат', tone: 'muted' },
}

function statusMeta(status: string): StatusMeta {
  return STATUS_META[String(status ?? '').toUpperCase()] ?? { label: status || '—', tone: 'muted' }
}


const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'Все' },
  { value: 'OPEN', label: 'Открытые' },
  { value: 'IN_PROGRESS', label: 'Выполняется' },
  { value: 'DISPUTED', label: 'Споры' },
  { value: 'COMPLETED', label: 'Завершенные' },
  { value: 'CANCELLED', label: 'Отмененные' },
  { value: 'REFUNDED', label: 'Возвраты' },
]


const HEADERS = {
  title: 'Заказ',
  budget: 'Бюджет',
  customer: 'Заказчик',
  executor: 'Исполнитель',
  published: 'Опубликован',
  modified: 'Изменён',
  status: 'Статус',
  actions: 'Действия',
} as const

const PAGE_SIZE = 20


function formatSiteDateDmyCommaHm(iso: string, _locale?: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getUTCDate())}.${p(d.getUTCMonth() + 1)}.${d.getUTCFullYear()}, ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`
}

const RU_NUMBER = new Intl.NumberFormat('ru-RU')

function formatBudget(value: number): string {
  return `${RU_NUMBER.format(value)} ₽`
}


function useLocale(): string {
  const [locale, setLocale] = useState('ru')
  useEffect(() => {
    try {
      const seg = window.location.pathname.split('/').filter(Boolean)[0]
      if (seg === 'ru' || seg === 'uk') setLocale(seg)
    } catch {

    }
  }, [])
  return locale
}


type SortKey = 'title' | 'budget' | 'published' | 'modified'
type SortDir = 'asc' | 'desc'

function sortRows(rows: AdminOrderRow[], key: SortKey, dir: SortDir): AdminOrderRow[] {
  const factor = dir === 'asc' ? 1 : -1
  const cmp = (a: AdminOrderRow, b: AdminOrderRow): number => {
    switch (key) {
      case 'title':
        return a.title.localeCompare(b.title, 'ru')
      case 'budget':
        return a.budget - b.budget
      case 'published':
        return Date.parse(a.createdAt) - Date.parse(b.createdAt)
      case 'modified':
        return Date.parse(a.updatedAt) - Date.parse(b.updatedAt)
      default:
        return 0
    }
  }
  return [...rows].sort((a, b) => cmp(a, b) * factor)
}


export function OrdersSection() {
  const locale = useLocale()

  const [rows, setRows] = useState<AdminOrderRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('')


  const [sortKey, setSortKey] = useState<SortKey>('published')
  const [sortDir, setSortDir] = useState<SortDir>('desc')


  const [editing, setEditing] = useState<AdminOrderRow | null>(null)

  const [busy, setBusy] = useState(false)


  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => window.clearTimeout(id)
  }, [search])


  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status])


  const reqId = useRef(0)
  const fetchOrders = useCallback(
    (opts?: { silent?: boolean }) => {
      const mine = ++reqId.current
      if (!opts?.silent) setLoading(true)
      setError(null)

      const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
      if (debouncedSearch) params.set('q', debouncedSearch)
      if (status) params.set('status', status)

      return fetch(`/api/admin/orders?${params.toString()}`, {
        credentials: 'same-origin',
        headers: { accept: 'application/json' },
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(res.status === 401 ? 'Требуется авторизация' : `Ошибка ${res.status}`)
          return (await res.json()) as OrdersResponse
        })
        .then((data) => {
          if (mine !== reqId.current) return
          setRows(Array.isArray(data.items) ? data.items : [])
          setTotal(typeof data.total === 'number' ? data.total : 0)
        })
        .catch((err: unknown) => {
          if (mine !== reqId.current) return
          setRows([])
          setTotal(0)
          setError(err instanceof Error ? err.message : 'Не удалось загрузить заказы')
        })
        .finally(() => {
          if (mine === reqId.current) setLoading(false)
        })
    },
    [page, debouncedSearch, status],
  )

  useEffect(() => {
    void fetchOrders()
  }, [fetchOrders])

  const sorted = useMemo(() => sortRows(rows, sortKey, sortDir), [rows, sortKey, sortDir])
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const toggleSort = useCallback((key: SortKey) => {
    setSortKey((prevKey) => {
      if (prevKey === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
        return prevKey
      }

      setSortDir(key === 'title' ? 'asc' : 'desc')
      return key
    })
  }, [])


  const runOrderAction = useCallback(
    async (
      id: string,
      action: string,
      data: Record<string, unknown>,
      optimistic?: Partial<AdminOrderRow>,
    ): Promise<boolean> => {
      setBusy(true)
      if (optimistic) {
        setRows((prev) => prev.map((o) => (o.id === id ? { ...o, ...optimistic } : o)))
      }
      let ok = false
      try {
        const res = await fetch(`/api/admin/orders/${encodeURIComponent(id)}`, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'content-type': 'application/json', accept: 'application/json' },
          body: JSON.stringify({ action, ...data }),
        })
        ok = res.ok
      } catch {
        ok = false
      } finally {
        await fetchOrders({ silent: true })
        setBusy(false)
      }
      return ok
    },
    [fetchOrders],
  )


  const saveOrder = useCallback(
    async (id: string, nextStatus: string) => {
      const known = nextStatus in STATUS_META
      await runOrderAction(
        id,
        'setStatus',
        known ? { status: nextStatus } : {},
        known ? { status: nextStatus } : undefined,
      )
      setEditing(null)
    },
    [runOrderAction],
  )


  const cancelOrder = useCallback(
    async (id: string) => {
      await runOrderAction(id, 'setStatus', { status: 'CANCELLED' }, { status: 'CANCELLED' })
      setEditing(null)
    },
    [runOrderAction],
  )


  const setOrderStatus = useCallback(
    (id: string, next: string) => runOrderAction(id, 'setStatus', { status: next }, { status: next }),
    [runOrderAction],
  )


  const resolveDispute = useCallback(
    async (id: string, outcome: 'executor' | 'client', note?: string) => {
      const next = outcome === 'executor' ? 'COMPLETED' : 'REFUNDED'
      const trimmed = (note ?? '').trim()
      if (trimmed) {
        await runOrderAction(id, 'update', { status: next, note: trimmed }, { status: next })
      } else {
        await runOrderAction(id, 'setStatus', { status: next }, { status: next })
      }
      setEditing(null)
    },
    [runOrderAction],
  )


  useEffect(() => {
    if (!editing) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setEditing(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editing])


  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, total)
  const summary = `${from} - ${to} из ${total}`


  const sortGlyph = (key: SortKey) => {
    const active = sortKey === key
    return (
      <span className={ap('tableSortGlyph')} aria-hidden="true">
        <svg
          className={ap('tableSortGlyphSvg')}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: active && sortDir === 'asc' ? 'rotate(180deg)' : undefined, opacity: active ? 1 : 0.4 }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    )
  }

  const sortHeader = (label: string, key: SortKey, align: 'start' | 'center' | 'end') => {
    const alignClass = align === 'center' ? 'tableSortHeaderCenter' : align === 'end' ? 'tableSortHeaderEnd' : null
    const active = sortKey === key
    return (
      <button
        type="button"
        className={ap('tableSortHeader', alignClass)}
        onClick={() => toggleSort(key)}
        aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
      >
        <span className={ap('tableSortHeaderInner')}>
          <span className={ap('tableSortHeaderLabel')}>{label}</span>
          {sortGlyph(key)}
        </span>
      </button>
    )
  }

  const plainHeader = (label: string, align: 'start' | 'center' | 'end') => {
    const alignClass = align === 'center' ? 'tableSortHeaderCenter' : align === 'end' ? 'tableSortHeaderEnd' : null
    return (
      <span className={ap('tableSortHeader', alignClass)}>
        <span className={ap('tableSortHeaderInner')}>
          <span className={ap('tableSortHeaderLabel')}>{label}</span>
        </span>
      </span>
    )
  }

  return (
    <section className={ap('section')}>

      <AdminSectionHeader title="Заказы">
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
          placeholder="Поиск"
          pending={loading && debouncedSearch !== search}
          ariaLabel="Поиск заказов"
        />
      </AdminSectionHeader>


      <AdminFilterBar>
        {STATUS_FILTERS.map((f) => {
          const active = status === f.value
          const tone: BadgeTone = active ? (f.value ? statusMeta(f.value).tone : 'default') : 'muted'
          return (
            <button
              key={f.value || 'all'}
              type="button"
              onClick={() => setStatus(f.value)}
              aria-pressed={active}
              style={{ border: 'none', background: 'none', padding: 0, margin: 0, cursor: 'pointer', font: 'inherit', lineHeight: 0 }}
            >
              <AdminBadge tone={tone} style={active ? undefined : { opacity: 0.7 }}>
                {f.label}
              </AdminBadge>
            </button>
          )
        })}
      </AdminFilterBar>


      <div className={ap('tableWrap')} role="table" aria-label="Заказы">

        <div className={ap('tableRow', 'tableHeader', 'tableHeaderOrders')} role="row">
          <div className={ap('tableCell')} role="columnheader">
            {sortHeader(HEADERS.title, 'title', 'start')}
          </div>
          <div className={ap('tableCell', 'tableCellCenter')} role="columnheader">
            {sortHeader(HEADERS.budget, 'budget', 'center')}
          </div>
          <div className={ap('tableCell')} role="columnheader">
            {plainHeader(HEADERS.customer, 'start')}
          </div>
          <div className={ap('tableCell')} role="columnheader">
            {plainHeader(HEADERS.executor, 'start')}
          </div>
          <div className={ap('tableCell', 'tableCellAlignEnd')} role="columnheader">
            {sortHeader(HEADERS.published, 'published', 'end')}
          </div>
          <div className={ap('tableCell', 'tableCellAlignEnd')} role="columnheader">
            {sortHeader(HEADERS.modified, 'modified', 'end')}
          </div>
          <div className={ap('tableCell', 'tableCellCenter')} role="columnheader">
            {plainHeader(HEADERS.status, 'center')}
          </div>

          <div className={ap('tableCell', 'tableCellActionCol')} role="columnheader">
            {HEADERS.actions}
          </div>
        </div>

        {loading ? (
          <AdminLoading />
        ) : error ? (
          <AdminEmptyState text={error} />
        ) : sorted.length === 0 ? (

          <AdminEmptyState text="Заказы не найдены" />
        ) : (
          sorted.map((o) => {
            const meta = statusMeta(o.status)
            const su = String(o.status ?? '').toUpperCase()
            const isTerminal = su === 'CANCELLED' || su === 'REFUNDED'
            return (
              <div
                key={o.id}
                className={ap('tableRow', 'tableRowOrders', 'tableRowOverlayLinkHost')}
                role="row"
              >

                <a
                  className={ap('tableRowOverlayLink')}
                  href={`/${locale}/orders/${o.id}`}
                  aria-label={`Открыть заказ: ${o.title}`}
                  onClick={(e) => {
                    e.preventDefault()
                    setEditing(o)
                  }}
                />


                <div className={ap('tableCell', 'tableCellResourceTitle')} role="cell">
                  {o.title}
                </div>


                <div className={ap('tableCell', 'tableCellCenter')} role="cell">
                  {formatBudget(o.budget)}
                </div>


                <div className={ap('tableCell')} role="cell">
                  <div className={ap('tableCellUserIdentity')}>
                    <span className={ap('tableCellUserName')}>{o.customer}</span>
                    <span className={ap('tableCellUserEmail')}>{`user-${o.customerId}`}</span>
                  </div>
                </div>


                <div className={ap('tableCell')} role="cell">
                  {o.executor ? (
                    <div className={ap('tableCellUserIdentity')}>
                      <span className={ap('tableCellUserName')}>{o.executor}</span>
                      <span className={ap('tableCellUserEmail')}>{`id ${o.executorId ?? '—'}`}</span>
                    </div>
                  ) : (
                    <span className={ap('tableCellMuted')}>—</span>
                  )}
                </div>


                <div className={ap('tableCell', 'tableCellDateSingle', 'tableCellAlignEnd')} role="cell">
                  {formatSiteDateDmyCommaHm(o.createdAt, locale)}
                </div>


                <div className={ap('tableCell', 'tableCellDateSingle', 'tableCellAlignEnd')} role="cell">
                  {formatSiteDateDmyCommaHm(o.updatedAt, locale)}
                </div>


                <div className={ap('tableCell', 'tableCellCenter')} role="cell">
                  <AdminBadge tone={meta.tone}>{meta.label}</AdminBadge>
                </div>


                <div
                  className={ap('tableCell', 'tableCellActions', 'tableCellActionCol', 'tableRowOverlayActions')}
                  role="cell"
                >

                  <AdminIconButton
                    label="Модерация заказа"
                    tone="neutral"
                    onClick={() => setEditing(o)}
                  >
                    <EditActionIcon />
                  </AdminIconButton>


                  <AdminIconButton
                    label="Завершить заказ"
                    tone="success"
                    iconPath={ADMIN_ICONS.check}
                    disabled={busy || su === 'COMPLETED'}
                    onClick={() => {
                      if (su === 'COMPLETED') return
                      void setOrderStatus(o.id, 'COMPLETED')
                    }}
                  />


                  <AdminIconButton
                    label="Оформить возврат"
                    tone="warning"
                    disabled={busy || isTerminal}
                    onClick={() => {
                      if (isTerminal) return
                      if (typeof window !== 'undefined' && !window.confirm('Оформить возврат по этому заказу?')) return
                      void setOrderStatus(o.id, 'REFUNDED')
                    }}
                  >
                    <RefundActionIcon />
                  </AdminIconButton>


                  <AdminIconButton
                    label="Отменить заказ"
                    tone="danger"
                    disabled={busy || su === 'CANCELLED'}
                    onClick={() => {
                      if (su === 'CANCELLED') return
                      if (typeof window !== 'undefined' && !window.confirm('Отменить этот заказ?')) return
                      void setOrderStatus(o.id, 'CANCELLED')
                    }}
                  >
                    <BlockActionIcon />
                  </AdminIconButton>
                </div>
              </div>
            )
          })
        )}
      </div>


      {!loading && !error && total > 0 ? (
        <AdminPagination
          page={page}
          pageCount={pageCount}
          onPageChange={setPage}
          summary={summary}
        />
      ) : null}


      {editing ? (
        <OrderEditDrawer
          order={editing}
          locale={locale}
          busy={busy}
          onSave={saveOrder}
          onCancelOrder={cancelOrder}
          onResolve={resolveDispute}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </section>
  )
}


function OrderEditDrawer({
  order,
  locale,
  busy,
  onSave,
  onCancelOrder,
  onResolve,
  onClose,
}: {
  order: AdminOrderRow
  locale: string
  busy: boolean
  onSave: (id: string, status: string) => void
  onCancelOrder: (id: string) => void
  onResolve: (id: string, outcome: 'executor' | 'client', note?: string) => void
  onClose: () => void
}) {

  const [draftStatus, setDraftStatus] = useState(String(order.status ?? '').toUpperCase())

  const [note, setNote] = useState('')
  const shortId = order.id.length > 8 ? order.id.slice(-6) : order.id
  const su = String(order.status ?? '').toUpperCase()
  const isDisputed = su === 'DISPUTED'
  const currentMeta = statusMeta(order.status)

  return (
    <>
      <div className={ap('editBackdrop', 'adminDrawerBackdropFadeIn')} onClick={onClose} aria-hidden="true" />
      <div
        className={ap('editDrawer', 'editDrawerSlideIn')}
        role="dialog"
        aria-modal="true"
        aria-label={`Заказ: ${order.title}`}
      >
        <div className={ap('editDrawerHeader')}>
          <div className={ap('editDrawerHeaderLeft')}>
            <h3 className={ap('editDrawerTitle')}>Заказ</h3>
            <span className={ap('editDrawerTitleIdBadge')}>{`#${shortId}`}</span>
          </div>
          <button type="button" className={ap('editDrawerClose')} onClick={onClose} aria-label="Закрыть">
            <svg
              className={ap('editDrawerCloseIcon')}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
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
            <div className={ap('formGroup')}>
              <label className={ap('formLabel')}>Название</label>
              <input className={ap('formInput')} value={order.title} readOnly />
            </div>

            <div className={ap('formGroup')}>
              <label className={ap('formLabel')}>Бюджет</label>
              <input className={ap('formInput')} value={formatBudget(order.budget)} readOnly />
            </div>

            <div className={ap('formGroup')}>
              <label className={ap('formLabel')}>Заказчик</label>
              <input className={ap('formInput')} value={`${order.customer} (user-${order.customerId})`} readOnly />
            </div>

            <div className={ap('formGroup')}>
              <label className={ap('formLabel')}>Исполнитель</label>
              <input
                className={ap('formInput')}
                value={order.executor ? `${order.executor} (id ${order.executorId ?? '—'})` : '—'}
                readOnly
              />
            </div>

            <div className={ap('formGroup')}>
              <label className={ap('formLabel')}>Статус</label>

              <select
                className={ap('formInput')}
                value={draftStatus in STATUS_META ? draftStatus : ''}
                onChange={(e) => setDraftStatus(e.target.value)}
              >
                {!(draftStatus in STATUS_META) ? <option value="">{order.status || '—'}</option> : null}
                {Object.entries(STATUS_META).map(([value, meta]) => (
                  <option key={value} value={value}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={ap('formGroup')}>
              <label className={ap('formLabel')}>Опубликован</label>
              <input className={ap('formInput')} value={formatSiteDateDmyCommaHm(order.createdAt, locale)} readOnly />
            </div>

            <div className={ap('editDrawerDivider')} />


            <div className={ap('formInfo')}>
              <span className={ap('formInfoLabel')}>Текущий статус</span>
              <div className={ap('formInfoStatusRow')}>
                <AdminBadge tone={currentMeta.tone}>{currentMeta.label}</AdminBadge>
              </div>
            </div>


            <div className={ap('formGroup')}>
              <label className={ap('formLabel')}>Разрешение спора</label>
              <p className={ap('formHint')}>
                {isDisputed
                  ? 'По этому заказу открыт спор. Выберите сторону — решение применяется сразу.'
                  : 'Закрыть сделку в пользу одной из сторон. Комментарий сохраняется в заказе.'}
              </p>
              <textarea
                className={ap('formTextarea')}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Комментарий модератора (необязательно)"
                rows={3}
              />
              <div className={ap('formActionsRow')}>
                <button
                  type="button"
                  className={ap('formBtnSuccess')}
                  onClick={() => onResolve(order.id, 'executor', note)}
                  disabled={busy || su === 'COMPLETED'}
                >
                  В пользу исполнителя
                </button>
                <button
                  type="button"
                  className={ap('formBtnDanger')}
                  onClick={() => {
                    if (typeof window === 'undefined' || window.confirm('Вернуть средства заказчику?')) {
                      onResolve(order.id, 'client', note)
                    }
                  }}
                  disabled={busy || su === 'REFUNDED'}
                >
                  Возврат заказчику
                </button>
              </div>
            </div>

            <div className={ap('editDrawerDivider')} />

            <div className={ap('formActions')}>
              <button type="button" className={ap('formBtnSecondary')} onClick={onClose} disabled={busy}>
                Отмена
              </button>

              <button
                type="button"
                className={ap('formBtnDanger')}
                onClick={() => {
                  if (typeof window === 'undefined' || window.confirm('Отменить этот заказ?')) {
                    onCancelOrder(order.id)
                  }
                }}
                disabled={busy || String(order.status ?? '').toUpperCase() === 'CANCELLED'}
              >
                Отменить заказ
              </button>

              <button
                type="button"
                className={ap('formBtnPrimary')}
                onClick={() => onSave(order.id, draftStatus)}
                disabled={busy}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
