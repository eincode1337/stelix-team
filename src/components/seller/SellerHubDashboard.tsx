'use client'


import Link from 'next/link'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ReportsExportGrid } from './SellerHubReportsExport'
import { useT } from '@/i18n/LocaleProvider'
import type { Resource } from '@/components/resources/ResourcesCatalog'

const spc = (...n: string[]) => n.map((x) => `SellerPageClient-module__GcwGcq__${x}`).join(' ')
const rd = (...n: string[]) => n.map((x) => `ResourceDetail-module__XriO0W__${x}`).join(' ')
const arc = (...n: string[]) => n.map((x) => `AddResourceContent-module__UdTvSa__${x}`).join(' ')
const phb = (...n: string[]) => n.map((x) => `PageHeaderBar-module__1SDZQW__${x}`).join(' ')
const rs = (...n: string[]) => n.map((x) => `Resources-module__Zk5JmW__${x}`).join(' ')
const drp = (...n: string[]) => n.map((x) => `DateRangePickerModal-module__WOcbAG__${x}`).join(' ')
const phs = (...n: string[]) => n.map((x) => `PageHeaderSearch-module__szXj0q__${x}`).join(' ')
const pp = (...n: string[]) => n.map((x) => `PublicProfile-module__j5FkGG__${x}`).join(' ')
const pl = (...n: string[]) => n.map((x) => `PurchasesList-module__gstXbW__${x}`).join(' ')
const plsr = (...n: string[]) => n.map((x) => `PurchasesListStackRow-module__TmWrnq__${x}`).join(' ')
const cc = (...n: string[]) => n.map((x) => `CheckoutContent-module__miPPgG__${x}`).join(' ')
const ces = (...n: string[]) => n.map((x) => `CenteredEmptyState-module__97Qt0G__${x}`).join(' ')

const ICON_CALENDAR =
  'M120 0c13.3 0 24 10.7 24 24l0 40 160 0 0-40c0-13.3 10.7-24 24-24s24 10.7 24 24l0 40 32 0c35.3 0 64 28.7 64 64l0 288c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 128C0 92.7 28.7 64 64 64l32 0 0-40c0-13.3 10.7-24 24-24zm0 112l-56 0c-8.8 0-16 7.2-16 16l0 48 352 0 0-48c0-8.8-7.2-16-16-16l-264 0zM48 224l0 192c0 8.8 7.2 16 16 16l320 0c8.8 0 16-7.2 16-16l0-192-352 0z'

const ICON_LIGHTNING = 'M13 2L3 14h8l-1 8 10-12h-8l1-8z'

const PERIODS_FULL = ['Сегодня', 'Неделя', 'Месяц', 'Полгода', 'Год', 'За всё время']

const nf = new Intl.NumberFormat('ru-RU')

const CREATE_LINKS: Array<{ label: string; href: string }> = [
  { label: 'Создать платный', href: '/resource/create' },
  { label: 'Создать бесплатный', href: '/resource/create-free' },
  { label: 'Создать комплект', href: '/resource/combo/create' },
  { label: 'Создать подписку', href: '/subscriptions/create' },
]

function toISO(d: string): string {
  const m = d.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  return m ? `${m[3]}-${m[2]}-${m[1]}` : ''
}
function toDisplay(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso
}
function parseRange(value: string): { from: string; to: string } {
  const bits = value.split(' - ')
  const from = toISO(bits[0] ?? '')
  const to = toISO(bits[1] ?? bits[0] ?? '')
  return { from, to }
}

export interface SellerSummary {
  revenue: number
  sales: number
  refunds: number
  fulfillment: number
  activeResources: number
  avgCheck: number
}

type Kind = 'PAID' | 'FREE' | 'COMBO' | 'SUBSCRIPTION'

