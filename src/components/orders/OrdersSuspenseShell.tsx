'use client'


import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { t } from '@/i18n/t'
import {
  useOrdersStore,
  loadOrders,
  fetchOrder,
  respondToOrder,
  type Order,
  type OrderResponse,
} from './ordersClient'

const or = (...n: string[]) => n.map((x) => `Orders-module__-6BbXa__${x}`).join(' ')
const plsr = (...n: string[]) => n.map((x) => `PurchasesListStackRow-module__TmWrnq__${x}`).join(' ')
const pl = (...n: string[]) => n.map((x) => `PurchasesList-module__gstXbW__${x}`).join(' ')
const arc = (...n: string[]) => n.map((x) => `AddResourceContent-module__UdTvSa__${x}`).join(' ')
const rd = (...n: string[]) => n.map((x) => `ResourceDetail-module__XriO0W__${x}`).join(' ')
const cc = (...n: string[]) => n.map((x) => `CheckoutContent-module__miPPgG__${x}`).join(' ')
const rs = (...n: string[]) => n.map((x) => `Resources-module__Zk5JmW__${x}`).join(' ')
const co = (...n: string[]) => n.map((x) => `CreateOrderContent-module__aaDqna__${x}`).join(' ')


const STATUS_META: Record<string, { cls: string; label: string; tone: string }> = {
  completed: { cls: 'orderStatus_completed', label: 'Завершен', tone: 'success' },
  open: { cls: 'orderStatus_open', label: 'Открыт', tone: 'info' },
  in_progress: { cls: 'orderStatus_in_progress', label: 'В работе', tone: 'attention' },
  cancelled: { cls: 'orderStatus_cancelled', label: 'Отменён', tone: 'neutral' },
}


const KIND_LABELS: Record<string, string> = {
  integration: 'Создать интеграцию',
  design: 'Разработка дизайна',
  optimization: 'Оптимизация производительности',
  development: 'Разработка',
  moderation: 'Модерация',
  other: 'Другое',
}

const MONTHS_GENITIVE = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
]

function normStatus(o: Order): string {
  return (o.status || o.displayPhase || o.rawStatus || '').toLowerCase().replace(/[\s-]+/g, '_')
}

function statusMeta(o: Order): { cls: string; label: string; tone: string } {
  const key = normStatus(o)
  return STATUS_META[key] ?? { cls: `orderStatus_${key}`, label: o.status, tone: 'neutral' }
}

function kindLabel(category: string): string {
  return KIND_LABELS[category] ?? category
}


function formatAmount(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}


function formatFullDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getUTCDate()} ${MONTHS_GENITIVE[d.getUTCMonth()]} ${d.getUTCFullYear()} г.`
}


function formatDeadline(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const dd = String(d.getUTCDate()).padStart(2, '0')
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}.${d.getUTCFullYear()}`
}


function responsesLabel(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  let word: string
  if (mod10 === 1 && mod100 !== 11) word = 'отклик'
  else if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) word = 'отклика'
  else word = 'откликов'
  return `${n} ${word}`
}

function avatarInitial(name: string): string {
  const c = (name || '').trim().charAt(0)
  return c ? c.toUpperCase() : '?'
}

function LightningIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="12" height="12">
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
    </svg>
  )
}


