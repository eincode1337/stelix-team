'use client'


import { useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent } from 'react'
import { WithdrawalsSkeleton } from './WithdrawalsSkeleton'
import { useT } from '@/i18n/LocaleProvider'

const wc = (...n: string[]) => n.map((x) => `WithdrawalsContent-module__BRVEYq__${x}`).join(' ')
const phb = (...n: string[]) => n.map((x) => `PageHeaderBar-module__1SDZQW__${x}`).join(' ')
const arc = (...n: string[]) => n.map((x) => `AddResourceContent-module__UdTvSa__${x}`).join(' ')
const prof = (...n: string[]) => n.map((x) => `Profile-module__MITPoG__${x}`).join(' ')
const ppn = (...n: string[]) => n.map((x) => `PublicProfile-module__j5FkGG__${x}`).join(' ')
const pl = (...n: string[]) => n.map((x) => `PurchasesList-module__gstXbW__${x}`).join(' ')
const cc = (...n: string[]) => n.map((x) => `CheckoutContent-module__miPPgG__${x}`).join(' ')

type Balance = { balance: number; payable: number }
type KassaMethod = {
  id: string
  name: string
  kassaName: string
  currency: string
  minAmount: number
  maxAmount: number
  available: boolean
}
type Kassa = { methods: KassaMethod[] }
type Withdrawal = {
  id: number | string
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'frozen' | string
}


const TABS: Array<{ key: string; label: string; href: string }> = [
  { key: 'all', label: 'Все заявки', href: '/withdrawals' },
  { key: 'pending', label: 'Ожидание', href: '/withdrawals/pending' },
  { key: 'processing', label: 'В обработке', href: '/withdrawals/processing' },
  { key: 'completed', label: 'Выплачено', href: '/withdrawals/completed' },
  { key: 'rejected', label: 'Отклонено', href: '/withdrawals/rejected' },
  { key: 'frozen', label: 'Заморожено', href: '/withdrawals/frozen' },
]

const STATUS_LABEL: Record<string, string> = {
  pending: 'Ожидание',
  processing: 'В обработке',
  completed: 'Выплачено',
  rejected: 'Отклонено',
  frozen: 'Заморожено',
}

const nf = new Intl.NumberFormat('ru-RU')


const INDICATOR_SEED = { width: 232.266, x: 7.6875 }


const GET_OPTS: RequestInit = { credentials: 'include', headers: { accept: 'application/json' } }


function normalizeWithdrawals(raw: unknown): Withdrawal[] {
  if (!Array.isArray(raw)) return []
  return raw.map((w) => ({
    ...(w as Withdrawal),
    status: String((w as Withdrawal).status ?? '').toLowerCase(),
  }))
}


function LightningIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
    </svg>
  )
}

