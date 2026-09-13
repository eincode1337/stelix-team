'use client'


import { useCallback, useEffect, useState } from 'react'
import { useT } from '@/i18n/LocaleProvider'

const he = (...n: string[]) => n.map((x) => `Hero-module__ZjlDhW__${x}`).join(' ')
const pc = (...n: string[]) => n.map((x) => `PurchaseContent-module__l1XItG__${x}`).join(' ')

export const LISTING_KIND_EVENT = 'stelix:listing-kind'

type ListingKind = 'PAID' | 'FREE'

const MESH_LINES: Array<[number, number, number, number]> = [
  [340, 118, 380, 198],
  [520, 72, 760, 48],
  [760, 48, 980, 36],
  [880, 98, 980, 36],
  [700, 132, 620, 218],
  [1060, 148, 1180, 228],
  [1240, 108, 1340, 52],
  [1420, 162, 1520, 92],
]

const MESH_NODES: Array<{ t: string; d: string; hub?: number; ring: number; core: number }> = [
  { t: '140 88', d: '0s', ring: 6.24, core: 2.4 },
  { t: '340 118', d: '0.24s', hub: 9, ring: 9.360000000000001, core: 3.6 },
  { t: '520 72', d: '0.48s', ring: 7.279999999999999, core: 2.8 },
  { t: '700 132', d: '0.72s', ring: 8.32, core: 3.2 },
  { t: '880 98', d: '0.96s', ring: 6.760000000000001, core: 2.6 },
  { t: '1060 148', d: '1.2s', ring: 7.800000000000001, core: 3 },
  { t: '1240 108', d: '1.44s', hub: 7, ring: 7.279999999999999, core: 2.8 },
  { t: '1420 162', d: '1.68s', ring: 6.24, core: 2.4 },
  { t: '380 198', d: '1.92s', ring: 5.2, core: 2 },
  { t: '760 48', d: '2.16s', ring: 5.720000000000001, core: 2.2 },
  { t: '980 36', d: '2.4s', hub: 6.5, ring: 6.760000000000001, core: 2.6 },
  { t: '620 218', d: '2.6399999999999997s', ring: 4.680000000000001, core: 1.8 },
  { t: '1180 228', d: '2.88s', ring: 4.680000000000001, core: 1.8 },
  { t: '1340 52', d: '3.12s', ring: 5.2, core: 2 },
  { t: '1520 92', d: '3.5999999999999996s', ring: 5.2, core: 2 },
]

function HeroCatalogKindPart({ label }: { label: string }) {
  return (
    <span className={he('heroCatalogKindPart', 'heroCatalogKindPartSkeletonHost')}>
      <span className={he('heroCatalogKindPartSkeletonSizer')} aria-hidden="true">
        <span>{label}</span>
        <span className={he('heroCatalogKindCount')}>0</span>
      </span>
      <span className={'appSkeletonBlock ' + he('heroCatalogKindPartSkeleton')} aria-hidden="true" />
    </span>
  )
}

function HeroCatalogKindButton({
  label,
  count,
  active,
  onSelect,
}: {
  label: string
  count: number
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      className={active ? he('heroCatalogKindPart', 'heroCatalogKindPartActive') : he('heroCatalogKindPart')}
      aria-pressed={active}
      onClick={onSelect}
    >
      <span>{label}</span>
      <span className={he('heroCatalogKindCount')}>{count}</span>
    </button>
  )
}

