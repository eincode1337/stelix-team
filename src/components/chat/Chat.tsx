'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactElement } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useT } from '@/i18n/LocaleProvider'
import { renderChatMarkdownHtml } from './ChatMarkdown'


const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect


const c = (...names: string[]) => names.map((n) => `ChatPage-module__IP4DpW__${n}`).join(' ')
const p = (...names: string[]) => names.map((n) => `PageHeaderBar-module__1SDZQW__${n}`).join(' ')

type ChatSummary = { id: number | string; [key: string]: unknown }

type ChatListResponse = {
  chats?: ChatSummary[]
  total?: number
  hasMore?: boolean
  totalUnread?: number
  totalActive?: number
}


type ChatSettings = {
  directMessagesEnabled: boolean
  dmRequireDiscord: boolean
  dmOnlyVerifiedPlus: boolean
}
type ChatSettingsResponse = { settings?: Partial<ChatSettings> }


type PresenceUser = { id?: number | string; userId?: number | string; [key: string]: unknown }
type PresenceResponse = { users?: PresenceUser[] }


type NotificationRow = {
  id: number
  userId: number
  type: string
  title: string
  body: string
  link: string
  isRead: boolean
  createdAt: string
}
type NotificationsResponse = { notifications?: NotificationRow[] }


type SiteNewsRow = {
  id: string
  title: string
  body: string
  createdAt: string
  authorId: number
  isRead: boolean
}
type SiteNewsResponse = { items?: SiteNewsRow[] }


const PRESENCE_POLL_MS = 30000


function IconNews({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 14h-8M15 18h-5M10 6h8v4h-8V6z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconLock({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconList({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className={className} aria-hidden="true">
      <path d="M64 80c-8.8 0-16 7.2-16 16l0 320c0 8.8 7.2 16 16 16l320 0c8.8 0 16-7.2 16-16l0-320c0-8.8-7.2-16-16-16L64 80zM0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zm256 64c0 13.3-10.7 24-24 24l-112 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l112 0c13.3 0 24 10.7 24 24zm72 72c13.3 0 24 10.7 24 24s-10.7 24-24 24l-208 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l208 0zM192 352c0 13.3-10.7 24-24 24l-48 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l48 0c13.3 0 24 10.7 24 24z" />
    </svg>
  )
}

function IconBolt({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
    </svg>
  )
}

function IconDots({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="5" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" />
    </svg>
  )
}

const CYCLE_ICONS = [IconNews, IconLock, IconList, IconBolt, IconDots] as const


const SKELETON_TITLE_WIDTHS = [70, 55, 80, 65, 75, 50, 60, 72, 58, 83, 67, 76, 52, 63, 68, 74, 61, 56, 79, 64]


function TabBellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={c('tabIcon')}>
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TabSupportIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" className={c('tabIcon')}>
      <path d="M72 16l240 0c13.3 0 24 10.7 24 24l0 192c0 13.3-10.7 24-24 24l-90.4 0c-14.1 0-27.8 4.7-39 13.3l-54.6 42 0-31.3c0-13.3-10.7-24-24-24l-32 0c-13.3 0-24-10.7-24-24L48 40c0-13.3 10.7-24 24-24zM0 40L0 232c0 39.8 32.2 72 72 72l8 0 0 56c0 9.1 5.2 17.5 13.4 21.5s18 3.1 25.2-2.5l93.2-71.7c2.8-2.2 6.2-3.3 9.8-3.3l90.4 0c39.8 0 72-32.2 72-72l0-192c0-39.8-32.2-72-72-72L72-32C32.2-32 0 .2 0 40zM240 392l0-40-7.5 0-40.5 31.1 0 8.9c0 39.8 32.2 72 72 72l90.4 0c3.5 0 7 1.2 9.8 3.3L457.4 539c7.2 5.6 17 6.5 25.2 2.5S496 529.1 496 520l0-56 8 0c39.8 0 72-32.2 72-72l0-192c0-39.8-32.2-72-72-72l-72 0 0 48 72 0c13.3 0 24 10.7 24 24l0 192c0 13.3-10.7 24-24 24l-32 0c-13.3 0-24 10.7-24 24l0 31.3-54.6-42c-11.2-8.6-24.9-13.3-39-13.3L264 416c-13.3 0-24-10.7-24-24zM192 76c14.4 0 26.1 11.7 26.1 26.1 0 9.2-3.9 14.4-9.1 18.3-5.9 4.4-13.4 6.7-17.6 7.6-10.6 2.3-19.4 11.7-19.4 24 0 11 9 20 20 20 5.9 0 11.3-2.6 14.9-6.7 7.2-2.2 16.9-6 26-12.8 13.3-9.9 25.2-26.2 25.2-50.4 0-36.5-29.6-66.1-66.1-66.1-29.2 0-54 18.9-62.7 45.2-3.5 10.5 2.2 21.8 12.6 25.3s21.8-2.2 25.3-12.6C170.7 83.4 180.5 76 192 76zm24 132a24 24 0 1 0 -48 0 24 24 0 1 0 48 0z" />
    </svg>
  )
}

function TabSalesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" fill="currentColor" className={c('tabIcon')}>
      <path d="M598.1 75.4c10.7-7.8 13.1-22.8 5.3-33.5s-22.8-13.1-33.5-5.3l-74.5 54.2-9.9-6.6C465.8 71 442.6 64 418.9 64l-59.2 0-.4 0-143.6 0c-26.7 0-52.5 8.9-73.4 25.1L70.1 36.6c-10.7-7.8-25.7-5.4-33.5 5.3s-5.4 25.7 5.3 33.5l88 64c9.6 6.9 22.7 5.9 31.1-2.4l3.9-3.9c13.5-13.5 31.8-21.1 50.9-21.1l46.3 0-91.7 91.7c-15.6 15.6-15.6 40.9 0 56.6l.8 .8C218 308 294 308 340.9 261.1l27.1-27.1 97.8 97.8c15.6 15.6 15.6 40.9 0 56.6l-9.8 9.8-31-31c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l28 28c-17.5 10.4-37.2 16.7-57.6 18.5L313 399c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l15 15-3.8 0c-36.1 0-70.7-14.3-96.2-39.8L65 279c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9L160.2 442.1c34.5 34.5 81.3 53.9 130.1 53.9l51.8 0 1 1 1-1 5.7 0c48.8 0 95.6-19.4 130.1-53.9l19.9-19.9c1.2-1.2 2.3-2.3 3.4-3.5 .7-.5 1.3-1.1 1.9-1.7L609 313c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-53.8 53.8c-4.2-12.8-11.3-24.9-21.5-35.1L385 183c-9.4-9.4-24.6-9.4-33.9 0l-44.1 44.1c-26.5 26.5-68.5 28-96.7 4.6l98.7-98.7c13.4-13.4 31.6-21 50.6-21.1l8.5 0 .2 0 50.8 0c14.2 0 28.1 4.2 39.9 12.1L482.7 140c8.4 5.6 19.3 5.3 27.4-.6l88-64z" />
    </svg>
  )
}

function TabPurchasesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={c('tabIcon')}>
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 6h18M16 10a4 4 0 11-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TabOrdersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={c('tabIcon')}>
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TabPersonalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={c('tabIcon')}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const TABS = [
  { label: 'Уведомления', Icon: TabBellIcon },
  { label: 'Поддержка', Icon: TabSupportIcon },
  { label: 'Продажи', Icon: TabSalesIcon },
  { label: 'Покупки', Icon: TabPurchasesIcon },
  { label: 'Заказы', Icon: TabOrdersIcon },
  { label: 'Личные', Icon: TabPersonalIcon },
] as const


type ChannelId = 'news' | 'security' | 'applications' | 'transactions' | 'other'

type ChannelDef = {
  id: ChannelId
  Icon: (props: { className: string }) => ReactElement
  title: string
  subtitle: string
  staticPreview?: string
}

const CHANNEL_DEFS: ChannelDef[] = [
  { id: 'news', Icon: IconNews, title: 'Новости', subtitle: 'Новости и обновления' },
  { id: 'security', Icon: IconLock, title: 'Безопасность', subtitle: 'Входы и безопасность' },
  { id: 'applications', Icon: IconList, title: 'Заявки', subtitle: 'Заявки и статусы' },
  { id: 'transactions', Icon: IconBolt, title: 'Транзакции', subtitle: 'Покупки, платежи, заказы', staticPreview: 'Покупки, платежи, заказы' },
  { id: 'other', Icon: IconDots, title: 'Прочее', subtitle: 'Вне основных разделов', staticPreview: 'Вне основных разделов' },
]

type ChannelPost = { id: string; title: string; createdAt: string; markdown: string }
type Channel = ChannelDef & { preview: string; time: string | null; posts: ChannelPost[] }


const STATUS_LABELS: Record<string, string> = {
  APPROVED: 'Одобрен',
  REJECTED: 'Отклонён',
  PENDING: 'На рассмотрении',
}


const TYPE_LABELS: Record<string, string> = {
  login_event: 'Вход в аккаунт',
  system_code: 'Код подтверждения',
  sign_in_verification_code: 'Код подтверждения',
  resource_status: 'Обновление статуса ресурса',
}

function countryName(code: string): string {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code
  } catch {
    return code
  }
}

