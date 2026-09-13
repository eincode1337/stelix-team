
import { t } from '@/i18n/t'

const he = (...n: string[]) => n.map((x) => `Hero-module__ZjlDhW__${x}`).join(' ')
const pc = (...n: string[]) => n.map((x) => `PurchaseContent-module__l1XItG__${x}`).join(' ')

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

export function SubscriptionsHero({ locale }: { locale: string }) {
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

      <div className={he('bannerText')} role="region" aria-label={t(locale, 'Подписки сервисов')}>
        <h1 className={pc('visuallyHidden')}>{t(locale, 'Подписки сервисов')}</h1>

        <div className={he('bannerTitle', 'bannerTitleWithCount')}>
          <span className={he('bannerTitlePhrase')}>
            <span aria-hidden="true">{t(locale, 'Подписки ')}</span>
            <span className={he('bannerTitleAccentWrap')}>
              <span className={he('bannerTitleAccent', 'bannerTitleAccentInline')} aria-hidden="true">{t(locale, 'сервисов')}</span>
            </span>
          </span>
        </div>

        <p className={he('bannerSubtitle')}>{t(locale, 'Каталог сервисов: тарифы продавца, оплата картой и автопродление')}</p>
      </div>
    </section>
  )
}
