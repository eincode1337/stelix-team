'use client'


import Link from 'next/link'
import type { CSSProperties } from 'react'
import { useT } from '@/i18n/LocaleProvider'

const CDN = 'https://cdn.stelix.team'

const rs = (...n: string[]) => n.map((x) => `Resources-module__Zk5JmW__${x}`).join(' ')
const pr = (...n: string[]) => n.map((x) => `ProductRating-module__gtpVKG__${x}`).join(' ')
const ci = (...n: string[]) => n.map((x) => `CategoryIcon-module__kwjccG__${x}`).join(' ')
const ta = (...n: string[]) => n.map((x) => `TileAvatar-module__qnVd5W__${x}`).join(' ')
const bip = (...n: string[]) => n.map((x) => `BrokenImagePlaceholder-module__Nzt9-q__${x}`).join(' ')


export type ResourceCardCartStatus = 'adding' | 'buying' | 'error'

export interface ResourceCardCart {
  enabled: boolean
  inCart: boolean
  purchased: boolean
  status?: ResourceCardCartStatus
  onAddToCart: () => void
  onBuyNow: () => void
}

export interface ResourceCardResource {
  id: string
  slug: string
  title: string
  shortDescription: string | null
  price: number
  discount: number | null
  category: string
  tags: string[]
  images: string[]
  coverImage?: string | null
  author: string
  authorRole: string
  rating: number
  reviewsCount: number
  sales: number
  uniqueViews: number
  listingKind: string
  createdAt: string
  updatedAt?: string | null
  lastBuyerUpdateAt?: string | null
  buyerUpdatesCount: number
  createdWithAiTools: boolean
  catalogImage?: string | null
  catalogHasDiscordRoleDiscount?: boolean | null
  catalogHasResourcePurchaseDiscount?: boolean | null
  catalogVolumeDiscountMaxPct?: number | null
}


const CATEGORY_LABELS: Record<string, string> = {
  plugins: 'Плагины',
  modules: 'Модули',
  scripts: 'Скрипты',
  maps: 'Карты',
  integrations: 'Интеграции',
  models: 'Модели',
  particles: 'Партиклы',
  assemblies: 'Сборки',
  tools: 'Инструменты',
  other: 'Другое',
}

