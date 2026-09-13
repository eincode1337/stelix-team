'use client'


import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useT } from '@/i18n/LocaleProvider'
import type { Resource } from './ResourcesCatalog'

const CDN = 'https://cdn.stelix.team'

const rs = (...n: string[]) => n.map((x) => `Resources-module__Zk5JmW__${x}`).join(' ')
const pc = (...n: string[]) => n.map((x) => `PurchaseContent-module__l1XItG__${x}`).join(' ')
const pr = (...n: string[]) => n.map((x) => `ProductRating-module__gtpVKG__${x}`).join(' ')
const cm = (...n: string[]) => n.map((x) => `Cart-module__m44xRG__${x}`).join(' ')

type Status = 'loading' | 'ready' | 'notfound' | 'error'
type ActionStatus = 'adding' | 'buying' | undefined
type ActionError = 'generic' | 'insufficient' | undefined

function formatAmount(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function assetUrl(path: string): string {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  return `${CDN}${path}`
}

function RubleIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 384 512" fill="currentColor" className={className} aria-hidden="true">
      <path d="M64 32C46.3 32 32 46.3 32 64l0 192 0 32 0 64-32 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l32 0 0 32c0 17.7 14.3 32 32 32s32-14.3 32-32l0-32 96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0 0-32 112 0c88.4 0 160-71.6 160-160S312.4 32 224 32L64 32zM224 256l-96 0 0-160 96 0c53 0 96 43 96 96s-43 64-96 64z" />
    </svg>
  )
}

function StarIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 576 512" fill="currentColor" className={className} aria-hidden="true">
      <path d="M309.5-18.9c-4.1-8-12.4-13.1-21.4-13.1s-17.3 5.1-21.4 13.1L193.1 125.3 33.2 150.7c-8.9 1.4-16.3 7.7-19.1 16.3s-.5 18 5.8 24.4l114.4 114.5-25.2 159.9c-1.4 8.9 2.3 17.9 9.6 23.2s16.9 6.1 25 2L288.1 417.6 432.4 491c8 4.1 17.7 3.3 25-2s11-14.2 9.6-23.2L441.7 305.9 556.1 191.4c6.4-6.4 8.6-15.8 5.8-24.4s-10.1-14.9-19.1-16.3L383 125.3 309.5-18.9z" />
    </svg>
  )
}

function DetailRating({ rating, reviewsCount }: { rating: number; reviewsCount: number }) {
  const tr = useT()
  if (reviewsCount <= 0) {
    return <span className={pr('reviewsCount')}>{tr('Нет отзывов')}</span>
  }
  const filled = Math.round(rating)
  return (
    <>
      <span className={pr('stars')} aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={pr('starSlot')}>
            <StarIcon className={pr('starBg')} />
            {i < filled && (
              <span className={pr('starFillClip')} style={{ width: '100%' }}>
                <StarIcon className={pr('starFg')} />
              </span>
            )}
          </span>
        ))}
      </span>
      <span className={pr('ratingValue')}>{rating.toFixed(1)}</span>
      <span className={pr('reviewsCount')}>({reviewsCount})</span>
    </>
  )
}

