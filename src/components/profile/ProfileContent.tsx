'use client'


import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { ProfileSkeleton } from './ProfileSkeleton'


const pf = (...n: string[]) => n.map((x) => `Profile-module__MITPoG__${x}`).join(' ')
const phb = (...n: string[]) => n.map((x) => `PageHeaderBar-module__1SDZQW__${x}`).join(' ')
const pp = (...n: string[]) => n.map((x) => `PublicProfile-module__j5FkGG__${x}`).join(' ')
const ap = (...n: string[]) => n.map((x) => `AdminPanel-module__8pW_9a__${x}`).join(' ')
const arc = (...n: string[]) => n.map((x) => `AddResourceContent-module__UdTvSa__${x}`).join(' ')
const pop = (...n: string[]) => n.map((x) => `Popover-module__Nt1uSa__${x}`).join(' ')


interface SellerRating {
  avg: number
  count: number
}

interface ProfileBundle {
  settings: { hidePersonalData: boolean }
  security: { hasPinSet: boolean; twoFactorEnabled: boolean }
  user: {
    id: number
    name: string
    email: string
    image: string | null
    role: string
    status: number
    balance: number
  }
  stats: {
    purchases: number
    orders: number
    transactions: number
    deposits: number
    sessions: number
    sellerRating: SellerRating
  }
}


const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  USER: { label: 'Новичок', color: 'rgb(52, 187, 230)' },
  SELLER: { label: 'Продавец', color: 'rgb(163, 113, 247)' },
  SELLER_PLUS: { label: 'Продавец+', color: 'rgb(245, 158, 11)' },
  MODERATOR: { label: 'Модератор', color: 'rgb(168, 85, 247)' },
  ADMIN: { label: 'Администратор', color: 'rgb(239, 68, 68)' },
}

function roleMeta(role: string) {
  return ROLE_LABELS[role] ?? ROLE_LABELS.USER
}


function LinkChip({
  href,
  provider,
  label,
  external = true,
}: {
  href: string
  provider: string
  label: string
  external?: boolean
}) {
  const extra: { target?: string; rel?: string } = external ? { target: '_blank', rel: 'noopener noreferrer' } : {}
  return (
    <a href={href} {...extra} className={pf('bindingChip', 'bindingChipLink')} data-tooltip-trigger="">
      <img
        alt=""
        loading="lazy"
        width={18}
        height={18}
        decoding="async"
        data-nimg="1"
        className={pf('bindingBrandImg')}
        src={`/icons/oauth/${provider}.svg`}
        style={{ color: 'transparent' }}
      />
      <span className={pf('bindingLabel')}>{label}</span>
    </a>
  )
}


function EmptyBrandChip({ provider, label }: { provider: string; label: string }) {
  return (
    <button type="button" className={pf('bindingChip', 'bindingChipEmpty', 'bindingChipButton')} data-tooltip-trigger="">
      <img
        alt=""
        loading="lazy"
        width={18}
        height={18}
        decoding="async"
        data-nimg="1"
        className={pf('bindingBrandImg')}
        src={`/icons/oauth/${provider}.svg`}
        style={{ color: 'transparent' }}
      />
      <span className={pf('bindingLabel')}>{label}</span>
    </button>
  )
}

