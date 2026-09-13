'use client'


import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ResourcesSuspenseShell } from './ResourcesSuspenseShell'
import { ResourceCard, type ResourceCardCartStatus } from './ResourceCard'
import { GamePlatformStrip } from './GamePlatformStrip'
import { CategoryStrip } from './CategoryStrip'
import { useAuth } from '@/components/auth/AuthProvider'
import { useT } from '@/i18n/LocaleProvider'

const rs = (...n: string[]) => n.map((x) => `Resources-module__Zk5JmW__${x}`).join(' ')

const PAGE_SIZE = 16


export type ListingKind = 'PAID' | 'FREE'

export interface Resource {
  id: string
  slug: string
  title: string
  description: string
  shortDescription: string | null
  price: number
  discount: number | null
  category: string
  tags: string[]
  images: string[]
  coverImage: string | null
  authorId: number
  author: string
  authorRole: string
  status: string
  sales: number
  downloads: number
  listingKind: ListingKind
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

interface ResourcesResponse {
  resources: Resource[]
  listingKindCounts: ListingKindCounts
}

type Status = 'loading' | 'error' | 'ready'

function useCatalogCart() {
  const { user } = useAuth()
  const enabled = Boolean(user)

  const [cartIds, setCartIds] = useState<Set<string>>(() => new Set())
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(() => new Set())
  const [statusById, setStatusById] = useState<Record<string, ResourceCardCartStatus | undefined>>({})

  const broadcast = useCallback(() => {
    try {
      window.dispatchEvent(new CustomEvent('stelix:cart-changed'))
    } catch {
    }
  }, [])

  const refreshCartState = useCallback(async () => {
    try {
      await fetch('/api/cart/summary', {
        credentials: 'include',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      })
    } catch {
    }
    broadcast()
  }, [broadcast])

  useEffect(() => {
    if (!enabled) {
      setCartIds(new Set())
      setPurchasedIds(new Set())
      setStatusById({})
      return
    }
    const controller = new AbortController()
    void (async () => {
      try {
        const res = await fetch('/api/cart', {
          credentials: 'include',
          cache: 'no-store',
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        })
        if (!res.ok) return
        const data = (await res.json()) as { items?: Array<{ resourceId?: unknown }> }
        const ids = new Set<string>()
        for (const it of data.items ?? []) {
          if (it && typeof it.resourceId === 'string') ids.add(it.resourceId)
        }
        setCartIds(ids)
      } catch {
      }
    })()
    return () => controller.abort()
  }, [enabled])

  const setStatus = useCallback((id: string, s: ResourceCardCartStatus | undefined) => {
    setStatusById((prev) => ({ ...prev, [id]: s }))
  }, [])

  const addToCart = useCallback(
    async (id: string) => {
      setStatus(id, 'adding')
      try {
        const res = await fetch('/api/cart', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ resourceId: id }),
        })
        if (!res.ok) {
          setStatus(id, 'error')
          return
        }
        setCartIds((prev) => new Set(prev).add(id))
        setStatus(id, undefined)
        await refreshCartState()
      } catch {
        setStatus(id, 'error')
      }
    },
    [refreshCartState, setStatus],
  )

  const buyNow = useCallback(
    async (id: string) => {
      setStatus(id, 'buying')
      try {
        if (!cartIds.has(id)) {
          const addRes = await fetch('/api/cart', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ resourceId: id }),
          })
          if (!addRes.ok) {
            setStatus(id, 'error')
            return
          }
        }
        const res = await fetch('/api/cart/checkout', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ resourceIds: [id] }),
        })
        const data = res.ok ? ((await res.json().catch(() => null)) as { ok?: boolean } | null) : null
        if (!data?.ok) {
          setStatus(id, 'error')
          return
        }
        setCartIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
        setPurchasedIds((prev) => new Set(prev).add(id))
        setStatus(id, undefined)
        await refreshCartState()
      } catch {
        setStatus(id, 'error')
      }
    },
    [cartIds, refreshCartState, setStatus],
  )

  return { enabled, cartIds, purchasedIds, statusById, addToCart, buyNow }
}

