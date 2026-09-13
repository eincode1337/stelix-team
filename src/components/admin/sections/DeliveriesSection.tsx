'use client'


import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  ap,
  cx,
  AdminBadge,
  AdminTable,
  AdminIconButton,
  AdminPagination,
  AdminSectionHeader,
  AdminSearchInput,
  AdminFilterBar,
  type AdminColumn,
  type BadgeTone,
  type SortDirection,
} from '@/components/admin/ui'
import { DeleteActionIcon, ViewActionIcon, RefundActionIcon } from './AdminActionIcons'


type DeliveryType = 'FILE' | 'DISCORD' | 'LINK' | 'APPLICATION' | 'KEY'

interface AdminDelivery {
  id: string
  userId: number
  user: string
  resourceId: string
  resource: string
  type: DeliveryType
  details: string
  createdAt: string
}

interface DeliveriesResponse {
  items: AdminDelivery[]
  total: number
  page: number
  pageSize: number
}

const PAGE_SIZE = 20


type TypeMeta = { label: string; tone: BadgeTone; toneClass: string }
const TYPE_META: Record<DeliveryType, TypeMeta> = {
  DISCORD: { label: 'Discord', tone: 'info', toneClass: 'badgeInfo' },
  APPLICATION: { label: 'Заявка', tone: 'warning', toneClass: 'badgeWarning' },
  FILE: { label: 'Файлы', tone: 'success', toneClass: 'badgeSuccess' },
  LINK: { label: 'Ссылка', tone: 'muted', toneClass: 'badgeMuted' },
  KEY: { label: 'Ключ', tone: 'muted', toneClass: 'badgeMuted' },
}


type TypeFilter = DeliveryType | 'ALL'
const TYPE_FILTERS: { value: TypeFilter; label: string; toneClass: string }[] = [
  { value: 'ALL', label: 'Все', toneClass: 'badgeInfo' },
  { value: 'DISCORD', label: 'Discord', toneClass: 'badgeInfo' },
  { value: 'APPLICATION', label: 'Заявка', toneClass: 'badgeWarning' },
  { value: 'FILE', label: 'Файлы', toneClass: 'badgeSuccess' },
  { value: 'LINK', label: 'Ссылка', toneClass: 'badgeMuted' },
  { value: 'KEY', label: 'Ключ', toneClass: 'badgeMuted' },
]


