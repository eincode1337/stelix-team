'use client'


import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  createElement,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useSignInDrawer } from '@/components/auth/SignInDrawer'
import { useT } from '@/i18n/LocaleProvider'

const rd = (...n: string[]) => n.map((x) => `ResourceDetail-module__XriO0W__${x}`).join(' ')
const pr = (...n: string[]) => n.map((x) => `ProductRating-module__gtpVKG__${x}`).join(' ')
const rs = (...n: string[]) => n.map((x) => `Resources-module__Zk5JmW__${x}`).join(' ')
const ph = (...n: string[]) => n.map((x) => `PageHeaderBar-module__1SDZQW__${x}`).join(' ')
const aor = (...n: string[]) => n.map((x) => `AuthorOtherResources-module__hJivwG__${x}`).join(' ')
const ta = (...n: string[]) => n.map((x) => `TileAvatar-module__qnVd5W__${x}`).join(' ')
const ci = (...n: string[]) => n.map((x) => `CategoryIcon-module__kwjccG__${x}`).join(' ')
const cc = (...n: string[]) => n.map((x) => `commerceChat-module__x8r-aW__${x}`).join(' ')
const ap = (...n: string[]) => n.map((x) => `AdminPanel-module__8pW_9a__${x}`).join(' ')
const hero = (...n: string[]) => n.map((x) => `Hero-module__ZjlDhW__${x}`).join(' ')
const phs = (...n: string[]) => n.map((x) => `PageHeaderSearch-module__szXj0q__${x}`).join(' ')
const bip = (...n: string[]) => n.map((x) => `BrokenImagePlaceholder-module__Nzt9-q__${x}`).join(' ')

const CDN = 'https://cdn.stelix.team'

const NEW_WITHIN_DAYS = 7


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

interface IconDef {
  viewBox: string
  d: string
}
const MODULES_ICON: IconDef = {
  viewBox: '0 0 640 512',
  d: 'M544 32c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64l-384 0c-33.1 0-60.4-25.2-63.7-57.5l-.3-6.5 0-128 288 0 0-256 160 0zM135.6 64c-9.1 9.1-30.4 30.5-64 64 33.5 33.5 54.8 54.9 64 64l-39.6 39.6-19.8-19.8-64-64c-10.9-10.9-10.9-28.7 0-39.6l64-64 19.8-19.8 39.6 39.6zM243.8 44.2l64 64c10.9 10.9 10.9 28.7 0 39.6l-64 64-19.8 19.8-39.6-39.6c9.1-9.1 30.4-30.5 64-64-33.5-33.5-54.8-54.9-64-64L224 24.4 243.8 44.2z',
}
const CATEGORY_ICONS: Record<string, IconDef> = {
  modules: MODULES_ICON,
  integrations: {
    viewBox: '0 0 576 512',
    d: 'M344 380c24.3 0 44 19.7 44 44l0 104c0 11-9 20-20 20s-20-9-20-20l0-28-24 0 0 28c0 11-9 20-20 20s-20-9-20-20l0-104c0-24.3 19.7-44 44-44l16 0zm120 0c33.1 0 60 26.9 60 60s-26.9 60-60 60l-12 0 0 28c0 11-9 20-20 20s-20-9-20-20l0-128c0-11 9-20 20-20l32 0zm96 0c11 0 20 9 20 20l0 128c0 11-9 20-20 20s-20-9-20-20l0-128c0-11 9-20 20-20zM328 420c-2.2 0-4 1.8-4 4l0 36 24 0 0-36c0-2.2-1.8-4-4-4l-16 0zm124 40l12 0c11 0 20-9 20-20s-9-20-20-20l-12 0 0 40zM317.9-16c15.2 0 28.3 10.7 31.3 25.6l14.4 69.9c14.1 6 27.3 13.7 39.3 22.7l67.8-22.5c14.4-4.8 30.2 1.2 37.8 14.4l29.9 51.8c7.6 13.1 4.9 29.8-6.4 39.9l-53.5 47.5c.9 7.4 1.4 15 1.4 22.7 0 7.7-.5 15.2-1.4 22.7l53.5 47.5c3.2 2.8 5.6 6.2 7.4 9.8L304 336c-35.3 0-64 28.7-64 64l0 41.9c-24.6-6.3-47.3-17.4-67-32.2l-67.8 22.5c-14.4 4.8-30.2-1.2-37.8-14.4L37.5 366.1c-7.6-13.1-4.9-29.8 6.5-39.9l53.4-47.5c-.9-7.4-1.3-15-1.3-22.7s.5-15.2 1.3-22.7L44 185.8c-11.3-10.1-14.1-26.8-6.5-39.9L67.4 94.1C75 80.9 90.8 74.9 105.2 79.7L173 102.2c12.1-9 25.3-16.7 39.3-22.7L226.7 9.6C229.8-5.3 242.9-16 258.1-16l59.8 0zM288 172c-46.4 0-84 37.6-84 84 0 23.7 9.8 45 25.6 60.3 19.8-17.6 45.9-28.3 74.4-28.3l61.6 0c4.1-9.9 6.4-20.7 6.4-32 0-46.4-37.6-84-84-84z',
  },
  scripts: {
    viewBox: '0 0 576 512',
    d: 'M360.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm64.6 136.1c-12.5 12.5-12.5 32.8 0 45.3l73.4 73.4-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l96-96c12.5-12.5 12.5-32.8 0-45.3l-96-96c-12.5-12.5-32.8-12.5-45.3 0zm-274.7 0c-12.5-12.5-32.8-12.5-45.3 0l-96 96c-12.5 12.5-12.5 32.8 0 45.3l96 96c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 150.6 182.6c12.5-12.5 12.5-32.8 0-45.3z',
  },
}

