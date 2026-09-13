'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react'

import { ap, AdminTabs, type AdminTabItem } from '@/components/admin/ui'

import { UsersSection } from '@/components/admin/sections/UsersSection'
import { OrdersSection } from '@/components/admin/sections/OrdersSection'
import { PurchasesSection } from '@/components/admin/sections/PurchasesSection'
import { ResourcesSection } from '@/components/admin/sections/ResourcesSection'
import { SellersSection } from '@/components/admin/sections/SellersSection'
import { WithdrawalsSection } from '@/components/admin/sections/WithdrawalsSection'
import { ApplicationsSection } from '@/components/admin/sections/ApplicationsSection'
import { BlacklistSection } from '@/components/admin/sections/BlacklistSection'
import { DeliveriesSection } from '@/components/admin/sections/DeliveriesSection'
import { DashboardSection } from '@/components/admin/sections/DashboardSection'
import { FinanceSection } from '@/components/admin/sections/FinanceSection'
import { PaymentsSection } from '@/components/admin/sections/PaymentsSection'
import { StatsChartsSection } from '@/components/admin/sections/StatsChartsSection'
import { SiteActivitySection } from '@/components/admin/sections/SiteActivitySection'
import { ReviewsModerationSection } from '@/components/admin/sections/ReviewsModerationSection'
import { AccessControlSection } from '@/components/admin/sections/AccessControlSection'
import { SettingsSection } from '@/components/admin/sections/SettingsSection'

type TabKey =
  | 'dashboard'
  | 'users'
  | 'orders'
  | 'purchases'
  | 'resources'
  | 'sellers'
  | 'withdrawals'
  | 'applications'
  | 'blacklist'
  | 'deliveries'
  | 'finance'
  | 'payments'
  | 'stats'
  | 'activity'
  | 'reviews'
  | 'access'
  | 'settings'

type Tab = {
  key: TabKey
  label: string
  icon: string
  Component: ComponentType
}