export function ProfileContent() {
  const router = useRouter()
  const { user, loading: authLoading, logout } = useAuth()

  const [bundle, setBundle] = useState<ProfileBundle | null>(null)
  const [profileError, setProfileError] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)


  const [hidePersonal, setHidePersonal] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)


  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)


  const navRef = useRef<HTMLElement>(null)
  const [indicator, setIndicator] = useState<{ width: number; x: number } | null>(null)


  useEffect(() => {
    if (authLoading) return
    if (!user) return
    const controller = new AbortController()
    setProfileError(false)
    fetch('/api/profile', { signal: controller.signal, headers: { accept: 'application/json' } })
      .then((r) => {
        if (!r.ok) throw new Error(`profile HTTP ${r.status}`)
        return r.json() as Promise<ProfileBundle>
      })
      .then((prof) => {
        setBundle(prof)
        setHidePersonal(prof.settings.hidePersonalData)
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setProfileError(true)
      })
    return () => controller.abort()
  }, [authLoading, user])


  useEffect(() => {
    if (!bundle) return
    const measure = () => {
      const nav = navRef.current
      if (!nav) return
      const active = nav.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')
      if (!active) return
      const navRect = nav.getBoundingClientRect()
      const rect = active.getBoundingClientRect()
      setIndicator({ width: rect.width, x: rect.left - navRect.left })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [bundle])


  const saveHidePersonal = useCallback(async () => {
    if (savingSettings) return
    const next = !hidePersonal
    setHidePersonal(next)
    setSavingSettings(true)
    try {
      const res = await fetch('/api/profile/settings', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hidePersonalData: next }),
      })
      if (!res.ok) throw new Error(`profile/settings HTTP ${res.status}`)
    } catch {
      setHidePersonal(!next)
    } finally {
      setSavingSettings(false)
    }
  }, [hidePersonal, savingSettings])


  const onLogout = useCallback(async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await logout()
      router.push('/')
    } finally {
      setLoggingOut(false)
    }
  }, [logout, loggingOut, router])

  const toggleAvatarMenu = useCallback(() => setAvatarMenuOpen((v) => !v), [])
  const onAvatarKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setAvatarMenuOpen((v) => !v)
    }
  }, [])


  if (authLoading || !user || (!bundle && !profileError)) {
    return <ProfileSkeleton />
  }

  if (profileError || !bundle) {
    return (
      <section className={pf('profile')}>
        <div className={'container ' + pf('container')}>
          <div className={pf('empty')} role="alert" style={{ padding: '4rem 0' }}>
            <svg viewBox="0 0 24 24" fill="none" className={pf('emptyIcon')} aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p className={pf('emptyText')}>Не удалось загрузить профиль. Обновите страницу и попробуйте снова.</p>
          </div>
        </div>
      </section>
    )
  }

  const { stats } = bundle
  const role = roleMeta(user.role)
  const rating = stats.sellerRating
  const hasRating = rating.count > 0
  const blocked = user.status !== 0
  const displayName = user.name || bundle.user.name || 'профиль'
  const verifiedSites = (user.verifiedSites ?? []) as string[]

  const tabs = [
    { key: 'purchases', label: 'Покупки', href: '/profile', count: stats.purchases },
    { key: 'orders', label: 'Заказы', href: '/profile/orders', count: stats.orders },
    { key: 'transactions', label: 'Транзакции', href: '/profile/transactions', count: stats.transactions },
    { key: 'deposits', label: 'Платежи', href: '/profile/deposits', count: stats.deposits },
    { key: 'sessions', label: 'Авторизация', href: '/profile/auth', count: stats.sessions },
  ]

  return (
    <section className={pf('profile')}>
      <div className={'container ' + pf('container')}>

        <header className={phb('headerBar')}>
          <div className={phb('headerBar__start')}>
            <h1 className={phb('headerBar__title')}>Мой профиль</h1>
            <span
              className={phb('headerBar__count')}
              title={String(user.id)}
              aria-label={`Идентификатор пользователя: ${user.id}`}
            >
              #{user.id}
            </span>
          </div>
          <div className={phb('headerBar__end')}>
            <span className={phb('headerBar__divider')} aria-hidden="true" />
            <div className={phb('headerBar__actions')}>
              <span className={arc('formHeaderTooltipAnchor')} data-tooltip-trigger="">
                <button
                  type="button"
                  className={ap('tableIconButton') + ' ' + arc('formHeaderTableIconButton', 'formHeaderDefaultNavIconButton')}
                  aria-label="Настройка"
                  onClick={() => void saveHidePersonal()}
                  disabled={savingSettings}
                >
                  <svg viewBox="0 0 24 24" fill="none" className={ap('tableIconButtonIcon')} aria-hidden="true">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path
                      d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </span>
              <span className={arc('formHeaderTooltipAnchor')} data-tooltip-trigger="">
                <button
                  type="button"
                  className={
                    ap('tableIconButton', 'tableIconButtonDanger') +
                    ' ' +
                    arc('formHeaderTableIconButton', 'formHeaderSemanticIconDanger')
                  }
                  aria-label="Выйти"
                  onClick={() => void onLogout()}
                  disabled={loggingOut}
                >
                  <svg viewBox="0 0 24 24" fill="none" className={ap('tableIconButtonIcon')} aria-hidden="true">
                    <path
                      d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </span>
            </div>
          </div>
        </header>


        <div className={pf('header')}>
          <div className={pf('userInfo')}>
            <div className={pf('avatarBlock')}>
              <div
                className={
                  pf('avatarLarge', user.image ? 'avatarLargeHasImage' : 'avatarLargeFallback', 'avatarLargeStatic') +
                  ' ' +
                  pop('popoverTrigger')
                }
                role="button"
                tabIndex={0}
                aria-label="Действия с фото"
                aria-expanded={avatarMenuOpen}
                onClick={toggleAvatarMenu}
                onKeyDown={onAvatarKeyDown}
              >
                {user.image ? (
                  <img
                    alt=""
                    loading="lazy"
                    width={80}
                    height={80}
                    decoding="async"
                    data-nimg="1"
                    className={pf('avatarLargeImg')}
                    src={user.image}
                    style={{ color: 'transparent' }}
                  />
                ) : (
                  <span className={pf('avatarLargeIcon')} aria-hidden="true">
                    {displayName.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className={pf('avatarLargeOverlay')} aria-hidden="true">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    fill="currentColor"
                    className={pf('avatarLargeOverlayIcon')}
                    aria-hidden="true"
                  >
                    <path d="M149.1 64.8L138.7 96H64C28.7 96 0 124.7 0 160L0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64l-74.7 0L362.9 64.8C356.4 45.2 338.1 32 317.4 32L194.6 32c-20.7 0-39 13.2-45.5 32.8zM256 192a96 96 0 1 1 0 192 96 96 0 1 1 0-192z" />
                  </svg>
                </span>
              </div>
            </div>
            <input
              accept="image/jpeg,image/png,image/webp,image/gif"
              className={pf('avatarFileInput')}
              aria-hidden="true"
              tabIndex={-1}
              type="file"
              ref={fileInputRef}
            />
            <div className={pf('userDetails')}>
              <div className={pf('userNameEmailRow')}>
                <h2 className={pf('userName')}>{displayName}</h2>
                <span className={pf('userEmail')}>{user.email}</span>
              </div>

              <div className={pf('userBindings')}>

                {verifiedSites.length > 0 ? (
                  verifiedSites.map((site) => (
                    <a
                      key={site}
                      href={/^https?:\/\//.test(site) ? site : `https://${site}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={pf('bindingChip', 'bindingChipLink', 'bindingChipSiteLink')}
                      data-tooltip-trigger=""
                    >
                      <svg viewBox="0 0 24 24" fill="none" className={pf('bindingIcon', 'bindingIconSiteVerified')} aria-hidden="true">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path
                          d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                      <span className={pf('bindingLabel')}>{site}</span>
                    </a>
                  ))
                ) : (
                  <button type="button" className={pf('bindingChip', 'bindingChipEmpty', 'bindingChipButton')} data-tooltip-trigger="">
                    <svg viewBox="0 0 24 24" fill="none" className={pf('bindingIcon')} aria-hidden="true">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <path
                        d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                    <span className={pf('bindingLabel')}>не указан</span>
                  </button>
                )}


                {user.discordId ? (
                  <LinkChip
                    href={`https://discord.com/users/${user.discordId}`}
                    provider="discord"
                    label={user.discordDisplayName ?? 'Discord'}
                  />
                ) : (
                  <EmptyBrandChip provider="discord" label="не привязан" />
                )}


                {user.steamId ? (
                  <LinkChip
                    href={`https://steamcommunity.com/profiles/${user.steamId}`}
                    provider="steam"
                    label={user.steamDisplayName ?? 'Steam'}
                  />
                ) : (
                  <EmptyBrandChip provider="steam" label="не привязан" />
                )}


                {user.googleId ? (
                  <LinkChip href={`mailto:${user.email}`} provider="google" label={user.googleDisplayName ?? 'Google'} external={false} />
                ) : (
                  <EmptyBrandChip provider="google" label="не привязан" />
                )}


                {user.githubId ? (
                  <LinkChip
                    href={`https://github.com/${user.githubLogin ?? ''}`}
                    provider="github"
                    label={user.githubDisplayName ?? user.githubLogin ?? 'GitHub'}
                  />
                ) : (
                  <EmptyBrandChip provider="github" label="не привязан" />
                )}


                {user.telegramId ? (
                  <LinkChip
                    href={user.telegramUsername ? `https://t.me/${user.telegramUsername}` : '#'}
                    provider="telegram"
                    label={user.telegramDisplayName ?? user.telegramUsername ?? 'Telegram'}
                    external={false}
                  />
                ) : (
                  <EmptyBrandChip provider="telegram" label="не привязан" />
                )}
              </div>

              <div className={pf('headerAccess')}>
                <div className={pf('headerAccessRoleSection')}>
                  <span className={pf('headerAccessLabel')}>Тип аккаунта:</span>
                  <span className={pf('headerAccessRole')} style={{ color: role.color }}>
                    {role.label}
                  </span>
                </div>
                <div className={pf('headerAccessBlocksSection')}>
                  <span className={pf('headerAccessLabel')}>Блокировок:</span>
                  <span
                    className={
                      blocked
                        ? pf('headerAccessBlocksState', 'headerAccessBlocksStateBad')
                        : pf('headerAccessBlocksState', 'headerAccessBlocksStateOk')
                    }
                    role="status"
                  >
                    {blocked ? 'Есть активные' : 'Нет активных'}
                  </span>
                </div>
                <div className={pf('headerAccessRatingSection')}>
                  <span className={pf('headerAccessLabel')}>Рейтинг</span>
                  <div className={pf('headerAccessRatingInline')} role="status">
                    <span className={pf('headerAccessSellerRating')}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className={
                          hasRating
                            ? pf('headerAccessSellerStar')
                            : pf('headerAccessSellerStar', 'headerAccessSellerStarNoRating')
                        }
                        aria-hidden="true"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span className={pf('headerAccessSellerValue')}>{rating.avg.toFixed(1)}</span>
                      <span className={pf('headerAccessSellerReviews')}>({rating.count} отзывов)</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className={pf('tabs')}>
          <div className={pp('profileCardNavWrap', 'profileCardNavWrapFull')}>
            <nav className={pp('profileCardNav', 'profileCardNavFull')} role="tablist" aria-label="Мой профиль" ref={navRef}>
              {tabs.map((tab, i) => (
                <a
                  key={tab.key}
                  role="tab"
                  aria-selected={i === 0}
                  className={i === 0 ? pp('profileCardNavItem', 'profileCardNavItemActive') : pp('profileCardNavItem')}
                  href={tab.href}
                >
                  {tab.label}
                  <span className={pp('profileCardNavCount')} aria-hidden="true">
                    {tab.count}
                  </span>
                </a>
              ))}
              <span
                className={pp('profileCardNavIndicator')}
                aria-hidden="true"
                style={indicator ? { width: `${indicator.width}px`, transform: `translateX(${indicator.x}px)` } : undefined}
              />
            </nav>
          </div>
        </div>


        <div className={pf('contentPlain')}>
          {stats.purchases === 0 ? (
            <div className={pf('empty')}>
              <svg viewBox="0 0 24 24" fill="none" className={pf('emptyIcon')} aria-hidden="true">
                <path
                  d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M3 6h18M16 10a4 4 0 11-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className={phb('headerBar__emptyCaption') + ' ' + pf('emptyText')}>У вас пока нет покупок</p>
            </div>
          ) : (
            <div className={pf('empty')} role="status" aria-live="polite">
              <p className={phb('headerBar__emptyCaption') + ' ' + pf('emptyText')}>Записей: {stats.purchases}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
