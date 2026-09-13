'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useLocale, useT } from '@/i18n/LocaleProvider'


const c = (...n: string[]) => n.map((x) => `Cart-module__m44xRG__${x}`).join(' ')
const ck = (...n: string[]) => n.map((x) => `CheckoutContent-module__miPPgG__${x}`).join(' ')
const ph = (...n: string[]) => n.map((x) => `PageHeaderBar-module__1SDZQW__${x}`).join(' ')
const ap = (...n: string[]) => n.map((x) => `AdminPanel-module__8pW_9a__${x}`).join(' ')
const pc = (...n: string[]) => n.map((x) => `PurchaseContent-module__l1XItG__${x}`).join(' ')
const cs = (...n: string[]) => n.map((x) => `CenteredEmptyState-module__97Qt0G__${x}`).join(' ')


type CartItem = { resourceId: string; quantity: number; deferred: boolean; addedAt: string }
type CartResponse = { items: CartItem[] }
type CartSummaryLine = { resourceId: string; title: string; price: number; quantity: number; deferred: boolean }
type CartSummaryResponse = { lines: CartSummaryLine[]; activeUnits: number }


type KassaMethod = {
  id: string
  name: string
  kassaName: string
  currency: string
  minAmount: number
  maxAmount: number
  available: boolean
}


type DisplayLine = { resourceId: string; title: string; price: number; quantity: number; deferred: boolean }


function formatAmount(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}


function CurrencyIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 384 512" fill="currentColor" className={className} aria-hidden="true">
      <path d="M64 32C46.3 32 32 46.3 32 64l0 192 0 32 0 64-32 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l32 0 0 32c0 17.7 14.3 32 32 32s32-14.3 32-32l0-32 96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0 0-32 112 0c88.4 0 160-71.6 160-160S312.4 32 224 32L64 32zM224 256l-96 0 0-160 96 0c53 0 96 43 96 96s-43 64-96 64z" />
    </svg>
  )
}


function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={ap('tableIconButtonIcon')} aria-hidden="true">
      <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}


function CartEmptyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cs('icon')} aria-hidden="true">
      <circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2" />
      <circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}


function CartHeader({ count, onBack }: { count: number; onBack: () => void }) {
  const tr = useT()
  return (
    <header className={ph('headerBar')}>
      <div className={ph('headerBar__start')}>
        <h1 className={ph('headerBar__title')}>{tr('Корзина')}</h1>
        <span className={ph('headerBar__count')} aria-label={`${tr('Товаров в заказе')}: ${count}`}>
          {count}
        </span>
      </div>
      <div className={ph('headerBar__end')}>
        <span className={ph('headerBar__divider')} aria-hidden="true" />
        <div className={ph('headerBar__actions')}>
          <button
            type="button"
            className={ap('tableIconButton') + ' ' + ck('pageHeaderIconTooltipAnchor', 'pageHeaderTableIconButton')}
            aria-label={tr('Вернуться к ресурсам')}
            data-tooltip-trigger=""
            onClick={onBack}
          >
            <BackArrowIcon />
          </button>
        </div>
      </div>
    </header>
  )
}


function CartSkeleton() {
  const tr = useT()
  return (
    <section className={c('cart', 'cartEmpty')}>
      <div className={'container ' + c('cartPageInner')}>
        <header className={ph('headerBar')}>
          <div className={ph('headerBar__start')}>
            <h1 className={ph('headerBar__title')}>{tr('Корзина')}</h1>
            <span
              className={'appSkeletonBlock ' + ph('headerBar__countLoading')}
              style={{ height: '2.5rem', minWidth: '2.5rem', minHeight: '2.5rem' }}
              aria-busy="true"
            />
          </div>
          <div className={ph('headerBar__end')}>
            <span className={ph('headerBar__divider')} aria-hidden="true" />
            <div className={ph('headerBar__actions')}>
              <button
                type="button"
                className={ap('tableIconButton') + ' ' + ck('pageHeaderIconTooltipAnchor', 'pageHeaderTableIconButton')}
                aria-label={tr('Вернуться к ресурсам')}
                data-tooltip-trigger=""
              >
                <BackArrowIcon />
              </button>
            </div>
          </div>
        </header>
        <div className={c('belowHeader')}>
          <div className={ck('cartCheckoutLoadingWrap')} role="status" aria-live="polite" aria-busy="true">
            <div className={ck('content', 'cartCheckoutLoadingContent')}>
              <div className={ck('main')}>
                <div className={ck('cartCheckoutSkeletonStackFill')} aria-hidden="true">
                  <span className={'appSkeletonBlock appSkeletonBlock--radiusSm ' + ck('cartCheckoutSkeletonStripeFill')} style={{ width: '100%' }} />
                  <span className={'appSkeletonBlock appSkeletonBlock--radiusSm ' + ck('cartCheckoutSkeletonStripeFill')} style={{ width: '100%' }} />
                  <span className={'appSkeletonBlock appSkeletonBlock--radiusSm ' + ck('cartCheckoutSkeletonStripeFill')} style={{ width: '100%' }} />
                </div>
              </div>
              <div className={ck('sidebar')}>
                <div className={ck('cartCheckoutSkeletonStackFill')} aria-hidden="true">
                  <span className={'appSkeletonBlock appSkeletonBlock--radiusSm ' + ck('cartCheckoutSidebarSkeletonStripeFill')} style={{ width: '100%' }} />
                </div>
              </div>
            </div>
            <span className={pc('visuallyHidden')}>{tr('Загрузка корзины')}</span>
          </div>
        </div>
      </div>
    </section>
  )
}


