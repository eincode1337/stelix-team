'use client'


import { useCallback, useEffect, useRef, useState } from 'react'
import { t } from '@/i18n/t'
import { useAuth } from '@/components/auth/AuthProvider'
import { useSignInDrawer } from '@/components/auth/SignInDrawer'

const sub = (...n: string[]) => n.map((x) => `Subscriptions-module__JUE8VG__${x}`).join(' ')
const rs = (...n: string[]) => n.map((x) => `Resources-module__Zk5JmW__${x}`).join(' ')
const pc = (...n: string[]) => n.map((x) => `PurchaseContent-module__l1XItG__${x}`).join(' ')

interface Offering {
  id: string
  name: string
  periodMonths: number
  priceRubles: number
  trialDays: number
}

interface Subscription {
  id: string
  offeringId: string
  status: string
  startedAt: string
  expiresAt: string
  remainDays: number
  autoRenew: boolean
  periodMonths: number
  priceRubles: number
}

interface MembershipsPayload {
  subscriptions: Subscription[]
  offerings: Offering[]
  trialUsedOfferingIds: string[]
}

type Status = 'loading' | 'ready' | 'error'

function extractOfferings(payload: unknown): Offering[] {
  if (Array.isArray(payload)) return payload as Offering[]
  if (payload && typeof payload === 'object') {
    const o = (payload as { offerings?: unknown }).offerings
    if (Array.isArray(o)) return o as Offering[]
  }
  return []
}

function extractMemberships(payload: unknown): MembershipsPayload {
  const empty: MembershipsPayload = { subscriptions: [], offerings: [], trialUsedOfferingIds: [] }
  if (!payload || typeof payload !== 'object') return empty
  const p = payload as Partial<MembershipsPayload>
  return {
    subscriptions: Array.isArray(p.subscriptions) ? p.subscriptions : [],
    offerings: Array.isArray(p.offerings) ? p.offerings : [],
    trialUsedOfferingIds: Array.isArray(p.trialUsedOfferingIds) ? p.trialUsedOfferingIds : [],
  }
}

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}
const monthsLabel = (n: number) => `${n} ${plural(n, 'месяц', 'месяца', 'месяцев')}`
const daysLabel = (n: number) => `${n} ${plural(n, 'день', 'дня', 'дней')}`
const formatRubles = (n: number) => `${new Intl.NumberFormat('ru-RU').format(n)} ₽`

function PlanCardSkeleton() {
  return (
    <div className={sub('planCardHost')}>
      <div className={sub('planCard', 'planCardSkeleton')}>
        <span className={sub('planCardCover')} aria-hidden="true">
          <span className="appSkeletonBlock" style={{ width: '4.75rem', height: '4.75rem' }} />
        </span>
        <span className={sub('planCardIntro')}>
          <span className="appSkeletonBlock" style={{ width: '68%', height: '1.2rem' }} />
          <span className="appSkeletonBlock" style={{ width: '38%', height: '0.8rem' }} />
        </span>
        <span className={sub('planCardPriceRow')}>
          <span className="appSkeletonBlock" style={{ width: '6.5rem', height: '1.25rem' }} />
          <span className="appSkeletonBlock" style={{ width: '3.8rem', height: '0.9rem' }} />
        </span>
        <span className={sub('planCardMeta')}>
          <span className="appSkeletonBlock" style={{ width: '5.25rem', height: '1.05rem' }} />
          <span className="appSkeletonBlock" style={{ width: '2.6rem', height: '1.05rem' }} />
          <span className="appSkeletonBlock" style={{ width: '2.6rem', height: '1.05rem' }} />
        </span>
        <span className={sub('planCardSellerRow')}>
          <span className="appSkeletonBlock appSkeletonBlock--radiusPill" style={{ width: '4.5rem', height: '1.5rem' }} />
          <span className="appSkeletonBlock" style={{ width: '5.5rem', height: '1.05rem' }} />
        </span>
        <span className={'appSkeletonBlock ' + sub('planCardBlurbSkeleton')} style={{ width: '100%', height: '2.15rem' }} />
        <span className="appSkeletonBlock" style={{ width: '4.5rem', height: '0.85rem' }} />
      </div>
    </div>
  )
}