const ICON = {
  dashboard: `<g class="nc-icon-wrapper"><path d="M10 16L10 21L3 21L3 16L10 16Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none"></path><path d="M21 8L21 3L14 3L14 8L21 8Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none"></path><path d="M10 3L10 12L3 12L3 3L10 3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none"></path><path d="M21 21L21 12L14 12L14 21L21 21Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none"></path></g>`,
  users: `<g class="nc-icon-wrapper"><path d="m17,4h0c-.829,0-1.5-.671-1.5-1.5h0c0-.829.671-1.5,1.5-1.5h0c.829,0,1.5.671,1.5,1.5h0c0,.829-.671,1.5-1.5,1.5Z" fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path><path d="m7,4h0c-.829,0-1.5-.671-1.5-1.5h0c0-.829.671-1.5,1.5-1.5h0c.829,0,1.5.671,1.5,1.5h0c0,.829-.671,1.5-1.5,1.5Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="currentColor"></path><path d="m14.5,23h5l.5-8,2-1-.823-4.94c-.121-.724-.632-1.32-1.323-1.566-1.22-.434-2.273-.494-2.853-.494-1.165,0-2.148.239-2.889.507" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path><path d="m9.5,23h-5l-.5-5h-2l1.826-9.13c.129-.647.567-1.184,1.171-1.449.515-.225,1.194-.421,2.003-.421.314,0,1.121.03,2.032.433.591.261,1.015.803,1.142,1.436.609,3.043,1.217,6.087,1.826,9.13h-2l-.5,5Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></g>`,
  orders: `<g class="nc-icon-wrapper"><path d="M8 3L6 3C4.89543 3 4 3.89543 4 5L4 20C4 21.1046 4.89543 22 6 22L8 22M16 3L18 3C19.1046 3 20 3.89543 20 5L20 9" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none"></path><path d="M15 23L21.5 16.5C22.3284 15.6716 22.3284 14.3284 21.5 13.5C20.6716 12.6716 19.3284 12.6716 18.5 13.5L12 20V23H15Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none"></path><path d="M8.5 11L11 13.5L15.5 9" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none"></path><path d="M8 5V2C8 1.44772 8.44772 1 9 1H15C15.5523 1 16 1.44772 16 2V5H8Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none"></path></g>`,
  purchases: `<g class="nc-icon-wrapper"><path d="m8,9v-4c0-2.209,1.791-4,4-4h0c2.209,0,4,1.791,4,4v4" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="2"></path><path d="m18.84,22H5.16c-1.165,0-2.083-.992-1.994-2.153l.692-9c.08-1.042.949-1.847,1.994-1.847h12.296c1.045,0,1.914.805,1.994,1.847l.692,9c.089,1.162-.829,2.153-1.994,2.153Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></g>`,
  resources: `<g class="nc-icon-wrapper"><path d="M11.0784 2H18C19.1046 2 20 2.89543 20 4V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V9.07843C4 8.54799 4.21071 8.03929 4.58579 7.66421L9.66421 2.58579C10.0393 2.21071 10.548 2 11.0784 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none"></path><path d="M4 9H11V2" stroke="currentColor" stroke-width="2" stroke-linejoin="round" fill="none"></path><path d="M8 17H16" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none"></path><path d="M8 13L11 13" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none"></path></g>`,
  sellers: `<g class="nc-icon-wrapper"><path d="m4,13v7c0,1.105.895,2,2,2h12c1.105,0,2-.895,2-2v-7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path><polyline points="10 22 10 16 14 16 14 22" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="2"></polyline><path d="m21.874,7l-2.874-5H5l-2.874,5c.444,1.725,2.01,3,3.874,3,1.202,0,2.267-.541,3-1.38.733.839,1.798,1.38,3,1.38s2.267-.541,3-1.38c.733.839,1.798,1.38,3,1.38,1.864,0,3.43-1.275,3.874-3Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></g>`,
  withdrawals: `<g class="nc-icon-wrapper"><path d="M1 5V19H23V5H1Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none"></path><path d="M12 14.5C13.3807 14.5 14.5 13.3807 14.5 12C14.5 10.6193 13.3807 9.5 12 9.5C10.6193 9.5 9.5 10.6193 9.5 12C9.5 13.3807 10.6193 14.5 12 14.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none"></path><path d="M5 15H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"></path><path d="M18 9H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"></path></g>`,
  applications: `<g class="nc-icon-wrapper"><path d="M20 12V4C20 2.89543 19.1046 2 18 2H11.0784C10.548 2 10.0393 2.21071 9.66421 2.58579L4.58579 7.66421C4.21071 8.03929 4 8.54799 4 9.07843L4 20C4 21.1046 4.89543 22 6 22H10" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none"></path><path d="M4 9H11V2" stroke="currentColor" stroke-width="2" stroke-linejoin="round" fill="none"></path><path d="M12.5 19L15.5 22L21.5 16" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none"></path></g>`,
  blacklist: `<g class="nc-icon-wrapper"><path d="M11 10C13.2091 10 15 8.20914 15 6C15 3.79086 13.2091 2 11 2C8.79086 2 7 3.79086 7 6C7 8.20914 8.79086 10 11 10Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none"></path><path d="M18 23C20.7614 23 23 20.7614 23 18C23 15.2386 20.7614 13 18 13C15.2386 13 13 15.2386 13 18C13 20.7614 15.2386 23 18 23Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none"></path><path d="M14.5 21.5L21.5 14.5" stroke="currentColor" stroke-width="2" fill="none"></path><path d="M10 13.0619C6.0539 13.5541 3 16.9207 3 21C5.33315 21.5833 7.6663 21.9033 10 21.9734" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none"></path></g>`,
  deliveries: `<g class="nc-icon-wrapper"><path d="M11 18H15" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none"></path><path d="M20.2308 18V18C21.1775 18 21.9885 17.3223 22.1567 16.3906L22.8661 12.4615L20.7038 11.5066C20.0955 11.238 19.6604 10.6845 19.5431 10.0299L19 7H13" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none"></path><path d="M9.00001 18H12L13 4H2.09163L1.09163 18H4.00001" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none"></path><path d="M17.5 21C18.8807 21 20 19.8807 20 18.5C20 17.1193 18.8807 16 17.5 16C16.1193 16 15 17.1193 15 18.5C15 19.8807 16.1193 21 17.5 21Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none"></path><path d="M6.5 21C7.88071 21 9 19.8807 9 18.5C9 17.1193 7.88071 16 6.5 16C5.11929 16 4 17.1193 4 18.5C4 19.8807 5.11929 21 6.5 21Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none"></path></g>`,
  finance: `<g class="nc-icon-wrapper"><path d="M21 17H18C16.343 17 15 15.657 15 14C15 12.343 16.343 11 18 11H21" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none"></path><path d="M12 7H19C20.1046 7 21 7.89543 21 9V13.5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5V5.5" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none"></path><path d="M17 3H5C3.89543 3 3 3.89543 3 5V5C3 6.10457 3.89543 7 5 7H12" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"></path></g>`,
  payments: `<g class="nc-icon-wrapper"><rect x="2" y="5" width="20" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></rect><path d="M2 10H22" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none"></path><path d="M6 15H10" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none"></path></g>`,
  stats: `<g class="nc-icon-wrapper"><path d="M12 2L6.5 8.33333L9.9375 8.33333L9.9375 21L14.0625 21L14.0625 8.33333L17.5 8.33333L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none"></path><path d="M18 13H22V21H18V13Z" stroke="currentColor" stroke-width="2" fill="none"></path><path d="M2 17H6V21H2V17Z" stroke="currentColor" stroke-width="2" fill="none"></path></g>`,
  activity: `<g class="nc-icon-wrapper"><path d="M19.4409 15C20.9155 13.2352 22 11.2744 22 9.378C22 6.408 19.588 4 16.616 4C14.656 4 13.192 5.228 12 6.606C10.81 5.226 9.344 4 7.384 4C4.41 4 2 6.408 2 9.378C2 11.2744 3.08448 13.2352 4.55913 15" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none"></path><path d="M2 19H8L10 15.1111L14 22.1111L16 19H22" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none"></path></g>`,
  reviews: `<g class="nc-icon-wrapper"><polygon points="12 3 14.234 10 21 10 15.615 14.125 17.849 21 12 16.751 6.151 21 8.385 14.125 3 10 9.766 10 12 3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></polygon></g>`,
  access: `<g class="nc-icon-wrapper"><polyline points="8 12.75 10.25 15 16 8.75" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></polyline><path d="m12,22s9-2,9-11v-7c-3.203,0-6.11-.731-9-2-2.89,1.269-5.797,2-9,2v7c0,9,9,11,9,11Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></g>`,
  settings: `<g class="nc-icon-wrapper"><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></circle><path d="m19.14,12.94c.04-.31.06-.62.06-.94s-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.4.12-.61l-1.92-3.32c-.12-.21-.37-.29-.59-.21l-2.39.96c-.5-.38-1.04-.7-1.62-.94l-.36-2.54c-.03-.24-.24-.42-.48-.42h-3.84c-.24,0-.45.18-.48.42l-.36,2.54c-.58.24-1.12.56-1.62.94l-2.39-.96c-.22-.09-.47,0-.59.21l-1.92,3.32c-.12.21-.07.47.12.61l2.03,1.58c-.04.31-.06.62-.06.94s.02.63.06.94l-2.03,1.58c-.18.14-.23.4-.12.61l1.92,3.32c.12.21.37.29.59.21l2.39-.96c.5.38,1.04.7,1.62.94l.36,2.54c.03.24.24.42.48.42h3.84c.24,0,.45-.18.48-.42l.36-2.54c.58-.24,1.12-.56,1.62-.94l2.39.96c.22.09.47,0,.59-.21l1.92-3.32c.12-.21.07-.47-.12-.61l-2.03-1.58Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></g>`,
} as const

