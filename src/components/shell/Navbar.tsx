'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useShell } from '@/components/shell/ShellProvider'
import { useSignInDrawer } from '@/components/auth/SignInDrawer'
import { useAuth } from '@/components/auth/AuthProvider'
import { locales, localeMeta } from '@/i18n/config'
import { useT } from '@/i18n/LocaleProvider'

const nb = (...names: string[]) => names.map((n) => `Navbar-module__O8Na-a__${n}`).join(' ')
const pop = (...names: string[]) => names.map((n) => `Popover-module__Nt1uSa__${n}`).join(' ')
const btn = (...names: string[]) => names.map((n) => `Button-module__VMVMAW__${n}`).join(' ')

type Theme = 'light' | 'dark'

const SunIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={nb('themeIcon')}>
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const MoonIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={nb('themeIcon')}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ChatIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={nb('actionIcon')}>
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const CartIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={nb('actionIcon')}>
    <circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2" />
    <circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2" />
    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const PurchasesIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={nb('actionIcon')}>
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 6h18M16 10a4 4 0 11-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const SellerIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" fill="currentColor" className={nb('adminNavIcon')} aria-hidden="true">
    <path d="M598.1 75.4c10.7-7.8 13.1-22.8 5.3-33.5s-22.8-13.1-33.5-5.3l-74.5 54.2-9.9-6.6C465.8 71 442.6 64 418.9 64l-59.2 0-.4 0-143.6 0c-26.7 0-52.5 8.9-73.4 25.1L70.1 36.6c-10.7-7.8-25.7-5.4-33.5 5.3s-5.4 25.7 5.3 33.5l88 64c9.6 6.9 22.7 5.9 31.1-2.4l3.9-3.9c13.5-13.5 31.8-21.1 50.9-21.1l46.3 0-91.7 91.7c-15.6 15.6-15.6 40.9 0 56.6l.8 .8C218 308 294 308 340.9 261.1l27.1-27.1 97.8 97.8c15.6 15.6 15.6 40.9 0 56.6l-9.8 9.8-31-31c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l28 28c-17.5 10.4-37.2 16.7-57.6 18.5L313 399c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l15 15-3.8 0c-36.1 0-70.7-14.3-96.2-39.8L65 279c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9L160.2 442.1c34.5 34.5 81.3 53.9 130.1 53.9l51.8 0 1 1 1-1 5.7 0c48.8 0 95.6-19.4 130.1-53.9l19.9-19.9c1.2-1.2 2.3-2.3 3.4-3.5 .7-.5 1.3-1.1 1.9-1.7L609 313c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-53.8 53.8c-4.2-12.8-11.3-24.9-21.5-35.1L385 183c-9.4-9.4-24.6-9.4-33.9 0l-44.1 44.1c-26.5 26.5-68.5 28-96.7 4.6l98.7-98.7c13.4-13.4 31.6-21 50.6-21.1l8.5 0 .2 0 50.8 0c14.2 0 28.1 4.2 39.9 12.1L482.7 140c8.4 5.6 19.3 5.3 27.4-.6l88-64z" />
  </svg>
)

const BalanceIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" className={nb('balanceIcon')} aria-hidden="true">
    <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
  </svg>
)

const SettingsIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={nb('actionIcon')} aria-hidden="true">
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const AvatarFallbackIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className={nb('avatarIcon')} aria-hidden="true">
    <path d="M144 128a80 80 0 1 1 160 0 80 80 0 1 1 -160 0zm208 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0zM48 480c0-70.7 57.3-128 128-128l96 0c70.7 0 128 57.3 128 128l0 8c0 13.3 10.7 24 24 24s24-10.7 24-24l0-8c0-97.2-78.8-176-176-176l-96 0C78.8 304 0 382.8 0 480l0 8c0 13.3 10.7 24 24 24s24-10.7 24-24l0-8z" />
  </svg>
)

const SearchIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={nb('adminNavIcon')} aria-hidden="true">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const HamburgerIcon = (
  <svg viewBox="0 0 640 640" fill="currentColor" className={nb('mobileNavMenuToggleIcon')} aria-hidden="true">
    <path d="M64 160C64 142.3 78.3 128 96 128L480 128C497.7 128 512 142.3 512 160C512 177.7 497.7 192 480 192L96 192C78.3 192 64 177.7 64 160zM128 320C128 302.3 142.3 288 160 288L544 288C561.7 288 576 302.3 576 320C576 337.7 561.7 352 544 352L160 352C142.3 352 128 337.7 128 320zM512 480C512 497.7 497.7 512 480 512L96 512C78.3 512 64 497.7 64 480C64 462.3 78.3 448 96 448L480 448C497.7 448 512 462.3 512 480z" />
  </svg>
)

const DockResourcesIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={nb('mobileDockIcon')} aria-hidden="true">
    <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const DockOrdersIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className={nb('mobileDockIcon')} aria-hidden="true">
    <path d="M64 80c-8.8 0-16 7.2-16 16l0 320c0 8.8 7.2 16 16 16l320 0c8.8 0 16-7.2 16-16l0-320c0-8.8-7.2-16-16-16L64 80zM0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zm256 64c0 13.3-10.7 24-24 24l-112 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l112 0c13.3 0 24 10.7 24 24zm72 72c13.3 0 24 10.7 24 24s-10.7 24-24 24l-208 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l208 0zM192 352c0 13.3-10.7 24-24 24l-48 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l48 0c13.3 0 24 10.7 24 24z" />
  </svg>
)

const DockChatIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={nb('mobileDockIcon')} aria-hidden="true">
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const DockCartIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={nb('mobileDockIcon')} aria-hidden="true">
    <circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2" />
    <circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2" />
    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const DockPurchasesIcon = (
  <svg viewBox="0 0 24 24" fill="none" className={nb('mobileDockIcon')} aria-hidden="true">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 6h18M16 10a4 4 0 11-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const LangGlyphActionIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" className={nb('actionIcon')} aria-hidden="true">
    <path d="M168 0c13.3 0 24 10.7 24 24l0 56 136 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-16.2 0-16.5 38.4c-18.6 43.5-45.2 82.8-77.9 116 13.9 9.2 28.6 17.4 44 24.4l60.9 27.9 71.8-160.5C398 165.6 406.5 160 416 160s18 5.6 21.9 14.2l136 304c5.4 12.1 0 26.3-12.1 31.7s-26.3 0-31.7-12.1l-29.4-65.8-169.3 0-29.4 65.8c-5.4 12.1-19.6 17.5-31.7 12.1s-17.5-19.6-12.1-31.7l44.6-99.7-61.3-28.1c-21.5-9.9-41.9-21.7-60.9-35.2-17.5 13.6-36.3 25.7-56.2 36.1L67.1 381.3c-11.7 6.2-26.2 1.6-32.4-10.1s-1.6-26.2 10.1-32.4L102 308.8c14-7.3 27.4-15.7 40.1-24.8-27.5-25.6-51.1-55.2-70-88-6.6-11.5-2.7-26.2 8.8-32.8s26.2-2.7 32.8 8.8c17.4 30.3 39.5 57.5 65.4 80.7 30.5-29.8 55.1-65.5 72.2-105.3L259.6 128 24 128c-13.3 0-24-10.7-24-24S10.8 80 24 80l120 0 0-56c0-13.3 10.7-24 24-24zM479.2 384L416 242.8 352.8 384 479.2 384z" />
  </svg>
)

function isResourceFormDockPath(p: string): boolean {
  return (
    p === '/resource/create' ||
    p === '/resource/create-free' ||
    p === '/resource/combo/create' ||
    /^\/resource\/combo\/[^/]+\/?$/.test(p) ||
    /^\/resources\/[^/]+\/edit\/?$/.test(p) ||
    p === '/subscriptions/create' ||
    /^\/subscriptions\/[^/]+\/edit\/?$/.test(p)
  )
}