const GAME_TAGS: Record<string, string> = {
  cs2: 'CS2', lrweb: 'LR Web', csgo: 'CS:GO', css: 'CSS', cs16: 'CS 1.6',
  mc: 'Minecraft', discord: 'Discord', gamecms: 'GameCMS', xenforo: 'XenForo',
  ips: 'IPS', phpbb: 'phpBB', minecraft: 'Java Edition', tf2: 'TF2',
  telegram: 'Telegram', ark: 'ARK', altv: 'alt:V', ats: 'ATS', beamng: 'BeamNG',
  ets2: 'ETS 2', fivem: 'FiveM', gmod: 'GMod', hl: 'Half-Life', hl2: 'Half-Life 2',
  hosting: 'Хостинг', l4d: 'L4D', l4d2: 'L4D2', flute: 'Flute CMS', figma: 'Figma',
  dle: 'DLE', minecraftbedrock: 'Bedrock Edition', mta: 'MTA', projectz: 'Project Z',
  ragemp: 'RAGE MP', redm: 'RedM', rust: 'Rust', tf: 'TF', unturned: 'Unturned',
}

interface RoleBadge {
  label: string
  color: string
  bg: string
}
const ROLE_BADGES: Record<string, RoleBadge> = {
  SELLER_PLUS: { label: 'Продавец+', color: 'rgb(130, 80, 223)', bg: 'rgba(130, 80, 223, 0.125)' },
  SELLER: { label: 'Продавец', color: 'rgb(130, 80, 223)', bg: 'rgba(130, 80, 223, 0.125)' },
}


export interface ResourceDetailData {
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
  author: string
  authorId: number
  authorRole: string
  sales: number
  downloads: number
  listingKind: string
  uniqueViews: number
  createdAt: string
  buyerUpdatesCount: number
  createdWithAiTools: boolean
  reviewsCount: number
  rating: number
  authorReviewsCount: number
  authorRating: number
}

export interface OtherResourceData {
  id: string
  slug: string
  title: string
  shortDescription: string
  price: number
  discount: number
  category: string
  tags: string[]
  images: string[]
  coverImage: string
  sales: number
  uniqueViews: number
  createdAt: string
  buyerUpdatesCount: number
  createdWithAiTools: boolean
  reviewsCount: number
  rating: number
  listingKind: string
}

export interface AuthorMeta {
  name: string
  profileSlug: string
  image: string | null
  role: string
  resourcesCount: number
  totalSales: number
}

export interface CoOwnerMeta extends AuthorMeta {}

export interface PurchaseConditionItem {
  status: 'need' | 'info' | 'ok'
  label: string
  action?: { label: string; href?: string }
}


function formatAmount(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function imgUrl(path: string): string {
  if (!path) return ''
  return path.startsWith('http') ? path : `${CDN}${path.startsWith('/') ? '' : '/'}${path}`
}

function thumbVariant(path: string): string {
  return path.replace(/(\.[a-z0-9]+)(\?.*)?$/i, '_thumb$1$2')
}

function reviewsWord(n: number): string {
  const mod100 = n % 100
  const mod10 = n % 10
  if (mod100 >= 11 && mod100 <= 14) return 'отзывов'
  if (mod10 === 1) return 'отзыв'
  if (mod10 >= 2 && mod10 <= 4) return 'отзыва'
  return 'отзывов'
}

function purchaseBucket(n: number): number {
  if (n < 5) return 1
  if (n < 10) return 5
  return Math.floor(n / 10) * 10
}

function sellerSalesBucket(n: number): number {
  if (n >= 100) return Math.floor(n / 100) * 100
  if (n >= 10) return Math.floor(n / 10) * 10
  if (n >= 1) return 1
  return 0
}

function formatAgo(createdAtMs: number, nowMs: number): string {
  const diff = Math.max(0, nowMs - createdAtMs)
  const min = Math.floor(diff / 60000)
  const hr = Math.floor(diff / 3600000)
  const day = Math.floor(diff / 86400000)
  if (day < 1) {
    if (hr >= 1) return `${hr} ч. назад`
    if (min >= 1) return `${min} мин. назад`
    return 'только что'
  }
  const months = Math.floor(day / 30)
  if (months >= 12) return `${Math.floor(months / 12)} г. назад`
  if (months >= 1) return `${months} мес. назад`
  return `${day} дн. назад`
}

function isNew(createdAtMs: number, nowMs: number): boolean {
  return nowMs - createdAtMs < NEW_WITHIN_DAYS * 86400000
}

function gameTagsOf(tags: string[]): Array<{ id: string; label: string }> {
  return tags
    .filter((t) => Object.prototype.hasOwnProperty.call(GAME_TAGS, t))
    .map((t) => ({ id: t, label: GAME_TAGS[t] }))
}

function categoryIconOf(category: string): IconDef {
  return CATEGORY_ICONS[category] ?? MODULES_ICON
}


function CurrencyIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
    </svg>
  )
}

function StarIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function CategorySvg({ icon, className }: { icon: IconDef; className?: string }) {
  return (
    <svg viewBox={icon.viewBox} overflow="visible" focusable="false" className={className}>
      <path d={icon.d} fill="currentColor" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" className={rs('tileStatIcon')} aria-hidden="true">
      <path d="M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220 512.6 176.6C465.5 132.9 400.8 96 320 96zM176 320C176 240.5 240.5 176 320 176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 399.5 176 320zM320 256C320 291.3 291.3 320 256 320C244.5 320 233.7 317 224.3 311.6C223.3 322.5 224.2 333.7 227.2 344.8C240.9 396 293.6 426.4 344.8 412.7C396 399 426.4 346.3 412.7 295.1C400.5 249.4 357.2 220.3 311.6 224.3C316.9 233.6 320 244.4 320 256z" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" className={rs('tileStatIcon')} aria-hidden="true">
      <path d="M256 144C256 108.7 284.7 80 320 80C355.3 80 384 108.7 384 144L384 192L256 192L256 144zM208 192L144 192C117.5 192 96 213.5 96 240L96 448C96 501 139 544 192 544L448 544C501 544 544 501 544 448L544 240C544 213.5 522.5 192 496 192L432 192L432 144C432 82.1 381.9 32 320 32C258.1 32 208 82.1 208 144L208 192zM232 240C245.3 240 256 250.7 256 264C256 277.3 245.3 288 232 288C218.7 288 208 277.3 208 264C208 250.7 218.7 240 232 240zM384 264C384 250.7 394.7 240 408 240C421.3 240 432 250.7 432 264C432 277.3 421.3 288 408 288C394.7 288 384 277.3 384 264z" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" className={rs('tileStatIcon')} aria-hidden="true">
      <path d="M288 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160zm156.8-48C430 361 365.4 416 288 416S146 361 131.2 288L32 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l99.2 0C146 151 210.6 96 288 96s142 55 156.8 128l99.2 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-99.2 0z" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 640 640" fill="currentColor" className={rs('tileStatIcon')} aria-hidden="true">
      <path d="M320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64zM296 184L296 320C296 328 300 335.5 306.7 340L402.7 404C413.7 411.4 428.6 408.4 436 397.3C443.4 386.2 440.4 371.4 429.3 364L344 307.2L344 184C344 170.7 333.3 160 320 160C306.7 160 296 170.7 296 184z" />
    </svg>
  )
}