const TABS: Tab[] = [
  { key: 'dashboard', label: 'Обзор', icon: ICON.dashboard, Component: DashboardSection },
  { key: 'users', label: 'Пользователи', icon: ICON.users, Component: UsersSection },
  { key: 'orders', label: 'Заказы', icon: ICON.orders, Component: OrdersSection },
  { key: 'purchases', label: 'Покупки', icon: ICON.purchases, Component: PurchasesSection },
  { key: 'resources', label: 'Ресурсы', icon: ICON.resources, Component: ResourcesSection },
  { key: 'sellers', label: 'Продавцы', icon: ICON.sellers, Component: SellersSection },
  { key: 'withdrawals', label: 'Выплаты', icon: ICON.withdrawals, Component: WithdrawalsSection },
  { key: 'applications', label: 'Заявки', icon: ICON.applications, Component: ApplicationsSection },
  { key: 'blacklist', label: 'Чёрный список', icon: ICON.blacklist, Component: BlacklistSection },
  { key: 'deliveries', label: 'Выдачи', icon: ICON.deliveries, Component: DeliveriesSection },
  { key: 'finance', label: 'Финансы', icon: ICON.finance, Component: FinanceSection },
  { key: 'payments', label: 'Кассы', icon: ICON.payments, Component: PaymentsSection },
  { key: 'stats', label: 'Статистика', icon: ICON.stats, Component: StatsChartsSection },
  { key: 'activity', label: 'Активность', icon: ICON.activity, Component: SiteActivitySection },
  { key: 'reviews', label: 'Отзывы', icon: ICON.reviews, Component: ReviewsModerationSection },
  { key: 'access', label: 'Доступы', icon: ICON.access, Component: AccessControlSection },
  { key: 'settings', label: 'Настройки', icon: ICON.settings, Component: SettingsSection },
]

