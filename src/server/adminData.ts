

import usersPicker from '@/server/fixtures/auth/users-picker.json'
import authMe from '@/server/fixtures/auth/auth-me.json'
import ordersFixture from '@/server/fixtures/orders.json'
import resourcesFixture from '@/server/fixtures/resources.json'
import sellerStats from '@/server/fixtures/auth/seller-stats.json'


export const ROLE_CODES = [
  'NEWBIE', 'VERIFIED', 'TRUSTED', 'SELLER', 'SELLER_PLUS',
  'ACCOUNTANT', 'MODERATOR', 'SECURITY', 'DEVELOPER', 'AGENT',
] as const
export type RoleCode = (typeof ROLE_CODES)[number]


export const ROLE_LABELS_RU: Record<RoleCode, string> = {
  NEWBIE: 'Новенький',
  VERIFIED: 'Проверенный',
  TRUSTED: 'Доверенный',
  SELLER: 'Продавец',
  SELLER_PLUS: 'Продавец+',
  ACCOUNTANT: 'Бухгалтер',
  MODERATOR: 'Модератор',
  SECURITY: 'Служба безопасности',
  DEVELOPER: 'Разработчик',
  AGENT: 'Агент',
}


export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'FROZEN'
export type PurchaseStatus = 'PAID' | 'REFUNDED' | 'PENDING' | 'DISPUTED'
export type WithdrawalStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'REJECTED'
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type WithdrawalMethod = 'CARD' | 'SBP' | 'CRYPTO' | 'YOOMONEY'
export type DeliveryType = 'FILE' | 'DISCORD' | 'LINK' | 'APPLICATION' | 'KEY'


export type AdminUser = {
  id: number
  name: string
  email: string
  handle: string
  role: RoleCode
  status: UserStatus
  balance: number
  payable: number
  ordersCount: number
  purchasesCount: number
  createdAt: string
  updatedAt: string
  avatarUrl: string | null
}

export type AdminOrder = {
  id: string
  title: string
  budget: number
  customer: string
  customerId: number
  executor: string | null
  executorId: number | null
  status: string
  createdAt: string
  updatedAt: string
}

export type AdminPurchase = {
  id: string
  resourceId: string
  title: string
  buyer: string
  buyerId: number
  price: number
  fee: number
  status: PurchaseStatus
  createdAt: string
}

export type AdminResource = {
  id: string
  title: string
  author: string
  authorId: number
  authorRole: RoleCode
  price: number
  sales: number
  status: string
  createdAt: string
  updatedAt: string | null
}

export type AdminSeller = {
  id: number
  name: string
  role: RoleCode
  status: UserStatus
  count: number
  resourcesCount: number
  amount: number
  payable: number
}

export type AdminWithdrawal = {
  id: string
  num: number
  userId: number
  identity: string
  email: string
  role: RoleCode
  method: WithdrawalMethod
  methodDetails: string
  amount: number
  status: WithdrawalStatus
  createdAt: string
  updatedAt: string
}

export type AdminApplication = {
  id: string
  userId: number
  identity: string
  email: string
  role: RoleCode
  status: ApplicationStatus
  createdAt: string
  updatedAt: string
}

export type AdminBlacklistEntry = {
  id: number
  identity: string
  role: RoleCode
  site: string
  social: string
  createdAt: string
  updatedAt: string
}

export type AdminDelivery = {
  id: string
  userId: number
  user: string
  resourceId: string
  resource: string
  type: DeliveryType
  details: string
  createdAt: string
}


const NOW = Date.parse('2026-09-11T12:00:00.000Z')
const DAY = 86_400_000


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

function pick<T>(arr: readonly T[], r: number): T {
  return arr[Math.floor(r * arr.length) % arr.length]
}

function isoDaysAgo(days: number): string {
  return new Date(NOW - Math.round(days * DAY)).toISOString()
}

function looksLikeEmail(s: string): boolean {
  return /@/.test(s) && /\./.test(s.split('@')[1] ?? '')
}

function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .slice(0, 14) || 'user'
  )
}


