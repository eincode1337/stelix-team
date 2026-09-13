'use client'


import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ap,
  AdminTable,
  AdminRoleBadge,
  AdminIconButton,
  AdminPagination,
  AdminSectionHeader,
  AdminSearchInput,
  AdminFilterBar,
  ROLE_DISPLAY_ORDER,
  roleLabel,
  isModeratorOrAbove,
  type AdminColumn,
  type SortDirection,
  type RoleKey,
} from '@/components/admin/ui'
import { EditActionIcon, DeleteActionIcon } from './AdminActionIcons'


interface BlacklistRow {
  id: number
  identity: string
  role: string
  site: string
  social: string
  createdAt: string
  updatedAt: string
}

interface BlacklistResponse {
  items: BlacklistRow[]
  total: number
  page: number
  pageSize: number
}

export interface BlacklistSectionProps {

  viewerRole?: RoleKey | string

  pageSize?: number
}

const PAGE_SIZE_DEFAULT = 20


type SortKey = 'id' | 'identity' | 'site' | 'role' | 'createdAt' | 'updatedAt'


function formatDmy(iso: string | null | undefined): string {
  if (!iso) return '—'
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return '—'
  const d = new Date(t)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}.${d.getFullYear()}`
}

function isBlank(v: string | null | undefined): boolean {
  return !v || v === '—' || v.trim() === ''
}


type SocialPlatform = 'telegram' | 'discord' | 'link'
interface SocialItem {
  platform: SocialPlatform
  label: string
  url?: string
}

function parseSocials(raw: string): SocialItem[] {
  if (isBlank(raw)) return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((token): SocialItem => {
      if (/^https?:\/\//i.test(token)) return { platform: 'link', label: token, url: token }
      const discord = token.match(/^discord\s*:?\s*(.+)$/i)
      if (discord) return { platform: 'discord', label: token }
      if (token.startsWith('@')) {
        const handle = token.slice(1)
        return { platform: 'telegram', label: token, url: `https://t.me/${handle}` }
      }
      return { platform: 'link', label: token }
    })
}


const SOCIAL_ICON: Record<SocialPlatform, string> = {
  telegram: 'M21.5 4.5 2.5 12l5.5 1.8L18 6.5l-7 8.2v3.8l3-3 3.5 2.6 4-13.6Z',
  discord: 'M7.5 7.5A13 13 0 0 1 12 6.8a13 13 0 0 1 4.5.7l1.8 9.5-2.4 2-.9-1.4a9 9 0 0 1-6 0L8.1 19l-2.4-2 1.8-9.5ZM9.6 13.2h0M14.4 13.2h0',
  link: 'M10 14a4 4 0 0 0 5.7 0l2.3-2.3a4 4 0 1 0-5.7-5.7L11 7.6M14 10a4 4 0 0 0-5.7 0L6 12.3a4 4 0 1 0 5.7 5.7L13 16.4',
}

function SocialCell({ social }: { social: string }) {
  const items = parseSocials(social)
  if (items.length === 0) return <span className={ap('tableCellMuted')}>—</span>
  return (
    <div className={ap('blacklistSocialRow')}>
      {items.map((item, i) => {
        const glyph = (
          <svg
            className={ap('blacklistSocialIcon')}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d={SOCIAL_ICON[item.platform]} />
          </svg>
        )
        return item.url ? (
          <a
            key={i}
            className={ap('blacklistSocialItem')}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            title={item.label}
            aria-label={item.label}
          >
            {glyph}
          </a>
        ) : (
          <span key={i} className={ap('blacklistSocialItem')} title={item.label} aria-label={item.label}>
            {glyph}
          </span>
        )
      })}
    </div>
  )
}


const ROLE_LEVEL = new Map(ROLE_DISPLAY_ORDER.map((r, i) => [r, ROLE_DISPLAY_ORDER.length - i]))

function compareRows(a: BlacklistRow, b: BlacklistRow, key: SortKey): number {
  switch (key) {
    case 'id':
      return a.id - b.id
    case 'role':
      return (ROLE_LEVEL.get(a.role as RoleKey) ?? 0) - (ROLE_LEVEL.get(b.role as RoleKey) ?? 0)
    case 'createdAt':
    case 'updatedAt':
      return (Date.parse(a[key]) || 0) - (Date.parse(b[key]) || 0)
    default:
      return String(a[key] ?? '').localeCompare(String(b[key] ?? ''), 'ru')
  }
}

