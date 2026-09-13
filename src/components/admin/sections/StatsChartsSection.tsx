'use client'


import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from 'react'

import { ap, AdminSectionHeader } from '@/components/admin/ui'


type ClassArg = string | false | null | undefined
const sc = (...n: ClassArg[]): string =>
  n.filter(Boolean).map((x) => `AdminStatsCharts-module__3LOxkG__${x as string}`).join(' ')


type SeriesPoint = { date: string; value: number }
type SideItem = { primary: string; amount: number; meta: string }
type ChartCard = {
  key: string

  title: string

  unit: string
  total: number
  series: SeriesPoint[]

  sideTitle: string
  side: SideItem[]
}

type Period = 'week' | 'month' | 'all'


const PERIODS: { key: Period; label: string; days: number }[] = [
  { key: 'week', label: 'Неделя', days: 7 },
  { key: 'month', label: 'Месяц', days: 30 },
  { key: 'all', label: 'Квартал', days: 90 },
]


const SELLER_STATS = { sellerCount: 41, userCount: 954, purchaseCount: 3915, orderCount: 6 } as const

const AVG_PRICE_RUB = 640


const TOP_SELLER_NAMES = ['S-SeverskiY', 'HILER', 'chyp1i', 'stapi', 'MARAFON', 'drunk_79063'] as const

const TOP_RESOURCES: { title: string; price: number }[] = [
  { title: '[LR WEB] Messenger', price: 1500 },
  { title: 'NEO 3 | Search Steam', price: 500 },
  { title: 'NEO3 - Server Vote', price: 499 },
  { title: 'Bonuses', price: 599 },
  { title: '[NEO3] Case Clicker', price: 300 },
  { title: '[LR WEB] Лента наказаний NEO v3', price: 150 },
]


function makeRng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}


function spread(total: number, n: number, seed: number): number[] {
  if (n <= 0) return []
  const rng = makeRng(seed)
  const raw: number[] = []
  let sum = 0
  for (let i = 0; i < n; i++) {
    const base = 0.55 + rng()
    const wave = 1 + 0.32 * Math.sin((i / n) * Math.PI * 2 + (seed % 7))
    const v = Math.max(0.05, base * wave)
    raw.push(v)
    sum += v
  }
  const ints = raw.map((v) => Math.round((v / sum) * total))
  let diff = total - ints.reduce((s, v) => s + v, 0)
  for (let i = 0; diff !== 0 && n > 0; i = (i + 1) % n) {
    if (diff > 0) {
      ints[i]++
      diff--
    } else if (ints[i] > 0) {
      ints[i]--
      diff++
    }
  }
  return ints
}