const CATEGORY_ICONS: Record<string, { viewBox: string; path: string }> = {
  modules: {
    viewBox: '0 0 640 512',
    path: 'M544 32c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64l-384 0c-33.1 0-60.4-25.2-63.7-57.5l-.3-6.5 0-128 288 0 0-256 160 0zM135.6 64c-9.1 9.1-30.4 30.5-64 64 33.5 33.5 54.8 54.9 64 64l-39.6 39.6-19.8-19.8-64-64c-10.9-10.9-10.9-28.7 0-39.6l64-64 19.8-19.8 39.6 39.6zM243.8 44.2l64 64c10.9 10.9 10.9 28.7 0 39.6l-64 64-19.8 19.8-39.6-39.6c9.1-9.1 30.4-30.5 64-64-33.5-33.5-54.8-54.9-64-64L224 24.4 243.8 44.2z',
  },
  plugins: {
    viewBox: '0 0 512 512',
    path: 'M320 0L448 0c35.3 0 64 28.7 64 64l0 128c0 8.8-7.2 16-16 16l-52 0c-6.6 0-12 5.4-12 12l0 4c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-4c0-6.6-5.4-12-12-12l-36 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16l16 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-16 0c-8.8 0-16-7.2-16-16l0-48c0-8.8 7.2-16 16-16zM0 256L0 128C0 92.7 28.7 64 64 64l128 0c8.8 0 16 7.2 16 16l0 36c0 6.6 5.4 12 12 12l4 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-4 0c-6.6 0-12 5.4-12 12l0 52c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-16c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 16c0 8.8-7.2 16-16 16l-48 0c-8.8 0-16-7.2-16-16zM0 448L0 320c0-8.8 7.2-16 16-16l176 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-16 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l16 0c8.8 0 16 7.2 16 16l0 48c0 8.8-7.2 16-16 16L64 512c-35.3 0-64-28.7-64-64zM240 320c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16l0 16c0 17.7 14.3 32 32 32s32-14.3 32-32l0-16c0-8.8 7.2-16 16-16l48 0c8.8 0 16 7.2 16 16l0 128c0 35.3-28.7 64-64 64l-128 0c-8.8 0-16-7.2-16-16l0-176z',
  },
  integrations: {
    viewBox: '0 0 576 512',
    path: 'M344 380c24.3 0 44 19.7 44 44l0 104c0 11-9 20-20 20s-20-9-20-20l0-28-24 0 0 28c0 11-9 20-20 20s-20-9-20-20l0-104c0-24.3 19.7-44 44-44l16 0zm120 0c33.1 0 60 26.9 60 60s-26.9 60-60 60l-12 0 0 28c0 11-9 20-20 20s-20-9-20-20l0-128c0-11 9-20 20-20l32 0zm96 0c11 0 20 9 20 20l0 128c0 11-9 20-20 20s-20-9-20-20l0-128c0-11 9-20 20-20zM328 420c-2.2 0-4 1.8-4 4l0 36 24 0 0-36c0-2.2-1.8-4-4-4l-16 0zm124 40l12 0c11 0 20-9 20-20s-9-20-20-20l-12 0 0 40zM317.9-16c15.2 0 28.3 10.7 31.3 25.6l14.4 69.9c14.1 6 27.3 13.7 39.3 22.7l67.8-22.5c14.4-4.8 30.2 1.2 37.8 14.4l29.9 51.8c7.6 13.1 4.9 29.8-6.4 39.9l-53.5 47.5c.9 7.4 1.4 15 1.4 22.7 0 7.7-.5 15.2-1.4 22.7l53.5 47.5c3.2 2.8 5.6 6.2 7.4 9.8L304 336c-35.3 0-64 28.7-64 64l0 41.9c-24.6-6.3-47.3-17.4-67-32.2l-67.8 22.5c-14.4 4.8-30.2-1.2-37.8-14.4L37.5 366.1c-7.6-13.1-4.9-29.8 6.5-39.9l53.4-47.5c-.9-7.4-1.3-15-1.3-22.7s.5-15.2 1.3-22.7L44 185.8c-11.3-10.1-14.1-26.8-6.5-39.9L67.4 94.1C75 80.9 90.8 74.9 105.2 79.7L173 102.2c12.1-9 25.3-16.7 39.3-22.7L226.7 9.6C229.8-5.3 242.9-16 258.1-16l59.8 0zM288 172c-46.4 0-84 37.6-84 84 0 23.7 9.8 45 25.6 60.3 19.8-17.6 45.9-28.3 74.4-28.3l61.6 0c4.1-9.9 6.4-20.7 6.4-32 0-46.4-37.6-84-84-84z',
  },
  scripts: {
    viewBox: '0 0 640 512',
    path: 'M392.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm80.6 120.1c-12.5 12.5-12.5 32.8 0 45.3L562.7 256l-89.4 89.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-112-112c-12.5-12.5-32.8-12.5-45.3 0zm-306.7 0c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l112 112c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256l89.4-89.4c12.5-12.5 12.5-32.8 0-45.3z',
  },
  maps: {
    viewBox: '0 0 576 512',
    path: 'M565.6 36.2C572.1 40.7 576 48.1 576 56l0 336c0 10-6.2 18.9-15.5 22.4l-168 64c-5.2 2-10.9 2.1-16.1 .3L192 417.3 32.9 478.4C25.5 481.2 17.2 480.2 10.6 475.8S0 463.9 0 456L0 120c0-10 6.2-18.9 15.5-22.4l168-64c5.2-2 10.9-2.1 16.1-.3L384 94.7 543.1 33.6c7.4-2.8 15.7-1.8 22.5 2.6zM48 136.5l0 284.6 120-45.7 0-284.6L48 136.5zM360 422.7l0-285.4-144-48 0 285.4 144 48zm48-1.5l120-45.7 0-284.6L408 136.5l0 284.6z',
  },
  models: {
    viewBox: '0 0 512 512',
    path: 'M234.5 5.7c13.9-5 29.1-5 43.1 0l192 68.6C495 83.4 512 107.5 512 134.6l0 242.9c0 27-17 51.1-42.5 60.3l-192 68.6c-13.9 5-29.1 5-43.1 0l-192-68.6C17 428.6 0 404.5 0 377.5L0 134.6c0-27 17-51.2 42.5-60.3l192-68.6zM256 66L82.3 128 256 190l173.7-62L256 66zm32 368.6l160-57.1 0-188L288 246.6l0 188z',
  },
  particles: {
    viewBox: '0 0 512 512',
    path: 'M327.5 85.2c-4.5 1.7-7.5 6-7.5 10.8s3 9.1 7.5 10.8L384 128l21.2 56.5c1.7 4.5 6 7.5 10.8 7.5s9.1-3 10.8-7.5L448 128l56.5-21.2c4.5-1.7 7.5-6 7.5-10.8s-3-9.1-7.5-10.8L448 64 426.8 7.5C425.1 3 420.8 0 416 0s-9.1 3-10.8 7.5L384 64 327.5 85.2zM137.5 187.2c-4.7 1.8-7.5 6.1-7.5 10.8s2.8 9.1 7.5 10.8L192 224l21.2 56.5c1.7 4.5 6 7.5 10.8 7.5s9.1-3 10.8-7.5L256 224l56.5-21.2c4.5-1.7 7.5-6 7.5-10.8s-3-9.1-7.5-10.8L256 160 234.8 103.5C233.1 99 228.8 96 224 96s-9.1 3-10.8 7.5L192 160l-54.5 27.2zM32 288c-4.8 0-9.1 3-10.8 7.5L0 352-56.5 373.2c0 0 0 0 0 0 4.5 1.7 7.5 6 7.5 10.8L0 384l0 0c1.7 4.5 6 7.5 10.8 7.5S19.9 388.5 21.5 384L64 384l0-96-32 0z',
  },
  assemblies: {
    viewBox: '0 0 512 512',
    path: 'M232.5 5.2c14.9-6.9 32.1-6.9 47 0l218.6 101c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L13.9 149.8C5.4 145.8 0 137.3 0 128s5.4-17.9 13.9-21.8L232.5 5.2zM48.1 218.4l164.3 75.9c27.7 12.8 59.6 12.8 87.3 0l164.3-75.9 34.1 15.8c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L13.9 277.8C5.4 273.8 0 265.3 0 256s5.4-17.9 13.9-21.8l34.1-15.8zM13.9 362.2l34.1-15.8 164.3 75.9c27.7 12.8 59.6 12.8 87.3 0l164.3-75.9 34.1 15.8c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L13.9 405.8C5.4 401.8 0 393.3 0 384s5.4-17.9 13.9-21.8z',
  },
  tools: {
    viewBox: '0 0 512 512',
    path: 'M78.6 5C69.1-2.4 55.6-1.5 47 7L7 47c-8.5 8.5-9.4 22-2.1 31.6l80 104c4.5 5.9 11.6 9.4 19 9.4l54.1 0 109 109c-14.7 29-10 65.4 14.3 89.6l112 112c12.5 12.5 32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3l-112-112c-24.2-24.2-60.6-29-89.6-14.3l-109-109 0-54.1c0-7.5-3.5-14.5-9.4-19L78.6 5zM19.9 396.1C7.2 408.8 0 426.1 0 444.1 0 481.6 30.4 512 67.9 512c18 0 35.3-7.2 48-19.9L233.7 374.3c-7.5-16.6-11.9-34.9-12.8-53.6l-90.6 90.6c-6.9-1.9-13.9-2.9-21.1-2.9-18.5 0-35.3 7.4-47.6 19.4L19.9 396.1zM512 144c0-10.5-1.1-20.7-3.2-30.5-2.4-11.2-16.1-14.1-24.2-6l-63.9 63.9c-3 3-7.1 4.7-11.3 4.7L352 176c-8.8 0-16-7.2-16-16l0-57.4c0-4.2 1.7-8.3 4.7-11.3l63.9-63.9c8.1-8.1 5.2-21.8-6-24.2C392.7 1.1 382.5 0 372 0 288.5 0 220.7 67.3 220 150.6l141.4 141.4c78.9-4.5 141.4-70 141.4-149.9L512 144z',
  },
  other: {
    viewBox: '0 0 512 512',
    path: 'M315.4 15.5C309.7 5.9 299.2 0 288 0s-21.7 5.9-27.4 15.5l-96 160c-5.9 9.9-6.1 22.2-.4 32.2s16.3 16.2 27.8 16.2l192 0c11.5 0 22.2-6.2 27.8-16.2s5.5-22.3-.4-32.2l-96-160zM288 312l0 144c0 22.1 17.9 40 40 40l144 0c22.1 0 40-17.9 40-40l0-144c0-22.1-17.9-40-40-40l-144 0c-22.1 0-40 17.9-40 40zM128 512a128 128 0 1 0 0-256 128 128 0 1 0 0 256z',
  },
}