const MINI_STATS: Array<{ key: keyof SellerSummary; label: string; money: boolean }> = [
  { key: 'revenue', label: 'Выручка', money: true },
  { key: 'sales', label: 'Продажи', money: false },
  { key: 'refunds', label: 'Возвратов', money: false },
  { key: 'fulfillment', label: 'Выполнение заказов', money: false },
  { key: 'activeResources', label: 'Активные ресурсы', money: false },
  { key: 'avgCheck', label: 'Средний чек', money: true },
]

function LightningIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cc('productLightningIcon')} aria-hidden="true">
      <path d={ICON_LIGHTNING} />
    </svg>
  )
}

function PeriodRow({
  label,
  active,
  onSelect,
}: {
  label: string
  active: number
  onSelect: (i: number) => void
}) {
  const tr = useT()
  return (
    <div className={arc('sellerMiniStatsPeriodRow')} role="tablist" aria-label={label}>
      {PERIODS_FULL.map((p, i) => (
        <button
          key={p}
          type="button"
          role="tab"
          aria-selected={i === active}
          className={
            i === active
              ? rs('allFiltersButton') +
                ' ' +
                arc('sellerMiniStatsPeriodBtn', 'sellerMiniStatsPeriodBtnActive')
              : rs('allFiltersButton') + ' ' + arc('sellerMiniStatsPeriodBtn')
          }
          data-tooltip-trigger=""
          onClick={() => onSelect(i)}
        >
          {tr(p)}
        </button>
      ))}
    </div>
  )
}

