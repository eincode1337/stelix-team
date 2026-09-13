'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useLocale, useT } from '@/i18n/LocaleProvider'

const c = (...n: string[]) => n.map((x) => `Cart-module__m44xRG__${x}`).join(' ')
const ph = (...n: string[]) => n.map((x) => `PageHeaderBar-module__1SDZQW__${x}`).join(' ')

const PROVIDER_NAMES: Record<string, string> = {
  yoomoney: 'ЮMoney',
  yookassa: 'ЮKassa',
  heleket: 'Heleket',
  freekassa: 'FreeKassa',
  betatransfer: 'Betatransfer',
  skinpay: 'SkinPay',
  skinsback: 'SkinsBack',
  robokassa: 'Robokassa',
  paypalych: 'PayPalych',
  tbank: 'Т-Банк',
  't-bank': 'Т-Банк',
  anypay: 'AnyPay',
  'any-pay': 'AnyPay',
  tome: 'Tome',
  platega: 'Platega',
  cardlink: 'Cardlink',
  paymaster: 'PayMaster',
  tochka: 'Точка',
}

function providerLabel(slug: string): string {
  const key = slug.toLowerCase()
  return PROVIDER_NAMES[key] ?? (key ? key[0].toUpperCase() + key.slice(1) : slug)
}

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

function safeInternalPath(value: string | undefined | null): string | null {
  if (!value) return null
  if (value.startsWith('/') && !value.startsWith('//')) return value
  return null
}

export interface PayContentProps {
  provider: string
  paymentId: string
  amount: string
  currency: string
  redirect?: string
  purchaseId?: string
}

export function PayContent({ provider, paymentId, amount, currency, redirect, purchaseId }: PayContentProps) {
  const tr = useT()
  const locale = useLocale()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const providerName = providerLabel(provider)
  const numericAmount = Number(amount)
  const hasAmount = Number.isFinite(numericAmount) && numericAmount > 0
  const cur = (currency || 'RUB').toUpperCase()
  const isRub = cur === 'RUB' || cur === 'RUR'

  const canPay = Boolean(paymentId) && hasAmount

  const cancelTarget = purchaseId ? '/cart' : '/withdrawals'

  async function handlePay() {
    if (submitting || !canPay) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/pay/confirm', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ provider, paymentId, amount: numericAmount, currency: cur, purchaseId }),
      })
      if (!res.ok) {
        setError(
          res.status === 401
            ? 'Требуется вход в аккаунт'
            : res.status === 404
              ? 'Платёж не найден или устарел.'
              : 'Не удалось провести оплату. Попробуйте ещё раз.',
        )
        setSubmitting(false)
        return
      }
      const data = (await res.json().catch(() => ({}))) as { payment?: { kind?: string } }
      const kind = data.payment?.kind
      const target = safeInternalPath(redirect) ?? (kind === 'purchase' ? '/profile' : '/withdrawals')
      router.push(`/${locale}${target}`)
    } catch {
      setError('Ошибка сети. Попробуйте ещё раз.')
      setSubmitting(false)
    }
  }

  return (
    <section className={c('cart')}>
      <div className={'container ' + c('cartPageInner')}>
        <header className={ph('headerBar')}>
          <div className={ph('headerBar__start')}>
            <h1 className={ph('headerBar__title')}>{tr('Оплата')}</h1>
          </div>
        </header>

        <div className={c('belowHeader', 'belowHeaderCenter')}>
          <div style={{ width: '100%', maxWidth: '460px', margin: '0 auto' }}>
            <div className={c('summaryContent')}>
              <h2 className={c('summaryTitle')}>{providerName}</h2>

              <div className={c('summaryRow')}>
                <span className={c('summaryLabel')}>{tr('Способ оплаты')}</span>
                <span className={c('summaryValue')}>{providerName}</span>
              </div>

              <div className={c('summaryRow')}>
                <span className={c('summaryLabel')}>{tr('Номер платежа')}</span>
                <span
                  className={c('summaryValue')}
                  style={{ fontVariantNumeric: 'tabular-nums', wordBreak: 'break-all', textAlign: 'right' }}
                >
                  {paymentId || '—'}
                </span>
              </div>

              <div className={c('summaryTotal')}>
                <span className={c('totalLabel')}>{tr('К оплате')}</span>
                <span className={c('totalValue')}>
                  {hasAmount ? formatAmount(numericAmount) : '—'}
                  {isRub ? (
                    <CurrencyIcon className={c('totalCurrency')} />
                  ) : (
                    <span style={{ fontSize: '1.15rem', fontWeight: 700 }}>{cur}</span>
                  )}
                </span>
              </div>

              {error && (
                <p role="alert" style={{ color: 'var(--danger-fg)', margin: '0 0 1rem', fontSize: '.88rem' }}>
                  {tr(error)}
                </p>
              )}

              <button
                type="button"
                className={c('checkoutButton')}
                onClick={handlePay}
                disabled={submitting || !canPay}
              >
                {submitting ? tr('Обработка…') : tr('Оплатить')}
              </button>

              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <Link href={cancelTarget} style={{ color: 'var(--fg-muted)', fontSize: '.88rem' }}>
                  {tr('Отменить')}
                </Link>
              </div>

              <p style={{ color: 'var(--fg-subtle)', fontSize: '.78rem', textAlign: 'center', margin: '1.25rem 0 0' }}>
                {tr('Тестовая оплата — настоящие средства не списываются.')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
