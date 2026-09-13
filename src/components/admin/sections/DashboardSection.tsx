'use client'


import { useEffect, useState } from 'react'

import { ap, AdminMiniStat, AdminMiniStats, AdminLoading, type AdminTrend } from '@/components/admin/ui'


const STATS_ENDPOINT = '/api/admin/stats'


type StatsTrend = 'up' | 'down' | 'flat'
type StatsFormat = 'number' | 'currency'

interface Kpi {
  key: string
  label: string
  value: number
  format: StatsFormat
  delta: number
  trend: StatsTrend
}

interface StatsResponse {
  sellerCount: number
  userCount: number
  purchaseCount: number
  orderCount: number
  kpis: Kpi[]
}


const NUMBER_FMT = new Intl.NumberFormat('ru-RU')
const CURRENCY_FMT = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})

const DELTA_FMT = new Intl.NumberFormat('ru-RU', { signDisplay: 'exceptZero', maximumFractionDigits: 1 })

function formatValue(value: number, format: StatsFormat): string {
  return format === 'currency' ? CURRENCY_FMT.format(value) : NUMBER_FMT.format(value)
}


function toTrend(kpi: Kpi): AdminTrend {
  const direction = kpi.trend === 'up' ? 'up' : kpi.trend === 'down' ? 'down' : 'flat'
  return { value: `${DELTA_FMT.format(kpi.delta)}%`, direction }
}


const SKELETON_TILES = 6

export function DashboardSection() {
  const [data, setData] = useState<StatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true

    const controllers = new Set<AbortController>()

    let backgroundInFlight = false


    async function load(background: boolean) {
      if (background && backgroundInFlight) return
      if (background) backgroundInFlight = true
      const controller = new AbortController()
      controllers.add(controller)
      if (!background) {
        setLoading(true)
        setError(null)
      }
      try {
        const res = await fetch(STATS_ENDPOINT, {
          signal: controller.signal,
          cache: 'no-store',
          credentials: 'same-origin',
          headers: { accept: 'application/json' },
        })
        if (!res.ok) {
          throw new Error(
            res.status === 401 ? 'Требуется вход в систему' : `Ошибка загрузки (${res.status})`,
          )
        }
        const json = (await res.json()) as StatsResponse
        if (alive) {
          setData(json)
          setError(null)
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return

        if (alive && !background) setError((err as Error).message || 'Не удалось загрузить данные')
      } finally {
        controllers.delete(controller)
        if (background) backgroundInFlight = false
        if (alive && !background) setLoading(false)
      }
    }

    void load(false)


    const onWake = () => {
      if (document.visibilityState === 'visible') void load(true)
    }
    window.addEventListener('focus', onWake)
    document.addEventListener('visibilitychange', onWake)

    return () => {
      alive = false
      for (const c of controllers) c.abort()
      window.removeEventListener('focus', onWake)
      document.removeEventListener('visibilitychange', onWake)
    }
  }, [])

  return (
    <>

      <div className={ap('sectionHeader')}>
        <h2 className={ap('sectionTitle')}>Обзор</h2>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : error ? (

        <div className={ap('adminDataLoadingWrap')}>
          <p className={ap('emptyStateText')}>{error}</p>
        </div>
      ) : data ? (
        <AdminMiniStats>
          {data.kpis.map((kpi) => (
            <AdminMiniStat
              key={kpi.key}

              label={kpi.label}
              value={formatValue(kpi.value, kpi.format)}

              trend={toTrend(kpi)}
            />
          ))}
        </AdminMiniStats>
      ) : (
        <AdminLoading size="page" />
      )}
    </>
  )
}


function DashboardSkeleton() {
  return (
    <div className={ap('adminMiniStats')} aria-hidden="true">
      {Array.from({ length: SKELETON_TILES }, (_, i) => (
        <div key={i} className={ap('adminMiniStatSkeletonSlot')}>
          <div className={ap('adminMiniStatFullSkeleton')} />
        </div>
      ))}
    </div>
  )
}