const NICK_POOL = [
  'shadowfox', 'nightowl', 'crypto_max', 'zenith', 'volk', 'pixelrain', 'darkmode',
  'frost', 'kirito', 'neonwave', 'sk1llz', 'byteme', 'razor', 'phantom', 'lucid',
  'wraith', 'quasar', 'onyx', 'blitz', 'vortex', 'cobalt', 'specter', 'reaper',
  'silen', 'nova', 'echo', 'drift', 'apex', 'lynx', 'raven', 'grim', 'zeus',
  'atlas', 'orbit', 'flux', 'ember', 'saber', 'krypt', 'volt', 'halcyon',
]
const EMAIL_DOMAINS = ['gmail.com', 'mail.ru', 'yandex.ru', 'outlook.com', 'proton.me', 'icloud.com']


let _users: AdminUser[] | null = null

export function getUsers(): AdminUser[] {
  if (_users) return _users

  const byId = new Map<number, AdminUser>()

  const makeUser = (
    id: number,
    name: string,
    handleOrEmail: string,
    role: RoleCode,
    avatarUrl: string | null,
  ): AdminUser => {
    const r = makeRng(id * 2654435761)
    const handle = handleOrEmail
    const email = looksLikeEmail(handleOrEmail)
      ? handleOrEmail
      : `${slug(name || handleOrEmail)}${id % 97}@${pick(EMAIL_DOMAINS, r())}`
    const isSeller = role === 'SELLER' || role === 'SELLER_PLUS'
    const balance = Math.floor(r() * (isSeller ? 40_000 : 3_000))
    const payable = isSeller && r() > 0.4 ? Math.floor(r() * 12_000) : 0
    const statusRoll = r()
    const status: UserStatus = statusRoll > 0.94 ? 'BLOCKED' : statusRoll > 0.9 ? 'FROZEN' : 'ACTIVE'
    const createdDaysAgo = 20 + Math.floor(r() * 500)
    return {
      id,
      name: name || handle,
      email,
      handle,
      role,
      status,
      balance,
      payable,
      ordersCount: Math.floor(r() * (isSeller ? 8 : 3)),
      purchasesCount: Math.floor(r() * (isSeller ? 40 : 12)),
      createdAt: isoDaysAgo(createdDaysAgo),
      updatedAt: isoDaysAgo(Math.floor(r() * createdDaysAgo)),
      avatarUrl,
    }
  }


  for (const u of usersPicker.users) {
    byId.set(u.id, makeUser(u.id, u.label, u.sub, normalizeRole(u.role), u.avatarUrl))
  }


  for (const res of resourcesFixture.resources) {
    if (!byId.has(res.authorId)) {
      byId.set(
        res.authorId,
        makeUser(res.authorId, res.author, res.author, normalizeRole(res.authorRole), null),
      )
    }
  }


  const me = authMe.user
  byId.set(me.id, {
    id: me.id,
    name: me.name,
    email: me.email,
    handle: me.discordDisplayName || me.name,
    role: normalizeRole(me.role),
    status: me.status === 0 ? 'ACTIVE' : 'FROZEN',
    balance: me.balance,
    payable: me.payable,
    ordersCount: 0,
    purchasesCount: 3,
    createdAt: me.legalAcceptedAt ?? isoDaysAgo(9),
    updatedAt: me.emailVerified ?? isoDaysAgo(0),
    avatarUrl: me.image,
  })


  const target = sellerStats.userCount
  let nextId = Math.max(...byId.keys())
  while (byId.size < target && nextId > 1) {
    nextId -= 1
    if (byId.has(nextId)) continue
    const r = makeRng(nextId * 40503)
    const nick = pick(NICK_POOL, r())
    const name = r() > 0.75 ? `${nick}${Math.floor(r() * 900 + 10)}` : nick

    const roleRoll = r()
    const role: RoleCode =
      roleRoll > 0.985 ? 'SELLER_PLUS'
        : roleRoll > 0.95 ? 'SELLER'
          : roleRoll > 0.8 ? 'VERIFIED'
            : 'NEWBIE'
    byId.set(nextId, makeUser(nextId, name, name, role, null))
  }

  _users = [...byId.values()].sort((a, b) => b.id - a.id)
  return _users
}

