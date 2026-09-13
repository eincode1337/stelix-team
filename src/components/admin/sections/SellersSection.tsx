'use client'


import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'

import {
  ap,
  AdminSectionHeader,
  AdminSearchInput,
  AdminFilterBar,
  AdminPagination,
  AdminRoleBadge,
  AdminBadge,
  AdminEmptyState,
  AdminLoading,
  AdminIconButton,
  roleLevel,
  roleLabel,
  STELIX_ROLES,
  ROLE_DISPLAY_ORDER,
  type BadgeTone,
  type RoleKey,
} from '@/components/admin/ui'
import {
  EditActionIcon,
  BlockActionIcon,
  ImpersonateActionIcon,
  RefundActionIcon,
  DeleteActionIcon,
} from './AdminActionIcons'


type SellerStatus = 'ACTIVE' | 'BLOCKED' | 'FROZEN'

type Seller = {
  id: number
  name: string
  role: RoleKey | string
  status: SellerStatus
  count: number
  resourcesCount: number
  amount: number
  payable: number
}

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

type Resource = { id: string; title: string; author: string; authorId: number }

type ListResponse<T> = { items: T[]; total: number; page: number; pageSize: number }


type MutateResponse = { ok: boolean; item?: Record<string, unknown>; id?: string | number }


const PAGE_SIZE = 20

const COMMISSION_RATE = 0.05

const rub = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })


const STATUS_META: Record<SellerStatus, { tone: BadgeTone; label: string }> = {
  ACTIVE: { tone: 'success', label: 'Активен' },
  FROZEN: { tone: 'frozen', label: 'Заморожен' },
  BLOCKED: { tone: 'danger', label: 'Заблокирован' },
}


const STATUS_FILTERS: { value: '' | SellerStatus; label: string }[] = [
  { value: '', label: 'Все' },
  { value: 'ACTIVE', label: 'Активные' },
  { value: 'FROZEN', label: 'Замороженные' },
  { value: 'BLOCKED', label: 'Заблокированные' },
]


const PURCHASE_STATUS_META: Record<string, { tone: BadgeTone; label: string }> = {
  PAID: { tone: 'success', label: 'Оплачено' },
  REFUNDED: { tone: 'danger', label: 'Возврат' },
  PENDING: { tone: 'warning', label: 'Ожидание' },
  DISPUTED: { tone: 'info', label: 'Спор' },
}


const VIEWER_ROLE: RoleKey = 'AGENT'
function assignableRoles(): RoleKey[] {
  const lvl = STELIX_ROLES[VIEWER_ROLE].level
  return ROLE_DISPLAY_ORDER.filter((rk) => STELIX_ROLES[rk].level < lvl)
}


type SortKey = 'name' | 'role' | 'count' | 'resourcesCount' | 'payable' | 'amount' | 'income' | 'status'
type SortDir = 'asc' | 'desc'

type HeaderDef = {
  key: SortKey
  label: string

  align: 'identity' | 'center'
}


const HEADERS: HeaderDef[] = [
  { key: 'name', label: 'Продавец', align: 'identity' },
  { key: 'role', label: 'Роль', align: 'center' },
  { key: 'count', label: 'Продажи', align: 'center' },
  { key: 'resourcesCount', label: 'Ресурсы', align: 'center' },
  { key: 'payable', label: 'К выплате', align: 'center' },
  { key: 'amount', label: 'Оборот', align: 'center' },
  { key: 'income', label: 'Доход', align: 'center' },
  { key: 'status', label: 'Статус', align: 'center' },
]

const STATUS_ORDER: Record<SellerStatus, number> = { ACTIVE: 0, FROZEN: 1, BLOCKED: 2 }

function incomeOf(s: Seller): number {
  return s.amount - Math.round(s.amount * COMMISSION_RATE)
}

function compareSellers(a: Seller, b: Seller, key: SortKey): number {
  switch (key) {
    case 'name':
      return a.name.localeCompare(b.name, 'ru')
    case 'role':
      return roleLevel(a.role) - roleLevel(b.role)
    case 'status':
      return STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    case 'income':
      return incomeOf(a) - incomeOf(b)
    default:
      return (a[key] as number) - (b[key] as number)
  }
}