function HoverFxIcon({ thumbnail }: { thumbnail?: boolean }) {
  return (
    <div className={rd('mainImageHoverFx')} aria-hidden="true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        fill="currentColor"
        className={thumbnail ? rd('mainImageHoverFxIcon', 'thumbnailHoverFxIcon') : rd('mainImageHoverFxIcon')}
      >
        <path d="M208 48a160 160 0 1 1 0 320 160 160 0 1 1 0-320zm0 368c48.8 0 93.7-16.8 129.1-44.9L471 505c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9L371.1 337.1C399.2 301.7 416 256.8 416 208 416 93.1 322.9 0 208 0S0 93.1 0 208 93.1 416 208 416zm0-304c-13.3 0-24 10.7-24 24l0 48-48 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l48 0 0 48c0 13.3 10.7 24 24 24s24-10.7 24-24l0-48 48 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-48 0 0-48c0-13.3-10.7-24-24-24z" />
      </svg>
    </div>
  )
}


function Stars({ rating }: { rating: number }) {
  return (
    <div className={pr('stars')} role="img" aria-label={`Оценка ${rating.toFixed(1)} из 5`}>
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.max(0, Math.min(100, (rating - i) * 100))
        return (
          <span key={i} className={pr('starSlot')}>
            <StarIcon className={pr('starBg')} />
            <span className={pr('starFillClip')} style={{ width: `${fill}%` }} />
          </span>
        )
      })}
    </div>
  )
}

function PurchasesStat({ sales }: { sales: number }) {
  if (sales <= 0) {
    return (
      <span className={rs('tileStat')} aria-label="Продано всего: 0" data-tooltip-trigger="">
        <LockIcon />0
      </span>
    )
  }
  const bucket = purchaseBucket(sales)
  return (
    <span
      className={rs('tileStat')}
      aria-label={`Всего покупок: ${sales}, на карточке: покупок ${bucket}+`}
      data-tooltip-trigger=""
    >
      <LockIcon />
      {bucket}+
    </span>
  )
}


function AuthorRow({ meta }: { meta: AuthorMeta }) {
  const badge = ROLE_BADGES[meta.role]
  const roleStyle: CSSProperties = badge ? { backgroundColor: badge.bg, color: badge.color } : {}
  return (
    <div className={rd('authorRow')}>
      <div className={rd('authorMain')}>
        <div className={rd('authorNameRow')}>
          {meta.image && (
            <img
              alt=""
              loading="lazy"
              width={22}
              height={22}
              decoding="async"
              data-nimg="1"
              className={rd('authorAvatar')}
              src={imgUrl(meta.image)}
              style={{ color: 'transparent' }}
            />
          )}
          <a className={rd('authorName')} href={`/profile/public/${meta.profileSlug}`}>
            {meta.name}
          </a>
          {badge && (
            <span className={rd('authorRoleBadge')} style={roleStyle}>
              <span className={rd('authorRoleBadgeLabel')}>{badge.label}</span>
            </span>
          )}
        </div>
      </div>
      <div className={rd('authorStats')} aria-label="Статистика продавца">
        <span className={rd('authorStat')}>Ресурсов: {meta.resourcesCount}</span>
        <span className={rd('authorStat')}>Продаж: {sellerSalesBucket(meta.totalSales)}+</span>
        <span className={rd('authorStat')}>Жалоб: 0</span>
        <span className={rd('authorStat')}>Возвратов: 0</span>
      </div>
    </div>
  )
}