function CartEmpty({ onBack }: { onBack: () => void }) {
  const tr = useT()
  return (
    <section className={c('cart', 'cartEmpty')}>
      <div className={'container ' + c('cartPageInner')}>
        <CartHeader count={0} onBack={onBack} />
        <div className={c('belowHeader', 'belowHeaderCenter')}>
          <div className={cs('root') + ' ' + c('empty')}>
            <CartEmptyIcon />
            <p className={ph('headerBar__emptyCaption') + ' ' + cs('caption')}>{tr('Нет добавленных ресурсов')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

interface CartFilledProps {
  lines: DisplayLine[]
  activeUnits: number
  total: number
  balance: number
  methods: KassaMethod[]
  busy: boolean
  actionError: boolean
  insufficient: boolean
  depositBusy: boolean
  onBack: () => void
  onRemove: (resourceId: string) => void
  onQuantity: (resourceId: string, quantity: number) => void
  onCheckout: () => void
  onDeposit: (methodId: string) => void
}


function CartFilled({
  lines,
  activeUnits,
  total,
  balance,
  methods,
  busy,
  actionError,
  insufficient,
  depositBusy,
  onBack,
  onRemove,
  onQuantity,
  onCheckout,
  onDeposit,
}: CartFilledProps) {
  const tr = useT()


  const [depositMethod, setDepositMethod] = useState('')
  const shortfall = Math.max(total - balance, 0)


  useEffect(() => {
    if (methods.length === 0) return
    setDepositMethod((prev) => (methods.some((m) => m.id === prev) ? prev : methods[0].id))
  }, [methods])
  return (
    <section className={c('cart')}>
      <div className={'container ' + c('cartPageInner')}>
        <CartHeader count={activeUnits} onBack={onBack} />
        <div className={c('belowHeader')}>
          <div className={c('content')}>
            <div className={c('items')}>
              {lines.map((line) => (
                <div className={c('item')} key={line.resourceId}>
                  <div className={c('itemInfo')}>
                    <div className={c('itemHeader')}>
                      <div>

                        <div className={c('itemType')}>{tr('Ресурс')}</div>
                        <h3 className={c('itemName')}>{line.title}</h3>
                      </div>
                      <button
                        type="button"
                        className={c('removeButton')}
                        onClick={() => onRemove(line.resourceId)}
                        disabled={busy}
                      >
                        {tr('Удалить')}
                      </button>
                    </div>
                    <div className={c('itemFooter')}>
                      <div className={c('quantity')}>
                        <button
                          type="button"
                          className={c('quantityButton')}
                          aria-label={tr('Уменьшить количество')}
                          onClick={() => onQuantity(line.resourceId, line.quantity - 1)}
                          disabled={busy || line.quantity <= 1}
                        >
                          −
                        </button>
                        <span className={c('quantityValue')}>{line.quantity}</span>
                        <button
                          type="button"
                          className={c('quantityButton')}
                          aria-label={tr('Увеличить количество')}
                          onClick={() => onQuantity(line.resourceId, line.quantity + 1)}
                          disabled={busy}
                        >
                          +
                        </button>
                      </div>
                      <div className={c('itemPrice')}>
                        <span className={c('price')}>
                          {formatAmount(line.price * line.quantity)}
                          <CurrencyIcon className={c('currencyIcon')} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <aside className={c('summary')}>
              <h2 className={c('summaryTitle')}>{tr('Оформление')}</h2>
              <div className={c('summaryContent')}>
                <div className={c('summaryRow')}>
                  <span className={c('summaryLabel')}>{tr('Товаров')}</span>
                  <span className={c('summaryValue')}>{activeUnits}</span>
                </div>
                <div className={c('summaryTotal')}>
                  <span className={c('totalLabel')}>{tr('К оплате')}</span>
                  <span className={c('totalValue')}>
                    {formatAmount(total)}
                    <CurrencyIcon className={c('totalCurrency')} />
                  </span>
                </div>
                {actionError && !insufficient && (
                  <p role="alert" style={{ color: 'var(--danger-fg)', margin: '0 0 1rem', fontSize: '.88rem' }}>
                    {tr('Не удалось выполнить действие. Попробуйте ещё раз.')}
                  </p>
                )}
                {insufficient && (
                  <div style={{ margin: '0 0 1rem' }}>
                    <p role="alert" style={{ color: 'var(--danger-fg)', margin: '0 0 .6rem', fontSize: '.88rem' }}>
                      {tr('Недостаточно средств на балансе. Пополните баланс, чтобы оформить заказ.')}
                    </p>
                    <div className={c('summaryRow')}>
                      <span className={c('summaryLabel')}>{tr('Баланс')}</span>
                      <span className={c('summaryValue')}>
                        {formatAmount(balance)}
                        <CurrencyIcon className={c('currencyIcon')} />
                      </span>
                    </div>
                    {methods.length > 0 && (
                      <label
                        style={{ display: 'block', margin: '.6rem 0', fontSize: '.85rem', color: 'var(--fg-muted)' }}
                      >
                        <span style={{ display: 'block', marginBottom: '.35rem' }}>{tr('Способ пополнения')}</span>
                        <select
                          value={depositMethod}
                          onChange={(e) => setDepositMethod(e.target.value)}
                          disabled={depositBusy}
                          style={{ width: '100%', padding: '.55rem .6rem', borderRadius: '.5rem' }}
                        >
                          {methods.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.kassaName} · {m.currency}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                    <button
                      type="button"
                      className={c('checkoutButton')}
                      onClick={() => onDeposit(depositMethod)}
                      disabled={depositBusy || !depositMethod || shortfall <= 0}
                      aria-busy={depositBusy || undefined}
                    >
                      {depositBusy
                        ? tr('Переход к оплате…')
                        : `${tr('Пополнить на')} ${formatAmount(shortfall)} ₽`}
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  className={c('checkoutButton')}
                  onClick={onCheckout}
                  disabled={busy || depositBusy || activeUnits <= 0}
                  aria-busy={busy || undefined}
                >
                  {busy ? tr('Оформление…') : tr('Оформить заказ')}
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}

type Status = 'loading' | 'ready' | 'error'

export function Cart() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const locale = useLocale()


  const [status, setStatus] = useState<Status>('loading')
  const [items, setItems] = useState<CartItem[]>([])
  const [summary, setSummary] = useState<CartSummaryResponse>({ lines: [], activeUnits: 0 })
  const [balance, setBalance] = useState(0)
  const [methods, setMethods] = useState<KassaMethod[]>([])
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState(false)


  const [insufficient, setInsufficient] = useState(false)
  const [depositBusy, setDepositBusy] = useState(false)


  const handleBack = useCallback(() => {
    router.push(`/${locale}/resources`)
  }, [router, locale])


  const load = useCallback(async (): Promise<boolean> => {
    const [cartRes, summaryRes, balRes, kassaRes] = await Promise.all([
      fetch('/api/cart', { credentials: 'include', cache: 'no-store', headers: { Accept: 'application/json' } }),
      fetch('/api/cart/summary', { credentials: 'include', cache: 'no-store', headers: { Accept: 'application/json' } }),
      fetch('/api/auth/balance', { credentials: 'include', cache: 'no-store', headers: { Accept: 'application/json' } }),
      fetch('/api/kassa', { credentials: 'include', cache: 'no-store', headers: { Accept: 'application/json' } }),
    ])
    if (!cartRes.ok || !summaryRes.ok) return false
    const cart = (await cartRes.json()) as CartResponse
    const sum = (await summaryRes.json()) as CartSummaryResponse
    setItems(Array.isArray(cart.items) ? cart.items : [])
    setSummary({
      lines: Array.isArray(sum.lines) ? sum.lines : [],
      activeUnits: Number(sum.activeUnits) || 0,
    })
    if (balRes.ok) {
      const b = (await balRes.json().catch(() => null)) as { balance?: number } | null
      setBalance(Number(b?.balance ?? 0))
    }
    if (kassaRes.ok) {
      const k = (await kassaRes.json().catch(() => null)) as { methods?: KassaMethod[] } | null

      const rawMethods: KassaMethod[] = k && Array.isArray(k.methods) ? k.methods : []
      setMethods(rawMethods.filter((m) => m && m.available && m.currency === 'RUB'))
    }
    return true
  }, [])

  useEffect(() => {
    if (loading) return
    if (!user) return

    let active = true
    void (async () => {
      try {
        const ok = await load()
        if (active) setStatus(ok ? 'ready' : 'error')
      } catch {
        if (active) setStatus('error')
      }
    })()

    return () => {
      active = false
    }
  }, [loading, user, load])


  const activeTotal = items.reduce((sum, item) => {
    if (item.deferred) return sum
    const price = summary.lines.find((l) => l.resourceId === item.resourceId)?.price ?? 0
    return sum + price * item.quantity
  }, 0)


  const runMutation = useCallback(
    async (request: () => Promise<Response>) => {
      setBusy(true)
      setActionError(false)
      setInsufficient(false)
      try {
        const res = await request()
        if (!res.ok) {
          setActionError(true)
          return
        }
        await load()
      } catch {
        setActionError(true)
      } finally {
        setBusy(false)
      }
    },
    [load],
  )

  const handleRemove = useCallback(
    (resourceId: string) =>
      void runMutation(() =>
        fetch('/api/cart', {
          method: 'DELETE',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ resourceId }),
        }),
      ),
    [runMutation],
  )

  const handleQuantity = useCallback(
    (resourceId: string, quantity: number) => {
      if (quantity < 1) return
      void runMutation(() =>
        fetch('/api/cart', {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ resourceId, quantity }),
        }),
      )
    },
    [runMutation],
  )


  const handleCheckout = useCallback(async () => {
    setBusy(true)
    setActionError(false)
    setInsufficient(false)
    try {
      const res = await fetch('/api/cart/checkout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({}),
      })
      if (!res.ok) {
        setActionError(true)
        return
      }
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string; balance?: number }
        | null
      if (typeof data?.balance === 'number') setBalance(data.balance)
      if (data?.ok) {
        await load()
      } else if (data?.error === 'insufficient_balance') {
        setInsufficient(true)
      } else {
        setActionError(true)
      }
    } catch {
      setActionError(true)
    } finally {
      setBusy(false)
    }
  }, [load])


  const handleDeposit = useCallback(
    async (methodId: string) => {
      if (!methodId || depositBusy) return
      const shortfall = Math.max(activeTotal - balance, 0)
      if (shortfall <= 0) {

        void handleCheckout()
        return
      }
      setDepositBusy(true)
      setActionError(false)
      try {
        const res = await fetch('/api/kassa', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ method: methodId, amount: shortfall, currency: 'RUB' }),
        })
        const data = (await res.json().catch(() => null)) as { url?: string } | null
        if (!res.ok || !data?.url) {
          setActionError(true)
          setDepositBusy(false)
          return
        }


        const sep = data.url.includes('?') ? '&' : '?'
        router.push(`/${locale}${data.url}${sep}redirect=${encodeURIComponent('/cart')}`)
      } catch {
        setActionError(true)
        setDepositBusy(false)
      }
    },
    [depositBusy, activeTotal, balance, handleCheckout, router, locale],
  )


  if (status !== 'ready') return <CartSkeleton />
  if (items.length === 0) return <CartEmpty onBack={handleBack} />


  const lines: DisplayLine[] = items.map((item) => {
    const summaryLine = summary.lines.find((l) => l.resourceId === item.resourceId)
    return {
      resourceId: item.resourceId,
      title: summaryLine?.title ?? item.resourceId,
      price: summaryLine?.price ?? 0,
      quantity: item.quantity,
      deferred: item.deferred,
    }
  })


  return (
    <CartFilled
      lines={lines}
      activeUnits={summary.activeUnits}
      total={activeTotal}
      balance={balance}
      methods={methods}
      busy={busy}
      actionError={actionError}
      insufficient={insufficient || balance < activeTotal}
      depositBusy={depositBusy}
      onBack={handleBack}
      onRemove={handleRemove}
      onQuantity={handleQuantity}
      onCheckout={handleCheckout}
      onDeposit={handleDeposit}
    />
  )
}