export function Navbar() {
  const tr = useT()
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const current = (document.documentElement.getAttribute('data-theme') as Theme) || 'dark'
    setTheme(current)
  }, [])

  const toggleTheme = useCallback(() => {
    const next: Theme = (document.documentElement.getAttribute('data-theme') as Theme) === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem('theme', next)
      document.cookie = `theme=${next};path=/;max-age=31536000;SameSite=Lax`
    } catch {}
    setTheme(next)
  }, [])

  const isDark = theme === 'dark'
  const themeAria = isDark ? tr('Переключить на светлую тему') : tr('Переключить на тёмную тему')
  const themeGlyph = isDark ? SunIcon : MoonIcon

  const shell = useShell()
  const signIn = useSignInDrawer()
  const { user } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const activePath = pathname.replace(/^\/(ru|uk|en)(?=\/|$)/, '') || '/'
  const isResourcesActive = activePath === '/resources' || activePath.startsWith('/resources/')
  const isOrdersActive = activePath === '/orders' || activePath.startsWith('/orders/')
  const anyNavActive = isResourcesActive || isOrdersActive
  const isChatActive = activePath === '/chat' || activePath.startsWith('/chat/')
  const isCartActive = activePath === '/cart' || activePath.startsWith('/cart/')
  const isPurchasesActive = activePath === '/purchases' || activePath.startsWith('/purchases/')
  const [langOpen, setLangOpen] = useState(false)
  const [currentLocale, setCurrentLocale] = useState('ru')
  const [isNarrow, setIsNarrow] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [panelLangOpen, setPanelLangOpen] = useState(false)
  const langWrapRef = useRef<HTMLSpanElement>(null)
  const panelLangWrapRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    setCurrentLocale(document.documentElement.lang || 'ru')
    setIsMobile(document.documentElement.getAttribute('data-nav-form-factor') === 'mobile')
    const root = document.documentElement
    const read = () => setIsMobile(root.getAttribute('data-nav-form-factor') === 'mobile')
    const mo = new MutationObserver(read)
    mo.observe(root, { attributes: true, attributeFilter: ['data-nav-form-factor'] })
    return () => mo.disconnect()
  }, [])

  const compact = isMobile || isNarrow

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(max-width: 720px)')
    const apply = () => setIsNarrow(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    if (!compact) setMobileMenuOpen(false)
  }, [compact])
  useEffect(() => {
    setMobileMenuOpen(false)
    setPanelLangOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const toggleClass = nb('mobileNavMenuToggle')
    const onPointerDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null
      if (!t) return
      if (t.closest('#navbar-mobile-actions') || t.closest('.' + toggleClass)) return
      setMobileMenuOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    if (!langOpen) return
    const onPointerDown = (e: MouseEvent) => {
      if (langWrapRef.current && !langWrapRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLangOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [langOpen])

  useEffect(() => {
    if (!panelLangOpen) return
    const onPointerDown = (e: MouseEvent) => {
      if (panelLangWrapRef.current && !panelLangWrapRef.current.contains(e.target as Node)) setPanelLangOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPanelLangOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [panelLangOpen])

  const switchLocale = useCallback(
    (loc: string) => {
      try {
        document.cookie = `NEXT_LOCALE=${loc};path=/;max-age=31536000;SameSite=Lax`
      } catch {}
      const stripped = pathname.replace(/^\/(ru|uk|en)(?=\/|$)/, '') || ''
      window.location.assign(`/${loc}${stripped}`)
    },
    [pathname],
  )

  const authed = user != null
  const balance = user?.balance ?? 0
  const payable = user?.payable ?? 0
  const avatarImage = user?.image ?? null

  const STAFF_ROLES = ['MODERATOR', 'SECURITY', 'AGENT', 'DEVELOPER']
  const isStaff =
    user != null &&
    (STAFF_ROLES.includes(user.role) || (Array.isArray(user.roles) && user.roles.some((r) => STAFF_ROLES.includes(r))))

  const AdminPanelIcon = (
    <svg viewBox="0 0 24 24" fill="none" className={nb('adminNavIcon')} aria-hidden="true">
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

  const [notifUnread, setNotifUnread] = useState(0)

  useEffect(() => {
    if (!authed) {
      setNotifUnread(0)
      return
    }
    let cancelled = false
    let retryUntil = 0
    const controller = new AbortController()

    const poll = async () => {
      if (Date.now() < retryUntil) return
      try {
        const res = await fetch('/api/notifications?unread=1', {
          credentials: 'include',
          cache: 'no-store',
          signal: controller.signal,
          headers: { accept: 'application/json' },
        })
        if (res.status === 429) {
          const retryAfter = Number(res.headers.get('Retry-After')) || 60
          retryUntil = Date.now() + retryAfter * 1000
          return
        }
        if (!res.ok) return
        const data = (await res.json().catch(() => null)) as
          | { total?: number; notifications?: unknown[] }
          | null
        if (cancelled || !data) return
        const total =
          typeof data.total === 'number' && Number.isFinite(data.total)
            ? data.total
            : Array.isArray(data.notifications)
              ? data.notifications.length
              : 0
        setNotifUnread(total)
      } catch {
      }
    }

    void poll()
    const onFocus = () => void poll()
    const onVisible = () => {
      if (document.visibilityState === 'visible') void poll()
    }
    const onNotificationsRead = () => void poll()
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('stelix:notifications-read', onNotificationsRead)
    return () => {
      cancelled = true
      controller.abort()
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('stelix:notifications-read', onNotificationsRead)
    }
  }, [authed])

  const messagesBadge =
    notifUnread > 0 ? (
      <span className={nb('navIconBadge', 'navIconBadgeAccent')} aria-hidden="true">
        <span className={nb('navIconBadgeInner')}>{notifUnread > 99 ? '99+' : notifUnread}</span>
      </span>
    ) : null

  const accountChip = (
    <div className={nb('accountChip')}>
      <Link
        className={nb('accountChipBalance')}
        aria-label={`Баланс: ${balance}, на выплату: ${payable}`}
        data-onboarding="balance"
        data-tooltip-trigger=""
        href="/withdrawals"
      >
        {BalanceIcon}
        <span className={nb('balanceValue')}>{balance}</span>
      </Link>
      <div className={nb('accountChipSettingsOverlay')}>
        <button type="button" className={nb('accountChipSettingsButton')} aria-label={tr('Настройка профиля')} data-tooltip-trigger="" onClick={() => router.push('/profile')}>
          {SettingsIcon}
        </button>
      </div>
      <div className={nb('accountChipAvatarCluster')}>
        <Link className={`${nb('accountChipProfile')} `} aria-label={tr('Мой профиль')} data-tooltip-trigger="" href="/profile">
          {avatarImage ? (
            <div className={nb('avatar', 'avatarHasImage')} data-onboarding="profile">
              <img className={nb('avatarImg')} src={avatarImage} alt="" decoding="async" />
            </div>
          ) : (
            <div className={nb('avatar')} data-onboarding="profile">
              {AvatarFallbackIcon}
            </div>
          )}
        </Link>
      </div>
    </div>
  )

  const userActionsCluster = (interactive: boolean) => (
    <div className={nb('userActionsDesktop')}>
      <div className={nb('userActions')}>
        <button
          type="button"
          className={nb('themeToggle')}
          data-onboarding="theme"
          aria-label={interactive ? themeAria : tr('Переключить на светлую тему')}
          data-tooltip-trigger=""
          onClick={interactive ? toggleTheme : undefined}
        >
          {interactive ? themeGlyph : SunIcon}
        </button>
        <div className={nb('navIconSlideGroup')}>
          <span className={nb('iconWithBadge')}>
            <Link className={`${nb('iconButton')} `} aria-label={tr('Сообщения')} data-onboarding="messages" data-tooltip-trigger="" href="/chat">
              {ChatIcon}
            </Link>
            {messagesBadge}
          </span>
          <span className={nb('iconWithBadge')}>
            <Link className={`${nb('iconButton')} `} aria-label={tr('Корзина')} data-onboarding="cart" data-tooltip-trigger="" href="/cart">
              {CartIcon}
            </Link>
          </span>
          <span className={nb('iconWithBadge')}>
            <Link className={`${nb('iconButton')} `} aria-label={tr('Покупки')} data-onboarding="purchases" data-tooltip-trigger="" href="/purchases">
              {PurchasesIcon}
            </Link>
          </span>
          <span className={nb('navLinksIndicator')} aria-hidden="true" style={{ width: 0, transform: 'translateX(0px)' }} />
        </div>
        {isStaff ? (
          <Link
            className={nb('adminNavLink', 'adminNavLinkActive')}
            aria-label={tr('Админ-панель')}
            data-tooltip-trigger=""
            href="/admin"
            style={{ display: 'inline-flex' }}
          >
            {AdminPanelIcon}
          </Link>
        ) : null}
        <Link className={nb('adminNavLink', 'adminNavLinkInMobilePanel')} aria-label={tr('Мои ресурсы')} data-tooltip-trigger="" href="/seller">
          {SellerIcon}
        </Link>
        {accountChip}
      </div>
    </div>
  )

  const menuToggleAria = mobileMenuOpen
    ? tr('Закрыть меню аккаунта')
    : notifUnread > 0
      ? tr('Открыть меню аккаунта, непрочитанных: {count}').replace('{count}', String(notifUnread))
      : tr('Открыть меню аккаунта')

  const compactSearchButton = (
    <button type="button" className={nb('adminNavLink')} data-onboarding="search" aria-label={tr('Поиск')} data-tooltip-trigger="" onClick={shell.openSearch}>
      {SearchIcon}
    </button>
  )

  const mobilePanelLanguage = (
    <span ref={panelLangWrapRef} className={nb('languageButtonTooltipWrap')} data-tooltip-trigger="">
      <button
        type="button"
        className={panelLangOpen ? `${nb('iconButton', 'activeIcon')} ${pop('popoverTrigger')}` : `${nb('iconButton')} ${pop('popoverTrigger')}`}
        aria-label={tr('Язык')}
        aria-haspopup="listbox"
        data-onboarding="language"
        aria-expanded={panelLangOpen}
        onClick={() => setPanelLangOpen((v) => !v)}
      >
        {LangGlyphActionIcon}
      </button>
      {panelLangOpen && (
        <div className={nb('navbarLangFlags')} role="listbox" aria-label={tr('Язык')}>
          {locales.map((code) => (
            <button
              key={code}
              type="button"
              role="option"
              aria-selected={code === currentLocale}
              aria-label={localeMeta[code].label}
              className={code === currentLocale ? nb('navbarLangFlagButton', 'navbarLangFlagButtonActive') : nb('navbarLangFlagButton')}
              onClick={() => {
                switchLocale(code)
                setPanelLangOpen(false)
              }}
            >
              <img src={localeMeta[code].flag} alt="" width={20} height={20} className={nb('navbarLangFlag')} />
            </button>
          ))}
        </div>
      )}
    </span>
  )

  const mobileDock = (
    <nav className={nb('mobileDock')} aria-label={tr('Нижнее меню')}>
      <div className={nb('mobileDockRow')}>
        <Link className={isResourcesActive ? nb('mobileDockItem', 'mobileDockItemActive') : nb('mobileDockItem')} aria-label={tr('Ресурсы')} aria-current={isResourcesActive ? 'page' : undefined} href="/resources">
          <span className={nb('mobileDockIconSlot')}>{DockResourcesIcon}</span>
        </Link>
        <Link className={isOrdersActive ? nb('mobileDockItem', 'mobileDockItemActive') : nb('mobileDockItem')} aria-label={tr('Заказы')} aria-current={isOrdersActive ? 'page' : undefined} href="/orders">
          <span className={nb('mobileDockIconSlot')}>{DockOrdersIcon}</span>
        </Link>
        <Link className={isChatActive ? nb('mobileDockItem', 'mobileDockItemActive') : nb('mobileDockItem')} aria-label={tr('Сообщения')} aria-current={isChatActive ? 'page' : undefined} data-onboarding="messages" href="/chat">
          <span className={nb('mobileDockIconSlot')}>
            {DockChatIcon}
            {notifUnread > 0 ? (
              <span className={nb('navIconBadge', 'navIconBadgeAccent')} aria-hidden="true">
                <span className={nb('navIconBadgeInner')}>{notifUnread > 99 ? '99+' : notifUnread}</span>
              </span>
            ) : null}
          </span>
        </Link>
        <Link className={isCartActive ? nb('mobileDockItem', 'mobileDockItemActive') : nb('mobileDockItem')} aria-label={tr('Корзина')} aria-current={isCartActive ? 'page' : undefined} data-onboarding="cart" href="/cart">
          <span className={nb('mobileDockIconSlot')}>{DockCartIcon}</span>
        </Link>
        <Link className={isPurchasesActive ? nb('mobileDockItem', 'mobileDockItemActive') : nb('mobileDockItem')} aria-label={tr('Покупки')} aria-current={isPurchasesActive ? 'page' : undefined} data-onboarding="purchases" href="/purchases">
          <span className={nb('mobileDockIconSlot')}>{DockPurchasesIcon}</span>
        </Link>
        <span className={nb('mobileDockIndicator')} aria-hidden="true" style={{ width: 0, transform: 'translateX(0px)' }} />
      </div>
    </nav>
  )

  const showMobileDock = isMobile && !isResourceFormDockPath(activePath)

  return (
    <nav id="app-navbar" className={isMobile ? nb('navbar', 'navbarMobileLayout') : nb('navbar')}>
      <div data-nosnippet="true">
        <section className={compact ? nb('container', 'navbarRightCompact') : nb('container')}>
          <div className={nb('left')}>
            <span className={nb('logoHolidayAnchor')}>
              <Link className={nb('logo')} aria-label="Stelix Team" href="/">
                {isMobile ? (
                  <span className={nb('logoMobileIcons')} aria-hidden="true">
                    <img alt="" loading="lazy" width={32} height={32} decoding="async" data-nimg="1" className={nb('logoMobileIconLight')} style={{ color: 'transparent' }} src="/icons/logo_light_bk.svg" />
                    <img alt="" loading="lazy" width={32} height={32} decoding="async" data-nimg="1" className={nb('logoMobileIconDark')} style={{ color: 'transparent' }} src="/icons/logo_dark_bk.svg" />
                  </span>
                ) : (
                <span className={nb('logoDesktop')} aria-hidden="true">
                  <span className={nb('logoDesktopStack')}>
                    <span className={nb('logoDesktopThemeLight')}>
                      <img alt="" width={190} height={20} decoding="async" data-nimg="1" className={nb('logoDesktopBase')} style={{ color: 'transparent' }} src="/icons/stelixteam_light.svg" />
                      <img alt="" width={190} height={20} decoding="async" data-nimg="1" className={nb('logoDesktopHover')} style={{ color: 'transparent' }} src="/icons/stelixteam_light_hover.svg" />
                    </span>
                    <span className={nb('logoDesktopThemeDark')}>
                      <img alt="" width={190} height={20} decoding="async" data-nimg="1" className={nb('logoDesktopBase')} style={{ color: 'transparent' }} src="/icons/stelixteam_dark.svg" />
                      <img alt="" width={190} height={20} decoding="async" data-nimg="1" className={nb('logoDesktopHover')} style={{ color: 'transparent' }} src="/icons/stelixteam_dark_hover.svg" />
                    </span>
                  </span>
                </span>
                )}
              </Link>
            </span>
            <div className={nb('navLinks', 'navbarReveal')}>
              <Link className={isResourcesActive ? nb('navLink', 'active') : nb('navLink')} aria-current={isResourcesActive ? 'page' : undefined} data-onboarding="resources" href="/resources">{tr('Ресурсы')}</Link>
              <Link className={isOrdersActive ? nb('navLink', 'active') : nb('navLink')} aria-current={isOrdersActive ? 'page' : undefined} data-onboarding="orders" href="/orders">{tr('Заказы')}</Link>
              <span className={anyNavActive ? nb('navLinksIndicator', 'navLinksIndicatorVisible') : nb('navLinksIndicator')} aria-hidden="true" style={{ width: 0, transform: 'translateX(0px)' }} />
            </div>
          </div>

          <div className={nb('center')}>
            <div className={nb('centerDesktop', 'navbarReveal')}>
              <div className={nb('centerDesktopActions')}>
                <div className={nb('centerDesktopSearchWrap')}>
                  <button type="button" className={nb('adminNavLink')} data-onboarding="search" aria-label={tr('Поиск')} data-tooltip-trigger="" onClick={shell.openSearch}>
                    {SearchIcon}
                  </button>
                </div>
                <div className={nb('centerDesktopCreateWrap')}>
                  {authed ? (
                    <Link className={nb('uploadButton')} aria-label={tr('Мои ресурсы')} data-onboarding="seller" href="/seller">
                      <span className={nb('uploadText')}>{tr('Мои ресурсы')}</span>
                    </Link>
                  ) : (
                    <Link className={nb('uploadButton')} aria-label={tr('Продавец — чтобы выкладывать ресурсы')} data-onboarding="seller" href="/seller/application">
                      <span className={nb('uploadText')}>{tr('Начать продавать')}</span>
                    </Link>
                  )}
                </div>
              </div>
              {!isMobile && (
              <span ref={langWrapRef} className={nb('languageButtonTooltipWrap')} data-tooltip-trigger="" style={{ position: 'relative' }}>
                <button type="button" className={`${nb('adminNavLink', 'adminNavLinkInCenter')} ${pop('popoverTrigger')}`} aria-label={tr('Язык')} aria-haspopup="listbox" data-onboarding="language" aria-expanded={langOpen} onClick={() => setLangOpen((v) => !v)}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" className={nb('adminNavIcon')} aria-hidden="true">
                    <path d="M168 0c13.3 0 24 10.7 24 24l0 56 136 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-16.2 0-16.5 38.4c-18.6 43.5-45.2 82.8-77.9 116 13.9 9.2 28.6 17.4 44 24.4l60.9 27.9 71.8-160.5C398 165.6 406.5 160 416 160s18 5.6 21.9 14.2l136 304c5.4 12.1 0 26.3-12.1 31.7s-26.3 0-31.7-12.1l-29.4-65.8-169.3 0-29.4 65.8c-5.4 12.1-19.6 17.5-31.7 12.1s-17.5-19.6-12.1-31.7l44.6-99.7-61.3-28.1c-21.5-9.9-41.9-21.7-60.9-35.2-17.5 13.6-36.3 25.7-56.2 36.1L67.1 381.3c-11.7 6.2-26.2 1.6-32.4-10.1s-1.6-26.2 10.1-32.4L102 308.8c14-7.3 27.4-15.7 40.1-24.8-27.5-25.6-51.1-55.2-70-88-6.6-11.5-2.7-26.2 8.8-32.8s26.2-2.7 32.8 8.8c17.4 30.3 39.5 57.5 65.4 80.7 30.5-29.8 55.1-65.5 72.2-105.3L259.6 128 24 128c-13.3 0-24-10.7-24-24S10.8 80 24 80l120 0 0-56c0-13.3 10.7-24 24-24zM479.2 384L416 242.8 352.8 384 479.2 384z" />
                  </svg>
                </button>
                {langOpen && (
                  <span
                    className={pop('popoverContentRoot')}
                    role="listbox"
                    aria-label={tr('Язык')}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 0.45rem)',
                      right: 0,
                      zIndex: 60,
                      minWidth: '170px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      padding: '4px',
                      background: 'var(--bg-default)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
                    }}
                  >
                    {locales.map((code) => (
                      <button
                        key={code}
                        type="button"
                        role="option"
                        aria-selected={code === currentLocale}
                        className={pop('popoverPanelButton')}
                        onClick={() => switchLocale(code)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      >
                        <img src={localeMeta[code].flag} alt="" width={20} height={20} />
                        <span>{localeMeta[code].label}</span>
                      </button>
                    ))}
                  </span>
                )}
              </span>
              )}
            </div>
          </div>

          <div className={nb('right')}>
            {authed ? (
              <>
                <div className={nb('rightExpandedMeasure')} aria-hidden="true">
                  {userActionsCluster(false)}
                </div>
                <div className={nb('navbarRightReveal')}>
                  {compact ? (
                    <>
                      {isMobile ? compactSearchButton : null}
                      <span className={nb('iconWithBadge', 'mobileNavMenuWrap')}>
                        <button
                          type="button"
                          className={nb('mobileNavMenuToggle')}
                          aria-label={menuToggleAria}
                          aria-controls="navbar-mobile-actions"
                          aria-expanded={mobileMenuOpen}
                          data-tooltip-trigger=""
                          onClick={() => setMobileMenuOpen((v) => !v)}
                        >
                          {HamburgerIcon}
                        </button>
                        {notifUnread > 0 ? (
                          <span className={nb('navIconBadge', 'navIconBadgeAccent')} aria-hidden="true">
                            <span className={nb('navIconBadgeInner')}>{notifUnread > 99 ? '99+' : notifUnread}</span>
                          </span>
                        ) : null}
                      </span>
                      <div className={nb('userActionsMobileAccount')}>{accountChip}</div>
                    </>
                  ) : (
                    userActionsCluster(true)
                  )}
                </div>
              </>
            ) : (
              <div className={nb('navbarRightReveal')}>
                <div className={nb('themeToggleBar')}>
                  <button
                    type="button"
                    className={nb('themeToggle')}
                    data-onboarding="theme"
                    aria-label={themeAria}
                    data-tooltip-trigger=""
                    onClick={toggleTheme}
                  >
                    {themeGlyph}
                  </button>
                </div>
                <button className={btn('button', 'primary') + ' ' + nb('loginButton')} onClick={signIn.open}>{tr('Войти')}</button>
              </div>
            )}
          </div>
        </section>

        {authed && (
          <>
            {mobileMenuOpen ? (
              <button type="button" className={nb('mobileNavMenuBackdrop')} aria-label={tr('Закрыть меню аккаунта')} onClick={() => setMobileMenuOpen(false)} />
            ) : null}
            <div id="navbar-mobile-actions" className={nb('mobileNavMenuPanel')} role="region" aria-label={tr('Открыть меню аккаунта')} hidden={!mobileMenuOpen}>
              <div className={nb('mobileNavMenuPanelInner')}>
                <div className={nb('mobileNavMenuPanelTheme')}>
                  <button
                    type="button"
                    className={nb('themeToggle')}
                    data-onboarding="theme"
                    aria-label={themeAria}
                    data-tooltip-trigger=""
                    onClick={toggleTheme}
                  >
                    {themeGlyph}
                  </button>
                </div>
                <div className={nb('userActions')}>
                  {isMobile ? (
                    <>
                      {mobilePanelLanguage}
                      <span className={nb('iconWithBadge')}>
                        <Link className={`${nb('iconButton')} `} aria-label={tr('Корзина')} data-onboarding="cart" data-tooltip-trigger="" href="/cart">
                          {CartIcon}
                        </Link>
                      </span>
                      <Link className={nb('adminNavLink', 'adminNavLinkInMobilePanel')} aria-label={tr('Мои ресурсы')} data-tooltip-trigger="" href="/seller">
                        {SellerIcon}
                      </Link>
                    </>
                  ) : (
                    <>
                      <span className={nb('iconWithBadge')}>
                        <Link className={`${nb('iconButton')} `} aria-label={tr('Сообщения')} data-onboarding="messages" data-tooltip-trigger="" href="/chat">
                          {ChatIcon}
                        </Link>
                        {messagesBadge}
                      </span>
                      <span className={nb('iconWithBadge')}>
                        <Link className={`${nb('iconButton')} `} aria-label={tr('Корзина')} data-onboarding="cart" data-tooltip-trigger="" href="/cart">
                          {CartIcon}
                        </Link>
                      </span>
                      <span className={nb('iconWithBadge')}>
                        <Link className={`${nb('iconButton')} `} aria-label={tr('Покупки')} data-onboarding="purchases" data-tooltip-trigger="" href="/purchases">
                          {PurchasesIcon}
                        </Link>
                      </span>
                      <Link className={nb('adminNavLink', 'adminNavLinkInMobilePanel')} aria-label={tr('Мои ресурсы')} data-tooltip-trigger="" href="/seller">
                        {SellerIcon}
                      </Link>
                    </>
                  )}
                  {isStaff ? (
                    <Link
                      className={nb('adminNavLink', 'adminNavLinkActive')}
                      aria-label={tr('Админ-панель')}
                      data-tooltip-trigger=""
                      href="/admin"
                      style={{ display: 'inline-flex' }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {AdminPanelIcon}
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </>
        )}

        {showMobileDock && mobileDock}

        <div className={nb('navbarLayoutMeasure')} aria-hidden="true" data-nosnippet="true">
          <div className={nb('navbarLayoutMeasureLeft')}>
            <span className={nb('logo')}>
              <span className={nb('logoDesktop')}>
                <img alt="" loading="lazy" width={190} height={20} decoding="async" data-nimg="1" className={nb('logoDesktopMeasure')} style={{ color: 'transparent' }} src="/icons/stelixteam_light.svg" />
              </span>
            </span>
            <div className={nb('navLinks')}>
              <span className={nb('navLink')}>{tr('Ресурсы')}</span>
              <span className={nb('navLink')}>{tr('Заказы')}</span>
            </div>
          </div>
          <div className={nb('navbarLayoutMeasureLeft', 'navbarLayoutMeasureLeftIcon')}>
            <span className={nb('logo')}>
              <span className={nb('logoMobileIcons')}>
                <img alt="" loading="lazy" width={32} height={32} decoding="async" data-nimg="1" className={nb('logoMobileIconLight')} style={{ color: 'transparent' }} src="/icons/logo_light_bk.svg" />
                <img alt="" loading="lazy" width={32} height={32} decoding="async" data-nimg="1" className={nb('logoMobileIconDark')} style={{ color: 'transparent' }} src="/icons/logo_dark_bk.svg" />
              </span>
            </span>
            <div className={nb('navLinks')}>
              <span className={nb('navLink')}>{tr('Ресурсы')}</span>
              <span className={nb('navLink')}>{tr('Заказы')}</span>
            </div>
          </div>
          <div className={nb('centerDesktopActions')}>
            <span className={nb('adminNavLink')}>
              {SearchIcon}
            </span>
            <span className={nb('uploadButton')}>
              <span className={nb('uploadText')}>{authed ? tr('Мои ресурсы') : tr('Начать продавать')}</span>
            </span>
          </div>
          <div className={nb('navbarLayoutMeasureRight')}>
            <span className={nb('mobileNavMenuToggle')}>
              {HamburgerIcon}
            </span>
            <div className={nb('userActionsMobileAccount')}>
              <div className={nb('accountChip')}>
                <Link
                  className={nb('accountChipBalance')}
                  aria-label={authed ? `Баланс: ${balance}, на выплату: ${payable}` : tr('Баланс: 0')}
                  data-onboarding="balance"
                  data-tooltip-trigger=""
                  href="/withdrawals"
                >
                  {BalanceIcon}
                  <span className={nb('balanceValue')}>{balance}</span>
                </Link>
                <div className={nb('accountChipSettingsOverlay')}>
                  <button type="button" className={nb('accountChipSettingsButton')} aria-label={tr('Настройка профиля')} data-tooltip-trigger="">
                    {SettingsIcon}
                  </button>
                </div>
                <div className={nb('accountChipAvatarCluster')}>
                  <Link className={`${nb('accountChipProfile')} `} aria-label={tr('Мой профиль')} data-tooltip-trigger="" href="/profile">
                    {authed && avatarImage ? (
                      <div className={nb('avatar', 'avatarHasImage')} data-onboarding="profile">
                        <img className={nb('avatarImg')} src={avatarImage} alt="" decoding="async" />
                      </div>
                    ) : (
                      <div className={nb('avatar')} data-onboarding="profile">
                        {AvatarFallbackIcon}
                      </div>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className={nb('navbarLayoutMeasureRight')}>
            <div className={nb('themeToggleBar')}>
              <button type="button" className={nb('themeToggle')} data-onboarding="theme" aria-label={tr('Переключить на светлую тему')} data-tooltip-trigger="">
                {SunIcon}
              </button>
            </div>
            <button className={btn('button', 'primary') + ' ' + nb('loginButton')}>{tr('Войти')}</button>
          </div>
        </div>
      </div>
    </nav>
  )
}
