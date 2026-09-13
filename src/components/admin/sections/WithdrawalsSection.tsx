'use client'


import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

import {
  ap,
  cx,
  AdminTable,
  AdminPagination,
  AdminBadge,
  AdminMiniStats,
  AdminMiniStat,
  AdminSectionHeader,
  AdminSearchInput,
  AdminIconButton,
  roleLevel,
  STELIX_ROLES,
  type AdminColumn,
  type SortDirection,
  type BadgeTone,
} from '@/components/admin/ui'
import { DownloadActionIcon } from './AdminActionIcons'


type WithdrawalStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'REJECTED'
type WithdrawalMethod = 'CARD' | 'SBP' | 'CRYPTO' | 'YOOMONEY'

interface Withdrawal {
  id: string
  num: number
  userId: number
  identity: string
  email: string
  role: string
  method: WithdrawalMethod
  methodDetails: string
  amount: number
  status: WithdrawalStatus
  createdAt: string
  updatedAt: string
}

interface ListResponse {
  items: Withdrawal[]
  total: number
  page: number
  pageSize: number
}


const FINANCE_ROLES = new Set(['ACCOUNTANT', 'DEVELOPER', 'AGENT'])
const MODERATOR_LEVEL = STELIX_ROLES.MODERATOR.level

const isFinanceRole = (role?: string | null) => !!role && FINANCE_ROLES.has(role)
const canViewWithdrawals = (role?: string | null) => isFinanceRole(role) || roleLevel(role) >= MODERATOR_LEVEL
const canManageWithdrawals = (role?: string | null) => isFinanceRole(role)
const canRevealDetails = (role?: string | null) => roleLevel(role) >= MODERATOR_LEVEL


const PREVIEW_ROLE = 'DEVELOPER'


const STATUS_META: Record<WithdrawalStatus, { label: string; tone: BadgeTone }> = {
  PENDING: { label: 'В обработке', tone: 'warning' },
  PROCESSING: { label: 'Отправляется', tone: 'info' },
  PAID: { label: 'Выплачена', tone: 'success' },
  REJECTED: { label: 'Отклонена', tone: 'danger' },
}


const STATUS_FILTERS: { value: '' | WithdrawalStatus; label: string }[] = [
  { value: '', label: 'Все' },
  { value: 'PENDING', label: 'В обработке' },
  { value: 'PROCESSING', label: 'Отправляется' },
  { value: 'PAID', label: 'Выплачена' },
  { value: 'REJECTED', label: 'Отклонена' },
]


type MethodMeta = { label: string; kassaName: string; asset?: string; glyph?: string }
const METHOD_META: Record<WithdrawalMethod, MethodMeta> = {
  CARD: { label: 'Карта', kassaName: 'Robokassa', asset: '/icons/payment-methods/mir.svg' },
  SBP: { label: 'СБП', kassaName: 'Robokassa', glyph: 'M4 7h10a4 4 0 0 1 0 8H8m0-8v12m0-9 8 9M8 12h6' },
  CRYPTO: { label: 'Крипта', kassaName: 'Heleket', glyph: 'M12 3v18M9 3v18M7 7.5h6.5a2.5 2.5 0 0 1 0 5H7m0 0h7a2.5 2.5 0 0 1 0 5H7' },
  YOOMONEY: { label: 'ЮMoney', kassaName: 'ЮMoney', glyph: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z' },
}

const FALLBACK_METHOD_META: MethodMeta = { label: 'Вывод', kassaName: '—', glyph: 'M12 3v18M6 8h9a3 3 0 0 1 0 6H6' }
const methodMeta = (m: WithdrawalMethod): MethodMeta => METHOD_META[m] ?? FALLBACK_METHOD_META


const USDT_RUB_RATE = 83.9317


const DISPATCH_ROUTES = ['Robokassa · СБП', 'T-Bank', 'ЮMoney', 'Heleket · USDT']

const PAGE_SIZE = 20


const RUB_FMT = new Intl.NumberFormat('ru-RU')
const DATE_FMT = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })

function fmtRub(n: number): string {
  return RUB_FMT.format(Math.round(n))
}
function fmtDate(iso: string): string {
  const t = Date.parse(iso)
  return Number.isNaN(t) ? '—' : DATE_FMT.format(t)
}


