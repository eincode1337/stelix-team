'use client'


import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { t } from '@/i18n/t'
import { createOrder } from './ordersClient'

const he = (...n: string[]) => n.map((x) => `Hero-module__ZjlDhW__${x}`).join(' ')
const pc = (...n: string[]) => n.map((x) => `PurchaseContent-module__l1XItG__${x}`).join(' ')
const co = (...n: string[]) => n.map((x) => `CreateOrderContent-module__aaDqna__${x}`).join(' ')


function profileSlug(name: string, id: number): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${base || 'user'}-${id}`
}


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


const CATEGORY_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'development', label: 'Разработка' },
  { value: 'design', label: 'Разработка дизайна' },
  { value: 'integration', label: 'Создать интеграцию' },
  { value: 'optimization', label: 'Оптимизация производительности' },
  { value: 'other', label: 'Другое' },
]


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
const cardStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  maxWidth: '32rem',
}

export function OrdersHero({ locale }: { locale: string }) {
  const { user, loading: authLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [deadline, setDeadline] = useState('')
  const [category, setCategory] = useState('other')


  useEffect(() => {
    setMounted(true)
  }, [])


  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  function resetForm() {
    setTitle('')
    setDescription('')
    setBudget('')
    setDeadline('')
    setCategory('other')
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmedTitle = title.trim()


    if (!trimmedTitle) {
      setError('Укажите название заказа')
      return
    }
    setSubmitting(true)
    setError(null)

    const parsedBudget = budget.trim() === '' ? undefined : Number(budget)
    const result = await createOrder({
      title: trimmedTitle,
      description: description.trim() || undefined,
      budget: parsedBudget != null && Number.isFinite(parsedBudget) ? parsedBudget : undefined,
      deadline: deadline || undefined,
      category,
    })

    setSubmitting(false)
    if (result.ok) {
      resetForm()
      setOpen(false)
    } else {
      setError(result.error)
    }
  }

  const loggedOut = mounted && !authLoading && !user

  return (
    <>
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

        <div className={he('bannerText')} role="region" aria-label={t(locale, 'Цифровые заказы')}>
          <h1 className={pc('visuallyHidden')}>{t(locale, 'Цифровые заказы')}</h1>

          <div className={he('bannerTitle', 'bannerTitleWithCount')}>
            <span className={he('bannerTitlePhrase')}>
              <span aria-hidden="true">{t(locale, 'Цифровые ')}</span>
              <span className={he('bannerTitleAccentWrap')}>
                <span className={he('bannerTitleAccent', 'bannerTitleAccentInline')} aria-hidden="true">{t(locale, 'заказы')}</span>
              </span>
            </span>
          </div>

          <p className={he('bannerSubtitle')}>{t(locale, 'Создавайте заказы, находите исполнителей и отслеживайте статус сделок')}</p>

          <div className={he('heroBannerAction')} data-nosnippet="true">
            {mounted ? (


              <>
                <button
                  type="button"
                  className={he('heroCreateOrderButton')}
                  onClick={() => {
                    setError(null)
                    setOpen(true)
                  }}
                  aria-label={t(locale, 'Создать новый')}
                >
                  <span className={he('heroCreateOrderIconBadge')} aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" className={he('heroCreateOrderIcon')}>
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {t(locale, 'Создать новый')}
                </button>
                {user ? (
                  <a
                    className={he('heroExecutorProfileLink')}
                    href={`/profile/public/${profileSlug(user.name, user.id)}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                      fill="currentColor"
                      className={he('heroBannerActionIcon')}
                      aria-hidden="true"
                    >
                      <path d="M144 128a80 80 0 1 1 160 0 80 80 0 1 1 -160 0zm208 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0zM48 480c0-70.7 57.3-128 128-128l96 0c70.7 0 128 57.3 128 128l0 8c0 13.3 10.7 24 24 24s24-10.7 24-24l0-8c0-97.2-78.8-176-176-176l-96 0C78.8 304 0 382.8 0 480l0 8c0 13.3 10.7 24 24 24s24-10.7 24-24l0-8z" />
                    </svg>
                    {t(locale, 'Мой профиль')}
                  </a>
                ) : null}
              </>
            ) : (

              <button
                type="button"
                className={he('heroCreateOrderButton')}
                disabled
                title={t(locale, 'Создание заказов, отклики и выбор исполнителя временно отключены')}
                aria-label={t(locale, 'Создать новый')}
              >
                <span className={he('heroCreateOrderIconBadge')} aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" className={he('heroCreateOrderIcon')}>
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {t(locale, 'Создать новый')}
              </button>
            )}
          </div>
        </div>
      </section>

      {mounted && open ? (
        <div style={overlayStyle} role="dialog" aria-modal="true" aria-label={t(locale, 'Новый заказ')}>
          <div style={scrimStyle} aria-hidden="true" onClick={() => setOpen(false)} />
          <div className={co('create')} style={cardStyle}>
            <div className={co('container')}>
              <div className={co('content')}>
                <form className={co('form')} onSubmit={handleSubmit}>
                  <h2 className={co('formTitle')}>{t(locale, 'Новый заказ')}</h2>

                  {loggedOut ? (
                    <div className={co('infoCard')}>
                      <div className={co('infoContent')}>
                        <p className={co('infoText')}>
                          {t(locale, 'Войдите в аккаунт, чтобы создать заказ')}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  <div className={co('formGroup')}>
                    <label className={co('label')} htmlFor="order-title">
                      {t(locale, 'Название')}
                    </label>
                    <input
                      id="order-title"
                      className={co('formInputTall')}
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t(locale, 'Например: Интеграция с платёжной системой')}
                      maxLength={120}
                      autoFocus
                      required
                    />
                  </div>

                  <div className={co('formGroup')}>
                    <label className={co('label')} htmlFor="order-description">
                      {t(locale, 'Описание')}
                    </label>
                    <textarea
                      id="order-description"
                      className={co('formTextareaTall')}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t(locale, 'Опишите задачу, требования и ожидаемый результат')}
                      rows={4}
                    />
                  </div>

                  <div className={co('formRow')}>
                    <div className={co('formGroup')}>
                      <label className={co('label')} htmlFor="order-budget">
                        {t(locale, 'Бюджет, ₽')}
                      </label>
                      <div className={co('amountStepperWrap')}>
                        <input
                          id="order-budget"
                          className={co('formInputTall')}
                          type="number"
                          inputMode="numeric"
                          min={0}
                          step={50}
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className={co('formGroup')}>
                      <label className={co('label')} htmlFor="order-category">
                        {t(locale, 'Категория')}
                      </label>
                      <select
                        id="order-category"
                        className={co('formDropdownTrigger')}
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        {CATEGORY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {t(locale, opt.label)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={co('formGroup')}>
                    <label className={co('label')} htmlFor="order-deadline">
                      {t(locale, 'Срок сдачи')}
                    </label>
                    <input
                      id="order-deadline"
                      className={co('formInputTall')}
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                    />
                  </div>

                  {error ? <p className={co('submitError')}>{t(locale, error)}</p> : null}

                  <button type="submit" className={co('createOrderSubmitButton')} disabled={submitting}>
                    {submitting ? t(locale, 'Создание…') : t(locale, 'Создать заказ')}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