export function BlacklistSection({ viewerRole = 'AGENT', pageSize = PAGE_SIZE_DEFAULT }: BlacklistSectionProps) {
  const canEdit = isModeratorOrAbove(viewerRole)
  const canDelete = viewerRole === 'AGENT'

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('id')
  const [sortDir, setSortDir] = useState<Exclude<SortDirection, null>>('desc')

  const [data, setData] = useState<BlacklistResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [busy, setBusy] = useState(false)


  const [editing, setEditing] = useState<BlacklistRow | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<BlacklistRow | null>(null)
  const [form, setForm] = useState<{ identity: string; site: string; social: string; role: string }>({
    identity: '',
    site: '',
    social: '',
    role: 'NEWBIE',
  })


  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQ(search.trim()), 300)
    return () => window.clearTimeout(id)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedQ, roleFilter])


  const buildQuery = useCallback(() => {
    const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
    if (debouncedQ) qs.set('q', debouncedQ)
    if (roleFilter) qs.set('role', roleFilter)
    return qs
  }, [page, pageSize, debouncedQ, roleFilter])


  const load = useCallback(
    async (signal?: AbortSignal, opts?: { silent?: boolean }) => {
      if (!opts?.silent) setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/admin/blacklist?${buildQuery().toString()}`, {
          signal,
          credentials: 'same-origin',
          headers: { accept: 'application/json' },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as BlacklistResponse
        setData(json)
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError('Не удалось загрузить чёрный список')
        setData({ items: [], total: 0, page, pageSize })
      } finally {
        if (!signal?.aborted && !opts?.silent) setLoading(false)
      }
    },
    [buildQuery, page, pageSize],
  )


  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [load])


  const rows = useMemo(() => {
    const items = data?.items ?? []
    const sorted = [...items].sort((a, b) => compareRows(a, b, sortKey))
    if (sortDir === 'desc') sorted.reverse()
    return sorted
  }, [data, sortKey, sortDir])

  const onSort = useCallback((key: string) => {
    const k = key as SortKey
    setSortKey((prevKey) => {
      if (prevKey === k) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
        return prevKey
      }
      setSortDir('asc')
      return k
    })
  }, [])

  const dirFor = (key: SortKey): SortDirection => (sortKey === key ? sortDir : null)

  const openEdit = useCallback((row: BlacklistRow) => {
    setForm({
      identity: row.identity,
      site: isBlank(row.site) ? '' : row.site,
      social: isBlank(row.social) ? '' : row.social,
      role: row.role,
    })
    setCreating(false)
    setEditing(row)
  }, [])


  const openCreate = useCallback(() => {
    setForm({ identity: '', site: '', social: '', role: 'NEWBIE' })
    setEditing(null)
    setCreating(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setEditing(null)
    setCreating(false)
  }, [])


  const saveEdit = useCallback(async () => {
    if (!editing || busy) return
    const id = editing.id
    const patch = {
      identity: form.identity,
      site: form.site.trim() || '—',
      social: form.social.trim() || '—',
      role: form.role,
    }
    setBusy(true)
    setData((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((it) =>
              it.id === id ? { ...it, ...patch, updatedAt: new Date().toISOString() } : it,
            ),
          }
        : prev,
    )
    setEditing(null)
    try {
      const res = await fetch(`/api/admin/blacklist/${id}`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ action: 'edit', ...patch }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = (await res.json()) as { ok: boolean; item?: Partial<BlacklistRow> }
      if (!json.ok || !json.item) throw new Error('mutation_failed')
      const item = json.item

      setData((prev) =>
        prev ? { ...prev, items: prev.items.map((it) => (it.id === id ? { ...it, ...item } : it)) } : prev,
      )
    } catch {
      setError('Не удалось сохранить изменения')
      void load(undefined, { silent: true })
    } finally {
      setBusy(false)
    }
  }, [editing, form, busy, load])


  const saveCreate = useCallback(async () => {
    if (busy) return
    const identity = form.identity.trim()
    if (!identity) return
    const payload = {
      identity,
      site: form.site.trim() || '—',
      social: form.social.trim() || '—',
      role: form.role,
    }
    setBusy(true)

    const tempId = -Date.now()
    const now = new Date().toISOString()
    const optimistic: BlacklistRow = { id: tempId, ...payload, createdAt: now, updatedAt: now }
    setData((prev) =>
      prev ? { ...prev, items: [optimistic, ...prev.items], total: prev.total + 1 } : prev,
    )
    setCreating(false)
    try {
      const res = await fetch('/api/admin/blacklist', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ action: 'add', ...payload }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = (await res.json()) as { ok: boolean; item?: BlacklistRow }
      if (!json.ok || !json.item) throw new Error('mutation_failed')
      const item = json.item

      setData((prev) =>
        prev ? { ...prev, items: prev.items.map((it) => (it.id === tempId ? item : it)) } : prev,
      )
      void load(undefined, { silent: true })
    } catch {
      setError('Не удалось добавить запись')
      void load(undefined, { silent: true })
    } finally {
      setBusy(false)
    }
  }, [form, busy, load])


  const confirmDelete = useCallback(async () => {
    if (!deleting || busy) return
    const id = deleting.id
    setBusy(true)
    setData((prev) =>
      prev ? { ...prev, items: prev.items.filter((it) => it.id !== id), total: Math.max(0, prev.total - 1) } : prev,
    )
    setDeleting(null)
    setEditing((e) => (e && e.id === id ? null : e))
    try {
      const res = await fetch(`/api/admin/blacklist/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: { accept: 'application/json' },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = (await res.json()) as { ok: boolean }
      if (!json.ok) throw new Error('delete_failed')
      void load(undefined, { silent: true })
    } catch {
      setError('Не удалось удалить запись')
      void load(undefined, { silent: true })
    } finally {
      setBusy(false)
    }
  }, [deleting, busy, load])

  const total = data?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / pageSize))


  const columns: AdminColumn<BlacklistRow>[] = [
    {
      key: 'id',
      header: 'ID',
      align: 'center',
      sortable: true,
      sortDirection: dirFor('id'),
      onSort,
      cell: (row) => <span className={ap('tableCellMuted')}>{row.id}</span>,
    },
    {
      key: 'identity',
      header: 'Пользователь',
      align: 'start',
      sortable: true,
      sortDirection: dirFor('identity'),
      onSort,
      cellClassName: ap('tableCellUserIdentity'),
      cell: (row) => <span className={ap('tableCellUserName')}>{row.identity}</span>,
    },
    {
      key: 'site',
      header: 'Сайт',
      align: 'start',
      sortable: true,
      sortDirection: dirFor('site'),
      onSort,
      cell: (row) =>
        isBlank(row.site) ? (
          <span className={ap('tableCellMuted')}>—</span>
        ) : (
          <span className={ap('tableCellBlacklistSite')} title={row.site}>
            {row.site}
          </span>
        ),
    },
    {
      key: 'social',
      header: 'Соцсети',
      align: 'start',
      cellClassName: ap('tableCellBlacklistSocial'),
      cell: (row) => <SocialCell social={row.social} />,
    },
    {
      key: 'role',
      header: 'Роль',
      align: 'center',
      sortable: true,
      sortDirection: dirFor('role'),
      onSort,
      cell: (row) => <AdminRoleBadge role={row.role} />,
    },
    {
      key: 'createdAt',
      header: 'Создан',
      align: 'end',
      sortable: true,
      sortDirection: dirFor('createdAt'),
      onSort,
      cell: (row) => <span className={ap('tableCellDateSingle')}>{formatDmy(row.createdAt)}</span>,
    },
    {
      key: 'updatedAt',
      header: 'Изменён',
      align: 'end',
      sortable: true,
      sortDirection: dirFor('updatedAt'),
      onSort,
      cell: (row) => <span className={ap('tableCellDateSingle')}>{formatDmy(row.updatedAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Действия',
      align: 'actions',
      cell: (row) => (
        <>
          {canEdit ? (
            <AdminIconButton label="Редактировать" onClick={() => openEdit(row)}>
              <EditActionIcon />
            </AdminIconButton>
          ) : null}
          {canDelete ? (
            <AdminIconButton
              label="Удалить из ЧС"
              tone="danger"
              onClick={() => setDeleting(row)}
            >
              <DeleteActionIcon />
            </AdminIconButton>
          ) : null}
        </>
      ),
    },
  ]

  return (
    <section className={ap('section')} id="admin-blacklist">
      <AdminSectionHeader title="Чёрный список">
        <AdminSearchInput value={search} onChange={setSearch} onClear={() => setSearch('')} placeholder="Поиск" />
        {canEdit ? (
          <button type="button" className={ap('formBtnPrimary')} onClick={openCreate} disabled={busy}>
            Добавить в ЧС
          </button>
        ) : null}
      </AdminSectionHeader>


      <AdminFilterBar>
        <select
          className={ap('formInput')}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          aria-label="Фильтр по роли"
          style={{ width: 'auto', minWidth: '12rem' }}
        >
          <option value="">Все роли</option>
          {ROLE_DISPLAY_ORDER.map((r) => (
            <option key={r} value={r}>
              {roleLabel(r)}
            </option>
          ))}
        </select>
      </AdminFilterBar>

      <AdminTable<BlacklistRow>
        variant="Blacklist"
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        loading={loading}
        ariaLabel="Чёрный список"
        emptyText={error ?? 'Записи не найдены'}
      />

      <AdminPagination
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        total={total}
        pageSize={pageSize}
      />


      {editing || creating ? (
        <>
          <div className={ap('editBackdrop')} onClick={closeDrawer} aria-hidden="true" />
          <aside
            className={ap('editDrawer', 'editDrawerSlideIn')}
            role="dialog"
            aria-modal="true"
            aria-label={creating ? 'Новая запись ЧС' : 'Запись ЧС'}
          >
            <div className={ap('editDrawerBody')}>
              <div className={ap('editDrawerInnerColumn')}>
                <div className={ap('editDrawerHeader')}>
                  <div className={ap('editDrawerHeaderLeft')} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {editing ? (
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
                        #{editing.id}
                      </span>
                    ) : null}
                    <h3 className={ap('editDrawerTitle')}>{creating ? 'Новая запись ЧС' : 'Запись ЧС'}</h3>
                  </div>

                  <hr className={ap('editDrawerDivider')} />
                  <button
                    type="button"
                    className={ap('editDrawerClose')}
                    onClick={closeDrawer}
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
                    <label className={ap('settingsFieldLabel')} htmlFor="bl-identity">
                      Пользователь
                    </label>
                    <div className={ap('settingsFieldControl')}>
                      <input
                        id="bl-identity"
                        className={ap('formInput')}
                        value={form.identity}
                        onChange={(e) => setForm((f) => ({ ...f, identity: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className={ap('settingsFieldRow')}>
                    <label className={ap('settingsFieldLabel')} htmlFor="bl-site">
                      Сайт
                    </label>
                    <div className={ap('settingsFieldControl')}>
                      <input
                        id="bl-site"
                        className={ap('formInput')}
                        value={form.site}
                        onChange={(e) => setForm((f) => ({ ...f, site: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className={ap('settingsFieldRow')}>
                    <label className={ap('settingsFieldLabel')} htmlFor="bl-social">
                      Соцсети
                    </label>
                    <div className={ap('settingsFieldControl')}>
                      <input
                        id="bl-social"
                        className={ap('formInput')}
                        value={form.social}
                        onChange={(e) => setForm((f) => ({ ...f, social: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className={ap('settingsFieldRow')}>
                    <label className={ap('settingsFieldLabel')} htmlFor="bl-role">
                      Роль
                    </label>
                    <div className={ap('settingsFieldControl')}>
                      <select
                        id="bl-role"
                        className={ap('formInput')}
                        value={form.role}
                        onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                        disabled={!canEdit}
                      >
                        {ROLE_DISPLAY_ORDER.map((r) => (
                          <option key={r} value={r}>
                            {roleLabel(r)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>


                <div className={ap('formActions')}>
                  {creating ? (
                    <>
                      <button
                        type="button"
                        className={ap('formBtnPrimary')}
                        onClick={() => void saveCreate()}
                        disabled={!canEdit || busy || !form.identity.trim()}
                      >
                        {busy ? 'Добавление…' : 'Добавить'}
                      </button>
                      <button type="button" className={ap('formBtnSecondary')} onClick={closeDrawer} disabled={busy}>
                        Отмена
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={ap('formBtnPrimary')}
                        onClick={() => void saveEdit()}
                        disabled={!canEdit || busy}
                      >
                        Сохранить
                      </button>
                      {canDelete && editing ? (
                        <button type="button" className={ap('formBtnDanger')} onClick={() => setDeleting(editing)}>
                          Удалить
                        </button>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </>
      ) : null}


      {deleting ? (
        <div
          className={ap('editBackdrop')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={() => setDeleting(null)}
          role="presentation"
        >
          <div
            className={ap('adminReviewDeleteModal')}
            style={{ borderRadius: 'var(--radius)' }}
            role="dialog"
            aria-modal="true"
            aria-label="Удаление записи"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={ap('adminReviewDeleteInner')}>
              <p className={ap('adminReviewDeleteText')}>
                Удалить запись из чёрного списка?
              </p>
              <div className={ap('adminReviewDeleteActions')}>
                <button
                  type="button"
                  className={ap('formBtnSecondary')}
                  onClick={() => setDeleting(null)}
                  disabled={busy}
                >
                  Отмена
                </button>
                <button
                  type="button"
                  className={ap('formBtnDanger')}
                  onClick={() => void confirmDelete()}
                  disabled={busy}
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default BlacklistSection
