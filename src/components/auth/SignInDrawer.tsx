'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/components/auth/AuthProvider'
import { useT } from '@/i18n/LocaleProvider'

const sd = (...names: string[]) => names.map((n) => `SignInDrawer-module__I6hBpW__${n}`).join(' ')
const sf = (...names: string[]) => names.map((n) => `signinForm-module__S873kq__${n}`).join(' ')

type OAuthProvider = {
  id: 'discord' | 'telegram' | 'google' | 'github' | 'steam'
  label: string
  buttonClass: string
  iconClass: string
}

const OAUTH_PROVIDERS: OAuthProvider[] = [
  { id: 'discord', label: 'Discord', buttonClass: 'discordButton', iconClass: 'discordIcon' },
  { id: 'telegram', label: 'Telegram', buttonClass: 'telegramOAuthButton', iconClass: 'oauthSvgImg' },
  { id: 'google', label: 'Google', buttonClass: 'googleOAuthButton', iconClass: 'oauthSvgImg' },
  { id: 'github', label: 'GitHub', buttonClass: 'githubOAuthButton', iconClass: 'oauthSvgImg' },
  { id: 'steam', label: 'Steam', buttonClass: 'steamButton', iconClass: 'steamIcon' },
]

const CODE_LENGTH = 6
const ANIM_MS = 200

type SignInDrawerApi = {
  isOpen: boolean
  open: () => void
  close: () => void
}

const SignInDrawerContext = createContext<SignInDrawerApi | null>(null)

export function SignInDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const api = useMemo<SignInDrawerApi>(() => ({ isOpen, open, close }), [isOpen, open, close])

  return (
    <SignInDrawerContext.Provider value={api}>
      {children}
      <SignInDrawer open={isOpen} onClose={close} />
    </SignInDrawerContext.Provider>
  )
}

export function useSignInDrawer(): SignInDrawerApi {
  const ctx = useContext(SignInDrawerContext)
  if (!ctx) throw new Error('useSignInDrawer must be used within a <SignInDrawerProvider>')
  return ctx
}

function useDrawerTransition(open: boolean) {
  const [mounted, setMounted] = useState(open)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      setExiting(false)
      return
    }
    if (!mounted) return
    setExiting(true)
    const t = window.setTimeout(() => {
      setMounted(false)
      setExiting(false)
    }, ANIM_MS)
    return () => window.clearTimeout(t)
  }, [open, mounted])

  return { mounted, exiting }
}

type Step = 'email' | 'code'

export type SignInDrawerProps = {
  open: boolean
  onClose: () => void
  onOAuth?: (provider: OAuthProvider['id']) => void
}

