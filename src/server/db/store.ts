

import authMe from '@/server/fixtures/auth/auth-me.json'
import usersPicker from '@/server/fixtures/auth/users-picker.json'
import resourcesFixture from '@/server/fixtures/resources.json'
import ordersFixture from '@/server/fixtures/orders.json'
import notificationsFixture from '@/server/fixtures/auth/notifications.json'
import siteNewsFixture from '@/server/fixtures/auth/site-news.json'


import offeringsFixture from '@/server/fixtures/subscriptions-offerings.json'
import chatSettingsFixture from '@/server/fixtures/auth/chat-settings.json'
import presenceFixture from '@/server/fixtures/auth/presence.json'
import sellerStats from '@/server/fixtures/auth/seller-stats.json'


import kassaFixture from '@/server/fixtures/auth/kassa.json'
import siteFeatureLocksFixture from '@/server/fixtures/site-feature-locks.json'


import {
  filterAndPaginate,
  getApplications as seedApplications,
  getBlacklist as seedBlacklist,
  getDeliveries as seedDeliveries,
  getOrders as seedAdminOrders,
  getPurchases as seedAdminPurchases,
  getResources as seedAdminResources,
  getSellers as seedAdminSellers,
  getUsers as seedAdminUsers,
  getWithdrawals as seedAdminWithdrawals,
  ROLE_CODES,
} from '@/server/adminData'
import type {
  AdminApplication,
  AdminBlacklistEntry,
  AdminDelivery,
  AdminOrder,
  AdminPurchase,
  AdminResource,
  AdminSeller,
  AdminUser,
  FinanceTransaction,
  ListParams,
  RoleCode,
  UserStatus,
} from '@/server/adminData'


const NOW_MS = Date.parse('2026-09-11T12:00:00.000Z')
const DAY_MS = 86_400_000
const SEED_NOW_ISO = new Date(NOW_MS).toISOString()


export interface SellerRating {
  count: number
  avg: number
}


export interface AuthMeFields {
  id: number
  email: string
  emailVerified: string | null
  name: string
  site: string | null
  pendingSite: string | null
  discordId: string | null
  discordDisplayName: string | null
  steamId: string | null
  steamDisplayName: string | null
  googleId: string | null
  googleDisplayName: string | null
  githubId: string | null
  githubLogin: string | null
  githubDisplayName: string | null
  telegramId: string | null
  telegramUsername: string | null
  telegramDisplayName: string | null
  status: number
  balance: number
  payable: number
  role: RoleCode
  roles: RoleCode[]
  language: string
  resourcesCount: number
  coOwnerResourcesCount: number
  verifiedSites: string[]
  personalSites: string[]
  legalAcceptedAt: string | null
  tourDoneAt: string | null
  resourceTourDoneAt: string | null
  hasPinSet: boolean
  notificationSoundEnabled: boolean
  purchaseSoundEnabled: boolean
  messagesSoundEnabled: boolean
  purchaseNotificationsEnabled: boolean
  saleNotificationsEnabled: boolean
  messageNotificationsEnabled: boolean
  purchaseNotificationsChannel: string
  purchaseNotificationsChannels: string[]
  messageNotificationsChannel: string
  messageNotificationsChannels: string[]
  image: string | null
}


export interface User extends AuthMeFields {

  sub: string
  sellerRating: SellerRating
  createdAt: string
}


export interface Resource {
  id: string
  slug: string
  title: string
  description: string
  shortDescription: string
  price: number
  discount: number
  category: string
  tags: string[]
  images: string[]
  coverImage: string
  authorId: number
  author: string
  authorRole: string
  status: string
  sales: number
  downloads: number
  listingKind: string
  uniqueViews: number
  deliverySource: string
  createdAt: string
  updatedAt: string | null
  lastBuyerUpdateAt: string | null
  buyerUpdatesCount: number
  createdWithAiTools: boolean
  reviewsCount: number
  rating: number
  authorReviewsCount: number
  authorRating: number
}

export interface ListingKindCounts {
  paid: number
  free: number
}


export interface Order {
  id: string
  title: string
  description: string
  budget: number
  deadline: string
  category: string
  status: string
  rawStatus: string
  displayPhase: string
  disputeActive: boolean
  client: string
  clientId: number
  seller: string | null
  sellerId: number | null
  amountFromPayment: number
  amountFromBalance: number
  responsesCount: number
  createdAt: string
  updatedAt: string
  sellerDeliveredAt: string | null
  clientConfirmedAt: string | null
  clientAvatarUrl: string | null
  clientSlug: string
}


export interface OrderResponse {
  id: string
  orderId: string
  sellerId: number
  seller: string
  message: string
  price: number
  createdAt: string
}

export interface Session {
  id: string
  userId: number
  createdAt: string
}

export interface AuthCode {
  email: string
  code: string
  expiresAt: number
}


export interface CartItem {
  resourceId: string
  quantity: number
  deferred: boolean
  addedAt: string
}


export interface CartLine {
  resourceId: string
  title: string
  price: number
  quantity: number
  deferred: boolean
}


export interface Purchase {
  id: string
  userId: number
  resourceId: string
  title: string
  price: number
  status: string
  createdAt: string
}


export type PaymentKind = 'deposit' | 'purchase'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED'

export interface Payment {
  id: string
  userId: number
  provider: string
  kind: PaymentKind
  amount: number
  currency: string
  status: PaymentStatus

  purchaseIds: string[]
  createdAt: string
  paidAt: string | null
}


export interface Withdrawal {
  id: string
  userId: number
  amount: number
  method: string
  methodDetails: string
  status: string
  createdAt: string
}


export interface Offering {
  id: string
  name: string
  periodMonths: number
  priceRubles: number
  trialDays: number
}


export interface Subscription {
  id: string
  offeringId: string
  status: string
  startedAt: string
  expiresAt: string
  remainDays: number
  autoRenew: boolean
  periodMonths: number
  priceRubles: number
}


export interface Notification {
  id: number
  userId: number
  type: string
  title: string
  body: string
  link: string
  isRead: boolean
  createdAt: string
}


export interface ChatSettings {
  directMessagesEnabled: boolean
  dmRequireDiscord: boolean
  dmOnlyVerifiedPlus: boolean
}


export interface Chat {
  id: string
  userId: number
  peerId: number
  peerName: string
  lastMessage: string
  unread: number
  active: boolean
  updatedAt: string
}


export interface Review {
  id: number
  reviewer: { name: string; role: string | null; id: number }
  context: {
    resourceId: string
    resourceSlug: string
    resourceTitle: string
    sellerLogin: string
    sellerRole: string | null
  }
  comment: string
  rating: number
  reply: string | null
  createdAt: string
  updatedAt: string | null
}


export interface SiteNewsItem {
  id: string
  title: string
  body: string
  createdAt: string
  authorId: number
  isRead: boolean
}


export interface KassaMethod {
  id: string
  name: string
  kassaName: string
  commissionMinPct: number
  commissionMaxPct: number
  minAmount: number
  maxAmount: number
  currency: string
  available: boolean
}


export interface PayoutProvider {
  provider: string
  name: string
  enabled: boolean
}


export interface SiteUserLocks {
  reviewsDisabled: boolean
  purchasesDisabled: boolean
  ordersDisabled: boolean
  withdrawalsDisabled: boolean
  resourceCreationDisabled: boolean
  paymentsDisabled: boolean
  chatDisabled: boolean
}


export interface SiteFeatureLocks {
  purchasesDisabled: boolean
  paymentsDisabled: boolean
  withdrawalsDisabled: boolean
  resourceCreationDisabled: boolean
  ordersDisabled: boolean
  legalRequisitesHidden: boolean
  userLocks: SiteUserLocks
}


export type SiteFeatureLocksPatch = Partial<Omit<SiteFeatureLocks, 'userLocks'>> & {
  userLocks?: Partial<SiteUserLocks>
}


interface AdminCaches {
  users: AdminUser[]
  sellers: AdminSeller[]
  orders: AdminOrder[]
  resources: AdminResource[]
  purchases: AdminPurchase[]
  withdrawals: AdminWithdrawal[]
  applications: AdminApplication[]
  blacklist: AdminBlacklistEntry[]
  deliveries: AdminDelivery[]
}

export type { AdminUser, AdminSeller, AdminOrder, AdminResource, AdminPurchase, AdminApplication, AdminBlacklistEntry, AdminDelivery, FinanceTransaction, ListParams, RoleCode }
type AdminWithdrawal = ReturnType<typeof seedAdminWithdrawals>[number]
export type { AdminWithdrawal }