async function postAction(url: string, body: Record<string, unknown>): Promise<MutateResponse> {
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return (await res.json()) as MutateResponse
}

async function deleteRow(url: string): Promise<MutateResponse> {
  const res = await fetch(url, { method: 'DELETE', credentials: 'same-origin' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return (await res.json()) as MutateResponse
}


function Lightning({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
    </svg>
  )
}

function BalanceValue({ value, frozen }: { value: number; frozen?: boolean }) {
  return (
    <span className={ap('tableCellBalanceValue', frozen && 'frozenAmount')}>
      <Lightning className={ap('tableCellBalanceIcon')} />
      {rub.format(value)} ₽
    </span>
  )
}


function SortGlyph({ dir }: { dir: SortDir }) {
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
        style={{ transform: dir === 'asc' ? 'rotate(180deg)' : undefined }}
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </span>
  )
}


export function SellersSection() {

  const [items, setItems] = useState<Seller[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [firstLoad, setFirstLoad] = useState(true)
  const [error, setError] = useState(false)

  const [reloadKey, setReloadKey] = useState(0)


  const [qInput, setQInput] = useState('')
  const [q, setQ] = useState('')
  const [pending, setPending] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'' | SellerStatus>('')


  const [sortKey, setSortKey] = useState<SortKey>('amount')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const [selected, setSelected] = useState<Seller | null>(null)


  useEffect(() => {
    if (qInput.trim() === q) {
      setPending(false)
      return
    }
    setPending(true)
    const t = setTimeout(() => {
      setQ(qInput.trim())
      setPage(1)
      setPending(false)
    }, 300)
    return () => clearTimeout(t)
  }, [qInput, q])


  useEffect(() => {
    const ctrl = new AbortController()
    setLoading(true)
    setError(false)
    const sp = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
    if (q) sp.set('q', q)
    if (statusFilter) sp.set('status', statusFilter)

    fetch(`/api/admin/sellers?${sp.toString()}`, { credentials: 'same-origin', signal: ctrl.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return (await r.json()) as ListResponse<Seller>
      })
      .then((d) => {
        setItems(Array.isArray(d.items) ? d.items : [])
        setTotal(typeof d.total === 'number' ? d.total : 0)
        setLoading(false)
        setFirstLoad(false)
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setItems([])
        setTotal(0)
        setError(true)
        setLoading(false)
        setFirstLoad(false)
      })

    return () => ctrl.abort()
  }, [page, q, statusFilter, reloadKey])

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))


  const displayItems = useMemo(() => {
    const sorted = [...items].sort((a, b) => {
      const cmp = compareSellers(a, b, sortKey)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [items, sortKey, sortDir])

  const onSort = useCallback(
    (key: SortKey) => {
      if (key === sortKey) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortKey(key)
        setSortDir('desc')
      }
    },
    [sortKey],
  )


  const patchSeller = useCallback((id: number, patch: Partial<Seller>) => {
    setItems((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }, [])

  const requestReload = useCallback(() => setReloadKey((k) => k + 1), [])


  if (selected) {
    return (
      <SellerStatsPanel
        seller={selected}
        onBack={() => setSelected(null)}
        onSellerPatched={patchSeller}
        onReloadList={requestReload}
      />
    )
  }


  const chrome = (
    <>
      <AdminSectionHeader title="Продавцы">
        <AdminSearchInput
          value={qInput}
          onChange={setQInput}
          onClear={() => setQInput('')}
          placeholder="Поиск"
          pending={pending}
          ariaLabel="Поиск продавцов"
        />
      </AdminSectionHeader>


      <AdminFilterBar>
        {STATUS_FILTERS.map((f) => {
          const active = statusFilter === f.value
          const style: CSSProperties = {
            border: active ? '1px solid var(--accent-fg)' : '1px solid var(--border-dashed, var(--bg-subtle))',
            background: active ? 'var(--accent-subtle-bg)' : 'var(--bg-subtle)',
            color: active ? 'var(--accent-fg)' : 'var(--fg-muted)',
            borderRadius: 'var(--radius)',
            padding: '.4rem .8rem',
            font: 'inherit',
            fontSize: '.82rem',
            fontWeight: 500,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }
          return (
            <button
              key={f.value || 'all'}
              type="button"
              style={style}
              aria-pressed={active}
              onClick={() => {
                setStatusFilter(f.value)
                setPage(1)
              }}
            >
              {f.label}
            </button>
          )
        })}
      </AdminFilterBar>
    </>
  )

  if (error) {
    return (
      <section className={ap('section')} id="admin-sellers">
        {chrome}
        <AdminEmptyState text="Не удалось загрузить продавцов" />
      </section>
    )
  }

  if (firstLoad && loading) {
    return (
      <section className={ap('section')} id="admin-sellers">
        {chrome}
        <AdminLoading size="page" />
      </section>
    )
  }

  return (
    <section className={ap('section')} id="admin-sellers">
      {chrome}

      <div className={ap('tableWrap')} role="table" aria-label="Продавцы">

        <div className={ap('tableRow', 'tableHeader', 'tableHeaderSellers')} role="row">
          {HEADERS.map((h) => {
            const active = h.key === sortKey
            return (
              <button
                key={h.key}
                type="button"
                className={ap('tableSortHeader', h.align === 'identity' ? 'tableSortHeaderIdentity' : 'tableSortHeaderCenter')}
                onClick={() => onSort(h.key)}
                aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                title={h.label}
              >
                <span className={ap('tableSortHeaderInner')}>
                  <span className={ap('tableSortHeaderLabel')}>{h.label}</span>
                  {active ? <SortGlyph dir={sortDir} /> : null}
                </span>
              </button>
            )
          })}
        </div>


        {displayItems.length === 0 ? (
          <AdminEmptyState text="Продавцы не найдены" />
        ) : (
          displayItems.map((s) => {
            const income = incomeOf(s)
            const status = STATUS_META[s.status] ?? STATUS_META.ACTIVE
            return (
              <div
                key={s.id}
                className={ap('tableRow', 'tableRowSellers', 'tableRowOverlayLinkHost')}
                role="row"
              >

                <button
                  type="button"
                  className={ap('tableRowOverlayLink')}
                  onClick={() => setSelected(s)}
                  aria-label={`Открыть продажи: ${s.name}`}
                />


                <div className={ap('tableCell', 'tableCellUserIdentity')} role="cell">
                  <span className={ap('tableCellUserName')}>{s.name}</span>
                  <span className={ap('tableCellUserEmail')}>#{s.id}</span>
                </div>


                <div className={ap('tableCell', 'tableCellAlignCenter')} role="cell">
                  <AdminRoleBadge role={s.role} />
                </div>


                <div className={ap('tableCell', 'tableCellAlignCenter')} role="cell">
                  <span className={ap('tableCellUserMetric')}>{s.count}</span>
                </div>


                <div className={ap('tableCell', 'tableCellAlignCenter')} role="cell">
                  <span className={ap('tableCellUserMetric')}>{s.resourcesCount}</span>
                </div>


                <div className={ap('tableCell', 'tableCellAlignCenter')} role="cell">
                  <span className={ap('tableCellPayableStack')}>
                    <BalanceValue value={s.payable} frozen />
                  </span>
                </div>


                <div className={ap('tableCell', 'tableCellAlignCenter')} role="cell">
                  <BalanceValue value={s.amount} />
                </div>


                <div className={ap('tableCell', 'tableCellAlignCenter')} role="cell">
                  <span className={ap('adminTxDeltaChip', income > 0 ? 'adminTxDeltaChipPositive' : 'adminTxDeltaChipFrozen')}>
                    <Lightning className={ap('adminTxDeltaChipLightning')} />
                    {income > 0 ? '+' : ''}
                    {rub.format(income)} ₽
                  </span>
                </div>


                <div className={ap('tableCell', 'tableCellAlignCenter')} role="cell">
                  <AdminBadge tone={status.tone}>{status.label}</AdminBadge>
                </div>
              </div>
            )
          })
        )}
      </div>

      <AdminPagination
        page={page}
        pageCount={pageCount}
        total={total}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </section>
  )
}


type StatsHeaderDef = { label: string; align: 'identity' | 'center' | 'end' }
const STATS_HEADERS: StatsHeaderDef[] = [
  { label: 'Покупатель', align: 'identity' },
  { label: 'Цена', align: 'center' },
  { label: 'Комиссия', align: 'center' },
  { label: 'Дата', align: 'center' },
  { label: 'Статус', align: 'center' },
  { label: 'Действия', align: 'end' },
]

function fmtDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })
}

function SellerStatsPanel({
  seller,
  onBack,
  onSellerPatched,
  onReloadList,
}: {
  seller: Seller
  onBack: () => void
  onSellerPatched: (id: number, patch: Partial<Seller>) => void
  onReloadList: () => void
}) {
  const [sellerState, setSellerState] = useState<Seller>(seller)
  const [rows, setRows] = useState<Purchase[] | null>(null)
  const [sellerBusy, setSellerBusy] = useState(false)
  const [purBusy, setPurBusy] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const backRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    backRef.current?.focus()
  }, [])

  useEffect(() => {
    let live = true
    ;(async () => {
      const [rRes, pRes] = await Promise.all([
        fetch(`/api/admin/resources?q=${encodeURIComponent(seller.name)}&pageSize=100`, { credentials: 'same-origin' }),
        fetch('/api/admin/purchases?page=1&pageSize=100', { credentials: 'same-origin' }),
      ])
      if (!rRes.ok || !pRes.ok) throw new Error('http')
      const resJson = (await rRes.json()) as ListResponse<Resource>
      const purJson = (await pRes.json()) as ListResponse<Purchase>
      const titles = new Set(
        resJson.items.filter((r) => r.authorId === seller.id || r.author === seller.name).map((r) => r.title),
      )
      const out = purJson.items.filter((p) => titles.has(p.title))
      if (live) setRows(out)
    })().catch(() => {
      if (live) setRows([])
    })
    return () => {
      live = false
    }
  }, [seller])


  const toggleBlock = useCallback(async () => {
    const prev = sellerState.status
    const next: SellerStatus = prev === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED'
    const action = next === 'BLOCKED' ? 'block' : 'unblock'
    setSellerBusy(true)
    setSellerState((s) => ({ ...s, status: next }))
    onSellerPatched(sellerState.id, { status: next })
    try {
      const r = await postAction(`/api/admin/sellers/${sellerState.id}`, { action })
      const serverStatus = (r.item?.status as SellerStatus | undefined) ?? next
      setSellerState((s) => ({ ...s, status: serverStatus }))
      onSellerPatched(sellerState.id, { status: serverStatus })
    } catch {
      setSellerState((s) => ({ ...s, status: prev }))
      onSellerPatched(sellerState.id, { status: prev })
    } finally {
      setSellerBusy(false)
    }
  }, [sellerState.id, sellerState.status, onSellerPatched])


  const applyStatus = useCallback(
    async (next: SellerStatus) => {
      const prev = sellerState.status
      if (next === prev) return
      const action = next === 'BLOCKED' ? 'block' : next === 'FROZEN' ? 'freeze' : 'unblock'
      setSellerBusy(true)
      setSellerState((s) => ({ ...s, status: next }))
      onSellerPatched(sellerState.id, { status: next })
      try {
        const r = await postAction(`/api/admin/sellers/${sellerState.id}`, { action })
        const serverStatus = (r.item?.status as SellerStatus | undefined) ?? next
        setSellerState((s) => ({ ...s, status: serverStatus }))
        onSellerPatched(sellerState.id, { status: serverStatus })
      } catch {
        setSellerState((s) => ({ ...s, status: prev }))
        onSellerPatched(sellerState.id, { status: prev })
      } finally {
        setSellerBusy(false)
      }
    },
    [sellerState.id, sellerState.status, onSellerPatched],
  )


  const saveSeller = useCallback(
    async (patch: { role?: string; payable?: number; payableDelta?: number }) => {
      setSellerBusy(true)
      const latest: Partial<Seller> = {}
      try {
        if (patch.role && patch.role !== String(sellerState.role)) {
          const r = await postAction(`/api/admin/sellers/${sellerState.id}`, { action: 'role-change', role: patch.role })
          latest.role = (r.item?.role as string | undefined) ?? patch.role
        }
        if (patch.payable != null && Number.isFinite(patch.payable) && patch.payable !== sellerState.payable) {
          const r = await postAction(`/api/admin/sellers/${sellerState.id}`, { action: 'balance', payable: patch.payable })
          latest.payable = Number(r.item?.payable ?? patch.payable)
        }
        if (patch.payableDelta != null && Number.isFinite(patch.payableDelta) && patch.payableDelta !== 0) {
          const base = latest.payable ?? sellerState.payable
          const r = await postAction(`/api/admin/sellers/${sellerState.id}`, { action: 'adjust', payable: patch.payableDelta })
          latest.payable = Number(r.item?.payable ?? base + patch.payableDelta)
        }
        if (Object.keys(latest).length) {
          setSellerState((s) => ({ ...s, ...latest }))
          onSellerPatched(sellerState.id, latest)
        }
      } catch {

        onReloadList()
      } finally {
        setSellerBusy(false)
      }
    },
    [sellerState.id, sellerState.role, sellerState.payable, onSellerPatched, onReloadList],
  )

  const impersonate = useCallback(async () => {
    setSellerBusy(true)
    try {
      await postAction('/api/admin/impersonate', { userId: sellerState.id })


      try {
        window.location.assign('/')
      } catch {

        setSellerBusy(false)
      }
    } catch {

      setSellerBusy(false)
    }
  }, [sellerState.id])


  const refundPurchase = useCallback(async (p: Purchase) => {
    const prevStatus = p.status
    setPurBusy(p.id)
    setRows((rs) => (rs ? rs.map((x) => (x.id === p.id ? { ...x, status: 'REFUNDED' } : x)) : rs))
    try {
      const r = await postAction(`/api/admin/purchases/${p.id}`, { action: 'refund' })
      const st = (r.item?.status as string | undefined) ?? 'REFUNDED'
      setRows((rs) => (rs ? rs.map((x) => (x.id === p.id ? { ...x, status: st } : x)) : rs))
    } catch {
      setRows((rs) => (rs ? rs.map((x) => (x.id === p.id ? { ...x, status: prevStatus } : x)) : rs))
    } finally {
      setPurBusy(null)
    }
  }, [])

  const deletePurchase = useCallback(async (p: Purchase) => {
    setPurBusy(p.id)
    let snapshot: Purchase[] | null = null
    setRows((rs) => {
      snapshot = rs
      return rs ? rs.filter((x) => x.id !== p.id) : rs
    })
    try {
      await deleteRow(`/api/admin/purchases/${p.id}`)
    } catch {
      setRows(snapshot)
    } finally {
      setPurBusy(null)
    }
  }, [])

  const income = incomeOf(sellerState)
  const status = STATUS_META[sellerState.status] ?? STATUS_META.ACTIVE

  return (
    <section className={ap('section')} id="admin-seller-stats">
      <div className={ap('sectionHeader')}>
        <div className={ap('editDrawerHeaderLeft')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            ref={backRef}
            type="button"
            className={ap('editDrawerClose')}
            onClick={() => {

              onReloadList()
              onBack()
            }}
            aria-label="Назад к продавцам"
            title="Назад"
          >
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
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <h2 className={ap('sectionTitle')}>{sellerState.name}</h2>
          <AdminRoleBadge role={sellerState.role} />
          <AdminBadge tone={status.tone}>{status.label}</AdminBadge>
        </div>
        <div className={ap('sectionHeaderEnd')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className={ap('tableCellUserMetric')} style={{ marginRight: '0.25rem' }}>
            {sellerState.count} продаж · {sellerState.resourcesCount} ресурсов
          </span>
          <BalanceValue value={income} />

          <AdminIconButton
            label="Редактировать"
            tone="neutral"
            disabled={sellerBusy}
            onClick={() => setEditing(true)}
          >
            <EditActionIcon />
          </AdminIconButton>
          <AdminIconButton
            label={sellerState.status === 'BLOCKED' ? 'Разблокировать' : 'Заблокировать'}
            tone="warning"
            disabled={sellerBusy}
            onClick={toggleBlock}
          >
            <BlockActionIcon />
          </AdminIconButton>
          <AdminIconButton label="Войти как" tone="accent" disabled={sellerBusy} onClick={impersonate}>
            <ImpersonateActionIcon />
          </AdminIconButton>
        </div>
      </div>

      <div className={ap('tableWrap')} role="table" aria-label={`Продажи: ${sellerState.name}`}>

        <div className={ap('tableRow', 'tableHeader', 'tableHeaderPurchases', 'tableHeaderSellerStatsPurchases')} role="row">
          {STATS_HEADERS.map((h) => (
            <div
              key={h.label}
              className={ap('tableCell', h.align === 'end' ? 'tableCellActions' : h.align === 'identity' ? 'tableCellAlignStart' : 'tableCellAlignCenter')}
              role="columnheader"
            >
              <span
                className={ap(
                  'tableSortHeader',
                  h.align === 'identity' ? 'tableSortHeaderIdentity' : h.align === 'end' ? 'tableSortHeaderEnd' : 'tableSortHeaderCenter',
                )}
              >
                <span className={ap('tableSortHeaderInner')}>
                  <span className={ap('tableSortHeaderLabel')}>{h.label}</span>
                </span>
              </span>
            </div>
          ))}
        </div>

        {rows === null ? (
          <AdminLoading size="section" />
        ) : rows.length === 0 ? (
          <AdminEmptyState text="Нет продаж за последний период" />
        ) : (
          rows.map((p) => {
            const st = PURCHASE_STATUS_META[p.status] ?? { tone: 'muted' as BadgeTone, label: p.status }
            const busy = purBusy === p.id
            const refunded = p.status === 'REFUNDED'
            return (
              <div key={p.id} className={ap('tableRow', 'tableRowPurchases', 'tableRowSellerStatsPurchases')} role="row">

                <div className={ap('tableCell', 'tableCellUserIdentity')} role="cell">
                  <span className={ap('tableCellUserName')}>{p.buyer}</span>
                  <span className={ap('tableCellUserEmail')}>#{p.buyerId}</span>
                </div>

                <div className={ap('tableCell', 'tableCellAlignCenter')} role="cell">
                  <BalanceValue value={p.price} />
                </div>

                <div className={ap('tableCell', 'tableCellAlignCenter')} role="cell">
                  <BalanceValue value={p.fee} />
                </div>

                <div className={ap('tableCell', 'tableCellAlignCenter')} role="cell">
                  <span className={ap('tableCellUserMetric')}>{fmtDate(p.createdAt)}</span>
                </div>

                <div className={ap('tableCell', 'tableCellAlignCenter')} role="cell">
                  <AdminBadge tone={st.tone}>{st.label}</AdminBadge>
                </div>

                <div className={ap('tableCell', 'tableCellActions', 'tableCellActionCol')} role="cell">
                  <AdminIconButton
                    label="Возврат"
                    tone="warning"
                    disabled={busy || refunded}
                    onClick={() => refundPurchase(p)}
                  >
                    <RefundActionIcon />
                  </AdminIconButton>
                  <AdminIconButton label="Удалить" tone="danger" disabled={busy} onClick={() => deletePurchase(p)}>
                    <DeleteActionIcon />
                  </AdminIconButton>
                </div>
              </div>
            )
          })
        )}
      </div>


      {editing ? (
        <SellerEditDrawer
          seller={sellerState}
          busy={sellerBusy}
          onClose={() => setEditing(false)}
          onSave={(patch) => {
            void saveSeller(patch)
            setEditing(false)
          }}
          onStatus={(status) => void applyStatus(status)}
        />
      ) : null}
    </section>
  )
}


function SellerEditDrawer({
  seller,
  busy,
  onClose,
  onSave,
  onStatus,
}: {
  seller: Seller
  busy: boolean
  onClose: () => void
  onSave: (patch: { role?: string; payable?: number; payableDelta?: number }) => void
  onStatus: (status: SellerStatus) => void
}) {
  const [role, setRole] = useState<string>(String(seller.role))
  const [payable, setPayable] = useState<string>(String(seller.payable))
  const [payableDelta, setPayableDelta] = useState('')
  const roleOptions = useMemo(() => assignableRoles(), [])
  const status = STATUS_META[seller.status] ?? STATUS_META.ACTIVE


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = () => {
    const patch: { role?: string; payable?: number; payableDelta?: number } = {}
    if (role && role !== String(seller.role)) patch.role = role
    const abs = Number(payable)
    if (payable.trim() !== '' && Number.isFinite(abs) && abs !== seller.payable) patch.payable = abs
    const delta = Number(payableDelta)
    if (payableDelta.trim() !== '' && Number.isFinite(delta) && delta !== 0) patch.payableDelta = delta
    onSave(patch)
  }

  return (
    <>
      <div className={ap('editBackdrop')} onClick={onClose} aria-hidden="true" />
      <aside className={ap('editDrawer', 'editDrawerSlideIn')} role="dialog" aria-modal="true" aria-label="Продавец">
        <div className={ap('editDrawerHeader')}>
          <div className={ap('editDrawerHeaderLeft')}>
            <h3 className={ap('editDrawerTitle')}>Продавец</h3>
            <span className={ap('badge', 'editDrawerTitleIdBadge')}>#{seller.id}</span>
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
          <div className={ap('formBody')}>
            <div className={ap('editDrawerInnerColumn')}>

              <div className={ap('formInfo')}>
                <span className={ap('formInfoLabel')}>Продавец</span>
                <span className={ap('formInfoValue')}>{seller.name}</span>
              </div>
              <div className={ap('formInfo')}>
                <span className={ap('formInfoLabel')}>Оборот</span>
                <span className={ap('formInfoValue')}>{rub.format(seller.amount)} ₽</span>
              </div>
              <div className={ap('formInfo')}>
                <span className={ap('formInfoLabel')}>Статус</span>
                <div className={ap('formInfoStatusRow')}>
                  <AdminBadge tone={status.tone}>{status.label}</AdminBadge>
                </div>
              </div>

              <div className={ap('editDrawerDivider')} />


              <div className={ap('formGroup')}>
                <label className={ap('formLabel')} htmlFor="edit-seller-role">
                  Роль
                </label>
                <select
                  id="edit-seller-role"
                  className={ap('formInput')}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  {roleOptions.map((rk) => (
                    <option key={rk} value={rk}>
                      {roleLabel(rk, 'ru')}
                    </option>
                  ))}
                </select>
              </div>


              <div className={ap('formGroup')}>
                <label className={ap('formLabel')} htmlFor="edit-seller-payable">
                  Сумма к выплате, ₽
                </label>
                <input
                  id="edit-seller-payable"
                  type="number"
                  inputMode="numeric"
                  className={ap('formInput')}
                  value={payable}
                  onChange={(e) => setPayable(e.target.value)}
                  placeholder="0"
                />
                <span className={ap('formHint')}>Текущая: {rub.format(seller.payable)} ₽</span>
              </div>


              <div className={ap('formGroup')}>
                <label className={ap('formLabel')} htmlFor="edit-seller-payable-delta">
                  Корректировка выплаты, ₽
                </label>
                <input
                  id="edit-seller-payable-delta"
                  type="number"
                  inputMode="numeric"
                  className={ap('formInput')}
                  value={payableDelta}
                  onChange={(e) => setPayableDelta(e.target.value)}
                  placeholder="0"
                />
                <span className={ap('formHint')}>+ начислить / − списать</span>
              </div>

              <div className={ap('editDrawerDivider')} />


              <div className={ap('formGroup')}>
                <span className={ap('formLabel')}>Статус аккаунта</span>
                <div className={ap('formActionsRow')}>
                  <button
                    type="button"
                    className={ap('formBtnSecondary')}
                    disabled={busy || seller.status === 'ACTIVE'}
                    onClick={() => onStatus('ACTIVE')}
                  >
                    Активен
                  </button>
                  <button
                    type="button"
                    className={ap('formBtnSecondary')}
                    disabled={busy || seller.status === 'FROZEN'}
                    onClick={() => onStatus('FROZEN')}
                  >
                    Заморозить
                  </button>
                  <button
                    type="button"
                    className={ap('formBtnDanger')}
                    disabled={busy || seller.status === 'BLOCKED'}
                    onClick={() => onStatus('BLOCKED')}
                  >
                    Заблокировать
                  </button>
                </div>
              </div>
            </div>

            <div className={ap('editUserAccountActions')}>
              <button type="button" className={ap('formBtnPrimary')} disabled={busy} onClick={submit}>
                Сохранить
              </button>
              <button type="button" className={ap('formBtnSecondary')} disabled={busy} onClick={onClose}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