function HeroCatalogKindJoin({ toLeft }: { toLeft: boolean }) {
  return (
    <span className={he('heroCatalogKindJoin')} aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={toLeft ? he('heroCatalogKindJoinSvg', 'heroCatalogKindJoinSvgToLeft') : he('heroCatalogKindJoinSvg')}
      >
        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

export function HeroSpace() {
  const tr = useT()

  const [ready, setReady] = useState(false)
  const [counts, setCounts] = useState<{ paid: number; free: number }>({ paid: 0, free: 0 })
  const [listingKind, setListingKind] = useState<ListingKind>('PAID')

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/resources', {
      signal: controller.signal,
      credentials: 'include',
      headers: { accept: 'application/json' },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<{ listingKindCounts?: { paid?: unknown; free?: unknown } }>
      })
      .then((data) => {
        const c = data?.listingKindCounts
        setCounts({ paid: Number(c?.paid) || 0, free: Number(c?.free) || 0 })
        setReady(true)
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const onKind = (e: Event) => {
      const detail = (e as CustomEvent<{ kind?: unknown }>).detail
      const kind = detail?.kind
      if (kind === 'PAID' || kind === 'FREE') setListingKind(kind)
    }
    window.addEventListener(LISTING_KIND_EVENT, onKind as EventListener)
    return () => window.removeEventListener(LISTING_KIND_EVENT, onKind as EventListener)
  }, [])

  const selectKind = useCallback((kind: ListingKind) => {
    setListingKind(kind)
    try {
      window.dispatchEvent(new CustomEvent(LISTING_KIND_EVENT, { detail: { kind } }))
    } catch {
    }
  }, [])

  return (
    <section className={he('hero', 'heroSubtle')}>
      <div className={he('space')} aria-hidden="true">
        <div className={he('subtleBackdrop')}>
          <svg className={he('techMeshSvg')} viewBox="0 0 1600 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <g className={he('techMeshLines')} stroke="currentColor" strokeWidth="1.1" fill="none">
              <polyline points="140,88 340,118 520,72 700,132 880,98 1060,148 1240,108 1420,162" />
              {MESH_LINES.map(([x1, y1, x2, y2], i) => (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
              ))}
            </g>
            <g className={he('techMeshNodes')}>
              {MESH_NODES.map((n, i) => (
                <g
                  key={i}
                  className={he('techNode')}
                  transform={`translate(${n.t})`}
                  style={{ '--wave-delay': n.d } as React.CSSProperties}
                >
                  {n.hub != null && (
                    <circle className={he('techNodeHub')} r={n.hub} stroke="currentColor" strokeWidth="1" fill="none" />
                  )}
                  <circle className={he('techNodeRing')} r={n.ring} />
                  <circle className={he('techNodeCore')} r={n.core} />
                </g>
              ))}
            </g>
          </svg>
        </div>
      </div>

      <div className={he('bannerText')} role="region" aria-label={tr('Приветствие на главной')}>
        <h1 className={pc('visuallyHidden')}>{tr('Цифровые ресурсы')}</h1>

        <div className={he('bannerTitle', 'bannerTitleWithCount')}>
          <span className={he('bannerTitlePhrase')}>
            <span aria-hidden="true">{tr('Цифровые ')}</span>
            <span className={he('bannerTitleAccentWrap')}>
              <span className={he('bannerTitleAccent', 'bannerTitleAccentInline')} aria-hidden="true">{tr('ресурсы')}</span>
            </span>
          </span>
        </div>

        <p className={he('bannerSubtitle')}>{tr('Покупайте и продавайте готовые разработки для ваших проектов')}</p>

        <div className={he('heroBannerAction')} data-nosnippet="true">
          {ready ? (
            <div className={he('heroCatalogKindRow')} role="group" aria-label={tr('Тип размещения')}>
              <HeroCatalogKindButton
                label={tr('Платные')}
                count={counts.paid}
                active={listingKind === 'PAID'}
                onSelect={() => selectKind('PAID')}
              />
              <HeroCatalogKindJoin toLeft={listingKind === 'FREE'} />
              <HeroCatalogKindButton
                label={tr('Бесплатные')}
                count={counts.free}
                active={listingKind === 'FREE'}
                onSelect={() => selectKind('FREE')}
              />
            </div>
          ) : (
            <div className={he('heroCatalogKindRow')} role="status" aria-busy="true">
              <HeroCatalogKindPart label={tr('Платные')} />
              <HeroCatalogKindJoin toLeft={false} />
              <HeroCatalogKindPart label={tr('Бесплатные')} />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