export type AdminEntity =
  | 'users'
  | 'sellers'
  | 'orders'
  | 'resources'
  | 'purchases'
  | 'withdrawals'
  | 'applications'
  | 'blacklist'
  | 'deliveries'


export type AdminMutateEntity = AdminEntity | 'reviews' | 'payments'


interface StoreState {
  seededAt: string
  nextUserId: number
  nextNotificationId: number
  nextReviewId: number
  seq: number

  sessions: Map<string, Session>
  authCodes: Map<string, AuthCode>
  users: Map<number, User>

  pickerOrder: number[]

  resources: Resource[]
  listingKindCounts: ListingKindCounts

  orders: Order[]
  orderResponses: Map<string, OrderResponse[]>

  reviews: Review[]

  carts: Map<number, CartItem[]>
  purchases: Map<number, Purchase[]>
  payments: Map<string, Payment>
  withdrawals: Map<number, Withdrawal[]>
  subscriptions: Map<number, Subscription[]>
  trialUsedOfferingIds: Map<number, string[]>
  offerings: Offering[]

  notifications: Notification[]
  siteNews: SiteNewsItem[]

  chatSettings: Map<number, ChatSettings>
  chats: Map<number, Chat[]>
  presenceUsers: unknown[]


  kassaMethods: KassaMethod[]
  payoutProviders: PayoutProvider[]

  siteSettings: SiteFeatureLocks

  admin: AdminCaches | null
}


function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function normalizeRole(role: string | null | undefined): RoleCode {
  const up = String(role ?? '').toUpperCase()
  return (ROLE_CODES as readonly string[]).includes(up) ? (up as RoleCode) : 'NEWBIE'
}

function looksLikeEmail(s: string): boolean {
  return /@/.test(s) && /\./.test(s.split('@')[1] ?? '')
}

function randomId(): string {
  const g = globalThis as { crypto?: { randomUUID?: () => string } }
  if (g.crypto?.randomUUID) return g.crypto.randomUUID().replace(/-/g, '')
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}


function makeCode(): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let out = ''
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)]
  return out
}


function emptyProfile(overrides: Partial<User> & { id: number; name: string }): User {
  const base: User = {
    id: overrides.id,
    email: '',
    emailVerified: null,
    name: overrides.name,
    site: null,
    pendingSite: null,
    discordId: null,
    discordDisplayName: null,
    steamId: null,
    steamDisplayName: null,
    googleId: null,
    googleDisplayName: null,
    githubId: null,
    githubLogin: null,
    githubDisplayName: null,
    telegramId: null,
    telegramUsername: null,
    telegramDisplayName: null,
    status: 0,
    balance: 0,
    payable: 0,
    role: 'NEWBIE',
    roles: ['NEWBIE'],
    language: 'ru',
    resourcesCount: 0,
    coOwnerResourcesCount: 0,
    verifiedSites: [],
    personalSites: [],
    legalAcceptedAt: null,
    tourDoneAt: null,
    resourceTourDoneAt: null,
    hasPinSet: false,
    notificationSoundEnabled: true,
    purchaseSoundEnabled: true,
    messagesSoundEnabled: true,
    purchaseNotificationsEnabled: true,
    saleNotificationsEnabled: true,
    messageNotificationsEnabled: true,
    purchaseNotificationsChannel: 'email',
    purchaseNotificationsChannels: ['email'],
    messageNotificationsChannel: 'email',
    messageNotificationsChannels: ['email'],
    image: null,
    sub: '',
    sellerRating: { count: 0, avg: 0 },
    createdAt: SEED_NOW_ISO,
  }
  return { ...base, ...overrides }
}


function seed(): StoreState {

  const users = new Map<number, User>()


  const me = authMe.user as unknown as AuthMeFields
  const owner: User = {
    ...me,
    role: normalizeRole(me.role),
    roles: (Array.isArray(me.roles) ? me.roles : [me.role]).map(normalizeRole),
    sub: me.discordDisplayName ?? me.name,
    sellerRating: { count: 0, avg: 0 },
    createdAt: '2026-09-02T22:16:18.388Z',
  }
  users.set(owner.id, owner)


  const pickerOrder: number[] = []
  for (const p of usersPicker.users) {
    pickerOrder.push(p.id)
    if (users.has(p.id)) continue
    const sub = p.sub ?? ''
    users.set(
      p.id,
      emptyProfile({
        id: p.id,
        name: p.label,
        sub,
        email: looksLikeEmail(sub) ? sub : '',
        role: normalizeRole(p.role),
        roles: [normalizeRole(p.role)],
        image: p.avatarUrl ?? null,
        sellerRating: { count: p.sellerRating.count, avg: p.sellerRating.avg },
      }),
    )
  }


  for (const r of resourcesFixture.resources) {
    if (users.has(r.authorId)) continue
    const role = normalizeRole(r.authorRole)
    users.set(
      r.authorId,
      emptyProfile({
        id: r.authorId,
        name: r.author,
        sub: r.author,
        role,
        roles: [role],
        resourcesCount: 0,
        sellerRating: { count: r.authorReviewsCount ?? 0, avg: r.authorRating ?? 0 },
      }),
    )
  }


  const authoredCount = new Map<number, number>()
  for (const r of resourcesFixture.resources) {
    authoredCount.set(r.authorId, (authoredCount.get(r.authorId) ?? 0) + 1)
  }
  for (const [id, count] of authoredCount) {
    const u = users.get(id)

    if (u && u.id !== owner.id) u.resourcesCount = count
  }

  const nextUserId = Math.max(...users.keys(), 0) + 1


  const resources = clone(resourcesFixture.resources) as unknown as Resource[]
  const listingKindCounts = clone(resourcesFixture.listingKindCounts) as ListingKindCounts


  const orders = clone(ordersFixture.orders) as unknown as Order[]


  const reviews = buildReviews(resources)
  const nextReviewId = Math.max(0, ...reviews.map((r) => r.id)) + 1


  const notifications = clone(notificationsFixture.notifications) as unknown as Notification[]
  const nextNotificationId = Math.max(0, ...notifications.map((n) => n.id)) + 1


  const siteNews = clone(siteNewsFixture.items) as unknown as SiteNewsItem[]


  const offerings = clone(offeringsFixture.offerings) as unknown as Offering[]


  const chatSettings = new Map<number, ChatSettings>()
  chatSettings.set(owner.id, clone(chatSettingsFixture.settings) as ChatSettings)


  const kassaMethods: KassaMethod[] = (kassaFixture.methods as RawKassaMethod[]).map((m) => ({
    id: m.id,
    name: m.name,
    kassaName: m.kassaName,
    commissionMinPct: m.commissionMinPct,
    commissionMaxPct: m.commissionMaxPct,
    minAmount: m.minAmount,
    maxAmount: m.maxAmount,
    currency: m.currency,
    available: m.available,
  }))


  const payoutProviders: PayoutProvider[] = PAYOUT_PROVIDER_SEED.map((p) => ({
    provider: p.provider,
    name: p.name,
    enabled: true,
  }))


  const siteSettings = clone(siteFeatureLocksFixture) as SiteFeatureLocks

  return {
    seededAt: SEED_NOW_ISO,
    nextUserId,
    nextNotificationId,
    nextReviewId,
    seq: 1,
    sessions: new Map(),
    authCodes: new Map(),
    users,
    pickerOrder,
    resources,
    listingKindCounts,
    orders,
    orderResponses: new Map(),
    reviews,
    carts: new Map(),
    purchases: new Map(),
    payments: new Map(),
    withdrawals: new Map(),
    subscriptions: new Map(),
    trialUsedOfferingIds: new Map(),
    offerings,
    notifications,
    siteNews,
    chatSettings,
    chats: new Map(),
    presenceUsers: clone(presenceFixture.users) as unknown[],
    kassaMethods,
    payoutProviders,
    siteSettings,
    admin: null,
  }
}


interface RawKassaMethod {
  id: string
  name: string
  kassaName: string
  commissionMinPct: number
  commissionMaxPct: number
  minAmount: number
  maxAmount: number
  currency: string
  available: boolean
}


const PAYOUT_PROVIDER_SEED: readonly { provider: string; name: string }[] = [
  { provider: 'robokassa', name: 'Robokassa' },
  { provider: 'tbank', name: 'T-Bank' },
  { provider: 'anypay', name: 'AnyPay' },
  { provider: 'yookassa', name: 'YooKassa' },
  { provider: 'yoomoney', name: 'ЮMoney' },
  { provider: 'heleket', name: 'Heleket' },
  { provider: 'paypalych', name: 'PayPalych' },
  { provider: 'tome', name: 'Tome' },
  { provider: 'platega', name: 'Platega' },
]