function OrderRowSkeleton() {
  return (
    <li className={or('orderLine')} data-stack-list-row="true">
      <div
        role="presentation"
        className={
          plsr('stackRow', 'stackRowSkeleton', 'stackRowSkeletonPlain', 'stackRowSkeletonFlush') +
          ' ' +
          pl('purchasesListStackRowSkeleton') +
          ' ' +
          arc('sellerHubStackRow') +
          ' ' +
          or('ordersListStackRow')
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
    </li>
  )
}

function OrdersLoadingShell({ locale }: { locale: string }) {
  return (
    <section className={or('ordersPage', 'ordersPageFlex')} aria-busy="true">
      <div className={'container ' + or('ordersPageInner')}>
        <div className={or('ordersBelowHeader')} role="status" aria-live="polite" aria-busy="true">
          <div className={or('ordersStackList', 'ordersStackListPlain') + ' ' + pl('stackListSkeletonHost')}>
            <ul className={arc('sellerResourceList') + ' ' + or('ordersList')} aria-hidden="true">
              {Array.from({ length: 5 }, (_, i) => (
                <OrderRowSkeleton key={i} />
              ))}
            </ul>
          </div>
          <span className={or('visuallyHidden')}>{t(locale, 'Загрузка списка заказов')}</span>
        </div>
      </div>
    </section>
  )
}


function OrderStackRow({
  order,
  locale,
  onOpen,
}: {
  order: Order
  locale: string
  onOpen: (order: Order) => void
}) {
  const meta = statusMeta(order)

  const description = (order.description || '').replace(/\s*\n\s*/g, ' ')

  return (
    <li className={or('orderLine')}>
      <a
        className={
          plsr('stackRow') +
          ' ' +
          pl('purchasesListStackRow') +
          ' ' +
          arc('sellerHubStackRow') +
          ' ' +
          or('ordersListStackRow')
        }
        aria-label={t(locale, 'Подробнее')}
        tabIndex={-1}
        aria-disabled="true"
        href="#"
        onClick={(e) => e.preventDefault()}
      >
        <span className={plsr('stackRail')} data-rail-tone={meta.tone} aria-hidden="true" />
        <div className={plsr('stackMain') + ' ' + pl('purchasesListStackMain') + ' ' + or('orderStackMain')}>
          <div className={plsr('stackCenter') + ' ' + or('orderStackCenter')}>
            <div className={plsr('stackLead') + ' ' + or('orderStackLead')}>
              <div className={plsr('stackLeadText') + ' ' + or('orderStackLeadText')}>
                <h3 className={plsr('stackTitle')}>{order.title}</h3>
                <div className={or('orderStackLeadMetaRow')}>
                  <span className={or('orderStackKindBadge')}>{t(locale, kindLabel(order.category))}</span>
                  {order.deadline ? (
                    <span className={or('orderStackDeadlineBadge')} data-tooltip-trigger="">
                      {formatDeadline(order.deadline)}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            {description ? (
              <p className={plsr('stackDesc') + ' ' + or('orderStackDesc')}>{description}</p>
            ) : null}
          </div>
          <div className={plsr('stackRight')}>
            <div className={arc('sellerLineBadges') + ' ' + plsr('stackMeta') + ' ' + or('orderStackRightMeta')}>
              <span
                role="link"
                tabIndex={0}
                className={
                  arc('sellerLineSoftBadge') +
                  ' ' +
                  plsr('stackDateBadge') +
                  ' ' +
                  or('orderClientBadge') +
                  ' ' +
                  or('orderResponsesHit')
                }
                data-tooltip-trigger=""
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onOpen(order)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onOpen(order)
                  }
                }}
              >
                {order.clientAvatarUrl ? (

                  <img
                    className={rd('authorAvatar') + ' ' + or('orderClientBadgeAvatar')}
                    src={order.clientAvatarUrl}
                    alt=""
                    aria-hidden="true"
                    width={20}
                    height={20}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span
                    className={rd('authorAvatar', 'authorAvatarFallback') + ' ' + or('orderClientBadgeAvatar')}
                    aria-hidden="true"
                  >
                    {avatarInitial(order.client)}
                  </span>
                )}
                <span className={or('orderClientBadgeName')}>{order.client}</span>
              </span>
              <span
                className={arc('sellerLineSoftBadge') + ' ' + plsr('stackDateBadge') + ' ' + or('orderResponsesCountBadge')}
              >
                <svg viewBox="0 0 24 24" fill="none" className={arc('sellerLineActionIcon')} aria-hidden="true">
                  <path
                    d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {responsesLabel(order.responsesCount)}
              </span>
              <span className={arc('sellerLineSoftBadge') + ' ' + plsr('stackDateBadge')} data-tooltip-trigger="">
                {formatFullDate(order.createdAt)}
              </span>
              <div className={arc('sellerHubLineActionsCluster')}>
                <span
                  className={or('statusBadge') + ' ' + plsr('stackStatusBadge') + ' ' + or(meta.cls)}
                  data-nosnippet="true"
                >
                  {t(locale, meta.label)}
                </span>
              </div>
              <span className={cc('productPriceValue') + ' ' + plsr('stackPrice')} data-nosnippet="true">
                {formatAmount(order.budget)}
                <svg viewBox="0 0 24 24" fill="currentColor" className={cc('productLightningIcon')} aria-hidden="true">
                  <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </a>
    </li>
  )
}


