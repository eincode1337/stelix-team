'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useT } from '@/i18n/LocaleProvider'

const nb = (...names: string[]) => names.map((n) => `Navbar-module__O8Na-a__${n}`).join(' ')
const pop = (...names: string[]) => names.map((n) => `Popover-module__Nt1uSa__${n}`).join(' ')

type LocaleOption = {
  code: 'ru' | 'uk' | 'en'
  label: string
  flag: 'ru' | 'ua' | 'en'
}

const LOCALES: LocaleOption[] = [
  { code: 'ru', label: 'Русский', flag: 'ru' },
  { code: 'uk', label: 'Українська', flag: 'ua' },
  { code: 'en', label: 'English', flag: 'en' },
]

const LOCALE_CODES = LOCALES.map((l) => l.code) as string[]

function detectLocale(pathname: string | null): LocaleOption['code'] {
  const seg = (pathname ?? '/').split('/').filter(Boolean)[0]
  return (LOCALE_CODES.includes(seg) ? seg : 'ru') as LocaleOption['code']
}

function withLocale(pathname: string | null, code: string): string {
  const segments = (pathname ?? '/').split('/').filter(Boolean)
  if (segments.length && LOCALE_CODES.includes(segments[0])) {
    segments[0] = code
  } else {
    segments.unshift(code)
  }
  return '/' + segments.join('/')
}

type LanguagePopoverProps = {
  currentLocale?: LocaleOption['code']
}

export function LanguagePopover({ currentLocale }: LanguagePopoverProps) {
  const router = useRouter()
  const pathname = usePathname()
  const active = currentLocale ?? detectLocale(pathname)
  const tr = useT()

  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const selectLocale = useCallback(
    (code: string) => {
      try {
        document.cookie = `NEXT_LOCALE=${code};path=/;max-age=31536000;SameSite=Lax`
      } catch {}
      setOpen(false)
      const next = withLocale(pathname, code)
      router.push(next)
      router.refresh()
    },
    [pathname, router],
  )

  return (
    <span
      ref={wrapRef}
      className={nb('languageButtonTooltipWrap')}
      data-tooltip-trigger=""
      style={{ position: 'relative' }}
    >
      <button
        type="button"
        className={`${nb('adminNavLink', 'adminNavLinkInCenter')} ${pop('popoverTrigger')}`}
        aria-label={tr('Язык')}
        aria-haspopup="listbox"
        data-onboarding="language"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 576 512"
          fill="currentColor"
          className={nb('adminNavIcon')}
          aria-hidden="true"
        >
          <path d="M168 0c13.3 0 24 10.7 24 24l0 56 136 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-16.2 0-16.5 38.4c-18.6 43.5-45.2 82.8-77.9 116 13.9 9.2 28.6 17.4 44 24.4l60.9 27.9 71.8-160.5C398 165.6 406.5 160 416 160s18 5.6 21.9 14.2l136 304c5.4 12.1 0 26.3-12.1 31.7s-26.3 0-31.7-12.1l-29.4-65.8-169.3 0-29.4 65.8c-5.4 12.1-19.6 17.5-31.7 12.1s-17.5-19.6-12.1-31.7l44.6-99.7-61.3-28.1c-21.5-9.9-41.9-21.7-60.9-35.2-17.5 13.6-36.3 25.7-56.2 36.1L67.1 381.3c-11.7 6.2-26.2 1.6-32.4-10.1s-1.6-26.2 10.1-32.4L102 308.8c14-7.3 27.4-15.7 40.1-24.8-27.5-25.6-51.1-55.2-70-88-6.6-11.5-2.7-26.2 8.8-32.8s26.2-2.7 32.8 8.8c17.4 30.3 39.5 57.5 65.4 80.7 30.5-29.8 55.1-65.5 72.2-105.3L259.6 128 24 128c-13.3 0-24-10.7-24-24S10.8 80 24 80l120 0 0-56c0-13.3 10.7-24 24-24zM479.2 384L416 242.8 352.8 384 479.2 384z" />
        </svg>
      </button>

      {open && (
        <div
          className={pop('popoverTippyChrome')}
          style={{ position: 'absolute', top: '100%', insetInlineEnd: 0, zIndex: 1000 }}
        >
          <div className={pop('popoverContentRoot')} role="listbox" aria-label={tr('Язык')}>
            {LOCALES.map((locale) => (
              <button
                key={locale.code}
                type="button"
                role="option"
                aria-selected={locale.code === active}
                className={pop('popoverPanelButton')}
                onClick={() => selectLocale(locale.code)}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <img
                    alt=""
                    width={20}
                    height={20}
                    decoding="async"
                    style={{ color: 'transparent' }}
                    src={`/icons/flags/${locale.flag}.svg`}
                  />
                  <span>{locale.label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </span>
  )
}