const REVIEW_COMMENTS = [
  'Отличный ресурс, всё работает как описано. Рекомендую!',
  'Быстрая выдача, продавец на связи. Спасибо!',
  'Качественно сделано, есть мелкие недочёты, но в целом доволен.',
  'Всё супер, интеграция заняла пару минут.',
  'Хороший продукт за свои деньги.',
  'Работает стабильно, поддержка отвечает быстро.',
  '',
  'Немного не хватило документации, но функционал на месте.',
]
const REVIEW_REPLIES: (string | null)[] = [
  null,
  'Спасибо за отзыв!',
  'Рады, что всё подошло 🙌',
  null,
  'Обращайтесь ещё!',
]

function buildReviews(resources: Resource[]): Review[] {
  const reviewers = usersPicker.users
  const withReviews = resources.filter((r) => (r.reviewsCount ?? 0) > 0)
  const items: Review[] = []
  let id = 1
  for (let ri = 0; ri < withReviews.length; ri++) {
    const r = withReviews[ri]
    const count = Math.min(r.reviewsCount ?? 1, 6)
    for (let k = 0; k < count; k++) {
      const s = ri * 7 + k * 3
      const rev = reviewers[s % reviewers.length]
      const reply = REVIEW_REPLIES[s % REVIEW_REPLIES.length]
      const rating = Math.max(1, Math.min(5, Math.round((r.rating || 5) - (k % 2))))
      items.push({
        id: id++,
        reviewer: { name: rev.label, role: rev.role ?? null, id: rev.id },
        context: {
          resourceId: r.id,
          resourceSlug: r.slug,
          resourceTitle: r.title,
          sellerLogin: r.author,
          sellerRole: r.authorRole ?? null,
        },
        comment: REVIEW_COMMENTS[s % REVIEW_COMMENTS.length],
        rating,
        reply,
        createdAt: new Date(NOW_MS - (s + 1) * 3_600_000 * 13).toISOString(),
        updatedAt: reply ? new Date(NOW_MS - (s + 1) * 3_600_000 * 6).toISOString() : null,
      })
    }
  }
  return items
}


declare global {

  var __STELIX_STORE__: StoreState | undefined
}

const state: StoreState = globalThis.__STELIX_STORE__ ?? (globalThis.__STELIX_STORE__ = seed())


export function getState(): StoreState {
  return state
}


export function __resetStore(): void {
  globalThis.__STELIX_STORE__ = seed()
}

function nextSeq(): number {
  return state.seq++
}


export function serializeAuthMeUser(u: User): AuthMeFields {
  return {
    id: u.id,
    email: u.email,
    emailVerified: u.emailVerified,
    name: u.name,
    site: u.site,
    pendingSite: u.pendingSite,
    discordId: u.discordId,
    discordDisplayName: u.discordDisplayName,
    steamId: u.steamId,
    steamDisplayName: u.steamDisplayName,
    googleId: u.googleId,
    googleDisplayName: u.googleDisplayName,
    githubId: u.githubId,
    githubLogin: u.githubLogin,
    githubDisplayName: u.githubDisplayName,
    telegramId: u.telegramId,
    telegramUsername: u.telegramUsername,
    telegramDisplayName: u.telegramDisplayName,
    status: u.status,
    balance: u.balance,
    payable: u.payable,
    role: u.role,
    roles: u.roles,
    language: u.language,
    resourcesCount: u.resourcesCount,
    coOwnerResourcesCount: u.coOwnerResourcesCount,
    verifiedSites: u.verifiedSites,
    personalSites: u.personalSites,
    legalAcceptedAt: u.legalAcceptedAt,
    tourDoneAt: u.tourDoneAt,
    resourceTourDoneAt: u.resourceTourDoneAt,
    hasPinSet: u.hasPinSet,
    notificationSoundEnabled: u.notificationSoundEnabled,
    purchaseSoundEnabled: u.purchaseSoundEnabled,
    messagesSoundEnabled: u.messagesSoundEnabled,
    purchaseNotificationsEnabled: u.purchaseNotificationsEnabled,
    saleNotificationsEnabled: u.saleNotificationsEnabled,
    messageNotificationsEnabled: u.messageNotificationsEnabled,
    purchaseNotificationsChannel: u.purchaseNotificationsChannel,
    purchaseNotificationsChannels: u.purchaseNotificationsChannels,
    messageNotificationsChannel: u.messageNotificationsChannel,
    messageNotificationsChannels: u.messageNotificationsChannels,
    image: u.image,
  }
}

export interface PickerRow {
  id: number
  label: string
  sub: string
  role: RoleCode
  sellerRating: SellerRating
  avatarUrl: string | null
}


export function serializePickerRow(u: User): PickerRow {
  return {
    id: u.id,
    label: u.name,
    sub: u.sub,
    role: u.role,
    sellerRating: { count: u.sellerRating.count, avg: u.sellerRating.avg },
    avatarUrl: u.image,
  }
}


export const Sessions = {

  createSession(userId: number): string {
    const id = randomId()
    state.sessions.set(id, { id, userId, createdAt: new Date().toISOString() })
    return id
  },


  getUserIdBySession(sessionId: string | null | undefined): number | null {
    if (!sessionId) return null
    return state.sessions.get(sessionId)?.userId ?? null
  },


  deleteSession(sessionId: string | null | undefined): void {
    if (sessionId) state.sessions.delete(sessionId)
  },
}


export const AuthCodes = {

  setLoginCode(email: string): { code: string; expiresAt: number } {
    const key = email.trim().toLowerCase()
    const code = makeCode()
    const expiresAt = Date.now() + 10 * 60 * 1000
    state.authCodes.set(key, { email: key, code, expiresAt })
    return { code, expiresAt }
  },


  consumeLoginCode(email: string, code: string): boolean {
    const key = email.trim().toLowerCase()
    const entry = state.authCodes.get(key)
    const candidate = String(code ?? '').trim()
    if (entry) {
      if (Date.now() > entry.expiresAt) {
        state.authCodes.delete(key)
        return false
      }
      if (entry.code.toUpperCase() === candidate.toUpperCase()) {
        state.authCodes.delete(key)
        return true
      }
    }

    if (/^[A-Za-z0-9]{6}$/.test(candidate)) {
      state.authCodes.delete(key)
      return true
    }
    return false
  },


  findOrCreateUserByEmail(email: string): User {
    const norm = email.trim().toLowerCase()
    const staffRole = STAFF_EMAILS[norm]
    const existing = Users.getUserByEmail(email)
    if (existing) {
      if (staffRole && existing.role !== staffRole) {
        existing.role = staffRole
        existing.roles = [staffRole]
      }
      return existing
    }
    const id = state.nextUserId++
    const local = email.split('@')[0] || `user${id}`
    const now = new Date().toISOString()
    const user = emptyProfile({
      id,
      name: staffRole ? STAFF_NAMES[staffRole] : local,
      sub: norm,
      email: norm,
      emailVerified: now,
      createdAt: now,
    })
    if (staffRole) {
      user.role = staffRole
      user.roles = [staffRole]
    }
    state.users.set(id, user)
    return user
  },
}

const STAFF_EMAILS: Record<string, RoleCode> = {
  'admin@stelix.team': 'AGENT',
  'moderator@stelix.team': 'MODERATOR',
}
const STAFF_NAMES: Record<string, string> = {
  AGENT: 'Admin',
  MODERATOR: 'Moderator',
}


export interface ListUsersParams {
  q?: string
  role?: string

  staff?: boolean

  sellers?: boolean
  sellerTier?: boolean
  limit?: number

  picker?: boolean
}

const STAFF_ROLES: RoleCode[] = ['ACCOUNTANT', 'MODERATOR', 'SECURITY', 'DEVELOPER', 'AGENT']


const USER_STATUS_TO_NUM: Record<UserStatus, number> = { ACTIVE: 0, FROZEN: 1, BLOCKED: 2 }


export function isValidRole(role: string): role is RoleCode {
  return (ROLE_CODES as readonly string[]).includes(String(role).toUpperCase())
}