function DateRange({ id, ariaLabel, value }: { id: string; ariaLabel: string; value: string }) {
  const tr = useT()
  const [open, setOpen] = useState(false)
  const initial = useMemo(() => parseRange(value), [value])
  const [from, setFrom] = useState(initial.from)
  const [to, setTo] = useState(initial.to)
  const [display, setDisplay] = useState(value)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const apply = () => {
    if (from && to) {
      const [a, b] = from <= to ? [from, to] : [to, from]
      setDisplay(`${toDisplay(a)} - ${toDisplay(b)}`)
    }
    setOpen(false)
  }

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        id={id}
        className={drp('trigger') + ' ' + arc('sellerHubDateRangeTrigger')}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={drp('triggerValue')}>{display}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className={drp('triggerIcon')}>
          <path d={ICON_CALENDAR} />
        </svg>
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={tr('Выбор диапазона дат')}
          className={drp('rangeModal')}
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.4rem)',
            right: 0,
            zIndex: 40,
            background: 'var(--bg-canvas)',
            border: '1px solid color-mix(in srgb, var(--fg-default) 12%, transparent)',
            borderRadius: 'var(--radius)',
            boxShadow: '0 12px 34px rgba(0,0,0,0.18)',
          }}
        >
          <div className={drp('body')} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.65rem' }}>
            <label className={drp('colTitle')} style={{ display: 'grid', gap: '0.3rem' }}>
              {tr('Начальная дата:')}
              <input
                type="date"
                value={from}
                max={to || undefined}
                onChange={(e) => setFrom(e.target.value)}
                style={{ font: 'inherit', padding: '0.4rem 0.5rem', borderRadius: 'var(--radius)', border: '1px solid color-mix(in srgb, var(--fg-default) 16%, transparent)', background: 'var(--bg-subtle)', color: 'var(--fg-default)' }}
              />
            </label>
            <label className={drp('colTitle')} style={{ display: 'grid', gap: '0.3rem' }}>
              {tr('Конечная дата:')}
              <input
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => setTo(e.target.value)}
                style={{ font: 'inherit', padding: '0.4rem 0.5rem', borderRadius: 'var(--radius)', border: '1px solid color-mix(in srgb, var(--fg-default) 16%, transparent)', background: 'var(--bg-subtle)', color: 'var(--fg-default)' }}
              />
            </label>
          </div>
          <div className={drp('footer')}>
            <button
              type="button"
              className={drp('footerGridBtn') + ' ' + drp('cancelBtn')}
              onClick={() => setOpen(false)}
            >
              {tr('Отмена')}
            </button>
            <button
              type="button"
              className={drp('footerGridBtn') + ' ' + drp('donePrimary')}
              onClick={apply}
              disabled={!from || !to}
            >
              {tr('Готово')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function CreateLink({ label, href }: { label: string; href: string }) {
  return (
    <Link className={arc('sellerHubCreateResourceLink')} aria-label={label} href={href}>
      <span className={arc('sellerHubCreateResourceLinkIconBadge')} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" className={arc('sellerHubCreateResourceLinkIcon')}>
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className={arc('sellerHubCreateResourceLinkText')}>{label}</span>
    </Link>
  )
}

function ResourcesEmpty({ caption }: { caption: string }) {
  const tr = useT()
  return (
    <div className={ces('root') + ' ' + arc('sellerHubSearchEmpty')}>
      <svg viewBox="0 0 24 24" fill="none" className={ces('icon')} aria-hidden="true">
        <path
          d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className={phb('headerBar__emptyCaption') + ' ' + ces('caption')}>{tr(caption)}</p>
    </div>
  )
}

function ResourceRow({ resource }: { resource: Resource }) {
  const tr = useT()
  return (
    <div className={plsr('stackRow') + ' ' + arc('sellerHubStackRow')}>
      <Link
        aria-label={`${tr('Открыть ресурс')} «${resource.title}»`}
        href={`/resources/${resource.slug}`}
        style={{ position: 'absolute', inset: 0, zIndex: 1 }}
      >
        <span aria-hidden="true" />
      </Link>
      <div className={plsr('stackMain') + ' ' + pl('purchasesListStackMain')}>
        <div className={plsr('stackCenter')}>
          <div className={plsr('stackLead')}>
            <span className={plsr('stackLeadText')}>
              <span className={plsr('stackTitle')}>{resource.title}</span>
              <span className={plsr('stackMeta') + ' ' + arc('sellerLineMeta')}>
                <span className={arc('sellerLineStatsGroup')}>{tr('Продаж:')} {nf.format(resource.sales)}</span>
                <span className={arc('sellerLineStatsGroup')}>{tr('Просмотров:')} {nf.format(resource.uniqueViews)}</span>
              </span>
            </span>
          </div>
        </div>
        <span className={arc('sellerLineBadges')} style={{ position: 'relative', zIndex: 2 }}>
          <span className={arc('sellerLineStatusBadge', 'sellerLineStatusBadgeActive')}>{tr('Одобрен')}</span>
          <Link
            className={arc('sellerLineSoftBadge')}
            href={`/seller/resources/${resource.slug}/edit`}
            aria-label={`${tr('Редактировать')} «${resource.title}»`}
            style={{ position: 'relative', zIndex: 2, textDecoration: 'none' }}
          >
            {tr('Редактировать')}
          </Link>
        </span>
      </div>
    </div>
  )
}

export function SellerHubDashboard({
  summary,
  resources,
}: {
  summary: SellerSummary
  resources: Resource[]
}) {
  const tr = useT()
  const [summaryPeriod, setSummaryPeriod] = useState(0)
  const [reportsPeriod, setReportsPeriod] = useState(2)
  const [kind, setKind] = useState<Kind>('PAID')
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  const paid = useMemo(() => resources.filter((r) => r.listingKind === 'PAID'), [resources])
  const free = useMemo(() => resources.filter((r) => r.listingKind === 'FREE'), [resources])

  const kinds: Array<{ key: Kind; label: string; count: number | null }> = [
    { key: 'PAID', label: 'Платные', count: paid.length },
    { key: 'FREE', label: 'Бесплатные', count: free.length },
    { key: 'COMBO', label: 'Комплекты', count: null },
    { key: 'SUBSCRIPTION', label: 'Подписки', count: null },
  ]

  const kindList = kind === 'PAID' ? paid : kind === 'FREE' ? free : []
  const q = query.trim().toLowerCase()
  const visible = useMemo(() => {
    if (!q) return kindList
    return kindList.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.shortDescription ?? '').toLowerCase().includes(q) ||
        (Array.isArray(r.tags) ? r.tags : []).some((t) => t.toLowerCase().includes(q)),
    )
  }, [kindList, q])

  const activeCount = kindList.length

  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [indicator, setIndicator] = useState<{ width: number; x: number } | null>(null)
  useLayoutEffect(() => {
    const measure = () => {
      const idx = kinds.findIndex((k) => k.key === kind)
      const btn = tabRefs.current[idx]
      if (btn) setIndicator({ width: btn.offsetWidth, x: btn.offsetLeft })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [kind, searchOpen])

  return (
    <section className={spc('sellerPageStripe')}>
      <div className={spc('sellerPageInner')}>
        <div className={'container ' + arc('sellerHubPage')}>
          <section className={rd('container') + ' ' + arc('sellerHubRoot')}>
            <div className={arc('sellerHub')}>
              <header className={phb('headerBar') + ' ' + arc('sellerHubTopBar')}>
                <div className={phb('headerBar__start') + ' ' + arc('sellerHubPageHeaderBarLeft')}>
                  <h1 className={phb('headerBar__title')}>{tr('Панель продавца')}</h1>
                </div>
                <div className={phb('headerBar__end') + ' ' + arc('sellerHubTopBarEnd')}>
                  <span className={phb('headerBar__divider')} aria-hidden="true" />
                  <div
                    className={
                      phb('headerBar__actions') + ' ' + arc('sellerHubTopBarActions', 'sellerHubPeriodActions')
                    }
                  >
                    <div className={arc('sellerHubPeriodWithDateRange')}>
                      <div className={arc('sellerHubPeriodScroll')}>
                        <PeriodRow label={tr('Период сводки')} active={summaryPeriod} onSelect={setSummaryPeriod} />
                      </div>
                      <DateRange
                        id="seller-hub-stats-range"
                        ariaLabel={`${tr('Начальная дата:')} 11.09.2026. ${tr('Конечная дата:')} 11.09.2026`}
                        value="11.09.2026 - 11.09.2026"
                      />
                    </div>
                  </div>
                </div>
              </header>

              <div className={arc('sellerMiniStatsSection')} aria-busy="false">
                <div className={arc('sellerMiniStats')}>
                  {MINI_STATS.map((s) => (
                    <div key={s.key} className={arc('sellerMiniStat')}>
                      <p className={arc('sellerMiniStatLabel')}>{tr(s.label)}</p>
                      <p className={cc('productPriceValue') + ' ' + arc('sellerMiniStatValue')}>
                        {nf.format(summary[s.key])}
                        {s.money && <LightningIcon />}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className={arc('sellerHubCreateResourceRow')}>
                {CREATE_LINKS.map((c) => (
                  <CreateLink key={c.href} label={tr(c.label)} href={c.href} />
                ))}
              </div>

              <header className={phb('headerBar') + ' ' + arc('sellerHubDocSectionBar')}>
                <div className={phb('headerBar__start') + ' ' + arc('sellerHubDocSectionBarLeft')}>
                  <h2 className={phb('headerBar__title', 'headerBar__titleLevel2')}>{tr('Мои ресурсы')}</h2>
                  <span className={phb('headerBar__count')} aria-label={`${tr('Ресурсов:')} ${activeCount}`}>
                    {activeCount}
                  </span>
                </div>
                <div className={phb('headerBar__end') + ' ' + arc('sellerHubDocSectionBarEnd')}>
                  <span className={phb('headerBar__divider')} aria-hidden="true" />
                  <div className={phb('headerBar__actions') + ' ' + arc('sellerHubDocSectionBarActions')}>
                    <div className={searchOpen ? phs('root') + ' ' + phs('rootExpanded') : phs('root')}>
                      <div className={phs('cover')}>
                        <div className={arc('sellerHubKindNav')}>
                          <div className={pp('profileCardNavWrap')}>
                            <nav className={pp('profileCardNav')} role="tablist" aria-label={tr('Тип ресурсов')}>
                              {kinds.map((k, i) => (
                                <button
                                  key={k.key}
                                  ref={(el) => {
                                    tabRefs.current[i] = el
                                  }}
                                  type="button"
                                  role="tab"
                                  aria-selected={kind === k.key}
                                  className={
                                    kind === k.key
                                      ? pp('profileCardNavItem', 'profileCardNavItemActive')
                                      : pp('profileCardNavItem')
                                  }
                                  onClick={() => setKind(k.key)}
                                >
                                  {tr(k.label)}
                                  {k.count !== null && (
                                    <span className={pp('profileCardNavCount')} aria-hidden="true">
                                      {k.count}
                                    </span>
                                  )}
                                </button>
                              ))}
                              <span
                                className={pp('profileCardNavIndicator')}
                                aria-hidden="true"
                                style={
                                  indicator
                                    ? { width: `${indicator.width}px`, transform: `translateX(${indicator.x}px)` }
                                    : undefined
                                }
                              />
                            </nav>
                          </div>
                        </div>
                      </div>
                      {searchOpen && (
                        <div className={phs('field')}>
                          <input
                            type="search"
                            className={phs('fieldInput')}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={tr('Поиск по ресурсам')}
                            aria-label={tr('Поиск по ресурсам')}
                            autoFocus
                          />
                        </div>
                      )}
                      <button
                        type="button"
                        className={phs('toggle')}
                        aria-label={tr('Поиск по ресурсам')}
                        aria-expanded={searchOpen}
                        data-tooltip-trigger=""
                        onClick={() =>
                          setSearchOpen((o) => {
                            const next = !o
                            if (!next) setQuery('')
                            return next
                          })
                        }
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className={searchOpen ? phs('toggleIcon') + ' ' + phs('toggleIconClose') : phs('toggleIcon')}
                          aria-hidden="true"
                        >
                          {searchOpen ? (
                            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          ) : (
                            <>
                              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </>
                          )}
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </header>

              <div className={arc('sellerHubCartSection', 'sellerHubResourcesListHost')}>
                <div
                  className={
                    pl('stackList') + ' ' + arc('sellerResourceList') + ' ' + pl('stackListSkeletonHost')
                  }
                >
                  {visible.length === 0 ? (
                    <ResourcesEmpty
                      caption={q && kindList.length > 0 ? 'Ничего не найдено' : 'Пока нет ресурсов'}
                    />
                  ) : (
                    visible.map((r) => <ResourceRow key={r.id} resource={r} />)
                  )}
                </div>
              </div>

              <div className={arc('sellerHubReportsBlock')}>
                <header className={phb('headerBar') + ' ' + arc('sellerHubDocSectionBar')}>
                  <div className={phb('headerBar__start') + ' ' + arc('sellerHubDocSectionBarLeft')}>
                    <h2 className={phb('headerBar__title', 'headerBar__titleLevel2')}>{tr('Отчёты и аналитика')}</h2>
                  </div>
                  <div className={phb('headerBar__end') + ' ' + arc('sellerHubDocSectionBarEnd')}>
                    <span className={phb('headerBar__divider')} aria-hidden="true" />
                    <div
                      className={
                        phb('headerBar__actions') +
                        ' ' +
                        arc('sellerHubDocSectionBarActions', 'sellerHubPeriodActions')
                      }
                    >
                      <div className={arc('sellerHubPeriodWithDateRange')}>
                        <div className={arc('sellerHubPeriodScroll')}>
                          <PeriodRow label={tr('Период отчётов')} active={reportsPeriod} onSelect={setReportsPeriod} />
                        </div>
                        <DateRange
                          id="seller-hub-reports-range"
                          ariaLabel={`${tr('Начальная дата:')} 01.09.2026. ${tr('Конечная дата:')} 30.09.2026`}
                          value="01.09.2026 - 30.09.2026"
                        />
                      </div>
                    </div>
                  </div>
                </header>
                <ReportsExportGrid />
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}