function parseBody(row: NotificationRow): Record<string, unknown> {
  try {
    const v = JSON.parse(row.body) as unknown
    return v && typeof v === 'object' ? (v as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

const str = (v: unknown): string => (typeof v === 'string' ? v : v == null ? '' : String(v))


function formatNotification(row: NotificationRow): string {
  const b = parseBody(row)
  switch (str(b.kind)) {
    case 'login_event_v1':
      return `${str(b.city)}, ${countryName(str(b.countryCode))}, ${str(b.ip)} (${str(b.browser)}, ${str(b.platform)})`
    case 'auth_code_v1':
      return `Код подтверждения: ${str(b.code)}`
    case 'resource_status_v1':
      return `Ресурс: «${str(b.resourceTitle)}»\nСтатус: ${STATUS_LABELS[str(b.resourceStatus)] ?? str(b.resourceStatus)}`
    default:
      return row.title
  }
}

function channelOfNotification(row: NotificationRow): ChannelId {
  const m = /[?&]id=notification:([a-z]+)/.exec(row.link || '')
  if (m) {
    const k = m[1] as ChannelId
    if (k === 'news' || k === 'security' || k === 'applications' || k === 'transactions' || k === 'other') return k
  }
  switch (row.type) {
    case 'resource_status':
      return 'applications'
    case 'login_event':
    case 'system_code':
    case 'sign_in_verification_code':
      return 'security'
    case 'purchase':
    case 'payment':
    case 'order':
      return 'transactions'
    default:
      return 'other'
  }
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', hour12: false })
}
function fmtDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}
function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}


function fmtSidebarTime(iso: string, now: Date): string {
  const d = new Date(iso)
  return sameDay(d, now) ? fmtTime(iso) : fmtDateShort(iso)
}


function newsPreview(body: string): string {
  const flat = body.replace(/\s+/g, ' ').trim()
  return flat.length > 79 ? flat.slice(0, 79) + '...' : flat
}

function dayKey(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}


function buildChannels(siteNews: SiteNewsRow[], notifications: NotificationRow[]): Channel[] {
  const now = new Date()
  const asc = (a: { createdAt: string }, b: { createdAt: string }) => Date.parse(a.createdAt) - Date.parse(b.createdAt)

  const newsAsc = [...siteNews].sort(asc)
  const newsLatest = newsAsc[newsAsc.length - 1]

  const byChannel = new Map<ChannelId, NotificationRow[]>()
  for (const n of notifications) {
    const id = channelOfNotification(n)
    const list = byChannel.get(id) ?? []
    list.push(n)
    byChannel.set(id, list)
  }

  return CHANNEL_DEFS.map((def) => {
    if (def.id === 'news') {
      return {
        ...def,
        preview: newsLatest ? newsPreview(newsLatest.body) : def.staticPreview ?? '',
        time: newsLatest ? fmtSidebarTime(newsLatest.createdAt, now) : null,
        posts: newsAsc.map((it) => ({ id: it.id, title: it.title, createdAt: it.createdAt, markdown: it.body })),
      }
    }
    const items = [...(byChannel.get(def.id) ?? [])].sort(asc)
    if (items.length === 0) {
      return { ...def, preview: def.staticPreview ?? '', time: null, posts: [] }
    }
    const latest = items[items.length - 1]
    return {
      ...def,
      preview: formatNotification(latest),
      time: fmtSidebarTime(latest.createdAt, now),
      posts: items.map((it) => ({
        id: String(it.id),
        title: TYPE_LABELS[it.type] ?? def.title,
        createdAt: it.createdAt,
        markdown: formatNotification(it),
      })),
    }
  })
}


function tabIndexOf(params: Record<string, string | string[] | undefined>): number {
  const raw = params.tab
  const tab = Array.isArray(raw) ? raw[0] : raw
  switch (tab) {
    case 'support':
      return 1
    case 'sales':
      return 2
    case 'purchases':
      return 3
    case 'orders':
      return 4
    case 'personal':
    case 'direct':
      return 5
    default:
      return 0
  }
}

function channelIdOf(params: Record<string, string | string[] | undefined>): ChannelId {
  const raw = params.id
  const id = Array.isArray(raw) ? raw[0] : raw
  const m = /^notification:([a-z]+)$/.exec(id ?? '')
  if (m) {
    const k = m[1] as ChannelId
    if (k === 'news' || k === 'security' || k === 'applications' || k === 'transactions' || k === 'other') return k
  }
  return 'news'
}


function IconEnterFullscreen() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={c('chatMobileToolbarIcon')} aria-hidden="true">
      <path d="M3 21v-5h2v3h3v2zm13 0v-2h3v-3h2v5zM3 8V3h5v2H5v3zm16 0V5h-3V3h5v5z" />
    </svg>
  )
}
function IconExitFullscreen() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={c('chatMobileToolbarIcon')} aria-hidden="true">
      <path d="M6 18H4q-.425 0-.712-.288T3 17t.288-.712T4 16h3q.425 0 .713.288T8 17v3q0 .425-.288.713T7 21t-.712-.288T6 20zm12 0v2q0 .425-.288.713T17 21t-.712-.288T16 20v-3q0-.425.288-.712T17 16h3q.425 0 .713.288T21 17t-.288.713T20 18zM6 6V4q0-.425.288-.712T7 3t.713.288T8 4v3q0 .425-.288.713T7 8H4q-.425 0-.712-.288T3 7t.288-.712T4 6zm12 0h2q.425 0 .713.288T21 7t-.288.713T20 8h-3q-.425 0-.712-.288T16 7V4q0-.425.288-.712T17 3t.713.288T18 4z" />
    </svg>
  )
}

