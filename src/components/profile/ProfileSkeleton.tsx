

const pf = (...n: string[]) => n.map((x) => `Profile-module__MITPoG__${x}`).join(' ')
const phb = (...n: string[]) => n.map((x) => `PageHeaderBar-module__1SDZQW__${x}`).join(' ')
const pp = (...n: string[]) => n.map((x) => `PublicProfile-module__j5FkGG__${x}`).join(' ')
const ap = (...n: string[]) => n.map((x) => `AdminPanel-module__8pW_9a__${x}`).join(' ')
const asa = (...n: string[]) => n.map((x) => `AdminSiteActivitySection-module___wng-W__${x}`).join(' ')
const pc = (...n: string[]) => n.map((x) => `PurchaseContent-module__l1XItG__${x}`).join(' ')


function SiteBindingChip({ label }: { label: string }) {
  return (
    <span className={pf('bindingChip', 'bindingChipLink', 'bindingChipSiteLink')}>
      <svg viewBox="0 0 24 24" fill="none" className={pf('bindingIcon', 'bindingIconSiteVerified')} aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path
          d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
      <span className={pf('bindingLabel')}>{label}</span>
      <small className={pf('bindingLabelVerified')}>подтверждён</small>
    </span>
  )
}


function OAuthBindingChip({ label }: { label: string }) {
  return (
    <span className={pf('bindingChip')}>
      <span className={pf('bindingBrandImg')} aria-hidden="true" />
      <span className={pf('bindingLabel')}>{label}</span>
    </span>
  )
}


function PurchasesRowSkeleton() {
  return (
    <div className={ap('tableRow') + ' ' + pf('profilePurchasesGrid', 'profilePurchasesTableGrid')}>
      <div className={ap('tableCell', 'tableCellAlignStart', 'tableCellUserIdentity') + ' ' + pf('profilePurchasesResourceCell')}>
        <span className="appSkeletonBlock appSkeletonBlock--radiusSm" style={{ width: 'min(88%,16rem)', height: '2.25rem' }} />
      </div>
      <div className={ap('tableCell', 'tableCellAlignStart', 'tableCellAllowWrap') + ' ' + asa('pathCell')}>
        <span className="appSkeletonBlock appSkeletonBlock--radiusSm" style={{ width: '62%', height: '2.25rem' }} />
      </div>
      <div className={ap('tableCell', 'tableCellAlignStart')}>
        <span className="appSkeletonBlock appSkeletonBlock--radiusSm" style={{ width: '5rem', height: '2.25rem' }} />
      </div>
      <div className={ap('tableCell', 'tableCellAlignStart', 'tableCellMuted')}>
        <span className="appSkeletonBlock appSkeletonBlock--radiusSm" style={{ width: '9rem', height: '2.25rem' }} />
      </div>
      <div className={ap('tableCell', 'tableCellAlignStart', 'tableCellMuted')}>
        <span className="appSkeletonBlock appSkeletonBlock--radiusSm" style={{ width: '9rem', height: '2.25rem' }} />
      </div>
      <div className={ap('tableCell', 'tableCellAlignCenter')}>
        <span className="appSkeletonBlock appSkeletonBlock--radiusPill" style={{ width: '7rem', height: '2.25rem' }} />
      </div>
      <div className={ap('tableCell', 'tableCellActions', 'tableCellActionCol')}>
        <span className="appSkeletonBlock" style={{ width: '2.25rem', height: '2.25rem' }} />
      </div>
    </div>
  )
}