function renderMarkdown(md: string): ReactNode {
  const blocks = md.split(/\r?\n\s*\r?\n/).map((b) => b.trim()).filter(Boolean)
  const nodes: ReactNode[] = []
  blocks.forEach((block, bi) => {
    if (bi > 0) nodes.push(<div key={`bl-${bi}`} className="md-blank-line" />)
    const heading = /^(#{1,6})\s+(.*)$/.exec(block)
    if (heading) {
      const level = Math.min(6, heading[1].length)
      nodes.push(createElement(`h${level}`, { key: `b-${bi}` }, heading[2]))
      return
    }
    const lines = block.split(/\r?\n/)
    const isList = lines.every((l) => /^[-*]\s+/.test(l.trim()))
    if (isList) {
      nodes.push(
        <ul key={`b-${bi}`}>
          {lines.map((l, li) => (
            <li key={li}>{l.trim().replace(/^[-*]\s+/, '')}</li>
          ))}
        </ul>,
      )
      return
    }
    nodes.push(
      <p key={`b-${bi}`}>
        {lines.map((l, li) => (
          <Fragment key={li}>
            {li > 0 && <br />}
            {l}
          </Fragment>
        ))}
      </p>,
    )
  })
  return nodes
}


function OtherResourceCard({ resource, nowMs }: { resource: OtherResourceData; nowMs: number }) {
  const isFree = resource.listingKind === 'FREE'
  const hasDiscount = !isFree && resource.discount > 0
  const current = resource.price
  const oldPrice = resource.price + resource.discount
  const percentOff = hasDiscount && oldPrice > 0 ? Math.round((resource.discount / oldPrice) * 100) : 0

  const categoryLabel = CATEGORY_LABELS[resource.category] ?? resource.category
  const games = gameTagsOf(resource.tags)
  const createdMs = Date.parse(resource.createdAt)
  const showNew = isNew(createdMs, nowMs)
  const showAi = resource.createdWithAiTools
  const ago = formatAgo(createdMs, nowMs)

  const galleryCount = (resource.coverImage ? 1 : 0) + resource.images.length
  const hasCover = Boolean(resource.coverImage)

  return (
    <Link className={rs('card')} href={`/resource/${resource.slug}`}>
      <div className={rs('tileLead')}>
        <div className={ta('avatar', 'avatarAllowOverflow') + ' ' + rs('tileAvatarOnCard')}>
          <div className={ta('avatarImgSlotFull')}>
            <span className={ci('icon') + ' ' + ta('avatarImg')} aria-hidden="true">
              <CategorySvg icon={categoryIconOf(resource.category)} />
            </span>
          </div>
        </div>
        <div className={rs('tileLeadText')}>
          <div className={rs('tileTitleRow')}>
            <h2 className={rs('tileTitle')} title={resource.title}>
              {resource.title}
            </h2>
          </div>
          <div className={rs('tileKindRow')}>
            <span className={rs('tileKind')}>{categoryLabel}</span>
            {games.length > 0 && (
              <div className={rs('tileKindGameIcons')} role="group" aria-label="Игры по тегам">
                {games.map((g) => (
                  <div key={g.id} className={rs('tileKindGameIconSlot')}>
                    <img
                      alt={g.label}
                      loading="eager"
                      width={32}
                      height={32}
                      decoding="async"
                      data-nimg="1"
                      className={rs('tileKindGameIconImg')}
                      src={`${CDN}/img/games/${g.id}.webp`}
                      style={{ color: 'transparent' }}
                    />
                  </div>
                ))}
              </div>
            )}
            {showNew && (
              <div className={rs('tileTitleBadges')}>
                <span
                  className={rs('tileLeadBadge', 'tileLeadBadge_new')}
                  aria-label={`${resource.title}. Недавно добавлен в каталог`}
                  data-tooltip-trigger=""
                >
                  NEW
                </span>
              </div>
            )}
            {showAi && (
              <span
                className={rs('tileLeadBadge', 'tileLeadBadge_ai')}
                aria-label={`${resource.title}. Автор указал, что при разработке использовался искусственный интеллект как вспомогательный инструмент`}
                data-tooltip-trigger=""
              >
                ИИ
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={rs('cardImage')}>
        <div className={rs('cardImageVisual')}>
          <div className={rs('cardImageClip')}>
            <div className={rs('cardCatalogCoverLayer')}>
              {hasCover ? (
                <div className={rs('cardCatalogCoverViewport')}>
                  <img
                    alt=""
                    loading="lazy"
                    decoding="async"
                    data-nimg="fill"
                    className={rs('cardCatalogCoverImage') + ' '}
                    src={imgUrl(resource.coverImage)}
                    style={{ position: 'absolute', height: '100%', width: '100%', inset: 0, color: 'transparent' }}
                  />
                </div>
              ) : (
                <div className={bip('root')} role="img" aria-label={resource.title}>
                  <span className={bip('logoSlot', 'logoSlotDefault')} aria-hidden="true">
                    <img alt="" loading="lazy" width={52} height={52} decoding="async" data-nimg="1" className={bip('icon', 'logoLight')} src="/icons/logo_light_bk.svg" style={{ color: 'transparent' }} />
                    <img alt="" loading="lazy" width={52} height={52} decoding="async" data-nimg="1" className={bip('icon', 'logoDark')} src="/icons/logo_dark_bk.svg" style={{ color: 'transparent' }} />
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        {hasCover && (
          <div className={rs('cardCoverStripHits')} aria-hidden="true">
            <div className={rs('cardCoverStripHit')} />
            <div className={rs('cardCoverStripHit')} />
            <div className={rs('cardCoverStripHit')} />
          </div>
        )}
        {hasCover && galleryCount > 1 && (
          <div className={rs('imageDots')}>
            {Array.from({ length: galleryCount }, (_, i) => (
              <button
                key={i}
                type="button"
                className={i === 0 ? rs('dot', 'dotActive') : rs('dot') + ' '}
                aria-label={`Image ${i + 1} of ${galleryCount}`}
                aria-current={i === 0 ? 'true' : undefined}
              />
            ))}
          </div>
        )}
      </div>

      <div className={rs('tileBody')}>
        <div className={rs('tilePriceRow')} data-nosnippet="true">
          <div className={rs('tilePriceRowMain')}>
            {isFree ? (
              <span className={rs('tilePrice')}>Бесплатно</span>
            ) : (
              <>
                {hasDiscount && <span className={rs('oldPrice')}>{formatAmount(oldPrice)}</span>}
                <span className={rs('tilePrice')}>
                  {formatAmount(current)}
                  <CurrencyIcon className={rs('currencyIcon')} />
                </span>
                {hasDiscount && (
                  <span className={rs('tileDiscountBadge')} aria-label={`Скидка ${percentOff}%`}>
                    <span className={rs('tileDiscountSign')} aria-hidden="true">−</span>
                    <span>{percentOff} %</span>
                  </span>
                )}
              </>
            )}
          </div>
          <span className={rs('tileStat')} aria-label={`Опубликовано ${ago}`} data-tooltip-trigger="">
            <ClockIcon />
            {ago}
          </span>
        </div>

        {resource.shortDescription && (
          <div className={rs('tileBlurbTags')}>
            <span className={rs('tileBlurb')}>{resource.shortDescription}</span>
          </div>
        )}

        <div className={rs('tileRatingFooter')}>
          <Stars rating={resource.rating} />
          <span className={pr('ratingValue')}>{resource.rating.toFixed(1)}</span>
          <span className={pr('reviewsCount')}>({resource.reviewsCount})</span>
          <div className={rs('tileStats')}>
            <span className={rs('tileStat')} aria-label={`Уникальных просмотров: ${resource.uniqueViews}`} data-tooltip-trigger="">
              <EyeIcon />
              {resource.uniqueViews}
            </span>
            <PurchasesStat sales={resource.sales} />
            <span className={rs('tileStat')} aria-label={`Обновлений: ${resource.buyerUpdatesCount}`} data-tooltip-trigger="">
              <RefreshIcon />
              {resource.buyerUpdatesCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}


type ActionStatus = 'idle' | 'adding' | 'buying' | 'error'

export function ResourceDetailView({
  resource,
  author,
  coOwners = [],
  otherResources = [],
  otherResourcesCount,
  purchaseConditions,
  now,
}: {
  resource: ResourceDetailData
  author: AuthorMeta
  coOwners?: CoOwnerMeta[]
  otherResources?: OtherResourceData[]
  otherResourcesCount?: number
  purchaseConditions?: PurchaseConditionItem[]
  now?: number
}) {
  const tr = useT()
  const router = useRouter()
  const { user } = useAuth()
  const signIn = useSignInDrawer()
  const enabled = Boolean(user)
  const nowMs = now ?? Date.now()

  const isFree = resource.listingKind === 'FREE'
  const hasDiscount = !isFree && resource.discount > 0
  const current = resource.price
  const oldPrice = resource.price + resource.discount
  const percentOff = hasDiscount && oldPrice > 0 ? Math.round((resource.discount / oldPrice) * 100) : 0

  const categoryLabel = CATEGORY_LABELS[resource.category] ?? resource.category
  const games = gameTagsOf(resource.tags)
  const createdMs = Date.parse(resource.createdAt)
  const showNew = isNew(createdMs, nowMs)
  const showAi = resource.createdWithAiTools
  const ago = formatAgo(createdMs, nowMs)

  const gallery = useMemo(() => {
    const list: string[] = []
    if (resource.coverImage) list.push(resource.coverImage)
    for (const img of resource.images) if (img) list.push(img)
    return list
  }, [resource.coverImage, resource.images])

  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [inCart, setInCart] = useState(false)
  const [purchased, setPurchased] = useState(false)
  const [status, setStatus] = useState<ActionStatus>('idle')
  const busy = status === 'adding' || status === 'buying'

  const paidOthersCount = useMemo(
    () => otherResources.filter((r) => r.listingKind !== 'FREE').length,
    [otherResources],
  )
  const freeOthersCount = useMemo(
    () => otherResources.filter((r) => r.listingKind === 'FREE').length,
    [otherResources],
  )
  const othersTotal = otherResourcesCount ?? otherResources.length

  useEffect(() => {
    if (!enabled) {
      setInCart(false)
      setPurchased(false)
      return
    }
    const controller = new AbortController()
    void (async () => {
      try {
        const [cartRes, purRes] = await Promise.all([
          fetch('/api/cart', { credentials: 'include', cache: 'no-store', signal: controller.signal, headers: { Accept: 'application/json' } }),
          fetch('/api/purchases', { credentials: 'include', cache: 'no-store', signal: controller.signal, headers: { Accept: 'application/json' } }),
        ])
        if (cartRes.ok) {
          const data = (await cartRes.json()) as { items?: Array<{ resourceId?: unknown }> }
          setInCart((data.items ?? []).some((i) => i && i.resourceId === resource.id))
        }
        if (purRes.ok) {
          const data = (await purRes.json()) as { purchases?: Array<{ resourceId?: unknown }> }
          const rows = Array.isArray(data.purchases) ? data.purchases : []
          setPurchased(rows.some((p) => p && p.resourceId === resource.id))
        }
      } catch {
      }
    })()
    return () => controller.abort()
  }, [enabled, resource.id])

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false)
      else if (e.key === 'ArrowRight') setActive((i) => (i + 1) % gallery.length)
      else if (e.key === 'ArrowLeft') setActive((i) => (i - 1 + gallery.length) % gallery.length)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [lightbox, gallery.length])

  const broadcast = useCallback(() => {
    try {
      window.dispatchEvent(new CustomEvent('stelix:cart-changed'))
    } catch {
    }
  }, [])

  const addToCart = useCallback(async () => {
    if (!enabled) {
      signIn.open()
      return
    }
    if (busy || inCart) return
    setStatus('adding')
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ resourceId: resource.id }),
      })
      if (!res.ok) {
        setStatus('error')
        return
      }
      setInCart(true)
      setStatus('idle')
      broadcast()
    } catch {
      setStatus('error')
    }
  }, [enabled, busy, inCart, resource.id, signIn, broadcast])

  const buyNow = useCallback(async () => {
    if (!enabled) {
      signIn.open()
      return
    }
    if (busy || purchased) return
    setStatus('buying')
    try {
      if (!inCart) {
        const addRes = await fetch('/api/cart', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ resourceId: resource.id }),
        })
        if (!addRes.ok) {
          setStatus('error')
          return
        }
      }
      const res = await fetch('/api/cart/checkout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ resourceIds: [resource.id] }),
      })
      const data = res.ok ? ((await res.json().catch(() => null)) as { ok?: boolean } | null) : null
      if (!data?.ok) {
        setStatus('error')
        return
      }
      setInCart(false)
      setPurchased(true)
      setStatus('idle')
      broadcast()
    } catch {
      setStatus('error')
    }
  }, [enabled, busy, purchased, inCart, resource.id, signIn, broadcast])

  const reportHref =
    `/chat?tab=support&supportCompose=1&supportReason=report_resource` +
    `&supportBody=${encodeURIComponent(`https://stelix.team/resource/${resource.slug}`)}` +
    `&supportResourceId=${resource.id}`

  const mainSrc = gallery[active] ? imgUrl(gallery[active]) : ''
  const mainAlt = active === 0 ? resource.title : `${resource.title} — фото ${active + 1}`

  const openLightbox = () => setLightbox(true)
  const onMainKey = (e: ReactKeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openLightbox()
    }
  }
  const selectThumb = (i: number) => () => {
    setActive(i)
    setLightbox(true)
  }
  const onThumbKey = (i: number) => (e: ReactKeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setActive(i)
      setLightbox(true)
    }
  }

  const buyLabel = purchased ? tr('Куплено') : isFree ? tr('Получить сейчас') : tr('Купить сейчас')
  const cartLabel = inCart ? tr('В корзине') : tr('В корзину')

  return (
    <section className={rd('resourceDetailPage')}>
      <div className={'container ' + rd('resourceDetailPageInner')}>
        <header className={ph('headerBar') + ' ' + rd('resourceDetailPageHeader')}>
          <div className={ph('headerBar__start')}>
            <span className={ph('headerBar__title', 'headerBar__titleDecorative')}>{tr('Цифровой ресурс')}</span>
            <span className={cc('chatReportTooltipAnchor')} data-tooltip-trigger="">
              <a
                className={cc('chatReportButton')}
                aria-label={tr('Пожаловаться на ресурс: обращение в поддержку')}
                href={reportHref}
              >
                <svg viewBox="0 0 24 24" fill="none" className={cc('chatReportButtonIcon')} aria-hidden="true">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {tr('Пожаловаться')}
              </a>
            </span>
          </div>
          <div className={ph('headerBar__end')}>
            <span className={ph('headerBar__divider')} aria-hidden="true" />
            <div className={ph('headerBar__actions')}>
              <span className={rd('pageHeaderIconTooltipAnchor')} data-tooltip-trigger="">
                <button
                  type="button"
                  className={ap('tableIconButton') + ' ' + rd('pageHeaderTableIconButton')}
                  aria-label={tr('Вернуться к ресурсам')}
                  onClick={() => router.push('/resources')}
                >
                  <svg viewBox="0 0 24 24" fill="none" className={ap('tableIconButtonIcon')} aria-hidden="true">
                    <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </span>
            </div>
          </div>
        </header>

        <div className={rd('content')}>
          <div className={rd('gallery')} data-onboarding-rd="rd-gallery">
            <div
              className={rd('mainImage')}
              role="button"
              tabIndex={0}
              aria-label={tr('Открыть изображение в полноэкранном режиме')}
              onClick={openLightbox}
              onKeyDown={onMainKey}
            >
              {mainSrc && (
                <img
                  alt={mainAlt}
                  decoding="async"
                  data-nimg="fill"
                  className={rd('resourceGalleryCover')}
                  src={mainSrc}
                  style={{ position: 'absolute', height: '100%', width: '100%', inset: 0, color: 'transparent' }}
                />
              )}
              <HoverFxIcon />
            </div>
            {gallery.length > 1 && (
              <div className={rd('thumbnails')}>
                {gallery.map((src, i) =>
                  i === active ? null : (
                    <div
                      key={src + i}
                      className={rd('thumbnail')}
                      role="button"
                      tabIndex={0}
                      aria-label={tr('Открыть изображение в полноэкранном режиме')}
                      onClick={selectThumb(i)}
                      onKeyDown={onThumbKey(i)}
                    >
                      <img
                        alt={i === 0 ? resource.title : `${resource.title} — фото ${i + 1}`}
                        loading="lazy"
                        decoding="async"
                        data-nimg="fill"
                        className={rd('resourceGalleryCover')}
                        src={imgUrl(thumbVariant(src))}
                        style={{ position: 'absolute', height: '100%', width: '100%', inset: 0, color: 'transparent' }}
                      />
                      <HoverFxIcon thumbnail />
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          <div className={rd('info')}>
            <div className={rd('header')}>
              <div className={rd('headerTextCol')}>
                <div className={rd('detailLead')} data-onboarding-rd="rd-lead">
                  <div className={ta('avatar', 'avatarAllowOverflow', 'avatarDetail') + ' ' + rd('tileAvatarInDetailLead')}>
                    <div className={ta('avatarImgSlotFull')}>
                      <span className={ci('icon') + ' ' + ta('avatarImg')} aria-hidden="true">
                        <CategorySvg icon={categoryIconOf(resource.category)} />
                      </span>
                    </div>
                  </div>
                  <div className={rd('detailLeadText')}>
                    <h1 className={rd('detailTitle')}>{resource.title}</h1>
                    <div className={rd('detailKindRow')} data-nosnippet="true">
                      <span className={rd('detailKind')}>{categoryLabel}</span>
                      {games.length > 0 && (
                        <div className={rd('detailKindGameIcons')} role="group" aria-label="Игры по тегам">
                          {games.map((g) => (
                            <div key={g.id} className={rd('detailKindGameIconSlot')}>
                              <img
                                alt={g.label}
                                loading="eager"
                                width={32}
                                height={32}
                                decoding="async"
                                data-nimg="1"
                                className={rd('detailKindGameIconImg')}
                                src={`${CDN}/img/games/${g.id}.webp`}
                                style={{ color: 'transparent' }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      {(showNew || showAi) && (
                        <div className={rd('detailKindBadges')}>
                          {showNew && (
                            <span
                              className={rd('detailLeadBadge', 'detailLeadBadge_new')}
                              aria-label={`${resource.title}. Недавно добавлен в каталог`}
                              data-tooltip-trigger=""
                            >
                              NEW
                            </span>
                          )}
                          {showAi && (
                            <span
                              className={rd('detailLeadBadge', 'detailLeadBadge_ai')}
                              aria-label={`${resource.title}. Автор указал, что при разработке использовался искусственный интеллект как вспомогательный инструмент`}
                              data-tooltip-trigger=""
                            >
                              ИИ
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className={rd('priceBlock')}>
                <div className={rd('priceRow')} data-nosnippet="true">
                  {isFree ? (
                    <span className={rd('price')} data-onboarding-rd="rd-price">
                      {tr('Бесплатно')}
                    </span>
                  ) : (
                    <>
                      {hasDiscount && <span className={rd('oldPrice')}>{formatAmount(oldPrice)}</span>}
                      <span className={rd('price')} data-onboarding-rd="rd-price">
                        {formatAmount(current)}
                        <CurrencyIcon className={rd('currencyIcon')} />
                      </span>
                      {hasDiscount && (
                        <span className={rd('priceDiscountBadge')} aria-label={`Скидка ${percentOff}%`}>
                          <span className={rd('priceDiscountSign')} aria-hidden="true">−</span>
                          <span>{percentOff} %</span>
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {resource.shortDescription && (
              <div className={rd('descriptionTags')}>
                <span className={rd('description')}>{resource.shortDescription}</span>
              </div>
            )}

            <div className={rd('rating')} data-nosnippet="true">
              <Stars rating={resource.rating} />
              <span className={pr('ratingValue')}>{resource.rating.toFixed(1)}</span>
              <span className={pr('reviewsCount')}>
                ({resource.reviewsCount} {reviewsWord(resource.reviewsCount)})
              </span>
              <div className={rs('tileStats')}>
                <span className={rs('tileStat')} aria-label={`Уникальных просмотров: ${resource.uniqueViews}`} data-tooltip-trigger="">
                  <EyeIcon />
                  {resource.uniqueViews}
                </span>
                <PurchasesStat sales={resource.sales} />
                <span className={rs('tileStat')} aria-label={`Обновлений: ${resource.buyerUpdatesCount}`} data-tooltip-trigger="">
                  <RefreshIcon />
                  {resource.buyerUpdatesCount}
                </span>
                <span className={rs('tileStat')} aria-label={`Опубликовано ${ago}`} data-tooltip-trigger="">
                  <ClockIcon />
                  {ago}
                </span>
              </div>
            </div>

            <div className={rd('actions')} data-onboarding-rd="rd-actions" data-nosnippet="true">
              <button
                type="button"
                className={rd('buyButton')}
                onClick={buyNow}
                aria-disabled={busy || purchased || undefined}
                aria-busy={status === 'buying' || undefined}
                disabled={busy || purchased}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className={rd('actionButtonIcon')} aria-hidden="true">
                  <path d="M341.2-12.1c9.1 6 13 17.3 9.6 27.6L292 192 412.9 192c19.4 0 35.1 15.7 35.1 35.1 0 10-4.2 19.5-11.7 26.1L136 521.9c-8.1 7.3-20.1 8.2-29.2 2.2s-13-17.3-9.6-27.6L156 320 35.1 320C15.7 320 0 304.3 0 284.9 0 275 4.2 265.5 11.7 258.8L312-9.9c8.1-7.3 20.1-8.1 29.2-2.2zM68.9 272l120.4 0c7.7 0 15 3.7 19.5 10s5.7 14.3 3.3 21.6L171.3 425.9 379.1 240 258.7 240c-7.7 0-15-3.7-19.5-10s-5.7-14.3-3.3-21.6L276.7 86.1 68.9 272z" />
                </svg>
                {buyLabel}
              </button>
              <button
                type="button"
                className={inCart ? rd('cartButton', 'cartButton_remove') : rd('cartButton')}
                aria-label={cartLabel}
                onClick={addToCart}
                aria-disabled={busy || inCart || undefined}
                aria-busy={status === 'adding' || undefined}
                disabled={busy}
              >
                <svg viewBox="0 0 24 24" fill="none" className={rd('actionButtonIcon')} aria-hidden="true">
                  <circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2" />
                  <circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {cartLabel}
              </button>
            </div>

            {purchaseConditions && purchaseConditions.length > 0 && (
              <section className={rd('purchaseConditions')} aria-labelledby="purchase-conditions-heading" data-onboarding-rd="rd-purchaseConditions">
                <header className={ph('headerBar', 'headerBar_embedded')}>
                  <div className={ph('headerBar__start')}>
                    <h2 className={ph('headerBar__title', 'headerBar__titleLevel2')} id="purchase-conditions-heading">
                      {tr('Условия для покупки')}
                    </h2>
                  </div>
                  <div className={ph('headerBar__end')}>
                    <span className={ph('headerBar__divider')} aria-hidden="true" />
                    <div className={ph('headerBar__actions')}>
                      <span className={rd('recheckPurchaseConditionsTooltipAnchor')} data-tooltip-trigger="">
                        <button
                          type="button"
                          className={rd('recheckPurchaseConditionsButton', 'recheckPurchaseConditionsButton_action')}
                          aria-label={tr('Проверить условия для покупки ещё раз')}
                        >
                          <svg viewBox="0 0 24 24" fill="none" className={rd('recheckPurchaseConditionsButtonIcon')} aria-hidden="true">
                            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </span>
                    </div>
                  </div>
                </header>
                <ul className={rd('purchaseChecklist', 'purchaseChecklistStatusResolve')}>
                  {purchaseConditions.map((item, i) => (
                    <li
                      key={i}
                      className={rd('purchaseChecklistItem')}
                      data-status={item.status}
                      style={{ '--check-stagger': `${i * 80}ms` } as CSSProperties}
                    >
                      <span className={rd('purchaseCheckIconCell')} aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className={rd('purchaseCheckResolvePendingDot')} aria-hidden="true">
                          <path d="M464 256a208 208 0 1 0 -416 0 208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0z" />
                        </svg>
                        <span className={rd('purchaseCheckResolveFinalWrap')}>
                          {item.status === 'ok' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className={rd('purchaseCheckGlyph', 'purchaseCheckOk')}>
                              <path d="M256 512a256 256 0 1 1 0-512 256 256 0 1 1 0 512zm0-464a208 208 0 1 0 0 416 208 208 0 1 0 0-416zm70.7 121.9c7.8-10.7 22.8-13.1 33.5-5.3 10.7 7.8 13.1 22.8 5.3 33.5L243.4 366.1c-4.1 5.7-10.5 9.3-17.5 9.8-7 .5-13.9-2-18.8-6.9l-55.9-55.9c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l36 36 105.6-145.2z" />
                            </svg>
                          ) : item.status === 'info' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className={rd('purchaseCheckGlyph', 'purchaseCheckInfo')}>
                              <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM216 336c-13.3 0-24 10.7-24 24s10.7 24 24 24l80 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-8 0 0-88c0-13.3-10.7-24-24-24l-48 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l24 0 0 64-24 0zm40-144a32 32 0 1 0 0-64 32 32 0 1 0 0 64z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className={rd('purchaseCheckGlyph', 'purchaseCheckNeedMark')} aria-hidden="true">
                              <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM167 167c-9.4 9.4-9.4 24.6 0 33.9l55 55-55 55c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l55-55 55 55c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-55-55 55-55c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-55 55-55-55c-9.4-9.4-24.6-9.4-33.9 0z" />
                            </svg>
                          )}
                        </span>
                      </span>
                      <div className={rd('purchaseCheckText')}>
                        <div className={rd('purchaseCheckLabelRow')}>
                          <span className={rd('purchaseCheckLabelActionBlock')}>
                            <span className={rd('purchaseCheckDiscordLine')}>
                              <span className={rd('purchaseCheckLabelActionInline')}>
                                <span className={rd('purchaseCheckLabel')}>{item.label}</span>
                                {item.action &&
                                  (item.action.href ? (
                                    <a href={item.action.href} className={rd('purchaseCheckActionLink')} target="_blank" rel="noopener noreferrer">
                                      {item.action.label}
                                    </a>
                                  ) : (
                                    <button type="button" className={rd('purchaseCheckActionLink')}>
                                      {item.action.label}
                                    </button>
                                  ))}
                              </span>
                            </span>
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className={rd('authorBlock')} aria-labelledby="resource-author-heading">
              <header className={ph('headerBar', 'headerBar_embedded')}>
                <div className={ph('headerBar__start')}>
                  <h2 className={ph('headerBar__title', 'headerBar__titleLevel2')} id="resource-author-heading">
                    {tr('Автор')}
                  </h2>
                  <span className={rd('sellerRatingPill')}>
                    <StarIcon className={rd('sellerStarIcon')} />
                    <span className={rd('sellerRatingValue')}>{resource.authorRating.toFixed(1)}</span>
                    <span className={rd('sellerReviewsCount')}>({resource.authorReviewsCount})</span>
                  </span>
                </div>
                <div className={ph('headerBar__end')}>
                  <span className={ph('headerBar__divider')} aria-hidden="true" />
                  <div className={ph('headerBar__actions')} />
                </div>
              </header>
              <AuthorRow meta={author} />
            </section>

            {coOwners.length > 0 && (
              <section className={rd('authorBlock')} aria-labelledby="resource-coowners-heading">
                <header className={ph('headerBar', 'headerBar_embedded')}>
                  <div className={ph('headerBar__start')}>
                    <h2 className={ph('headerBar__title', 'headerBar__titleLevel2')} id="resource-coowners-heading">
                      {coOwners.length > 1 ? tr('Совладельцы') : tr('Совладелец')}
                    </h2>
                  </div>
                  <div className={ph('headerBar__end')}>
                    <span className={ph('headerBar__divider')} aria-hidden="true" />
                    <div className={ph('headerBar__actions')} />
                  </div>
                </header>
                <div className={rd('coOwnersList')}>
                  {coOwners.map((co) => (
                    <AuthorRow key={co.profileSlug} meta={co} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {resource.description && (
          <section className={rd('fullDescription')} aria-labelledby="full-description-heading" data-onboarding-rd="rd-fullDescription">
            <header className={ph('headerBar')}>
              <div className={ph('headerBar__start')}>
                <h2 className={ph('headerBar__title', 'headerBar__titleLevel2')} id="full-description-heading">
                  {tr('Подробное описание')}
                </h2>
              </div>
              <div className={ph('headerBar__end')}>
                <span className={ph('headerBar__divider')} aria-hidden="true" />
                <div className={ph('headerBar__actions')}>
                  <div className={phs('root')}>
                    <button type="button" className={phs('toggle')} aria-label={tr('Поиск по тексту описания')} data-tooltip-trigger="">
                      <svg viewBox="0 0 24 24" fill="none" className={phs('toggleIcon')} aria-hidden="true">
                        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                        <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </header>
            <div data-nosnippet="true">
              <div className={rd('fullDescriptionBody')}>
                <div className="markdown-body-root">{renderMarkdown(resource.description)}</div>
              </div>
            </div>
          </section>
        )}

        {otherResources.length > 0 && (
          <section className={aor('otherResources')} aria-labelledby="author-other-resources-heading" data-nosnippet="true">
            <header className={ph('headerBar', 'headerBar_embedded')}>
              <div className={ph('headerBar__start')}>
                <h2 className={ph('headerBar__title', 'headerBar__titleLevel2')} id="author-other-resources-heading">
                  {tr('Другие ресурсы')} {resource.author}
                </h2>
                <span className={ph('headerBar__count')}>{othersTotal}</span>
              </div>
              <div className={ph('headerBar__end')}>
                <span className={ph('headerBar__divider')} aria-hidden="true" />
                <div className={ph('headerBar__actions')}>
                  <div className={hero('heroCatalogKindRow') + ' ' + aor('kindRow')} role="tablist" aria-label="Тип каталога">
                    <button
                      type="button"
                      role="tab"
                      aria-selected="true"
                      className={hero('heroCatalogKindPart') + ' ' + aor('kindPart') + ' ' + hero('heroCatalogKindPartActive') + ' ' + aor('kindPartActive')}
                    >
                      <span>{tr('Платные')}</span>
                      <span className={hero('heroCatalogKindCount')}>{paidOthersCount}</span>
                    </button>
                    <span className={hero('heroCatalogKindJoin') + ' ' + aor('kindJoin')} aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" className={hero('heroCatalogKindJoinSvg', 'heroCatalogKindJoinSvgToLeft')}>
                        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <button type="button" role="tab" aria-selected="false" className={hero('heroCatalogKindPart') + ' ' + aor('kindPart')}>
                      <span>{tr('Бесплатные')}</span>
                      <span className={hero('heroCatalogKindCount')}>{freeOthersCount}</span>
                    </button>
                  </div>
                </div>
              </div>
            </header>
            <div className={aor('gridWrap')}>
              <div className={rs('grid')}>
                {otherResources.map((r) => (
                  <OtherResourceCard key={r.id} resource={r} nowMs={nowMs} />
                ))}
              </div>
              <div aria-hidden="true" />
            </div>
          </section>
        )}
      </div>

      {lightbox && mainSrc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={resource.title}
          onClick={() => setLightbox(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.85)',
            padding: '2rem',
          }}
        >
          <img
            src={mainSrc}
            alt={mainAlt}
            decoding="async"
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        </div>
      )}
    </section>
  )
}

export default ResourceDetailView