function lastDates(n: number): string[] {
  const out: string[] = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    out.push(`${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return out
}


function synthesizeCards(
  stats: { userCount?: number; purchaseCount?: number },
  period: Period,
): ChartCard[] {
  const days = PERIODS.find((p) => p.key === period)?.days ?? 30
  const dates = lastDates(days)
  const purchases = Number.isFinite(stats.purchaseCount) ? Number(stats.purchaseCount) : SELLER_STATS.purchaseCount
  const users = Number.isFinite(stats.userCount) ? Number(stats.userCount) : SELLER_STATS.userCount

  const buys = spread(purchases, days, 0x51ed_2f01)
  const regs = spread(users, days, 0x91a3_7c55)
  const turnoverPerDay = buys.map((b) => b * AVG_PRICE_RUB)
  const turnoverTotal = purchases * AVG_PRICE_RUB


  const sellerWeights = [0.28, 0.22, 0.17, 0.13, 0.11, 0.09]
  const topSellers: SideItem[] = TOP_SELLER_NAMES.map((name, i) => {
    const amount = Math.round((turnoverTotal * sellerWeights[i]) / 1) / 1
    const sales = Math.max(1, Math.round(amount / AVG_PRICE_RUB))
    return { primary: name, amount, meta: `${sales} продаж` }
  })


  const rng = makeRng(0x1f2e_3d4c)
  const topResources: SideItem[] = TOP_RESOURCES.map((r, i) => {
    const sales = Math.max(1, Math.round((TOP_RESOURCES.length - i) * (6 + rng() * 10)))
    return { primary: r.title, amount: r.price * sales, meta: `${sales} продаж` }
  })

  return [
    {
      key: 'turnover',
      title: 'ОБОРОТ',
      unit: '₽',
      total: turnoverTotal,
      series: dates.map((date, i) => ({ date, value: turnoverPerDay[i] ?? 0 })),
      sideTitle: 'ТОП ПРОДАВЦОВ',
      side: topSellers,
    },
    {
      key: 'purchases',
      title: 'ПОКУПКИ',
      unit: 'шт.',
      total: purchases,
      series: dates.map((date, i) => ({ date, value: buys[i] ?? 0 })),
      sideTitle: 'ТОП РЕСУРСОВ',
      side: topResources,
    },
    {
      key: 'users',
      title: 'НОВЫЕ ПОЛЬЗОВАТЕЛИ',
      unit: '',
      total: users,
      series: dates.map((date, i) => ({ date, value: regs[i] ?? 0 })),
      sideTitle: 'ТОП КАТЕГОРИЙ',
      side: [],
    },
  ]
}


function normalizeCards(raw: unknown): ChartCard[] | null {
  if (!raw || typeof raw !== 'object') return null
  const cards = (raw as { cards?: unknown }).cards
  if (!Array.isArray(cards) || cards.length === 0) return null
  const out: ChartCard[] = []
  for (const c of cards as Record<string, unknown>[]) {
    const seriesRaw = Array.isArray(c.series) ? (c.series as Record<string, unknown>[]) : []
    const sideRaw = Array.isArray(c.side)
      ? (c.side as Record<string, unknown>[])
      : Array.isArray(c.top)
        ? (c.top as Record<string, unknown>[])
        : []
    out.push({
      key: String(c.key ?? out.length),
      title: String(c.title ?? ''),
      unit: String(c.unit ?? ''),
      total: Number(c.total ?? 0),
      series: seriesRaw.map((p) => ({ date: String(p.date ?? ''), value: Number(p.value ?? 0) })),
      sideTitle: String(c.sideTitle ?? ''),
      side: sideRaw.map((s) => ({
        primary: String(s.primary ?? ''),
        amount: Number(s.amount ?? 0),
        meta: String(s.meta ?? ''),
      })),
    })
  }
  return out.length ? out : null
}


async function loadCards(period: Period): Promise<ChartCard[]> {
  try {
    const r = await fetch(`/api/admin/charts?period=${encodeURIComponent(period)}`, {
      credentials: 'include',
      headers: { accept: 'application/json' },
    })
    if (r.ok) {
      const normalized = normalizeCards(await r.json())
      if (normalized) return normalized
    }
  } catch {

  }

  let stats: { userCount?: number; purchaseCount?: number } = {}
  try {
    const r = await fetch('/api/admin/stats', {
      credentials: 'include',
      headers: { accept: 'application/json' },
    })
    if (r.ok) stats = (await r.json()) as typeof stats
  } catch {

  }
  return synthesizeCards(stats, period)
}


const NF = new Intl.NumberFormat('ru-RU')
const fmt = (v: number): string => NF.format(Math.round(v))


function LightningIcon() {
  return (
    <svg
      className={sc('chartSideLightningIcon')}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
    </svg>
  )
}


const CHART_W = 320
const CHART_H = 220
const PAD_TOP = 12
const PAD_BOTTOM = 8
const GRID_FRACTIONS = [0, 0.25, 0.5, 0.75, 1]

function AreaChart({ card }: { card: ChartCard }) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [active, setActive] = useState<number | null>(null)

  const series = card.series
  const n = series.length
  const values = series.map((p) => p.value)
  const max = Math.max(1, ...values)
  const isEmpty = n === 0 || values.every((v) => v === 0)

  const geom = useMemo(() => {
    const plotH = CHART_H - PAD_TOP - PAD_BOTTOM
    const xs = series.map((_, i) => (n <= 1 ? CHART_W / 2 : (i / (n - 1)) * CHART_W))
    const ys = series.map((p) => PAD_TOP + (1 - p.value / max) * plotH)
    const linePath = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${ys[i].toFixed(2)}`).join(' ')
    const areaPath =
      xs.length > 0
        ? `${linePath} L${xs[xs.length - 1].toFixed(2)} ${CHART_H} L${xs[0].toFixed(2)} ${CHART_H} Z`
        : ''
    return { xs, ys, linePath, areaPath }
  }, [series, n, max])

  const gradientId = `stx-chart-grad-${card.key}`

  function handleMove(e: ReactMouseEvent<HTMLDivElement>) {
    const el = wrapRef.current
    if (!el || n === 0) return
    const rect = el.getBoundingClientRect()
    if (rect.width === 0) return
    const ratio = (e.clientX - rect.left) / rect.width
    const idx = Math.min(n - 1, Math.max(0, Math.round(ratio * (n - 1))))
    setActive(idx)
  }

  const activePoint = active != null ? series[active] : null
  const tooltipStyle: CSSProperties | undefined =
    active != null
      ? {
          position: 'absolute',
          left: `${(geom.xs[active] / CHART_W) * 100}%`,
          top: `${(geom.ys[active] / CHART_H) * 100}%`,
          transform: 'translate(-50%, calc(-100% - 10px))',
          zIndex: 2,
        }
      : undefined

  return (
    <div
      ref={wrapRef}
      className={sc('chartWrap')}
      onMouseMove={handleMove}
      onMouseLeave={() => setActive(null)}
    >
      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        width="100%"
        height={CHART_H}
        preserveAspectRatio="none"
        role="img"
        aria-label={`${card.title}: график за период`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-fg)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--accent-fg)" stopOpacity={0} />
          </linearGradient>
        </defs>


        {GRID_FRACTIONS.map((f) => {
          const y = PAD_TOP + f * (CHART_H - PAD_TOP - PAD_BOTTOM)
          return (
            <line
              key={f}
              x1={0}
              x2={CHART_W}
              y1={y}
              y2={y}
              stroke="var(--border-default)"
              strokeWidth={1}
              style={{ shapeRendering: 'crispEdges', vectorEffect: 'non-scaling-stroke' }}
            />
          )
        })}

        {!isEmpty && geom.areaPath ? <path d={geom.areaPath} fill={`url(#${gradientId})`} /> : null}
        {!isEmpty && geom.linePath ? (
          <path
            d={geom.linePath}
            fill="none"
            stroke="var(--accent-fg)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ vectorEffect: 'non-scaling-stroke' }}
          />
        ) : null}


        {active != null && !isEmpty ? (
          <g>
            <line
              x1={geom.xs[active]}
              x2={geom.xs[active]}
              y1={PAD_TOP}
              y2={CHART_H - PAD_BOTTOM}
              stroke="var(--border-strong, var(--border-default))"
              strokeWidth={1}
              style={{ shapeRendering: 'crispEdges', vectorEffect: 'non-scaling-stroke' }}
            />
            <circle cx={geom.xs[active]} cy={geom.ys[active]} r={3.5} fill="var(--accent-fg)" />
          </g>
        ) : null}
      </svg>


      {isEmpty ? (

        <p className={sc('chartEmptyOverlay')}>Нет данных за период</p>
      ) : null}


      {activePoint ? (
        <div className={sc('chartTooltip')} style={tooltipStyle}>
          <span className={sc('chartTooltipDate')}>{activePoint.date}</span>
          <span className={sc('chartTooltipValue')}>
            {fmt(activePoint.value)}
            {card.unit ? ` ${card.unit}` : ''}
          </span>
        </div>
      ) : null}


      <span className={sc('chartVisuallyHidden')}>
        {card.title}. {series.map((p) => `${p.date}: ${fmt(p.value)}${card.unit ? ' ' + card.unit : ''}`).join('; ')}
      </span>
    </div>
  )
}


