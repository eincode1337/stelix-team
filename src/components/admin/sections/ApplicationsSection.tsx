'use client'


import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  ap,
  AdminTable,
  type AdminColumn,
  type SortDirection,
  AdminBadge,
  AdminRoleBadge,
  type BadgeTone,
  AdminPagination,
  AdminSectionHeader,
  AdminSearchInput,
  AdminFilterBar,
  roleLevel,
} from '@/components/admin/ui'


type AppStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN'

interface Application {
  id: string
  userId: number
  identity: string
  email: string
  role: string
  status: AppStatus
  createdAt: string
  updatedAt: string | null
}

interface ListResponse {
  items: Application[]
  total: number
  page: number
  pageSize: number
}


const STATUS_META: Record<AppStatus, { label: string; tone: BadgeTone }> = {
  PENDING: { label: 'На рассмотрении', tone: 'warning' },
  APPROVED: { label: 'Одобрена', tone: 'success' },
  REJECTED: { label: 'Отклонена', tone: 'danger' },
  WITHDRAWN: { label: 'Отозвана', tone: 'muted' },
}
const STATUS_SORT_ORDER: AppStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN']


const STATUS_FILTERS: { key: '' | AppStatus; label: string; toneClass: string }[] = [
  { key: '', label: 'Все', toneClass: 'badgeMuted' },
  { key: 'PENDING', label: 'На рассмотрении', toneClass: 'badgeWarning' },
  { key: 'APPROVED', label: 'Одобрена', toneClass: 'badgeSuccess' },
  { key: 'REJECTED', label: 'Отклонена', toneClass: 'badgeDanger' },
]

const PAGE_SIZE = 20

type SortKey = 'identity' | 'role' | 'created' | 'updated' | 'status'

const DEFAULT_DIR: Record<SortKey, Exclude<SortDirection, null>> = {
  identity: 'asc',
  role: 'desc',
  created: 'desc',
  updated: 'desc',
  status: 'asc',
}


