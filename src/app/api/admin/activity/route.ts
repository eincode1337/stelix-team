import { isAuthed } from '@/server/session'
import { json, unauthorized } from '@/server/mock'
import { ROLE_CODES } from '@/server/adminData'
import { Admin } from '@/server/db/store'
import type { AdminPurchase, AdminUser, ListParams } from '@/server/db/store'

export const dynamic = 'force-dynamic'


const DAY = 86_400_000

const ALL_ROWS: ListParams = { page: 1, pageSize: Number.MAX_SAFE_INTEGER, q: '', status: '', role: '' }

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

interface Ident {
  id: number
  name: string
  sub: string
  role: string
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

function ip(r: () => number): string {
  return `${45 + Math.floor(r() * 200)}.${Math.floor(r() * 255)}.${Math.floor(r() * 255)}.${Math.floor(r() * 254) + 1}`
}
function isoMinAgo(min: number, base: number): string {
  return new Date(base - min * 60_000).toISOString()
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

function hourlyFrom(daily: number[]): number[] {
  const avg = daily.reduce((s, v) => s + v, 0) / Math.max(1, daily.length)
  return Array.from({ length: 24 }, (_, h) => {
    const daylight = 0.5 + 0.5 * Math.sin(((h - 8) / 24) * Math.PI * 2)
    return Math.max(0, Math.round((avg / 24) * (0.6 + 1.2 * daylight)))
  })
}

export function GET(request: Request) {
  if (!isAuthed(request)) return unauthorized()

  const base = Date.now()
  const users = Admin.adminList('users', ALL_ROWS).items as unknown as AdminUser[]
  const idents: Ident[] = users.map((u) => ({ id: u.id, name: u.name, sub: u.handle, role: u.role }))

  const roleCount = new Map<string, number>()
  for (const u of users) roleCount.set(u.role, (roleCount.get(u.role) ?? 0) + 1)
  const level = (role: string): number => (ROLE_CODES as readonly string[]).indexOf(role) + 1
  const roles = ROLE_CODES.map((role) => ({ role, count: roleCount.get(role) ?? 0 }))
    .filter((r) => r.count > 0)
    .sort((a, b) => level(b.role) - level(a.role))

  const online = idents.slice(0, 12).map((user, i) => {
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

  const recent = idents.slice(0, 16).map((user, i) => {
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

  const sessions = idents.slice(0, 14).map((user) => {
    const r = mulberry32(user.id * 22695477 + 3)
    const signedAgoMin = Math.floor(r() * 60 * 20) + 5
    return {
      id: `se-${user.id}`,
      user,
      ip: ip(r),
      ua: pick(USER_AGENTS, r()),
      geo: pick(GEOS, r()),
      signInAt: isoMinAgo(signedAgoMin, base),
      expiresAt: new Date(base + (Math.floor(r() * 25) + 3) * DAY).toISOString(),
    }
  })

  const pageViews = idents
    .slice(0, 24)
    .flatMap((user, ui) => {
      const n = 1 + (ui % 2)
      return Array.from({ length: n }, (_, k) => {
        const r = mulberry32(user.id * 374761393 + k * 97 + 5)
        return {
          id: `pv-${user.id}-${k}`,
          user,
          path: pick(SITE_PATHS, r()),
          ip: ip(r),
          at: isoMinAgo(Math.floor(r() * 60 * 20) + k * 7, base),
        }
      })
    })
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))

  const D = 30
  const purchasesPerDay = new Array<number>(D).fill(0)
  const purchases = Admin.adminList('purchases', ALL_ROWS).items as unknown as AdminPurchase[]
  for (const p of purchases) {
    const daysAgo = Math.floor((base - Date.parse(p.createdAt)) / DAY)
    if (daysAgo < 0 || daysAgo >= D) continue
    purchasesPerDay[D - 1 - daysAgo] += 1
  }
  const userCount = Admin.adminStats().userCount
  const registrationsDaily = spreadSmooth(Math.max(D, Math.round((userCount * D) / 365)), D)
  const visitsDaily = purchasesPerDay.map((c, i) => Math.round(c * 11 + 150 + registrationsDaily[i] * 4))
  const viewsDaily = visitsDaily.map((v, i) => Math.round(v * 2.3 + purchasesPerDay[i] * 5))

  const metrics = {
    visits: { daily: visitsDaily, hourly: hourlyFrom(visitsDaily) },
    registrations: { daily: registrationsDaily, hourly: hourlyFrom(registrationsDaily) },
    views: { daily: viewsDaily, hourly: hourlyFrom(viewsDaily) },
  }

  const totals = {
    online: online.length,
    viewsToday: viewsDaily[D - 1],
    sessions: sessions.length,
    users: userCount,
    onlineTrend: 8.3,
    viewsTrend: 5.1,
    sessionsTrend: -2.4,
    usersTrend: 4.2,
  }

  return json({ totals, roles, metrics, online, recent, sessions, pageViews })
}