function RubleIcon() {
  return (
    <svg className={ap('tableCellBalanceIcon')} viewBox="0 0 384 512" fill="currentColor" aria-hidden="true">
      <path d="M96 32C78.3 32 64 46.3 64 64V256H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H64v32H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H64v48c0 17.7 14.3 32 32 32s32-14.3 32-32V416H240c17.7 0 32-14.3 32-32s-14.3-32-32-32H128V320h96c88.4 0 160-71.6 160-160S312.4 0 224 0H96zM224 256H128V64h96c53 0 96 43 96 96s-43 96-96 96z" />
    </svg>
  )
}


function MethodIcon({ method, className }: { method: WithdrawalMethod; className: string }) {
  const meta = methodMeta(method)
  if (meta.asset) {

    return <img className={className} src={meta.asset} alt="" />
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={meta.glyph} />
    </svg>
  )
}


type SortKey = 'num' | 'identity' | 'amount' | 'method' | 'created' | 'updated' | 'status'
const STATUS_ORDER: Record<WithdrawalStatus, number> = { PENDING: 0, PROCESSING: 1, PAID: 2, REJECTED: 3 }

export function WithdrawalsSection() {
  const [items, setItems] = useState<Withdrawal[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'' | WithdrawalStatus>('')

  const [sortKey, setSortKey] = useState<SortKey>('num')
  const [sortDir, setSortDir] = useState<Exclude<SortDirection, null>>('desc')

  const [viewerRole, setViewerRole] = useState<string | null>(null)
  const [selected, setSelected] = useState<Withdrawal | null>(null)
  const [copied, setCopied] = useState(false)
  const [dispatchRoute, setDispatchRoute] = useState(DISPATCH_ROUTES[0])


  const [busyId, setBusyId] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)


  const effectiveRole = canViewWithdrawals(viewerRole) ? viewerRole : PREVIEW_ROLE
  const mayManage = canManageWithdrawals(effectiveRole)
  const mayReveal = canRevealDetails(effectiveRole)


  useEffect(() => {
    let alive = true
    fetch('/api/auth/me', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive) setViewerRole(d?.user?.role ?? null)
      })
      .catch(() => {

      })
    return () => {
      alive = false
    }
  }, [])


  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => window.clearTimeout(id)
  }, [search])


  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter])


  useEffect(() => {
    let alive = true
    const controller = new AbortController()
    setLoading(true)
    setError(false)
    const qs = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
    if (debouncedSearch) qs.set('q', debouncedSearch)
    if (statusFilter) qs.set('status', statusFilter)
    fetch(`/api/admin/withdrawals?${qs.toString()}`, { credentials: 'same-origin', signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status))
        return r.json() as Promise<ListResponse>
      })
      .then((data) => {
        if (!alive) return
        setItems(Array.isArray(data.items) ? data.items : [])
        setTotal(typeof data.total === 'number' ? data.total : 0)
        setLoading(false)
      })
      .catch((e) => {
        if (!alive || (e instanceof DOMException && e.name === 'AbortError')) return
        setItems([])
        setTotal(0)
        setError(true)
        setLoading(false)
      })
    return () => {
      alive = false
      controller.abort()
    }
  }, [page, debouncedSearch, statusFilter, reloadToken])


  useEffect(() => {
    if (!selected) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [selected])


  useEffect(() => {
    if (!selected) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])


  const sortedItems = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1
    const arr = [...items]
    arr.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'num':
          cmp = a.num - b.num
          break
        case 'amount':
          cmp = a.amount - b.amount
          break
        case 'created':
          cmp = Date.parse(a.createdAt) - Date.parse(b.createdAt)
          break
        case 'updated':
          cmp = Date.parse(a.updatedAt) - Date.parse(b.updatedAt)
          break
        case 'status':
          cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
          break
        case 'method':
          cmp = methodMeta(a.method).label.localeCompare(methodMeta(b.method).label, 'ru')
          break
        case 'identity':
          cmp = a.identity.localeCompare(b.identity, 'ru')
          break
      }
      return cmp * dir
    })
    return arr
  }, [items, sortKey, sortDir])

  const onSort = useCallback(
    (key: string) => {
      const k = key as SortKey
      setSortKey((prevKey) => {
        if (prevKey === k) {
          setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
          return prevKey
        }
        setSortDir('asc')
        return k
      })
    },
    [],
  )

  const dirFor = (key: SortKey): SortDirection => (sortKey === key ? sortDir : null)


  const mutate = useCallback(
    (w: Withdrawal, action: 'dispatch' | 'markPaid' | 'reject', extra?: Record<string, unknown>) => {
      const optimistic: WithdrawalStatus =
        action === 'reject' ? 'REJECTED' : action === 'markPaid' ? 'PAID' : 'PROCESSING'
      setBusyId(w.id)
      setItems((prev) =>
        prev.map((x) => (x.id === w.id ? { ...x, status: optimistic, updatedAt: new Date().toISOString() } : x)),
      )
      fetch(`/api/admin/withdrawals/${encodeURIComponent(w.id)}`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action, ...(extra ?? {}) }),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(String(res.status))
          return (await res.json()) as { ok?: boolean; item?: Withdrawal }
        })
        .then((data) => {

          if (data?.item) {
            const item = data.item
            setItems((prev) => prev.map((x) => (x.id === w.id ? { ...x, ...item } : x)))
          }
          setBusyId((cur) => (cur === w.id ? null : cur))
        })
        .catch(() => {

          setBusyId((cur) => (cur === w.id ? null : cur))
          setReloadToken((n) => n + 1)
        })
    },
    [],
  )


  const strip = useMemo(() => {
    let payable = 0
    let pendingCount = 0
    let paidCount = 0
    for (const w of items) {
      if (w.status === 'PENDING' || w.status === 'PROCESSING') {
        payable += w.amount
        pendingCount += 1
      }
      if (w.status === 'PAID') paidCount += 1
    }
    return { payable, pendingCount, paidCount }
  }, [items])


  const columns: AdminColumn<Withdrawal>[] = [
    {
      key: 'num',
      header: '№',
      align: 'center',
      sortable: true,
      sortDirection: dirFor('num'),
      onSort,
      cell: (w) => <span className={ap('tableCellUserMetric')}>{w.num}</span>,
    },
    {
      key: 'identity',
      header: 'Пользователь',
      align: 'start',
      sortable: true,
      sortDirection: dirFor('identity'),
      onSort,
      cellClassName: ap('tableCellUserIdentity'),
      cell: (w) => (
        <>
          <span className={ap('tableCellUserName')}>{w.identity}</span>
          <span className={ap('tableCellUserEmail')}>{w.email}</span>
        </>
      ),
    },
    {
      key: 'amount',
      header: 'Сумма',
      align: 'center',
      sortable: true,
      sortDirection: dirFor('amount'),
      onSort,
      cell: (w) => (
        <span className={ap('tableCellBalanceValue')}>
          <RubleIcon />
          {fmtRub(w.amount)}
        </span>
      ),
    },
    {
      key: 'method',
      header: 'Способ',
      align: 'start',
      sortable: true,
      sortDirection: dirFor('method'),
      onSort,
      cell: (w) => {
        const meta = methodMeta(w.method)
        return (
          <span className={ap('withdrawalMethodCell')}>
            <MethodIcon method={w.method} className={ap('withdrawalMethodTableIcon')} />
            <span className={ap('withdrawalMethodTextCol')}>
              <span>{meta.label}</span>
              <span className={ap('tableCellMuted')}>{meta.kassaName}</span>
            </span>
          </span>
        )
      },
    },
    {
      key: 'created',
      header: 'Создана',
      align: 'end',
      sortable: true,
      sortDirection: dirFor('created'),
      onSort,
      cell: (w) => <span className={ap('tableCellDateSingle')}>{fmtDate(w.createdAt)}</span>,
    },
    {
      key: 'updated',
      header: 'Изменена',
      align: 'end',
      sortable: true,
      sortDirection: dirFor('updated'),
      onSort,
      cell: (w) => <span className={ap('tableCellDateSingle')}>{fmtDate(w.updatedAt)}</span>,
    },
    {
      key: 'status',
      header: 'Статус',
      align: 'center',
      sortable: true,
      sortDirection: dirFor('status'),
      onSort,
      cell: (w) => {
        const meta = STATUS_META[w.status]
        return <AdminBadge tone={meta.tone}>{meta.label}</AdminBadge>
      },
    },
    {
      key: 'actions',
      header: 'Действия',


      align: 'end',
      cellClassName: ap('tableCellActions', 'tableCellActionCol'),
      cell: (w) => (
        <>
          <AdminIconButton
            label="Обработать вывод"
            tone="accent"
            onClick={() => {
              setCopied(false)
              setSelected(w)
            }}
          >
            <DownloadActionIcon />
          </AdminIconButton>
          {mayManage ? (
            <AdminIconButton
              label="Отклонить"
              tone="danger"
              iconPath="M18 6 6 18M6 6l12 12"
              disabled={w.status === 'REJECTED' || w.status === 'PAID' || busyId === w.id}
              onClick={() => mutate(w, 'reject')}
            />
          ) : null}
        </>
      ),
    },
  ]

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <section className={ap('section')} id="admin-withdrawals">
      <AdminSectionHeader title="Выводы">
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
          placeholder="Поиск"
          ariaLabel="Поиск по выводам"
        />
      </AdminSectionHeader>


      <AdminMiniStats withdrawals roleInline>
        <div className={ap('adminMiniStat')}>
          <span className={ap('adminMiniStatLabel')}>К выплате</span>
          <span className={ap('adminWithdrawalsStripAmountBadge')}>
            <RubleIcon />
            {fmtRub(strip.payable)}
          </span>
        </div>
        <AdminMiniStat label="В обработке" value={strip.pendingCount} />
        <AdminMiniStat label="Выплачено" value={strip.paidCount} />
      </AdminMiniStats>


      <div className={ap('sectionFilterRow')}>
        {STATUS_FILTERS.map((f) => {
          const active = statusFilter === f.value
          return (
            <button
              key={f.value || 'all'}
              type="button"
              className={ap('usersPaginationPage', active && 'usersPaginationPageCurrent')}
              aria-pressed={active}
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      <AdminTable<Withdrawal>
        variant="Withdrawals"
        columns={columns}
        rows={sortedItems}
        rowKey={(w) => w.id}
        loading={loading}
        ariaLabel="Выводы"
        emptyText={error ? 'Не удалось загрузить выводы' : 'Выводы не найдены'}
      />

      <AdminPagination
        page={page}
        pageCount={pageCount}
        total={total}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      {selected ? (
        <WithdrawalDispatchDrawer
          withdrawal={selected}
          mayManage={mayManage}
          mayReveal={mayReveal}
          copied={copied}
          onCopy={() => {
            try {
              void navigator.clipboard?.writeText(selected.methodDetails)
              setCopied(true)
              window.setTimeout(() => setCopied(false), 1500)
            } catch {

            }
          }}
          dispatchRoute={dispatchRoute}
          onDispatchRouteChange={setDispatchRoute}
          onDispatch={() => {
            mutate(selected, 'dispatch', { route: dispatchRoute })
            setSelected(null)
          }}
          onPay={() => {
            mutate(selected, 'markPaid')
            setSelected(null)
          }}
          onReject={() => {
            mutate(selected, 'reject')
            setSelected(null)
          }}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </section>
  )
}


interface DrawerProps {
  withdrawal: Withdrawal
  mayManage: boolean
  mayReveal: boolean
  copied: boolean
  onCopy: () => void
  dispatchRoute: string
  onDispatchRouteChange: (v: string) => void
  onDispatch: () => void
  onPay: () => void
  onReject: () => void
  onClose: () => void
}


const READONLY_BOX_STYLE: CSSProperties = {
  minHeight: '2.63rem',
  border: '1px solid var(--border-default)',
  background: 'var(--bg-default)',
  borderRadius: 'var(--radius)',
}

function WithdrawalDispatchDrawer({
  withdrawal: w,
  mayManage,
  mayReveal,
  copied,
  onCopy,
  dispatchRoute,
  onDispatchRouteChange,
  onDispatch,
  onPay,
  onReject,
  onClose,
}: DrawerProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const meta = methodMeta(w.method)
  const isLightning = w.method === 'CRYPTO'
  const converted = (w.amount / USDT_RUB_RATE).toFixed(2)

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  const statusMeta = STATUS_META[w.status]

  return (
    <>
      <div className={ap('editBackdrop')} onClick={onClose} aria-hidden="true" />
      <aside className={ap('editDrawer')} role="dialog" aria-modal="true" aria-label={`Вывод #${w.num}`}>

        <div className={ap('editDrawerHeader')}>
          <div className={ap('editDrawerHeaderLeft')}>
            <h3 className={ap('editDrawerTitle')}>Вывод</h3>
          </div>
          <span className={cx(ap('editDrawerTitleIdBadge'), ap('badge', 'badgeMuted'))}>#{w.num}</span>
          <hr className={ap('editDrawerDivider')} />
          <button ref={closeRef} type="button" className={ap('editDrawerClose')} onClick={onClose} aria-label="Закрыть">
            <svg className={ap('editDrawerCloseIcon')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={ap('editDrawerBody')}>
          <div className={ap('editDrawerInnerColumn')}>
            <div className={ap('formBody')}>

              <div className={ap('adminWithdrawalDrawerAmountRow')}>
                <span className={ap('withdrawalMethodTextCol')}>
                  <span className={ap('tableCellUserName')}>{w.identity}</span>
                  <span className={ap('tableCellUserEmail')}>{w.email}</span>
                </span>
                <AdminBadge tone={statusMeta.tone}>{statusMeta.label}</AdminBadge>
              </div>


              <div className={ap('formGroup')}>
                <label className={ap('formLabel')}>Способ вывода</label>
                <div
                  className={ap('withdrawalMethodReadonlyTrigger')}
                  data-withdrawal-method-readonly=""
                  style={READONLY_BOX_STYLE}
                >
                  <span className={ap('withdrawalMethodReadonlyIcon')}>
                    <MethodIcon method={w.method} className={ap('withdrawalMethodReadonlyIconImg')} />
                  </span>
                  <span className={ap('withdrawalMethodReadonlyLabel', 'withdrawalMethodReadonlyLabelWithIcon')}>
                    {meta.label} · {meta.kassaName}
                  </span>
                </div>
              </div>


              {isLightning ? (
                <div className={ap('adminWithdrawalDrawerAmountRow', 'adminWithdrawalDrawerAmountRowLightning')}>
                  <span className={ap('adminWithdrawalDrawerLightningPart', 'adminWithdrawalDrawerLightningPartStableBg')}>
                    <span className={ap('tableCellBalanceValue')}>
                      <RubleIcon />
                      {fmtRub(w.amount)}
                    </span>
                  </span>
                  <span className={ap('adminWithdrawalDrawerLightningArrowCircle')}>
                    <svg viewBox="0 0 24 24" width="0.9rem" height="0.9rem" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14m-6-6 6 6-6 6" />
                    </svg>
                  </span>
                  <span className={ap('adminWithdrawalDrawerLightningPart')}>
                    <span className={ap('tableCellBalanceValue')}>{converted} USDT</span>
                  </span>
                </div>
              ) : (
                <div className={ap('adminWithdrawalDrawerAmountRow')}>
                  <span className={ap('formLabel')}>Сумма</span>
                  <span className={ap('tableCellBalanceValue')}>
                    <RubleIcon />
                    {fmtRub(w.amount)}
                  </span>
                </div>
              )}


              {mayReveal ? (
                <div className={ap('formRowPair', 'formRowPairTwoCols')}>
                  <div className={ap('withdrawalDrawerDetailField')}>
                    <div className={ap('formGroup')}>
                      <label className={ap('formLabel')}>Реквизиты</label>
                      <div className={ap('withdrawalDrawerSensitiveInputWrap')}>
                        <div className={ap('withdrawalDrawerInputWithCopy')}>
                          <div className={ap('formGroup')}>
                            <input className={ap('formInput')} readOnly value={w.methodDetails} aria-label="Реквизиты" />
                          </div>
                          <button
                            type="button"
                            className={cx(ap('withdrawalDrawerCopyBtn'), copied && ap('withdrawalDrawerCopyBtnDanger'))}
                            onClick={onCopy}
                            aria-label={copied ? 'Скопировано' : 'Скопировать'}
                            title={copied ? 'Скопировано' : 'Скопировать'}
                          >
                            <svg className={ap('withdrawalDrawerCopyBtnIcon')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              {copied ? (
                                <path d="M20 6 9 17l-5-5" />
                              ) : (
                                <>
                                  <rect x="9" y="9" width="11" height="11" rx="2" />
                                  <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                                </>
                              )}
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}


              {mayManage ? (
                <div className={ap('adminWithdrawalDispatchSection')}>
                  <div className={ap('adminWithdrawalDispatchRow')}>
                    <div className={ap('adminWithdrawalDispatchSelect')}>
                      <select
                        className={ap('formInput')}
                        value={dispatchRoute}
                        onChange={(e) => onDispatchRouteChange(e.target.value)}
                        aria-label="Маршрут отправки"
                        style={{ width: '100%' }}
                      >
                        {DISPATCH_ROUTES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button type="button" className={ap('formBtnPrimary')} onClick={onDispatch}>
                      Отправить
                    </button>
                  </div>
                </div>
              ) : null}
            </div>


            {mayManage ? (
              <div className={ap('adminWithdrawalDrawerActions')}>
                <button type="button" className={ap('formBtnPrimary')} onClick={onPay} disabled={w.status === 'PAID'}>
                  Выплатить
                </button>
                <button type="button" className={ap('formBtnDanger')} onClick={onReject} disabled={w.status === 'REJECTED'}>
                  Отклонить
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  )
}