export const Users = {
  getUser(id: number): User | null {
    return state.users.get(id) ?? null
  },

  getUserByEmail(email: string): User | null {
    const key = email.trim().toLowerCase()
    for (const u of state.users.values()) {
      if (u.email && u.email.toLowerCase() === key) return u
    }
    return null
  },


  listUsers(params: ListUsersParams = {}): User[] {
    const q = (params.q ?? '').trim().toLowerCase()


    if (params.picker && !q && !params.staff && !params.sellers && !params.sellerTier && !params.role) {
      return state.pickerOrder
        .map((id) => state.users.get(id))
        .filter((u): u is User => Boolean(u))
    }

    let list = [...state.users.values()]

    if (params.staff) list = list.filter((u) => STAFF_ROLES.includes(u.role))
    if (params.sellers || params.sellerTier) {
      list = list.filter((u) => u.role === 'SELLER' || u.role === 'SELLER_PLUS')
    }
    if (params.role) {
      const role = normalizeRole(params.role)
      list = list.filter((u) => u.role === role)
    }
    if (q) {
      list = list.filter((u) =>
        [u.name, u.sub, u.email, String(u.id)]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(q)),
      )
    }

    list.sort((a, b) => b.id - a.id)
    if (params.limit && params.limit > 0) list = list.slice(0, params.limit)
    return list
  },


  updateUser(id: number, patch: Partial<User>): User | null {
    const u = state.users.get(id)
    if (!u) return null
    Object.assign(u, patch)
    return u
  },


  setRole(userId: number, role: string): User | null {
    const u = state.users.get(userId)
    if (!u) return null
    if (!isValidRole(role)) return null
    const code = String(role).toUpperCase() as RoleCode
    u.role = code
    u.roles = [code]
    return u
  },


  setStatus(userId: number, status: UserStatus): User | null {
    const u = state.users.get(userId)
    if (!u) return null
    const up = String(status).toUpperCase() as UserStatus
    if (!(up in USER_STATUS_TO_NUM)) return null
    u.status = USER_STATUS_TO_NUM[up]
    return u
  },

  serializeAuthMeUser,
  serializePickerRow,
}


export interface ListResourcesParams {
  listingKind?: string | null
  category?: string | null
  authorId?: string | number | null
  search?: string | null
  sort?: string | null
  page?: string | number | null
  pageSize?: number | null
}

const DEFAULT_RESOURCE_PAGE_SIZE = 24

export const Resources = {

  listResources(params: ListResourcesParams = {}): {
    resources: Resource[]
    listingKindCounts: ListingKindCounts
  } {
    let list = [...state.resources]

    if (params.listingKind) {
      const kind = String(params.listingKind).toUpperCase()
      list = list.filter((r) => r.listingKind === kind)
    }
    if (params.category) {
      list = list.filter((r) => r.category === params.category)
    }
    if (params.authorId != null && params.authorId !== '') {
      const id = Number(params.authorId)
      if (!Number.isNaN(id)) list = list.filter((r) => r.authorId === id)
    }
    if (params.search) {
      const query = String(params.search).trim().toLowerCase()
      if (query) {
        list = list.filter((r) =>
          [r.title, r.description, r.shortDescription]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(query)),
        )
      }
    }

    switch (params.sort) {
      case 'price_asc':
        list.sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        list.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        list.sort((a, b) => b.rating - a.rating)
        break
      case 'popular':
        list.sort((a, b) => b.sales - a.sales)
        break
      case 'newest':
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      default:
        break
    }

    if (params.page != null && params.page !== '') {
      const n = Math.max(1, Number(params.page) || 1)
      const size = params.pageSize && params.pageSize > 0 ? params.pageSize : DEFAULT_RESOURCE_PAGE_SIZE
      const start = (n - 1) * size
      list = list.slice(start, start + size)
    }

    return { resources: list, listingKindCounts: state.listingKindCounts }
  },

  getResourceBySlug(slug: string): Resource | null {
    return state.resources.find((r) => r.slug === slug) ?? null
  },

  getResourceById(id: string): Resource | null {
    return state.resources.find((r) => r.id === id) ?? null
  },


  findResource(idOrSlug: string): Resource | null {
    return (
      state.resources.find((r) => r.id === idOrSlug) ??
      state.resources.find((r) => r.slug === idOrSlug) ??
      null
    )
  },


  createResource(input: {
    title: string
    description?: string
    shortDescription?: string
    price: number
    discount?: number
    category: string
    tags?: string[]
    images?: string[]
    coverImage?: string
    authorId: number
    listingKind?: string
    deliverySource?: string
    createdWithAiTools?: boolean
    status?: string
  }): Resource {
    const author = state.users.get(input.authorId)
    const now = new Date().toISOString()
    const slugBase = input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    let slug = slugBase || `resource-${nextSeq()}`

    if (state.resources.some((r) => r.slug === slug)) slug = `${slug}-${nextSeq()}`
    const listingKind = (input.listingKind ?? 'PAID').toUpperCase()

    const resource: Resource = {
      id: `res_${randomId().slice(0, 20)}`,
      slug,
      title: input.title,
      description: input.description ?? '',
      shortDescription: input.shortDescription ?? input.description ?? '',
      price: input.price,
      discount: input.discount ?? input.price,
      category: input.category,
      tags: input.tags ?? [],
      images: input.images ?? [],
      coverImage: input.coverImage ?? '',
      authorId: input.authorId,
      author: author?.name ?? `user-${input.authorId}`,
      authorRole: author?.role ?? 'SELLER',

      status: input.status ?? 'PENDING',
      sales: 0,
      downloads: 0,
      listingKind,
      uniqueViews: 0,
      deliverySource: input.deliverySource ?? 'discord',
      createdAt: now,
      updatedAt: null,
      lastBuyerUpdateAt: null,
      buyerUpdatesCount: 0,
      createdWithAiTools: Boolean(input.createdWithAiTools),
      reviewsCount: 0,
      rating: 0,
      authorReviewsCount: author?.sellerRating.count ?? 0,
      authorRating: author?.sellerRating.avg ?? 0,
    }

    state.resources.unshift(resource)

    if (listingKind === 'FREE') state.listingKindCounts.free += 1
    else state.listingKindCounts.paid += 1
    if (author) author.resourcesCount += 1
    return resource
  },


  updateResource(
    idOrSlug: string,
    patch: Partial<
      Pick<
        Resource,
        | 'title'
        | 'description'
        | 'shortDescription'
        | 'price'
        | 'discount'
        | 'category'
        | 'tags'
        | 'images'
        | 'coverImage'
        | 'listingKind'
        | 'status'
      >
    >,
  ): Resource | null {
    const res = Resources.findResource(idOrSlug)
    if (!res) return null

    if (patch.title != null) res.title = String(patch.title)
    if (patch.description != null) res.description = String(patch.description)
    if (patch.shortDescription != null) res.shortDescription = String(patch.shortDescription)
    if (patch.price != null && Number.isFinite(Number(patch.price))) res.price = Number(patch.price)
    if (patch.discount != null && Number.isFinite(Number(patch.discount))) res.discount = Number(patch.discount)
    if (patch.category != null) res.category = String(patch.category)
    if (Array.isArray(patch.tags)) res.tags = patch.tags.map(String)
    if (Array.isArray(patch.images)) res.images = patch.images.map(String)
    if (patch.coverImage != null) res.coverImage = String(patch.coverImage)
    if (patch.status != null) res.status = String(patch.status)

    if (patch.listingKind != null) {
      const nextKind = String(patch.listingKind).toUpperCase()
      if (nextKind !== res.listingKind) {

        if (res.listingKind === 'FREE') state.listingKindCounts.free = Math.max(0, state.listingKindCounts.free - 1)
        else state.listingKindCounts.paid = Math.max(0, state.listingKindCounts.paid - 1)
        if (nextKind === 'FREE') state.listingKindCounts.free += 1
        else state.listingKindCounts.paid += 1
        res.listingKind = nextKind
      }
    }

    res.updatedAt = new Date().toISOString()
    return res
  },


  deleteResource(idOrSlug: string): boolean {
    const idx = state.resources.findIndex((r) => r.id === idOrSlug || r.slug === idOrSlug)
    if (idx === -1) return false
    const [removed] = state.resources.splice(idx, 1)
    if (removed.listingKind === 'FREE') state.listingKindCounts.free = Math.max(0, state.listingKindCounts.free - 1)
    else state.listingKindCounts.paid = Math.max(0, state.listingKindCounts.paid - 1)
    const author = state.users.get(removed.authorId)
    if (author && author.resourcesCount > 0) author.resourcesCount -= 1
    return removed != null
  },


  setStatus(idOrSlug: string, status: 'APPROVED' | 'REJECTED' | 'PENDING'): Resource | null {
    const up = String(status).toUpperCase()
    if (up !== 'APPROVED' && up !== 'REJECTED' && up !== 'PENDING') return null
    const res = Resources.findResource(idOrSlug)
    if (!res) return null
    res.status = up
    res.updatedAt = new Date().toISOString()
    return res
  },
}


function cartOf(userId: number): CartItem[] {
  let items = state.carts.get(userId)
  if (!items) {
    items = []
    state.carts.set(userId, items)
  }
  return items
}

