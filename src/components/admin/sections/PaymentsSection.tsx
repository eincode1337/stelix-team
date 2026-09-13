'use client'


import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  ap,
  AdminTable,
  AdminBadge,
  AdminMiniStat,
  AdminMiniStats,
  AdminLoading,
  AdminSectionHeader,
  type AdminColumn,
} from '@/components/admin/ui'


const PAYMENTS_ENDPOINT = '/api/admin/payments'


interface KassaMethod {
  id: string
  name: string
  kassaName: string
  commissionMinPct: number
  commissionMaxPct: number
  minAmount: number
  maxAmount: number
  currency: string
  available: boolean
}

interface PayoutProvider {
  provider: string
  name: string
  enabled: boolean
}

interface PaymentsResponse {
  methods: KassaMethod[]
  payouts: PayoutProvider[]
}


interface ToggleMethodResponse {
  ok: boolean
  method?: KassaMethod
  error?: string
}
interface TogglePayoutResponse {
  ok: boolean
  payout?: PayoutProvider
  error?: string
}


const METHOD_TYPE_LABELS: Record<string, string> = {
  sbp: 'СБП',
  cards: 'Банковские карты',
  card: 'Банковская карта',
  erip: 'ЕРИП',
  ysplit: 'Яндекс Сплит',
  yoomoney: 'ЮMoney',
  yookassa: 'YooKassa',
  crypto: 'Криптовалюта',
}

function methodTypeLabel(name: string): string {
  return METHOD_TYPE_LABELS[name.toLowerCase()] ?? name
}


const PCT_FMT = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 })


const currencyFmtCache = new Map<string, Intl.NumberFormat>()
function currencyFmt(currency: string): Intl.NumberFormat {
  const key = currency || 'RUB'
  let fmt = currencyFmtCache.get(key)
  if (!fmt) {
    try {
      fmt = new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: key,
        maximumFractionDigits: 0,
      })
    } catch {

      fmt = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
    }
    currencyFmtCache.set(key, fmt)
  }
  return fmt
}

function formatAmount(value: number, currency: string): string {
  return currencyFmt(currency).format(value)
}

function formatCommission(min: number, max: number): string {
  return min === max
    ? `${PCT_FMT.format(min)}%`
    : `${PCT_FMT.format(min)}–${PCT_FMT.format(max)}%`
}


function ToggleSwitch({
  checked,
  disabled,
  onChange,
  ariaLabel,
}: {
  checked: boolean
  disabled?: boolean
  onChange: () => void
  ariaLabel: string
}) {
  return (
    <label className={ap('switch')} title={ariaLabel}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        aria-label={ariaLabel}
      />
      <span className={ap('slider')} aria-hidden="true" />
    </label>
  )
}


const METHODS_GRID =
  'minmax(11rem,1.5fr) minmax(8rem,1fr) minmax(6.5rem,max-content) minmax(9.5rem,max-content) minmax(5rem,max-content) minmax(6.5rem,max-content) minmax(6rem,max-content)'
const PAYOUTS_GRID =
  'minmax(11rem,1.6fr) minmax(8rem,1fr) minmax(6.5rem,max-content) minmax(6rem,max-content)'

