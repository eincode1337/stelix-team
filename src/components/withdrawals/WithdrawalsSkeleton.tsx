'use client'


import { useT } from '@/i18n/LocaleProvider'

const wc = (...n: string[]) => n.map((x) => `WithdrawalsContent-module__BRVEYq__${x}`).join(' ')
const phb = (...n: string[]) => n.map((x) => `PageHeaderBar-module__1SDZQW__${x}`).join(' ')
const arc = (...n: string[]) => n.map((x) => `AddResourceContent-module__UdTvSa__${x}`).join(' ')
const prof = (...n: string[]) => n.map((x) => `Profile-module__MITPoG__${x}`).join(' ')
const ppn = (...n: string[]) => n.map((x) => `PublicProfile-module__j5FkGG__${x}`).join(' ')
const pl = (...n: string[]) => n.map((x) => `PurchasesList-module__gstXbW__${x}`).join(' ')
const plsr = (...n: string[]) => n.map((x) => `PurchasesListStackRow-module__TmWrnq__${x}`).join(' ')
const ap = (...n: string[]) => n.map((x) => `AdminPanel-module__8pW_9a__${x}`).join(' ')


const TAB_LABELS = ['Все заявки', 'Ожидание', 'В обработке', 'Выплачено', 'Отклонено', 'Заморожено']

export function WithdrawalsSkeleton() {
  const tr = useT()
  return (
    <section className={wc('withdrawals')}>
      <div className={'container ' + wc('container')}>
        <header className={phb('headerBar')}>
          <div className={phb('headerBar__start')}>
            <h1 className={phb('headerBar__title')}>{tr('Выплаты средств')}</h1>
            <span
              className={'appSkeletonBlock ' + phb('headerBar__countLoading')}
              style={{ height: '2.5rem', minWidth: '2.5rem', minHeight: '2.5rem' }}
              aria-busy="true"
            />
          </div>
          <div className={phb('headerBar__end')}>
            <span className={phb('headerBar__divider')} aria-hidden="true" />
            <div className={phb('headerBar__actions')}>
              <button type="button" className={wc('createButton', 'createButtonInHeader')}>
                <svg viewBox="0 0 24 24" fill="currentColor" className={wc('createIcon')} aria-hidden="true">
                  <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
                </svg>
                {tr('Создать заявку')}
              </button>
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

        <div className={prof('tabs')} aria-hidden="true">
          <div className={ppn('profileCardNavWrap', 'profileCardNavWrapFull')}>
            <div className={ppn('profileCardNav', 'profileCardNavFull')}>
              <span className={prof('tabSkeletonSizer')}>
                {TAB_LABELS.map((label) => (
                  <span key={label} className={ppn('profileCardNavItem')}>
                    {tr(label)}
                    <span className={ppn('profileCardNavCount')}>0</span>
                  </span>
                ))}
              </span>
              <span className={'appSkeletonBlock ' + prof('tabSkeletonFill')} aria-hidden="true" />
            </div>
          </div>
        </div>

        <div
          className={pl('stackList', 'stackListPurchases') + ' ' + wc('list') + ' ' + pl('stackListSkeletonHost')}
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              role="presentation"
              className={
                plsr('stackRow', 'stackRowSkeleton', 'stackRowSkeletonPlain', 'stackRowSkeletonFlush') +
                ' ' +
                pl('purchasesListStackRowSkeleton')
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
          <div className={pl('stackListPaginationShell')} data-withdrawals-stack-pagination="true">
            <nav className={ap('usersPagination')} aria-hidden="true">
              <span
                className={'appSkeletonBlock ' + ap('usersPaginationSummary')}
                style={{ width: '11.5rem', height: '1.125rem' }}
              />
              <div className={ap('usersPaginationControls')}>
                <span className="appSkeletonBlock" style={{ width: '2.375rem', height: '2.375rem' }} />
                <div className={ap('usersPaginationPages')} role="presentation">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className="appSkeletonBlock" style={{ width: '2.375rem', height: '2.375rem' }} />
                  ))}
                </div>
                <span className="appSkeletonBlock" style={{ width: '2.375rem', height: '2.375rem' }} />
              </div>
            </nav>
          </div>
          <span className={wc('visuallyHidden')}>{tr('Загрузка списка заявок на выплату и сводки баланса')}</span>
        </div>
      </div>
    </section>
  )
}