function normalizeRole(role: string): RoleCode {
  const up = String(role).toUpperCase()
  return (ROLE_CODES as readonly string[]).includes(up) ? (up as RoleCode) : 'NEWBIE'
}


export function getOrders(): AdminOrder[] {
  return ordersFixture.orders.map((o) => ({
    id: o.id,
    title: o.title,
    budget: o.budget,
    customer: o.client,
    customerId: o.clientId,
    executor: o.seller ?? null,
    executorId: o.sellerId ?? null,
    status: o.rawStatus ?? String(o.status ?? '').toUpperCase(),
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  }))
}


export function getResources(): AdminResource[] {
  return resourcesFixture.resources.map((res) => ({
    id: res.id,
    title: res.title,
    author: res.author,
    authorId: res.authorId,
    authorRole: normalizeRole(res.authorRole),
    price: res.price,
    sales: res.sales,
    status: res.status,
    createdAt: res.createdAt,
    updatedAt: res.updatedAt ?? null,
  }))
}


let _sellers: AdminSeller[] | null = null

export function getSellers(): AdminSeller[] {
  if (_sellers) return _sellers

  const agg = new Map<number, { name: string; role: RoleCode; sales: number; resources: number; turnover: number }>()
  for (const res of resourcesFixture.resources) {
    const cur = agg.get(res.authorId) ?? {
      name: res.author,
      role: normalizeRole(res.authorRole),
      sales: 0,
      resources: 0,
      turnover: 0,
    }
    cur.sales += res.sales
    cur.resources += 1
    cur.turnover += res.price * res.sales

    if (roleLevel(normalizeRole(res.authorRole)) > roleLevel(cur.role)) cur.role = normalizeRole(res.authorRole)
    agg.set(res.authorId, cur)
  }

  const sellers: AdminSeller[] = [...agg.entries()].map(([id, a]) => {
    const r = makeRng(id * 2246822519)
    const payable = a.role === 'SELLER' || a.role === 'SELLER_PLUS' ? Math.floor(r() * 15_000) : 0
    return {
      id,
      name: a.name,
      role: a.role,
      status: r() > 0.95 ? 'FROZEN' : 'ACTIVE',
      count: a.sales,
      resourcesCount: a.resources,
      amount: a.turnover,
      payable,
    }
  })


  const have = new Set(sellers.map((s) => s.id))
  const candidates = getUsers().filter(
    (u) => (u.role === 'SELLER' || u.role === 'SELLER_PLUS') && !have.has(u.id),
  )
  for (const u of candidates) {
    if (sellers.length >= sellerStats.sellerCount) break
    const r = makeRng(u.id * 374761393)
    sellers.push({
      id: u.id,
      name: u.name,
      role: u.role,
      status: u.status,
      count: Math.floor(r() * 40),
      resourcesCount: Math.floor(r() * 6) + 1,
      amount: Math.floor(r() * 30_000),
      payable: u.payable,
    })
  }

  _sellers = sellers.sort((a, b) => b.amount - a.amount)
  return _sellers
}

function roleLevel(role: RoleCode): number {
  return ROLE_CODES.indexOf(role) + 1
}


let _purchases: AdminPurchase[] | null = null

