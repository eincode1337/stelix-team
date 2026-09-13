'use client'


import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'

import {
  ap,
  cx,
  AdminTable,
  AdminIconButton,
  ADMIN_ICONS,
  AdminBadge,
  AdminBadgeStack,
  AdminRoleBadge,
  AdminPagination,
  AdminFilterBar,
  AdminSectionHeader,
  AdminSearchInput,
  roleColor,
  roleLabel,
  type AdminColumn,
  type BadgeTone,
  type SortDirection,
} from '@/components/admin/ui'
import { EditActionIcon, HideActionIcon, DeleteActionIcon } from './AdminActionIcons'


type ResourceRow = {
  id: string
  title: string
  author: string
  authorId: number
  authorRole: string
  price: number
  sales: number
  status: string
  featured?: boolean
  createdAt: string
  updatedAt: string | null
}

type ResourcesResponse = {
  items: ResourceRow[]
  total: number
  page: number
  pageSize: number
}


type MutationResult = {
  ok: boolean
  item?: Partial<ResourceRow>
  id?: string | number
}


type SortKey = 'title' | 'price' | 'sales' | 'createdAt' | 'updatedAt'
const DEFAULT_SORT: SortKey = 'createdAt'
const DEFAULT_DIR: Exclude<SortDirection, null> = 'desc'

const PAGE_SIZE = 20
const RESOURCES_ENDPOINT = '/api/admin/resources'


function statusMeta(status: string): { tone: BadgeTone; label: string } {
  switch (status.toUpperCase()) {
    case 'APPROVED':
      return { tone: 'success', label: 'Одобрен' }
    case 'PENDING':
    case 'ON_REVIEW':
    case 'MODERATION':
      return { tone: 'warning', label: 'На модерации' }
    case 'REJECTED':
    case 'DECLINED':
      return { tone: 'danger', label: 'Отклонён' }
    case 'DRAFT':
      return { tone: 'muted', label: 'Черновик' }
    case 'HIDDEN':
      return { tone: 'muted', label: 'Скрыт' }
    case 'ARCHIVED':
      return { tone: 'muted', label: 'В архиве' }
    default:
      return { tone: 'muted', label: status }
  }
}


function isModeration(status: string): boolean {
  switch (status.toUpperCase()) {
    case 'PENDING':
    case 'ON_REVIEW':
    case 'MODERATION':
      return true
    default:
      return false
  }
}


const RUB = new Intl.NumberFormat('ru-RU')
function formatPrice(price: number): string {
  return `${RUB.format(price)} ₽`
}


function formatDmyHm(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const date = d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  })
  const time = d.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  })
  return `${date}, ${time}`
}


async function postResourceAction(
  id: string,
  action: string,
  data: Record<string, unknown> = {},
): Promise<MutationResult> {
  const res = await fetch(`${RESOURCES_ENDPOINT}/${encodeURIComponent(id)}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action, ...data }),
  })
  if (!res.ok) throw new Error(`resources action ${res.status}`)
  return (await res.json()) as MutationResult
}

async function deleteResourceRequest(id: string): Promise<MutationResult> {
  const res = await fetch(`${RESOURCES_ENDPOINT}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'same-origin',
  })
  if (!res.ok) throw new Error(`resources delete ${res.status}`)
  return (await res.json()) as MutationResult
}