export function Chat({ initialSearchParams = {} }: { initialSearchParams?: Record<string, string | string[] | undefined> }) {
  const tr = useT()
  const { user } = useAuth()
  const [ready, setReady] = useState(false)
  const [chats, setChats] = useState<ChatSummary[]>([])
  const [settings, setSettings] = useState<ChatSettings | null>(null)
  const [presence, setPresence] = useState<PresenceUser[]>([])
  const [siteNews, setSiteNews] = useState<SiteNewsRow[]>([])
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [query, setQuery] = useState('')


  const [activeTab, setActiveTab] = useState(() => tabIndexOf(initialSearchParams))
  const [selectedChannelId, setSelectedChannelId] = useState<ChannelId>(() => channelIdOf(initialSearchParams))
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [fullscreenOverride, setFullscreenOverride] = useState<boolean | null>(null)
  const [mobileFactor, setMobileFactor] = useState(false)
  const fullscreen = fullscreenOverride ?? mobileFactor


  const [indicatorStyle, setIndicatorStyle] = useState<CSSProperties>({ width: '0', height: '0', transform: 'translate(0px, 0px)' })
  const [listIndicatorStyle, setListIndicatorStyle] = useState<CSSProperties>({ width: '0', height: '0', transform: 'translate(0px, 0px)' })
  const tabsRef = useRef<HTMLDivElement | null>(null)
  const chatListRef = useRef<HTMLDivElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)


  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-chat-page', '1')
    return () => {
      root.removeAttribute('data-chat-page')
    }
  }, [])


  useEffect(() => {
    const root = document.documentElement
    const read = () => setMobileFactor(root.getAttribute('data-nav-form-factor') === 'mobile')
    read()
    const mo = new MutationObserver(read)
    mo.observe(root, { attributes: true, attributeFilter: ['data-nav-form-factor'] })
    return () => mo.disconnect()
  }, [])


  useEffect(() => {
    const root = document.documentElement
    if (fullscreen) {
      root.setAttribute('data-chat-mobile-fullscreen', '1')
      root.style.overflow = 'hidden'
    } else {
      root.removeAttribute('data-chat-mobile-fullscreen')
      root.style.overflow = ''
    }
    return () => {
      root.removeAttribute('data-chat-mobile-fullscreen')
      root.style.overflow = ''
    }
  }, [fullscreen])


  useIsoLayoutEffect(() => {
    const container = tabsRef.current
    if (!container) return
    const measure = () => {
      const buttons = container.querySelectorAll<HTMLButtonElement>('button')
      const el = buttons[activeTab]
      if (!el) return
      setIndicatorStyle({
        width: `${el.offsetWidth}px`,
        height: `${el.offsetHeight}px`,
        transform: `translate(${el.offsetLeft}px, ${el.offsetTop}px)`,
      })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [activeTab])


  useEffect(() => {
    if (!user) {
      setReady(false)
      setChats([])
      setSettings(null)
      setPresence([])
      setSiteNews([])
      setNotifications([])
      setSidebarOpen(false)
      return
    }
    let alive = true
    const ac = new AbortController()
    const opts: RequestInit = {
      credentials: 'include',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: ac.signal,
    }

    const loadPresence = async () => {
      try {
        const res = await fetch('/api/presence', opts)
        if (!alive || !res.ok) return
        const data = (await res.json().catch(() => null)) as PresenceResponse | null
        if (alive && Array.isArray(data?.users)) setPresence(data.users)
      } catch {

      }
    }

    void (async () => {
      try {
        const [listRes, settingsRes, presenceRes, newsRes, notifRes] = await Promise.all([
          fetch('/api/chat/list', opts),
          fetch('/api/chat/settings', opts).catch(() => null),
          fetch('/api/presence', opts).catch(() => null),
          fetch('/api/site-news', opts).catch(() => null),
          fetch('/api/notifications', opts).catch(() => null),
        ])
        if (!alive) return

        if (settingsRes && settingsRes.ok) {
          const s = (await settingsRes.json().catch(() => null)) as ChatSettingsResponse | null
          if (alive && s?.settings) {
            setSettings({
              directMessagesEnabled: Boolean(s.settings.directMessagesEnabled),
              dmRequireDiscord: Boolean(s.settings.dmRequireDiscord),
              dmOnlyVerifiedPlus: Boolean(s.settings.dmOnlyVerifiedPlus),
            })
          }
        }

        if (presenceRes && presenceRes.ok) {
          const pr = (await presenceRes.json().catch(() => null)) as PresenceResponse | null
          if (alive && Array.isArray(pr?.users)) setPresence(pr.users)
        }

        if (newsRes && newsRes.ok) {
          const nd = (await newsRes.json().catch(() => null)) as SiteNewsResponse | null
          if (alive && Array.isArray(nd?.items)) setSiteNews(nd.items)
        }

        if (notifRes && notifRes.ok) {
          const nn = (await notifRes.json().catch(() => null)) as NotificationsResponse | null
          if (alive && Array.isArray(nn?.notifications)) setNotifications(nn.notifications)
        }


        if (!listRes.ok) return
        const data = (await listRes.json().catch(() => null)) as ChatListResponse | null
        if (!alive || !data) return
        setChats(Array.isArray(data.chats) ? data.chats : [])
        setReady(true)
      } catch {

      }
    })()

    const presenceTimer = setInterval(() => {
      void loadPresence()
    }, PRESENCE_POLL_MS)

    return () => {
      alive = false
      ac.abort()
      clearInterval(presenceTimer)
    }
  }, [user])


  const markedReadRef = useRef(false)
  useEffect(() => {
    if (!user || activeTab !== 0) {
      markedReadRef.current = false
      return
    }
    if (markedReadRef.current) return
    markedReadRef.current = true
    void fetch('/api/notifications/read', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      cache: 'no-store',
      keepalive: true,
      body: JSON.stringify({}),
    })
      .then((res) => {
        if (res.ok && typeof window !== 'undefined') {
          window.dispatchEvent(new Event('stelix:notifications-read'))
        }
      })
      .catch(() => {
        markedReadRef.current = false
      })
  }, [user, activeTab])


  const onlinePeerIds = useMemo(() => {
    const ids = new Set<string>()
    for (const u of presence) {
      const id = u.userId ?? u.id
      if (id !== undefined && id !== null) ids.add(String(id))
    }
    return ids
  }, [presence])

  const canOpenDirectMessages = settings ? settings.directMessagesEnabled : true

  const hasQuery = query.length > 0
  const normalizedQuery = query.trim().toLowerCase()
  const matchesQuery = useCallback(
    (...fields: string[]) => normalizedQuery === '' || fields.some((f) => f.toLowerCase().includes(normalizedQuery)),
    [normalizedQuery],
  )

  const channels = useMemo(() => buildChannels(siteNews, notifications), [siteNews, notifications])
  const notifTotal = useMemo(() => channels.reduce((s, ch) => s + ch.posts.length, 0), [channels])


  const visibleChannels = useMemo(
    () => (activeTab === 0 ? channels.filter((ch) => matchesQuery(tr(ch.title), ch.preview)) : []),
    [activeTab, channels, matchesQuery, tr],
  )
  const visibleChats = useMemo(() => {
    if (activeTab === 0) return []
    return chats.filter((chat) => {
      const title = String((chat as { title?: string }).title ?? '')
      const message = String((chat as { lastMessage?: string }).lastMessage ?? (chat as { message?: string }).message ?? '')
      const tabHint = (chat as { tab?: number; tabIndex?: number }).tab ?? (chat as { tabIndex?: number }).tabIndex
      const inTab = typeof tabHint === 'number' ? tabHint === activeTab : true
      return inTab && matchesQuery(title, message)
    })
  }, [chats, activeTab, matchesQuery])

  const selectedChannel = useMemo(
    () => channels.find((ch) => ch.id === selectedChannelId) ?? channels[0],
    [channels, selectedChannelId],
  )


  useIsoLayoutEffect(() => {
    const track = chatListRef.current
    if (!track) return
    const measure = () => {
      const items = Array.from(track.querySelectorAll<HTMLButtonElement>('button[data-chat-item-id]'))
      const target = items.find((it) => it.getAttribute('data-chat-item-id') === `notification:${selectedChannelId}`)
      if (!target) return
      setListIndicatorStyle({
        width: `${target.offsetWidth}px`,
        height: `${target.offsetHeight}px`,
        transform: `translate(${target.offsetLeft}px, ${target.offsetTop}px)`,
      })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [ready, activeTab, selectedChannelId, query, visibleChannels.length])

  const selectChannel = useCallback((id: ChannelId) => {
    setSelectedChannelId(id)
    setSidebarOpen(false)
  }, [])


  const focusSearch = useCallback(() => {
    setSidebarOpen(true)
    requestAnimationFrame(() => {
      searchInputRef.current?.focus()
    })
  }, [])

  const searchPlaceholder = activeTab === 0 ? 'Поиск уведомлений' : 'Поиск чатов'


  const headerTitle = ready && selectedChannel ? selectedChannel.title : 'Новости'
  const headerSubtitle = ready && selectedChannel ? selectedChannel.subtitle : 'Новости и обновления'
  const paneChannel = ready ? selectedChannel : undefined


  const dayGroups = useMemo(() => {
    const posts = paneChannel?.posts ?? []
    const groups: { key: string; label: string; posts: ChannelPost[] }[] = []
    for (const post of posts) {
      const key = dayKey(post.createdAt)
      const last = groups[groups.length - 1]
      if (last && last.key === key) last.posts.push(post)
      else groups.push({ key, label: fmtDateShort(post.createdAt), posts: [post] })
    }
    return groups
  }, [paneChannel])

  return (
    <div className={fullscreen ? c('chatPage') + ' ' + c('chatPageFullscreen') : c('chatPage')}>
      <div className={'container ' + c('chatPageInner')}>
        <section className={c('chat')}>
          <div className={c('chatPanes')}>
            {sidebarOpen ? (
              <button
                type="button"
                className={c('sidebarBackdrop')}
                aria-label={tr('Закрыть список чатов')}
                onClick={() => setSidebarOpen(false)}
              />
            ) : null}
            <aside
              className={c('sidebar') + ' ' + (sidebarOpen ? c('sidebarDrawerOpen') : '')}
              aria-hidden={fullscreen && !sidebarOpen ? true : undefined}
            >
              <div className={c('sidebarHeader')}>
                <div className={c('sidebarHeaderLeft')}>
                  <h2 className={c('sidebarTitle')}>{tr('Сообщения')}</h2>
                  <div className={c('sideViewToggle')}>
                    <button
                      type="button"
                      className={c('sideViewIconBtn', 'sideViewIconBtnActive')}
                      style={{ color: '#a371f7', background: 'color-mix(in srgb, #a371f7 14%, var(--bg-default))' }}
                      aria-label={tr('Продавец')}
                      tabIndex={-1}
                      data-tooltip-trigger=""
                    >
                      <svg viewBox="0 0 640 512" fill="currentColor" aria-hidden="true" className={c('sideViewIcon')}>
                        <path d="M320 192a64 64 0 1 0 0-128 64 64 0 1 0 0 128zm0-176a112 112 0 1 1 0 224 112 112 0 1 1 0-224zM296 336c-57.4 0-104 46.6-104 104l0 16c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-16c0-83.9 68.1-152 152-152l48 0c83.9 0 152 68.1 152 152l0 16c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-16c0-57.4-46.6-104-104-104l-48 0zm135.4-93.2c11.7-11.3 21.6-24.4 29.4-38.8 5.9 2.6 12.4 4 19.2 4 26.5 0 48-21.5 48-48s-21.5-48-48-48l-.8 0c-1.6-16.6-5.8-32.4-12.1-47.1 4.2-.6 8.6-.9 12.9-.9 53 0 96 43 96 96s-43 96-96 96c-17.7 0-34.3-4.8-48.6-13.2zM160 64c4.4 0 8.7 .3 12.9 .9-6.3 14.7-10.5 30.6-12.1 47.1l-.8 0c-26.5 0-48 21.5-48 48s21.5 48 48 48c6.8 0 13.3-1.4 19.2-4 7.8 14.4 17.7 27.5 29.4 38.8-14.2 8.4-30.8 13.2-48.6 13.2-53 0-96-43-96-96s43-96 96-96zM149.3 304c-15.1 16.3-27.5 35-36.5 55.6-38 15.5-64.8 52.8-64.8 96.4 0 13.3-10.7 24-24 24S0 469.3 0 456c0-83.1 66.6-150.6 149.3-152zm377.9 55.6c-9-20.6-21.5-39.4-36.5-55.6 82.7 1.4 149.3 68.9 149.3 152 0 13.3-10.7 24-24 24s-24-10.7-24-24c0-43.6-26.8-80.9-64.8-96.4z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <span className={c('sidebarHeaderDivider')} aria-hidden="true" />
                <button type="button" className={c('sidebarCloseBtn')} aria-label={tr('Закрыть список чатов')} onClick={() => setSidebarOpen(false)}>
                  <svg viewBox="0 0 24 24" fill="none" className={c('sidebarCloseIcon')} aria-hidden="true">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <div className={c('tabs')} ref={tabsRef}>
                {TABS.map(({ label, Icon }, i) => (
                  <button key={label} className={i === activeTab ? c('tab', 'active') : c('tab')} onClick={() => setActiveTab(i)}>
                    <Icon />
                    <span>{tr(label)}</span>
                    <div className={c('tabBadges')}>
                      <span className={c('tabCountBadge')}>{i === 0 ? (ready ? notifTotal : 0) : 0}</span>
                    </div>
                  </button>
                ))}
                <span className={c('tabsIndicator', 'tabsIndicatorVisible')} aria-hidden="true" style={indicatorStyle} />
              </div>

              <div className={c('chatSearch') + ' '}>
                <svg viewBox="0 0 24 24" fill="none" className={c('chatSearchIcon')} aria-hidden="true">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                  <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  ref={searchInputRef}
                  className={c('chatSearchInput')}
                  type="search"
                  placeholder={tr(searchPlaceholder)}
                  aria-label={tr(searchPlaceholder)}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  className={c('chatSearchClearBtn') + (hasQuery ? ' ' + c('chatSearchClearBtnVisible') : ' ')}
                  tabIndex={hasQuery ? 0 : -1}
                  aria-label={tr('Очистить поиск')}
                  aria-hidden={!hasQuery}
                  type="button"
                  onClick={() => setQuery('')}
                >
                  <svg viewBox="0 0 24 24" fill="none" className={c('chatSearchClearIcon')} aria-hidden="true">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {ready ? (


                <div className={c('chatList') + '  '}>
                  <div className={c('chatListSlideTrack')} ref={chatListRef}>
                    {activeTab === 0
                      ? visibleChannels.map((ch) => {
                          const selected = selectedChannelId === ch.id
                          const Icon = ch.Icon
                          return (
                            <button
                              key={ch.id}
                              type="button"
                              data-chat-item-id={`notification:${ch.id}`}
                              className={c('chatItem') + ' ' + c('chatItemWithNotificationIcon') + ' ' + (selected ? c('selectedChat') : '') + ' '}
                              onClick={() => selectChannel(ch.id)}
                            >
                              <Icon className={c('chatItemNotificationIcon')} />
                              <div className={c('chatItemContent')}>
                                <div className={c('chatItemTopRow')}>
                                  <div className={c('chatItemTitleRow')}>
                                    <h3 className={c('chatItemTitle')}>{tr(ch.title)}</h3>
                                  </div>
                                  {ch.time !== null ? (
                                    <span className={c('chatItemTimeRow')}>
                                      <span className={c('chatItemTime')}>{ch.time}</span>
                                    </span>
                                  ) : null}
                                </div>
                                <div className={c('chatItemBottomRow')}>
                                  <p className={c('chatItemMessage')}>{tr(ch.preview)}</p>
                                </div>
                              </div>
                            </button>
                          )
                        })
                      : visibleChats.map((chat) => {
                          const peerKey = String((chat as { peerId?: number | string }).peerId ?? chat.id)
                          const isOnline = onlinePeerIds.has(peerKey)
                          const id = String(chat.id)
                          const selected = String(selectedChannelId) === id
                          return (
                            <button
                              key={id}
                              type="button"
                              data-chat-item-id={id}
                              className={c('chatItem') + ' ' + c('chatItemWithNotificationIcon') + ' ' + (selected ? c('selectedChat') : '') + ' '}
                              aria-label={tr('Чат')}
                              data-online={isOnline ? 'true' : undefined}
                              disabled={!canOpenDirectMessages}
                            >
                              <IconDots className={c('chatItemNotificationIcon')} />
                              <div className={c('chatItemContent')}>
                                <div className={c('chatItemTopRow')}>
                                  <div className={c('chatItemTitleRow')}>
                                    <h3 className={c('chatItemTitle')}>{String((chat as { title?: string }).title ?? '')}</h3>
                                  </div>
                                </div>
                              </div>
                            </button>
                          )
                        })}
                    <span className={c('chatListIndicator', 'chatListIndicatorVisible')} aria-hidden="true" style={listIndicatorStyle} />
                  </div>
                </div>
              ) : (

                <div className={c('chatList') + '  ' + c('chatListNoScroll')}>
                  <div className={c('chatListLoader')} role="status" aria-live="polite" aria-busy="true">
                    {SKELETON_TITLE_WIDTHS.map((titleWidth, i) => {
                      const Icon = CYCLE_ICONS[i % CYCLE_ICONS.length]
                      const msgWidth = titleWidth - 15
                      return (
                        <div key={i} className={c('chatItemSkeleton', 'chatItemSkeletonWithNotificationIcon')} aria-hidden="true">
                          <span className={c('chatSidebarSkeletonIconWrap')}>
                            <Icon className={c('chatItemNotificationIcon')} />
                            <span className={c('skeletonBlock', 'chatSidebarSkeletonIconOverlay')} aria-hidden="true" />
                          </span>
                          <div className={c('chatItemSkeletonContent')}>
                            <div className={c('chatItemSkeletonRow')}>
                              <div className={c('skeletonBlock', 'chatItemSkeletonTitleBlock')} style={{ maxWidth: `${titleWidth}%` }} />
                              <div className={c('skeletonBlock', 'chatItemSkeletonTimeBlock')} />
                            </div>
                            <div className={c('chatItemSkeletonRow')}>
                              <div className={c('skeletonBlock', 'chatItemSkeletonMessageBlock')} style={{ maxWidth: `${msgWidth}%` }} />
                              <div className={c('skeletonBlock', 'chatItemSkeletonStatusBlock')} />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <span className={c('visuallyHidden')}>{tr('Загрузка чатов...')}</span>
                  </div>
                </div>
              )}
            </aside>

            <div className={c('chatWindow')}>
              <div className={c('chatMobileToolbar')}>
                <span className={c('chatMobileToolbarTitle')}>{tr('Сообщения')}</span>
                <div className={c('chatMobileToolbarActions')}>
                  <button
                    type="button"
                    className={c('chatMobileToolbarBtn')}
                    aria-label={fullscreen ? tr('Выйти из полноэкранного режима') : tr('Открыть чат на весь экран')}
                    aria-pressed={fullscreen}
                    onClick={() => setFullscreenOverride(!fullscreen)}
                  >
                    {fullscreen ? <IconExitFullscreen /> : <IconEnterFullscreen />}
                  </button>
                  <button
                    type="button"
                    className={c('chatMobileToolbarBtn')}
                    aria-label={tr('Открыть список чатов и вкладки')}
                    aria-expanded={sidebarOpen}
                    onClick={() => setSidebarOpen((v) => !v)}
                  >
                    <svg viewBox="0 0 640 640" fill="currentColor" className={c('chatMobileToolbarIcon')} aria-hidden="true">
                      <path d="M64 160C64 142.3 78.3 128 96 128L480 128C497.7 128 512 142.3 512 160C512 177.7 497.7 192 480 192L96 192C78.3 192 64 177.7 64 160zM128 320C128 302.3 142.3 288 160 288L544 288C561.7 288 576 302.3 576 320C576 337.7 561.7 352 544 352L160 352C142.3 352 128 337.7 128 320zM512 480C512 497.7 497.7 512 480 512L96 512C78.3 512 64 497.7 64 480C64 462.3 78.3 448 96 448L480 448C497.7 448 512 462.3 512 480z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className={c('chatWindowScroll') + ' '}>
                <div className={c('chatHeader')}>
                  <div className={c('chatHeaderInfo')}>
                    <h3 className={c('chatHeaderTitle')}>{tr(headerTitle)}</h3>
                    <div className={c('chatHeaderSubtitleRow')}>
                      <p className={c('chatHeaderSubtitle')}>{tr(headerSubtitle)}</p>
                    </div>
                  </div>
                  <div className={c('chatHeaderActions')}>
                    <button type="button" className={c('chatSearchMsgButton')} aria-label={tr('Поиск по уведомлениям')} data-tooltip-trigger="" onClick={focusSearch}>
                      <svg viewBox="0 0 24 24" fill="none" className={c('pinChatIcon')} aria-hidden="true">
                        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                        <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className={c('messages')} tabIndex={0}>
                  {paneChannel && paneChannel.posts.length > 0 ? (
                    <div className={c('messagesList')}>
                      {dayGroups.map((group) => (
                        <div key={group.key} className={c('messageDayGroup')}>
                          <div className={c('messageDateDivider')} role="separator" aria-label={group.label}>
                            <span className={c('messageDateDividerPill')}>
                              <span className={c('messageDateDividerLabel')}>{group.label}</span>
                            </span>
                          </div>
                          {group.posts.map((post) => (
                            <article
                              key={post.id}
                              className={c('notificationPost') + ' ' + c('notificationPost_fullWidth')}
                              data-notification-id={post.id}
                            >
                              <header className={p('headerBar', 'headerBar_embedded') + ' ' + c('notificationPostHeader')}>
                                <div className={p('headerBar__start') + ' ' + c('notificationPostHeaderStart')}>
                                  <h3 className={p('headerBar__title') + ' ' + c('notificationPostTitle')}>{post.title}</h3>
                                </div>
                                <div className={p('headerBar__end')}>
                                  <span className={p('headerBar__divider')} aria-hidden="true" />
                                  <div className={p('headerBar__actions')}>
                                    <time className={c('notificationPostTime')} dateTime={post.createdAt}>
                                      {fmtTime(post.createdAt)}
                                    </time>
                                  </div>
                                </div>
                              </header>
                              <div className={c('notificationPostContent')}>
                                <div
                                  className={'markdown-body-root ' + c('notificationPostBody', 'notificationPostBodyMarkdown')}
                                  dangerouslySetInnerHTML={{ __html: renderChatMarkdownHtml(post.markdown) }}
                                />
                              </div>
                            </article>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={c('chatEmptyState')}>
                      <svg viewBox="0 0 24 24" fill="none" className={c('chatEmptyIcon')} aria-hidden="true">
                        <path
                          d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className={'PageHeaderBar-module__1SDZQW__headerBar__emptyCaption ' + c('chatEmpty')}>{tr('Пока нет уведомлений')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