export function PaymentsSection() {
  const [methods, setMethods] = useState<KassaMethod[]>([])
  const [payouts, setPayouts] = useState<PayoutProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [pendingMethods, setPendingMethods] = useState<Set<string>>(new Set())
  const [pendingPayouts, setPendingPayouts] = useState<Set<string>>(new Set())


  useEffect(() => {
    let alive = true
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(PAYMENTS_ENDPOINT, {
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
        const json = (await res.json()) as PaymentsResponse
        if (alive) {
          setMethods(Array.isArray(json.methods) ? json.methods : [])
          setPayouts(Array.isArray(json.payouts) ? json.payouts : [])
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        if (alive) setError((err as Error).message || 'Не удалось загрузить данные')
      } finally {
        if (alive) setLoading(false)
      }
    }

    void load()
    return () => {
      alive = false
      controller.abort()
    }
  }, [])


  const toggleMethod = useCallback(
    async (m: KassaMethod) => {
      const id = m.id
      if (pendingMethods.has(id)) return
      const next = !m.available
      const previous = m.available

      setPendingMethods((prev) => new Set(prev).add(id))
      setError(null)

      setMethods((prev) => prev.map((x) => (x.id === id ? { ...x, available: next } : x)))

      try {
        const res = await fetch(PAYMENTS_ENDPOINT, {
          method: 'POST',
          cache: 'no-store',
          credentials: 'same-origin',
          headers: { 'content-type': 'application/json', accept: 'application/json' },
          body: JSON.stringify({ kind: 'method', id, available: next }),
        })
        if (!res.ok) {
          throw new Error(
            res.status === 401 ? 'Требуется вход в систему' : `Не удалось сохранить (${res.status})`,
          )
        }
        const json = (await res.json()) as ToggleMethodResponse
        if (!json.ok || !json.method) throw new Error(json.error || 'Не удалось сохранить')

        const saved = json.method
        setMethods((prev) => prev.map((x) => (x.id === id ? saved : x)))
      } catch (err) {

        setMethods((prev) => prev.map((x) => (x.id === id ? { ...x, available: previous } : x)))
        setError((err as Error).message || 'Не удалось сохранить изменение')
      } finally {
        setPendingMethods((prev) => {
          const nextSet = new Set(prev)
          nextSet.delete(id)
          return nextSet
        })
      }
    },
    [pendingMethods],
  )


  const togglePayout = useCallback(
    async (p: PayoutProvider) => {
      const provider = p.provider
      if (pendingPayouts.has(provider)) return
      const next = !p.enabled
      const previous = p.enabled

      setPendingPayouts((prev) => new Set(prev).add(provider))
      setError(null)
      setPayouts((prev) => prev.map((x) => (x.provider === provider ? { ...x, enabled: next } : x)))

      try {
        const res = await fetch(PAYMENTS_ENDPOINT, {
          method: 'POST',
          cache: 'no-store',
          credentials: 'same-origin',
          headers: { 'content-type': 'application/json', accept: 'application/json' },
          body: JSON.stringify({ kind: 'payout', provider, enabled: next }),
        })
        if (!res.ok) {
          throw new Error(
            res.status === 401 ? 'Требуется вход в систему' : `Не удалось сохранить (${res.status})`,
          )
        }
        const json = (await res.json()) as TogglePayoutResponse
        if (!json.ok || !json.payout) throw new Error(json.error || 'Не удалось сохранить')
        const saved = json.payout
        setPayouts((prev) => prev.map((x) => (x.provider === provider ? saved : x)))
      } catch (err) {
        setPayouts((prev) =>
          prev.map((x) => (x.provider === provider ? { ...x, enabled: previous } : x)),
        )
        setError((err as Error).message || 'Не удалось сохранить изменение')
      } finally {
        setPendingPayouts((prev) => {
          const nextSet = new Set(prev)
          nextSet.delete(provider)
          return nextSet
        })
      }
    },
    [pendingPayouts],
  )


  const totals = useMemo(() => {
    const activeMethods = methods.filter((m) => m.available).length
    const distinctKassas = new Set(methods.map((m) => m.kassaName)).size
    const enabledPayouts = payouts.filter((p) => p.enabled).length
    const availForAvg = methods.filter((m) => m.available)
    const avgCommission =
      availForAvg.length > 0
        ? availForAvg.reduce((sum, m) => sum + m.commissionMinPct, 0) / availForAvg.length
        : 0
    return {
      distinctKassas,
      activeMethods,
      totalMethods: methods.length,
      enabledPayouts,
      totalPayouts: payouts.length,
      avgCommission,
    }
  }, [methods, payouts])


  const methodColumns: AdminColumn<KassaMethod>[] = [
    {
      key: 'method',
      header: 'Метод',
      align: 'start',
      cellClassName: ap('tableCellUserIdentity'),
      cell: (m) => (
        <>
          <span className={ap('tableCellUserName')}>{methodTypeLabel(m.name)}</span>
          <span className={ap('tableCellUserEmail')}>{m.id}</span>
        </>
      ),
    },
    {
      key: 'kassa',
      header: 'Касса',
      align: 'start',
      cell: (m) => m.kassaName,
    },
    {
      key: 'commission',
      header: 'Комиссия',
      align: 'end',
      cell: (m) => formatCommission(m.commissionMinPct, m.commissionMaxPct),
    },
    {
      key: 'limits',
      header: 'Лимиты',
      align: 'end',
      cellClassName: ap('tableCellMuted'),
      cell: (m) => `${formatAmount(m.minAmount, m.currency)} — ${formatAmount(m.maxAmount, m.currency)}`,
    },
    {
      key: 'currency',
      header: 'Валюта',
      align: 'center',
      cell: (m) => m.currency,
    },
    {
      key: 'status',
      header: 'Статус',
      align: 'center',
      cell: (m) => (
        <AdminBadge tone={m.available ? 'success' : 'muted'}>
          {m.available ? 'Активен' : 'Отключён'}
        </AdminBadge>
      ),
    },
    {
      key: 'availability',
      header: 'Доступность',
      align: 'actions',
      cell: (m) => (
        <ToggleSwitch
          checked={m.available}
          disabled={pendingMethods.has(m.id)}
          onChange={() => void toggleMethod(m)}
          ariaLabel={m.available ? `Отключить ${m.kassaName} (${m.id})` : `Включить ${m.kassaName} (${m.id})`}
        />
      ),
    },
  ]


  const payoutColumns: AdminColumn<PayoutProvider>[] = [
    {
      key: 'provider',
      header: 'Провайдер',
      align: 'start',
      cellClassName: ap('tableCellUserIdentity'),
      cell: (p) => (
        <>
          <span className={ap('tableCellUserName')}>{p.name}</span>
          <span className={ap('tableCellUserEmail')}>{p.provider}</span>
        </>
      ),
    },
    {
      key: 'type',
      header: 'Тип',
      align: 'start',
      cellClassName: ap('tableCellMuted'),
      cell: () => 'Выплаты (webhook)',
    },
    {
      key: 'status',
      header: 'Статус',
      align: 'center',
      cell: (p) => (
        <AdminBadge tone={p.enabled ? 'success' : 'muted'}>
          {p.enabled ? 'Включён' : 'Отключён'}
        </AdminBadge>
      ),
    },
    {
      key: 'enabled',
      header: 'Включён',
      align: 'actions',
      cell: (p) => (
        <ToggleSwitch
          checked={p.enabled}
          disabled={pendingPayouts.has(p.provider)}
          onChange={() => void togglePayout(p)}
          ariaLabel={p.enabled ? `Отключить выплаты ${p.name}` : `Включить выплаты ${p.name}`}
        />
      ),
    },
  ]

  if (loading) {
    return (
      <>
        <AdminSectionHeader title="Кассы" />
        <AdminLoading size="page" />
      </>
    )
  }

  return (
    <>
      <AdminSectionHeader title="Кассы" />

      {error ? (
        <div className={ap('adminDataLoadingWrap')}>
          <p className={ap('emptyStateText')}>{error}</p>
        </div>
      ) : null}


      <AdminMiniStats>
        <AdminMiniStat label="Платёжных систем" value={totals.distinctKassas} />
        <AdminMiniStat
          label="Активных методов"
          value={`${totals.activeMethods} / ${totals.totalMethods}`}
        />
        <AdminMiniStat
          label="Провайдеров выплат"
          value={`${totals.enabledPayouts} / ${totals.totalPayouts}`}
        />
        <AdminMiniStat label="Средняя комиссия" value={`${PCT_FMT.format(totals.avgCommission)}%`} />
      </AdminMiniStats>


      <AdminSectionHeader title="Методы оплаты" />
      <AdminTable
        columns={methodColumns}
        rows={methods}
        rowKey={(m) => m.id}
        gridTemplateColumns={METHODS_GRID}
        emptyText="Методы оплаты не найдены"
        ariaLabel="Методы оплаты"
      />


      <AdminSectionHeader title="Провайдеры выплат" />
      <AdminTable
        columns={payoutColumns}
        rows={payouts}
        rowKey={(p) => p.provider}
        gridTemplateColumns={PAYOUTS_GRID}
        emptyText="Провайдеры выплат не найдены"
        ariaLabel="Провайдеры выплат"
      />
    </>
  )
}