function FloatingFiltersFab({ label }: { label: string }) {
  return (
    <div className={rs('floatingFilters')}>
      <button
        type="button"
        className={rs('floatingFiltersFab')}
        data-onboarding="resourceFilters"
        aria-label={label}
        data-tooltip-trigger=""
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          fill="currentColor"
          className={rs('floatingFiltersFabIcon')}
          aria-hidden="true"
        >
          <path d="M0 93.7C0 77.3 13.3 64 29.7 64l452.7 0c16.4 0 29.7 13.3 29.7 29.7 0 7.9-3.1 15.4-8.7 21L336 281.9 336 482.3c0 16.4-13.3 29.7-29.7 29.7-7.9 0-15.4-3.1-21-8.7L183 401c-4.5-4.5-7-10.6-7-17L176 281.9 8.7 114.6C3.1 109.1 0 101.5 0 93.7zM73.9 112L217 255c4.5 4.5 7 10.6 7 17l0 102.1 64 64 0-166.1c0-6.4 2.5-12.5 7-17l143-143-364.1 0z" />
        </svg>
      </button>
    </div>
  )
}

export function ResourcesCatalog({
  initialKind,
  initialGame,
}: {
  initialKind?: ListingKind
  initialGame?: string
} = {}) {
  const tr = useT()
  const cart = useCatalogCart()
  const [status, setStatus] = useState<Status>('loading')
  const [resources, setResources] = useState<Resource[]>([])

  const [category, setCategory] = useState<string | null>(initialGame ?? null)

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const [reloadToken, setReloadToken] = useState(0)
  const retry = useCallback(() => setReloadToken((t) => t + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')

    fetch('/api/resources', {
      signal: controller.signal,
      credentials: 'include',
      headers: { accept: 'application/json' },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<ResourcesResponse>
      })
      .then((data) => {
        setResources(Array.isArray(data.resources) ? data.resources : [])
        setStatus('ready')
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setStatus('error')
      })

    return () => controller.abort()
  }, [reloadToken])

  const filtered = useMemo(
    () => (category == null ? resources : resources.filter((r) => r.category === category)),
    [resources, category],
  )

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [category, resources])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  const sentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!hasMore) return
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisibleCount((c) => c + PAGE_SIZE)
        }
      },
      { rootMargin: '600px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [hasMore, filtered.length])

  if (status === 'loading') {
    return <ResourcesSuspenseShell loadingLabel={tr('Загрузка каталога...')} />
  }

  if (status === 'error') {
    return (
      <>
        <FloatingFiltersFab label={tr('Открыть фильтры')} />
        <section className={rs('resources', 'resourcesCatalogEmpty')}>
          <div className={'container ' + rs('resourcesPageInner')}>
            <div className={rs('content')}>
              <div className={rs('catalogEmpty')} role="alert">
                <p>{tr('Не удалось загрузить каталог. Проверьте соединение и попробуйте снова.')}</p>
                <button type="button" className={rs('allFiltersButton')} onClick={retry}>
                  {tr('Повторить')}
                </button>
              </div>
            </div>
          </div>
        </section>
      </>
    )
  }

  const isEmpty = filtered.length === 0

  return (
    <>
      <FloatingFiltersFab label={tr('Открыть фильтры')} />
      <section className={isEmpty ? rs('resources', 'resourcesCatalogEmpty') : rs('resources')}>
        <div className={'container ' + rs('resourcesPageInner')}>
          <div className={rs('content')}>
            <div className={rs('catalogPlatformsBlock', 'catalogPlatformsBlockPlain', 'catalogPlatformsGameTop')}>
              <GamePlatformStrip resources={resources} />
            </div>

            <div className={rs('catalogPlatformsTop')}>
              <div className={rs('catalogPlatformsBlock', 'catalogPlatformsBlockBleed')}>
                <CategoryStrip resources={resources} activeKey={category} onSelect={setCategory} />
              </div>
            </div>

            {isEmpty ? (
              <div className={rs('catalogEmpty')} role="status" aria-live="polite">
                <p>{tr('По выбранным фильтрам ничего не найдено.')}</p>
              </div>
            ) : (
              <div className={rs('catalogResults')}>
                <div className={rs('grid')}>
                  {visible.map((resource) => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      cart={{
                        enabled: cart.enabled,
                        inCart: cart.cartIds.has(resource.id),
                        purchased: cart.purchasedIds.has(resource.id),
                        status: cart.statusById[resource.id],
                        onAddToCart: () => void cart.addToCart(resource.id),
                        onBuyNow: () => void cart.buyNow(resource.id),
                      }}
                    />
                  ))}
                </div>
                {hasMore ? <div aria-hidden="true" ref={sentinelRef} /> : null}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