async function fetchAllResources(signal: AbortSignal): Promise<ResourceRow[]> {
  const out: ResourceRow[] = []
  let page = 1
  for (let guard = 0; guard < 50; guard++) {
    const res = await fetch(`${RESOURCES_ENDPOINT}?page=${page}&pageSize=100`, {
      credentials: 'same-origin',
      signal,
      headers: { accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`resources ${res.status}`)
    const data = (await res.json()) as ResourcesResponse
    out.push(...data.items)
    if (out.length >= data.total || data.items.length === 0) break
    page += 1
  }
  return out
}


export function ResourcesSection() {

  const [items, setItems] = useState<ResourceRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  const [searchInput, setSearchInput] = useState('')
  const [query, setQuery] = useState('')
  const [pending, setPending] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({
    key: DEFAULT_SORT,
    dir: DEFAULT_DIR,
  })
  const [page, setPage] = useState(1)


  const [facets, setFacets] = useState<{ statuses: string[]; roles: string[] }>({
    statuses: [],
    roles: [],
  })


  const [busyIds, setBusyIds] = useState<Set<string>>(new Set())


  const [editing, setEditing] = useState<ResourceRow | null>(null)


  const load = useCallback(
    async (opts: { signal?: AbortSignal; quiet?: boolean } = {}) => {
      if (!opts.quiet) setLoading(true)
      const sp = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
      if (query) sp.set('q', query)
      if (statusFilter) sp.set('status', statusFilter)
      if (roleFilter) sp.set('role', roleFilter)
      try {
        const res = await fetch(`${RESOURCES_ENDPOINT}?${sp.toString()}`, {
          credentials: 'same-origin',
          signal: opts.signal,
          headers: { accept: 'application/json' },
        })
        if (!res.ok) throw new Error(`resources ${res.status}`)
        const data = (await res.json()) as ResourcesResponse
        setItems(Array.isArray(data.items) ? data.items : [])
        setTotal(typeof data.total === 'number' ? data.total : 0)
        setError(null)
        setLoading(false)
      } catch (e: unknown) {
        if ((e as { name?: string }).name === 'AbortError') return
        setItems([])
        setTotal(0)
        setError('Не удалось загрузить ресурсы')
        setLoading(false)
      }
    },
    [page, query, statusFilter, roleFilter],
  )

  useEffect(() => {
    const ctrl = new AbortController()
    void load({ signal: ctrl.signal })
    return () => ctrl.abort()
  }, [load])


  const loadFacets = useCallback(async (signal?: AbortSignal) => {
    const ctrl = new AbortController()
    try {
      const all = await fetchAllResources(signal ?? ctrl.signal)
      setFacets({
        statuses: [...new Set(all.map((r) => r.status))].sort(),
        roles: [...new Set(all.map((r) => r.authorRole))].sort(),
      })
    } catch {

    }
  }, [])

  useEffect(() => {
    const ctrl = new AbortController()
    void loadFacets(ctrl.signal)
    return () => ctrl.abort()
  }, [loadFacets])


  useEffect(() => {
    if (searchInput.trim() === query) {
      setPending(false)
      return
    }
    setPending(true)
    const t = setTimeout(() => {
      setQuery(searchInput.trim())
      setPending(false)
    }, 250)
    return () => clearTimeout(t)
  }, [searchInput, query])


  useEffect(() => {
    setPage(1)
  }, [query, statusFilter, roleFilter])

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))


  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [pageCount, page])


  const statusOptions = facets.statuses
  const roleOptions = facets.roles


  const sorted = useMemo(() => {
    const dir = sort.dir === 'asc' ? 1 : -1
    const copy = [...items]
    copy.sort((a, b) => {
      let cmp = 0
      switch (sort.key) {
        case 'title':
          cmp = a.title.localeCompare(b.title, 'ru')
          break
        case 'price':
          cmp = a.price - b.price
          break
        case 'sales':
          cmp = a.sales - b.sales
          break
        case 'createdAt':
          cmp = Date.parse(a.createdAt) - Date.parse(b.createdAt)
          break
        case 'updatedAt': {

          const av = a.updatedAt ? Date.parse(a.updatedAt) : null
          const bv = b.updatedAt ? Date.parse(b.updatedAt) : null
          if (av === null && bv === null) cmp = 0
          else if (av === null) return 1
          else if (bv === null) return -1
          else cmp = av - bv
          break
        }
      }
      return cmp * dir
    })
    return copy
  }, [items, sort])

  const handleSort = useCallback((key: string) => {
    const k = key as SortKey
    setSort((prev) =>
      prev.key === k
        ? { key: k, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key: k, dir: 'desc' },
    )
  }, [])

  const sortDirFor = (key: SortKey): SortDirection => (sort.key === key ? sort.dir : null)


  const applyPatch = useCallback((id: string, patch: Partial<ResourceRow>) => {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }, [])

  const markBusy = useCallback((id: string, on: boolean) => {
    setBusyIds((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])


  const runAction = useCallback(
    async (
      row: ResourceRow,
      action: string,
      optimistic: Partial<ResourceRow>,
      data: Record<string, unknown> = {},
    ) => {
      const before = { ...row }
      markBusy(row.id, true)
      applyPatch(row.id, optimistic)
      try {
        const result = await postResourceAction(row.id, action, data)
        if (result.item) applyPatch(row.id, result.item)
        void loadFacets()
      } catch {
        applyPatch(row.id, before)
        void load({ quiet: true })
      } finally {
        markBusy(row.id, false)
      }
    },
    [applyPatch, markBusy, load, loadFacets],
  )

  const approveResource = useCallback(
    (row: ResourceRow) => runAction(row, 'approve', { status: 'APPROVED' }),
    [runAction],
  )
  const rejectResource = useCallback(
    (row: ResourceRow) => runAction(row, 'reject', { status: 'REJECTED' }),
    [runAction],
  )
  const hideResource = useCallback(
    (row: ResourceRow) => runAction(row, 'setStatus', { status: 'HIDDEN' }, { status: 'HIDDEN' }),
    [runAction],
  )

  const toggleFeatured = useCallback(
    (row: ResourceRow) => {
      const next = !row.featured
      return runAction(row, 'feature', { featured: next }, { featured: next })
    },
    [runAction],
  )


  const deleteResource = useCallback(
    async (row: ResourceRow) => {
      markBusy(row.id, true)
      setItems((prev) => prev.filter((r) => r.id !== row.id))
      setTotal((t) => Math.max(0, t - 1))
      try {
        await deleteResourceRequest(row.id)
        void loadFacets()
        void load({ quiet: true })
      } catch {
        void load({ quiet: true })
      } finally {
        markBusy(row.id, false)
      }
    },
    [markBusy, load, loadFacets],
  )


  const saveResource = useCallback(
    async (row: ResourceRow, patch: Partial<ResourceRow>) => {
      const before = { ...row }
      markBusy(row.id, true)
      applyPatch(row.id, patch)
      try {
        const result = await postResourceAction(row.id, 'edit', patch as Record<string, unknown>)
        if (result.item) applyPatch(row.id, result.item)
        void loadFacets()
      } catch {
        applyPatch(row.id, before)
        void load({ quiet: true })
      } finally {
        markBusy(row.id, false)
      }
    },
    [applyPatch, markBusy, load, loadFacets],
  )


  const columns: AdminColumn<ResourceRow>[] = [
    {
      key: 'title',
      header: 'Ресурс',
      align: 'start',
      sortable: true,
      sortDirection: sortDirFor('title'),
      onSort: handleSort,

      cellClassName: ap('tableCellResourceTitle'),
      cell: (r) => r.title,
    },
    {
      key: 'price',
      header: 'Цена',
      align: 'center',
      sortable: true,
      sortDirection: sortDirFor('price'),
      onSort: handleSort,
      cell: (r) => formatPrice(r.price),
    },
    {
      key: 'author',
      header: 'Автор',
      align: 'start',
      cell: (r) => (


        <span style={AUTHOR_CELL_STYLE}>
          <span style={{ color: roleColor(r.authorRole), fontWeight: 500 }}>{r.author}</span>
          <AdminRoleBadge role={r.authorRole} />
        </span>
      ),
    },
    {
      key: 'sales',
      header: 'Продажи',
      align: 'center',
      sortable: true,
      sortDirection: sortDirFor('sales'),
      onSort: handleSort,
      cell: (r) => <span className={ap('tableCellUserMetric')}>{r.sales}</span>,
    },
    {
      key: 'createdAt',
      header: 'Создан',
      align: 'end',
      sortable: true,
      sortDirection: sortDirFor('createdAt'),
      onSort: handleSort,
      cell: (r) => <span className={ap('tableCellDateSingle')}>{formatDmyHm(r.createdAt)}</span>,
    },
    {
      key: 'updatedAt',
      header: 'Изменён',
      align: 'end',
      sortable: true,
      sortDirection: sortDirFor('updatedAt'),
      onSort: handleSort,
      cell: (r) => (
        <span className={cx(ap('tableCellDateSingle'), !r.updatedAt && ap('tableCellMuted'))}>
          {formatDmyHm(r.updatedAt)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Статус',
      align: 'center',
      cell: (r) => {
        const { tone, label } = statusMeta(r.status)
        if (!r.featured) return <AdminBadge tone={tone}>{label}</AdminBadge>

        return (
          <AdminBadgeStack>
            <AdminBadge tone={tone}>{label}</AdminBadge>
            <AdminBadge tone="info">В подборке</AdminBadge>
          </AdminBadgeStack>
        )
      },
    },
    {
      key: 'actions',

      header: '',
      align: 'actions',
      cell: (r) => (
        <RowActions
          row={r}
          busy={busyIds.has(r.id)}
          onEdit={setEditing}
          onApprove={approveResource}
          onReject={rejectResource}
          onFeature={toggleFeatured}
          onHide={hideResource}
          onDelete={deleteResource}
        />
      ),
    },
  ]

  return (
    <section className={ap('section')} id="admin-resources">
      <AdminSectionHeader title="Ресурсы">
        <AdminSearchInput
          value={searchInput}
          onChange={setSearchInput}
          onClear={() => setSearchInput('')}
          placeholder="Поиск"
          ariaLabel="Поиск ресурсов"
          pending={pending}
        />
      </AdminSectionHeader>


      <AdminFilterBar>
        <select
          className={ap('formInput')}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Фильтр по статусу"
        >
          <option value="">Все статусы</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {statusMeta(s).label}
            </option>
          ))}
        </select>

        <select
          className={ap('formInput')}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          aria-label="Фильтр по роли автора"
        >
          <option value="">Все роли</option>
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {roleLabel(role, 'ru')}
            </option>
          ))}
        </select>
      </AdminFilterBar>

      {error ? (
        <div className={ap('emptyState')}>
          <svg
            className={ap('emptyStateIcon')}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16h.01" />
          </svg>
          <p className={ap('emptyStateText')}>{error}</p>
        </div>
      ) : (
        <>
          <AdminTable<ResourceRow>
            variant="Resources"
            columns={columns}
            rows={sorted}
            rowKey={(r) => r.id}
            loading={loading}
            ariaLabel="Таблица ресурсов"
            emptyText="Ничего не найдено"
            onRowClick={(r) => setEditing(r)}
          />

          {!loading && total > 0 ? (
            <AdminPagination
              page={Math.min(page, pageCount)}
              pageCount={pageCount}
              onPageChange={setPage}
              total={total}
              pageSize={PAGE_SIZE}
            />
          ) : null}
        </>
      )}

      {editing ? (
        <ResourceEditDrawer
          resource={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            void saveResource(editing, patch)
            setEditing(null)
          }}
          onApprove={() => {
            void approveResource(editing)
            setEditing(null)
          }}
          onReject={() => {
            void rejectResource(editing)
            setEditing(null)
          }}
          onDelete={() => {
            void deleteResource(editing)
            setEditing(null)
          }}
        />
      ) : null}
    </section>
  )
}


