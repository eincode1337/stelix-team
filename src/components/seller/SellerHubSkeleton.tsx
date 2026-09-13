'use client'


import { ReportsExportGrid } from './SellerHubReportsExport'
import { useT } from '@/i18n/LocaleProvider'

const spc = (...n: string[]) => n.map((x) => `SellerPageClient-module__GcwGcq__${x}`).join(' ')
const rd = (...n: string[]) => n.map((x) => `ResourceDetail-module__XriO0W__${x}`).join(' ')
const arc = (...n: string[]) => n.map((x) => `AddResourceContent-module__UdTvSa__${x}`).join(' ')
const phb = (...n: string[]) => n.map((x) => `PageHeaderBar-module__1SDZQW__${x}`).join(' ')
const rs = (...n: string[]) => n.map((x) => `Resources-module__Zk5JmW__${x}`).join(' ')
const drp = (...n: string[]) => n.map((x) => `DateRangePickerModal-module__WOcbAG__${x}`).join(' ')
const phs = (...n: string[]) => n.map((x) => `PageHeaderSearch-module__szXj0q__${x}`).join(' ')
const pp = (...n: string[]) => n.map((x) => `PublicProfile-module__j5FkGG__${x}`).join(' ')
const pf = (...n: string[]) => n.map((x) => `Profile-module__MITPoG__${x}`).join(' ')
const pl = (...n: string[]) => n.map((x) => `PurchasesList-module__gstXbW__${x}`).join(' ')
const plsr = (...n: string[]) => n.map((x) => `PurchasesListStackRow-module__TmWrnq__${x}`).join(' ')
const ap = (...n: string[]) => n.map((x) => `AdminPanel-module__8pW_9a__${x}`).join(' ')

const ICON_CALENDAR =
  'M120 0c13.3 0 24 10.7 24 24l0 40 160 0 0-40c0-13.3 10.7-24 24-24s24 10.7 24 24l0 40 32 0c35.3 0 64 28.7 64 64l0 288c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 128C0 92.7 28.7 64 64 64l32 0 0-40c0-13.3 10.7-24 24-24zm0 112l-56 0c-8.8 0-16 7.2-16 16l0 48 352 0 0-48c0-8.8-7.2-16-16-16l-264 0zM48 224l0 192c0 8.8 7.2 16 16 16l320 0c8.8 0 16-7.2 16-16l0-192-352 0z'

const PERIODS = ['Сегодня', 'Неделя', 'Месяц', 'Полгода', 'Год', 'За всё время']

function InactivePeriodRow({ label, activeIndex }: { label: string; activeIndex: number }) {
  const tr = useT()
  return (
    <div
      className={arc('sellerMiniStatsPeriodRow', 'sellerMiniStatsPeriodRowInactive')}
      role="tablist"
      aria-label={label}
      aria-busy="true"
    >
      {PERIODS.map((p, i) => (
        <button
          key={p}
          type="button"
          role="tab"
          disabled
          aria-selected={i === activeIndex}
          className={
            i === activeIndex
              ? rs('allFiltersButton') +
                ' ' +
                arc('sellerMiniStatsPeriodBtn', 'sellerMiniStatsPeriodBtnActive')
              : rs('allFiltersButton') + ' ' + arc('sellerMiniStatsPeriodBtn')
          }
          data-tooltip-trigger=""
        >
          {tr(p)}
        </button>
      ))}
    </div>
  )
}

function InactiveDateRange({ id, ariaLabel, value }: { id: string; ariaLabel: string; value: string }) {
  return (
    <span className={arc('sellerHubInactiveDateRangeWrap')}>
      <button
        type="button"
        id={id}
        className={drp('trigger') + ' ' + arc('sellerHubDateRangeTrigger', 'sellerHubDateRangeTriggerInactive')}
        disabled
        aria-haspopup="dialog"
        aria-expanded="false"
        aria-label={ariaLabel}
      >
        <span className={drp('triggerValue')}>{value}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className={drp('triggerIcon')}>
          <path d={ICON_CALENDAR} />
        </svg>
      </button>
    </span>
  )
}

function CreateLink({ label, href }: { label: string; href: string }) {
  return (
    <a
      className={arc('sellerHubCreateResourceLink', 'sellerHubCreateResourceLinkPending')}
      aria-label={label}
      aria-disabled="true"
      aria-busy="true"
      tabIndex={-1}
      href={href}
    >
      <span className={arc('sellerHubCreateResourceLinkIconBadge')} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" className={arc('sellerHubCreateResourceLinkIcon')}>
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className={arc('sellerHubCreateResourceLinkText')}>{label}</span>
    </a>
  )
}