export const Cart = {

  getCart(userId: number): { items: CartItem[] } {
    return { items: [...cartOf(userId)] }
  },


  addToCart(
    userId: number,
    resourceId: string,
    opts: { quantity?: number; deferred?: boolean } = {},
  ): { items: CartItem[]; added: number } {
    const items = cartOf(userId)
    const qty = opts.quantity && opts.quantity > 0 ? opts.quantity : 1
    const existing = items.find((i) => i.resourceId === resourceId)
    if (existing) {
      existing.quantity += qty
      if (opts.deferred != null) existing.deferred = opts.deferred
    } else {
      items.push({
        resourceId,
        quantity: qty,
        deferred: Boolean(opts.deferred),
        addedAt: new Date().toISOString(),
      })
    }
    return { items: [...items], added: qty }
  },


  removeFromCart(userId: number, resourceId: string): { items: CartItem[]; removed: boolean } {
    const items = cartOf(userId)
    const idx = items.findIndex((i) => i.resourceId === resourceId)
    if (idx === -1) return { items: [...items], removed: false }
    items.splice(idx, 1)
    return { items: [...items], removed: true }
  },


  clearCart(userId: number, bucket?: 'active' | 'deferred'): { items: CartItem[] } {
    if (!bucket) {
      state.carts.set(userId, [])
      return { items: [] }
    }
    const kept = cartOf(userId).filter((i) => (bucket === 'active' ? i.deferred : !i.deferred))
    state.carts.set(userId, kept)
    return { items: [...kept] }
  },


  cartSummary(userId: number): { lines: CartLine[]; activeUnits: number } {
    const items = cartOf(userId)
    const lines: CartLine[] = items.map((i) => {
      const res = Resources.getResourceById(i.resourceId)
      return {
        resourceId: i.resourceId,
        title: res?.title ?? '',
        price: res?.discount ?? res?.price ?? 0,
        quantity: i.quantity,
        deferred: i.deferred,
      }
    })
    const activeUnits = items.filter((i) => !i.deferred).reduce((s, i) => s + i.quantity, 0)
    return { lines, activeUnits }
  },
}


export interface ListOrdersParams {
  status?: string
  category?: string
  clientId?: number
  sellerId?: number
  search?: string
}

export const Orders = {

  listOrders(params: ListOrdersParams = {}): { orders: Order[] } {
    let list = [...state.orders]
    if (params.status) list = list.filter((o) => o.status === params.status || o.rawStatus === params.status)
    if (params.category) list = list.filter((o) => o.category === params.category)
    if (params.clientId != null) list = list.filter((o) => o.clientId === params.clientId)
    if (params.sellerId != null) list = list.filter((o) => o.sellerId === params.sellerId)
    if (params.search) {
      const q = params.search.trim().toLowerCase()
      list = list.filter((o) => [o.title, o.description].some((v) => v.toLowerCase().includes(q)))
    }
    return { orders: list }
  },

  getOrder(id: string): Order | null {
    return state.orders.find((o) => o.id === id) ?? null
  },


  createOrder(input: {
    title: string
    description?: string
    budget: number
    deadline?: string
    category?: string
    clientId: number
  }): Order {
    const client = state.users.get(input.clientId)
    const now = new Date().toISOString()
    const order: Order = {
      id: `ord_${randomId().slice(0, 20)}`,
      title: input.title,
      description: input.description ?? '',
      budget: input.budget,
      deadline: input.deadline ?? new Date(NOW_MS + 7 * DAY_MS).toISOString(),
      category: input.category ?? 'other',

      status: 'open',
      rawStatus: 'OPEN',
      displayPhase: 'open',
      disputeActive: false,
      client: client?.name ?? `user-${input.clientId}`,
      clientId: input.clientId,
      seller: null,
      sellerId: null,
      amountFromPayment: 0,
      amountFromBalance: 0,
      responsesCount: 0,
      createdAt: now,
      updatedAt: now,
      sellerDeliveredAt: null,
      clientConfirmedAt: null,
      clientAvatarUrl: client?.image ?? null,
      clientSlug: `user-${input.clientId}`,
    }
    state.orders.unshift(order)
    return order
  },


  addOrderResponse(
    orderId: string,
    input: { sellerId: number; message?: string; price?: number },
  ): { order: Order; response: OrderResponse } | null {
    const order = state.orders.find((o) => o.id === orderId)
    if (!order) return null
    const seller = state.users.get(input.sellerId)
    const response: OrderResponse = {
      id: `orr_${randomId().slice(0, 16)}`,
      orderId,
      sellerId: input.sellerId,
      seller: seller?.name ?? `user-${input.sellerId}`,
      message: input.message ?? '',
      price: input.price ?? order.budget,
      createdAt: new Date().toISOString(),
    }
    const list = state.orderResponses.get(orderId) ?? []
    list.push(response)
    state.orderResponses.set(orderId, list)
    order.responsesCount = list.length
    order.updatedAt = response.createdAt
    return { order, response }
  },

  listOrderResponses(orderId: string): OrderResponse[] {
    return [...(state.orderResponses.get(orderId) ?? [])]
  },
}


export const Balance = {

  getBalance(userId: number): { balance: number; payable: number } {
    const u = state.users.get(userId)
    return { balance: u?.balance ?? 0, payable: u?.payable ?? 0 }
  },


  adjustBalance(
    userId: number,
    deltaBalance: number,
    deltaPayable = 0,
  ): { balance: number; payable: number } {
    const u = state.users.get(userId)
    if (!u) return { balance: 0, payable: 0 }
    u.balance += deltaBalance
    u.payable += deltaPayable
    return { balance: u.balance, payable: u.payable }
  },


  setBalance(
    userId: number,
    values: { balance?: number; payable?: number },
  ): { balance: number; payable: number } {
    const u = state.users.get(userId)
    if (!u) return { balance: 0, payable: 0 }
    if (values.balance != null && Number.isFinite(Number(values.balance))) u.balance = Number(values.balance)
    if (values.payable != null && Number.isFinite(Number(values.payable))) u.payable = Number(values.payable)
    return { balance: u.balance, payable: u.payable }
  },
}


function purchasesOf(userId: number): Purchase[] {
  let list = state.purchases.get(userId)
  if (!list) {
    list = []
    state.purchases.set(userId, list)
  }
  return list
}

export const Purchases = {

  listPurchases(userId: number): { purchases: Purchase[] } {
    return { purchases: [...purchasesOf(userId)] }
  },


  checkout(
    userId: number,
    opts: { resourceIds?: string[] } = {},
  ): { ok: boolean; purchases: Purchase[]; total: number; error?: string; required?: number; balance?: number } {
    const cart = state.carts.get(userId) ?? []
    const targetIds = opts.resourceIds
      ? new Set(opts.resourceIds)
      : new Set(cart.filter((i) => !i.deferred).map((i) => i.resourceId))


    const lines: Array<{ res: Resource; unitPrice: number }> = []
    let total = 0
    for (const item of cart) {
      if (!targetIds.has(item.resourceId)) continue
      const res = Resources.getResourceById(item.resourceId)
      if (!res) continue
      const unitPrice = res.discount ?? res.price
      for (let n = 0; n < item.quantity; n++) {
        lines.push({ res, unitPrice })
        total += unitPrice
      }
    }

    const buyer = state.users.get(userId)
    if (!buyer) return { ok: false, purchases: [], total, error: 'unauthorized' }


    if (buyer.balance < total) {
      return { ok: false, purchases: [], total, error: 'insufficient_balance', required: total, balance: buyer.balance }
    }

    const now = new Date().toISOString()
    const created: Purchase[] = []
    buyer.balance -= total
    for (const { res, unitPrice } of lines) {
      const purchase: Purchase = {
        id: `pur_${randomId().slice(0, 16)}`,
        userId,
        resourceId: res.id,
        title: res.title,
        price: unitPrice,
        status: 'PAID',
        createdAt: now,
      }
      purchasesOf(userId).push(purchase)
      created.push(purchase)
      res.sales += 1

      Balance.adjustBalance(res.authorId, 0, unitPrice)
    }


    state.carts.set(
      userId,
      cart.filter((i) => !targetIds.has(i.resourceId)),
    )

    return { ok: true, purchases: created, total, balance: buyer.balance }
  },
}


function settlePurchaseById(purchaseId: string): void {
  for (const list of state.purchases.values()) {
    const purchase = list.find((p) => p.id === purchaseId)
    if (!purchase) continue
    if (purchase.status !== 'PAID') {
      purchase.status = 'PAID'
      const res = Resources.getResourceById(purchase.resourceId)
      if (res) Balance.adjustBalance(res.authorId, 0, purchase.price)
    }
    return
  }
}