function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return '—'
  const d = new Date(t)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}.${d.getFullYear()}`
}


function deriveProject(app: Application): string | null {
  let h = 0
  for (let i = 0; i < app.id.length; i++) h = (h * 31 + app.id.charCodeAt(i)) >>> 0
  if (h % 2 === 0) return null
  const base = (app.email.split('@')[0] || app.identity || 'shop')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 14)
  const tld = ['store', 'shop', 'ru', 'io', 'site'][h % 5]
  return `${base || 'shop'}.${tld}`
}


function IdentityCell({ app }: { app: Application }) {
  const project = deriveProject(app)
  const showEmail = Boolean(app.email) && app.email !== app.identity
  return (
    <>
      <span className={ap('tableCellUserName')}>{app.identity}</span>
      {showEmail ? <span className={ap('tableCellUserEmail')}>{app.email}</span> : null}
      {project ? (
        <div
          className={ap('applicationProjectRow')}
          style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}
        >

          <svg
            viewBox="0 0 24 24"
            width="0.82rem"
            height="0.82rem"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{ flexShrink: 0, color: 'var(--fg-muted)', opacity: 0.85 }}
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
          </svg>
          <span className={ap('tableCellUserEmail')} style={{ margin: 0 }}>
            {project}
          </span>
        </div>
      ) : null}
    </>
  )
}

interface RowActionsProps {
  app: Application
  pending: boolean
  onApprove: (app: Application) => void
  onReject: (app: Application) => void
}


function RowActions({ app, pending, onApprove, onReject }: RowActionsProps) {
  if (app.status !== 'PENDING') return null
  return (
    <>
      <button
        type="button"
        className={ap('approveButton')}
        disabled={pending}
        onClick={(e) => {
          e.stopPropagation()
          onApprove(app)
        }}
      >
        Одобрить
      </button>
      <button
        type="button"
        className={ap('rejectButton')}
        disabled={pending}
        onClick={(e) => {
          e.stopPropagation()
          onReject(app)
        }}
      >
        Отклонить
      </button>
    </>
  )
}


export function ApplicationsSection() {
  const [items, setItems] = useState<Application[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState('')
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'' | AppStatus>('')

  const [sortKey, setSortKey] = useState<SortKey>('created')
  const [sortDir, setSortDir] = useState<Exclude<SortDirection, null>>('desc')

  const [selected, setSelected] = useState<Application | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)


  const [refreshTick, setRefreshTick] = useState(0)

  const reqRef = useRef(0)


  useEffect(() => {
    const id = window.setTimeout(() => setQ(searchInput.trim()), 300)
    return () => window.clearTimeout(id)
  }, [searchInput])


  useEffect(() => {
    setPage(1)
  }, [q, status])


  useEffect(() => {
    const rid = ++reqRef.current
    setLoading(true)
    setError(null)

    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
    if (q) params.set('q', q)
    if (status) params.set('status', status)

    fetch(`/api/admin/applications?${params.toString()}`, { cache: 'no-store', credentials: 'same-origin' })
      .then(async (r) => {
        if (!r.ok) {
          throw new Error(r.status === 401 ? 'Требуется вход в систему' : `Ошибка загрузки (${r.status})`)
        }
        return (await r.json()) as ListResponse
      })
      .then((data) => {
        if (rid !== reqRef.current) return
        setItems(Array.isArray(data.items) ? data.items : [])
        setTotal(typeof data.total === 'number' ? data.total : 0)
        setLoading(false)
      })
      .catch((e: unknown) => {
        if (rid !== reqRef.current) return
        setItems([])
        setTotal(0)
        setError(e instanceof Error ? e.message : 'Ошибка загрузки')
        setLoading(false)
      })
  }, [page, q, status, refreshTick])


  const sorted = useMemo(() => {
    const arr = [...items]
    arr.sort((a, b) => {
      let d = 0
      switch (sortKey) {
        case 'identity':
          d = a.identity.localeCompare(b.identity, 'ru')
          break
        case 'role':
          d = roleLevel(a.role) - roleLevel(b.role)
          break
        case 'created':
          d = Date.parse(a.createdAt) - Date.parse(b.createdAt)
          break
        case 'updated':
          d = (Date.parse(a.updatedAt ?? '') || 0) - (Date.parse(b.updatedAt ?? '') || 0)
          break
        case 'status':
          d = STATUS_SORT_ORDER.indexOf(a.status) - STATUS_SORT_ORDER.indexOf(b.status)
          break
      }
      return sortDir === 'asc' ? d : -d
    })
    return arr
  }, [items, sortKey, sortDir])

  const onSort = useCallback(
    (key: string) => {
      const k = key as SortKey
      if (sortKey === k) {
        setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortKey(k)
        setSortDir(DEFAULT_DIR[k] ?? 'asc')
      }
    },
    [sortKey],
  )


  const patchRow = useCallback((id: string, patch: Partial<Application>) => {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))
    setSelected((prev) => (prev && prev.id === id ? { ...prev, ...patch } : prev))
  }, [])


  const decide = useCallback(
    (app: Application, next: AppStatus) => {
      const action = next === 'APPROVED' ? 'approve' : 'reject'
      const prevStatus = app.status
      const prevUpdated = app.updatedAt

      setPendingId(app.id)
      setActionError(null)
      patchRow(app.id, { status: next, updatedAt: new Date().toISOString() })

      fetch(`/api/admin/applications/${encodeURIComponent(app.id)}`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action }),
      })
        .then(async (r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`)
          return (await r.json()) as { ok?: boolean; item?: Partial<Application> }
        })
        .then((res) => {
          if (!res || res.ok === false) throw new Error('mutation_failed')

          setRefreshTick((t) => t + 1)
        })
        .catch(() => {
          patchRow(app.id, { status: prevStatus, updatedAt: prevUpdated })
          setActionError('Не удалось обновить заявку. Попробуйте ещё раз.')
        })
        .finally(() => {
          setPendingId((cur) => (cur === app.id ? null : cur))
        })
    },
    [patchRow],
  )

  const onApprove = useCallback((app: Application) => decide(app, 'APPROVED'), [decide])
  const onReject = useCallback((app: Application) => decide(app, 'REJECTED'), [decide])


  const onDelete = useCallback((app: Application) => {
    setPendingId(app.id)
    setActionError(null)
    setSelected((cur) => (cur && cur.id === app.id ? null : cur))
    setItems((prev) => prev.filter((a) => a.id !== app.id))
    setTotal((t) => Math.max(0, t - 1))

    fetch(`/api/admin/applications/${encodeURIComponent(app.id)}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
      })
      .then(() => setRefreshTick((t) => t + 1))
      .catch(() => {
        setActionError('Не удалось удалить заявку. Попробуйте ещё раз.')
        setRefreshTick((t) => t + 1)
      })
      .finally(() => setPendingId((cur) => (cur === app.id ? null : cur)))
  }, [])

  const sortDirFor = (k: SortKey): SortDirection => (sortKey === k ? sortDir : null)

  const columns: AdminColumn<Application>[] = [
    {
      key: 'identity',
      header: 'Заявитель',
      align: 'start',
      sortable: true,
      sortDirection: sortDirFor('identity'),
      onSort,
      cellClassName: 'tableCellUserIdentity',
      cell: (a) => <IdentityCell app={a} />,
    },
    {
      key: 'role',
      header: 'Роль',
      align: 'center',
      sortable: true,
      sortDirection: sortDirFor('role'),
      onSort,
      cell: (a) => <AdminRoleBadge role={a.role} />,
    },
    {
      key: 'created',
      header: 'Создана',
      align: 'end',
      sortable: true,
      sortDirection: sortDirFor('created'),
      onSort,
      cell: (a) => <span className={ap('tableCellDateSingle')}>{fmtDate(a.createdAt)}</span>,
    },
    {
      key: 'updated',
      header: 'Изменена',
      align: 'end',
      sortable: true,
      sortDirection: sortDirFor('updated'),
      onSort,
      cell: (a) => <span className={ap('tableCellDateSingle')}>{fmtDate(a.updatedAt)}</span>,
    },
    {
      key: 'status',
      header: 'Статус',
      align: 'center',
      sortable: true,
      sortDirection: sortDirFor('status'),
      onSort,
      cell: (a) => {
        const meta = STATUS_META[a.status] ?? STATUS_META.PENDING
        return <AdminBadge tone={meta.tone}>{meta.label}</AdminBadge>
      },
    },
    {
      key: 'actions',
      header: 'Действия',
      align: 'actions',
      cell: (a) => (
        <RowActions app={a} pending={pendingId === a.id} onApprove={onApprove} onReject={onReject} />
      ),
    },
  ]

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <section className={ap('section')} id="admin-applications">
      <AdminSectionHeader title="Заявки">
        <AdminSearchInput
          value={searchInput}
          onChange={setSearchInput}
          onClear={() => setSearchInput('')}
          placeholder="Поиск"
          ariaLabel="Поиск по заявкам"
        />
      </AdminSectionHeader>


      <AdminFilterBar>
        {STATUS_FILTERS.map((f) => {
          const active = status === f.key
          return (
            <button
              key={f.key || 'all'}
              type="button"
              className={ap('badge', active ? f.toneClass : 'badgeMuted')}
              style={{ cursor: 'pointer', opacity: active ? 1 : 0.6 }}
              aria-pressed={active}
              onClick={() => setStatus(f.key)}
            >
              {f.label}
            </button>
          )
        })}
      </AdminFilterBar>


      {actionError ? (
        <p
          className={ap('emptyStateText')}
          role="alert"
          style={{ color: 'var(--danger-fg, #d33)', padding: '0.5rem 0', textAlign: 'center' }}
        >
          {actionError}
        </p>
      ) : null}

      {error ? (
        <p className={ap('emptyStateText')} role="alert" style={{ padding: '2rem', textAlign: 'center' }}>
          {error}
        </p>
      ) : (
        <AdminTable
          variant="Apps"
          columns={columns}
          rows={sorted}
          rowKey={(a) => a.id}
          loading={loading}
          ariaLabel="Заявки продавцов"
          emptyText="Заявок пока нет"
          onRowClick={(a) => setSelected(a)}
        />
      )}

      {!error && total > 0 ? (
        <AdminPagination
          page={page}
          pageCount={pageCount}
          total={total}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      ) : null}

      {selected ? (
        <ApplicationDrawer
          app={selected}
          pending={pendingId === selected.id}
          onClose={() => setSelected(null)}
          onApprove={onApprove}
          onReject={onReject}
          onDelete={onDelete}
        />
      ) : null}
    </section>
  )
}


interface ApplicationDrawerProps {
  app: Application
  pending: boolean
  onClose: () => void
  onApprove: (app: Application) => void
  onReject: (app: Application) => void
  onDelete: (app: Application) => void
}

function ApplicationDrawer({ app, pending, onClose, onApprove, onReject, onDelete }: ApplicationDrawerProps) {
  const project = deriveProject(app)
  const [notes, setNotes] = useState('')
  const meta = STATUS_META[app.status] ?? STATUS_META.PENDING
  const decided = app.status !== 'PENDING'


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      <div className={ap('editBackdrop')} onClick={onClose} aria-hidden="true" />
      <aside
        className={ap('editDrawer', 'editDrawerSlideIn')}
        role="dialog"
        aria-modal="true"
        aria-label="Заявка"
      >
        <div className={ap('editDrawerBody')}>
          <div className={ap('editDrawerInnerColumn')}>
            <div className={ap('editDrawerHeader')}>
              <div
                className={ap('editDrawerHeaderLeft')}
                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <span className={ap('badge', 'badgeMuted', 'editDrawerTitleIdBadge')}>#{app.userId}</span>
                <h3 className={ap('editDrawerTitle')}>Заявка</h3>
              </div>
              <button
                type="button"
                className={ap('editDrawerClose')}
                onClick={onClose}
                aria-label="Закрыть"
                style={{ marginLeft: 'auto' }}
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

            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {project ? (
                <div
                  className={ap('editUserPendingSiteRow')}
                  style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}
                >
                  <span className={ap('editUserPendingSiteHint')}>

                    {project} · сайт ожидает подтверждения
                  </span>
                  <button
                    type="button"
                    className={ap('editUserPendingSiteConfirmBtn')}
                    disabled={pending || decided}
                    onClick={() => onApprove(app)}
                  >
                    Подтвердить
                  </button>
                </div>
              ) : null}


              <div>
                <span className={ap('formLabel')}>Заявитель</span>
                <div className={ap('tableCellUserIdentity')} style={{ paddingLeft: '8px' }}>
                  <span className={ap('tableCellUserName')}>{app.identity}</span>
                  {app.email && app.email !== app.identity ? (
                    <span className={ap('tableCellUserEmail')}>{app.email}</span>
                  ) : null}
                </div>
              </div>


              <div>
                <span className={ap('formLabel')}>Роль</span>
                <div style={{ paddingLeft: '8px', paddingTop: '0.25rem' }}>
                  <AdminRoleBadge role={app.role} />
                </div>
              </div>


              <div>
                <span className={ap('formLabel')}>Статус</span>
                <div style={{ paddingLeft: '8px', paddingTop: '0.25rem' }}>
                  <AdminBadge tone={meta.tone}>{meta.label}</AdminBadge>
                </div>
              </div>


              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div>
                  <span className={ap('formLabel')}>Создана</span>
                  <div className={ap('tableCellDateSingle')} style={{ paddingLeft: '8px' }}>
                    {fmtDate(app.createdAt)}
                  </div>
                </div>
                <div>
                  <span className={ap('formLabel')}>Изменена</span>
                  <div className={ap('tableCellDateSingle')} style={{ paddingLeft: '8px' }}>
                    {fmtDate(app.updatedAt)}
                  </div>
                </div>
              </div>


              <div>
                <span className={ap('formLabel')}>Заметки</span>
                <textarea
                  className={ap('formInput')}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Комментарий модератора"
                  rows={3}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>
            </div>


            <hr className={ap('editDrawerDivider')} />
            {!decided ? (
              <div className={ap('formActionsRow')}>
                <button
                  type="button"
                  className={ap('approveButton')}
                  disabled={pending}
                  onClick={() => onApprove(app)}
                >
                  Одобрить
                </button>
                <button
                  type="button"
                  className={ap('rejectButton')}
                  disabled={pending}
                  onClick={() => onReject(app)}
                >
                  Отклонить
                </button>
              </div>
            ) : null}

            <div className={ap('formActionsRow')}>
              <button
                type="button"
                className={ap('formBtnDanger')}
                disabled={pending}
                onClick={() => onDelete(app)}
              >
                Удалить заявку
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
