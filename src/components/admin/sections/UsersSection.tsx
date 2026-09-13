'use client'


import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'

import {
  ap,
  AdminTable,
  type AdminColumn,
  type SortDirection,
  AdminPagination,
  AdminRoleBadge,
  AdminBadge,
  type BadgeTone,
  AdminIconButton,
  AdminSectionHeader,
  AdminSearchInput,
  AdminFilterBar,
  roleColor,
  roleLabel,
  roleLevel,
  isStaffRole,
  STELIX_ROLES,
  ROLE_DISPLAY_ORDER,
  type RoleKey,
} from '@/components/admin/ui'
import {
  EditActionIcon,
  ImpersonateActionIcon,
  BlockActionIcon,
  DeleteActionIcon,
} from './AdminActionIcons'

import sellerStats from '@/server/fixtures/auth/seller-stats.json'


type UserStatus = 'ACTIVE' | 'BLOCKED' | 'FROZEN'

interface UserRow {
  id: number
  name: string
  email: string
  handle: string
  role: RoleKey | string
  status: UserStatus
  balance: number
  payable: number
  ordersCount: number
  purchasesCount: number
  createdAt: string
  updatedAt: string | null
  avatarUrl: string | null

  sellerEmail?: string
}

interface UsersResponse {
  items: UserRow[]
  total: number
  page: number
  pageSize: number
}


const PAGE_SIZE = 20
const SITE_LANG: 'ru' | 'uk' | 'en' = 'ru'


const VIEWER_ROLE: RoleKey = 'AGENT'

const rub = new Intl.NumberFormat('ru-RU')


const STATUS_META: Record<UserStatus, { label: string; tone: BadgeTone }> = {
  ACTIVE: { label: 'Активен', tone: 'success' },
  BLOCKED: { label: 'Заблокирован', tone: 'danger' },
  FROZEN: { label: 'Заморожен', tone: 'frozen' },
}


const STATUS_FILTERS: { value: '' | UserStatus; label: string }[] = [
  { value: '', label: 'Все' },
  { value: 'ACTIVE', label: 'Активные' },
  { value: 'BLOCKED', label: 'Заблокированные' },
  { value: 'FROZEN', label: 'Замороженные' },
]


const ROLE_BUCKETS: { key: '' | RoleKey; label: string }[] = [
  { key: '', label: 'Все' },
  ...ROLE_DISPLAY_ORDER.map((r) => ({ key: r, label: roleLabel(r, SITE_LANG) })),
]


type ActionState = 'idle' | 'loading' | 'ok' | 'error'