const GAME_TAG_LABELS: Record<string, string> = {
  cs2: 'CS2',
  lrweb: 'LR Web',
  csgo: 'CS:GO',
  css: 'CSS',
  cs16: 'CS 1.6',
  mc: 'Minecraft',
  discord: 'Discord',
  gamecms: 'GameCMS',
  xenforo: 'XenForo',
  ips: 'IPS',
  phpbb: 'phpBB',
  minecraft: 'Java Edition',
  tf2: 'TF2',
  telegram: 'Telegram',
  ark: 'ARK',
  altv: 'alt:V',
  ats: 'ATS',
  beamng: 'BeamNG',
  ets2: 'ETS 2',
  fivem: 'FiveM',
  gmod: 'GMod',
  hl: 'Half-Life',
  hl2: 'Half-Life 2',
  hosting: 'Хостинг',
  l4d: 'L4D',
  l4d2: 'L4D2',
  flute: 'Flute CMS',
  figma: 'Figma',
  dle: 'DLE',
  minecraftbedrock: 'Bedrock Edition',
  mta: 'MTA',
  projectz: 'Project Z',
  ragemp: 'RAGE MP',
  redm: 'RedM',
  rust: 'Rust',
  tf: 'TF',
  unturned: 'Unturned',
}


function formatAmount(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function salesBucket(n: number): string {
  if (n >= 100) return `${Math.floor(n / 100) * 100}+`
  if (n >= 10) return `${Math.floor(n / 10) * 10}+`
  if (n >= 5) return '5+'
  return '1+'
}

function daysSince(iso: string): number {
  const t = new Date(iso).getTime()
  if (!Number.isFinite(t)) return Number.POSITIVE_INFINITY
  return (Date.now() - t) / 86_400_000
}

function relativeTime(iso: string): { unit: string; value: number } {
  const ms = Date.now() - new Date(iso).getTime()
  const sec = Math.max(0, ms / 1000)
  const min = sec / 60
  const hour = min / 60
  const day = hour / 24
  const month = day / 30
  const year = day / 365
  if (sec < 60) return { unit: 'сек', value: Math.floor(sec) }
  if (min < 60) return { unit: 'мин', value: Math.floor(min) }
  if (hour < 24) return { unit: 'ч', value: Math.floor(hour) }
  if (day < 30) return { unit: 'дн', value: Math.floor(day) }
  if (month < 12) return { unit: 'мес', value: Math.floor(month) }
  return { unit: 'г', value: Math.floor(year) }
}

function formatViewedAt(iso: string): string {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}, ${p(d.getHours())}:${p(d.getMinutes())}`
}

type PrimaryBadge = 'hot' | 'new' | 'updated' | null
function primaryBadge(r: ResourceCardResource): PrimaryBadge {
  if (daysSince(r.createdAt) <= 14) return 'new'
  if (r.updatedAt && daysSince(r.updatedAt) <= 14) return 'updated'
  if (r.sales >= 50) return 'hot'
  return null
}


function CurrencyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={rs('currencyIcon')} aria-hidden="true">
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
    </svg>
  )
}

const STAR_PATH =
  'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'

function PublishedIcon() {
  return (
    <svg viewBox="0 0 640 640" fill="currentColor" className={rs('tileStatIcon')} aria-hidden="true">
      <path d="M320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64zM296 184L296 320C296 328 300 335.5 306.7 340L402.7 404C413.7 411.4 428.6 408.4 436 397.3C443.4 386.2 440.4 371.4 429.3 364L344 307.2L344 184C344 170.7 333.3 160 320 160C306.7 160 296 170.7 296 184z" />
    </svg>
  )
}

function ViewsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 640 640"
      fill="currentColor"
      className={rs('tileStatIcon')}
      aria-hidden="true"
    >
      <path d="M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220 512.6 176.6C465.5 132.9 400.8 96 320 96zM176 320C176 240.5 240.5 176 320 176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 399.5 176 320zM320 256C320 291.3 291.3 320 256 320C244.5 320 233.7 317 224.3 311.6C223.3 322.5 224.2 333.7 227.2 344.8C240.9 396 293.6 426.4 344.8 412.7C396 399 426.4 346.3 412.7 295.1C400.5 249.4 357.2 220.3 311.6 224.3C316.9 233.6 320 244.4 320 256z" />
    </svg>
  )
}

function SalesIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 640 640"
      fill="currentColor"
      className={rs('tileStatIcon')}
      aria-hidden="true"
    >
      <path d="M256 144C256 108.7 284.7 80 320 80C355.3 80 384 108.7 384 144L384 192L256 192L256 144zM208 192L144 192C117.5 192 96 213.5 96 240L96 448C96 501 139 544 192 544L448 544C501 544 544 501 544 448L544 240C544 213.5 522.5 192 496 192L432 192L432 144C432 82.1 381.9 32 320 32C258.1 32 208 82.1 208 144L208 192zM232 240C245.3 240 256 250.7 256 264C256 277.3 245.3 288 232 288C218.7 288 208 277.3 208 264C208 250.7 218.7 240 232 240zM384 264C384 250.7 394.7 240 408 240C421.3 240 432 250.7 432 264C432 277.3 421.3 288 408 288C394.7 288 384 277.3 384 264z" />
    </svg>
  )
}

function UpdatesIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 576 512"
      fill="currentColor"
      className={rs('tileStatIcon')}
      aria-hidden="true"
    >
      <path d="M288 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160zm156.8-48C430 361 365.4 416 288 416S146 361 131.2 288L32 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l99.2 0C146 151 210.6 96 288 96s142 55 156.8 128l99.2 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-99.2 0z" />
    </svg>
  )
}

function ViewedBadgeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 576 512"
      fill="currentColor"
      className={rs('cardCatalogViewedBadgeIcon')}
      aria-hidden="true"
    >
      <path d="M96 224c-11.2 0-21.7 2.9-30.9 7.9 3.5-37.5 15.1-70.1 31-93.9 19.3-29 42.6-42 63.9-42s44.5 13 63.9 42c19.2 28.8 32.1 70.4 32.1 118s-12.9 89.2-32.1 118c-19.3 29-42.6 42-63.9 42s-44.5-13-63.9-42c-4.7-7-9-14.8-12.8-23.3 4.1 .8 8.4 1.3 12.7 1.3 35.3 0 64-28.7 64-64s-28.7-64-64-64zM288 120.6c-3.4-6.3-7-12.4-10.9-18.2-27-40.5-67.8-70.5-117.1-70.5S69.8 62 42.9 102.5C15.7 143.2 0 197.5 0 256S15.7 368.8 42.9 409.5C69.8 450 110.6 480 160 480s90.2-30 117.1-70.5c3.9-5.8 7.5-11.8 10.9-18.2 3.4 6.3 7 12.4 10.9 18.2 27 40.5 67.8 70.5 117.1 70.5s90.2-30 117.1-70.5C560.3 368.8 576 314.5 576 256s-15.7-112.8-42.9-153.5C506.2 62 465.4 32 416 32s-90.2 30-117.1 70.5c-3.9 5.8-7.5 11.8-10.9 18.2zm51.3 230.1c4.1 .8 8.4 1.3 12.7 1.3 35.3 0 64-28.7 64-64s-28.7-64-64-64c-11.2 0-21.7 2.9-30.9 7.9 3.5-37.5 15.1-70.1 31-93.9 19.4-29 42.6-42 63.9-42s44.5 13 63.9 42c19.2 28.8 32.1 70.4 32.1 118s-12.9 89.2-32.1 118c-19.4 29-42.6 42-63.9 42s-44.5-13-63.9-42c-4.7-7-9-14.8-12.8-23.3z" />
    </svg>
  )
}

function CategoryGlyph({ category }: { category: string }) {
  const icon = CATEGORY_ICONS[category] ?? CATEGORY_ICONS.other
  return (
    <svg viewBox={icon.viewBox} overflow="visible" focusable="false">
      <path d={icon.path} fill="currentColor" />
    </svg>
  )
}

function CardRating({ rating, reviewsCount }: { rating: number; reviewsCount: number }) {
  const t = useT()
  return (
    <>
      <div className={pr('stars')} role="img" aria-label={`${t('Оценка')} ${rating.toFixed(1)} ${t('из 5')}`}>
        {Array.from({ length: 5 }, (_, i) => {
          const pct = Math.max(0, Math.min(100, (rating - i) * 100))
          return (
            <span key={i} className={pr('starSlot')}>
              <svg viewBox="0 0 24 24" fill="currentColor" className={pr('starBg')} aria-hidden="true">
                <path d={STAR_PATH} />
              </svg>
              <span className={pr('starFillClip')} style={{ width: `${pct}%` }}>
                {pct > 0 && (
                  <svg viewBox="0 0 24 24" fill="currentColor" className={pr('starFg')} aria-hidden="true">
                    <path d={STAR_PATH} />
                  </svg>
                )}
              </span>
            </span>
          )
        })}
      </div>
      <span className={pr('ratingValue')}>{rating.toFixed(1)}</span>
      <span className={pr('reviewsCount')}>({reviewsCount})</span>
    </>
  )
}

function ViewedBadge({ viewedAt }: { viewedAt: string }) {
  const t = useT()
  return (
    <span
      className={rs('cardCatalogViewedBadge')}
      role="button"
      aria-label={`${t('Вы смотрели')} ${formatViewedAt(viewedAt)}`}
      tabIndex={0}
      data-tooltip-trigger=""
    >
      <ViewedBadgeIcon />
    </span>
  )
}

export function ResourceCard({
  resource,
  viewedAt,
  onboarding = false,
  cart,
}: {
  resource: ResourceCardResource
  viewedAt?: string | null
  onboarding?: boolean
  cart?: ResourceCardCart
}) {
  void cart
  const t = useT()

  const {
    slug,
    title,
    shortDescription,
    price,
    discount,
    category,
    tags,
    images,
    coverImage,
    rating,
    reviewsCount,
    sales,
    uniqueViews,
    listingKind,
    createdAt,
    buyerUpdatesCount,
    createdWithAiTools,
    catalogImage,
  } = resource

  const isFree = listingKind === 'FREE'
  const onSale = !isFree && typeof discount === 'number' && discount < price
  const current = onSale ? (discount as number) : price
  const percentOff = onSale ? Math.round((1 - (discount as number) / price) * 100) : 0

  const displayCover = catalogImage || coverImage || null
  const carousel = displayCover ? [displayCover, ...images] : images
  const totalImages = carousel.length
  const coverSrc: string | null = totalImages > 0 ? carousel[0] : null

  const gameTags = tags.filter((tag) => tag in GAME_TAG_LABELS)

  const primary = primaryBadge(resource)
  const isAi = createdWithAiTools === true
  const hasPersonal = Boolean(
    resource.catalogHasDiscordRoleDiscount ||
      resource.catalogHasResourcePurchaseDiscount ||
      (typeof resource.catalogVolumeDiscountMaxPct === 'number' &&
        resource.catalogVolumeDiscountMaxPct > 0),
  )

  const badgeText: Record<'hot' | 'new' | 'updated', string> = {
    hot: t('Хит'),
    new: t('NEW'),
    updated: t('UPDATE'),
  }
  const badgeAria: Record<'hot' | 'new' | 'updated', string> = {
    hot: `${title}. ${t('Часто покупаемый')}`,
    new: `${title}. ${t('Недавно добавлен в каталог')}`,
    updated: `${title}. ${t('Содержимое недавно обновляли')}`,
  }

  const rel = relativeTime(createdAt)
  const relText = `${rel.value} ${rel.unit}. ${t('назад')}`

  const coverStyle: CSSProperties = {
    position: 'absolute',
    height: '100%',
    width: '100%',
    inset: '0px',
    color: 'transparent',
  }

  return (
    <Link
      className={rs('card')}
      href={`/resource/${slug}`}
      data-onboarding={onboarding ? 'resourceCard' : undefined}
    >
      <div className={rs('tileLead')}>
        <div className={ta('avatar', 'avatarAllowOverflow') + ' ' + rs('tileAvatarOnCard')}>
          <div className={ta('avatarImgSlotFull')}>
            <span className={ci('icon') + ' ' + ta('avatarImg')} aria-hidden="true">
              <CategoryGlyph category={category} />
            </span>
          </div>
        </div>
      </div>

      <div className={rs('tileLeadText')}>
        <div className={rs('tileTitleRow')}>
          <h2 className={rs('tileTitle')} title={title}>
            {title}
          </h2>
        </div>
        <div className={rs('tileKindRow')}>
          <span className={rs('tileKind')}>{t(CATEGORY_LABELS[category] ?? category)}</span>

          {gameTags.length > 0 && (
            <div className={rs('tileKindGameIcons')} role="group" aria-label={t('Игры по тегам')}>
              {gameTags.map((tag) => (
                <div key={tag} className={rs('tileKindGameIconSlot')}>
                  <img
                    alt={GAME_TAG_LABELS[tag]}
                    loading="eager"
                    width={32}
                    height={32}
                    decoding="async"
                    data-nimg="1"
                    className={rs('tileKindGameIconImg')}
                    src={`${CDN}/img/games/${tag}.webp`}
                    style={{ color: 'transparent' }}
                  />
                </div>
              ))}
            </div>
          )}

          {primary === 'hot' && (
            <span
              className={rs('tileLeadBadge', 'tileLeadBadge_hot')}
              aria-label={badgeAria.hot}
              data-tooltip-trigger=""
            >
              {badgeText.hot}
            </span>
          )}
          {(primary === 'new' || primary === 'updated') && (
            <div className={rs('tileTitleBadges')}>
              <span
                className={rs('tileLeadBadge', `tileLeadBadge_${primary}`)}
                aria-label={badgeAria[primary]}
                data-tooltip-trigger=""
              >
                {badgeText[primary]}
              </span>
            </div>
          )}
          {isAi && (
            <span
              className={rs('tileLeadBadge', 'tileLeadBadge_ai')}
              aria-label={`${title}. ${t('Автор указал, что при разработке использовался искусственный интеллект как вспомогательный инструмент')}`}
              data-tooltip-trigger=""
            >
              {t('ИИ')}
            </span>
          )}
          {hasPersonal && (
            <span
              className={rs('tileLeadBadge', 'tileLeadBadge_personal')}
              aria-label={t('Доступны персональные скидки')}
              data-tooltip-trigger=""
            >
              %
            </span>
          )}
        </div>
      </div>

      <div className={rs('cardImage')}>
        <div className={rs('cardImageVisual')}>
          <div className={rs('cardImageClip')}>
            <div className={rs('cardCatalogCoverLayer')}>
              {coverSrc ? (
                <div className={rs('cardCatalogCoverViewport')}>
                  <img
                    alt=""
                    loading="lazy"
                    decoding="async"
                    data-nimg="fill"
                    className={rs('cardCatalogCoverImage') + ' '}
                    src={`${CDN}${coverSrc}`}
                    style={coverStyle}
                  />
                </div>
              ) : (
                <div className={bip('root')} role="img" aria-label={title}>
                  <span
                    className={bip('logoSlot', 'logoSlotDefault')}
                    aria-hidden="true"
                  >
                    <img
                      alt=""
                      loading="lazy"
                      width={52}
                      height={52}
                      decoding="async"
                      data-nimg="1"
                      className={bip('icon', 'logoLight')}
                      src="/icons/logo_light_bk.svg"
                      style={{ color: 'transparent' }}
                    />
                    <img
                      alt=""
                      loading="lazy"
                      width={52}
                      height={52}
                      decoding="async"
                      data-nimg="1"
                      className={bip('icon', 'logoDark')}
                      src="/icons/logo_dark_bk.svg"
                      style={{ color: 'transparent' }}
                    />
                  </span>
                </div>
              )}
            </div>
          </div>
          {viewedAt && <ViewedBadge viewedAt={viewedAt} />}
        </div>

        {totalImages > 1 && (
          <>
            <div className={rs('cardCoverStripHits')} aria-hidden="true">
              {Array.from({ length: totalImages }, (_, i) => (
                <div key={i} className={rs('cardCoverStripHit')} />
              ))}
            </div>
            <div className={rs('imageDots')}>
              {Array.from({ length: totalImages }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  className={i === 0 ? rs('dot', 'dotActive') : rs('dot') + ' '}
                  aria-label={`Image ${i + 1} of ${totalImages}`}
                  aria-current={i === 0 ? 'true' : undefined}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className={rs('tileBody')}>
        <div className={rs('tilePriceRow')} data-nosnippet="true">
          <div className={rs('tilePriceRowMain')}>
            {isFree ? (
              <span className={rs('tilePrice')}>{t('Бесплатно')}</span>
            ) : (
              <>
                {onSale && <span className={rs('oldPrice')}>{formatAmount(price)}</span>}
                <span className={rs('tilePrice')}>
                  {formatAmount(current)}
                  <CurrencyIcon />
                </span>
                {onSale && (
                  <span className={rs('tileDiscountBadge')} aria-label={`${t('Скидка')} ${percentOff}%`}>
                    <span className={rs('tileDiscountSign')} aria-hidden="true">
                      −
                    </span>
                    <span>{percentOff} %</span>
                  </span>
                )}
              </>
            )}
          </div>
          <span
            className={rs('tileStat')}
            aria-label={`${t('Опубликовано')} ${relText}`}
            data-tooltip-trigger=""
          >
            <PublishedIcon />
            {relText}
          </span>
        </div>

        {shortDescription && (
          <div className={rs('tileBlurbTags')}>
            <span className={rs('tileBlurb')}>{shortDescription}</span>
          </div>
        )}

        <div className={rs('tileRatingFooter')}>
          <CardRating rating={rating} reviewsCount={reviewsCount} />
          <div className={rs('tileStats')}>
            <span
              className={rs('tileStat')}
              aria-label={`${t('Уникальных просмотров:')} ${uniqueViews}`}
              data-tooltip-trigger=""
            >
              <ViewsIcon />
              {formatAmount(uniqueViews)}
            </span>
            {sales > 0 ? (
              <span
                className={rs('tileStat')}
                aria-label={`${t('Всего покупок:')} ${sales}, ${t('на карточке: покупок')} ${salesBucket(sales)}`}
                data-tooltip-trigger=""
              >
                <SalesIcon />
                {salesBucket(sales)}
              </span>
            ) : (
              <span
                className={rs('tileStat')}
                aria-label={`${t('Продано всего:')} 0`}
                data-tooltip-trigger=""
              >
                <SalesIcon />0
              </span>
            )}
            <span
              className={rs('tileStat')}
              aria-label={`${t('Обновлений:')} ${buyerUpdatesCount}`}
              data-tooltip-trigger=""
            >
              <UpdatesIcon />
              {buyerUpdatesCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ResourceCard
