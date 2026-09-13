'use client'


import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  ap,
  cx,
  AdminSectionHeader,
  AdminFilterBar,
  AdminSearchInput,
  AdminPagination,
  AdminRoleBadge,
  AdminBadge,
  AdminBadgeStack,
  roleLabel,
  roleColor,
  ROLE_DISPLAY_ORDER,
  type RoleKey,
} from '@/components/admin/ui'

import {
  getRoleOverview,
  ACCESS_MATRIX,
  accessCanManageRoles,
  accessCanManageOAuthBindings,
  accessCanManageTargetUser,
  normalizeTargetUser,
  OAUTH_PROVIDERS,
  type TargetUser,
} from './accessAcl'


const DEFAULT_VIEWER_ROLE: RoleKey = 'AGENT'
const PAGE_SIZE = 8

type ActionKind = 'impersonate' | 'service'
type ActionState = 'idle' | 'loading' | 'ok' | 'error'


function RolesOverview() {
  const roles = useMemo(() => getRoleOverview('ru'), [])
  return (
    <div className={ap('rolesGrid')}>
      {roles.map((r) => (
        <div key={r.key} className={ap('roleCard')}>
          <div className={ap('roleLevel')}>{r.level}</div>
          <div className={ap('roleInfo')}>

            <div
              className={ap('roleName')}
              style={{
                color: r.color,
                backgroundImage: r.gradient,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {r.name}
            </div>
            <div className={ap('roleKey')}>
              <span className={ap('roleKeyLabel')}>Код</span>
              {r.key}
            </div>
            <div className={ap('roleDescription')}>{r.description}</div>
          </div>
        </div>
      ))}
    </div>
  )
}


function AccessMatrix() {
  return (
    <div className={ap('settingsGroup')}>
      <h3 className={ap('settingsTitle')}>Права доступа</h3>
      <p className={ap('formHint')}>Минимальная роль для каждого действия</p>
      <div className={ap('accessTable')}>
        {ACCESS_MATRIX.map((row) => (
          <div key={row.predicate} className={ap('accessRow')}>
            <span className={ap('accessLabel')}>{row.label}</span>
            <span className={ap('accessRole')}>
              {row.note ? (
                <AdminBadgeStack>
                  <AdminRoleBadge role={row.minRole} />

                  <span className={ap('roleDescription')} style={{ textAlign: 'center' }}>
                    {row.note}
                  </span>
                </AdminBadgeStack>
              ) : (
                <AdminRoleBadge role={row.minRole} />
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}


function EditUserDrawer({
  user,
  viewerRole,
  onClose,
  onMutated,
}: {
  user: TargetUser
  viewerRole: RoleKey
  onClose: () => void

  onMutated: () => void
}) {
  const [role, setRole] = useState<RoleKey | string>(user.role)

  const [baselineRole, setBaselineRole] = useState<RoleKey | string>(user.role)
  const [roleState, setRoleState] = useState<ActionState>('idle')
  const [impersonateState, setImpersonateState] = useState<ActionState>('idle')
  const [serviceState, setServiceState] = useState<ActionState>('idle')

  useEffect(() => {
    setRole(user.role)
    setBaselineRole(user.role)
    setRoleState('idle')
  }, [user])


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const canManageRoles = accessCanManageRoles(viewerRole)
  const canManageBindings = accessCanManageOAuthBindings(viewerRole)
  const canManageTarget = accessCanManageTargetUser(viewerRole, user.role)


  const roleOptions = useMemo(
    () => ROLE_DISPLAY_ORDER.map((value) => ({ value, label: roleLabel(value, 'ru'), color: roleColor(value) })),
    [],
  )

  const runAction = useCallback(
    async (kind: ActionKind) => {
      const set = kind === 'impersonate' ? setImpersonateState : setServiceState
      const endpoint = kind === 'impersonate' ? '/api/admin/impersonate' : '/api/admin/service-account'
      set('loading')
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ userId: user.id }),
        })
        if (!res.ok) {
          set('error')
          return
        }
        set('ok')


        try {
          if (kind === 'impersonate') window.location.assign('/')
          else window.location.reload()
        } catch {

        }
      } catch {
        set('error')
      }
    },
    [user.id],
  )


  const roleChanged = role !== baselineRole
  const saveRole = useCallback(async () => {
    if (!roleChanged) return
    setRoleState('loading')
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'role-change', role }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setBaselineRole(role)
      setRoleState('ok')
      onMutated()
    } catch {
      setRoleState('error')
    }
  }, [roleChanged, user.id, role, onMutated])

  return (
    <>
      <div className={ap('editBackdrop')} onClick={onClose} aria-hidden="true" />
      <aside
        className={ap('editDrawer', 'editDrawerSlideIn')}
        role="dialog"
        aria-modal="true"
        aria-label={`Доступы — ${user.name}`}
      >
        <div className={ap('editDrawerInnerColumn')}>
          <div className={ap('editDrawerHeader')}>
            <div className={ap('editDrawerHeaderLeft')}>
              <h2 className={ap('editDrawerTitle')}>{user.name}</h2>
            </div>
            <span className={ap('editDrawerTitleIdBadge', 'badge', 'badgeMuted')}>#{user.id}</span>
            <hr className={ap('editDrawerDivider')} />
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

              <div className={ap('settingsFieldRow')}>
                <label className={ap('settingsFieldLabel')} htmlFor="access-role-select">
                  Роль
                </label>
                <div className={ap('settingsFieldControl')}>
                  <select
                    id="access-role-select"
                    className={ap('formInput')}
                    value={role}
                    disabled={!canManageRoles || !canManageTarget}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    {roleOptions.map((o) => (
                      <option key={o.value} value={o.value} style={{ color: o.color }}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  {canManageRoles && canManageTarget ? (
                    <button
                      type="button"
                      className={ap('formBtnPrimary')}
                      disabled={!roleChanged || roleState === 'loading'}
                      onClick={saveRole}
                    >
                      {roleState === 'loading' ? 'Сохранение…' : 'Сохранить роль'}
                    </button>
                  ) : null}
                  {!canManageRoles ? (
                    <span className={ap('formHint')}>Недостаточно прав для смены роли</span>
                  ) : null}
                </div>
              </div>


              <div className={ap('discordSyncSection')}>
                <div className={ap('discordSyncHeaderRow')}>
                  <h3 className={ap('settingsTitle')}>Служебные аккаунты</h3>
                </div>
                <div className={ap('discordSyncBody')}>
                  <div className={ap('discordSyncStatusList')}>
                    {OAUTH_PROVIDERS.map(({ key, label }) => {
                      const b = user.bindings[key]
                      return (
                        <div key={key} className={ap('accessRow')}>
                          <span className={ap('accessLabel')}>{label}</span>
                          <span className={ap('accessRole')}>
                            {b.id ? (
                              <AdminBadge tone="success">{b.displayName ?? 'привязан'}</AdminBadge>
                            ) : (
                              <AdminBadge tone="muted">не привязан</AdminBadge>
                            )}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  {!canManageBindings ? (
                    <span className={ap('discordSyncHint', 'formHint')}>
                      Управление привязками доступно с уровня «Разработчик»
                    </span>
                  ) : null}
                </div>
              </div>


              <div className={ap('editUserAccountActions')}>
                <button
                  type="button"
                  className={ap('formBtnPrimary')}
                  disabled={!canManageTarget || impersonateState === 'loading'}
                  onClick={() => runAction('impersonate')}
                >
                  {impersonateState === 'loading' ? 'Вход…' : 'Войти как пользователь'}
                </button>
                <button
                  type="button"
                  className={ap('formBtnDanger')}
                  disabled={!canManageBindings || !canManageTarget || serviceState === 'loading'}
                  onClick={() => runAction('service')}
                >
                  {serviceState === 'loading' ? '…' : 'Служебный аккаунт'}
                </button>
              </div>
              {impersonateState === 'error' || serviceState === 'error' || roleState === 'error' ? (
                <span className={ap('formHint')} style={{ color: 'var(--danger-fg)' }}>
                  Не удалось выполнить действие
                </span>
              ) : null}
              {impersonateState === 'ok' || serviceState === 'ok' || roleState === 'ok' ? (
                <span className={ap('formHint')} style={{ color: 'var(--success-fg)' }}>
                  Готово
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}


export function AccessControlSection() {
  const [viewerRole, setViewerRole] = useState<RoleKey>(DEFAULT_VIEWER_ROLE)
  const [users, setUsers] = useState<TargetUser[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [refreshKey, setRefreshKey] = useState(0)


  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [pending, setPending] = useState(false)
  const [roleFilter, setRoleFilter] = useState<RoleKey | 'ALL'>('ALL')
  const [page, setPage] = useState(1)

  const [selected, setSelected] = useState<TargetUser | null>(null)

  const [savingRoleId, setSavingRoleId] = useState<number | null>(null)


  const changeUserRole = useCallback(async (u: TargetUser, nextRole: string): Promise<void> => {
    if (nextRole === u.role) return
    const prev = u.role
    setSavingRoleId(u.id)
    setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, role: nextRole } : x)))
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'role-change', role: nextRole }),
      })
      if (!res.ok) throw new Error(String(res.status))
    } catch {
      setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, role: prev } : x)))
    } finally {
      setSavingRoleId(null)
    }
  }, [])


  useEffect(() => {
    const ctrl = new AbortController()
    setLoading(true)
    setError(false)
    const sp = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
    if (query) sp.set('q', query)
    if (roleFilter !== 'ALL') sp.set('role', roleFilter)

    fetch(`/api/admin/access?${sp.toString()}`, {
      credentials: 'include',
      signal: ctrl.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status))
        return (await res.json()) as unknown
      })
      .then((data) => {
        const obj = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>
        const list = Array.isArray(data)
          ? data
          : ((obj.items ?? obj.users ?? []) as unknown[])
        setUsers((list as Record<string, unknown>[]).map(normalizeTargetUser))
        setTotal(
          typeof obj.total === 'number'
            ? obj.total
            : Array.isArray(list)
              ? list.length
              : 0,
        )
        const viewer = obj.viewer as { role?: string } | undefined
        if (viewer?.role) setViewerRole(viewer.role as RoleKey)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setUsers([])
        setTotal(0)
        setError(true)
        setLoading(false)
      })

    return () => ctrl.abort()
  }, [page, query, roleFilter, refreshKey])


  useEffect(() => {
    setPending(true)
    const t = setTimeout(() => {
      setQuery(search.trim().toLowerCase())
      setPending(false)
      setPage(1)
    }, 250)
    return () => clearTimeout(t)
  }, [search])


  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [page, pageCount])
  const pageItems = users

  return (
    <section className={ap('section')} id="admin-access">
      <AdminSectionHeader title="Доступы" />


      <RolesOverview />


      <div style={{ height: '2rem' }} aria-hidden="true" />


      <AccessMatrix />


      <div className={ap('settingsGroup')}>
        <h3 className={ap('settingsTitle')}>Управление доступом</h3>
        <p className={ap('formHint')}>Выберите пользователя, чтобы сменить роль или войти под ним</p>

        <AdminFilterBar>
          <AdminSearchInput
            value={search}
            onChange={setSearch}
            onClear={() => setSearch('')}
            pending={pending}
            placeholder="Поиск пользователя"
          />
          <select
            className={ap('formInput')}
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as RoleKey | 'ALL')
              setPage(1)
            }}
            aria-label="Фильтр по роли"
          >
            <option value="ALL">Все роли</option>
            {ROLE_DISPLAY_ORDER.map((r) => (
              <option key={r} value={r}>
                {roleLabel(r, 'ru')}
              </option>
            ))}
          </select>
        </AdminFilterBar>

        {loading ? (
          <div className={ap('sectionSpinnerHost')}>
            <span className={ap('sectionSpinner')} aria-label="Загрузка" />
          </div>
        ) : error ? (
          <div className={ap('emptyState')}>
            <p className={ap('emptyStateText')}>Не удалось загрузить пользователей</p>
          </div>
        ) : pageItems.length === 0 ? (
          <div className={ap('emptyState')}>
            <p className={ap('emptyStateText')}>Ничего не найдено</p>
          </div>
        ) : (
          <>
            <div className={ap('accessTable')}>
              {pageItems.map((u) => (
                <div key={u.id} className={ap('accessRow')}>

                  <span
                    className={cx(ap('accessLabel'), ap('tableCellUserIdentity'))}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelected(u)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelected(u)
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className={ap('tableCellUserName')}>{u.name}</span>
                    {u.email ? <span className={ap('tableCellUserEmail')}>{u.email}</span> : null}
                  </span>

                  <span className={ap('accessRole')}>
                    <select
                      className={ap('formInput')}
                      value={u.role}
                      disabled={savingRoleId === u.id}
                      aria-label={`Роль — ${u.name}`}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => void changeUserRole(u, e.target.value)}
                    >
                      {ROLE_DISPLAY_ORDER.map((r) => (
                        <option key={r} value={r} style={{ color: roleColor(r) }}>
                          {roleLabel(r, 'ru')}
                        </option>
                      ))}
                    </select>
                  </span>
                </div>
              ))}
            </div>

            <AdminPagination
              page={page}
              pageCount={pageCount}
              onPageChange={setPage}
              total={total}
              pageSize={PAGE_SIZE}
            />
          </>
        )}
      </div>

      {selected ? (
        <EditUserDrawer
          user={selected}
          viewerRole={viewerRole}
          onClose={() => setSelected(null)}
          onMutated={() => setRefreshKey((k) => k + 1)}
        />
      ) : null}
    </section>
  )
}

export default AccessControlSection