function FloatingFilters({ locale }: { locale: string }) {
  return (
    <div className={rs('floatingFilters')}>
      <button
        type="button"
        className={rs('floatingFiltersFab')}
        aria-label={t(locale, 'Открыть фильтры')}
        data-tooltip-trigger=""
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          fill="currentColor"
          className={rs('floatingFiltersFabIcon')}
          aria-hidden="true"
        >
          <path d="M0 93.7C0 77.3 13.3 64 29.7 64l452.7 0c16.4 0 29.7 13.3 29.7 29.7 0 7.9-3.1 15.4-8.7 21L336 281.9 336 482.3c0 16.4-13.3 29.7-29.7 29.7-7.9 0-15.4-3.1-21-8.7L183 401c-4.5-4.5-7-10.6-7-17L176 281.9 8.7 114.6C3.1 109.1 0 101.5 0 93.7zM73.9 112L217 255c4.5 4.5 7 10.6 7 17l0 102.1 64 64 0-166.1c0-6.4 2.5-12.5 7-17l143-143-364.1 0z" />
        </svg>
      </button>
    </div>
  )
}


const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: '5vh 1rem',
  overflowY: 'auto',
}
const scrimStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(8, 10, 20, 0.55)',
  backdropFilter: 'blur(2px)',
}
const cardStyle: React.CSSProperties = { position: 'relative', width: '100%', maxWidth: '34rem' }

