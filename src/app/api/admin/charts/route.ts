import { isAuthed } from '@/server/session'
import { json, searchParams, unauthorized } from '@/server/mock'
import { Admin, Resources } from '@/server/db/store'
import type { AdminPurchase, AdminResource, AdminSeller, ListParams } from '@/server/db/store'

export const dynamic = 'force-dynamic'


const DAY = 86_400_000
const PERIOD_DAYS: Record<string, number> = { week: 7, month: 30, all: 90 }

const ALL_ROWS: ListParams = { page: 1, pageSize: Number.MAX_SAFE_INTEGER, q: '', status: '', role: '' }

const CATEGORY_LABELS_RU: Record<string, string> = {
  plugins: 'Плагины',
  modules: 'Модули',
  scripts: 'Скрипты',
  maps: 'Карты',
  integrations: 'Интеграции',
  models: 'Модели',
  particles: 'Партиклы',
  assemblies: 'Сборки',
  tools: 'Инструменты',
  other: 'Другое',
}

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

function dayLabels(n: number, now: number): string[] {
  const out: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now - i * DAY)
    out.push(`${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return out
}

function spreadSmooth(total: number, days: number): number[] {
  if (days <= 0) return []
  const weights = Array.from({ length: days }, (_, i) => {
    const growth = 0.7 + (i / days) * 0.6
    const season = 1 + 0.18 * Math.sin((i / 7) * Math.PI * 2)
    return Math.max(0.05, growth * season)
  })
  const wSum = weights.reduce((s, w) => s + w, 0)
  const ints = weights.map((w) => Math.round((w / wSum) * total))
  let diff = total - ints.reduce((s, v) => s + v, 0)
  for (let i = 0; diff !== 0 && days > 0; i = (i + 1) % days) {
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

const sum = (a: number[]): number => a.reduce((s, v) => s + v, 0)

function topCategories(): SideItem[] {
  const agg = new Map<string, { sales: number; revenue: number }>()
  for (const r of Resources.listResources().resources) {
    const slug = r.category || 'other'
    const cur = agg.get(slug) ?? { sales: 0, revenue: 0 }
    cur.sales += r.sales ?? 0
    cur.revenue += (r.price ?? 0) * (r.sales ?? 0)
    agg.set(slug, cur)
  }
  return [...agg.entries()]
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 6)
    .map(([slug, v]) => ({
      primary: CATEGORY_LABELS_RU[slug] ?? slug,
      amount: v.revenue,
      meta: `${v.sales} продаж`,
    }))
}

export function GET(request: Request) {
  if (!isAuthed(request)) return unauthorized()

  const periodParam = (searchParams(request).get('period') ?? '').trim()
  const period = periodParam in PERIOD_DAYS ? periodParam : 'month'
  const days = PERIOD_DAYS[period]

  const now = Date.now()
  const labels = dayLabels(days, now)

  const purchases = Admin.adminList('purchases', ALL_ROWS).items as unknown as AdminPurchase[]
  const sellers = Admin.adminList('sellers', ALL_ROWS).items as unknown as AdminSeller[]
  const resources = Admin.adminList('resources', ALL_ROWS).items as unknown as AdminResource[]

  const purchaseCount = new Array<number>(days).fill(0)
  const paidRevenue = new Array<number>(days).fill(0)
  for (const p of purchases) {
    const daysAgo = Math.floor((now - Date.parse(p.createdAt)) / DAY)
    if (daysAgo < 0 || daysAgo >= days) continue
    const i = days - 1 - daysAgo
    purchaseCount[i] += 1
    if (p.status === 'PAID') paidRevenue[i] += p.price
  }

  const userCount = Admin.adminStats().userCount
  const windowUsers = Math.max(days, Math.round((userCount * days) / 365))
  const registrations = spreadSmooth(windowUsers, days)

  const topSellers: SideItem[] = sellers
    .slice(0, 6)
    .map((s) => ({ primary: s.name, amount: s.amount, meta: `${s.count} продаж` }))
  const topResources: SideItem[] = [...resources]
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 6)
    .map((r) => ({ primary: r.title, amount: r.price * r.sales, meta: `${r.sales} продаж` }))

  const cards: ChartCard[] = [
    {
      key: 'turnover',
      title: 'ОБОРОТ',
      unit: '₽',
      total: sum(paidRevenue),
      series: labels.map((date, i) => ({ date, value: paidRevenue[i] })),
      sideTitle: 'ТОП ПРОДАВЦОВ',
      side: topSellers,
    },
    {
      key: 'purchases',
      title: 'ПОКУПКИ',
      unit: 'шт.',
      total: sum(purchaseCount),
      series: labels.map((date, i) => ({ date, value: purchaseCount[i] })),
      sideTitle: 'ТОП РЕСУРСОВ',
      side: topResources,
    },
    {
      key: 'users',
      title: 'НОВЫЕ ПОЛЬЗОВАТЕЛИ',
      unit: '',
      total: sum(registrations),
      series: labels.map((date, i) => ({ date, value: registrations[i] })),
      sideTitle: 'ТОП КАТЕГОРИЙ',
      side: topCategories(),
    },
  ]

  return json({ period, cards })
}