function CatalogShell({ children }: { children: React.ReactNode }) {
  return (
    <section className={sub('page') + ' ' + rs('resources')}>
      <div className={'container ' + rs('resourcesPageInner') + ' ' + sub('pageInner')}>{children}</div>
    </section>
  )
}

function PlanCard({
  locale,
  offering,
  subscribed,
  trialUsed,
  busy,
  onSubscribe,
}: {
  locale: string
  offering: Offering
  subscribed: boolean
  trialUsed: boolean
  busy: boolean
  onSubscribe: (offering: Offering, trial: boolean) => void
}) {
  const trialAvailable = offering.trialDays > 0 && !trialUsed
  const buttonLabel = busy
    ? t(locale, 'Оформляем…')
    : subscribed
      ? t(locale, 'Подписка активна')
      : trialAvailable
        ? t(locale, 'Попробовать бесплатно')
        : t(locale, 'Подписаться')

  return (
    <div className={sub('planCardHost')}>
      <div className={sub('planCard')}>
        <span className={sub('planCardCover', 'planCardCoverBare')} aria-hidden="true">
          <span className={sub('coverPlaceholder')}>
            <svg className={sub('coverPlaceholderIcon')} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 7l8-4 8 4v10l-8 4-8-4V7z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M4 7l8 4 8-4M12 11v10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </span>

        <span className={sub('planCardIntro')}>
          <span className={sub('planCardTitle')}>{offering.name}</span>
          <span className={sub('planCardSubtitle')}>
            {t(locale, 'Подписка на ') + monthsLabel(offering.periodMonths)}
          </span>
        </span>

        <span className={sub('planCardPriceRow')}>
          <span className={sub('planCardPriceValue')}>{formatRubles(offering.priceRubles)}</span>
          <span className={sub('planCardTerm')}>{'/ ' + monthsLabel(offering.periodMonths)}</span>
        </span>

        {trialAvailable && (
          <span className={sub('planCardBadgeSlot')}>
            {daysLabel(offering.trialDays) + ' ' + t(locale, 'бесплатно')}
          </span>
        )}

        <button
          type="button"
          className={sub('catalogCardButton')}
          onClick={() => onSubscribe(offering, trialAvailable)}
          disabled={busy || subscribed}
          aria-busy={busy || undefined}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  )
}