export function getPurchases(): AdminPurchase[] {
  if (_purchases) return _purchases
  const resources = getResources()
  const users = getUsers()

  const weighted: number[] = []
  resources.forEach((res, i) => {
    const w = Math.min(res.sales + 1, 60)
    for (let k = 0; k < w; k++) weighted.push(i)
  })

  const out: AdminPurchase[] = []
  const target = sellerStats.purchaseCount
  for (let n = 0; n < target; n++) {
    const r = makeRng((n + 1) * 2654435761)
    const res = resources[pick(weighted, r())]
    const buyer = pick(users, r())
    const price = res.price
    const fee = Math.max(1, Math.round(price * 0.05))
    const statusRoll = r()
    const status: PurchaseStatus =
      statusRoll > 0.97 ? 'REFUNDED' : statusRoll > 0.94 ? 'PENDING' : statusRoll > 0.93 ? 'DISPUTED' : 'PAID'
    out.push({
      id: `pur_${(n + 1).toString(36)}${Math.floor(r() * 1e6).toString(36)}`,
      resourceId: res.id,
      title: res.title,
      buyer: buyer.name,
      buyerId: buyer.id,
      price,
      fee,
      status,
      createdAt: isoDaysAgo(Math.floor(r() * 200)),
    })
  }
  _purchases = out.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  return _purchases
}


let _withdrawals: AdminWithdrawal[] | null = null

export function getWithdrawals(): AdminWithdrawal[] {
  if (_withdrawals) return _withdrawals
  const sellers = getUsers().filter((u) => u.role === 'SELLER' || u.role === 'SELLER_PLUS')
  const methods: WithdrawalMethod[] = ['CARD', 'SBP', 'CRYPTO', 'YOOMONEY']
  const statuses: WithdrawalStatus[] = ['PENDING', 'PROCESSING', 'PAID', 'PAID', 'REJECTED']
  const out: AdminWithdrawal[] = []
  const count = 48
  for (let n = 0; n < count; n++) {
    const r = makeRng((n + 101) * 1013904223)
    const u = sellers.length ? pick(sellers, r()) : getUsers()[n % getUsers().length]
    const method = pick(methods, r())
    const created = Math.floor(r() * 120)
    const status = pick(statuses, r())
    const methodDetails =
      method === 'CARD'
        ? `2200 •• ${1000 + Math.floor(r() * 8999)}`
        : method === 'SBP'
          ? `+7 9${Math.floor(r() * 90 + 10)} •• ${Math.floor(r() * 90 + 10)}`
          : method === 'CRYPTO'
            ? `USDT TRC20 •• ${Math.floor(r() * 8999 + 1000)}`
            : `4100 •• ${Math.floor(r() * 8999 + 1000)}`
    out.push({
      id: `wd_${(n + 1).toString(36)}`,
      num: count - n + 100,
      userId: u.id,
      identity: u.name,
      email: u.email,
      role: u.role,
      method,
      methodDetails,
      amount: (Math.floor(r() * 40) + 1) * 100,
      status,
      createdAt: isoDaysAgo(created),
      updatedAt: isoDaysAgo(Math.max(0, created - Math.floor(r() * 3))),
    })
  }
  _withdrawals = out.sort((a, b) => b.num - a.num)
  return _withdrawals
}


let _applications: AdminApplication[] | null = null

export function getApplications(): AdminApplication[] {
  if (_applications) return _applications
  const pool = getUsers().filter((u) => u.role === 'NEWBIE' || u.role === 'VERIFIED')
  const statuses: ApplicationStatus[] = ['PENDING', 'PENDING', 'APPROVED', 'REJECTED']
  const out: AdminApplication[] = []
  const count = 22
  for (let n = 0; n < count; n++) {
    const r = makeRng((n + 202) * 1597334677)
    const u = pool.length ? pool[Math.floor(r() * pool.length)] : getUsers()[n]
    const created = Math.floor(r() * 90)
    out.push({
      id: `app_${(n + 1).toString(36)}`,
      userId: u.id,
      identity: u.name,
      email: u.email,
      role: u.role,
      status: pick(statuses, r()),
      createdAt: isoDaysAgo(created),
      updatedAt: isoDaysAgo(Math.max(0, created - Math.floor(r() * 5))),
    })
  }
  _applications = out.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  return _applications
}


let _blacklist: AdminBlacklistEntry[] | null = null

