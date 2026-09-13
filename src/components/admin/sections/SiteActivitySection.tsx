'use client'


import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react'

import {
  ap,
  cx,
  AdminMiniStat,
  AdminMiniStats,
  AdminRoleBadge,
  AdminPagination,
  AdminLoading,
  AdminEmptyState,
  STELIX_ROLES,
  ROLE_DISPLAY_ORDER,
  roleColor,
  type RoleKey,
} from '@/components/admin/ui'


import usersPicker from '@/server/fixtures/auth/users-picker.json'
import sellerStats from '@/server/fixtures/auth/seller-stats.json'


const SA_PREFIX = 'AdminSiteActivitySection-module___wng-W__' as const
const SC_PREFIX = 'AdminStatsCharts-module__3LOxkG__' as const

type ClassArg = string | false | null | undefined

function sa(...names: ClassArg[]): string {
  return names.filter(Boolean).map((n) => `${SA_PREFIX}${n as string}`).join(' ')
}

function sc(...names: ClassArg[]): string {
  return names.filter(Boolean).map((n) => `${SC_PREFIX}${n as string}`).join(' ')
}


interface ActivityUser {
  id: number
  name: string
  sub: string
  role: string
}
interface OnlineRow {
  id: string
  user: ActivityUser
  path: string
  ip: string
  geo: string | null
  browser: string
  lastSeenMin: number
}
interface RecentRow {
  id: string
  user: ActivityUser
  event: string
  details: string
  ip: string
  at: string
}
interface SessionRow {
  id: string
  user: ActivityUser
  ip: string
  ua: string
  geo: string | null
  signInAt: string
  expiresAt: string
}
interface PageViewRow {
  id: string
  user: ActivityUser
  path: string
  ip: string
  at: string
}
interface MetricSeries {
  daily: number[]
  hourly: number[]
}
interface ActivityData {
  totals: {
    online: number
    viewsToday: number
    sessions: number
    users: number
    onlineTrend: number
    viewsTrend: number
    sessionsTrend: number
    usersTrend: number
  }
  roles: { role: string; count: number }[]
  metrics: { visits: MetricSeries; registrations: MetricSeries; views: MetricSeries }
  online: OnlineRow[]
  recent: RecentRow[]
  sessions: SessionRow[]
  pageViews: PageViewRow[]
}


function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const pick = <T,>(arr: readonly T[], r: number): T => arr[Math.floor(r * arr.length) % arr.length]

const SITE_PATHS = [
  '/',
  '/resources',
  '/resources?category=plugins',
  '/resource/1042-anticheat-pro',
  '/orders',
  '/order/new',
  '/profile',
  '/profile/purchases',
  '/cart',
  '/checkout',
  '/messages',
  '/seller/2107',
  '/search?q=spigot',
  '/notifications',
] as const
const GEOS: (string | null)[] = [
  'Москва, Россия',
  'Санкт-Петербург, Россия',
  'Киев, Украина',
  'Минск, Беларусь',
  'Алматы, Казахстан',
  'Берлин, Германия',
  'Варшава, Польша',
  null,
  'Ереван, Армения',
  null,
]
const BROWSERS = [
  'Chrome 120 · Windows',
  'Firefox 121 · Windows',
  'Safari 17 · macOS',
  'Chrome · Android',
  'Edge 120 · Windows',
  'Chrome · Linux',
  'Safari · iOS',
] as const
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
] as const

const EVENTS: { event: string; detail: (r: () => number) => string }[] = [
  { event: 'Вход в аккаунт', detail: () => 'Успешная авторизация' },
  { event: 'Регистрация', detail: () => 'Новый аккаунт' },
  { event: 'Покупка', detail: (r) => `Ресурс #${1000 + Math.floor(r() * 200)}` },
  { event: 'Публикация ресурса', detail: (r) => `Ресурс #${1000 + Math.floor(r() * 200)}` },
  { event: 'Пополнение баланса', detail: (r) => `${(Math.floor(r() * 40) + 1) * 100} ₽` },
  { event: 'Заявка на выплату', detail: (r) => `${(Math.floor(r() * 30) + 1) * 500} ₽` },
  { event: 'Новый заказ', detail: (r) => `Бюджет ${(Math.floor(r() * 20) + 1) * 1000} ₽` },
  { event: 'Изменение профиля', detail: () => 'Обновлены данные' },
]