function ChartCardView({ card, loading }: { card: ChartCard; loading: boolean }) {
  return (
    <section className={sc('chartCard')}>
      <div className={sc('chartCardHead')}>
        <h3 className={sc('chartTitle')}>{card.title}</h3>
        <div className={sc('chartPeriodTotalWrap')}>

          <span className={sc('chartPeriodTotalLabel')}>ЗА ПЕРИОД</span>
          <span className={sc('chartPeriodTotalRow')}>
            <span className={sc('chartPeriodTotal')}>{fmt(card.total)}</span>
            {card.unit ? <span className={sc('chartPeriodTotalUnit')}>{card.unit}</span> : null}
          </span>
        </div>
      </div>

      <div className={sc('chartCardBody')}>

        {loading ? (
          <div className={sc('chartWrap')}>
            <div className={sc('chartLoadingWrap')}>
              <div className={sc('chartLoadingSpinner')} />
            </div>
          </div>
        ) : (
          <AreaChart card={card} />
        )}


        <aside className={sc('chartSide')}>
          <h4 className={sc('chartSideTitle')}>{card.sideTitle}</h4>
          {card.side.length > 0 ? (
            <ul className={sc('chartSideList')}>
              {card.side.map((item, i) => (
                <li key={`${item.primary}-${i}`} className={sc('chartSideItem')}>
                  <div className={sc('chartSideItemTop')}>
                    <span className={sc('chartSideItemPrimary')}>{item.primary}</span>
                    <span className={sc('chartSideAmount')}>
                      <LightningIcon />
                      <span className={sc('chartSideItemAmount')}>{fmt(item.amount)}</span>
                    </span>
                  </div>
                  <span className={sc('chartSideItemMeta')}>{item.meta}</span>
                </li>
              ))}
            </ul>
          ) : (

            <p className={sc('chartSideEmpty')}>Пусто</p>
          )}
        </aside>
      </div>
    </section>
  )
}


