'use client'


import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useT } from '@/i18n/LocaleProvider'

const rs = (...n: string[]) => n.map((x) => `Resources-module__Zk5JmW__${x}`).join(' ')

const CDN = 'https://cdn.stelix.team'

const GAME_CATALOG: ReadonlyArray<{ slug: string; label: string }> = [
  { slug: 'cs2', label: 'CS2' },
  { slug: 'lrweb', label: 'LR Web' },
  { slug: 'csgo', label: 'CS:GO' },
  { slug: 'css', label: 'CSS' },
  { slug: 'mc', label: 'Minecraft' },
  { slug: 'discord', label: 'Discord' },
  { slug: 'gamecms', label: 'GameCMS' },
  { slug: 'xenforo', label: 'XenForo' },
  { slug: 'ips', label: 'IPS' },
  { slug: 'phpbb', label: 'phpBB' },
  { slug: 'minecraft', label: 'Java Edition' },
  { slug: 'tf2', label: 'TF2' },
  { slug: 'telegram', label: 'Telegram' },
  { slug: 'ark', label: 'ARK' },
  { slug: 'altv', label: 'alt:V' },
  { slug: 'ats', label: 'ATS' },
  { slug: 'beamng', label: 'BeamNG' },
  { slug: 'cs16', label: 'CS 1.6' },
  { slug: 'ets2', label: 'ETS 2' },
  { slug: 'fivem', label: 'FiveM' },
  { slug: 'gmod', label: 'GMod' },
  { slug: 'hl', label: 'Half-Life' },
  { slug: 'hl2', label: 'Half-Life 2' },
  { slug: 'hosting', label: 'Хостинг' },
  { slug: 'l4d', label: 'L4D' },
  { slug: 'l4d2', label: 'L4D2' },
  { slug: 'flute', label: 'Flute CMS' },
  { slug: 'figma', label: 'Figma' },
  { slug: 'dle', label: 'DLE' },
  { slug: 'minecraftbedrock', label: 'Bedrock Edition' },
  { slug: 'mta', label: 'MTA' },
  { slug: 'projectz', label: 'Project Z' },
  { slug: 'ragemp', label: 'RAGE MP' },
  { slug: 'redm', label: 'RedM' },
  { slug: 'rust', label: 'Rust' },
  { slug: 'tf', label: 'TF' },
  { slug: 'unturned', label: 'Unturned' },
]

export interface PlatformResourceLike {
  tags?: string[] | null
}

export interface PlatformFacet {
  slug: string
  label: string
  count: number
}

export interface GamePlatformStripProps {
  resources: PlatformResourceLike[]
}

export function derivePlatformFacets(resources: PlatformResourceLike[]): PlatformFacet[] {
  const counts = new Map<string, number>()
  for (const r of resources) {
    for (const tag of r?.tags ?? []) {
      if (!tag) continue
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return GAME_CATALOG.map((g) => ({
    slug: g.slug,
    label: g.label,
    count: counts.get(g.slug) ?? 0,
  })).sort((a, b) => b.count - a.count)
}

function useEdgeFades() {
  const listRef = useRef<HTMLUListElement>(null)
  const [edges, setEdges] = useState({ left: false, right: false })

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = list
      setEdges({
        left: scrollLeft > 1,
        right: scrollLeft + clientWidth < scrollWidth - 1,
      })
    }
    update()
    list.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(list)
    return () => {
      list.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [])

  return { listRef, edges }
}

function GamePlatformCard({ facet }: { facet: PlatformFacet }) {
  return (
    <li className={rs('gamePlatformStripItem')}>
      <Link className={rs('gamePlatformCard')} href={`/resources/paid/${facet.slug}`}>
        <div className={rs('gamePlatformCardVisual')}>
          <div className={rs('gamePlatformCardMedia')}>
            <img
              alt=""
              loading="eager"
              width={52}
              height={52}
              decoding="async"
              data-nimg="1"
              className={rs('gamePlatformCardImg')}
              src={`${CDN}/img/games/${facet.slug}.webp`}
              style={{ color: 'transparent' }}
            />
          </div>
          {facet.count > 0 && (
            <span className={rs('gamePlatformCardCount')} aria-hidden="true">
              {facet.count}
            </span>
          )}
        </div>
        <span className={rs('gamePlatformCardLabel')}>{facet.label}</span>
      </Link>
    </li>
  )
}

export function GamePlatformStrip({ resources }: GamePlatformStripProps) {
  const tr = useT()
  const facets = useMemo(() => derivePlatformFacets(resources), [resources])
  const { listRef, edges } = useEdgeFades()

  const viewportClass = [
    rs('gamePlatformStripViewport'),
    edges.left ? rs('gamePlatformStripViewportHasLeft') : '',
    edges.right ? rs('gamePlatformStripViewportHasRight') : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <nav className={rs('gamePlatformStrip')} aria-label={tr('Игры')}>
      <div className={viewportClass}>
        <span className={rs('gamePlatformStripFadeLeft')} aria-hidden="true" />
        <span className={rs('gamePlatformStripFadeRight')} aria-hidden="true" />
        <ul ref={listRef} className={rs('gamePlatformStripList')}>
          {facets.map((facet) => (
            <GamePlatformCard key={facet.slug} facet={facet} />
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default GamePlatformStrip