const AUTHOR_CELL_STYLE: CSSProperties = {
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '0.22rem',
  minWidth: 0,
}


function StarActionIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={ap('tableIconButtonIcon')}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12,2.5l2.9,6.06,6.6.86-4.85,4.55,1.24,6.53-5.89-3.2-5.89,3.2,1.24-6.53L2.5,9.42l6.6-.86,2.9-6.06Z" />
    </svg>
  )
}


function RowActions({
  row,
  busy,
  onEdit,
  onApprove,
  onReject,
  onFeature,
  onHide,
  onDelete,
}: {
  row: ResourceRow
  busy: boolean
  onEdit: (r: ResourceRow) => void
  onApprove: (r: ResourceRow) => void
  onReject: (r: ResourceRow) => void
  onFeature: (r: ResourceRow) => void
  onHide: (r: ResourceRow) => void
  onDelete: (r: ResourceRow) => void
}) {
  const isApproved = row.status.toUpperCase() === 'APPROVED'
  const pendingModeration = isModeration(row.status)
  return (
    <div
      className={ap('resourceRowActionToolbar')}

      onClick={(e) => e.stopPropagation()}
    >
      <AdminIconButton label="Редактировать" tone="default" onClick={() => onEdit(row)}>
        <EditActionIcon />
      </AdminIconButton>

      <AdminIconButton
        label={row.featured ? 'Убрать из подборки' : 'В подборку'}
        tone={row.featured ? 'accent' : 'neutral'}
        disabled={busy}
        onClick={() => onFeature(row)}
      >
        <StarActionIcon filled={Boolean(row.featured)} />
      </AdminIconButton>

      {!isApproved ? (
        <AdminIconButton
          label="Одобрить"
          tone="success"
          iconPath={ADMIN_ICONS.check}
          disabled={busy}
          onClick={() => onApprove(row)}
        />
      ) : (
        <AdminIconButton label="Скрыть" tone="warning" disabled={busy} onClick={() => onHide(row)}>
          <HideActionIcon />
        </AdminIconButton>
      )}

      {pendingModeration ? (
        <AdminIconButton
          label="Отклонить"
          tone="danger"
          iconPath={ADMIN_ICONS.close}
          disabled={busy}
          onClick={() => onReject(row)}
        />
      ) : null}

      <AdminIconButton label="Удалить" tone="danger" disabled={busy} onClick={() => onDelete(row)}>
        <DeleteActionIcon />
      </AdminIconButton>
    </div>
  )
}