function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}.${d.getFullYear()}`
}

type SortState = { key: string; dir: 'asc' | 'desc' }


function sortValue(d: AdminDelivery, key: string): string | number {
  switch (key) {
    case 'user':
      return d.user.toLowerCase()
    case 'resource':
      return d.resource.toLowerCase()
    case 'type':
      return TYPE_META[d.type]?.label ?? d.type
    case 'details':
      return d.details.toLowerCase()
    case 'date':
    default:
      return Date.parse(d.createdAt) || 0
  }
}

export interface DeliveriesSectionProps {

  resourceId?: string
}

export function DeliveriesSection({ resourceId }: DeliveriesSectionProps = {}) {
  const scoped = Boolean(resourceId)

  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<SortState>({ key: 'date', dir: 'desc' })

  const [data, setData] = useState<DeliveriesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [busyId, setBusyId] = useState<string | null>(null)
  const [reload, setReload] = useState(0)


  const [viewing, setViewing] = useState<AdminDelivery | null>(null)
  const [resentId, setResentId] = useState<string | null>(null)


  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => window.clearTimeout(id)
  }, [query])

  useEffect(() => {
    setPage(1)
  }, [debouncedQuery, typeFilter])


  const reqId = useRef(0)
  useEffect(() => {
    const id = ++reqId.current
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('pageSize', String(PAGE_SIZE))
    if (debouncedQuery) params.set('q', debouncedQuery)
    if (typeFilter !== 'ALL') params.set('status', typeFilter)
    if (resourceId) params.set('resourceId', resourceId)

    fetch(`/api/admin/deliveries?${params.toString()}`, {
      credentials: 'same-origin',
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return (await res.json()) as DeliveriesResponse
      })
      .then((json) => {
        if (id !== reqId.current) return
        setData(json)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted || id !== reqId.current) return
        setError(err instanceof Error ? err.message : 'Не удалось загрузить выдачи')
        setLoading(false)
      })

    return () => controller.abort()
  }, [page, debouncedQuery, typeFilter, resourceId, reload])

  const handleSort = useCallback((key: string) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: key === 'date' ? 'desc' : 'asc' },
    )
  }, [])


  const deleteDelivery = useCallback(
    async (d: AdminDelivery) => {
      if (busyId) return
      if (typeof window !== 'undefined' && !window.confirm('Удалить запись о выдаче?')) return
      setBusyId(d.id)
      setError(null)

      const prev = data
      setData((cur) =>
        cur
          ? {
              ...cur,
              items: cur.items.filter((it) => it.id !== d.id),
              total: Math.max(0, cur.total - 1),
            }
          : cur,
      )

      try {
        const res = await fetch(`/api/admin/deliveries/${encodeURIComponent(d.id)}`, {
          method: 'DELETE',
          credentials: 'same-origin',
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)


        const wasLastOnPage = (prev?.items.length ?? 0) <= 1
        if (wasLastOnPage && page > 1) setPage((p) => Math.max(1, p - 1))
        else setReload((n) => n + 1)
      } catch {

        setData(prev)
        setError('Не удалось удалить выдачу')
      } finally {
        setBusyId(null)
      }
    },
    [busyId, data, page],
  )


  const resendDelivery = useCallback(
    async (d: AdminDelivery) => {
      if (busyId) return
      setBusyId(d.id)
      setError(null)
      try {
        const res = await fetch(`/api/admin/deliveries/${encodeURIComponent(d.id)}`, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'content-type': 'application/json', accept: 'application/json' },
          body: JSON.stringify({ action: 'resend' }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        setResentId(d.id)
        window.setTimeout(() => setResentId((cur) => (cur === d.id ? null : cur)), 2500)
      } catch {
        setError('Не удалось повторить выдачу')
      } finally {
        setBusyId(null)
      }
    },
    [busyId],
  )


  const rows = useMemo(() => {
    const items = data?.items ?? []
    const sorted = [...items].sort((a, b) => {
      const av = sortValue(a, sort.key)
      const bv = sortValue(b, sort.key)
      if (av < bv) return sort.dir === 'asc' ? -1 : 1
      if (av > bv) return sort.dir === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [data, sort])

  const total = data?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const dirFor = (key: string): SortDirection => (sort.key === key ? sort.dir : null)

  const columns = useMemo<AdminColumn<AdminDelivery>[]>(() => {
    const cols: AdminColumn<AdminDelivery>[] = []


    cols.push({
      key: 'user',
      header: 'Пользователь',
      align: 'start',
      sortable: true,
      sortDirection: dirFor('user'),
      onSort: handleSort,
      cellClassName: ap('tableCellUserIdentity'),
      cell: (d) => (
        <>
          <span className={ap('tableCellUserName')}>{d.user}</span>
          <span className={ap('tableCellUserEmail')}>#{d.userId}</span>
        </>
      ),
    })


    if (!scoped) {
      cols.push({
        key: 'resource',
        header: 'Ресурс',
        align: 'start',
        sortable: true,
        sortDirection: dirFor('resource'),
        onSort: handleSort,
        cell: (d) => <span className={ap('tableCellResourceTitle')}>{d.resource}</span>,
      })
    }


    cols.push({
      key: 'type',
      header: 'Тип',
      align: 'center',
      sortable: true,
      sortDirection: dirFor('type'),
      onSort: handleSort,
      cell: (d) => {
        const meta = TYPE_META[d.type] ?? { label: d.type, tone: 'muted' as BadgeTone }
        return <AdminBadge tone={meta.tone}>{meta.label}</AdminBadge>
      },
    })


    cols.push({
      key: 'details',
      header: 'Детали',
      align: 'start',
      sortable: true,
      sortDirection: dirFor('details'),
      onSort: handleSort,
      cellClassName: ap('tableCellMuted'),
      cell: (d) => <span title={d.details}>{d.details}</span>,
    })


    cols.push({
      key: 'date',
      header: 'Дата',
      align: 'end',
      sortable: true,
      sortDirection: dirFor('date'),
      onSort: handleSort,
      cell: (d) => <span className={ap('tableCellDateSingle')}>{formatDate(d.createdAt)}</span>,
    })


    cols.push({
      key: 'actions',
      header: '',
      align: 'actions',
      cell: (d) => (
        <>
          <AdminIconButton
            label="Просмотр выдачи"
            tone="accent"
            onClick={() => setViewing(d)}
          >
            <ViewActionIcon />
          </AdminIconButton>
          <AdminIconButton
            label={resentId === d.id ? 'Отправлено повторно' : 'Повторить выдачу'}
            tone={resentId === d.id ? 'success' : 'neutral'}
            onClick={() => resendDelivery(d)}
            disabled={busyId === d.id}
          >
            <RefundActionIcon />
          </AdminIconButton>
          <AdminIconButton
            label="Удалить выдачу"
            tone="danger"
            onClick={() => deleteDelivery(d)}
            disabled={busyId === d.id}
          >
            <DeleteActionIcon />
          </AdminIconButton>
        </>
      ),
    })

    return cols
  }, [scoped, sort, handleSort, deleteDelivery, resendDelivery, busyId, resentId])

  const emptyText =
    debouncedQuery || typeFilter !== 'ALL'
      ? 'Ничего не найдено'
      : 'Выдач пока нет'

  const table = (
    <>
      <AdminTable<AdminDelivery>
        variant={scoped ? 'DeliveryLogsResourceScope' : 'DeliveryLogs'}
        columns={columns}
        rows={rows}
        rowKey={(d) => d.id}
        loading={loading && rows.length === 0}
        emptyText={error ?? emptyText}
        ariaLabel="Выдачи"
      />

      {pageCount > 1 || total > 0 ? (
        <AdminPagination
          page={page}
          pageCount={pageCount}
          onPageChange={setPage}
          total={total}
          pageSize={PAGE_SIZE}
        />
      ) : null}


      {viewing ? (
        <>
          <div className={ap('editBackdrop')} onClick={() => setViewing(null)} aria-hidden="true" />
          <aside
            className={ap('editDrawer', 'editDrawerSlideIn')}
            role="dialog"
            aria-modal="true"
            aria-label="Выдача"
          >
            <div className={ap('editDrawerBody')}>
              <div className={ap('editDrawerInnerColumn')}>
                <div className={ap('editDrawerHeader')}>
                  <div className={ap('editDrawerHeaderLeft')} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      className={ap('editDrawerTitleIdBadge')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius)',
                        fontSize: '.78rem',
                        fontWeight: 600,
                        color: 'var(--fg-muted)',
                      }}
                    >
                      #{viewing.id}
                    </span>
                    <h3 className={ap('editDrawerTitle')}>Выдача</h3>
                  </div>
                  <hr className={ap('editDrawerDivider')} />
                  <button
                    type="button"
                    className={ap('editDrawerClose')}
                    onClick={() => setViewing(null)}
                    aria-label="Закрыть"
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
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className={ap('formBody')}>
                  <div className={ap('settingsFieldRow')}>
                    <label className={ap('settingsFieldLabel')} htmlFor="dl-user">
                      Пользователь
                    </label>
                    <div className={ap('settingsFieldControl')}>
                      <input id="dl-user" className={ap('formInput')} value={`${viewing.user} · #${viewing.userId}`} readOnly />
                    </div>
                  </div>

                  <div className={ap('settingsFieldRow')}>
                    <label className={ap('settingsFieldLabel')} htmlFor="dl-resource">
                      Ресурс
                    </label>
                    <div className={ap('settingsFieldControl')}>
                      <input id="dl-resource" className={ap('formInput')} value={`${viewing.resource} · ${viewing.resourceId}`} readOnly />
                    </div>
                  </div>

                  <div className={ap('settingsFieldRow')}>
                    <label className={ap('settingsFieldLabel')}>Тип</label>
                    <div className={ap('settingsFieldControl')}>
                      <AdminBadge tone={TYPE_META[viewing.type]?.tone ?? 'muted'}>
                        {TYPE_META[viewing.type]?.label ?? viewing.type}
                      </AdminBadge>
                    </div>
                  </div>

                  <div className={ap('settingsFieldRow')}>
                    <label className={ap('settingsFieldLabel')} htmlFor="dl-details">
                      Детали
                    </label>
                    <div className={ap('settingsFieldControl')}>
                      <textarea id="dl-details" className={ap('formTextarea')} value={viewing.details} readOnly rows={3} />
                    </div>
                  </div>

                  <div className={ap('settingsFieldRow')}>
                    <label className={ap('settingsFieldLabel')} htmlFor="dl-date">
                      Дата
                    </label>
                    <div className={ap('settingsFieldControl')}>
                      <input id="dl-date" className={ap('formInput')} value={formatDate(viewing.createdAt)} readOnly />
                    </div>
                  </div>

                  {error ? <span className={ap('formHint')} role="alert">{error}</span> : null}
                </div>

                <div className={ap('formActions')}>
                  <button
                    type="button"
                    className={ap('formBtnPrimary')}
                    onClick={() => resendDelivery(viewing)}
                    disabled={busyId === viewing.id}
                  >
                    {resentId === viewing.id ? 'Отправлено' : busyId === viewing.id ? 'Отправка…' : 'Повторить выдачу'}
                  </button>
                  <button
                    type="button"
                    className={ap('formBtnDanger')}
                    onClick={() => {
                      const d = viewing
                      setViewing(null)
                      void deleteDelivery(d)
                    }}
                    disabled={busyId === viewing.id}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </>
      ) : null}
    </>
  )


  if (scoped) {
    return (
      <section className={ap('section')}>{table}</section>
    )
  }

  return (
    <section className={ap('section')} id="admin-deliveries">
      <AdminSectionHeader title="Выдачи">
        <AdminSearchInput
          value={query}
          onChange={setQuery}
          onClear={() => setQuery('')}
          placeholder="Поиск"
          ariaLabel="Поиск по выдачам"
        />
      </AdminSectionHeader>


      <AdminFilterBar>
        {TYPE_FILTERS.map((opt) => {
          const active = typeFilter === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              className={cx(ap('badge', active ? opt.toneClass : 'badgeMuted'))}
              aria-pressed={active}
              onClick={() => setTypeFilter(opt.value)}
              style={{
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                opacity: active ? 1 : 0.72,
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </AdminFilterBar>

      {table}
    </section>
  )
}