export function SignInDrawer({ open, onClose, onOAuth }: SignInDrawerProps) {
  const [portalReady, setPortalReady] = useState(false)
  const { mounted, exiting } = useDrawerTransition(open)
  const { refresh } = useAuth()
  const tr = useT()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState<string[]>(() => Array(CODE_LENGTH).fill(''))
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [devHint, setDevHint] = useState('')
  const [codeError, setCodeError] = useState(false)

  const emailInputRef = useRef<HTMLInputElement>(null)
  const codeRefs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => setPortalReady(true), [])

  useEffect(() => {
    if (!open) return
    setStep('email')
    setCode(Array(CODE_LENGTH).fill(''))
    setError('')
    setDevHint('')
    setCodeError(false)
    setPending(false)
  }, [open])

  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => {
      if (step === 'email') emailInputRef.current?.focus()
      else codeRefs.current[0]?.focus()
    }, ANIM_MS)
    return () => window.clearTimeout(id)
  }, [open, step])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const siteLanguage = useCallback(() => {
    if (typeof document === 'undefined') return 'ru'
    return document.documentElement.lang || 'ru'
  }, [])

  const sendCode = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      const value = email.trim()
      if (!value || pending) return
      setPending(true)
      setError('')
      setDevHint('')
      try {
        const res = await fetch('/api/auth/send-code', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: value, siteLanguage: siteLanguage() }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok && data?.code !== 'send_code_rate_limit' && res.status !== 429) {
          setError(typeof data?.error === 'string' && data.error ? data.error : tr('Не удалось отправить код. Попробуйте ещё раз.'))
          return
        }
        if (typeof data?.devHint === 'string' && data.devHint) setDevHint(data.devHint)
        setCode(Array(CODE_LENGTH).fill(''))
        setCodeError(false)
        setStep('code')
      } catch {
        setError(tr('Не удалось отправить код. Проверьте соединение.'))
      } finally {
        setPending(false)
      }
    },
    [email, pending, siteLanguage, tr],
  )

  const verifyCode = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      const joined = code.join('')
      if (joined.length < CODE_LENGTH || pending) return
      setPending(true)
      setError('')
      setCodeError(false)
      try {
        const res = await fetch('/api/profile/email/verify-code', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), code: joined.toUpperCase() }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setCodeError(true)
          setCode(Array(CODE_LENGTH).fill(''))
          setError(typeof data?.error === 'string' && data.error ? data.error : tr('Неверный или просроченный код.'))
          codeRefs.current[0]?.focus()
          return
        }
        await refresh()
        onClose()
      } catch {
        setError(tr('Не удалось проверить код. Проверьте соединение.'))
      } finally {
        setPending(false)
      }
    },
    [code, email, pending, onClose, refresh, tr],
  )

  const setDigit = useCallback((index: number, raw: string) => {
    const char = raw.replace(/[^A-Za-z0-9]/g, '').slice(-1).toUpperCase()
    setCodeError(false)
    setCode((prev) => {
      const next = [...prev]
      next[index] = char
      return next
    })
    if (char && index < CODE_LENGTH - 1) codeRefs.current[index + 1]?.focus()
  }, [])

  const onCodeKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !code[index] && index > 0) {
        codeRefs.current[index - 1]?.focus()
      }
    },
    [code],
  )

  const onCodePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const chars = e.clipboardData.getData('text').replace(/[^A-Za-z0-9]/g, '').slice(0, CODE_LENGTH).toUpperCase().split('')
    if (!chars.length) return
    setCodeError(false)
    setCode(() => {
      const next = Array(CODE_LENGTH).fill('')
      chars.forEach((c, i) => (next[i] = c))
      return next
    })
    const focusIndex = Math.min(chars.length, CODE_LENGTH - 1)
    codeRefs.current[focusIndex]?.focus()
  }, [])

  const startOAuth = useCallback(
    async (provider: OAuthProvider['id']) => {
      if (onOAuth) {
        onOAuth(provider)
        return
      }
      try {
        await fetch('/api/auth/dev-login', { method: 'POST', credentials: 'include' })
        await refresh()
      } catch {}
      onClose()
    },
    [onOAuth, refresh, onClose],
  )

  if (!portalReady || !mounted) return null

  const backdropClass = sd('drawerBackdrop', exiting ? 'drawerBackdropExit' : 'drawerBackdropEnter')
  const panelClass = sd('drawerPanel', exiting ? 'drawerPanelExit' : 'drawerPanelEnter')

  const drawer = (
    <>
      <div className={backdropClass} aria-hidden="true" onClick={onClose} />
      <div className={panelClass} role="dialog" aria-modal="true" aria-label={tr('Вход в аккаунт')}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBlock: '1rem' }}>
          <button type="button" className={sd('closeButton')} aria-label={tr('Закрыть')} onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" className={sd('closeIcon')} aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className={sd('drawerBody')}>
          {step === 'email' ? (
            <form className={sf('form')} onSubmit={sendCode}>
              <p className={sf('hintFormLead')}>{tr('Войдите или зарегистрируйтесь по электронной почте — пришлём код для входа.')}</p>

              <div className={sf('formGroup')}>
                <label className={sf('label')} htmlFor="signin-email">
                  {tr('Электронная почта')}
                </label>
                <input
                  id="signin-email"
                  ref={emailInputRef}
                  className={sf('input')}
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  value={email}
                  disabled={pending}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {error ? <div className={sf('error')} role="alert">{error}</div> : null}

              <button type="submit" className={sf('button')} disabled={pending || !email.trim()}>
                {tr('Получить код')}
              </button>

              <div className={sf('divider')}>
                <span className={sf('dividerLine')} aria-hidden="true" />
                <span className={sf('dividerText')}>{tr('или')}</span>
                <span className={sf('dividerLine')} aria-hidden="true" />
              </div>

              {OAUTH_PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={sf(p.buttonClass)}
                  disabled={pending}
                  onClick={() => startOAuth(p.id)}
                >
                  <img className={sf(p.iconClass)} src={`/icons/oauth/${p.id}.svg`} alt="" width={20} height={20} aria-hidden="true" />
                  <span>{tr('Войти через')} {p.label}</span>
                </button>
              ))}
            </form>
          ) : (
            <form className={sf('form')} onSubmit={verifyCode}>
              <p className={sf('hintFormLead')}>
                {tr('Мы отправили код на')} <span className={sf('hintFormLeadEmail')}>{email.trim()}</span>
              </p>

              <div className={`${sf('codeInputs')}${codeError ? ' ' + sf('codeInputsError', 'codeInputsShake') : ''}`}>
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      codeRefs.current[i] = el
                    }}
                    className={sf('codeInput')}
                    type="text"
                    inputMode="text"
                    autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    value={digit}
                    disabled={pending}
                    aria-label={`${tr('Символ')} ${i + 1} ${tr('из')} ${CODE_LENGTH}`}
                    onChange={(e) => setDigit(i, e.target.value)}
                    onKeyDown={(e) => onCodeKeyDown(i, e)}
                    onPaste={onCodePaste}
                  />
                ))}
              </div>

              {error ? <div className={sf('error')} role="alert">{error}</div> : null}

              <div className={sf('codeActionsRow')}>
                <button
                  type="button"
                  className={sf('codeBackButton')}
                  disabled={pending}
                  onClick={() => {
                    setStep('email')
                    setError('')
                    setCodeError(false)
                  }}
                >
                  {tr('Назад')}
                </button>
                <button
                  type="submit"
                  className={sf('codeSubmitButton')}
                  disabled={pending || code.join('').length < CODE_LENGTH}
                >
                  {tr('Войти')}
                </button>
              </div>

              {devHint ? <p className={sf('hint')}>{devHint}</p> : <p className={sf('hint')}>{tr('Не пришёл код? Проверьте папку «Спам».')}</p>}
            </form>
          )}
        </div>
      </div>
    </>
  )

  return createPortal(drawer, document.body)
}

export default SignInDrawer