function StatusCallout({
  tone,
  text,
  actionLabel,
  onAction,
}: {
  tone: 'danger' | 'default'
  text: string
  actionLabel?: string
  onAction?: () => void
}) {
  const hasAction = Boolean(actionLabel && onAction)
  const cls = [sub('statusCallout')]
  if (tone === 'danger') cls.push(sub('statusCalloutDanger'))
  if (hasAction) cls.push(sub('statusCalloutWithGo'))
  return (
    <div className={cls.join(' ')} role="status" aria-live="polite">
      <span className={sub('statusCalloutIcon')} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
          <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </span>
      <span className={sub('statusCalloutText')}>{text}</span>
      {hasAction && (
        <button type="button" className={sub('statusCalloutGoBtn')} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export function SubscriptionsCatalogShell({ locale }: { locale: string }) {
  const { user, loading: authLoading } = useAuth()
  const signIn = useSignInDrawer()

  const [status, setStatus] = useState<Status>('loading')
  const [offerings, setOfferings] = useState<Offering[]>([])
  const [subscribedIds, setSubscribedIds] = useState<Set<string>>(new Set())
  const [trialUsedIds, setTrialUsedIds] = useState<Set<string>>(new Set())
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const [actionError, setActionError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')
    fetch('/api/subscriptions/offerings', {
      signal: controller.signal,
      credentials: 'include',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`offerings ${res.status}`)
        const body = await res.json().catch(() => null)
        return extractOfferings(body)
      })
      .then((list) => {
        if (!mountedRef.current) return
        setOfferings(list)
        setStatus('ready')
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        if (!mountedRef.current) return
        setStatus('error')
      })
    return () => controller.abort()
  }, [reloadKey])

  const loadMemberships = useCallback(
    async (signal?: AbortSignal) => {
      if (!user) {
        if (mountedRef.current) {
          setSubscribedIds(new Set())
          setTrialUsedIds(new Set())
        }
        return
      }
      try {
        const res = await fetch('/api/subscriptions/memberships', {
          signal,
          credentials: 'include',
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        })
        if (!res.ok) return
        const body = await res.json().catch(() => null)
        const data = extractMemberships(body)
        if (!mountedRef.current) return
        setSubscribedIds(
          new Set(
            data.subscriptions
              .filter((s) => s.status !== 'cancelled' && s.status !== 'expired')
              .map((s) => s.offeringId),
          ),
        )
        setTrialUsedIds(new Set(data.trialUsedOfferingIds))
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return
      }
    },
    [user],
  )

  useEffect(() => {
    if (authLoading) return
    const controller = new AbortController()
    void loadMemberships(controller.signal)
    return () => controller.abort()
  }, [authLoading, loadMemberships])

  const handleSubscribe = useCallback(
    async (offering: Offering, trial: boolean) => {
      setActionError(null)
      if (!user) {
        signIn.open()
        return
      }
      setPendingIds((prev) => new Set(prev).add(offering.id))
      try {
        const res = await fetch('/api/subscriptions/subscribe', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          cache: 'no-store',
          body: JSON.stringify({
            serviceId: offering.id,
            planId: offering.id,
            autoRenew: true,
            trial,
          }),
        })
        if (res.status === 401) {
          signIn.open()
          return
        }
        if (!res.ok) throw new Error(`subscribe ${res.status}`)
        await loadMemberships()
      } catch (err: unknown) {
        if (!mountedRef.current) return
        setActionError(t(locale, 'Не удалось оформить подписку. Попробуйте ещё раз.'))
      } finally {
        if (mountedRef.current) {
          setPendingIds((prev) => {
            const next = new Set(prev)
            next.delete(offering.id)
            return next
          })
        }
      }
    },
    [user, signIn, loadMemberships, locale],
  )

  if (status === 'loading') {
    return (
      <CatalogShell>
        <div className={sub('catalogPlanGrid')} role="status" aria-live="polite" aria-busy="true">
          {Array.from({ length: 10 }, (_, i) => (
            <PlanCardSkeleton key={i} />
          ))}
          <span className={pc('visuallyHidden')}>{t(locale, 'Загрузка сервисов')}</span>
        </div>
      </CatalogShell>
    )
  }

  if (status === 'error') {
    return (
      <CatalogShell>
        <StatusCallout
          tone="danger"
          text={t(locale, 'Не удалось загрузить каталог подписок.')}
          actionLabel={t(locale, 'Повторить')}
          onAction={() => setReloadKey((k) => k + 1)}
        />
      </CatalogShell>
    )
  }

  if (offerings.length === 0) {
    return (
      <CatalogShell>
        <StatusCallout tone="default" text={t(locale, 'Пока нет доступных подписок.')} />
      </CatalogShell>
    )
  }

  return (
    <CatalogShell>
      {actionError && (
        <StatusCallout
          tone="danger"
          text={actionError}
          actionLabel={t(locale, 'Скрыть')}
          onAction={() => setActionError(null)}
        />
      )}
      <div className={sub('catalogPlanGrid')}>
        {offerings.map((offering) => (
          <PlanCard
            key={offering.id}
            locale={locale}
            offering={offering}
            subscribed={subscribedIds.has(offering.id)}
            trialUsed={trialUsedIds.has(offering.id)}
            busy={pendingIds.has(offering.id)}
            onSubscribe={handleSubscribe}
          />
        ))}
      </div>
    </CatalogShell>
  )
}