export const Payments = {

  createPayment(input: {
    id?: string
    userId: number
    provider: string
    kind?: PaymentKind
    amount: number
    currency?: string
    purchaseIds?: string[]
  }): Payment {
    const id = input.id ?? `pay_${randomId().slice(0, 20)}`
    const payment: Payment = {
      id,
      userId: input.userId,
      provider: input.provider.toLowerCase(),
      kind: input.kind ?? 'deposit',
      amount: input.amount,
      currency: (input.currency ?? 'RUB').toUpperCase(),
      status: 'PENDING',
      purchaseIds: input.purchaseIds ? [...input.purchaseIds] : [],
      createdAt: new Date().toISOString(),
      paidAt: null,
    }
    state.payments.set(id, payment)
    return payment
  },

  getPayment(id: string): Payment | null {
    return state.payments.get(id) ?? null
  },


  confirmPayment(
    paymentId: string,
    provider?: string,
  ): { ok: true; payment: Payment; balance: number; payable: number } | null {
    const payment = state.payments.get(paymentId)
    if (!payment) return null
    if (provider) payment.provider = provider.toLowerCase()

    if (payment.status !== 'PAID') {
      if (payment.kind === 'purchase') {
        for (const pid of payment.purchaseIds) settlePurchaseById(pid)
      } else if (payment.amount > 0) {

        Balance.adjustBalance(payment.userId, payment.amount)
      }
      payment.status = 'PAID'
      payment.paidAt = new Date().toISOString()
    }

    const { balance, payable } = Balance.getBalance(payment.userId)
    return { ok: true, payment, balance, payable }
  },


  settlePurchaseForUser(
    userId: number,
    purchaseId: string,
  ): { ok: boolean; balance: number; payable: number } {
    const purchase = (state.purchases.get(userId) ?? []).find((p) => p.id === purchaseId)
    if (purchase && purchase.status !== 'PAID') {
      purchase.status = 'PAID'
      const res = Resources.getResourceById(purchase.resourceId)
      if (res) Balance.adjustBalance(res.authorId, 0, purchase.price)
    }
    const { balance, payable } = Balance.getBalance(userId)
    return { ok: Boolean(purchase), balance, payable }
  },


  failPayment(paymentId: string): Payment | null {
    const payment = state.payments.get(paymentId)
    if (!payment) return null
    if (payment.status === 'PENDING') payment.status = 'FAILED'
    return payment
  },
}


export const Kassas = {

  listMethods(): KassaMethod[] {
    return state.kassaMethods.map((m) => ({ ...m }))
  },

  getMethod(id: string): KassaMethod | null {
    return state.kassaMethods.find((m) => m.id === id) ?? null
  },


  setMethodAvailable(id: string, available?: boolean): KassaMethod | null {
    const method = state.kassaMethods.find((m) => m.id === id)
    if (!method) return null
    method.available = available == null ? !method.available : Boolean(available)
    return { ...method }
  },


  listPayouts(): PayoutProvider[] {
    return state.payoutProviders.map((p) => ({ ...p }))
  },

  getPayout(provider: string): PayoutProvider | null {
    const slug = String(provider).toLowerCase()
    return state.payoutProviders.find((p) => p.provider === slug) ?? null
  },


  setPayoutEnabled(provider: string, enabled?: boolean): PayoutProvider | null {
    const slug = String(provider).toLowerCase()
    const row = state.payoutProviders.find((p) => p.provider === slug)
    if (!row) return null
    row.enabled = enabled == null ? !row.enabled : Boolean(enabled)
    return { ...row }
  },
}


export const SiteSettings = {

  get(): SiteFeatureLocks {
    return clone(state.siteSettings)
  },


  set(patch: SiteFeatureLocksPatch): SiteFeatureLocks {
    const s = state.siteSettings
    const { userLocks, ...globals } = patch
    for (const [key, value] of Object.entries(globals)) {
      if (typeof value === 'boolean') {
        ;(s as unknown as Record<string, unknown>)[key] = value
      }
    }
    if (userLocks) {
      for (const [key, value] of Object.entries(userLocks)) {
        if (typeof value === 'boolean' && key in s.userLocks) {
          ;(s.userLocks as unknown as Record<string, unknown>)[key] = value
        }
      }
    }
    return clone(s)
  },
}


function withdrawalsOf(userId: number): Withdrawal[] {
  let list = state.withdrawals.get(userId)
  if (!list) {
    list = []
    state.withdrawals.set(userId, list)
  }
  return list
}

export const Withdrawals = {

  listWithdrawals(userId: number): { withdrawals: Withdrawal[] } {
    return { withdrawals: [...withdrawalsOf(userId)] }
  },


  createWithdrawal(
    userId: number,
    input: { amount: number; method: string; methodDetails?: string },
  ): Withdrawal | null {
    const u = state.users.get(userId)
    if (!u || input.amount <= 0 || u.payable < input.amount) return null
    u.payable -= input.amount
    const withdrawal: Withdrawal = {
      id: `wd_${randomId().slice(0, 16)}`,
      userId,
      amount: input.amount,
      method: input.method,
      methodDetails: input.methodDetails ?? '',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    }
    withdrawalsOf(userId).push(withdrawal)
    return withdrawal
  },
}


export const Subscriptions = {

  getOfferings(): { offerings: Offering[] } {
    return { offerings: [...state.offerings] }
  },


  getMemberships(userId: number): {
    subscriptions: Subscription[]
    offerings: Offering[]
    trialUsedOfferingIds: string[]
  } {
    return {
      subscriptions: [...(state.subscriptions.get(userId) ?? [])],
      offerings: [...state.offerings],
      trialUsedOfferingIds: [...(state.trialUsedOfferingIds.get(userId) ?? [])],
    }
  },


  createOffering(input: {
    name: string
    category?: string
    shortDescription?: string
    description?: string
    cardColor?: string | null
    trialDays?: number
    plans?: Array<{ periodMonths: number; priceRubles: number }>
    webhook?: { method?: string; url?: string; apiKey?: string; params?: string[] }
  }): { offering: Offering; offerings: Offering[] } {
    const name = String(input.name ?? '').trim() || 'Новый сервис'
    const trialDays = Number.isFinite(Number(input.trialDays)) ? Math.max(0, Math.round(Number(input.trialDays))) : 0
    const rawPlans =
      Array.isArray(input.plans) && input.plans.length > 0
        ? input.plans
        : [{ periodMonths: 1, priceRubles: 0 }]
    const created: Offering[] = rawPlans.map((p) => ({
      id: `off_${randomId().slice(0, 20)}`,
      name,
      periodMonths: Math.max(1, Math.round(Number(p.periodMonths) || 1)),
      priceRubles: Math.max(0, Math.round(Number(p.priceRubles) || 0)),
      trialDays,
    }))
    state.offerings.push(...created)
    return { offering: created[0], offerings: created }
  },


  subscribe(
    userId: number,
    offeringId: string,
    opts: { autoRenew?: boolean; trial?: boolean } = {},
  ): { subscription: Subscription } {
    const offering = state.offerings.find((o) => o.id === offeringId)
    const periodMonths = offering?.periodMonths ?? 1
    const priceRubles = offering?.priceRubles ?? 0
    const now = Date.now()
    const expires = now + periodMonths * 30 * DAY_MS
    const subscription: Subscription = {
      id: `sub_${randomId().slice(0, 16)}`,
      offeringId,
      status: 'active',
      startedAt: new Date(now).toISOString(),
      expiresAt: new Date(expires).toISOString(),
      remainDays: periodMonths * 30,
      autoRenew: Boolean(opts.autoRenew),
      periodMonths,
      priceRubles,
    }
    const list = state.subscriptions.get(userId) ?? []
    list.push(subscription)
    state.subscriptions.set(userId, list)

    if (opts.trial) {
      const used = state.trialUsedOfferingIds.get(userId) ?? []
      if (!used.includes(offeringId)) used.push(offeringId)
      state.trialUsedOfferingIds.set(userId, used)
    }
    return { subscription }
  },


  setAutoRenew(userId: number, subscriptionId: string, autoRenew: boolean): Subscription | null {
    const sub = (state.subscriptions.get(userId) ?? []).find((s) => s.id === subscriptionId)
    if (!sub) return null
    sub.autoRenew = autoRenew
    return sub
  },
}


export interface ListNotificationsParams {
  userId: number
  unread?: boolean
}

