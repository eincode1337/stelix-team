
const rs = (...n: string[]) => n.map((x) => `Resources-module__Zk5JmW__${x}`).join(' ')
const pc = (...n: string[]) => n.map((x) => `PurchaseContent-module__l1XItG__${x}`).join(' ')

const CATEGORY_FLEX = [1.05, 0.92, 1.12, 0.95, 1.08, 0.88, 1.1, 0.9, 1.06, 0.94, 1]

function GamePlatformCardSkeleton() {
  return (
    <li className={rs('gamePlatformStripItem')}>
      <div className={rs('gamePlatformCardSkeleton')}>
        <span className={'appSkeletonBlock appSkeletonBlock--radiusSm ' + rs('gamePlatformCardSkeletonMedia')} />
        <span className={'appSkeletonBlock appSkeletonBlock--radiusSm ' + rs('gamePlatformCardSkeletonLabel')} />
      </div>
    </li>
  )
}

function CategoryChipSkeleton({ flex }: { flex: number }) {
  return (
    <li className={rs('categoryStripItem')} style={{ flex: `${flex} 1 0` }}>
      <span className={'appSkeletonBlock appSkeletonBlock--radiusSm ' + rs('categoryStripChipSkeleton')} style={{ height: '2.375rem' }} />
    </li>
  )
}

function ResourceCardSkeleton() {
  return (
    <div className={rs('card')}>
      <div className={rs('tileLead')}>
        <span className="appSkeletonBlock" style={{ width: '2.75rem', height: '2.75rem' }} />
        <div className={rs('tileLeadText', 'resourceSkeletonTileLeadText')}>
          <span className={'appSkeletonBlock ' + rs('resourceSkeletonTitleLine')} style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
      <div className={rs('cardImage')}>
        <span className={'appSkeletonBlock ' + rs('resourceSkeletonCover')} style={{ width: '100%', height: '100%' }} />
      </div>
      <div className={rs('tileBody')}>
        <div className={rs('tilePriceRow')}>
          <div className={rs('tilePriceRowMain')}>
            <span className="appSkeletonBlock" style={{ width: '3.25rem', height: '1.375rem' }} />
            <span className="appSkeletonBlock" style={{ width: '4.5rem', height: '1.375rem' }} />
            <span className="appSkeletonBlock" style={{ width: '2.75rem', height: '1.375rem' }} />
          </div>
          <span className="appSkeletonBlock" style={{ width: '6.25rem', height: '1.0625rem' }} />
        </div>
        <span className="appSkeletonBlock" style={{ width: '100%', height: 13 }} />
        <span className="appSkeletonBlock" style={{ width: '72%', height: 13 }} />
        <div className={rs('tileRatingFooter')}>
          <span className="appSkeletonBlock" style={{ width: '7.5rem', height: '1.0625rem' }} />
          <div className={rs('resourceSkeletonTileStats')}>
            <span className="appSkeletonBlock" style={{ width: '3.25rem', height: '1.0625rem' }} />
            <span className="appSkeletonBlock" style={{ width: '3.25rem', height: '1.0625rem' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ResourcesSuspenseShell({ loadingLabel = 'Загрузка каталога...' }: { loadingLabel?: string } = {}) {
  return (
    <section className={rs('resources', 'resourcesCatalogEmpty')}>
      <div className={'container ' + rs('resourcesPageInner')}>
        <div className={rs('content')}>
          <div className={rs('catalogPlatformsBlock', 'catalogPlatformsBlockPlain', 'catalogPlatformsGameTop')}>
            <div className={rs('gamePlatformStrip')} aria-hidden="true">
              <ul className={rs('gamePlatformStripList')}>
                {Array.from({ length: 30 }, (_, i) => (
                  <GamePlatformCardSkeleton key={i} />
                ))}
              </ul>
            </div>
          </div>

          <div className={rs('catalogPlatformsTop')}>
            <div className={rs('catalogPlatformsBlock', 'catalogPlatformsBlockBleed')}>
              <div className={rs('categoryStrip')} aria-hidden="true">
                <ul className={rs('categoryStripList', 'categoryStripListSkeleton')}>
                  {CATEGORY_FLEX.map((flex, i) => (
                    <CategoryChipSkeleton key={i} flex={flex} />
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className={rs('grid')} role="status" aria-live="polite" aria-busy="true">
            {Array.from({ length: 16 }, (_, i) => (
              <ResourceCardSkeleton key={i} />
            ))}
            <span className={pc('visuallyHidden')}>{loadingLabel}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
