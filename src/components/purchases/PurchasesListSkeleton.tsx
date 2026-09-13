

import { useT } from '@/i18n/LocaleProvider'


const pl = (...n: string[]) => n.map((x) => `PurchasesList-module__gstXbW__${x}`).join(' ')
const plsr = (...n: string[]) => n.map((x) => `PurchasesListStackRow-module__TmWrnq__${x}`).join(' ')
const ph = (...n: string[]) => n.map((x) => `PageHeaderBar-module__1SDZQW__${x}`).join(' ')
const phs = (...n: string[]) => n.map((x) => `PageHeaderSearch-module__szXj0q__${x}`).join(' ')
const ap = (...n: string[]) => n.map((x) => `AdminPanel-module__8pW_9a__${x}`).join(' ')
const pc = (...n: string[]) => n.map((x) => `PurchaseContent-module__l1XItG__${x}`).join(' ')

function StackRowSkeleton() {
  return (
    <div
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
  )
}


export function PurchasesHeaderSkeleton() {
  const tr = useT()
  return (
    <header className={ph('headerBar')}>
      <div className={ph('headerBar__start')}>
        <h1 className={ph('headerBar__title')}>{tr('Мои покупки')}</h1>
        <span
          className={'appSkeletonBlock ' + ph('headerBar__countLoading')}
          style={{ height: '2.5rem', minWidth: '2.5rem', minHeight: '2.5rem' }}
          aria-busy="true"
        />
      </div>
      <div className={ph('headerBar__end')}>
        <span className={ph('headerBar__divider')} aria-hidden="true" />
        <div className={ph('headerBar__actions')}>
          <div className={phs('root')}>
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
  )
}

export function PurchasesListSkeleton() {
  const tr = useT()
  return (
    <section className={pl('section', 'sectionFlex')}>
      <div className={'container ' + pl('container')}>
        <PurchasesHeaderSkeleton />
        <div className={pl('belowHeader')}>
          <div
            className={pl('stackList', 'stackListPurchases', 'stackListSkeletonHost')}
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            {Array.from({ length: 5 }, (_, i) => (
              <StackRowSkeleton key={i} />
            ))}
            <div className={pl('stackListPaginationShell')} data-purchases-stack-pagination="true">
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
            <span className={pc('visuallyHidden')}>{tr('Загрузка списка покупок')}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