function ip(r: () => number): string {
  return `${45 + Math.floor(r() * 200)}.${Math.floor(r() * 255)}.${Math.floor(r() * 255)}.${Math.floor(r() * 254) + 1}`
}
function isoDaysAgo(days: number, base: number): string {
  return new Date(base - days * 86_400_000).toISOString()
}
function isoMinAgo(min: number, base: number): string {
  return new Date(base - min * 60_000).toISOString()
}


function synthesize(): ActivityData {
  const base = Date.now()
  const realUsers: ActivityUser[] = usersPicker.users.map((u) => ({
    id: u.id,
    name: u.label,
    sub: u.sub,
    role: u.role,
  }))


  const total = sellerStats.userCount


  const weights: Record<RoleKey, number> = {
    NEWBIE: 820,
    VERIFIED: 74,
    TRUSTED: 21,
    SELLER: 39,
    SELLER_PLUS: 6,
    ACCOUNTANT: 2,
    MODERATOR: 3,
    SECURITY: 2,
    DEVELOPER: 2,
    AGENT: 1,
  }
  const wSum = ROLE_DISPLAY_ORDER.reduce((s, k) => s + weights[k], 0)
  let assigned = 0
  const roles = ROLE_DISPLAY_ORDER.map((role, i) => {
    const count =
      i === ROLE_DISPLAY_ORDER.length - 1
        ? Math.max(total - assigned, 0)
        : Math.round((weights[role] / wSum) * total)
    assigned += count
    return { role, count }
  }).sort((a, b) => STELIX_ROLES[b.role].level - STELIX_ROLES[a.role].level)


  const online: OnlineRow[] = realUsers.slice(0, 12).map((user, i) => {
    const r = mulberry32(user.id * 2654435761 + 11)
    return {
      id: `on-${user.id}`,
      user,
      path: pick(SITE_PATHS, r()),
      ip: ip(r),
      geo: pick(GEOS, r()),
      browser: pick(BROWSERS, r()),
      lastSeenMin: Math.floor(r() * 14) + (i === 0 ? 0 : 1),
    }
  })


  const recent: RecentRow[] = realUsers.slice(0, 16).map((user, i) => {
    const r = mulberry32(user.id * 40503 + 7)
    const ev = pick(EVENTS, r())
    return {
      id: `rc-${user.id}-${i}`,
      user,
      event: ev.event,
      details: ev.detail(r),
      ip: ip(r),
      at: isoMinAgo(Math.floor(r() * 60 * 26) + i * 3, base),
    }
  })


  const sessions: SessionRow[] = realUsers.slice(0, 14).map((user) => {
    const r = mulberry32(user.id * 22695477 + 3)
    const signedAgoMin = Math.floor(r() * 60 * 20) + 5
    return {
      id: `se-${user.id}`,
      user,
      ip: ip(r),
      ua: pick(USER_AGENTS, r()),
      geo: pick(GEOS, r()),
      signInAt: isoMinAgo(signedAgoMin, base),
      expiresAt: isoDaysAgo(-(Math.floor(r() * 25) + 3), base),
    }
  })


  const pageViews: PageViewRow[] = []
  realUsers.forEach((user, ui) => {
    const n = 1 + (ui % 2)
    for (let k = 0; k < n; k++) {
      const r = mulberry32(user.id * 374761393 + k * 97 + 5)
      pageViews.push({
        id: `pv-${user.id}-${k}`,
        user,
        path: pick(SITE_PATHS, r()),
        ip: ip(r),
        at: isoMinAgo(Math.floor(r() * 60 * 20) + k * 7, base),
      })
    }
  })
  pageViews.sort((a, b) => Date.parse(b.at) - Date.parse(a.at))


  const series = (seed: number, dayScale: number, hourScale: number): MetricSeries => {
    const rd = mulberry32(seed)
    const daily = Array.from({ length: 30 }, (_, i) =>
      Math.round((0.55 + 0.9 * rd()) * dayScale * (1 + i / 60)),
    )
    const rh = mulberry32(seed + 999)
    const hourly = Array.from({ length: 24 }, (_, h) => {

      const daylight = 0.5 + 0.5 * Math.sin(((h - 3) / 24) * Math.PI * 2)
      return Math.round((0.4 + 0.7 * rh()) * hourScale * (0.4 + daylight))
    })
    return { daily, hourly }
  }

  const viewsToday = pageViews.length * 37 + 214

  return {
    totals: {
      online: online.length,
      viewsToday,
      sessions: sessions.length,
      users: sellerStats.userCount,
      onlineTrend: 8.3,
      viewsTrend: 5.1,
      sessionsTrend: -2.4,
      usersTrend: 4.2,
    },
    roles,
    metrics: {
      visits: series(1001, 260, 22),
      registrations: series(2002, 9, 1),
      views: series(3003, 640, 55),
    },
    online,
    recent,
    sessions,
    pageViews,
  }
}