const DEFAULT_TAB: TabKey = 'dashboard'
const TAB_KEYS = new Set<string>(TABS.map((t) => t.key))

function railIcon(markup: string): ReactNode {
  return (
    <svg
      className={ap('navIcon')}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
}

function ScrollIcon({ d }: { d: string }) {
  return (
    <svg
      className={ap('navRailScrollIcon')}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}

export function AdminPanel() {
  const [active, setActive] = useState<TabKey>(DEFAULT_TAB)
  const [railOpen, setRailOpen] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const [compact, setCompact] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState<number | null>(null)

  const sidebarRef = useRef<HTMLElement | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const [scrollable, setScrollable] = useState(false)
  const [canUp, setCanUp] = useState(false)
  const [canDown, setCanDown] = useState(false)

  const getNav = useCallback(
    () => (viewportRef.current?.querySelector('nav') as HTMLElement | null) ?? null,
    [],
  )

  useEffect(() => {
    try {
      const t = new URLSearchParams(window.location.search).get('tab')
      if (t && TAB_KEYS.has(t)) setActive(t as TabKey)
    } catch {
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(max-width: 900px)')
    const apply = (matches: boolean) => {
      setCompact(matches)
      setRailOpen(!matches)
    }
    apply(mq.matches)
    const onChange = (e: MediaQueryListEvent) => apply(e.matches)
    if (mq.addEventListener) mq.addEventListener('change', onChange)
    else if (mq.addListener) mq.addListener(onChange)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange)
      else if (mq.removeListener) mq.removeListener(onChange)
    }
  }, [])

  useEffect(() => {
    const el = sidebarRef.current
    if (!el) return
    const measure = () => setSidebarWidth(Math.round(el.getBoundingClientRect().width))
    measure()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
    ro?.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [collapsed, compact, active])

  const selectTab = useCallback((key: string) => {
    if (!TAB_KEYS.has(key)) return
    setActive(key as TabKey)
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('tab', key)
      window.history.replaceState(window.history.state, '', url.toString())
    } catch {
    }
  }, [])

  const updateScroll = useCallback(() => {
    const el = getNav()
    if (!el) return
    const overflow = el.scrollHeight - el.clientHeight
    setScrollable(overflow > 2)
    setCanUp(el.scrollTop > 2)
    setCanDown(el.scrollTop < overflow - 2)
  }, [getNav])

  useEffect(() => {
    const el = getNav()
    if (!el) return
    updateScroll()
    el.addEventListener('scroll', updateScroll, { passive: true })
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateScroll) : null
    ro?.observe(el)
    window.addEventListener('resize', updateScroll)
    return () => {
      el.removeEventListener('scroll', updateScroll)
      ro?.disconnect()
      window.removeEventListener('resize', updateScroll)
    }
  }, [getNav, updateScroll, railOpen])

  const scrollByDir = useCallback(
    (dir: 1 | -1) => {
      const el = getNav()
      if (!el) return
      el.scrollBy({ top: dir * Math.max(el.clientHeight * 0.6, 120), behavior: 'smooth' })
    },
    [getNav],
  )

  const railItems = useMemo<AdminTabItem[]>(
    () => TABS.map((t) => ({ key: t.key, label: t.label, icon: railIcon(t.icon) })),
    [],
  )

  const activeTab = TABS.find((t) => t.key === active) ?? TABS[0]
  const ActiveComponent = activeTab.Component

  const sidebarShown = compact ? railOpen : true
  const labeled = compact ? railOpen : !collapsed
  const overlayMode = compact && railOpen

  const reservedInline = compact
    ? undefined
    : {
        paddingInlineStart:
          sidebarWidth != null
            ? `${sidebarWidth}px`
            : labeled
              ? '15rem'
              : 'var(--admin-panel-rail-inline-size)',
      }

  const toggleSidebar = () => {
    if (compact) setRailOpen((o) => !o)
    else setCollapsed((c) => !c)
  }

  const toggleActive = compact ? railOpen : !collapsed

  return (
    <div className={ap('admin', !compact && 'adminRailOpen')}>
      {overlayMode ? (
        <div
          onClick={() => setRailOpen(false)}
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 39,
            background: 'rgba(0,0,0,.4)',
          }}
        />
      ) : null}
      <div className={ap('adminLayout')}>
        <aside
          ref={sidebarRef}
          className={ap('sidebar', sidebarShown ? 'sidebarOpen' : 'sidebarCollapsed')}
          aria-label="Разделы админ-панели"
          style={{
            ...(labeled ? { width: '15rem', minInlineSize: '15rem' } : null),
            ...(overlayMode
              ? {
                  background: 'var(--bg-canvas)',
                  borderInlineEnd: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-lg, 0 12px 40px rgba(0,0,0,.28))',
                }
              : null),
          }}
        >
          <div className={ap('sidebarHeader')} style={labeled ? { justifyContent: 'flex-start', gap: '0.5rem', paddingInline: '0.5rem' } : undefined}>
            <span
              aria-hidden="true"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '1.9rem',
                height: '1.9rem',
                flexShrink: 0,
                borderRadius: 'var(--radius)',
                background: 'var(--accent-subtle-bg)',
                color: 'var(--accent-fg)',
                fontWeight: 800,
                fontSize: '0.95rem',
                letterSpacing: '-0.02em',
              }}
            >
              S
            </span>
            {labeled ? (
              <span style={{ fontWeight: 700, fontSize: '0.9rem', letterSpacing: '-0.01em', color: 'var(--fg-default)', whiteSpace: 'nowrap' }}>
                Админ-панель
              </span>
            ) : (
              <span className={ap('visuallyHidden')}>Stelix — админ-панель</span>
            )}
          </div>

          <div className={ap('navRailBody')}>
            {scrollable ? (
              <button
                type="button"
                className={ap('navRailScrollBtn')}
                onClick={() => scrollByDir(-1)}
                disabled={!canUp}
                aria-label="Прокрутить вверх"
              >
                <ScrollIcon d="M18 15l-6-6-6 6" />
              </button>
            ) : null}

            <div ref={viewportRef} className={ap('navRailScrollViewport')}>
              <div className={ap('navRailFadeTop')} aria-hidden="true" />
              <AdminTabs
                items={railItems}
                activeKey={active}
                onChange={(k) => {
                  selectTab(k)
                  if (compact) setRailOpen(false)
                }}
                variant={labeled ? 'list' : 'rail'}
                ariaLabel="Разделы"
              />
              <div className={ap('navRailFadeBottom')} aria-hidden="true" />
            </div>

            {scrollable ? (
              <button
                type="button"
                className={ap('navRailScrollBtn', 'navRailScrollBtnBottom')}
                onClick={() => scrollByDir(1)}
                disabled={!canDown}
                aria-label="Прокрутить вниз"
              >
                <ScrollIcon d="M6 9l6 6 6-6" />
              </button>
            ) : null}
          </div>
        </aside>

        <div className={ap('adminMainRow')} style={reservedInline}>
          <div className={ap('adminPageInner')}>
            <span
              className={ap('pageHeaderRailMenuTooltipAnchor')}
              style={{ alignSelf: 'flex-start', paddingBlock: '0.5rem', paddingInline: 'var(--layout-page-padding-x)' }}
            >
              <button
                type="button"
                className={ap('pageHeaderTableIconButton')}
                onClick={toggleSidebar}
                aria-label={toggleActive ? 'Свернуть разделы' : 'Развернуть разделы'}
                aria-expanded={toggleActive}
                title="Разделы"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="1.25rem"
                  height="1.25rem"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 6h18M3 12h18M3 18h18" />
                </svg>
              </button>
            </span>

            <div
              className={ap('content')}
              role="tabpanel"
              aria-label={activeTab.label}
              style={{ paddingBlock: '0 2rem', paddingInline: 'var(--layout-page-padding-x)' }}
            >
              <ActiveComponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