export function getBlacklist(): AdminBlacklistEntry[] {
  if (_blacklist) return _blacklist
  const out: AdminBlacklistEntry[] = []
  const count = 15
  for (let n = 0; n < count; n++) {
    const r = makeRng((n + 303) * 2891336453)
    const nick = pick(NICK_POOL, r())
    const created = Math.floor(r() * 300 + 10)
    out.push({
      id: 40 + n,
      identity: `${nick}${Math.floor(r() * 900 + 10)}@${pick(EMAIL_DOMAINS, r())}`,
      role: r() > 0.85 ? 'SELLER' : 'NEWBIE',
      site: r() > 0.5 ? `${nick}.example.com` : '—',
      social: r() > 0.5 ? `@${nick}` : `discord: ${Math.floor(r() * 1e9)}`,
      createdAt: isoDaysAgo(created),
      updatedAt: isoDaysAgo(Math.max(0, created - Math.floor(r() * 20))),
    })
  }
  _blacklist = out.sort((a, b) => b.id - a.id)
  return _blacklist
}


let _deliveries: AdminDelivery[] | null = null

const DELIVERY_SOURCE_MAP: Record<string, DeliveryType> = {
  discord: 'DISCORD',
  upload: 'FILE',
  link: 'LINK',
  application: 'APPLICATION',
}

export function getDeliveries(): AdminDelivery[] {
  if (_deliveries) return _deliveries
  const resById = new Map(resourcesFixture.resources.map((r) => [r.id, r]))
  const paid = getPurchases().filter((p) => p.status === 'PAID')
  const out: AdminDelivery[] = []
  const count = Math.min(600, paid.length)
  for (let n = 0; n < count; n++) {
    const p = paid[n]
    const r = makeRng((n + 404) * 3266489917)
    const res = resById.get(p.resourceId)
    const type = res ? DELIVERY_SOURCE_MAP[res.deliverySource] ?? 'FILE' : 'FILE'
    const details =
      type === 'FILE'
        ? `${slug(p.title)}-v${Math.floor(r() * 4 + 1)}.zip`
        : type === 'DISCORD'
          ? `DM • ${Math.floor(r() * 1e9)}`
          : type === 'LINK'
            ? `https://cdn.stelix.team/d/${Math.floor(r() * 1e8).toString(36)}`
            : type === 'APPLICATION'
              ? `ticket #${Math.floor(r() * 9000 + 1000)}`
              : `KEY-${Math.floor(r() * 1e4)}-${Math.floor(r() * 1e4)}`
    out.push({
      id: `dlv_${(n + 1).toString(36)}`,
      userId: p.buyerId,
      user: p.buyer,
      resourceId: p.resourceId,
      resource: p.title,
      type,
      details,
      createdAt: p.createdAt,
    })
  }
  _deliveries = out
  return _deliveries
}


export type Kpi = {
  key: string
  label: string
  value: number
  format: 'number' | 'currency'
  delta: number
  trend: 'up' | 'down' | 'flat'
}

export function getStats() {
  const purchases = getPurchases()
  const dayAgo = NOW - DAY
  const purchasesToday = purchases.filter((p) => Date.parse(p.createdAt) >= dayAgo).length
  const revenueToday = purchases
    .filter((p) => p.status === 'PAID' && Date.parse(p.createdAt) >= dayAgo)
    .reduce((s, p) => s + p.price, 0)

  const kpis: Kpi[] = [
    { key: 'users', label: 'Пользователи', value: sellerStats.userCount, format: 'number', delta: 4.2, trend: 'up' },
    { key: 'sellers', label: 'Продавцы', value: sellerStats.sellerCount, format: 'number', delta: 1.8, trend: 'up' },
    { key: 'purchases', label: 'Покупки', value: sellerStats.purchaseCount, format: 'number', delta: 6.5, trend: 'up' },
    { key: 'orders', label: 'Заказы', value: sellerStats.orderCount, format: 'number', delta: 0, trend: 'flat' },
    { key: 'purchasesToday', label: 'Покупки за день', value: purchasesToday, format: 'number', delta: -2.1, trend: 'down' },
    { key: 'revenueToday', label: 'Оборот за день', value: revenueToday, format: 'currency', delta: 3.7, trend: 'up' },
  ]

  return {
    sellerCount: sellerStats.sellerCount,
    userCount: sellerStats.userCount,
    purchaseCount: sellerStats.purchaseCount,
    orderCount: sellerStats.orderCount,
    kpis,
  }
}