const nf = (n: number) => n.toLocaleString('ru-RU')
function relMinutes(min: number): string {
  if (min <= 0) return 'только что'
  if (min < 60) return `${min} мин назад`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} ч назад`
  return `${Math.floor(h / 24)} дн назад`
}
function fmtDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}


type PeriodKey = 'day' | 'week' | 'month'
const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'day', label: 'Сутки' },
  { key: 'week', label: '7 дней' },
  { key: 'month', label: '30 дней' },
]


const controlStyle: CSSProperties = {
  appearance: 'none',
  borderRadius: 'var(--radius)',
  border: '1px solid var(--border-muted)',
  background: 'var(--bg-subtle)',
  color: 'var(--fg-default)',
  fontSize: '.8rem',
  fontWeight: 500,
  paddingBlock: '.4rem',
  paddingInline: '.6rem',
  cursor: 'pointer',
}


interface ChartPoint {
  label: string
  value: number
}
function ActivityChart({
  title,
  unit,
  points,
  color,
}: {
  title: string
  unit: string
  points: ChartPoint[]
  color: string
}) {
  const [hover, setHover] = useState<number | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  const total = points.reduce((s, p) => s + p.value, 0)
  const empty = points.length === 0 || total === 0

  const W = 600
  const H = 220
  const padY = 18
  const max = Math.max(1, ...points.map((p) => p.value))
  const min = Math.min(...points.map((p) => p.value), 0)
  const span = Math.max(1, max - min)
  const n = points.length

  const xAt = (i: number) => (n <= 1 ? W / 2 : (i / (n - 1)) * W)
  const yAt = (v: number) => H - padY - ((v - min) / span) * (H - padY * 2)

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(1)},${yAt(p.value).toFixed(1)}`).join(' ')
  const areaPath = empty
    ? ''
    : `M0,${H} L${points.map((p, i) => `${xAt(i).toFixed(1)},${yAt(p.value).toFixed(1)}`).join(' L')} L${W},${H} Z`

  const onMove = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      const el = wrapRef.current
      if (!el || n === 0) return
      const rect = el.getBoundingClientRect()
      const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
      setHover(Math.round(ratio * (n - 1)))
    },
    [n],
  )

  const gradId = useMemo(() => `actch-${Math.random().toString(36).slice(2, 8)}`, [])
  const hp = hover != null ? points[hover] : null

  return (
    <div className={cx(sa('chartCard'), sc('chartCard'))}>
      <div className={sc('chartCardHead')}>
        <h3 className={sc('chartTitle')}>{title}</h3>
        <div className={sc('chartPeriodTotalWrap')}>
          <span className={sc('chartPeriodTotalLabel')}>ЗА ПЕРИОД</span>
          <span className={sc('chartPeriodTotalRow')}>
            <span className={sc('chartPeriodTotal')}>{nf(total)}</span>
            {unit ? <span className={sc('chartPeriodTotalUnit')}>{unit}</span> : null}
          </span>
        </div>
      </div>

      <div className={cx(sc('chartCardBody'), sa('activityChartCardBody'))}>
        <div
          ref={wrapRef}
          className={sc('chartWrap')}
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
        >
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            aria-hidden={empty}
            role="img"
          >
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            {!empty ? <path d={areaPath} fill={`url(#${gradId})`} stroke="none" /> : null}
            {!empty ? (
              <path
                d={linePath}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
            {hp && !empty ? (
              <>
                <line
                  x1={xAt(hover!)}
                  y1={padY / 2}
                  x2={xAt(hover!)}
                  y2={H}
                  stroke="var(--border-muted)"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
                <circle cx={xAt(hover!)} cy={yAt(hp.value)} r={3.5} fill={color} stroke="var(--bg-subtle)" strokeWidth={1.5} />
              </>
            ) : null}
          </svg>

          {hp ? (
            <div
              className={sc('chartTooltip')}
              style={{
                position: 'absolute',
                top: 6,
                left: `${n <= 1 ? 50 : (hover! / (n - 1)) * 100}%`,
                transform: 'translateX(-50%)',
                pointerEvents: 'none',
              }}
            >
              <span className={sc('chartTooltipDate')}>{hp.label}</span>
              <span className={sc('chartTooltipValue')}>{nf(hp.value)}</span>
            </div>
          ) : null}

          {empty ? <p className={sc('chartEmptyOverlay')}>Нет данных за период</p> : null}
        </div>
      </div>
    </div>
  )
}


type CellAlign = 'start' | 'center' | 'end'
const CELL_ALIGN: Record<CellAlign, string> = {
  start: 'tableCellAlignStart',
  center: 'tableCellAlignCenter',
  end: 'tableCellAlignEnd',
}
const HEAD_ALIGN: Record<CellAlign, string> = {
  start: 'tableSortHeaderIdentity',
  center: 'tableSortHeaderCenter',
  end: 'tableSortHeaderEnd',
}

interface ActivityColumn<Row> {
  key: string
  header: ReactNode
  cell: (row: Row) => ReactNode
  align?: CellAlign

  cellClassName?: string
}

function ActivityTable<Row>({
  title,
  tableClass,
  columns,
  rows,
  rowKey,
  searchText,
  filter,
  pageSize = 8,
  emptyText,
}: {
  title: string
  tableClass: string
  columns: ActivityColumn<Row>[]
  rows: Row[]
  rowKey: (row: Row) => string
  searchText: (row: Row) => string
  filter?: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }
  pageSize?: number
  emptyText?: string
}) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => searchText(r).toLowerCase().includes(q))
  }, [rows, query, searchText])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const current = Math.min(page, pageCount)
  const pageRows = filtered.slice((current - 1) * pageSize, current * pageSize)

  return (
    <>
      <div className={sa('activityTableSectionHeader')}>
        <h3 className={sa('subTitle')}>{title}</h3>
      </div>

      <div className={sa('searchRow')}>
        <input
          type="search"
          className={sa('searchInput')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(1)
          }}
          placeholder="Поиск"
          aria-label={`Поиск — ${title}`}
        />
        {filter ? (
          <select
            value={filter.value}
            onChange={(e) => {
              filter.onChange(e.target.value)
              setPage(1)
            }}
            style={controlStyle}
            aria-label="Фильтр по роли"
          >
            {filter.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      <div className={ap('tableWrap')} role="table" aria-label={title}>

        <div className={sa(tableClass)} role="row">
          {columns.map((col) => {
            const align = col.align ?? 'start'
            return (
              <div key={col.key} className={ap('tableCell', CELL_ALIGN[align])} role="columnheader">
                <span className={ap('tableSortHeader', HEAD_ALIGN[align])}>
                  <span className={ap('tableSortHeaderInner')}>
                    <span className={ap('tableSortHeaderLabel')}>{col.header}</span>
                  </span>
                </span>
              </div>
            )
          })}
        </div>

        {pageRows.length === 0 ? (
          <AdminEmptyState text={emptyText ?? 'Нет записей'} />
        ) : (
          pageRows.map((row) => (
            <div key={rowKey(row)} className={sa(tableClass)} role="row">
              {columns.map((col) => {
                const align = col.align ?? 'start'
                return (
                  <div
                    key={col.key}
                    className={cx(ap('tableCell', CELL_ALIGN[align]), col.cellClassName)}
                    role="cell"
                  >
                    {col.cell(row)}
                  </div>
                )
              })}
            </div>
          ))
        )}
      </div>

      {filtered.length > pageSize ? (
        <AdminPagination
          page={current}
          pageCount={pageCount}
          onPageChange={setPage}
          total={filtered.length}
          pageSize={pageSize}
        />
      ) : null}
    </>
  )
}


function Identity({ user }: { user: ActivityUser }) {
  return (
    <>
      <span className={ap('tableCellUserName')}>{user.name}</span>
      <span className={ap('tableCellUserEmail')}>{user.sub}</span>
    </>
  )
}


function TerminateIcon() {
  return (
    <svg
      className={sa('terminateIcon')}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >

      <path d="M12 3v9M18.4 6.6a9 9 0 1 1-12.8 0" />
    </svg>
  )
}


export function SiteActivitySection() {
  const [data, setData] = useState<ActivityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<PeriodKey>('week')


  const [onlineRole, setOnlineRole] = useState('all')
  const [pvRole, setPvRole] = useState('all')


  const [confirm, setConfirm] = useState<SessionRow | null>(null)
  const [terminating, setTerminating] = useState(false)
  const [toast, setToast] = useState<string | null>(null)


  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetch('/api/admin/activity', { credentials: 'include' })
        if (!res.ok) throw new Error(String(res.status))
        const json = (await res.json()) as Partial<ActivityData>
        if (!json || !Array.isArray(json.sessions) || !json.totals) throw new Error('bad shape')
        if (alive) setData(json as ActivityData)
      } catch {

        if (alive) setData(synthesize())
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const requestTerminate = useCallback(async () => {
    if (!confirm) return
    const target = confirm
    setTerminating(true)
    try {

      const res = await fetch(`/api/admin/sessions/${encodeURIComponent(target.id)}/terminate`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) throw new Error(String(res.status))


      setData((d) => (d ? { ...d, sessions: d.sessions.filter((s) => s.id !== target.id) } : d))
      setToast('Сессия завершена')
      setConfirm(null)
    } catch {

      setToast('Не удалось завершить сессию')
    } finally {
      setTerminating(false)
    }
  }, [confirm])


  const chartPoints = useCallback(
    (m: MetricSeries): ChartPoint[] => {
      const base = Date.now()
      if (period === 'day') {
        return m.hourly.map((v, h) => ({ label: `${String(h).padStart(2, '0')}:00`, value: v }))
      }
      const days = period === 'week' ? 7 : 30
      const slice = m.daily.slice(-days)
      return slice.map((v, i) => {
        const daysAgo = days - 1 - i
        const d = new Date(base - daysAgo * 86_400_000)
        return { label: d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }), value: v }
      })
    },
    [period],
  )

  if (loading || !data) {
    return (
      <div className={ap('section')}>
        <div className={sa('periodHeaderBar')}>
          <h2 className={sa('periodHeaderTitle')}>АКТИВНОСТЬ САЙТА</h2>
          <hr className={sa('periodHeaderDivider')} />
        </div>
        <AdminLoading size="page" />
      </div>
    )
  }

  const { totals, roles } = data

  const onlineFiltered =
    onlineRole === 'all' ? data.online : data.online.filter((o) => o.user.role === onlineRole)
  const pvFiltered = pvRole === 'all' ? data.pageViews : data.pageViews.filter((p) => p.user.role === pvRole)

  const roleFilterOptions = [
    { value: 'all', label: 'Все роли' },
    ...ROLE_DISPLAY_ORDER.map((r) => ({ value: r, label: STELIX_ROLES[r].name })),
  ]

  return (
    <div className={ap('section')}>

      <div className={sa('periodHeaderBar')}>
        <h2 className={sa('periodHeaderTitle')}>АКТИВНОСТЬ САЙТА</h2>
        <hr className={sa('periodHeaderDivider')} />
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as PeriodKey)}
          style={controlStyle}
          aria-label="Период"
        >
          {PERIODS.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>
      </div>


      <AdminMiniStats>
        <AdminMiniStat
          label="Сейчас онлайн"
          value={nf(totals.online)}
          trend={{ value: `+${totals.onlineTrend}%`, tone: 'positive' }}
        />
        <AdminMiniStat
          label="Просмотры за сутки"
          value={nf(totals.viewsToday)}
          trend={{ value: `+${totals.viewsTrend}%`, tone: 'positive' }}
        />
        <AdminMiniStat
          label="Сессии"
          value={nf(totals.sessions)}
          trend={{ value: `${totals.sessionsTrend}%`, tone: 'negative' }}
        />
        <AdminMiniStat
          label="Пользователи"
          value={nf(totals.users)}
          trend={{ value: `+${totals.usersTrend}%`, tone: 'positive' }}
        />
      </AdminMiniStats>


      <AdminMiniStats roleInline>
        {roles
          .filter((r) => r.count > 0)
          .map((r) => (
            <AdminMiniStat
              key={r.role}
              label={<span style={{ color: roleColor(r.role) }}>{STELIX_ROLES[r.role as RoleKey]?.name ?? r.role}</span>}
              value={nf(r.count)}
            />
          ))}
      </AdminMiniStats>


      <div className={sa('activityChartsGrid')}>
        <ActivityChart
          title="ПОСЕЩЕНИЯ"
          unit="визитов"
          points={chartPoints(data.metrics.visits)}
          color="var(--accent-fg, #4355db)"
        />
        <ActivityChart
          title="РЕГИСТРАЦИИ"
          unit="польз."
          points={chartPoints(data.metrics.registrations)}
          color={STELIX_ROLES.VERIFIED.color}
        />
        <ActivityChart
          title="ПРОСМОТРЫ"
          unit="стр."
          points={chartPoints(data.metrics.views)}
          color={STELIX_ROLES.SELLER.color}
        />
      </div>


      <ActivityTable<OnlineRow>
        title="Пользователи онлайн"
        tableClass="tableUsersOnline"
        rows={onlineFiltered}
        rowKey={(r) => r.id}
        searchText={(r) => `${r.user.name} ${r.user.sub} ${r.path} ${r.ip} ${r.geo ?? ''} ${r.browser}`}
        filter={{ value: onlineRole, onChange: setOnlineRole, options: roleFilterOptions }}
        emptyText="Нет пользователей онлайн"
        columns={[
          {
            key: 'user',
            header: 'Пользователь',
            align: 'start',
            cellClassName: ap('tableCellUserIdentity'),
            cell: (r) => <Identity user={r.user} />,
          },
          { key: 'role', header: 'Роль', cell: (r) => <AdminRoleBadge role={r.user.role} /> },
          { key: 'path', header: 'Страница', cellClassName: sa('pathCell'), cell: (r) => r.path },
          { key: 'ip', header: 'IP-адрес', cellClassName: sa('mono'), cell: (r) => r.ip },
          {
            key: 'geo',
            header: 'Локация',
            cellClassName: undefined,
            cell: (r) =>
              r.geo ? r.geo : <span className={sa('muted')}>не найдена</span>,
          },
          { key: 'browser', header: 'Браузер', cell: (r) => r.browser },
          { key: 'online', header: 'Онлайн', cell: (r) => relMinutes(r.lastSeenMin) },
        ]}
      />


      <ActivityTable<RecentRow>
        title="Недавняя активность"
        tableClass="tableRecent"
        rows={data.recent}
        rowKey={(r) => r.id}
        searchText={(r) => `${r.user.name} ${r.user.sub} ${r.event} ${r.details} ${r.ip}`}
        emptyText="Нет записей"
        columns={[
          {
            key: 'user',
            header: 'Пользователь',
            cellClassName: ap('tableCellUserIdentity'),
            cell: (r) => <Identity user={r.user} />,
          },
          { key: 'event', header: 'Событие', cell: (r) => r.event },
          { key: 'details', header: 'Детали', cell: (r) => r.details },
          { key: 'ip', header: 'IP-адрес', cellClassName: sa('mono'), cell: (r) => r.ip },
          { key: 'at', header: 'Время', cell: (r) => fmtDateTime(r.at) },
        ]}
      />


      <ActivityTable<SessionRow>
        title="Активные сессии"
        tableClass="tableSessions"
        rows={data.sessions}
        rowKey={(r) => r.id}
        searchText={(r) => `${r.user.name} ${r.user.sub} ${r.ip} ${r.ua} ${r.geo ?? ''}`}
        emptyText="Нет записей о входах"
        columns={[
          {
            key: 'user',
            header: 'Пользователь',
            cellClassName: ap('tableCellUserIdentity'),
            cell: (r) => <Identity user={r.user} />,
          },
          { key: 'ip', header: 'IP-адрес', cellClassName: sa('mono'), cell: (r) => r.ip },
          { key: 'ua', header: 'Браузер', cellClassName: sa('pathCell'), cell: (r) => r.ua },
          {
            key: 'geo',
            header: 'Локация',
            cell: (r) => (r.geo ? r.geo : <span className={sa('muted')}>не найдена</span>),
          },
          { key: 'signIn', header: 'Вход', cell: (r) => fmtDateTime(r.signInAt) },
          { key: 'expires', header: 'Действует до', cell: (r) => fmtDateTime(r.expiresAt) },
          {
            key: 'action',
            header: '',
            align: 'end',
            cell: (r) => (
              <button
                type="button"
                className={sa('terminateBtn')}
                aria-label="Завершить сессию"
                title="Завершить сессию"
                onClick={() => setConfirm(r)}
              >
                <TerminateIcon />
              </button>
            ),
          },
        ]}
      />


      <ActivityTable<PageViewRow>
        title="Просмотры страниц"
        tableClass="tablePageViews"
        rows={pvFiltered}
        rowKey={(r) => r.id}
        searchText={(r) => `${r.user.name} ${r.user.sub} ${r.path} ${r.ip}`}
        filter={{ value: pvRole, onChange: setPvRole, options: roleFilterOptions }}
        emptyText="Нет просмотров"
        pageSize={10}
        columns={[
          {
            key: 'user',
            header: 'Пользователь',
            cellClassName: ap('tableCellUserIdentity'),
            cell: (r) => <Identity user={r.user} />,
          },
          { key: 'role', header: 'Роль', cell: (r) => <AdminRoleBadge role={r.user.role} /> },
          { key: 'path', header: 'Страница', cellClassName: sa('pathCell'), cell: (r) => r.path },
          { key: 'ip', header: 'IP-адрес', cellClassName: sa('mono'), cell: (r) => r.ip },
          { key: 'at', header: 'Время', cell: (r) => fmtDateTime(r.at) },
        ]}
      />


      {confirm ? (
        <div
          className={ap('editBackdrop')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          role="dialog"
          aria-modal="true"
          aria-label="Завершить сессию?"
          onClick={() => (terminating ? undefined : setConfirm(null))}
        >
          <div className={ap('adminReviewDeleteModal')} onClick={(e) => e.stopPropagation()}>
            <div className={ap('adminReviewDeleteInner')}>
              <h3 style={{ margin: '0 0 .5rem', fontSize: '1rem', fontWeight: 600, color: 'var(--fg-default)' }}>
                Завершить сессию?
              </h3>
              <p className={ap('adminReviewDeleteText')}>Сессия будет немедленно завершена.</p>
              <div className={ap('adminReviewDeleteActions')}>
                <button
                  type="button"
                  className={ap('formBtnSecondary')}
                  onClick={() => setConfirm(null)}
                  disabled={terminating}
                >
                  Отмена
                </button>
                <button
                  type="button"
                  className={ap('formBtnDanger')}
                  onClick={requestTerminate}
                  disabled={terminating}
                >
                  {terminating ? 'Завершение…' : 'Завершить сессию'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}


      {toast ? (
        <div
          role="status"
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 300,
            background: 'var(--bg-canvas)',
            color: 'var(--fg-default)',
            border: '1px solid var(--border-muted)',
            borderRadius: 'var(--radius)',
            padding: '.6rem 1rem',
            fontSize: '.85rem',
            boxShadow: '0 8px 24px rgba(0,0,0,.28)',
          }}
        >
          {toast}
        </div>
      ) : null}
    </div>
  )
}

export default SiteActivitySection
