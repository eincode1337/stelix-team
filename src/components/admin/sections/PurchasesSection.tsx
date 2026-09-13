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

import {
  ap,
  cx,
  AdminTable,
  AdminEmptyState,
  AdminIconButton,
  AdminBadge,
  AdminPagination,
  AdminSectionHeader,
  AdminSearchInput,
  AdminFilterBar,
  type AdminColumn,
  type BadgeTone,
  type SortDirection,
} from '@/components/admin/ui'
import {
  ViewActionIcon,
  RefundActionIcon,
  ImpersonateActionIcon,
  DeleteActionIcon,
} from './AdminActionIcons'


const FOM_PREFIX = 'FilterOptionMenu-module__XijrnG__'
const DD_PREFIX = 'Dropdown-module__DasDQW__'
type ClassArg = string | false | null | undefined
const fom = (...names: ClassArg[]): string =>
  names.filter(Boolean).map((n) => `${FOM_PREFIX}${n as string}`).join(' ')
const dd = (...names: ClassArg[]): string =>
  names.filter(Boolean).map((n) => `${DD_PREFIX}${n as string}`).join(' ')


type Purchase = {
  id: string
  resourceId: string
  title: string
  buyer: string
  buyerId: number
  price: number
  fee: number
  status: string
  createdAt: string
}

type ListResponse = {
  items: Purchase[]
  total: number
  page: number
  pageSize: number
}

const PAGE_SIZE = 20


type StatusMeta = { label: string; tone: BadgeTone }

const STATUS_META: Record<string, StatusMeta> = {

  COMPLETED: { label: 'Завершено', tone: 'success' },
  REFUND_REQUESTED: { label: 'Запрос возврата', tone: 'warning' },
  REFUND_PENDING_ADMIN: { label: 'На возврате', tone: 'warning' },
  REFUNDED: { label: 'Возврат', tone: 'danger' },
  CANCELLED: { label: 'Отменено', tone: 'danger' },

  PAID: { label: 'Завершено', tone: 'success' },
  PENDING: { label: 'На возврате', tone: 'warning' },
  DISPUTED: { label: 'Запрос возврата', tone: 'warning' },
}

function statusMeta(status: string): StatusMeta {
  return STATUS_META[String(status || '').toUpperCase()] ?? { label: status || '—', tone: 'muted' }
}


const STATUS_FILTERS: { value: string; label: string; tone: BadgeTone }[] = [
  { value: '', label: 'Все', tone: 'muted' },
  { value: 'PAID', label: 'Завершено', tone: 'success' },
  { value: 'DISPUTED', label: 'Запрос возврата', tone: 'warning' },
  { value: 'PENDING', label: 'На возврате', tone: 'warning' },
  { value: 'REFUNDED', label: 'Возврат', tone: 'danger' },
]


const TONE_ACCENT: Record<BadgeTone, string> = {
  success: 'var(--success-fg)',
  warning: 'var(--attention-fg)',
  danger: 'var(--danger-fg)',
  info: 'var(--accent-fg)',
  muted: 'var(--fg-muted)',
  frozen: 'var(--accent-fg)',
  default: 'var(--accent-fg)',
}


const RUB = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })

function formatMoney(n: number): string {
  return `${RUB.format(Math.round(n))} ₽`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const dd2 = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd2}.${mm}.${d.getFullYear()}`
}


function StatusFilterMenu({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const current = STATUS_FILTERS.find((o) => o.value === value) ?? STATUS_FILTERS[0]


  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (


    <div className={dd('dropdown')} ref={rootRef} style={{ width: 'auto', minWidth: '13rem' }}>
      <button
        type="button"
        className={dd('trigger', open && 'triggerOpen')}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Фильтр по статусу"
      >
        <span className={dd('triggerContent')}>{current.label}</span>
        <svg
          className={dd('icon', open && 'iconOpen')}
          viewBox="0 0 24 24"
          width="1.1rem"
          height="1.1rem"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform .2s' }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <div
          className={fom('menu', 'menuSurfaceCanvas')}
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + .4rem)',
            left: 0,
            right: 0,
            zIndex: 30,
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg, 0 12px 32px rgba(0,0,0,.28))',
            border: '1px solid var(--border-muted)',
          }}
        >
          {STATUS_FILTERS.map((opt) => {
            const active = opt.value === value
            const tileStyle = {
              '--filter-option-accent': TONE_ACCENT[opt.tone],
              '--filter-option-glow-opacity': opt.value ? '.42' : '0',
              '--filter-option-glow-mix': '42%',
            } as CSSProperties
            return (
              <button
                key={opt.value || 'all'}
                type="button"
                role="option"
                aria-selected={active}
                className={fom('option', 'optionStatusTile', active && 'optionActive')}
                style={tileStyle}
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
              >
                {active ? <span className={fom('optionSelectRail')} aria-hidden="true" /> : null}
                <span className={fom('optionBody')}>
                  <svg
                    className={fom('optionSelectMark', active && 'optionSelectMarkSelected')}
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path className={fom('optionSelectMarkPath')} d="M4 12.5l5 5 11-12" />
                  </svg>
                  <span className={fom('optionBodyText')}>{opt.label}</span>
                </span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}


function PurchaseDrawer({
  purchase,
  onClose,
  onRefund,
  onDelete,
}: {
  purchase: Purchase
  onClose: () => void
  onRefund: (id: string) => void
  onDelete: (id: string) => void
}) {
  const meta = statusMeta(purchase.status)
  const canRefund = !['REFUNDED', 'CANCELLED'].includes(String(purchase.status).toUpperCase())

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
      <aside className={ap('editDrawer', 'editDrawerSlideIn')} role="dialog" aria-modal="true" aria-label="Покупка">
        <div className={ap('editDrawerHeader')}>
          <div className={ap('editDrawerHeaderLeft')}>
            <h3 className={ap('editDrawerTitle')}>Покупка</h3>
          </div>
          <span className={ap('editDrawerDivider')} aria-hidden="true" />

          <span className={cx(ap('badge', 'badgeMuted'), ap('editDrawerTitleIdBadge'))} title={purchase.id}>
            {purchase.id}
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
            <Row label="Название ресурса">{purchase.title}</Row>
            <Row label="Покупатель">
              {purchase.buyer} <span style={{ color: 'var(--fg-muted)' }}>#{purchase.buyerId}</span>
            </Row>
            <Row label="Цена">{formatMoney(purchase.price)}</Row>
            <Row label="Комиссия">{formatMoney(purchase.fee)}</Row>
            <Row label="Дата покупки">{formatDate(purchase.createdAt)}</Row>
            <Row label="Статус">
              <AdminBadge tone={meta.tone}>{meta.label}</AdminBadge>
            </Row>

            <hr className={ap('editDrawerDivider')} style={{ flex: 'none', width: '100%', margin: '.75rem 0' }} />


            <div className={ap('formActions')}>
              <button
                type="button"
                className={ap('formBtnPrimary')}
                onClick={() => {
                  if (!canRefund) return
                  if (typeof window !== 'undefined' && !window.confirm('Оформить возврат по этой покупке?')) return
                  onRefund(purchase.id)
                }}
                disabled={!canRefund}
              >
                Оформить возврат
              </button>
              <button
                type="button"
                className={ap('formBtnDanger')}
                onClick={() => onDelete(purchase.id)}
              >
                Удалить запись
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}


export function PurchasesSection() {
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [status, setStatus] = useState('')
  const [pending, setPending] = useState(false)

  const [rows, setRows] = useState<Purchase[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  const [reloadKey, setReloadKey] = useState(0)
  const reload = useCallback(() => setReloadKey((k) => k + 1), [])


  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDirection>(null)

  const [drawerId, setDrawerId] = useState<string | null>(null)


  useEffect(() => {
    if (query === debouncedQuery) return
    setPending(true)
    const t = setTimeout(() => {
      setDebouncedQuery(query)
      setPending(false)
    }, 300)
    return () => clearTimeout(t)
  }, [query, debouncedQuery])


  useEffect(() => {
    setPage(1)
  }, [debouncedQuery, status])


  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
    if (debouncedQuery) params.set('q', debouncedQuery)
    if (status) params.set('status', status)

    fetch(`/api/admin/purchases?${params.toString()}`, {
      signal: controller.signal,
      credentials: 'same-origin',
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<ListResponse>
      })
      .then((data) => {
        setRows(Array.isArray(data.items) ? data.items : [])
        setTotal(typeof data.total === 'number' ? data.total : 0)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if ((err as { name?: string })?.name === 'AbortError') return
        setError('Не удалось загрузить покупки')
        setRows([])
        setTotal(0)
        setLoading(false)
      })
    return () => controller.abort()
  }, [page, debouncedQuery, status, reloadKey])

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const onSort = useCallback((key: string) => {
    setSortKey((prevKey) => {
      if (prevKey !== key) {
        setSortDir('asc')
        return key
      }

      setSortDir((prevDir) => (prevDir === 'asc' ? 'desc' : prevDir === 'desc' ? null : 'asc'))
      return key
    })
  }, [])


  const sortedRows = useMemo(() => {
    if (!sortKey || !sortDir) return rows
    const dir = sortDir === 'asc' ? 1 : -1
    const val = (p: Purchase): string | number => {
      switch (sortKey) {
        case 'title':
          return p.title.toLowerCase()
        case 'buyer':
          return p.buyer.toLowerCase()
        case 'price':
          return p.price
        case 'fee':
          return p.fee
        case 'date':
          return Date.parse(p.createdAt) || 0
        case 'status':
          return statusMeta(p.status).label
        default:
          return 0
      }
    }
    return [...rows].sort((a, b) => {
      const av = val(a)
      const bv = val(b)
      if (av < bv) return -1 * dir
      if (av > bv) return 1 * dir
      return 0
    })
  }, [rows, sortKey, sortDir])

  const dirFor = (key: string): SortDirection => (sortKey === key ? sortDir : null)


  const impersonate = useCallback((buyerId: number) => {
    fetch('/api/admin/impersonate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ userId: buyerId }),
    })
      .then((res) => {
        if (res.ok) {
          try {
            window.location.assign('/')
          } catch {

          }
        }
      })
      .catch(() => {

      })
  }, [])


  const refund = useCallback(
    (id: string) => {
      let prevStatus: string | undefined
      setRows((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p
          prevStatus = p.status
          return { ...p, status: 'REFUNDED' }
        }),
      )
      setDrawerId((d) => (d === id ? null : d))

      fetch(`/api/admin/purchases/${encodeURIComponent(id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ action: 'refund' }),
      })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json() as Promise<{ ok?: boolean; item?: { status?: unknown } }>
        })
        .then((data) => {
          const next = data?.item?.status
          if (typeof next === 'string') {
            setRows((prev) => prev.map((p) => (p.id === id ? { ...p, status: next } : p)))
          }


          reload()
        })
        .catch(() => {

          setRows((prev) => prev.map((p) => (p.id === id ? { ...p, status: prevStatus ?? p.status } : p)))
          reload()
        })
    },
    [reload],
  )


  const remove = useCallback(
    (id: string) => {
      if (typeof window !== 'undefined' && !window.confirm('Удалить запись о покупке?')) return
      setRows((prev) => prev.filter((p) => p.id !== id))
      setTotal((t) => Math.max(0, t - 1))
      setDrawerId((d) => (d === id ? null : d))

      fetch(`/api/admin/purchases/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
        })
        .catch(() => {

          reload()
        })
    },
    [reload],
  )

  const columns = useMemo<AdminColumn<Purchase>[]>(
    () => [
      {
        key: 'title',
        header: 'Ресурс',
        align: 'start',
        sortable: true,
        sortDirection: dirFor('title'),
        onSort,

        cellClassName: 'adminPurchasesResourceCell',
        cell: (p) => <span className={ap('tableCellResourceTitle')}>{p.title}</span>,
      },
      {
        key: 'price',
        header: 'Цена',
        align: 'center',
        sortable: true,
        sortDirection: dirFor('price'),
        onSort,
        cell: (p) => <span className={ap('tableCellUserMetric')}>{formatMoney(p.price)}</span>,
      },
      {
        key: 'fee',
        header: 'Комиссия',
        align: 'center',
        sortable: true,
        sortDirection: dirFor('fee'),
        onSort,
        cell: (p) => <span className={ap('tableCellUserMetric')}>{formatMoney(p.fee)}</span>,
      },
      {
        key: 'buyer',
        header: 'Покупатель',
        align: 'start',
        sortable: true,
        sortDirection: dirFor('buyer'),
        onSort,
        cell: (p) => (
          <span className={ap('tableCellUserIdentity')}>
            <span className={ap('tableCellUserName')}>{p.buyer}</span>
            <span className={ap('tableCellUserEmail')}>#{p.buyerId}</span>
          </span>
        ),
      },
      {
        key: 'date',
        header: 'Дата',
        align: 'end',
        sortable: true,
        sortDirection: dirFor('date'),
        onSort,
        cell: (p) => <span className={ap('tableCellDateSingle')}>{formatDate(p.createdAt)}</span>,
      },
      {
        key: 'status',
        header: 'Статус',
        align: 'center',
        sortable: true,
        sortDirection: dirFor('status'),
        onSort,
        cell: (p) => {
          const meta = statusMeta(p.status)
          return <AdminBadge tone={meta.tone}>{meta.label}</AdminBadge>
        },
      },
      {
        key: 'actions',
        header: '',
        align: 'actions',

        cell: (p) => (
          <>
            <AdminIconButton
              label="Открыть"
              tone="neutral"
              onClick={() => setDrawerId(p.id)}
            >
              <ViewActionIcon />
            </AdminIconButton>
            <AdminIconButton
              label="Оформить возврат"
              tone="warning"
              disabled={['REFUNDED', 'CANCELLED'].includes(String(p.status).toUpperCase())}
              onClick={() => {
                if (['REFUNDED', 'CANCELLED'].includes(String(p.status).toUpperCase())) return
                if (typeof window !== 'undefined' && !window.confirm('Оформить возврат по этой покупке?')) return
                refund(p.id)
              }}
            >
              <RefundActionIcon />
            </AdminIconButton>
            <AdminIconButton
              label="Войти как покупатель"
              tone="accent"
              onClick={() => impersonate(p.buyerId)}
            >
              <ImpersonateActionIcon />
            </AdminIconButton>
            <AdminIconButton
              label="Удалить"
              tone="danger"
              onClick={() => remove(p.id)}
            >
              <DeleteActionIcon />
            </AdminIconButton>
          </>
        ),
      },
    ],
    [onSort, sortKey, sortDir, impersonate, refund, remove],
  )

  const drawerPurchase = drawerId ? rows.find((p) => p.id === drawerId) ?? null : null

  return (
    <section className={ap('section')} id="admin-purchases">
      <AdminSectionHeader title="Покупки">
        <AdminSearchInput
          value={query}
          onChange={setQuery}
          onClear={() => setQuery('')}
          placeholder="Поиск по ресурсам"
          ariaLabel="Поиск по ресурсам"
          pending={pending}
        />
      </AdminSectionHeader>

      <AdminFilterBar>
        <StatusFilterMenu value={status} onChange={setStatus} />
      </AdminFilterBar>

      {error ? (
        <AdminEmptyState text={error} />
      ) : (
        <AdminTable<Purchase>
          variant="Purchases"
          columns={columns}
          rows={sortedRows}
          rowKey={(p) => p.id}
          loading={loading}
          emptyText="Ничего не найдено"
          ariaLabel="Покупки"
        />
      )}

      <AdminPagination
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        summary={total > 0 ? `${(page - 1) * PAGE_SIZE + 1} - ${Math.min(page * PAGE_SIZE, total)} из ${total}` : undefined}
      />

      {drawerPurchase ? (
        <PurchaseDrawer
          purchase={drawerPurchase}
          onClose={() => setDrawerId(null)}
          onRefund={refund}
          onDelete={remove}
        />
      ) : null}
    </section>
  )
}

export default PurchasesSection