function ResourceEditDrawer({
  resource,
  onClose,
  onSave,
  onApprove,
  onReject,
  onDelete,
}: {
  resource: ResourceRow
  onClose: () => void
  onSave: (patch: Partial<ResourceRow>) => void
  onApprove: () => void
  onReject: () => void
  onDelete: () => void
}) {
  const [title, setTitle] = useState(resource.title)
  const [price, setPrice] = useState(String(resource.price))
  const [status, setStatus] = useState(resource.status)
  const [featured, setFeatured] = useState(Boolean(resource.featured))


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const priceNum = Number(price)
  const priceValid = Number.isFinite(priceNum) && priceNum >= 0
  const titleValid = title.trim().length > 0

  const submit = () => {
    if (!titleValid || !priceValid) return
    onSave({ title: title.trim(), price: Math.round(priceNum), status, featured })
  }


  const STATUS_CHOICES = ['APPROVED', 'PENDING', 'REJECTED', 'HIDDEN', 'DRAFT', 'ARCHIVED']
  const statusChoices = STATUS_CHOICES.includes(resource.status)
    ? STATUS_CHOICES
    : [resource.status, ...STATUS_CHOICES]

  const pendingModeration = isModeration(resource.status)

  return (
    <>
      <div className={ap('editBackdrop')} onClick={onClose} aria-hidden="true" />
      <aside
        className={ap('editDrawer', 'editDrawerSlideIn')}
        role="dialog"
        aria-modal="true"
        aria-label="Редактировать ресурс"
      >
        <div className={ap('editDrawerHeader')}>
          <div className={ap('editDrawerHeaderLeft')}>
            <span className={ap('editDrawerTitle')}>Редактировать ресурс</span>
            <span className={ap('editDrawerTitleIdBadge')}>{resource.id}</span>
          </div>
          <button
            type="button"
            className={ap('editDrawerClose')}
            onClick={onClose}
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

        <div className={ap('editDrawerBody')}>
          <div className={ap('editDrawerInnerColumn')}>
            <div className={ap('formGroup')}>
              <label className={ap('formLabel')} htmlFor="res-edit-title">
                Название
              </label>
              <input
                id="res-edit-title"
                className={ap('formInput')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {!titleValid ? <span className={ap('formError')}>Укажите название</span> : null}
            </div>

            <div className={ap('formGroup')}>
              <label className={ap('formLabel')} htmlFor="res-edit-price">
                Цена, ₽
              </label>
              <input
                id="res-edit-price"
                type="number"
                min={0}
                className={ap('formInput')}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              {!priceValid ? <span className={ap('formError')}>Некорректная цена</span> : null}
            </div>

            <div className={ap('formGroup')}>
              <label className={ap('formLabel')} htmlFor="res-edit-status">
                Статус
              </label>
              <select
                id="res-edit-status"
                className={ap('formInput')}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {statusChoices.map((s) => (
                  <option key={s} value={s}>
                    {statusMeta(s).label}
                  </option>
                ))}
              </select>
            </div>

            <div className={ap('formGroup')}>
              <label className={ap('formLabel')} htmlFor="res-edit-featured">
                В подборке
              </label>

              <select
                id="res-edit-featured"
                className={ap('formInput')}
                value={featured ? 'yes' : 'no'}
                onChange={(e) => setFeatured(e.target.value === 'yes')}
              >
                <option value="no">Обычный</option>
                <option value="yes">В подборке</option>
              </select>
            </div>

            <div className={ap('editDrawerDivider')} />

            <div className={ap('formGroup')}>
              <label className={ap('formLabel')}>Автор</label>

              <div className={ap('formInput')} aria-readonly="true">
                {resource.author} · {roleLabel(resource.authorRole, 'ru')}
              </div>
              <span className={ap('formHint')}>
                Продаж: {resource.sales} · создан {formatDmyHm(resource.createdAt)}
              </span>
            </div>


            {pendingModeration ? (
              <>
                <div className={ap('editDrawerDivider')} />
                <div className={ap('formGroup')}>
                  <label className={ap('formLabel')}>Модерация</label>
                  <div className={ap('formActionsRow')}>
                    <button type="button" className={ap('approveButton')} onClick={onApprove}>
                      Одобрить
                    </button>
                    <button type="button" className={ap('rejectButton')} onClick={onReject}>
                      Отклонить
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className={ap('formActions')}>
          <div className={ap('formActionsRow')}>
            <button type="button" className={ap('formBtnDanger')} onClick={onDelete}>
              Удалить
            </button>
            <button type="button" className={ap('formBtnSecondary')} onClick={onClose}>
              Отмена
            </button>
            <button
              type="button"
              className={ap('formBtnPrimary')}
              onClick={submit}
              disabled={!titleValid || !priceValid}
            >
              Сохранить
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