function OrderDetailOverlay({
  order: initial,
  locale,
  onClose,
}: {
  order: Order
  locale: string
  onClose: () => void
}) {
  const { user, loading: authLoading } = useAuth()
  const [order, setOrder] = useState<Order>(initial)
  const [detailLoading, setDetailLoading] = useState(true)
  const [responses, setResponses] = useState<OrderResponse[]>([])

  const [message, setMessage] = useState('')
  const [price, setPrice] = useState<string>(initial.budget ? String(initial.budget) : '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let alive = true
    setDetailLoading(true)
    void fetchOrder(initial.id).then((fresh) => {
      if (!alive) return
      if (fresh) setOrder(fresh)
      setDetailLoading(false)
    })
    return () => {
      alive = false
    }
  }, [initial.id])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const loggedOut = !authLoading && !user
  const meta = statusMeta(order)
  const statusKey = normStatus(order)
  const deadline = formatDeadline(order.deadline)
  const closedForResponses = statusKey === 'completed' || statusKey === 'cancelled'

  async function handleRespond(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const parsedPrice = price.trim() === '' ? undefined : Number(price)
    const result = await respondToOrder(order.id, {
      message: message.trim() || undefined,
      price: parsedPrice != null && Number.isFinite(parsedPrice) ? parsedPrice : undefined,
    })
    setSubmitting(false)
    if (result.ok) {
      setResponses((prev) => [...prev, result.response])
      setOrder(result.order)
      setMessage('')
      setDone(true)
    } else {
      setError(result.error)
    }
  }

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" aria-label={t(locale, 'Заказ')}>
      <div style={scrimStyle} aria-hidden="true" onClick={onClose} />
      <div className={co('create')} style={cardStyle}>
        <div className={co('container')}>
          <div className={co('content')}>
            <h2 className={co('formTitle')}>{order.title}</h2>

            <div className={or('orderStackLeadMetaRow')} style={{ marginBottom: '0.5rem' }}>
              <span className={or('orderStackKindBadge')}>{t(locale, kindLabel(order.category))}</span>
              <span className={or('statusBadge') + ' ' + or(meta.cls)} data-nosnippet="true">
                {t(locale, meta.label)}
              </span>
              {deadline ? <span className={or('orderStackDeadlineBadge')}>{deadline}</span> : null}
              <span className={cc('productPriceValue')} data-nosnippet="true">
                {formatAmount(order.budget)}
                <LightningIcon />
              </span>
            </div>

            {order.description ? (
              <p className={or('orderStackDesc')}>{(order.description || '').replace(/\s*\n\s*/g, ' ')}</p>
            ) : null}

            <p className={or('orderStackDesc')}>
              <span className={or('orderClientBadgeName')}>{order.client}</span>
              {' · '}
              {responsesLabel(order.responsesCount)}
            </p>

            {detailLoading ? (
              <div className={or('listLoading')} aria-live="polite">
                <span className={or('listLoadingSpinner')} aria-hidden="true" />
                <span className={or('visuallyHidden')}>{t(locale, 'Загрузка')}</span>
              </div>
            ) : null}

            {responses.length > 0 ? (
              <ul className={arc('sellerResourceList')} style={{ listStyle: 'none', margin: '0.5rem 0', padding: 0 }}>
                {responses.map((r) => (
                  <li key={r.id} className={or('orderStackDesc')} style={{ padding: '0.35rem 0' }}>
                    <span className={or('orderClientBadgeName')}>{r.seller}</span>
                    {' — '}
                    {formatAmount(r.price)} <LightningIcon />
                    {r.message ? <> · {r.message}</> : null}
                  </li>
                ))}
              </ul>
            ) : null}

            <form className={co('form')} onSubmit={handleRespond}>
              {loggedOut ? (
                <div className={co('infoCard')}>
                  <div className={co('infoContent')}>
                    <p className={co('infoText')}>{t(locale, 'Войдите в аккаунт, чтобы откликнуться')}</p>
                  </div>
                </div>
              ) : null}

              <div className={co('formGroup')}>
                <label className={co('label')} htmlFor="respond-message">
                  {t(locale, 'Ваш отклик')}
                </label>
                <textarea
                  id="respond-message"
                  className={co('formTextareaTall')}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t(locale, 'Опишите, как вы решите задачу')}
                  rows={3}
                  disabled={closedForResponses}
                />
              </div>

              <div className={co('formGroup')}>
                <label className={co('label')} htmlFor="respond-price">
                  {t(locale, 'Ваша цена, ₽')}
                </label>
                <div className={co('amountStepperWrap')}>
                  <input
                    id="respond-price"
                    className={co('formInputTall')}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={50}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    disabled={closedForResponses}
                  />
                </div>
              </div>

              {error ? <p className={co('submitError')}>{t(locale, error)}</p> : null}
              {done && !error ? <p className={or('orderStackDesc')}>{t(locale, 'Отклик отправлен')}</p> : null}

              {closedForResponses ? (
                <p className={or('orderStackDesc')}>{t(locale, 'Приём откликов по этому заказу закрыт')}</p>
              ) : (
                <button type="submit" className={co('createOrderSubmitButton')} disabled={submitting || loggedOut}>
                  {submitting ? t(locale, 'Отправка…') : t(locale, 'Откликнуться')}
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}


function OrdersLoaded({ orders, locale }: { orders: Order[]; locale: string }) {
  const [selected, setSelected] = useState<Order | null>(null)

  const selectedLive = selected ? orders.find((o) => o.id === selected.id) ?? selected : null

  return (
    <>
      <FloatingFilters locale={locale} />
      <section className={or('ordersPage', 'ordersPageFlex')}>
        <div className={'container ' + or('ordersPageInner')}>
          <div className={or('ordersBelowHeader')}>
            <div className={or('ordersStackList', 'ordersStackListPlain')}>
              <ul className={arc('sellerResourceList') + ' ' + or('ordersList')}>
                {orders.map((o) => (
                  <OrderStackRow key={o.id} order={o} locale={locale} onOpen={setSelected} />
                ))}
              </ul>
            </div>
          </div>
        </div>
        {selectedLive ? (
          <OrderDetailOverlay order={selectedLive} locale={locale} onClose={() => setSelected(null)} />
        ) : null}
      </section>
    </>
  )
}


function OrdersEmpty({ locale }: { locale: string }) {
  return (
    <section className={or('ordersPage', 'ordersPageFlex')}>
      <div className={'container ' + or('ordersPageInner')}>
        <div className={or('ordersBelowHeader', 'ordersBelowHeaderCenter')}>
          <div className={or('empty')}>
            <svg viewBox="0 0 24 24" fill="none" className={or('emptyIcon')} aria-hidden="true">
              <path
                d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className={or('emptyText')}>{t(locale, 'Заказов пока нет')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function OrdersError({ locale }: { locale: string }) {
  return (
    <section className={or('ordersPage', 'ordersPageFlex')}>
      <div className={'container ' + or('ordersPageInner')}>
        <div className={or('ordersBelowHeader', 'ordersBelowHeaderCenter')}>
          <div className={or('empty')}>
            <svg viewBox="0 0 24 24" fill="none" className={or('emptyIcon')} aria-hidden="true">
              <path
                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className={or('emptyText')}>{t(locale, 'Не удалось загрузить список заказов')}</p>
            <button type="button" className={or('filterButton')} onClick={() => void loadOrders()}>
              {t(locale, 'Повторить')}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export function OrdersSuspenseShell({ locale }: { locale: string }) {
  const { phase, orders } = useOrdersStore()

  useEffect(() => {
    void loadOrders()
  }, [])

  if (phase === 'idle' || phase === 'loading') return <OrdersLoadingShell locale={locale} />
  if (phase === 'error') return <OrdersError locale={locale} />
  if (orders.length === 0) return <OrdersEmpty locale={locale} />
  return <OrdersLoaded orders={orders} locale={locale} />
}