function SortHeaderCell({ label, center }: { label: string; center?: boolean }) {
  return (
    <div className={ap('tableCell', center ? 'tableCellAlignCenter' : 'tableCellAlignStart')}>
      <span className={center ? ap('tableSortHeader', 'tableSortHeaderCenter') : ap('tableSortHeader')}>
        <span className={ap('tableSortHeaderInner')}>
          <span className={ap('tableSortHeaderLabel')}>{label}</span>
        </span>
      </span>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <section className={pf('profile')}>
      <div className={'container ' + pf('container')}>

        <header className={phb('headerBar')}>
          <div className={phb('headerBar__start')}>
            <h1 className={phb('headerBar__title')}>Мой профиль</h1>
            <span
              className={'appSkeletonBlock ' + phb('headerBar__countLoading')}
              style={{ height: '2.5rem', minWidth: '2.5rem', minHeight: '2.5rem' }}
              aria-busy="true"
            />
          </div>
          <div className={phb('headerBar__end')}>
            <span className={phb('headerBar__divider')} aria-hidden="true" />
            <div className={phb('headerBar__actions')}>
              <span
                className="appSkeletonBlock"
                style={{ width: '2.5rem', height: '2.5rem', minWidth: '2.5rem', minHeight: '2.5rem' }}
                aria-hidden="true"
              />
              <span
                className="appSkeletonBlock"
                style={{ width: '2.5rem', height: '2.5rem', minWidth: '2.5rem', minHeight: '2.5rem' }}
                aria-hidden="true"
              />
            </div>
          </div>
        </header>


        <div className={pf('header', 'headerSkeletonShell')} aria-hidden="true">
          <div className={pf('headerSkeletonSizer')}>
            <div className={pf('userInfo')}>
              <div className={pf('avatarBlock')}>
                <div className={pf('avatarLarge')} />
              </div>
              <div className={pf('userDetails')}>
                <div className={pf('userNameEmailRow')}>
                  <h2 className={pf('userName')}>профиль</h2>
                  <span className={pf('userEmail')}>user@example.com</span>
                </div>
                <div className={pf('userBindings')}>
                  <SiteBindingChip label="stelix.team" />
                  <SiteBindingChip label="example.com" />
                  <OAuthBindingChip label="Discord User" />
                  <OAuthBindingChip label="Steam User" />
                  <OAuthBindingChip label="Google User" />
                  <OAuthBindingChip label="GitHub User" />
                  <OAuthBindingChip label="Telegram User" />
                </div>
                <div className={pf('headerAccess')}>
                  <div className={pf('headerAccessRoleSection')}>
                    <span className={pf('headerAccessLabel')}>Тип аккаунта{':'}</span>
                    <span className={pf('headerAccessRole')} style={{ color: '#34bbe6' }}>
                      Новичок
                    </span>
                  </div>
                  <div className={pf('headerAccessBlocksSection')}>
                    <span className={pf('headerAccessLabel')}>Блокировок{':'}</span>
                    <span className={pf('headerAccessBlocksState', 'headerAccessBlocksStateOk')}>Нет активных</span>
                  </div>
                  <div className={pf('headerAccessRatingSection')}>
                    <span className={pf('headerAccessLabel')}>Рейтинг</span>
                    <div className={pf('headerAccessRatingInline')}>
                      <span className={pf('headerAccessSellerRating')}>
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className={pf('headerAccessSellerStar', 'headerAccessSellerStarNoRating')}
                          aria-hidden="true"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span className={pf('headerAccessSellerValue')}>0.0</span>
                        <span className={pf('headerAccessSellerReviews')}>
                          {'('}
                          {'0 отзывов'}
                          {')'}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <span className={'appSkeletonBlock appSkeletonBlock--radiusSm ' + pf('headerSkeletonFill')} aria-hidden="true" />
        </div>


        <div className={pf('tabs')} aria-hidden="true">
          <div className={pp('profileCardNavWrap', 'profileCardNavWrapFull')}>
            <div className={pp('profileCardNav', 'profileCardNavFull')}>
              <span className={pf('tabSkeletonSizer')}>
                <span className={pp('profileCardNavItem')}>
                  Покупки<span className={pp('profileCardNavCount')}>0</span>
                </span>
                <span className={pp('profileCardNavItem')}>
                  Заказы<span className={pp('profileCardNavCount')}>0</span>
                </span>
                <span className={pp('profileCardNavItem')}>
                  Транзакции<span className={pp('profileCardNavCount')}>0</span>
                </span>
                <span className={pp('profileCardNavItem')}>
                  Платежи<span className={pp('profileCardNavCount')}>0</span>
                </span>
                <span className={pp('profileCardNavItem')}>
                  Авторизация<span className={pp('profileCardNavCount')}>0</span>
                </span>
              </span>
              <span className={'appSkeletonBlock ' + pf('tabSkeletonFill')} aria-hidden="true" />
            </div>
          </div>
        </div>


        <div>
          <div className={pf('profileSessionsTableBlock')} role="status" aria-live="polite" aria-busy="true">
            <div className={ap('tableWrap') + ' ' + pf('profileSessionsTableWrapFlat')}>
              <div className={ap('tableHeader') + ' ' + pf('profilePurchasesGrid', 'profilePurchasesTableGrid')}>
                <SortHeaderCell label="Название ресурса" />
                <SortHeaderCell label="категория" />
                <SortHeaderCell label="сумма" />
                <SortHeaderCell label="дата покупки" />
                <SortHeaderCell label="дата получения" />
                <SortHeaderCell label="статус" center />
                <div className={ap('tableCell', 'tableCellActionCol')} aria-hidden="true" />
              </div>
              {Array.from({ length: 6 }, (_, i) => (
                <PurchasesRowSkeleton key={i} />
              ))}
            </div>
            <nav className={ap('usersPagination')} aria-hidden="true">
              <span className={'appSkeletonBlock ' + ap('usersPaginationSummary')} style={{ width: '11.5rem', height: '1.125rem' }} />
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
            <span className={pc('visuallyHidden')}>Загрузка...</span>
          </div>
        </div>
      </div>
    </section>
  )
}