export const Notifications = {

  listNotifications(params: ListNotificationsParams): {
    notifications: Notification[]
    total: number
    hasMore: boolean
  } {
    const mine = state.notifications
      .filter((n) => n.userId === params.userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    const list = params.unread ? mine.filter((n) => !n.isRead) : mine
    return { notifications: list, total: list.length, hasMore: false }
  },


  markNotificationsRead(userId: number, ids?: number[]): { ok: true; updated: number } {
    const idSet = ids && ids.length ? new Set(ids) : null
    let updated = 0
    for (const n of state.notifications) {
      if (n.userId !== userId) continue
      if (idSet && !idSet.has(n.id)) continue
      if (!n.isRead) {
        n.isRead = true
        updated++
      }
    }
    return { ok: true, updated }
  },


  createNotification(input: {
    userId: number
    type: string
    title: string
    body: string
    link: string
  }): Notification {
    const notification: Notification = {
      id: state.nextNotificationId++,
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link,
      isRead: false,
      createdAt: new Date().toISOString(),
    }
    state.notifications.unshift(notification)
    return notification
  },
}


export const Reviews = {

  listReviewsByResource(resourceId: string): Review[] {
    return state.reviews.filter((r) => r.context.resourceId === resourceId)
  },


  listAllReviews(): { items: Review[]; total: number } {
    return { items: [...state.reviews], total: state.reviews.length }
  },


  createReview(input: {
    resourceId: string
    reviewerId: number
    rating: number
    comment?: string
  }): Review | null {
    const res = Resources.getResourceById(input.resourceId)
    if (!res) return null
    const reviewer = state.users.get(input.reviewerId)
    const review: Review = {
      id: state.nextReviewId++,
      reviewer: {
        name: reviewer?.name ?? `user-${input.reviewerId}`,
        role: reviewer?.role ?? null,
        id: input.reviewerId,
      },
      context: {
        resourceId: res.id,
        resourceSlug: res.slug,
        resourceTitle: res.title,
        sellerLogin: res.author,
        sellerRole: res.authorRole ?? null,
      },
      comment: input.comment ?? '',
      rating: Math.max(1, Math.min(5, Math.round(input.rating))),
      reply: null,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    }
    state.reviews.push(review)
    recomputeResourceRating(res.id)
    return review
  },


  deleteReview(id: number): boolean {
    const idx = state.reviews.findIndex((r) => r.id === id)
    if (idx === -1) return false
    const [removed] = state.reviews.splice(idx, 1)
    recomputeResourceRating(removed.context.resourceId)
    return true
  },


  replyToReview(id: number, reply: string): Review | null {
    const review = state.reviews.find((r) => r.id === id)
    if (!review) return null
    review.reply = reply
    review.updatedAt = new Date().toISOString()
    return review
  },
}

function recomputeResourceRating(resourceId: string): void {
  const res = Resources.getResourceById(resourceId)
  if (!res) return
  const forRes = state.reviews.filter((r) => r.context.resourceId === resourceId)
  res.reviewsCount = forRes.length
  res.rating = forRes.length
    ? Math.round((forRes.reduce((s, r) => s + r.rating, 0) / forRes.length) * 100) / 100
    : 0
}


const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  directMessagesEnabled: true,
  dmRequireDiscord: false,
  dmOnlyVerifiedPlus: false,
}

export const Chat = {

  listChats(userId: number): {
    chats: Chat[]
    total: number
    hasMore: boolean
    totalUnread: number
    totalActive: number
  } {
    const chats = [...(state.chats.get(userId) ?? [])]
    return {
      chats,
      total: chats.length,
      hasMore: false,
      totalUnread: chats.reduce((s, c) => s + c.unread, 0),
      totalActive: chats.filter((c) => c.active).length,
    }
  },


  getChatSettings(userId: number): { settings: ChatSettings } {
    return { settings: { ...(state.chatSettings.get(userId) ?? DEFAULT_CHAT_SETTINGS) } }
  },


  updateChatSettings(userId: number, patch: Partial<ChatSettings>): { settings: ChatSettings } {
    const current = state.chatSettings.get(userId) ?? { ...DEFAULT_CHAT_SETTINGS }
    const next = { ...current, ...patch }
    state.chatSettings.set(userId, next)
    return { settings: next }
  },


  presence(): { users: unknown[] } {
    return { users: [...state.presenceUsers] }
  },
}


function ensureAdmin(): AdminCaches {
  if (state.admin) return state.admin


  const cache: AdminCaches = {
    users: seedAdminUsers().map((u) => ({ ...u })),
    sellers: seedAdminSellers().map((s) => ({ ...s })),
    orders: seedAdminOrders().map((o) => ({ ...o })),
    resources: seedAdminResources().map((r) => ({ ...r })),
    purchases: seedAdminPurchases().map((p) => ({ ...p })),
    withdrawals: seedAdminWithdrawals().map((w) => ({ ...w })),
    applications: seedApplications().map((a) => ({ ...a })),
    blacklist: seedBlacklist().map((b) => ({ ...b })),
    deliveries: seedDeliveries().map((d) => ({ ...d })),
  }
  state.admin = cache
  return cache
}


type TextAccessor<T> = (row: T) => (string | number | null | undefined)[]

interface EntityAccess<T> {
  rows(): T[]
  text: TextAccessor<T>
  status?: (row: T) => string
  role?: (row: T) => string
}

function entityAccess(entity: AdminEntity): EntityAccess<Record<string, unknown>> {
  const admin = ensureAdmin()
  switch (entity) {
    case 'users':
      return {
        rows: () => admin.users as unknown as Record<string, unknown>[],
        text: (r) => [r.name as string, r.email as string, r.handle as string, r.id as number],
        status: (r) => String(r.status),
        role: (r) => String(r.role),
      }
    case 'sellers':
      return {
        rows: () => admin.sellers as unknown as Record<string, unknown>[],
        text: (r) => [r.name as string, r.id as number],
        status: (r) => String(r.status),
        role: (r) => String(r.role),
      }
    case 'orders':
      return {
        rows: () => admin.orders as unknown as Record<string, unknown>[],
        text: (r) => [r.title as string, r.customer as string, r.executor as string, r.id as string],
        status: (r) => String(r.status),
      }
    case 'resources':
      return {
        rows: () => admin.resources as unknown as Record<string, unknown>[],
        text: (r) => [r.title as string, r.author as string, r.id as string],
        status: (r) => String(r.status),
        role: (r) => String(r.authorRole),
      }
    case 'purchases':
      return {
        rows: () => admin.purchases as unknown as Record<string, unknown>[],
        text: (r) => [r.title as string, r.buyer as string, r.id as string],
        status: (r) => String(r.status),
      }
    case 'withdrawals':
      return {
        rows: () => admin.withdrawals as unknown as Record<string, unknown>[],
        text: (r) => [r.identity as string, r.email as string, r.methodDetails as string, r.id as string],
        status: (r) => String(r.status),
        role: (r) => String(r.role),
      }
    case 'applications':
      return {
        rows: () => admin.applications as unknown as Record<string, unknown>[],
        text: (r) => [r.identity as string, r.email as string, r.id as string],
        status: (r) => String(r.status),
        role: (r) => String(r.role),
      }
    case 'blacklist':
      return {
        rows: () => admin.blacklist as unknown as Record<string, unknown>[],
        text: (r) => [r.identity as string, r.site as string, r.social as string],
        role: (r) => String(r.role),
      }
    case 'deliveries':
      return {
        rows: () => admin.deliveries as unknown as Record<string, unknown>[],
        text: (r) => [r.user as string, r.resource as string, r.details as string, r.id as string],
      }
    default: {
      const _exhaustive: never = entity
      throw new Error(`Unknown admin entity: ${String(_exhaustive)}`)
    }
  }
}

const PERIOD_DAYS: Record<string, number> = { day: 1, week: 7, month: 30, all: 100000 }


function mirrorStatus(entity: AdminMutateEntity, row: Record<string, unknown>): void {
  const status = String(row.status).toUpperCase()
  if (entity === 'resources') {
    if (status === 'APPROVED' || status === 'REJECTED' || status === 'PENDING') {
      Resources.setStatus(String(row.id), status)
    }
  } else if (entity === 'users') {
    if (status === 'ACTIVE' || status === 'BLOCKED' || status === 'FROZEN') {
      Users.setStatus(Number(row.id), status as UserStatus)
    }
  }
}


function grantSeller(appRow: Record<string, unknown>): void {
  const userId = Number(appRow.userId)
  if (!Number.isFinite(userId)) return
  Users.setRole(userId, 'SELLER')
  const admin = ensureAdmin()
  const u = admin.users.find((x) => x.id === userId)
  if (u) u.role = 'SELLER'
}

