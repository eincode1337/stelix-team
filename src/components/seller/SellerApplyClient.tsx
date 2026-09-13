'use client'


import { useEffect, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/components/auth/AuthProvider'
import { useT } from '@/i18n/LocaleProvider'

const CLS = (name: string) => `CreateResourceContent-module__b5R2iG__${name}`

function prefersReducedMotion(): boolean {
  try {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

export function SellerApplyClient() {
  const [applyOpen, setApplyOpen] = useState(false)

  useEffect(() => {
    const selector = ['revealUp', 'revealLeft', 'revealRight'].map((c) => '.' + CLS(c)).join(',')
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector))
    if (nodes.length === 0) return

    const visible = CLS('revealVisible')

    if (typeof IntersectionObserver === 'undefined') {
      nodes.forEach((el) => el.classList.add(visible))
      return
    }

    const io = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add(visible)
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    nodes.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLDetailsElement>('.' + CLS('sellerFaqItem')))
    if (items.length === 0) return

    const openClass = CLS('sellerFaqItemOpen')
    const panelClass = CLS('sellerFaqAnswerPanel')
    const cleanups: Array<() => void> = []

    for (const item of items) {
      const panel = item.querySelector<HTMLElement>('.' + panelClass)
      if (!panel) continue

      const finishClose = () => {
        panel.style.height = '0px'
        item.removeAttribute('open')
      }

      let closeTimer = 0

      const onClick = (event: Event) => {
        const target = event.target as Node | null
        if (target && panel.contains(target)) return
        event.preventDefault()

        window.clearTimeout(closeTimer)
        const isOpen = item.classList.contains(openClass)
        const reduce = prefersReducedMotion()

        if (isOpen) {
          item.classList.remove(openClass)
          if (reduce) {
            finishClose()
            return
          }
          panel.style.height = panel.scrollHeight + 'px'
          void panel.offsetHeight
          panel.style.height = '0px'
          closeTimer = window.setTimeout(finishClose, 400)
        } else {
          item.setAttribute('open', '')
          item.classList.add(openClass)
          if (reduce) {
            panel.style.height = 'auto'
            return
          }
          panel.style.height = panel.scrollHeight + 'px'
        }
      }

      const onTransitionEnd = (event: TransitionEvent) => {
        if (event.propertyName !== 'height') return
        if (item.classList.contains(openClass)) {
          panel.style.height = 'auto'
        } else {
          window.clearTimeout(closeTimer)
          finishClose()
        }
      }

      item.addEventListener('click', onClick)
      panel.addEventListener('transitionend', onTransitionEnd)
      cleanups.push(() => {
        window.clearTimeout(closeTimer)
        item.removeEventListener('click', onClick)
        panel.removeEventListener('transitionend', onTransitionEnd)
      })
    }

    return () => cleanups.forEach((fn) => fn())
  }, [])

  useEffect(() => {
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.' + CLS('ctaButton')))
    if (buttons.length === 0) return

    const onClick = (event: Event) => {
      event.preventDefault()
      setApplyOpen(true)
    }

    buttons.forEach((button) => {
      button.setAttribute('aria-disabled', 'false')
      button.addEventListener('click', onClick)
    })
    return () => buttons.forEach((button) => button.removeEventListener('click', onClick))
  }, [])

  return <SellerApplyModal open={applyOpen} onClose={() => setApplyOpen(false)} />
}


const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const EXPERIENCE_OPTIONS = ['Менее 1 года', '1–2 года', '3–5 лет', 'Более 5 лет'] as const
const STEP_TITLES = ['О себе', 'Портфолио', 'Подтверждение'] as const

type Errors = Record<string, string>

function looksLikeLink(s: string): boolean {
  const v = s.trim()
  return /:\/\//.test(v) || /\.[a-zа-я]{2,}/i.test(v)
}

function SellerApplyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const tr = useT()
  const { user } = useAuth()

  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState(0)
  const [identity, setIdentity] = useState('')
  const [email, setEmail] = useState('')
  const [contact, setContact] = useState('')
  const [experience, setExperience] = useState('')
  const [portfolio, setPortfolio] = useState<string[]>(['', '', ''])
  const [description, setDescription] = useState('')
  const [agree, setAgree] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    setStep(0)
    setErrors({})
    setSubmitError(null)
    setSubmitting(false)
    setDone(false)
  }, [open])

  useEffect(() => {
    if (!open || !user) return
    setIdentity((p) => p || user.name || '')
    setEmail((p) => p || user.email || '')
    setContact((p) => p || user.telegramUsername || '')
  }, [open, user])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  const stepErrors = (s: number): Errors => {
    const e: Errors = {}
    if (s === 0) {
      if (!identity.trim()) e.identity = 'Укажите имя или никнейм'
      if (!EMAIL_RE.test(email.trim())) e.email = 'Укажите корректный email'
      if (!contact.trim()) e.contact = 'Укажите контакт для связи'
      if (!experience) e.experience = 'Выберите опыт разработки'
      else if (experience === EXPERIENCE_OPTIONS[0]) e.experience = 'Требуется опыт разработки от 1 года'
    } else if (s === 1) {
      const filled = portfolio.map((p) => p.trim()).filter(Boolean)
      if (filled.length < 3) e.portfolio = 'Добавьте минимум 3 проекта из портфолио'
      else if (!filled.every(looksLikeLink)) e.portfolio = 'Укажите корректные ссылки на проекты'
      if (description.trim().length < 20) e.description = 'Опишите деятельность подробнее (от 20 символов)'
    } else if (s === 2) {
      if (!agree) e.agree = 'Необходимо согласие с условиями'
    }
    return e
  }

  const goNext = () => {
    const e = stepErrors(step)
    setErrors(e)
    if (Object.keys(e).length === 0) setStep((s) => Math.min(2, s + 1))
  }
  const goBack = () => {
    setErrors({})
    setStep((s) => Math.max(0, s - 1))
  }

  const submit = async () => {
    const e0 = stepErrors(0)
    const e1 = stepErrors(1)
    const e2 = stepErrors(2)
    if (Object.keys(e0).length) {
      setStep(0)
      setErrors(e0)
      return
    }
    if (Object.keys(e1).length) {
      setStep(1)
      setErrors(e1)
      return
    }
    if (Object.keys(e2).length) {
      setErrors(e2)
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/seller/application', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          identity: identity.trim(),
          email: email.trim(),
          contact: contact.trim(),
          experience,
          description: description.trim(),
          portfolio: portfolio.map((p) => p.trim()).filter(Boolean),
          agree,
        }),
      })
      if (!res.ok) {
        setSubmitError('Не удалось отправить заявку. Проверьте поля и попробуйте ещё раз.')
        return
      }
      setDone(true)
    } catch {
      setSubmitError('Ошибка сети. Попробуйте ещё раз.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!mounted || !open) return null

  const labelStyle: CSSProperties = { display: 'block', marginBottom: '.3rem', fontSize: '.85rem', fontWeight: 600, color: 'var(--fg-default)' }
  const fieldWrap: CSSProperties = { marginBottom: '.9rem' }
  const baseInput: CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '.55rem .7rem',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border-default)',
    background: 'var(--bg-subtle)',
    color: 'var(--fg-default)',
    font: 'inherit',
    fontSize: '.94rem',
  }
  const inputStyle = (key: string): CSSProperties => (errors[key] ? { ...baseInput, borderColor: '#e5484d' } : baseInput)
  const errStyle: CSSProperties = { margin: '.3rem 0 0', color: '#e5484d', fontSize: '.8rem' }
  const primaryBtn = CLS('ctaButton')
  const secondaryBtn = CLS('secondaryActionLink')
  const filledCount = portfolio.map((p) => p.trim()).filter(Boolean).length

  const dialog = (
    <div
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'color-mix(in srgb, var(--fg-default, #000) 45%, transparent)',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="seller-apply-title"
        style={{
          width: '100%',
          maxWidth: '34rem',
          background: 'var(--bg-default)',
          border: '1px solid var(--border-muted)',
          borderRadius: 'var(--radius)',
          padding: '1.25rem',
          boxShadow: '0 24px 60px rgba(0,0,0,.35)',
          maxHeight: 'calc(100dvh - 2rem)',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '.75rem', marginBottom: '.5rem' }}>
          <h2 id="seller-apply-title" style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--fg-default)' }}>
            {tr('Заявка на продавца')}
          </h2>
          <button
            type="button"
            aria-label={tr('Закрыть')}
            onClick={onClose}
            style={{ appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--fg-muted)', padding: '.25rem', lineHeight: 0 }}
          >
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {done ? (
          <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
            <div
              aria-hidden="true"
              style={{ width: '3rem', height: '3rem', margin: '0 auto .75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--accent-soft-bg, var(--bg-subtle))', color: 'var(--accent-fg, var(--fg-default))' }}
            >
              <svg viewBox="0 0 24 24" fill="none" width="26" height="26">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 style={{ margin: '0 0 .4rem', fontSize: '1.05rem', fontWeight: 700, color: 'var(--fg-default)' }}>{tr('Заявка отправлена')}</h3>
            <p style={{ margin: '0 auto 1.1rem', maxWidth: '26rem', color: 'var(--fg-muted)', fontSize: '.92rem', lineHeight: 1.55 }}>
              {tr('Мы проверим заявку в течение 24 часов. После одобрения откроется панель продавца.')}
            </p>
            <button type="button" className={primaryBtn} style={{ marginInline: 'auto' }} onClick={onClose}>
              {tr('Готово')}
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '.4rem', margin: '.25rem 0 1rem' }}>
              {STEP_TITLES.map((title, i) => (
                <div key={i} style={{ flex: 1 }}>
                  <div style={{ height: '.28rem', borderRadius: '999px', background: i <= step ? 'var(--btn-success-bg, var(--accent-emphasis, #2f9e44))' : 'var(--border-muted)' }} />
                  <span style={{ display: 'block', marginTop: '.35rem', fontSize: '.75rem', color: i === step ? 'var(--fg-default)' : 'var(--fg-muted)', fontWeight: i === step ? 600 : 400 }}>
                    {i + 1}. {tr(title)}
                  </span>
                </div>
              ))}
            </div>

            {step === 0 && (
              <div>
                <div style={fieldWrap}>
                  <label style={labelStyle} htmlFor="apply-identity">{tr('Имя или никнейм')}</label>
                  <input id="apply-identity" type="text" value={identity} onChange={(e) => setIdentity(e.target.value)} style={inputStyle('identity')} placeholder={tr('Как к вам обращаться')} autoComplete="name" />
                  {errors.identity && <p style={errStyle}>{tr(errors.identity)}</p>}
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle} htmlFor="apply-email">{tr('Email для связи')}</label>
                  <input id="apply-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle('email')} placeholder="you@example.com" autoComplete="email" />
                  {errors.email && <p style={errStyle}>{tr(errors.email)}</p>}
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle} htmlFor="apply-contact">{tr('Контакт (Telegram / Discord)')}</label>
                  <input id="apply-contact" type="text" value={contact} onChange={(e) => setContact(e.target.value)} style={inputStyle('contact')} placeholder="@username" />
                  {errors.contact && <p style={errStyle}>{tr(errors.contact)}</p>}
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle} htmlFor="apply-experience">{tr('Опыт разработки')}</label>
                  <select id="apply-experience" value={experience} onChange={(e) => setExperience(e.target.value)} style={inputStyle('experience')}>
                    <option value="">{tr('Выберите…')}</option>
                    {EXPERIENCE_OPTIONS.map((o) => (
                      <option key={o} value={o}>{tr(o)}</option>
                    ))}
                  </select>
                  {errors.experience && <p style={errStyle}>{tr(errors.experience)}</p>}
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>{tr('Портфолио (минимум 3 проекта)')}</label>
                  {portfolio.map((val, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '.5rem', marginBottom: '.5rem' }}>
                      <input
                        type="url"
                        value={val}
                        onChange={(e) => setPortfolio((prev) => prev.map((p, i) => (i === idx ? e.target.value : p)))}
                        style={{ ...inputStyle('portfolio'), flex: 1 }}
                        placeholder={`${tr('Ссылка на проект')} ${idx + 1}`}
                      />
                      {portfolio.length > 3 && (
                        <button
                          type="button"
                          aria-label={tr('Удалить проект')}
                          onClick={() => setPortfolio((prev) => prev.filter((_, i) => i !== idx))}
                          style={{ appearance: 'none', border: '1px solid var(--border-default)', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)', cursor: 'pointer', color: 'var(--fg-muted)', padding: '0 .6rem' }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPortfolio((prev) => [...prev, ''])}
                    style={{ appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--accent-fg, var(--fg-default))', fontSize: '.85rem', fontWeight: 600, padding: 0 }}
                  >
                    + {tr('Добавить проект')}
                  </button>
                  {errors.portfolio && <p style={errStyle}>{tr(errors.portfolio)}</p>}
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle} htmlFor="apply-description">{tr('Описание деятельности')}</label>
                  <textarea
                    id="apply-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    style={{ ...inputStyle('description'), resize: 'vertical', minHeight: '5rem' }}
                    placeholder={tr('Расскажите, что вы разрабатываете и что планируете продавать')}
                  />
                  {errors.description && <p style={errStyle}>{tr(errors.description)}</p>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <dl style={{ margin: '0 0 1rem', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '.4rem .75rem', fontSize: '.9rem' }}>
                  <dt style={{ color: 'var(--fg-muted)' }}>{tr('Имя')}</dt>
                  <dd style={{ margin: 0, color: 'var(--fg-default)', wordBreak: 'break-word' }}>{identity.trim() || '—'}</dd>
                  <dt style={{ color: 'var(--fg-muted)' }}>Email</dt>
                  <dd style={{ margin: 0, color: 'var(--fg-default)', wordBreak: 'break-word' }}>{email.trim() || '—'}</dd>
                  <dt style={{ color: 'var(--fg-muted)' }}>{tr('Контакт')}</dt>
                  <dd style={{ margin: 0, color: 'var(--fg-default)', wordBreak: 'break-word' }}>{contact.trim() || '—'}</dd>
                  <dt style={{ color: 'var(--fg-muted)' }}>{tr('Опыт')}</dt>
                  <dd style={{ margin: 0, color: 'var(--fg-default)' }}>{experience ? tr(experience) : '—'}</dd>
                  <dt style={{ color: 'var(--fg-muted)' }}>{tr('Проекты')}</dt>
                  <dd style={{ margin: 0, color: 'var(--fg-default)' }}>{filledCount}</dd>
                </dl>
                <label style={{ display: 'flex', gap: '.55rem', alignItems: 'flex-start', cursor: 'pointer', fontSize: '.88rem', color: 'var(--fg-default)', lineHeight: 1.5 }}>
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: '.15rem', flexShrink: 0 }} />
                  <span>{tr('Я подтверждаю достоверность данных и согласен с условиями площадки и соглашением с автором.')}</span>
                </label>
                {errors.agree && <p style={errStyle}>{tr(errors.agree)}</p>}
                {submitError && <p style={{ ...errStyle, marginTop: '.75rem' }}>{tr(submitError)}</p>}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.75rem', marginTop: '1.25rem' }}>
              <button type="button" className={secondaryBtn} onClick={step === 0 ? onClose : goBack} disabled={submitting}>
                {step === 0 ? tr('Отмена') : tr('Назад')}
              </button>
              {step < 2 ? (
                <button type="button" className={primaryBtn} style={{ marginInline: 0 }} onClick={goNext}>
                  {tr('Далее')}
                </button>
              ) : (
                <button type="button" className={primaryBtn} style={{ marginInline: 0 }} onClick={submit} disabled={submitting}>
                  {submitting ? tr('Отправка…') : tr('Отправить заявку')}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )

  return createPortal(dialog, document.body)
}