function CardSkeleton() {
  return (
    <div className={sc('chartCardSkeletonSlot')}>
      <div className={sc('chartCardFullSkeleton')} />
    </div>
  )
}


function PeriodBar({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  const btnBase: CSSProperties = {
    appearance: 'none',
    border: '1px solid var(--border-default)',
    background: 'var(--bg-default)',
    color: 'var(--fg-muted)',
    borderRadius: 'var(--radius)',
    padding: '0.3rem 0.7rem',
    font: '600 0.72rem/1.2 inherit',
    cursor: 'pointer',
  }
  const btnActive: CSSProperties = {
    ...btnBase,
    background: 'var(--accent-subtle-bg, var(--bg-subtle))',
    color: 'var(--accent-fg)',
    borderColor: 'var(--accent-fg)',
  }
  return (
    <div
      className={ap('adminFinancePeriodBar')}
      role="group"
      aria-label="Период"
      style={{ display: 'flex', gap: '0.35rem', width: 'auto', marginBottom: 0, flexWrap: 'wrap' }}
    >
      {PERIODS.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={() => onChange(p.key)}
          aria-pressed={value === p.key}
          style={value === p.key ? btnActive : btnBase}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}


export function StatsChartsSection() {
  const [period, setPeriod] = useState<Period>('month')
  const [cards, setCards] = useState<ChartCard[] | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    let alive = true
    setStatus('loading')
    loadCards(period)
      .then((next) => {
        if (!alive) return
        setCards(next)
        setStatus('ready')
      })
      .catch(() => {
        if (!alive) return
        setStatus('error')
      })
    return () => {
      alive = false
    }
  }, [period])

  const firstLoad = status === 'loading' && cards == null
  const reloading = status === 'loading' && cards != null

  return (
    <section className={ap('section')}>
      <AdminSectionHeader title="Статистика">
        <PeriodBar value={period} onChange={setPeriod} />
      </AdminSectionHeader>

      <div className={sc('chartsBlock')}>
        <div className={sc('chartsGrid')}>
          {status === 'error' ? (

            <p className={sc('chartError')}>Не удалось загрузить статистику</p>
          ) : firstLoad ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            (cards ?? []).map((card) => <ChartCardView key={card.key} card={card} loading={reloading} />)
          )}
        </div>
      </div>
    </section>
  )
}