function BackLink() {
  const tr = useT()
  return (
    <Link href="/resources" className={pc('detailLink', 'purchaseDetailBackLink')} style={{ marginBottom: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
      <svg viewBox="0 0 24 24" fill="none" width="16" height="16" aria-hidden="true">
        <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {tr('Назад к каталогу')}
    </Link>
  )
}

function DetailShell({ children }: { children: ReactNode }) {
  return (
    <section className={rs('resources')}>
      <div className={'container ' + rs('resourcesPageInner')}>
        <div className={rs('content')}>{children}</div>
      </div>
    </section>
  )
}

function LoadingState() {
  const tr = useT()
  return (
    <DetailShell>
      <div className={pc('purchaseDetailPageLoading')} role="status" aria-live="polite" aria-busy="true">
        <span className={pc('purchaseDetailPageLoadingSpinner')} aria-hidden="true" />
        <span className={pc('visuallyHidden')}>{tr('Загрузка ресурса...')}</span>
      </div>
    </DetailShell>
  )
}

function MissingState({ kind, onRetry }: { kind: 'notfound' | 'error'; onRetry: () => void }) {
  const tr = useT()
  return (
    <DetailShell>
      <BackLink />
      <div className={pc('empty')} role={kind === 'error' ? 'alert' : 'status'}>
        <svg viewBox="0 0 24 24" fill="none" className={pc('emptyIcon')} aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <p className={pc('emptyText')}>
          {kind === 'notfound'
            ? tr('Ресурс не найден или был снят с публикации.')
            : tr('Не удалось загрузить ресурс. Проверьте соединение и попробуйте снова.')}
        </p>
        {kind === 'error' ? (
          <button type="button" className={rs('allFiltersButton')} onClick={onRetry} style={{ marginTop: '1rem' }}>
            {tr('Повторить')}
          </button>
        ) : (
          <Link href="/resources" className={rs('allFiltersButton')} style={{ marginTop: '1rem' }}>
            {tr('Перейти к каталогу')}
          </Link>
        )}
      </div>
    </DetailShell>
  )
}

function ImageCarousel({ images, title }: { images: string[]; title: string }) {
  const tr = useT()
  const [index, setIndex] = useState(0)
  const active = Math.min(index, Math.max(0, images.length - 1))

  return (
    <div className={rs('cardImage')}>
      <div className={rs('cardImageVisual')}>
        <div className={rs('cardImageClip')}>
          <div className={rs('cardCatalogCoverViewport')}>
            <div className={rs('cardCatalogCoverLayer')}>
              {images.length > 0 ? (
                <img
                  className={rs('cardCatalogCoverImage', 'cardCatalogCoverImageFull')}
                  src={assetUrl(images[active])}
                  alt={title}
                  decoding="async"
                />
              ) : (
                <div className={rs('cardCatalogCoverSkeleton')} aria-hidden="true" />
              )}
            </div>
          </div>
        </div>
      </div>
      {images.length > 1 && (
        <div className={rs('imageDots')} role="tablist" aria-label={tr('Изображения ресурса')}>
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`${tr('Изображение')} ${i + 1}`}
              className={i === active ? rs('dot', 'dotActive') : rs('dot')}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface PurchasePanelProps {
  resource: Resource
  isFree: boolean
  onSale: boolean
  current: number
  percentOff: number
  authReady: boolean
  loggedIn: boolean
  inCart: boolean
  purchased: boolean
  action: ActionStatus
  error: ActionError
  onAddToCart: () => void
  onBuy: () => void
}

function PurchasePanel(props: PurchasePanelProps) {
  const tr = useT()
  const {
    resource, isFree, onSale, current, percentOff,
    authReady, loggedIn, inCart, purchased, action, error,
    onAddToCart, onBuy,
  } = props
  const busy = action === 'adding' || action === 'buying'

  return (
    <aside className={rs('sidebar')}>
      <div className={rs('tilePriceRow')} style={{ marginBottom: '1.25rem' }}>
        <div className={rs('tilePriceRowMain')}>
          {isFree ? (
            <span className={rs('tilePrice')}>{tr('Бесплатно')}</span>
          ) : (
            <>
              {onSale && (
                <span className={rs('oldPrice')}>
                  {formatAmount(resource.price)}
                  <RubleIcon className={rs('currencyIcon')} />
                </span>
              )}
              <span className={rs('tilePrice')}>
                {formatAmount(current)}
                <RubleIcon className={rs('currencyIcon')} />
              </span>
              {onSale && (
                <span className={rs('tileDiscountBadge')}>
                  −{percentOff}
                  <span className={rs('tileDiscountSign')}>%</span>
                </span>
              )}
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
        {purchased ? (
          <>
            <span className={pc('dealActionsButton', 'dealActionsButtonSuccess')} style={{ height: '3rem', width: '100%' }}>
              {isFree ? tr('Получено') : tr('Куплено')}
            </span>
            <Link href="/purchases" className={pc('downloadButton')} style={{ width: '100%', justifyContent: 'center' }}>
              {tr('Мои покупки')}
            </Link>
          </>
        ) : (
          <>
            <button
              type="button"
              className={cm('checkoutButton')}
              onClick={onBuy}
              disabled={busy || !authReady}
              aria-busy={action === 'buying' || undefined}
            >
              {action === 'buying'
                ? tr('Оформление...')
                : !loggedIn && authReady
                  ? isFree ? tr('Войдите, чтобы получить') : tr('Войдите, чтобы купить')
                  : isFree ? tr('Получить бесплатно') : tr('Купить')}
            </button>

            {!isFree && (
              inCart ? (
                <Link href="/cart" className={pc('downloadButton')} style={{ width: '100%', justifyContent: 'center' }}>
                  {tr('Перейти в корзину')}
                </Link>
              ) : (
                <button
                  type="button"
                  className={pc('downloadButton')}
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={onAddToCart}
                  disabled={busy || !authReady}
                  aria-busy={action === 'adding' || undefined}
                >
                  <svg viewBox="0 0 576 512" fill="currentColor" className={pc('downloadButtonIcon')} aria-hidden="true">
                    <path d="M0 24C0 10.7 10.7 0 24 0L69.5 0c22 0 41.5 12.8 50.6 32l411 0c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3l-288.5 0 5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5L488 336c13.3 0 24 10.7 24 24s-10.7 24-24 24l-288.3 0c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5L24 48C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96zM252 160c0 11 9 20 20 20l44 0 0 44c0 11 9 20 20 20s20-9 20-20l0-44 44 0c11 0 20-9 20-20s-9-20-20-20l-44 0 0-44c0-11-9-20-20-20s-20 9-20 20l0 44-44 0c-11 0-20 9-20 20z" />
                  </svg>
                  {action === 'adding' ? tr('Добавление...') : tr('Добавить в корзину')}
                </button>
              )
            )}
          </>
        )}

        {error && (
          <p role="alert" style={{ color: 'var(--danger-fg)', margin: '.25rem 0 0', fontSize: '.85rem' }}>
            {error === 'insufficient'
              ? tr('Недостаточно средств на балансе. Пополните баланс и попробуйте снова.')
              : tr('Не удалось выполнить действие. Попробуйте снова.')}
          </p>
        )}
      </div>

      <dl className={pc('details')} style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
        <div className={pc('detailRow')}>
          <dt className={pc('detailLabel')}>{tr('Категория')}</dt>
          <dd className={pc('detailValue', 'detailValueWrap')}>{resource.category}</dd>
        </div>
        <div className={pc('detailRow')}>
          <dt className={pc('detailLabel')}>{tr('Продаж')}</dt>
          <dd className={pc('detailValue', 'detailValueMono')}>{resource.sales}</dd>
        </div>
        <div className={pc('detailRow')}>
          <dt className={pc('detailLabel')}>{tr('Просмотров')}</dt>
          <dd className={pc('detailValue', 'detailValueMono')}>{resource.uniqueViews}</dd>
        </div>
        <div className={pc('detailRow')}>
          <dt className={pc('detailLabel')}>{tr('Загрузок')}</dt>
          <dd className={pc('detailValue', 'detailValueMono')}>{resource.downloads}</dd>
        </div>
      </dl>
    </aside>
  )
}

export function ResourceDetail({ slug }: { slug: string }) {
  const tr = useT()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [status, setStatus] = useState<Status>('loading')
  const [resource, setResource] = useState<Resource | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const retry = useCallback(() => setReloadToken((t) => t + 1), [])

  const [inCart, setInCart] = useState(false)
  const [purchased, setPurchased] = useState(false)
  const [action, setAction] = useState<ActionStatus>(undefined)
  const [error, setError] = useState<ActionError>(undefined)

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')

    fetch(`/api/resources/${encodeURIComponent(slug)}`, {
      signal: controller.signal,
      credentials: 'include',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
      .then(async (res) => {
        if (res.status === 404) {
          setStatus('notfound')
          return
        }
        if (!res.ok) {
          setStatus('error')
          return
        }
        const data = (await res.json().catch(() => null)) as Resource | { error?: string } | null
        if (!data || (data as { error?: string }).error) {
          setStatus('notfound')
          return
        }
        setResource(data as Resource)
        setStatus('ready')
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setStatus('error')
      })

    return () => controller.abort()
  }, [slug, reloadToken])

  useEffect(() => {
    if (authLoading || !user || !resource) return
    const controller = new AbortController()
    void (async () => {
      try {
        const [cartRes, purRes] = await Promise.all([
          fetch('/api/cart', { credentials: 'include', cache: 'no-store', signal: controller.signal, headers: { Accept: 'application/json' } }),
          fetch('/api/purchases', { credentials: 'include', cache: 'no-store', signal: controller.signal, headers: { Accept: 'application/json' } }),
        ])
        if (cartRes.ok) {
          const cart = (await cartRes.json().catch(() => null)) as { items?: Array<{ resourceId?: unknown }> } | null
          setInCart(Boolean(cart?.items?.some((i) => i && i.resourceId === resource.id)))
        }
        if (purRes.ok) {
          const pur = (await purRes.json().catch(() => null)) as { purchases?: Array<{ resourceId?: unknown }> } | null
          setPurchased(Boolean(pur?.purchases?.some((p) => p && p.resourceId === resource.id)))
        }
      } catch {
      }
    })()
    return () => controller.abort()
  }, [authLoading, user, resource])

  const broadcast = useCallback(() => {
    try {
      window.dispatchEvent(new CustomEvent('stelix:cart-changed'))
    } catch {
    }
  }, [])

  const requireLogin = useCallback(() => {
    router.push('/?login=1')
  }, [router])

  const handleAddToCart = useCallback(async () => {
    if (!resource) return
    if (!user) return requireLogin()
    setAction('adding')
    setError(undefined)
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ resourceId: resource.id }),
      })
      if (!res.ok) {
        setError('generic')
        return
      }
      setInCart(true)
      broadcast()
    } catch {
      setError('generic')
    } finally {
      setAction(undefined)
    }
  }, [resource, user, requireLogin, broadcast])

  const handleBuy = useCallback(async () => {
    if (!resource) return
    if (!user) return requireLogin()
    setAction('buying')
    setError(undefined)
    try {
      if (!inCart) {
        const addRes = await fetch('/api/cart', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ resourceId: resource.id }),
        })
        if (!addRes.ok) {
          setError('generic')
          return
        }
      }
      const res = await fetch('/api/cart/checkout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ resourceIds: [resource.id] }),
      })
      const data = res.ok ? ((await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null) : null
      if (!data?.ok) {
        setError(data?.error === 'insufficient_balance' ? 'insufficient' : 'generic')
        return
      }
      setPurchased(true)
      setInCart(false)
      broadcast()
    } catch {
      setError('generic')
    } finally {
      setAction(undefined)
    }
  }, [resource, user, inCart, requireLogin, broadcast])

  const derived = useMemo(() => {
    if (!resource) return null
    const isFree = resource.listingKind === 'FREE'
    const onSale = !isFree && typeof resource.discount === 'number' && resource.discount < resource.price
    const current = onSale ? (resource.discount as number) : resource.price
    const percentOff = onSale ? Math.round((1 - (resource.discount as number) / resource.price) * 100) : 0
    const imgs = (Array.isArray(resource.images) ? resource.images : []).filter((x): x is string => typeof x === 'string' && x.length > 0)
    const images = imgs.length > 0 ? imgs : resource.coverImage ? [resource.coverImage] : []
    return { isFree, onSale, current, percentOff, images }
  }, [resource])

  if (status === 'loading') return <LoadingState />
  if (status === 'notfound') return <MissingState kind="notfound" onRetry={retry} />
  if (status === 'error' || !resource || !derived) return <MissingState kind="error" onRetry={retry} />

  const initial = resource.author.trim().charAt(0).toUpperCase() || '?'

  return (
    <DetailShell>
      <BackLink />
      <div className={pc('content')}>
        <div className={pc('main')}>
          <ImageCarousel images={derived.images} title={resource.title} />

          <div className={rs('tileLead')} style={{ marginTop: '1.25rem' }}>
            <div className={rs('tileAvatarOnCard')}>
              <div>
                <span aria-hidden="true">{initial}</span>
              </div>
            </div>
            <div className={rs('tileLeadText')}>
              <div className={rs('tileTitleRow')}>
                <h1 className={rs('title', 'tileTitle')}>{resource.title}</h1>
              </div>
              <div className={rs('tileKindRow')}>
                <span className={rs('tileKind')}>{resource.author}</span>
              </div>
            </div>
          </div>

          <div className={rs('tileRatingFooter')} style={{ marginTop: '.75rem' }}>
            <DetailRating rating={resource.rating} reviewsCount={resource.reviewsCount} />
          </div>

          {Array.isArray(resource.tags) && resource.tags.length > 0 && (
            <div className={rs('gameTags')} style={{ marginTop: '1rem' }}>
              {resource.tags.map((tag) => (
                <span key={tag} className={rs('gameTag')}>
                  <span className={rs('gameTagLabel')}>{tag}</span>
                </span>
              ))}
            </div>
          )}

          {resource.shortDescription && (
            <p className={rs('tileBlurb')} style={{ marginTop: '1.25rem' }}>{resource.shortDescription}</p>
          )}

          {resource.description && (
            <div className={pc('section', 'sectionNoDivider')} style={{ marginTop: '1.5rem' }}>
              <h2 className={pc('sectionTitle')}>{tr('Описание')}</h2>
              <p className={pc('instructionsText')}>{resource.description}</p>
            </div>
          )}
        </div>

        <PurchasePanel
          resource={resource}
          isFree={derived.isFree}
          onSale={derived.onSale}
          current={derived.current}
          percentOff={derived.percentOff}
          authReady={!authLoading}
          loggedIn={Boolean(user)}
          inCart={inCart}
          purchased={purchased}
          action={action}
          error={error}
          onAddToCart={() => void handleAddToCart()}
          onBuy={() => void handleBuy()}
        />
      </div>
    </DetailShell>
  )
}

export default ResourceDetail