export type FinanceTransaction = {
  id: string
  type: 'sale' | 'refund' | 'payout'
  title: string
  user: string
  gross: number
  fee: number
  net: number
  status: string
  createdAt: string
}

const PERIOD_DAYS: Record<string, number> = { day: 1, week: 7, month: 30, all: 100000 }

export function getFinance(params: ListParams & { period?: string }) {
  const period = params.period && params.period in PERIOD_DAYS ? params.period : 'all'
  const windowDays = PERIOD_DAYS[period] ?? PERIOD_DAYS.all
  const since = NOW - windowDays * DAY

  const purchases = getPurchases().filter((p) => Date.parse(p.createdAt) >= since)

  const transactions: FinanceTransaction[] = purchases.map((p) => ({
    id: p.id,
    type: p.status === 'REFUNDED' ? 'refund' : 'sale',
    title: p.title,
    user: p.buyer,
    gross: p.price,
    fee: p.fee,
    net: p.price - p.fee,
    status: p.status,
    createdAt: p.createdAt,
  }))

  const paid = transactions.filter((t) => t.type === 'sale' && t.status === 'PAID')
  const refunds = transactions.filter((t) => t.type === 'refund')
  const totals = {
    gross: paid.reduce((s, t) => s + t.gross, 0),
    fee: paid.reduce((s, t) => s + t.fee, 0),
    net: paid.reduce((s, t) => s + t.net, 0),
    refunds: refunds.reduce((s, t) => s + t.gross, 0),
    payouts: getWithdrawals()
      .filter((w) => w.status === 'PAID' && Date.parse(w.createdAt) >= since)
      .reduce((s, w) => s + w.amount, 0),
    count: paid.length,
  }

  const filtered = applyFilters(transactions, params, {
    text: (t) => [t.title, t.user, t.id],
    status: (t) => t.status,
  })
  const page = paginate(filtered, params)

  return { period, totals, ...page }
}


export type ListParams = {
  page: number
  pageSize: number
  q: string
  status: string
  role: string
}

export type Accessors<T> = {
  text?: (row: T) => (string | number | null | undefined)[]
  status?: (row: T) => string
  role?: (row: T) => string
}

export function parseListParams(params: URLSearchParams): ListParams & { period?: string } {
  const page = Math.max(1, Number(params.get('page')) || 1)
  const pageSizeRaw = Number(params.get('pageSize')) || 20
  const pageSize = Math.min(100, Math.max(1, pageSizeRaw))
  return {
    page,
    pageSize,
    q: (params.get('q') ?? '').trim(),
    status: (params.get('status') ?? '').trim(),
    role: (params.get('role') ?? '').trim(),
    period: params.get('period') ?? undefined,
  }
}

export function applyFilters<T>(list: T[], params: ListParams, acc: Accessors<T>): T[] {
  let out = list

  if (params.q && acc.text) {
    const q = params.q.toLowerCase()
    out = out.filter((row) =>
      acc
        .text!(row)
        .filter((v) => v != null)
        .some((v) => String(v).toLowerCase().includes(q)),
    )
  }

  if (params.status && acc.status) {
    const s = params.status.toUpperCase()
    out = out.filter((row) => acc.status!(row).toUpperCase() === s)
  }

  if (params.role && acc.role) {
    const role = params.role.toUpperCase()
    out = out.filter((row) => acc.role!(row).toUpperCase() === role)
  }

  return out
}

export function paginate<T>(list: T[], params: ListParams): {
  items: T[]
  total: number
  page: number
  pageSize: number
} {
  const total = list.length
  const start = (params.page - 1) * params.pageSize
  return {
    items: list.slice(start, start + params.pageSize),
    total,
    page: params.page,
    pageSize: params.pageSize,
  }
}


export function filterAndPaginate<T>(list: T[], params: ListParams, acc: Accessors<T>) {
  return paginate(applyFilters(list, params, acc), params)
}