export function SellerHubSkeleton() {
  const tr = useT()
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
                      <span className={arc('sellerHubInactivePeriodWrap')}>
                        <div className={arc('sellerHubPeriodScroll')}>
                          <InactivePeriodRow label={tr('Период сводки')} activeIndex={0} />
                        </div>
                      </span>
                      <InactiveDateRange
                        id="seller-hub-stats-range"
                        ariaLabel={`${tr('Начальная дата:')} 11.09.2026. ${tr('Конечная дата:')} 11.09.2026`}
                        value="11.09.2026 - 11.09.2026"
                      />
                    </div>
                  </div>
                </div>
              </header>

              <div className={arc('sellerMiniStatsSection')} aria-busy="true">
                <div className={arc('sellerMiniStats')}>
                  {Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className={arc('sellerMiniStatSkeletonSlot')} aria-hidden="true">
                      <span className={'appSkeletonBlock ' + arc('sellerMiniStatFullSkeleton')} />
                    </div>
                  ))}
                </div>
              </div>

              <div className={arc('sellerHubCreateResourceRow')}>
                <CreateLink label={tr('Создать платный')} href="/resource/create" />
                <CreateLink label={tr('Создать бесплатный')} href="/resource/create-free" />
                <CreateLink label={tr('Создать комплект')} href="/resource/combo/create" />
                <CreateLink label={tr('Создать подписку')} href="/subscriptions/create" />
              </div>

              <header className={phb('headerBar') + ' ' + arc('sellerHubDocSectionBar')}>
                <div className={phb('headerBar__start') + ' ' + arc('sellerHubDocSectionBarLeft')}>
                  <h2 className={phb('headerBar__title', 'headerBar__titleLevel2')}>{tr('Мои ресурсы')}</h2>
                  <span
                    className={'appSkeletonBlock ' + phb('headerBar__countLoading')}
                    style={{ height: '2.5rem', minWidth: '2.5rem', minHeight: '2.5rem' }}
                    aria-busy="true"
                  />
                </div>
                <div className={phb('headerBar__end') + ' ' + arc('sellerHubDocSectionBarEnd')}>
                  <span className={phb('headerBar__divider')} aria-hidden="true" />
                  <div
                    className={phb('headerBar__actions') + ' ' + arc('sellerHubDocSectionBarActions')}
                  >
                    <div className={phs('root')}>
                      <div className={phs('cover')}>
                        <div className={arc('sellerHubKindNav')} data-nosnippet="true">
                          <div className={pp('profileCardNavWrap')}>
                            <div className={pp('profileCardNav')} role="status" aria-busy="true" aria-label={tr('Тип ресурсов')}>
                              <span className={pf('tabSkeletonSizer')} aria-hidden="true">
                                <span className={pp('profileCardNavItem')}>
                                  {tr('Платные')}<span className={pp('profileCardNavCount')}>0</span>
                                </span>
                                <span className={pp('profileCardNavItem')}>
                                  {tr('Бесплатные')}<span className={pp('profileCardNavCount')}>0</span>
                                </span>
                                <span className={pp('profileCardNavItem')}>
                                  {tr('Комплекты')}<span className={pp('profileCardNavCount')}>0</span>
                                </span>
                              </span>
                              <span className={'appSkeletonBlock ' + pf('tabSkeletonFill')} aria-hidden="true" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={phs('toggle')}
                        aria-label={tr('Поиск по ресурсам')}
                        disabled
                        data-tooltip-trigger=""
                      >
                        <svg viewBox="0 0 24 24" fill="none" className={phs('toggleIcon')} aria-hidden="true">
                          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                          <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
                  {Array.from({ length: 5 }, (_, i) => (
                    <div
                      key={i}
                      role="presentation"
                      className={
                        plsr('stackRow', 'stackRowSkeleton', 'stackRowSkeletonPlain', 'stackRowSkeletonFlush') +
                        ' ' +
                        pl('purchasesListStackRowSkeleton') +
                        ' ' +
                        arc('sellerHubStackRow')
                      }
                      aria-hidden="true"
                    >
                      <div className={plsr('stackMain') + ' ' + pl('purchasesListStackMain')}>
                        <div className={pl('purchasesListStackRowSkeletonBodyWrap')}>
                          <span
                            className={'appSkeletonBlock ' + pl('purchasesListStackRowSkeletonBody')}
                            style={{ width: '100%', height: '100%', minHeight: '4.25rem' }}
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className={pl('stackListPaginationShell')} data-seller-hub-stack-pagination="true">
                    <nav className={ap('usersPagination')} aria-hidden="true">
                      <span
                        className={'appSkeletonBlock ' + ap('usersPaginationSummary')}
                        style={{ width: '11.5rem', height: '1.125rem' }}
                      />
                      <div className={ap('usersPaginationControls')}>
                        <span className="appSkeletonBlock" style={{ width: '2.375rem', height: '2.375rem' }} />
                        <div className={ap('usersPaginationPages')} role="presentation">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span
                              key={i}
                              className="appSkeletonBlock"
                              style={{ width: '2.375rem', height: '2.375rem' }}
                            />
                          ))}
                        </div>
                        <span className="appSkeletonBlock" style={{ width: '2.375rem', height: '2.375rem' }} />
                      </div>
                    </nav>
                  </div>
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
                        <span className={arc('sellerHubInactivePeriodWrap')}>
                          <div className={arc('sellerHubPeriodScroll')}>
                            <InactivePeriodRow label={tr('Период отчётов')} activeIndex={2} />
                          </div>
                        </span>
                        <InactiveDateRange
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