function formatSiteDateDmyCommaHm(iso: string | null | undefined, lang: 'ru' | 'uk' | 'en' = 'ru'): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const bcp47 = lang === 'uk' ? 'uk-UA' : lang === 'en' ? 'en-US' : 'ru-RU'
  const date = d.toLocaleDateString(bcp47, { day: '2-digit', month: '2-digit', year: 'numeric' })
  const time = d.toLocaleTimeString(bcp47, { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${date}, ${time}`
}


function RubleIcon() {
  return (
    <svg
      className={ap('tableCellBalanceIcon')}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 4h4.5a4 4 0 0 1 0 8H8" />
      <path d="M8 4v16" />
      <path d="M5 15h8" />
    </svg>
  )
}

function BalanceValue({ value }: { value: number }) {

  const tone = value > 0 ? 'positive' : value < 0 ? 'negative' : null
  return (
    <span className={ap('tableCellBalanceValue', tone)}>
      <RubleIcon />
      {rub.format(value)}
    </span>
  )
}

function StatusBadge({ status }: { status: UserStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.ACTIVE
  return <AdminBadge tone={meta.tone}>{meta.label}</AdminBadge>
}


function FreezeIcon() {
  return (
    <svg
      className={ap('tableIconButtonIcon')}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2v20" />
      <path d="M4.2 7 19.8 17" />
      <path d="M19.8 7 4.2 17" />
      <path d="M12 5.5 9.5 3M12 5.5 14.5 3M12 18.5 9.5 21M12 18.5 14.5 21" />
      <path d="M4.2 7 4.5 3.9M4.2 7 1.2 7.4M19.8 17l3 -.4M19.8 17l-.3 3.1M19.8 7l3 .4M19.8 7l-.3-3.1M4.2 17l-3 .4M4.2 17l.3 3.1" />
    </svg>
  )
}


export function UsersSection() {

  const [items, setItems] = useState<UserRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [firstLoad, setFirstLoad] = useState(true)
  const [error, setError] = useState<string | null>(null)


  const [reloadNonce, setReloadNonce] = useState(0)
  const reload = useCallback(() => setReloadNonce((n) => n + 1), [])


  const [qInput, setQInput] = useState('')
  const [q, setQ] = useState('')
  const [pending, setPending] = useState(false)
  const [roleFilter, setRoleFilter] = useState<'' | RoleKey>('')
  const [statusFilter, setStatusFilter] = useState<'' | UserStatus>('')


  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDirection>(null)


  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({
    '': sellerStats.userCount,
    SELLER: sellerStats.sellerCount,
  })


  const [editingId, setEditingId] = useState<number | null>(null)


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
    setError(null)
    const sp = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
    if (q) sp.set('q', q)
    if (roleFilter) sp.set('role', roleFilter)
    if (statusFilter) sp.set('status', statusFilter)

    fetch(`/api/admin/users?${sp.toString()}`, { credentials: 'same-origin', signal: ctrl.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return (await res.json()) as UsersResponse
      })
      .then((data) => {
        setItems(Array.isArray(data.items) ? data.items : [])
        setTotal(typeof data.total === 'number' ? data.total : 0)

        if (!q && !statusFilter) {
          setRoleCounts((prev) => ({ ...prev, [roleFilter]: data.total ?? 0 }))
        }
        setLoading(false)
        setFirstLoad(false)
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setItems([])
        setTotal(0)
        setError('Не удалось загрузить пользователей')
        setLoading(false)
        setFirstLoad(false)
      })

    return () => ctrl.abort()
  }, [page, q, roleFilter, statusFilter, reloadNonce])

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))


  const displayItems = useMemo(() => {
    if (!sortKey || !sortDir) return items
    const dir = sortDir === 'asc' ? 1 : -1
    const get = (u: UserRow): number | string => {
      switch (sortKey) {
        case 'name':
          return u.name
        case 'id':
          return u.id
        case 'balance':
          return u.balance
        case 'payable':
          return u.payable
        case 'purchasesCount':
          return u.purchasesCount
        case 'ordersCount':
          return u.ordersCount
        case 'createdAt':
          return Date.parse(u.createdAt) || 0
        case 'updatedAt':
          return u.updatedAt ? Date.parse(u.updatedAt) || 0 : 0
        default:
          return u.id
      }
    }
    return [...items].sort((a, b) => {
      const av = get(a)
      const bv = get(b)
      if (typeof av === 'string' || typeof bv === 'string') {
        return String(av).localeCompare(String(bv), 'ru') * dir
      }
      return (av - bv) * dir
    })
  }, [items, sortKey, sortDir])

  const onSort = useCallback(
    (key: string) => {
      if (sortKey !== key) {
        setSortKey(key)
        setSortDir('asc')
        return
      }

      if (sortDir === 'asc') setSortDir('desc')
      else if (sortDir === 'desc') {
        setSortKey(null)
        setSortDir(null)
      } else setSortDir('asc')
    },
    [sortKey, sortDir],
  )

  const dirFor = (key: string): SortDirection => (sortKey === key ? sortDir : null)


  const viewerLevel = roleLevel(VIEWER_ROLE)
  const canImpersonate = isStaffRole(VIEWER_ROLE)
  const canBlock = viewerLevel >= STELIX_ROLES.MODERATOR.level
  const canDelete = VIEWER_ROLE === 'AGENT'


  const postUserAction = useCallback(
    async (id: number, action: string, data: Record<string, unknown> = {}): Promise<UserRow | null> => {
      try {
        const res = await fetch(`/api/admin/users/${id}`, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action, ...data }),
        })
        if (!res.ok) return null
        const body = (await res.json()) as { ok?: boolean; item?: UserRow }
        return body && body.ok && body.item ? body.item : null
      } catch {
        return null
      }
    },
    [],
  )


  const mergeItem = useCallback((id: number, patch: Partial<UserRow>) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  }, [])


  const doImpersonate = useCallback(async (u: UserRow): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId: u.id }),
      })
      if (!res.ok) return false
      try {
        window.location.assign('/')
      } catch {

      }
      return true
    } catch {
      return false
    }
  }, [])


  const applyStatus = useCallback(
    (u: UserRow, action: 'block' | 'unblock' | 'freeze'): Promise<boolean> => {
      const nextStatus: UserStatus =
        action === 'block' ? 'BLOCKED' : action === 'freeze' ? 'FROZEN' : 'ACTIVE'
      const prevStatus = u.status
      mergeItem(u.id, { status: nextStatus })
      return postUserAction(u.id, action).then((item) => {
        if (item) {
          mergeItem(u.id, item)
          return true
        }
        mergeItem(u.id, { status: prevStatus })
        return false
      })
    },
    [postUserAction, mergeItem],
  )


  const toggleBlock = useCallback(
    (u: UserRow) => void applyStatus(u, u.status === 'BLOCKED' ? 'unblock' : 'block'),
    [applyStatus],
  )

  const toggleFreeze = useCallback(
    (u: UserRow) => void applyStatus(u, u.status === 'FROZEN' ? 'unblock' : 'freeze'),
    [applyStatus],
  )


  const changeRole = useCallback(
    (id: number, role: string, prevRole: string): Promise<boolean> => {
      mergeItem(id, { role })
      return postUserAction(id, 'role', { role }).then((item) => {
        if (item) {
          mergeItem(id, item)
          return true
        }
        mergeItem(id, { role: prevRole })
        return false
      })
    },
    [postUserAction, mergeItem],
  )


  const applyAccounting = useCallback(
    (u: UserRow, mode: 'adjust' | 'balance', values: { balance?: number; payable?: number }): Promise<boolean> => {
      const prev = { balance: u.balance, payable: u.payable }
      const optimistic: Partial<UserRow> =
        mode === 'adjust'
          ? { balance: u.balance + (values.balance ?? 0), payable: u.payable + (values.payable ?? 0) }
          : {
              balance: values.balance != null ? values.balance : u.balance,
              payable: values.payable != null ? values.payable : u.payable,
            }
      mergeItem(u.id, optimistic)
      return postUserAction(u.id, mode, values).then((item) => {
        if (item) {
          mergeItem(u.id, item)
          return true
        }
        mergeItem(u.id, prev)
        return false
      })
    },
    [postUserAction, mergeItem],
  )


  const saveProfile = useCallback(
    (id: number, patch: Partial<UserRow> & { sellerEmail?: string }): Promise<boolean> => {
      mergeItem(id, patch)
      return postUserAction(id, 'update', patch as Record<string, unknown>).then((item) => {
        if (item) {
          mergeItem(id, item)
          return true
        }
        reload()
        return false
      })
    },
    [postUserAction, mergeItem, reload],
  )


  const deleteUser = useCallback(
    (u: UserRow) => {
      setItems((prev) => prev.filter((x) => x.id !== u.id))
      setTotal((t) => Math.max(0, t - 1))
      void fetch(`/api/admin/users/${u.id}`, { method: 'DELETE', credentials: 'same-origin' })
        .then(() => reload())
        .catch(() => reload())
    },
    [reload],
  )


  const editingUser = useMemo(
    () => (editingId == null ? null : items.find((u) => u.id === editingId) ?? null),
    [editingId, items],
  )


  const columns: AdminColumn<UserRow>[] = useMemo(
    () => [
      {
        key: 'id',
        header: 'ID',
        align: 'center',
        sortable: true,
        sortDirection: dirFor('id'),
        onSort,
        cellClassName: ap('tableCellMuted'),
        cell: (u) => u.id,
      },
      {
        key: 'name',
        header: 'Пользователь',
        align: 'start',
        sortable: true,
        sortDirection: dirFor('name'),
        onSort,
        cellClassName: ap('tableCellUserIdentity'),
        cell: (u) => (
          <>
            <span className={ap('tableCellUserName')}>{u.name}</span>
            {u.handle ? <span className={ap('tableCellUserEmail')}>{u.handle}</span> : null}
          </>
        ),
      },
      {
        key: 'balance',
        header: 'Баланс',
        align: 'center',
        sortable: true,
        sortDirection: dirFor('balance'),
        onSort,
        cell: (u) => <BalanceValue value={u.balance} />,
      },
      {
        key: 'payable',
        header: 'К выплате',
        align: 'center',
        sortable: true,
        sortDirection: dirFor('payable'),
        onSort,
        cell: (u) => (
          <span className={ap('tableCellPayableStack')}>
            <BalanceValue value={u.payable} />
          </span>
        ),
      },
      {
        key: 'purchasesCount',
        header: 'Покупки',
        align: 'center',
        sortable: true,
        sortDirection: dirFor('purchasesCount'),
        onSort,
        cell: (u) => <span className={ap('tableCellUserMetric')}>{rub.format(u.purchasesCount)}</span>,
      },
      {
        key: 'ordersCount',
        header: 'Заказы',
        align: 'center',
        sortable: true,
        sortDirection: dirFor('ordersCount'),
        onSort,
        cell: (u) => <span className={ap('tableCellUserMetric')}>{rub.format(u.ordersCount)}</span>,
      },
      {
        key: 'role',
        header: 'Роль',
        align: 'center',
        sortable: false,
        cell: (u) => <AdminRoleBadge role={u.role} lang={SITE_LANG} />,
      },
      {
        key: 'createdAt',
        header: 'Создан',
        align: 'end',
        sortable: true,
        sortDirection: dirFor('createdAt'),
        onSort,
        cell: (u) => <span className={ap('tableCellDateSingle')}>{formatSiteDateDmyCommaHm(u.createdAt, SITE_LANG)}</span>,
      },
      {
        key: 'updatedAt',
        header: 'Изменён',
        align: 'end',
        sortable: true,
        sortDirection: dirFor('updatedAt'),
        onSort,
        cell: (u) => <span className={ap('tableCellDateSingle')}>{formatSiteDateDmyCommaHm(u.updatedAt, SITE_LANG)}</span>,
      },
      {
        key: 'status',
        header: 'Статус',
        align: 'center',
        sortable: false,
        cell: (u) => <StatusBadge status={u.status} />,
      },
      {
        key: 'actions',
        header: 'Действия',
        align: 'actions',
        sortable: false,
        cell: (u) => (
          <>
            <AdminIconButton label="Редактировать" tone="neutral" onClick={() => setEditingId(u.id)}>
              <EditActionIcon />
            </AdminIconButton>
            {canImpersonate ? (
              <AdminIconButton label="Войти как" tone="accent" onClick={() => void doImpersonate(u)}>
                <ImpersonateActionIcon />
              </AdminIconButton>
            ) : null}
            <AdminIconButton
              label={u.status === 'FROZEN' ? 'Разморозить' : 'Заморозить'}
              tone="neutral"
              disabled={!canBlock}
              onClick={() => toggleFreeze(u)}
            >
              <FreezeIcon />
            </AdminIconButton>
            <AdminIconButton
              label={u.status === 'BLOCKED' ? 'Разблокировать' : 'Заблокировать'}
              tone="warning"
              disabled={!canBlock}
              onClick={() => toggleBlock(u)}
            >
              <BlockActionIcon />
            </AdminIconButton>
            {canDelete ? (
              <AdminIconButton label="Удалить" tone="danger" onClick={() => deleteUser(u)}>
                <DeleteActionIcon />
              </AdminIconButton>
            ) : null}
          </>
        ),
      },
    ],
    [sortKey, sortDir, onSort, canImpersonate, canBlock, canDelete, doImpersonate, toggleBlock, toggleFreeze, deleteUser],
  )


  return (
    <section className={ap('section')} id="admin-users" aria-label="Пользователи">

      <AdminSectionHeader title="Пользователи">
        <AdminSearchInput
          value={qInput}
          onChange={setQInput}
          onClear={() => setQInput('')}
          placeholder="Поиск"
          pending={pending}
        />
      </AdminSectionHeader>


      {firstLoad ? (
        <div className={ap('adminMiniStats', 'adminMiniStatsRoleInline', 'adminUsersRoleStripSkeleton')} aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={ap('adminMiniStat')}>
              <span className={ap('adminUsersRoleStripSkeletonFill')} />
            </div>
          ))}
        </div>
      ) : (
        <div className={ap('adminMiniStats', 'adminMiniStatsRoleInline')} role="group" aria-label="Фильтр по роли">
          {ROLE_BUCKETS.map((b) => {
            const active = roleFilter === b.key
            const count = roleCounts[b.key]
            const color = b.key === '' ? 'var(--fg-default)' : roleColor(b.key)
            const style: CSSProperties = {
              border: 0,
              cursor: 'pointer',
              textAlign: 'left',
              font: 'inherit',

              outline: active ? '2px solid var(--accent-fg)' : 'none',
              outlineOffset: '-2px',
            }
            return (
              <button
                key={b.key || 'all'}
                type="button"
                className={ap('adminMiniStat')}
                style={style}
                aria-pressed={active}
                onClick={() => {
                  setRoleFilter(b.key === '' ? '' : active ? '' : b.key)
                  setPage(1)
                }}
              >
                <span className={ap('adminMiniStatLabel')} style={{ color }}>
                  {b.label}
                </span>
                <span className={ap('adminMiniStatValue')}>{count == null ? '—' : rub.format(count)}</span>
              </button>
            )
          })}
        </div>
      )}


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


      <AdminTable<UserRow>
        variant="Users"
        columns={columns}
        rows={displayItems}
        rowKey={(u) => u.id}
        loading={loading}
        ariaLabel="Пользователи"
        emptyText={error ?? 'Пользователи не найдены'}
      />


      <AdminPagination page={page} pageCount={pageCount} onPageChange={setPage} total={total} pageSize={PAGE_SIZE} />


      {editingUser ? (
        <UserEditDrawer
          user={editingUser}
          onClose={() => setEditingId(null)}
          canBlock={canBlock}
          canDelete={canDelete}
          canImpersonate={canImpersonate}
          onImpersonate={doImpersonate}
          onStatus={applyStatus}
          onChangeRole={changeRole}
          onAccounting={applyAccounting}
          onSaveProfile={saveProfile}
          onDelete={(u) => {
            deleteUser(u)
            setEditingId(null)
          }}
        />
      ) : null}
    </section>
  )
}


interface UserEditDrawerProps {
  user: UserRow
  onClose: () => void
  canBlock: boolean
  canDelete: boolean
  canImpersonate: boolean
  onImpersonate: (u: UserRow) => Promise<boolean>
  onStatus: (u: UserRow, action: 'block' | 'unblock' | 'freeze') => Promise<boolean>
  onChangeRole: (id: number, role: string, prevRole: string) => Promise<boolean>
  onAccounting: (u: UserRow, mode: 'adjust' | 'balance', values: { balance?: number; payable?: number }) => Promise<boolean>
  onSaveProfile: (id: number, patch: Partial<UserRow> & { sellerEmail?: string }) => Promise<boolean>
  onDelete: (u: UserRow) => void
}


function FeedbackLine({ state }: { state: ActionState }) {
  if (state === 'error') {
    return (
      <span className={ap('formHint')} style={{ color: 'var(--danger-fg)' }}>
        Не удалось выполнить действие
      </span>
    )
  }
  if (state === 'ok') {
    return (
      <span className={ap('formHint')} style={{ color: 'var(--success-fg)' }}>
        Готово
      </span>
    )
  }
  return null
}

function UserEditDrawer({
  user,
  onClose,
  canBlock,
  canDelete,
  canImpersonate,
  onImpersonate,
  onStatus,
  onChangeRole,
  onAccounting,
  onSaveProfile,
  onDelete,
}: UserEditDrawerProps) {

  const [name, setName] = useState(user.name)
  const [loginEmail, setLoginEmail] = useState(user.email)
  const [sellerEmail, setSellerEmail] = useState(user.sellerEmail ?? '')

  const [role, setRole] = useState<string>(String(user.role))

  const [accMode, setAccMode] = useState<'adjust' | 'balance'>('adjust')
  const [balanceInput, setBalanceInput] = useState('')
  const [payableInput, setPayableInput] = useState('')


  const [profileState, setProfileState] = useState<ActionState>('idle')
  const [roleState, setRoleState] = useState<ActionState>('idle')
  const [statusState, setStatusState] = useState<ActionState>('idle')
  const [accState, setAccState] = useState<ActionState>('idle')
  const [impersonateState, setImpersonateState] = useState<ActionState>('idle')


  useEffect(() => {
    setName(user.name)
    setLoginEmail(user.email)
    setSellerEmail(user.sellerEmail ?? '')
    setRole(String(user.role))
    setAccMode('adjust')
    setBalanceInput('')
    setPayableInput('')
    setProfileState('idle')
    setRoleState('idle')
    setStatusState('idle')
    setAccState('idle')
    setImpersonateState('idle')

  }, [user.id])


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const roleChanged = role !== String(user.role)
  const roleOptions = ROLE_DISPLAY_ORDER

  const saveProfile = () => {
    setProfileState('loading')
    const patch: Partial<UserRow> & { sellerEmail?: string } = {
      name,
      email: loginEmail,
      sellerEmail: sellerEmail.trim(),
    }
    void onSaveProfile(user.id, patch).then((ok) => setProfileState(ok ? 'ok' : 'error'))
  }

  const saveRole = () => {
    if (!roleChanged) return
    setRoleState('loading')
    void onChangeRole(user.id, role, String(user.role)).then((ok) => setRoleState(ok ? 'ok' : 'error'))
  }

  const runStatus = (action: 'block' | 'unblock' | 'freeze') => {
    setStatusState('loading')
    void onStatus(user, action).then((ok) => setStatusState(ok ? 'ok' : 'error'))
  }

  const applyAccounting = () => {
    const bRaw = balanceInput.trim()
    const pRaw = payableInput.trim()
    if (!bRaw && !pRaw) return
    const values: { balance?: number; payable?: number } = {}
    if (bRaw) {
      const n = Number(bRaw)
      if (!Number.isNaN(n)) values.balance = n
    }
    if (pRaw) {
      const n = Number(pRaw)
      if (!Number.isNaN(n)) values.payable = n
    }
    if (values.balance == null && values.payable == null) return
    setAccState('loading')
    void onAccounting(user, accMode, values).then((ok) => {
      setAccState(ok ? 'ok' : 'error')
      if (ok) {
        setBalanceInput('')
        setPayableInput('')
      }
    })
  }

  const runImpersonate = () => {
    setImpersonateState('loading')
    void onImpersonate(user).then((ok) => setImpersonateState(ok ? 'ok' : 'error'))
  }

  return (
    <>
      <div className={ap('editBackdrop')} onClick={onClose} aria-hidden="true" />
      <aside className={ap('editDrawer', 'editDrawerSlideIn')} role="dialog" aria-modal="true" aria-label="Пользователь">
        <div className={ap('editDrawerHeader')}>
          <div className={ap('editDrawerHeaderLeft')}>
            <h3 className={ap('editDrawerTitle')}>Пользователь</h3>
            <span className={ap('badge', 'editDrawerTitleIdBadge')}>#{user.id}</span>
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
                <span className={ap('formInfoLabel')}>ID</span>
                <span className={ap('formInfoValue')}>{user.id}</span>
              </div>
              <div className={ap('formInfo')}>
                <span className={ap('formInfoLabel')}>Текущая роль</span>
                <div className={ap('formInfoStatusRow')}>
                  <AdminRoleBadge role={user.role} lang={SITE_LANG} />
                </div>
              </div>
              <div className={ap('formInfo')}>
                <span className={ap('formInfoLabel')}>Статус</span>
                <div className={ap('formInfoStatusRow')}>
                  <StatusBadge status={user.status} />
                </div>
              </div>

              <div className={ap('editDrawerDivider')} />


              <div className={ap('formGroup')}>
                <label className={ap('formLabel')} htmlFor="edit-user-name">
                  Никнейм
                </label>
                <input
                  id="edit-user-name"
                  className={ap('formInput')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className={ap('formGroup')}>
                <label className={ap('formLabel')} htmlFor="edit-user-email">
                  Email для входа
                </label>
                <input
                  id="edit-user-email"
                  type="email"
                  className={ap('formInput')}
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
              <div className={ap('formGroup')}>
                <label className={ap('formLabel')} htmlFor="edit-user-seller-email">
                  Email продавца
                </label>
                <input
                  id="edit-user-seller-email"
                  type="email"
                  className={ap('formInput')}
                  value={sellerEmail}
                  onChange={(e) => setSellerEmail(e.target.value)}
                  placeholder="—"
                />
              </div>
              <div className={ap('formActions')}>
                <button
                  type="button"
                  className={ap('formBtnPrimary')}
                  disabled={profileState === 'loading'}
                  onClick={saveProfile}
                >
                  {profileState === 'loading' ? 'Сохранение…' : 'Сохранить профиль'}
                </button>
                <FeedbackLine state={profileState} />
              </div>

              <div className={ap('editDrawerDivider')} />


              <div className={ap('settingsFieldRow')}>
                <label className={ap('settingsFieldLabel')} htmlFor="edit-user-role">
                  Роль
                </label>
                <div className={ap('settingsFieldControl')}>
                  <select
                    id="edit-user-role"
                    className={ap('formInput')}
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    {roleOptions.map((rk) => (
                      <option key={rk} value={rk} style={{ color: roleColor(rk) }}>
                        {roleLabel(rk, SITE_LANG)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className={ap('formBtnPrimary')}
                    disabled={!roleChanged || roleState === 'loading'}
                    onClick={saveRole}
                  >
                    {roleState === 'loading' ? 'Сохранение…' : 'Сохранить роль'}
                  </button>
                  <FeedbackLine state={roleState} />
                </div>
              </div>

              <div className={ap('editDrawerDivider')} />


              {canBlock ? (
                <>
                  <div className={ap('formGroup')}>
                    <span className={ap('formLabel')}>Статус аккаунта</span>
                    <div className={ap('editUserAccountActions')}>
                      <button
                        type="button"
                        className={ap('formBtnPrimary')}
                        disabled={user.status === 'ACTIVE' || statusState === 'loading'}
                        onClick={() => runStatus('unblock')}
                      >
                        Активировать
                      </button>
                      <button
                        type="button"
                        className={ap('formBtnDanger')}
                        disabled={user.status === 'FROZEN' || statusState === 'loading'}
                        onClick={() => runStatus('freeze')}
                      >
                        Заморозить
                      </button>
                      <button
                        type="button"
                        className={ap('formBtnDanger')}
                        disabled={user.status === 'BLOCKED' || statusState === 'loading'}
                        onClick={() => runStatus('block')}
                      >
                        Заблокировать
                      </button>
                    </div>
                    <FeedbackLine state={statusState} />
                  </div>
                  <div className={ap('editDrawerDivider')} />
                </>
              ) : null}


              <div className={ap('formInfo')}>
                <span className={ap('formInfoLabel')}>Текущий баланс</span>
                <div className={ap('formInfoStatusRow')}>
                  <BalanceValue value={user.balance} />
                </div>
              </div>
              <div className={ap('formInfo')}>
                <span className={ap('formInfoLabel')}>Текущее «К выплате»</span>
                <div className={ap('formInfoStatusRow')}>
                  <BalanceValue value={user.payable} />
                </div>
              </div>
              <div className={ap('formGroup')}>
                <label className={ap('formLabel')} htmlFor="edit-user-acc-mode">
                  Режим корректировки
                </label>
                <select
                  id="edit-user-acc-mode"
                  className={ap('formInput')}
                  value={accMode}
                  onChange={(e) => setAccMode(e.target.value as 'adjust' | 'balance')}
                >
                  <option value="adjust">Изменить (± дельта)</option>
                  <option value="balance">Установить (точное значение)</option>
                </select>
              </div>
              <div className={ap('formGroup')}>
                <label className={ap('formLabel')} htmlFor="edit-user-balance">
                  {accMode === 'adjust' ? 'Баланс (± сумма)' : 'Баланс (новое значение)'}
                </label>
                <input
                  id="edit-user-balance"
                  type="number"
                  inputMode="numeric"
                  className={ap('formInput')}
                  value={balanceInput}
                  onChange={(e) => setBalanceInput(e.target.value)}
                  placeholder={accMode === 'adjust' ? '0' : String(user.balance)}
                />
              </div>
              <div className={ap('formGroup')}>
                <label className={ap('formLabel')} htmlFor="edit-user-payable">
                  {accMode === 'adjust' ? 'К выплате (± сумма)' : 'К выплате (новое значение)'}
                </label>
                <input
                  id="edit-user-payable"
                  type="number"
                  inputMode="numeric"
                  className={ap('formInput')}
                  value={payableInput}
                  onChange={(e) => setPayableInput(e.target.value)}
                  placeholder={accMode === 'adjust' ? '0' : String(user.payable)}
                />
              </div>
              <div className={ap('formActions')}>
                <button
                  type="button"
                  className={ap('formBtnPrimary')}
                  disabled={accState === 'loading' || (!balanceInput.trim() && !payableInput.trim())}
                  onClick={applyAccounting}
                >
                  {accState === 'loading' ? 'Применение…' : 'Применить'}
                </button>
                <FeedbackLine state={accState} />
              </div>

              <div className={ap('editDrawerDivider')} />


              <div className={ap('editUserAccountActions')}>
                {canImpersonate ? (
                  <button
                    type="button"
                    className={ap('formBtnPrimary')}
                    disabled={impersonateState === 'loading'}
                    onClick={runImpersonate}
                  >
                    {impersonateState === 'loading' ? 'Вход…' : 'Войти как пользователь'}
                  </button>
                ) : null}
                {canDelete ? (
                  <button type="button" className={ap('formBtnDanger')} onClick={() => onDelete(user)}>
                    Удалить аккаунт
                  </button>
                ) : null}
              </div>
              <FeedbackLine state={impersonateState} />
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