export function WithdrawalsContent() {
  const tr = useT()
  const [ready, setReady] = useState(false)
  const [balance, setBalance] = useState<Balance>({ balance: 0, payable: 0 })
  const [methods, setMethods] = useState<KassaMethod[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)

  const [methodId, setMethodId] = useState('')
  const [amountInput, setAmountInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)


  const tabRefs = useRef<Array<HTMLAnchorElement | null>>([])
  const [indicator, setIndicator] = useState<{ width: number; x: number }>(INDICATOR_SEED)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const meRes = await fetch('/api/auth/me', GET_OPTS)
        const me = meRes.ok ? await meRes.json() : { user: null }

        if (!me || !me.user) return

        const [balRes, kassaRes, wdRes] = await Promise.all([
          fetch('/api/auth/balance', GET_OPTS),
          fetch('/api/kassa', GET_OPTS),
          fetch('/api/withdrawals', GET_OPTS),
        ])

        if (cancelled) return
        if (balRes.ok) {
          const b = (await balRes.json()) as Partial<Balance>
          setBalance({ balance: Number(b.balance ?? 0), payable: Number(b.payable ?? 0) })
        }
        if (kassaRes.ok) {
          const k = (await kassaRes.json()) as Kassa
          setMethods(Array.isArray(k.methods) ? k.methods.filter((m) => m.available) : [])
        }
        if (wdRes.ok) {
          const w = await wdRes.json()
          setWithdrawals(normalizeWithdrawals(w?.withdrawals))
        }
        setReady(true)
      } catch {

      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])


  useLayoutEffect(() => {
    if (!ready) return
    const measure = () => {
      const idx = TABS.findIndex((t) => t.key === activeTab)
      const el = tabRefs.current[idx]
      if (el) setIndicator({ width: el.offsetWidth, x: el.offsetLeft })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [ready, activeTab, withdrawals.length])


  async function refresh() {
    try {
      const [balRes, wdRes] = await Promise.all([
        fetch('/api/auth/balance', GET_OPTS),
        fetch('/api/withdrawals', GET_OPTS),
      ])
      if (balRes.ok) {
        const b = (await balRes.json()) as Partial<Balance>
        setBalance({ balance: Number(b.balance ?? 0), payable: Number(b.payable ?? 0) })
      }
      if (wdRes.ok) {
        const w = await wdRes.json()
        setWithdrawals(normalizeWithdrawals(w?.withdrawals))
      }
    } catch {

    }
  }

  function openCreate() {
    setMethodId('')
    setAmountInput('')
    setSubmitError(null)
    setCreateOpen(true)
  }

  function closeCreate() {
    if (submitting) return
    setCreateOpen(false)
  }

  function selectTab(e: MouseEvent<HTMLAnchorElement>, key: string) {


    e.preventDefault()
    setActiveTab(key)
  }


  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    const value = Number(amountInput)
    if (!methodId) {
      setSubmitError('Выберите способ выплаты')
      return
    }
    if (!Number.isFinite(value) || value <= 0) {
      setSubmitError('Введите корректную сумму')
      return
    }

    if (value > balance.payable) {
      setSubmitError('Недостаточно средств для вывода')
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ method: methodId, amount: value }),
      })
      if (!res.ok) {


        let code = ''
        try {
          const err = (await res.json()) as { error?: string }
          code = typeof err?.error === 'string' ? err.error : ''
        } catch {

        }
        setSubmitError(
          res.status === 401
            ? 'Требуется вход в аккаунт'
            : code === 'insufficient_funds'
              ? 'Недостаточно средств для вывода'
              : code === 'invalid_request'
                ? 'Введите корректную сумму'
                : 'Не удалось создать заявку',
        )
        return
      }
      await refresh()
      setCreateOpen(false)
      setMethodId('')
      setAmountInput('')
    } catch {
      setSubmitError('Ошибка сети. Попробуйте ещё раз')
    } finally {
      setSubmitting(false)
    }
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: withdrawals.length }
    for (const t of TABS) if (t.key !== 'all') c[t.key] = 0
    for (const w of withdrawals) if (c[w.status] != null) c[w.status] += 1
    return c
  }, [withdrawals])

  const sumByStatus = useMemo(() => {
    const s: Record<string, number> = {}
    for (const w of withdrawals) s[w.status] = (s[w.status] ?? 0) + Number(w.amount || 0)
    return s
  }, [withdrawals])


  const stats: Array<{ label: string; value: number }> = [
    { label: 'Доступно для покупки', value: balance.balance },
    { label: 'Доступно к выплате', value: balance.payable },
    { label: 'Всего заморожено', value: sumByStatus.frozen ?? 0 },
    { label: 'На выплате', value: (sumByStatus.pending ?? 0) + (sumByStatus.processing ?? 0) },
    { label: 'Всего выплачено', value: sumByStatus.completed ?? 0 },
    { label: 'Всего возврата', value: sumByStatus.rejected ?? 0 },
  ]

  const visible = useMemo(
    () => (activeTab === 'all' ? withdrawals : withdrawals.filter((w) => w.status === activeTab)),
    [withdrawals, activeTab],
  )

  if (!ready) return <WithdrawalsSkeleton />

  return (
    <section className={wc('withdrawals')}>
      <div className={'container ' + wc('container')}>
        <header className={phb('headerBar')}>
          <div className={phb('headerBar__start')}>
            <h1 className={phb('headerBar__title')}>{tr('Выплаты средств')}</h1>
            <span className={phb('headerBar__count')} aria-label={`${tr('Заявок:')} ${withdrawals.length}`}>
              {withdrawals.length}
            </span>
          </div>
          <div className={phb('headerBar__end')}>
            <span className={phb('headerBar__divider')} aria-hidden="true" />
            <div className={phb('headerBar__actions')}>
              <button
                type="button"
                className={wc('createButton', 'createButtonInHeader')}
                onClick={openCreate}
              >
                <LightningIcon className={wc('createIcon')} />
                {tr('Создать заявку')}
              </button>
            </div>
          </div>
        </header>

        <div className={wc('agentReportEnter')}>
          <p
            role="status"
            className={
              arc('settingsPanelHint', 'settingsPanelHintWithIcon', 'settingsPanelHintSuccess') +
              ' ' +
              wc('agentReportAcceptedStripe')
            }
          >
            <svg viewBox="0 0 24 24" fill="none" className={arc('settingsPanelHintIcon')} aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={arc('settingsPanelHintText')}>
              {tr('Вы подтвердили месячный отчёт агента: оборот по сделкам, удержанная комиссия и сумма к перечислению за прошлый месяц зафиксированы.')}
            </span>
          </p>
        </div>

        <div className={arc('sellerMiniStatsSection')} aria-busy="false">
          <div className={arc('sellerMiniStats')}>
            {stats.map((s) => (
              <div key={s.label} className={arc('sellerMiniStat')}>
                <p className={arc('sellerMiniStatLabel')}>{tr(s.label)}</p>
                <p className={cc('productPriceValue') + ' ' + arc('sellerMiniStatValue')}>
                  <span className={wc('balanceMiniStatAmount')}>
                    {nf.format(s.value)}
                    <LightningIcon className={cc('productLightningIcon')} />
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className={prof('tabs')}>
          <div className={ppn('profileCardNavWrap', 'profileCardNavWrapFull')}>
            <nav
              className={ppn('profileCardNav', 'profileCardNavFull')}
              role="tablist"
              aria-label={tr('Выплаты средств')}
            >
              {TABS.map((t, i) => (
                <a
                  key={t.key}
                  ref={(el) => {
                    tabRefs.current[i] = el
                  }}
                  role="tab"
                  aria-selected={activeTab === t.key}
                  className={
                    activeTab === t.key
                      ? ppn('profileCardNavItem', 'profileCardNavItemActive')
                      : ppn('profileCardNavItem')
                  }
                  href={t.href}
                  onClick={(e) => selectTab(e, t.key)}
                >
                  {tr(t.label)}
                  <span className={ppn('profileCardNavCount')} aria-hidden="true">
                    {counts[t.key] ?? 0}
                  </span>
                </a>
              ))}
              <span
                className={ppn('profileCardNavIndicator')}
                aria-hidden="true"
                style={{ width: `${indicator.width}px`, transform: `translateX(${indicator.x}px)` }}
              />
            </nav>
          </div>
        </div>

        <div className={pl('stackList', 'stackListPurchases') + ' ' + wc('list') + ' ' + pl('stackListSkeletonHost')}>
          {visible.length === 0 ? (
            <div className={wc('empty')}>
              <svg viewBox="0 0 24 24" fill="currentColor" className={wc('emptyIcon')} aria-hidden="true">
                <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
              </svg>
              <p className={phb('headerBar__emptyCaption') + ' ' + wc('emptyText')}>
                {tr('Заявок не найдено')}
              </p>
            </div>
          ) : (
            visible.map((w) => (
              <button key={w.id} type="button" className={wc('item')}>
                <div className={wc('itemRow')}>
                  <span className={wc('itemLightningAmount')}>
                    <LightningIcon className={wc('itemLightningIcon')} />
                    {nf.format(w.amount)}
                  </span>
                  <span className={wc('itemMeta')}>
                    <span
                      className={
                        wc('itemStatus') +
                        ' ' +
                        wc(
                          w.status === 'completed'
                            ? 'statusCompleted'
                            : w.status === 'processing'
                              ? 'statusProcessing'
                              : w.status === 'rejected'
                                ? 'statusRejected'
                                : 'statusPending',
                        )
                      }
                    >
                      {tr(STATUS_LABEL[w.status] ?? 'Ожидание')}
                    </span>
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {createOpen && (
        <div className={wc('modal')} role="dialog" aria-modal="true" aria-label={tr('Создать заявку на выплату')}>
          <div className={wc('modalOverlay')} onClick={closeCreate} aria-hidden="true" />
          <div className={wc('modalContent')}>
            <div className={wc('modalHeader')}>
              <h2 className={wc('modalTitle')}>{tr('Создать заявку')}</h2>
              <button
                type="button"
                className={wc('modalClose')}
                aria-label={tr('Закрыть')}
                onClick={closeCreate}
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <form className={wc('form')} onSubmit={handleSubmit}>
              <div className={wc('formGroup')}>
                <label className={wc('label')} htmlFor="withdrawal-method">
                  {tr('Способ выплаты')}
                </label>
                <select
                  id="withdrawal-method"
                  className={wc('select')}
                  value={methodId}
                  onChange={(e) => {
                    setMethodId(e.target.value)
                    if (submitError) setSubmitError(null)
                  }}
                  disabled={submitting}
                >
                  <option value="" disabled>
                    {tr('Выберите способ')}
                  </option>
                  {methods.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.kassaName} · {m.currency}
                    </option>
                  ))}
                </select>
              </div>
              <div className={wc('formGroup')}>
                <label className={wc('label')} htmlFor="withdrawal-amount">
                  {tr('Сумма')}
                </label>
                <input
                  id="withdrawal-amount"
                  className={wc('input')}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  placeholder="0"
                  value={amountInput}
                  onChange={(e) => {
                    setAmountInput(e.target.value)
                    if (submitError) setSubmitError(null)
                  }}
                  disabled={submitting}
                />
                <p className={wc('hint')}>{tr('Доступно к выводу')}: {nf.format(balance.payable)}</p>
                {submitError && (
                  <p className={wc('hint')} role="alert">
                    {tr(submitError)}
                  </p>
                )}
              </div>
              <button type="submit" className={wc('submitButton')} disabled={submitting}>
                {submitting ? tr('Отправка…') : tr('Отправить заявку')}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