export const Admin = {

  adminList(
    entity: AdminEntity,
    params: ListParams,
  ): { items: Record<string, unknown>[]; total: number; page: number; pageSize: number } {
    const acc = entityAccess(entity)
    return filterAndPaginate(acc.rows(), params, {
      text: acc.text,
      status: acc.status,
      role: acc.role,
    })
  },


  adminMutate(
    entity: AdminMutateEntity,
    id: string | number,
    action: string,
    data: Record<string, unknown> = {},
  ): { ok: boolean; item?: Record<string, unknown>; id?: string | number } {

    if (entity === 'reviews') {
      const reviewId = Number(id)
      if (action === 'delete' || action === 'remove') {
        return Reviews.deleteReview(reviewId) ? { ok: true, id } : { ok: false }
      }
      if (action === 'reply') {
        const updated = Reviews.replyToReview(reviewId, String(data.reply ?? ''))
        return updated ? { ok: true, item: updated as unknown as Record<string, unknown> } : { ok: false }
      }
      return { ok: false }
    }


    if (entity === 'payments') {
      if (action === 'toggleMethod' || action === 'setMethodAvailable') {
        const available = data.available == null ? undefined : Boolean(data.available)
        const method = Kassas.setMethodAvailable(String(id), available)
        return method ? { ok: true, item: method as unknown as Record<string, unknown> } : { ok: false }
      }
      if (action === 'togglePayout' || action === 'setPayoutEnabled') {
        const enabled = data.enabled == null ? undefined : Boolean(data.enabled)
        const payout = Kassas.setPayoutEnabled(String(id), enabled)
        return payout ? { ok: true, item: payout as unknown as Record<string, unknown> } : { ok: false }
      }
      return { ok: false }
    }


    if (entity === 'blacklist' && (action === 'add' || action === 'create')) {
      const admin = ensureAdmin()
      const nextId = admin.blacklist.reduce((max, b) => Math.max(max, b.id), 0) + 1
      const now = new Date().toISOString()
      const roleRaw = String(data.role ?? '')
      const entry: AdminBlacklistEntry = {
        id: nextId,
        identity: String(data.identity ?? ''),
        role: (isValidRole(roleRaw) ? roleRaw.toUpperCase() : 'NEWBIE') as RoleCode,
        site: String(data.site ?? '—'),
        social: String(data.social ?? '—'),
        createdAt: now,
        updatedAt: now,
      }
      admin.blacklist.unshift(entry)
      return { ok: true, item: entry as unknown as Record<string, unknown> }
    }

    const acc = entityAccess(entity)
    const rows = acc.rows()
    const idx = rows.findIndex((r) => String(r.id) === String(id))
    if (idx === -1) return { ok: false }
    const row = rows[idx]

    switch (action) {
      case 'delete':
      case 'remove':
        rows.splice(idx, 1)

        if (entity === 'resources') Resources.deleteResource(String(row.id))
        return { ok: true, id }

      case 'setStatus':
        row.status = String(data.status ?? row.status)
        mirrorStatus(entity, row)
        break

      case 'setRole':
      case 'role':
      case 'role-change':
      case 'roleChange': {
        const role = String(data.role ?? row.role)
        row.role = role
        if (entity === 'users' && isValidRole(role)) Users.setRole(Number(row.id), role)
        break
      }

      case 'block':
        row.status = 'BLOCKED'
        if (entity === 'users') Users.setStatus(Number(row.id), 'BLOCKED')
        break
      case 'unblock':
        row.status = 'ACTIVE'
        if (entity === 'users') Users.setStatus(Number(row.id), 'ACTIVE')
        break
      case 'freeze':
        row.status = 'FROZEN'
        if (entity === 'users') Users.setStatus(Number(row.id), 'FROZEN')
        break

      case 'balance': {

        const balance = data.balance != null && Number.isFinite(Number(data.balance)) ? Number(data.balance) : undefined
        const payable = data.payable != null && Number.isFinite(Number(data.payable)) ? Number(data.payable) : undefined
        if (balance != null) row.balance = balance
        if (payable != null) row.payable = payable
        if (entity === 'users') Balance.setBalance(Number(row.id), { balance, payable })
        break
      }
      case 'adjust': {

        const dBalance = Number(data.balance ?? data.amount ?? 0) || 0
        const dPayable = Number(data.payable ?? 0) || 0
        row.balance = (Number(row.balance) || 0) + dBalance
        row.payable = (Number(row.payable) || 0) + dPayable
        if (entity === 'users') Balance.adjustBalance(Number(row.id), dBalance, dPayable)
        break
      }
      case 'impersonate':


        return { ok: true, item: row }

      case 'approve':
        if (entity === 'applications') {
          row.status = 'APPROVED'
          grantSeller(row)
        } else {


          row.status = entity === 'withdrawals' ? 'PROCESSING' : 'APPROVED'
          mirrorStatus(entity, row)
        }
        break
      case 'reject':
        row.status = 'REJECTED'
        mirrorStatus(entity, row)
        break
      case 'dispatch':

        row.status = 'PROCESSING'
        break
      case 'markPaid':
        row.status = 'PAID'
        break
      case 'refund':
        row.status = 'REFUNDED'
        break

      case 'feature':


        row.featured = data.featured == null ? !row.featured : Boolean(data.featured)
        break

      case 'edit':
      case 'update':
        Object.assign(row, data)

        if (entity === 'resources') Resources.updateResource(String(row.id), data as Partial<Resource>)
        break

      default:

        Object.assign(row, data)
        break
    }
    row.updatedAt = new Date().toISOString()
    return { ok: true, item: row }
  },


  adminStats(): {
    sellerCount: number
    userCount: number
    purchaseCount: number
    orderCount: number
    kpis: {
      key: string
      label: string
      value: number
      format: 'number' | 'currency'
      delta: number
      trend: 'up' | 'down' | 'flat'
    }[]
  } {
    const admin = ensureAdmin()
    const dayAgo = NOW_MS - DAY_MS
    const purchasesToday = admin.purchases.filter((p) => Date.parse(p.createdAt) >= dayAgo).length
    const revenueToday = admin.purchases
      .filter((p) => p.status === 'PAID' && Date.parse(p.createdAt) >= dayAgo)
      .reduce((s, p) => s + p.price, 0)

    return {
      sellerCount: sellerStats.sellerCount,
      userCount: sellerStats.userCount,
      purchaseCount: sellerStats.purchaseCount,
      orderCount: sellerStats.orderCount,
      kpis: [
        { key: 'users', label: 'Пользователи', value: sellerStats.userCount, format: 'number', delta: 4.2, trend: 'up' },
        { key: 'sellers', label: 'Продавцы', value: sellerStats.sellerCount, format: 'number', delta: 1.8, trend: 'up' },
        { key: 'purchases', label: 'Покупки', value: sellerStats.purchaseCount, format: 'number', delta: 6.5, trend: 'up' },
        { key: 'orders', label: 'Заказы', value: sellerStats.orderCount, format: 'number', delta: 0, trend: 'flat' },
        { key: 'purchasesToday', label: 'Покупки за день', value: purchasesToday, format: 'number', delta: -2.1, trend: 'down' },
        { key: 'revenueToday', label: 'Оборот за день', value: revenueToday, format: 'currency', delta: 3.7, trend: 'up' },
      ],
    }
  },


  adminFinance(params: ListParams & { period?: string }): {
    period: string
    totals: { gross: number; fee: number; net: number; refunds: number; payouts: number; count: number }
    items: FinanceTransaction[]
    total: number
    page: number
    pageSize: number
  } {
    const admin = ensureAdmin()
    const period = params.period && params.period in PERIOD_DAYS ? params.period : 'all'
    const since = NOW_MS - (PERIOD_DAYS[period] ?? PERIOD_DAYS.all) * DAY_MS

    const transactions: FinanceTransaction[] = admin.purchases
      .filter((p) => Date.parse(p.createdAt) >= since)
      .map((p) => ({
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
      payouts: admin.withdrawals
        .filter((w) => w.status === 'PAID' && Date.parse(w.createdAt) >= since)
        .reduce((s, w) => s + w.amount, 0),
      count: paid.length,
    }

    const page = filterAndPaginate(transactions, params, {
      text: (t) => [t.title, t.user, t.id],
      status: (t) => t.status,
    })

    return { period, totals, ...page }
  },
}


export const SiteNews = {

  listSiteNews(): { items: SiteNewsItem[]; total: number; hasMore: boolean } {
    return { items: [...state.siteNews], total: state.siteNews.length, hasMore: false }
  },
}
